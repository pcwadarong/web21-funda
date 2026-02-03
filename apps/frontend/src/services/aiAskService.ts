import { apiFetch } from './api';

export type AiAnswerStatus = 'pending' | 'completed' | 'failed';

export interface AiQuestionAnswer {
  id: number;
  quizId: number;
  question: string;
  answer: string | null;
  status: AiAnswerStatus;
  createdAt: string;
  isMine: boolean;
}

export const getAiQuestions = async (quizId: number): Promise<AiQuestionAnswer[]> =>
  apiFetch.get<AiQuestionAnswer[]>(`/quizzes/${quizId}/ai-questions`);
