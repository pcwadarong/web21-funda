import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Quiz } from '../roadmap/entities/quiz.entity';

import {
  CLOVA_SYSTEM_PROMPT,
  DEFAULT_CLOVA_PARAMS,
  DEFAULT_CLOVA_STUDIO_URL,
} from './clova.constants';

type ClovaMessageRole = 'system' | 'user' | 'assistant';

interface ClovaMessage {
  role: ClovaMessageRole;
  content: string;
}

interface ClovaChatRequest {
  messages: ClovaMessage[];
  topP: number;
  topK: number;
  maxTokens: number;
  temperature: number;
  repeatPenalty: number;
  stopBefore: string[];
  seed: number;
  includeAiFilters: boolean;
}

@Injectable()
export class AiAskClovaService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('CLOVA_STUDIO_API_KEY');
    const url = this.configService.get<string>('CLOVA_STUDIO_URL');

    this.apiKey = key ?? '';
    this.apiUrl = url ?? DEFAULT_CLOVA_STUDIO_URL;
  }

  /**
   * 퀴즈와 사용자 질문을 바탕으로 CLOVA Studio에 단일 응답을 요청한다.
   *
   * @param quiz 퀴즈 엔티티
   * @param userQuestion 사용자 질문
   * @returns AI 답변 텍스트
   */
  async requestAnswer(quiz: Quiz, userQuestion: string): Promise<string> {
    this.validateApiKey();

    const promptContext = this.buildPromptContext(quiz);
    const userPrompt = this.buildUserPrompt(promptContext, userQuestion);
    const apiRequest = this.buildApiRequest(userPrompt);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(`CLOVA Studio 호출 실패: ${response.status} ${errorText}`);
    }

    const json = await response.json();
    const content = this.extractContent(json);

    return content;
  }

  /**
   * 퀴즈와 사용자 질문을 바탕으로 CLOVA Studio 스트리밍 응답을 받는다.
   *
   * @param quiz 퀴즈 엔티티
   * @param userQuestion 사용자 질문
   * @param onChunk 스트리밍 조각을 받을 콜백
   * @returns 최종 AI 답변 텍스트
   */
  async requestAnswerStream(
    quiz: Quiz,
    userQuestion: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    this.validateApiKey();

    const promptContext = this.buildPromptContext(quiz);
    const userPrompt = this.buildUserPrompt(promptContext, userQuestion);
    const apiRequest = this.buildApiRequest(userPrompt);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(
        `CLOVA Studio 스트리밍 호출 실패: ${response.status} ${errorText}`,
      );
    }

    const fullContent = await this.parseSseStream(response, onChunk);
    return fullContent;
  }

  /**
   * CLOVA Studio 응답에서 실제 텍스트를 추출한다.
   *
   * @param raw 응답 JSON
   * @returns 추출된 텍스트
   */
  private extractContent(raw: unknown): string {
    const object = raw as Record<string, unknown>;
    const result = object?.result as Record<string, unknown> | undefined;
    const choices = object?.choices as Array<Record<string, unknown>> | undefined;

    const directMessage = object?.message as Record<string, unknown> | undefined;
    const resultMessage = result?.message as Record<string, unknown> | undefined;
    const choiceMessage = choices?.[0]?.message as Record<string, unknown> | undefined;
    const choiceDelta = choices?.[0]?.delta as Record<string, unknown> | undefined;

    const fromResult = resultMessage?.content;
    if (typeof fromResult === 'string' && fromResult.length > 0) {
      return fromResult;
    }

    const fromChoiceMessage = choiceMessage?.content;
    if (typeof fromChoiceMessage === 'string' && fromChoiceMessage.length > 0) {
      return fromChoiceMessage;
    }

    const fromDirectMessage = directMessage?.content;
    if (typeof fromDirectMessage === 'string' && fromDirectMessage.length > 0) {
      return fromDirectMessage;
    }

    const fromDelta = choiceDelta?.content;
    if (typeof fromDelta === 'string' && fromDelta.length > 0) {
      return fromDelta;
    }

    return '';
  }

  /**
   * CLOVA Studio SSE 스트림을 읽어 조각을 누적하고 콜백으로 전달한다.
   *
   * @param response 스트리밍 응답
   * @param onChunk 조각 수신 콜백
   * @returns 전체 합산 텍스트
   */
  private async parseSseStream(
    response: Response,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    if (!response.body) {
      throw new BadRequestException('스트리밍 응답을 읽을 수 없습니다.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // 네트워크 청크를 합쳐 줄 단위로 안전하게 분리하기 위해 버퍼를 사용한다.
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('data:')) {
          continue;
        }

        const data = trimmedLine.substring(5).trim();
        if (data === '[DONE]' || data.includes('[DONE]')) {
          continue;
        }

        const chunk = this.extractStreamChunk(data);
        if (chunk.length === 0) {
          continue;
        }

        fullContent += chunk;
        onChunk(chunk);
      }
    }

    return fullContent;
  }

  /**
   * 스트리밍 응답 JSON에서 실제 텍스트 조각을 추출한다.
   *
   * @param jsonData data: 이후의 JSON 문자열
   * @returns 추출된 텍스트 조각
   */
  private extractStreamChunk(jsonData: string): string {
    try {
      const parsed = JSON.parse(jsonData) as Record<string, unknown>;
      const stopReason = parsed?.stopReason;
      const hasStopReason = stopReason !== null && stopReason !== undefined;

      const choices = parsed?.choices as Array<Record<string, unknown>> | undefined;
      const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
      const message = choices?.[0]?.message as Record<string, unknown> | undefined;
      const directMessage = parsed?.message as Record<string, unknown> | undefined;

      const deltaContent = delta?.content;
      if (typeof deltaContent === 'string' && deltaContent.length > 0) {
        return deltaContent;
      }

      const messageContent = message?.content;
      if (typeof messageContent === 'string' && messageContent.length > 0 && !hasStopReason) {
        return messageContent;
      }

      const directContent = directMessage?.content;
      if (typeof directContent === 'string' && directContent.length > 0 && !hasStopReason) {
        return directContent;
      }

      return '';
    } catch {
      return '';
    }
  }

  /**
   * CLOVA Studio API 요청 바디를 구성한다.
   *
   * @param userPrompt 사용자 질문 프롬프트
   * @returns 요청 바디
   */
  private buildApiRequest(userPrompt: string): ClovaChatRequest {
    const messages: ClovaMessage[] = [
      { role: 'system', content: CLOVA_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ];

    return {
      messages,
      ...DEFAULT_CLOVA_PARAMS,
    };
  }

  /**
   * 퀴즈 정보를 프롬프트에 포함하기 위해 정리한다.
   *
   * @param quiz 퀴즈 엔티티
   * @returns 프롬프트 컨텍스트
   */
  private buildPromptContext(quiz: Quiz): Record<string, unknown> {
    const rawContent = this.toPlainObject(quiz.content);
    const rawAnswer = this.toPlainObject(quiz.answer);

    const question = this.getQuestionText(quiz.question, rawContent);
    const options = this.getOptionTexts(rawContent);
    const matching = this.getMatchingTexts(rawContent);
    const code = this.getCodeSnippet(rawContent);

    const answerText = this.getAnswerText(rawAnswer, rawContent);
    const matchingAnswer = this.getMatchingAnswerText(rawAnswer, rawContent);

    return {
      quizId: quiz.id,
      type: quiz.type,
      question,
      options,
      matching,
      code,
      answer: answerText,
      matching_answer: matchingAnswer,
      explanation: quiz.explanation ?? null,
    };
  }

  /**
   * 사용자 질문과 퀴즈 정보를 묶어 CLOVA 입력 프롬프트를 만든다.
   *
   * @param context 퀴즈 컨텍스트
   * @param userQuestion 사용자 질문
   * @returns 최종 프롬프트 문자열
   */
  private buildUserPrompt(context: Record<string, unknown>, userQuestion: string): string {
    const contextJson = JSON.stringify(context, null, 2);

    return `다음 퀴즈 정보를 참고해서 질문에 답변해줘.

      [퀴즈 정보]
      ${contextJson}

      [사용자 질문]
${userQuestion}
`;
  }

  /**
   * 문자열 JSON도 처리할 수 있도록 plain object를 추출한다.
   *
   * @param raw 원본 값
   * @returns 객체 또는 null
   */
  private toPlainObject(raw: unknown): Record<string, unknown> | null {
    if (this.isPlainObject(raw)) {
      return raw;
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (this.isPlainObject(parsed)) {
          return parsed;
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * 질문 텍스트를 안전하게 추출한다.
   *
   * @param fallback 기본 질문
   * @param content content 객체
   * @returns 질문 문자열
   */
  private getQuestionText(fallback: string, content: Record<string, unknown> | null): string {
    if (content && typeof content.question === 'string' && content.question.trim().length > 0) {
      return content.question.trim();
    }

    return fallback;
  }

  /**
   * 보기 텍스트 목록을 추출한다. id는 제거하고 text만 사용한다.
   *
   * @param content content 객체
   * @returns 보기 텍스트 리스트
   */
  private getOptionTexts(content: Record<string, unknown> | null): string[] {
    if (!content || !Array.isArray(content.options)) {
      return [];
    }

    const results: string[] = [];

    for (const option of content.options) {
      if (!this.isPlainObject(option)) {
        continue;
      }

      const record = option as Record<string, unknown>;
      const text = this.toCleanString(record.text);
      if (text) {
        results.push(text);
      }
    }

    return results;
  }

  /**
   * 매칭 좌/우 텍스트 목록을 추출한다.
   *
   * @param content content 객체
   * @returns 매칭 데이터
   */
  private getMatchingTexts(
    content: Record<string, unknown> | null,
  ): { left: string[]; right: string[] } | null {
    if (!content || !this.isPlainObject(content.matching_metadata)) {
      return null;
    }

    const metadata = content.matching_metadata as Record<string, unknown>;
    const left = this.getMatchingSideTexts(metadata.left);
    const right = this.getMatchingSideTexts(metadata.right);

    if (left.length === 0 || right.length === 0) {
      return null;
    }

    return { left, right };
  }

  /**
   * 매칭 한쪽 리스트에서 텍스트를 추출한다.
   *
   * @param value 매칭 항목
   * @returns 텍스트 리스트
   */
  private getMatchingSideTexts(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const results: string[] = [];

    for (const item of value) {
      if (typeof item === 'string' || typeof item === 'number') {
        const text = String(item).trim();
        if (text.length > 0) {
          results.push(text);
        }
        continue;
      }

      if (!this.isPlainObject(item)) {
        continue;
      }

      const record = item as Record<string, unknown>;
      const text = this.toCleanString(record.text);
      if (text) {
        results.push(text);
      }
    }

    return results;
  }

  /**
   * 코드 스니펫 정보를 추출한다.
   *
   * @param content content 객체
   * @returns 코드 정보 또는 null
   */
  private getCodeSnippet(
    content: Record<string, unknown> | null,
  ): { language?: string; snippet: string } | null {
    if (!content) {
      return null;
    }

    const code = content.code;
    if (typeof code !== 'string' || code.trim().length === 0) {
      return null;
    }

    const language =
      typeof content.language === 'string' && content.language.trim().length > 0
        ? content.language
        : undefined;

    if (language) {
      return { language, snippet: code };
    }

    return { snippet: code };
  }

  /**
   * 객관식/참거짓 정답을 텍스트로 변환한다.
   *
   * @param answer answer 객체
   * @param content content 객체
   * @returns 정답 텍스트 또는 null
   */
  private getAnswerText(
    answer: Record<string, unknown> | null,
    content: Record<string, unknown> | null,
  ): string | null {
    const answerId = this.toCleanString(
      answer?.value ?? answer?.correct_option_id ?? answer?.option_id,
    );

    if (!answerId) {
      return null;
    }

    if (!content || !Array.isArray(content.options)) {
      return answerId;
    }

    for (const option of content.options) {
      if (!this.isPlainObject(option)) {
        continue;
      }

      const record = option as Record<string, unknown>;
      const id = this.toCleanString(record.id);
      const text = this.toCleanString(record.text);

      if (id === answerId && text) {
        return text;
      }
    }

    return answerId;
  }

  /**
   * 매칭 정답을 텍스트 쌍으로 변환한다.
   *
   * @param answer answer 객체
   * @param content content 객체
   * @returns 매칭 정답 텍스트 쌍 목록
   */
  private getMatchingAnswerText(
    answer: Record<string, unknown> | null,
    content: Record<string, unknown> | null,
  ): Array<{ left: string; right: string }> | null {
    const pairs = answer?.pairs ?? answer?.correct_pairs ?? answer?.matching ?? answer?.value;
    if (!Array.isArray(pairs)) {
      return null;
    }

    const leftMap = this.getMatchingIdMap(content, 'left');
    const rightMap = this.getMatchingIdMap(content, 'right');

    const results: Array<{ left: string; right: string }> = [];

    for (const pair of pairs) {
      if (!this.isPlainObject(pair)) {
        continue;
      }

      const record = pair as Record<string, unknown>;
      const rawLeft = this.toCleanString(record.left);
      const rawRight = this.toCleanString(record.right);

      if (!rawLeft || !rawRight) {
        continue;
      }

      const leftText = leftMap.get(rawLeft) ?? rawLeft;
      const rightText = rightMap.get(rawRight) ?? rawRight;
      results.push({ left: leftText, right: rightText });
    }

    if (results.length === 0) {
      return null;
    }

    return results;
  }

  /**
   * 매칭 항목 id -> text 맵을 구성한다.
   *
   * @param content content 객체
   * @param side left 또는 right
   * @returns id 매핑 맵
   */
  private getMatchingIdMap(
    content: Record<string, unknown> | null,
    side: 'left' | 'right',
  ): Map<string, string> {
    const map = new Map<string, string>();
    if (!content || !this.isPlainObject(content.matching_metadata)) {
      return map;
    }

    const metadata = content.matching_metadata as Record<string, unknown>;
    const items = metadata[side];
    if (!Array.isArray(items)) {
      return map;
    }

    for (const item of items) {
      if (!this.isPlainObject(item)) {
        continue;
      }

      const record = item as Record<string, unknown>;
      const id = this.toCleanString(record.id);
      const text = this.toCleanString(record.text);
      if (id && text) {
        map.set(id, text);
      }
    }

    return map;
  }

  /**
   * 객체 여부를 확인한다.
   *
   * @param value 검사할 값
   * @returns plain object 여부
   */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * 문자열을 안전하게 정리한다.
   *
   * @param value 검사할 값
   * @returns 문자열 또는 null
   */
  private toCleanString(value: unknown): string | null {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value).trim();
    }
    return null;
  }

  /**
   * API 키 누락을 조기에 확인하기 위한 가드.
   */
  private validateApiKey(): void {
    if (this.apiKey.length === 0) {
      throw new BadRequestException('CLOVA_STUDIO_API_KEY가 설정되지 않았습니다.');
    }
  }
}
