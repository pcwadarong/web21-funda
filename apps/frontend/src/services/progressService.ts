import type { QuizQuestion } from '@/feat/quiz/types';

import { apiFetch } from './api';

interface SyncStepHistoryResponse {
  syncedCount: number;
}

type ReviewQueueParams = {
  fieldSlug?: string;
  limit?: number;
};

interface GoalInfoParams {
  id: string;
  label: string;
  current: number;
  target: number;
}

export interface TodayGoalsParams {
  perfectScore: GoalInfoParams;
  totalXP: GoalInfoParams;
  rewardGranted: boolean;
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
   * 비로그인 사용자가 스텝을 완료했을 때 Redis에 저장
   * @param stepId 완료한 스텝 ID
   */
  async completeGuestStep(stepId: number): Promise<{ success: boolean }> {
    return apiFetch.post<{ success: boolean }>(`/progress/steps/${stepId}/complete-guest`, {});
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

  async getTodayGoals(): Promise<TodayGoalsParams> {
    return apiFetch.get<TodayGoalsParams>('/progress/goals');
  },
};
