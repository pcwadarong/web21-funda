import type { QuizQuestion } from '@/feat/quiz/types';

import { apiFetch } from './api';

interface SyncStepHistoryResponse {
  syncedCount: number;
}

export const progressService = {
  /**
   * 비로그인 상태에서 푼 step 기록을 서버에 동기화
   * @param stepIds 동기화할 step ID 배열
   */
  async syncStepHistory(stepIds: number[]): Promise<SyncStepHistoryResponse> {
    return apiFetch.post<SyncStepHistoryResponse>('/progress/steps/sync', { stepIds });
  },

  /**
   * 복습 노트 대상 퀴즈 목록 조회
   */
  async getReviewQueue(): Promise<QuizQuestion[]> {
    return apiFetch.get<QuizQuestion[]>('/progress/reviews');
  },
};
