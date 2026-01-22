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
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isStreaming: boolean;
  maxQuestionLength: number;
}
