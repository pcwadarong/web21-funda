import { LeaderboardContainer } from '@/features/leaderboard/components/LeaderboardContainer';
import { useWeeklyRanking } from '@/hooks/queries/leaderboardQueries';

export const Leaderboard = () => {
  const { data: weeklyRanking, isLoading, error } = useWeeklyRanking();

  const errorMessage =
    error instanceof Error ? error.message : error ? '랭킹 정보를 불러오지 못했습니다.' : null;

  return (
    <LeaderboardContainer
      weeklyRanking={weeklyRanking ?? null}
      isLoading={isLoading}
      errorMessage={errorMessage}
    />
  );
};
