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
    return {
      quizId: quiz.id,
      type: quiz.type,
      question: quiz.question,
      content: quiz.content,
      answer: quiz.answer,
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
   * API 키 누락을 조기에 확인하기 위한 가드.
   */
  private validateApiKey(): void {
    if (this.apiKey.length === 0) {
      throw new BadRequestException('CLOVA_STUDIO_API_KEY가 설정되지 않았습니다.');
    }
  }
}
