import { useQuery } from '@tanstack/react-query';

import type { WeeklyRankingResult } from '@/features/leaderboard/types';
import { adminService, type AdminWeeklyRankingParams } from '@/services/adminService';

export const adminLeaderboardKeys = {
  weekly: (params: AdminWeeklyRankingParams) => ['admin', 'leaderboard', 'weekly', params] as const,
};

export const useAdminWeeklyRanking = (params: AdminWeeklyRankingParams | null) =>
  useQuery<WeeklyRankingResult, Error>({
    queryKey: params ? adminLeaderboardKeys.weekly(params) : ['admin', 'leaderboard', 'weekly'],
    queryFn: () => adminService.getWeeklyRankingByGroup(params!),
    enabled: params !== null,
    staleTime: 0,
  });
