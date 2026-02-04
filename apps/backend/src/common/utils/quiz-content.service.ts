import { Injectable } from '@nestjs/common';

import type { QuizContent, QuizResponse } from '../../roadmap/dto/quiz-list.dto';
import { Quiz } from '../../roadmap/entities';
import { RedisService } from '../redis/redis.service';

import { CodeFormatter } from './code-formatter';

const QUIZ_CONTENT_CACHE_TTL_SECONDS = 24 * 60 * 60;
const QUIZ_CONTENT_CACHE_KEY_PREFIX = 'quiz_content';

@Injectable()
export class QuizContentService {
  constructor(
    private readonly codeFormatter: CodeFormatter,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 퀴즈 조회 응답과 동일한 구조를 유지하기 위해 퀴즈 엔티티를 변환한다.
   *
   * @param quiz 퀴즈 엔티티
   * @returns 응답용 퀴즈 객체
   */
  async toQuizResponse(quiz: Quiz): Promise<QuizResponse> {
    const cachedContent = await this.getCachedQuizContent(quiz.id);
    let baseContent: QuizContent;

    if (cachedContent) {
      baseContent = cachedContent;
    } else {
      baseContent = await this.buildQuizContentBase(quiz);
      await this.setCachedQuizContent(quiz.id, baseContent);
    }

    const content = this.buildShuffledContent(baseContent);

    return {
      id: quiz.id,
      type: quiz.type,
      content,
    };
  }

  /**
   * 복습 화면에서도 기존 퀴즈 렌더러를 그대로 쓰기 위해 content 구조를 맞춘다.
   *
   * @param quiz 퀴즈 엔티티
   * @returns 정규화된 content
   */
  private async buildQuizContentBase(quiz: Quiz): Promise<QuizContent> {
    const rawObject = this.toContentObject(quiz.content);
    if (!rawObject) {
      return { question: quiz.question };
    }

    let question = quiz.question;
    if (typeof rawObject.question === 'string' && rawObject.question.trim().length > 0) {
      question = rawObject.question;
    }

    const options = this.normalizeOptions(rawObject.options, false);
    const codeMetadata = await this.normalizeCodeMetadata(rawObject);
    const matchingMetadata = this.normalizeMatchingMetadata(rawObject, false);

    const content: QuizContent = { question };

    if (options) {
      content.options = options;
    }
    if (codeMetadata) {
      content.code_metadata = codeMetadata;
    }
    if (matchingMetadata) {
      content.matching_metadata = matchingMetadata;
    }

    return content;
  }

  /**
   * 캐시된 기본 콘텐츠를 기반으로 보기 순서를 매 요청마다 섞어 반환한다.
   */
  private buildShuffledContent(baseContent: QuizContent): QuizContent {
    const content: QuizContent = {
      question: baseContent.question,
    };

    if (baseContent.options) {
      content.options = this.shuffleArray(baseContent.options);
    }

    if (baseContent.code_metadata) {
      content.code_metadata = {
        ...baseContent.code_metadata,
      };
    }

    if (baseContent.matching_metadata) {
      content.matching_metadata = {
        left: this.shuffleArray(baseContent.matching_metadata.left),
        right: this.shuffleArray(baseContent.matching_metadata.right),
      };
    }

    return content;
  }

  /**
   * 프론트 렌더러가 기대하는 id/text 구조로 통일하기 위해 정규화한다.
   *
   * @param value options 원본 값
   * @returns 정규화된 options (없으면 undefined)
   */
  private normalizeOptions(
    value: unknown,
    shouldShuffle: boolean,
  ): Array<{ id: string; text: string }> | undefined {
    if (!Array.isArray(value)) {
      return undefined;
    }

    const options: Array<{ id: string; text: string }> = [];

    for (const option of value) {
      if (!this.isPlainObject(option)) {
        continue;
      }

      const record = option as Record<string, unknown>;
      const id = record.id;
      const text = record.text;

      if (
        (typeof id === 'string' || typeof id === 'number') &&
        typeof text === 'string' &&
        text.trim().length > 0
      ) {
        options.push({ id: String(id), text });
      }
    }

    if (options.length === 0) {
      return undefined;
    }

    if (shouldShuffle) {
      return this.shuffleArray(options);
    }

    return options;
  }

  /**
   * 코드 문제를 동일한 UI로 보여주기 위해 code/language를 스니펫 형태로 정리한다.
   *
   * @param value content 객체
   * @returns 정규화된 code_metadata (없으면 undefined)
   */
  private async normalizeCodeMetadata(
    value: Record<string, unknown>,
  ): Promise<{ language?: string; snippet: string } | undefined> {
    const code = value.code;
    const language = value.language;

    if (typeof code !== 'string') {
      return undefined;
    }

    const resolvedLanguage = typeof language === 'string' ? language : 'javascript';
    const formattedCode = await this.codeFormatter.format(code, resolvedLanguage);

    if (typeof language === 'string') {
      return { language, snippet: formattedCode };
    }
    return { snippet: formattedCode };
  }

  /**
   * 매칭 문제의 좌/우 항목을 동일한 구조로 맞춰 라인 렌더링을 안정화한다.
   *
   * @param value matching_metadata 원본 값
   * @returns 정규화된 matching_metadata (없으면 undefined)
   */
  private normalizeMatchingMetadata(
    value: unknown,
    shouldShuffle: boolean,
  ):
    | { left: Array<{ id: string; text: string }>; right: Array<{ id: string; text: string }> }
    | undefined {
    if (!this.isPlainObject(value)) {
      return undefined;
    }

    const record = value as Record<string, unknown>;
    const leftItems = this.normalizeMatchingItems(record.left);
    const rightItems = this.normalizeMatchingItems(record.right);

    if (leftItems.length === 0 || rightItems.length === 0) {
      return undefined;
    }

    if (shouldShuffle) {
      return {
        left: this.shuffleArray(leftItems),
        right: this.shuffleArray(rightItems),
      };
    }

    return { left: leftItems, right: rightItems };
  }

  /**
   * 문자열/객체 혼재 데이터를 동일한 포맷으로 통일하기 위해 정규화한다.
   *
   * @param value 매칭 항목 원본 값
   * @returns 정규화된 매칭 항목 리스트
   */
  private normalizeMatchingItems(value: unknown): Array<{ id: string; text: string }> {
    if (!Array.isArray(value)) {
      return [];
    }

    const items: Array<{ id: string; text: string }> = [];

    for (const item of value) {
      if (typeof item === 'string' || typeof item === 'number') {
        const text = String(item).trim();
        if (text.length > 0) {
          items.push({ id: text, text });
        }
        continue;
      }

      if (!this.isPlainObject(item)) {
        continue;
      }

      const record = item as Record<string, unknown>;
      const text = this.toCleanString(record.text);

      let rawId = this.toCleanString(record.id);
      if (!rawId) {
        rawId = this.toCleanString(record.value);
      }
      if (!rawId) {
        rawId = this.toCleanString(record.key);
      }

      const id = rawId ? rawId : text;
      if (id && text) {
        items.push({ id, text });
      }
    }

    return items;
  }

  /**
   * 문자열 JSON으로 들어오는 데이터도 처리하기 위해 객체로 변환한다.
   *
   * @param raw content 원본 값
   * @returns content 객체 (없으면 null)
   */
  private toContentObject(raw: unknown): Record<string, unknown> | null {
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
   * 배열/원시값과 구분해 안전하게 파싱하기 위해 plain object 여부를 확인한다.
   *
   * @param value 검사할 값
   * @returns plain object 여부
   */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * 비교/렌더링 시 공백 이슈를 줄이기 위해 문자열을 정리한다.
   *
   * @param value 변환할 값
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
   * 노출 순서가 정답 단서로 활용되지 않도록 보기 순서를 섞어준다.
   *
   * @param array 섞을 배열
   * @returns 섞인 배열 (원본 보존)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled: T[] = [...array];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }

    return shuffled;
  }

  private async getCachedQuizContent(quizId: number): Promise<QuizContent | null> {
    const cacheKey = this.buildQuizContentCacheKey(quizId);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (!this.isQuizContent(cached)) {
        return null;
      }

      return cached;
    } catch {
      return null;
    }
  }

  private async setCachedQuizContent(quizId: number, content: QuizContent): Promise<void> {
    const cacheKey = this.buildQuizContentCacheKey(quizId);

    try {
      await this.redisService.set(cacheKey, content, QUIZ_CONTENT_CACHE_TTL_SECONDS);
    } catch {
      // 캐시 저장 실패는 응답을 막지 않도록 무시한다.
    }
  }

  private buildQuizContentCacheKey(quizId: number): string {
    return `${QUIZ_CONTENT_CACHE_KEY_PREFIX}:${quizId}`;
  }

  private isQuizContent(value: unknown): value is QuizContent {
    return typeof value === 'object' && value !== null && 'question' in value;
  }
}
