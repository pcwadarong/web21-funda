import type { AnswerType, CorrectAnswerType } from '@/feat/quiz/types';

import { apiFetch } from './api';

export interface CheckAnswerRequest {
  answer: AnswerType;
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
  correctAnswer: CorrectAnswerType; // 서버는 텍스트 기반으로 응답
  explanation: string;
}

export const quizService = {
  /**
   * 퀴즈 정답 확인 API 호출
   * @param quizId 퀴즈 ID
   * @param answer 사용자가 선택한 답변
   * @returns 정답 여부, 정답, 해설
   */
  async checkAnswer(quizId: number, answer: AnswerType): Promise<CheckAnswerResponse> {
    return apiFetch.post<CheckAnswerResponse>(`/quizzes/${quizId}/submissions/`, { answer });
  },
};
