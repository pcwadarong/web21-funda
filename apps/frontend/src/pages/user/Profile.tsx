import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { ProfileContainer } from '@/feat/user/profile/components/ProfileContainer';
import { ErrorView } from '@/features/error/components/ErrorView';
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
import { useAuthProfileImageUrl, useAuthUser, useIsAuthReady } from '@/store/authStore';
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
  const isAuthReady = useIsAuthReady();
  const authProfileImageUrl = useAuthProfileImageUrl();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const numericUserId = userId ? Number(userId) : null;
  const shouldFetch = Number.isFinite(numericUserId ?? NaN) ? numericUserId : null;

  const {
    data: profileSummary,
    error: profileSummaryError,
    isLoading: isProfileLoading,
  } = useProfileSummary(shouldFetch);

  const { data: followers, isLoading: isFollowersLoading } = useProfileFollowers(shouldFetch);
  const { data: following, isLoading: isFollowingLoading } = useProfileFollowing(shouldFetch);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const handleUserClick = (targetUserId: number) => {
    navigate(`/profile/${targetUserId}`);
  };

  const { data: streaks } = useProfileStreaks(shouldFetch);
  const { data: dailyStats } = useProfileDailyStats(shouldFetch);
  const { data: fieldDailyStats } = useProfileFieldDailyStats(shouldFetch);

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
        const result = await unfollowMutation.mutateAsync({
          targetUserId: profileSummary.userId,
          myId: user.id,
        });
        setIsFollowingOverride(result.isFollowing);
        showToast('언팔로우했습니다.');
      } else {
        const result = await followMutation.mutateAsync(profileSummary.userId);
        setIsFollowingOverride(result.isFollowing);
        showToast('팔로우했습니다.');
      }
    } catch (followError) {
      setIsFollowingOverride(null);
      showToast((followError as Error).message);
    }
  };

  const diamondCount = profileSummary?.diamondCount ?? 0;

  // 라우팅 처리: /profile(아이디 없음) 접근 시
  // - 인증 준비 중이면 기다렸다가
  // - 준비 완료 후 로그인 상태면 내 프로필로
  // - 비로그인이면 로그인 페이지로 이동
  if (!userId) {
    if (!isAuthReady) {
      return <Loading text="프로필 정보 불러오는 중" />;
    }
    if (user?.id) {
      return <Navigate to={`/profile/${user.id}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // 에러 처리
  if (!isProfileLoading && (profileSummaryError || (shouldFetch !== null && !profileSummary))) {
    return (
      <ErrorView
        title="사용자를 찾을 수 없습니다."
        description="요청하신 사용자 정보가 존재하지 않습니다."
      />
    );
  }

  const resolvedProfileSummary =
    isMyProfile && profileSummary
      ? { ...profileSummary, profileImageUrl: authProfileImageUrl }
      : profileSummary;

  if (!isAuthReady || isProfileLoading || !resolvedProfileSummary)
    return <Loading text="프로필 정보 불러오는 중" />;

  return (
    <ProfileContainer
      profileSummary={resolvedProfileSummary ?? null}
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
