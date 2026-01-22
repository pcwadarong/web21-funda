import type { QuizQuestion } from '@/feat/quiz/types';

import { apiFetch } from './api';

interface SyncStepHistoryResponse {
  syncedCount: number;
}

type ReviewQueueParams = {
  fieldSlug?: string;
  limit?: number;
};

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
  async getReviewQueue(params?: ReviewQueueParams): Promise<QuizQuestion[]> {
    const searchParams = new URLSearchParams();
    if (params?.fieldSlug) {
      searchParams.set('fieldSlug', params.fieldSlug);
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    const endpoint = query.length > 0 ? `/progress/reviews?${query}` : '/progress/reviews';

    return apiFetch.get<QuizQuestion[]>(endpoint);
  },
};
