import type { CorrectAnswerType, MatchingPair, QuizQuestion } from '@/feat/quiz/types';
import type { AiQuestionAnswer } from '@/services/aiAskService';

import type { QuizPreview } from './types';

/**
 * JSON 파싱 실패를 안전하게 처리하기 위한 유틸.
 *
 * @param value JSON 문자열
 * @returns 파싱 결과 또는 null
 */
export const parseJson = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

/**
 * 모달에 표시할 문제 정보를 간략하게 정리한다.
 * 보기/매칭/코드 정보를 텍스트 중심으로 전달하기 위해 분리한다.
 *
 * @param quiz 퀴즈 데이터
 * @returns 표시용 데이터
 */
export const buildQuizPreview = (quiz: QuizQuestion): QuizPreview => {
  const baseQuestion = quiz.content.question;
  const options: Array<{ id: string; text: string }> = [];

  if ('options' in quiz.content && quiz.content.options) {
    for (const option of quiz.content.options) {
      options.push({ id: option.id, text: option.text });
    }
  }

  const matching =
    quiz.type === 'matching' && 'matching_metadata' in quiz.content
      ? {
          left: quiz.content.matching_metadata.left.map(item => ({
            id: item.id,
            text: item.text,
          })),
          right: quiz.content.matching_metadata.right.map(item => ({
            id: item.id,
            text: item.text,
          })),
        }
      : null;

  const code =
    quiz.type === 'code' && 'code_metadata' in quiz.content
      ? {
          language: quiz.content.code_metadata.language,
          snippet: quiz.content.code_metadata.snippet,
        }
      : null;

  return { question: baseQuestion, options, matching, code, type: quiz.type };
};

/**
 * 답변 상태에 맞는 라벨을 반환한다.
 *
 * @param item 질문/답변 아이템
 * @returns 상태 텍스트
 */
export const getStatusLabel = (item: AiQuestionAnswer): string => {
  if (item.status === 'pending') {
    return '답변 생성 중';
  }
  if (item.status === 'failed') {
    return '답변 실패';
  }
  return '답변 완료';
};

/**
 * correctAnswer에서 correct_option_id를 추출한다.
 *
 * @param correctAnswer 정답 데이터
 * @returns correct_option_id 또는 null
 */
export const extractCorrectOptionId = (correctAnswer: CorrectAnswerType | null): string | null => {
  if (!correctAnswer) return null;

  // 객체 형태인 경우 (예: { correct_option_id: "c3" })
  if (typeof correctAnswer === 'object' && 'correct_option_id' in correctAnswer)
    return correctAnswer.correct_option_id as string;

  // 문자열인 경우
  if (typeof correctAnswer === 'string') return correctAnswer;

  return null;
};

/**
 * correctAnswer에서 correct_pairs를 추출한다.
 *
 * @param correctAnswer 정답 데이터
 * @returns correct_pairs 배열 또는 null
 */
export const extractCorrectPairs = (
  correctAnswer: CorrectAnswerType | null,
): MatchingPair[] | null => {
  if (!correctAnswer) return null;

  // 객체 형태인 경우
  if (typeof correctAnswer === 'object') {
    // { pairs: [...] } 형태
    if ('pairs' in correctAnswer && Array.isArray(correctAnswer.pairs)) {
      return correctAnswer.pairs as MatchingPair[];
    }
    // { correct_pairs: [...] } 형태
    if ('correct_pairs' in correctAnswer && Array.isArray(correctAnswer.correct_pairs)) {
      return correctAnswer.correct_pairs as MatchingPair[];
    }
  }

  return null;
};
