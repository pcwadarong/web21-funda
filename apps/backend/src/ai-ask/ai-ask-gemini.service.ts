import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Quiz } from '../roadmap/entities/quiz.entity';

import { AiAskPromptService } from './ai-ask-prompt.service';
import { DEFAULT_GEMINI_PARAMS } from './clova.constants';

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
        temperature: DEFAULT_GEMINI_PARAMS.temperature,
        topP: DEFAULT_GEMINI_PARAMS.topP,
        topK: DEFAULT_GEMINI_PARAMS.topK,
        maxOutputTokens: DEFAULT_GEMINI_PARAMS.maxTokens,
        stopSequences: DEFAULT_GEMINI_PARAMS.stopBefore,
      },
    };
  }

  private extractContent(raw: unknown): string {
    // raw가 배열/객체 형태 모두 올 수 있으므로 후보 객체만 안전하게 추출한다.
    const data = raw as Record<string, unknown>;
    const candidates = data?.candidates as Array<Record<string, unknown>> | undefined;
    const candidate = candidates?.[0] as Record<string, unknown> | undefined;
    const content = candidate?.content as Record<string, unknown> | undefined;
    const parts = content?.parts as Array<Record<string, unknown>> | undefined;

    // Gemini 2.x에서 thought 등 다른 필드가 섞일 수 있어 text만 추출한다.
    if (!Array.isArray(parts)) {
      return '';
    }

    return parts
      .map(part => part.text)
      .filter((text): text is string => typeof text === 'string')
      .join('');
  }

  private async parseSseStream(
    response: Response,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new BadRequestException('스트리밍 응답을 읽을 수 없습니다.');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Gemini 스트림은 JSON 객체들이 배열/줄바꿈으로 이어져 오므로
      // 완전한 JSON 객체 단위로 잘라 파싱한다.
      let startIndex: number | null = null;
      let braceCount = 0;

      for (let i = 0; i < buffer.length; i += 1) {
        const char = buffer[i];
        if (char === '{') {
          if (braceCount === 0) {
            startIndex = i;
          }
          braceCount += 1;
        } else if (char === '}') {
          braceCount -= 1;
          if (braceCount === 0 && startIndex !== null) {
            const jsonStr = buffer.substring(startIndex, i + 1);
            buffer = buffer.substring(i + 1);
            i = -1;
            startIndex = null;

            try {
              const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
              const chunk = this.extractContent(parsed);
              if (chunk) {
                fullContent += chunk;
                onChunk(chunk);
              }
            } catch {
              // 파싱 실패는 다음 청크에서 복구될 수 있으므로 무시한다.
            }
          }
        }
      }
    }

    return fullContent;
  }

  private validateApiKey(): void {
    if (this.apiKey.length === 0) {
      throw new BadRequestException('GEMINI_API_KEY가 설정되지 않았습니다.');
    }
  }
}
