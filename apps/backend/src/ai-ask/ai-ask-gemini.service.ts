import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Quiz } from '../roadmap/entities/quiz.entity';

import { AiAskPromptService } from './ai-ask-prompt.service';
import { DEFAULT_AI_PARAMS } from './clova.constants';

@Injectable()
export class AiAskGeminiService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptService: AiAskPromptService,
  ) {
    const key = this.configService.get<string>('GEMINI_API_KEY');
    const url = this.configService.get<string>('GEMINI_API_URL');

    this.apiKey = key ?? '';
    this.apiUrl = url ?? 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash';
  }

  /**
   * Gemini에 단일 응답을 요청한다.
   *
   * @param quiz 퀴즈 엔티티
   * @param userQuestion 사용자 질문
   * @returns AI 답변 텍스트
   */
  async requestAnswer(quiz: Quiz, userQuestion: string): Promise<string> {
    this.validateApiKey();

    const prompt = this.promptService.buildPrompt(quiz, userQuestion);
    const body = this.buildRequestBody(prompt.system, prompt.user);

    const response = await fetch(`${this.apiUrl}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(`Gemini 호출 실패: ${response.status} ${errorText}`);
    }

    const json = await response.json();
    return this.extractContent(json);
  }

  /**
   * Gemini 스트리밍 응답을 요청한다.
   *
   * @param quiz 퀴즈 엔티티
   * @param userQuestion 사용자 질문
   * @param onChunk 스트리밍 조각 콜백
   * @returns 최종 AI 답변 텍스트
   */
  async requestAnswerStream(
    quiz: Quiz,
    userQuestion: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    this.validateApiKey();

    const prompt = this.promptService.buildPrompt(quiz, userQuestion);
    const body = this.buildRequestBody(prompt.system, prompt.user);

    const response = await fetch(`${this.apiUrl}:streamGenerateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(`Gemini 스트리밍 호출 실패: ${response.status} ${errorText}`);
    }

    const fullContent = await this.parseSseStream(response, onChunk);
    return fullContent;
  }

  private buildRequestBody(systemPrompt: string, userPrompt: string) {
    return {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: DEFAULT_AI_PARAMS.temperature,
        topP: DEFAULT_AI_PARAMS.topP,
        topK: DEFAULT_AI_PARAMS.topK,
        maxOutputTokens: DEFAULT_AI_PARAMS.maxTokens,
        stopSequences: DEFAULT_AI_PARAMS.stopBefore,
      },
    };
  }

  private extractContent(raw: unknown): string {
    const object = raw as Record<string, unknown>;
    const candidates = object?.candidates as Array<Record<string, unknown>> | undefined;
    const parts = candidates?.[0]?.content as Record<string, unknown> | undefined;
    const contentParts = parts?.parts as Array<Record<string, unknown>> | undefined;
    const text = contentParts
      ?.map(part => part.text)
      .filter(Boolean)
      .join('');

    return typeof text === 'string' ? text : '';
  }

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
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) {
          continue;
        }

        const data = trimmed.substring(5).trim();
        if (!data || data === '[DONE]') {
          continue;
        }

        const chunk = this.extractStreamChunk(data);
        if (!chunk) {
          continue;
        }

        fullContent += chunk;
        onChunk(chunk);
      }
    }

    return fullContent;
  }

  private extractStreamChunk(jsonData: string): string {
    try {
      const parsed = JSON.parse(jsonData) as Record<string, unknown>;
      return this.extractContent(parsed);
    } catch {
      return '';
    }
  }

  private validateApiKey(): void {
    if (this.apiKey.length === 0) {
      throw new BadRequestException('GEMINI_API_KEY가 설정되지 않았습니다.');
    }
  }
}
