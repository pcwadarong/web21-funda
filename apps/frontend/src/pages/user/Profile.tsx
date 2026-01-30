import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { ErrorView } from '@/features/error/components/ErrorView';
import { ProfileContainer } from '@/features/user/components/profile/ProfileContainer';
import {
  useProfileFollowers,
  useProfileFollowing,
  useProfileSummary,
} from '@/hooks/queries/profileQueries';
import { useAuthUser } from '@/store/authStore';

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
  const location = useLocation();

  const numericUserId = userId ? Number(userId) : null;
  const shouldFetch = Number.isFinite(numericUserId ?? NaN) ? numericUserId : null;

  const {
    data: profileSummary,
    error: profileSummaryError,
    isLoading: isProfileLoading,
    refetch: refetchProfileSummary,
  } = useProfileSummary(shouldFetch);
  const { data: followers, isLoading: isFollowersLoading } = useProfileFollowers(shouldFetch);
  const { data: following, isLoading: isFollowingLoading } = useProfileFollowing(shouldFetch);

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

  const handleUserClick = (targetUserId: number) => {
    navigate(`/profile/${targetUserId}`);
  };

  const shouldRefetch = Boolean((location.state as { refetch?: boolean } | null)?.refetch);

  useEffect(() => {
    if (!shouldRefetch) {
      return;
    }

    void refetchProfileSummary();
    navigate(location.pathname, { replace: true, state: null });
  }, [navigate, location.pathname, refetchProfileSummary, shouldRefetch]);

  const isMyProfile = user?.id !== undefined && profileSummary?.userId === user.id;
  const handleProfileImageClick = isMyProfile ? () => navigate('/profile/characters') : undefined;

  // TODO: 실제 다이아몬드 개수는 프로필 API에서 가져와야 함
  const diamondCount = 0;

  return (
    <ProfileContainer
      profileSummary={profileSummary ?? null}
      following={following ?? []}
      followers={followers ?? []}
      isFollowingLoading={isFollowingLoading}
      isFollowersLoading={isFollowersLoading}
      diamondCount={diamondCount}
      onUserClick={handleUserClick}
      onProfileImageClick={handleProfileImageClick}
    />
  );
};
