import { useEffect, useState } from 'react';

import { LeaderboardContainer } from '@/features/leaderboard/components/LeaderboardContainer';
import type { WeeklyRankingResult } from '@/features/leaderboard/types';
import { apiFetch } from '@/services/api';

export const Leaderboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyRankingResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRankingData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const weeklyResult = await apiFetch.get<WeeklyRankingResult>('/ranking/weekly');

        if (!isMounted) return;
        setWeeklyRanking(weeklyResult);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : '랭킹 정보를 불러오지 못했습니다.';
        setErrorMessage(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRankingData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <LeaderboardContainer
      weeklyRanking={weeklyRanking}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
};
