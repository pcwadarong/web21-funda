import type { MatchingPair, QuizQuestion, StepCompletionResult } from '@/feat/quiz/types';

import { apiFetch } from './api';

export interface QuizSubmissionRequest {
  quiz_id: number;
  type: 'MCQ' | 'OX' | 'MATCHING' | 'CODE';
  selection: {
    option_id?: string;
    pairs?: MatchingPair[];
  };
}

export interface QuizSubmissionResponse {
  solution: {
    explanation: string;
    correct_option_id?: string;
    correct_pairs?: MatchingPair[];
  };
}

export interface StepCompletionPayload {
  startedAt: number; // ms timestamp
}

export const quizService = {
  /**
   * 특정 스텝의 퀴즈 목록을 가져옵니다.
   * @param stepId 스텝 ID
   */
  async getQuizzesByStep(stepId: number): Promise<QuizQuestion[]> {
    return apiFetch.get<QuizQuestion[]>(`/steps/${stepId}/quizzes`);
  },

  /**
   * 퀴즈 정답 제출 API 호출
   * @param quizId 퀴즈 ID
   * @param payload 제출 요청 데이터
   * @returns 정답 및 해설
   */
  async submitQuiz(
    quizId: number,
    payload: QuizSubmissionRequest,
  ): Promise<QuizSubmissionResponse> {
    return apiFetch.post<QuizSubmissionResponse>(`/quizzes/${quizId}/submissions`, payload);
  },

  /**
   * 이 step의 모든 quiz 풀이가 끝났음을 서버에 확정하는 요청
   * @param stepId 스텝 ID
   * @param payload 퀴즈 시작 시간
   * @returns 퀴즈 결과 (소요 시간, 획득 xp, 성공률)
   */
  async completeStep(
    stepId: number,
    payload: StepCompletionPayload,
  ): Promise<StepCompletionResult> {
    return apiFetch.post<StepCompletionResult>(`/steps/${stepId}/completion`, payload);
  },
};
