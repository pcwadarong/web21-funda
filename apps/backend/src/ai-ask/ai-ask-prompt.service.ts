import { Injectable } from '@nestjs/common';

import { Quiz } from '../roadmap/entities/quiz.entity';

import { CLOVA_SYSTEM_PROMPT } from './clova.constants';

/**
 * AI 요청에 들어갈 프롬프트를 구성한다.
 */
@Injectable()
export class AiAskPromptService {
  /**
   * 퀴즈와 사용자 질문을 묶어 최종 프롬프트를 만든다.
   *
   * @param quiz 퀴즈 엔티티
   * @param userQuestion 사용자 질문
   * @returns 시스템 프롬프트와 사용자 프롬프트
   */
  buildPrompt(quiz: Quiz, userQuestion: string): { system: string; user: string } {
    const context = this.buildPromptContext(quiz);
    const contextJson = JSON.stringify(context, null, 2);

    const userPrompt = `다음 퀴즈 정보를 참고해서 질문에 답변해줘.

[퀴즈 정보]
${contextJson}

[사용자 질문]
${userQuestion}
`;

    return {
      system: CLOVA_SYSTEM_PROMPT,
      user: userPrompt,
    };
  }

  /**
   * 퀴즈 정보를 프롬프트에 포함하기 위해 텍스트 중심으로 정리한다.
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
}
