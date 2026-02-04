import { LeaderboardContainer } from '@/features/leaderboard/components/LeaderboardContainer';
import { useOverallWeeklyRanking, useWeeklyRanking } from '@/hooks/queries/leaderboardQueries';

export const Leaderboard = () => {
  const {
    data: weeklyRanking,
    isLoading: isWeeklyLoading,
    error: weeklyError,
    refetch: refetchWeekly,
    isFetching: isWeeklyFetching,
  } = useWeeklyRanking();
  const {
    data: overallRanking,
    isLoading: isOverallLoading,
    error: overallError,
    refetch: refetchOverall,
    isFetching: isOverallFetching,
  } = useOverallWeeklyRanking();

  const weeklyErrorMessage =
    weeklyError instanceof Error
      ? weeklyError.message
      : weeklyError
        ? '랭킹 정보를 불러오지 못했습니다.'
        : null;
  const overallErrorMessage =
    overallError instanceof Error
      ? overallError.message
      : overallError
        ? '랭킹 정보를 불러오지 못했습니다.'
        : null;

  return (
    <LeaderboardContainer
      weeklyRanking={weeklyRanking ?? null}
      overallRanking={overallRanking ?? null}
      isWeeklyLoading={isWeeklyLoading}
      isOverallLoading={isOverallLoading}
      weeklyErrorMessage={weeklyErrorMessage}
      overallErrorMessage={overallErrorMessage}
      onRefresh={() => {
        refetchWeekly();
        refetchOverall();
      }}
      isRefreshing={isWeeklyFetching || isOverallFetching}
    />
  );
};
