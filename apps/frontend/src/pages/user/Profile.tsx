import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ProfileContainer } from '@/feat/user/profile/components/ProfileContainer';
import { ErrorView } from '@/features/error/components/ErrorView';
import { useRankingMe } from '@/hooks/queries/leaderboardQueries';
import {
  useFollowUserMutation,
  useProfileDailyStats,
  useProfileFieldDailyStats,
  useProfileFollowers,
  useProfileFollowing,
  useProfileStreaks,
  useProfileSummary,
  useUnfollowUserMutation,
} from '@/hooks/queries/userQueries';
import { useAuthUser, useIsAuthReady, useIsLoggedIn } from '@/store/authStore';
import { useToast } from '@/store/toastStore';

/**
 * 프로필 페이지
 *
 * 사용자의 프로필 정보를 표시하는 페이지입니다.
 * 데이터 패칭과 라우팅 로직만 담당하며, UI는 ProfileContainer에 위임합니다.
 */
export const Profile = () => {
  const { userId } = useParams();
  const user = useAuthUser();
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const isAuthReady = useIsAuthReady();
  const location = useLocation();
  const { showToast } = useToast();

  const numericUserId = userId ? Number(userId) : null;
  const shouldFetch = Number.isFinite(numericUserId ?? NaN) ? numericUserId : null;

  const {
    data: profileSummary,
    error: profileSummaryError,
    isLoading: isProfileLoading,
    refetch: refetchProfileSummary,
  } = useProfileSummary(shouldFetch);

  const {
    data: followers,
    isLoading: isFollowersLoading,
    refetch: refetchFollowers,
  } = useProfileFollowers(shouldFetch);
  const {
    data: following,
    isLoading: isFollowingLoading,
    refetch: refetchFollowing,
  } = useProfileFollowing(shouldFetch);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleUserClick = (targetUserId: number) => {
    navigate(`/profile/${targetUserId}`);
  };

  const shouldRefetch = Boolean((location.state as { refetch?: boolean } | null)?.refetch);

  useEffect(() => {
    if (!shouldRefetch) {
      return;
    }

    void refetchProfileSummary();
    void refetchFollowers();
    void refetchFollowing();
    navigate(location.pathname, { replace: true, state: null });
  }, [
    navigate,
    location.pathname,
    refetchFollowers,
    refetchFollowing,
    refetchProfileSummary,
    shouldRefetch,
  ]);

  useEffect(() => {
    if (shouldFetch === null) {
      return;
    }

    void refetchFollowers();
    void refetchFollowing();
  }, [refetchFollowers, refetchFollowing, shouldFetch]);
  const { data: streaks } = useProfileStreaks(shouldFetch);
  const { data: dailyStats } = useProfileDailyStats(shouldFetch);
  const { data: fieldDailyStats } = useProfileFieldDailyStats(shouldFetch);

  const shouldFetchRanking = isLoggedIn && isAuthReady && !!user;
  const { data: rankingMe } = useRankingMe(shouldFetchRanking);

  const isMyProfile = user?.id !== undefined && profileSummary?.userId === user.id;
  const handleProfileImageClick = isMyProfile ? () => navigate('/profile/characters') : undefined;
  const computedIsFollowing = Boolean(
    user?.id && followers?.some(follower => follower.userId === user.id),
  );
  const [isFollowingOverride, setIsFollowingOverride] = useState<boolean | null>(null);
  const isFollowing = isFollowingOverride ?? computedIsFollowing;

  useEffect(() => {
    setIsFollowingOverride(null);
  }, [computedIsFollowing]);

  const handleFollowToggle = async () => {
    if (!profileSummary || !user?.id) {
      return;
    }

    try {
      setIsFollowingOverride(!isFollowing);

      if (isFollowing) {
        await unfollowMutation.mutateAsync(profileSummary.userId);
        showToast('언팔로우했습니다.');
      } else {
        await followMutation.mutateAsync(profileSummary.userId);
        showToast('팔로우했습니다.');
      }

      await Promise.all([refetchFollowers(), refetchFollowing(), refetchProfileSummary()]);
      setIsFollowingOverride(null);
    } catch (followError) {
      setIsFollowingOverride(null);
      showToast((followError as Error).message);
    }
  };

  const diamondCount = rankingMe?.diamondCount ?? 0;

  // 라우팅 처리: userId가 없으면 현재 사용자 프로필로 리다이렉트
  if (!userId && user?.id) return <Navigate to={`/profile/${user.id}`} replace />;
  if (!userId && !user) return <Navigate to="/login" replace />;

  // 에러 처리
  if (!isProfileLoading && (profileSummaryError || (shouldFetch !== null && !profileSummary))) {
    return (
      <ErrorView
        title="사용자를 찾을 수 없습니다."
        description="요청하신 사용자 정보가 존재하지 않습니다."
      />
    );
  }

  return (
    <ProfileContainer
      profileSummary={profileSummary ?? null}
      following={following ?? []}
      followers={followers ?? []}
      isFollowingLoading={isFollowingLoading}
      isFollowersLoading={isFollowersLoading}
      streaks={streaks ?? []}
      dailyStats={dailyStats ?? null}
      fieldDailyStats={fieldDailyStats ?? null}
      diamondCount={diamondCount}
      onUserClick={handleUserClick}
      onProfileImageClick={handleProfileImageClick}
      isMyProfile={isMyProfile}
      isFollowing={isFollowing}
      onFollowToggle={!isMyProfile ? handleFollowToggle : undefined}
    />
  );
};
