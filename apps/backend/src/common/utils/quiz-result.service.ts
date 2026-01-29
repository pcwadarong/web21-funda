import { Injectable } from '@nestjs/common';

import { MatchingPair } from '../../roadmap/dto/quiz-submission.dto';

@Injectable()
export class QuizResultService {
  constructor() {}

  /**
   * 객관식 정답을 추출한다.
   * @param answer 정답 원본 값
   * @returns 정답 옵션 ID 또는 null
   */
  getOptionAnswer(answer: unknown): string | null {
    const answerObject = this.toAnswerObject(answer);
    if (!answerObject) return null;
    return this.toCleanString(
      answerObject.value ?? answerObject.correct_option_id ?? answerObject.option_id,
    );
  }

  /**
   * 매칭형 정답을 추출한다.
   * @param answer 정답 원본 값
   * @returns 정규화된 정답 쌍 배열
   */
  getMatchingAnswer(answer: unknown): MatchingPair[] {
    const answerObject = this.toAnswerObject(answer);
    if (!answerObject) return [];
    return (
      this.normalizePairs(
        answerObject.pairs ??
          answerObject.correct_pairs ??
          answerObject.matching ??
          answerObject.value,
      ) ?? []
    );
  }

  /**
   * 객관식 정답을 비교한다.
   * @param submitted 제출된 옵션 ID
   * @param correct 정답 옵션 ID
   * @returns 정답 여부
   */
  isCorrectOption(submitted: unknown, correct: string | null): boolean {
    if (!correct) return false;
    const submittedId = this.toCleanString(submitted);
    return submittedId !== null && submittedId === correct;
  }

  /**
   * 매칭형 정답을 비교한다.
   * @param submittedPairs 제출된 쌍 목록
   * @param correctPairs 정답 쌍 목록
   * @returns 정답 여부
   */
  isCorrectMatching(
    submittedPairs: MatchingPair[] | undefined,
    correctPairs: MatchingPair[],
  ): boolean {
    const normalizedSubmitted = this.normalizePairs(submittedPairs);
    if (!normalizedSubmitted || normalizedSubmitted.length === 0) {
      return false;
    }

    const normalizeKey = (pair: MatchingPair) => `${pair.left}|||${pair.right}`;
    const expectedSet = new Set(correctPairs.map(normalizeKey));
    return normalizedSubmitted.every(pair => expectedSet.has(normalizeKey(pair)));
  }

  /**
   * 문자열 배열값을 정규화한다(트림 포함).
   * @param value 변환할 값
   * @returns 문자열 배열(유효하지 않으면 빈 배열)
   */
  private normalizePairs(value: unknown): MatchingPair[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const pairs = value
      .map(pair => {
        if (!this.isPlainObject(pair)) return null;
        const item = pair as Record<string, unknown>;
        const left = this.toCleanString(item.left);
        const right = this.toCleanString(item.right);
        if (left !== null && right !== null) {
          return { left, right };
        }
        return null;
      })
      .filter((p): p is MatchingPair => p !== null);

    return pairs.length > 0 ? pairs : undefined;
  }

  /**
   * answer raw 값을 객체로 변환한다(문자열 JSON도 허용).
   * @param raw answer 원본 값
   * @returns answer 객체 (없으면 null)
   */
  private toAnswerObject(raw: unknown): Record<string, unknown> | null {
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
   * 객체가 일반 객체인지 확인한다.
   * @param value 검사할 값
   * @returns plain object 여부
   */
  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * 안전하게 문자열로 변환하고 공백을 제거한다.
   * @param value 변환할 값
   * @returns 문자열 또는 null
   */
  private toCleanString(value: unknown): string | null {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value).trim();
    return null;
  }

  /**
   * 배열을 문자열 배열로 정규화한다(트림 포함).
   * @param value 변환할 값
   * @returns 문자열 배열(유효하지 않으면 빈 배열)
   */
  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map(item => this.toCleanString(item)).filter((v): v is string => v !== null);
  }
}
