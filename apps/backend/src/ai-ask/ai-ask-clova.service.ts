import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Quiz } from '../roadmap/entities/quiz.entity';

import { AiAskPromptService } from './ai-ask-prompt.service';
import { DEFAULT_AI_PARAMS, DEFAULT_CLOVA_STUDIO_URL } from './clova.constants';

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

  constructor(
    private readonly configService: ConfigService,
    private readonly promptService: AiAskPromptService,
  ) {
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

    const prompt = this.promptService.buildPrompt(quiz, userQuestion);
    const apiRequest = this.buildApiRequest(prompt.system, prompt.user);
    const { controller, timeoutId } = this.createTimeoutController(20000);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(apiRequest),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
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

    const prompt = this.promptService.buildPrompt(quiz, userQuestion);
    const apiRequest = this.buildApiRequest(prompt.system, prompt.user);
    const { controller, timeoutId } = this.createTimeoutController(20000);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(apiRequest),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
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

    const remaining = buffer + decoder.decode();
    if (remaining.length > 0) {
      const lines = remaining.split('\n');
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
   * 외부 API 요청이 오래 걸릴 때를 대비해 타임아웃 컨트롤러를 만든다.
   *
   * @param ms 타임아웃 밀리초
   * @returns abort controller와 타이머 ID
   */
  private createTimeoutController(ms: number): {
    controller: AbortController;
    timeoutId: NodeJS.Timeout;
  } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    return { controller, timeoutId };
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
  private buildApiRequest(systemPrompt: string, userPrompt: string): ClovaChatRequest {
    const messages: ClovaMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return {
      messages,
      ...DEFAULT_AI_PARAMS,
    };
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
