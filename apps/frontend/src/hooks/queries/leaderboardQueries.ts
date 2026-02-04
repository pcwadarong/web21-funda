import { useQuery } from '@tanstack/react-query';

import type {
  OverallRankingResult,
  RankingMeResult,
  WeeklyRankingResult,
} from '@/features/leaderboard/types';
import { rankingService } from '@/services/rankingService';

export const leaderboardKeys = {
  weekly: () => ['leaderboard', 'weekly'] as const,
  overall: () => ['leaderboard', 'overall'] as const,
  me: () => ['leaderboard', 'me'] as const,
};

export const useWeeklyRanking = () =>
  useQuery<WeeklyRankingResult, Error>({
    queryKey: leaderboardKeys.weekly(),
    queryFn: () => rankingService.getWeeklyRanking(),
    staleTime: 0,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

export const useOverallWeeklyRanking = () =>
  useQuery<OverallRankingResult, Error>({
    queryKey: leaderboardKeys.overall(),
    queryFn: () => rankingService.getOverallWeeklyRanking(),
    staleTime: 0,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

export const useRankingMe = (enabled: boolean = true) =>
  useQuery<RankingMeResult, Error>({
    queryKey: leaderboardKeys.me(),
    queryFn: () => rankingService.getRankingMe(),
    enabled,
    staleTime: 0,
  });
