import type { WeeklyRankingResult } from '@/features/leaderboard/types';

import { apiFetch } from './api';

export interface RankingMeResult {
  tier: {
    id: number;
    name: string;
    orderIndex: number;
  } | null;
  diamondCount: number;
}

export const rankingService = {
  /**
   * 주간 랭킹 정보를 가져옵니다.
   */
  async getWeeklyRanking(): Promise<WeeklyRankingResult> {
    return apiFetch.get<WeeklyRankingResult>('/ranking/weekly');
  },

  /**
   * 현재 사용자의 랭킹 정보를 가져옵니다.
   */
  async getRankingMe(): Promise<RankingMeResult> {
    return apiFetch.get<RankingMeResult>('/ranking/me');
  },
};
