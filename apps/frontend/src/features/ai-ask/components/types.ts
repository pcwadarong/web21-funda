import type { CorrectAnswerType, QuizQuestion } from '@/feat/quiz/types';
import type { AiQuestionAnswer } from '@/services/aiAskService';

/**
 * SSE 이벤트 타입
 */
export type SseEvent = {
  event: string;
  data: string;
};

/**
 * 퀴즈 미리보기 데이터 타입
 */
export type QuizPreview = {
  question: string;
  options: Array<{ id: string; text: string }>;
  matching: {
    left: Array<{ id: string; text: string }>;
    right: Array<{ id: string; text: string }>;
  } | null;
  code: {
    language: string;
    snippet: string;
  } | null;
  type: QuizQuestion['type'];
};

/**
 * QuizInfoSection Props
 */
export interface QuizInfoSectionProps {
  preview: QuizPreview;
  correctAnswer: CorrectAnswerType | null;
}

/**
 * ChatHistorySection Props
 */
export interface ChatHistorySectionProps {
  items: AiQuestionAnswer[];
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
}

/**
 * ChatInputFooter Props
 */
export interface ChatInputFooterProps {
  /** 입력 필드의 현재 값 */
  input: string;
  /** 입력 값 변경 핸들러 */
  onInputChange: (value: string) => void;
  /** 폼 제출 핸들러 */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** 현재 스트리밍 중인지 여부 */
  isStreaming: boolean;
  /** 질문 최대 길이 제한 */
  maxQuestionLength: number;
}
