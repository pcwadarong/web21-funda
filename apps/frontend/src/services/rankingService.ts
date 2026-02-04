import type {
  OverallRankingResult,
  RankingMeResult,
  WeeklyRankingResult,
} from '@/features/leaderboard/types';

import { apiFetch } from './api';

export const rankingService = {
  /**
   * 주간 랭킹 정보를 가져옵니다.
   */
  async getWeeklyRanking(): Promise<WeeklyRankingResult> {
    return apiFetch.get<WeeklyRankingResult>('/ranking/weekly');
  },

  /**
   * 주간 전체 랭킹 정보를 가져옵니다.
   */
  async getOverallWeeklyRanking(): Promise<OverallRankingResult> {
    return apiFetch.get<OverallRankingResult>('/ranking/overall');
  },

  /**
   * 현재 사용자의 랭킹 정보를 가져옵니다.
   */
  async getRankingMe(): Promise<RankingMeResult> {
    return apiFetch.get<RankingMeResult>('/ranking/me');
  },
};
