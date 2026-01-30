import { css, useTheme } from '@emotion/react';
import { memo, useMemo } from 'react';

import type { ProfileFollowUser, ProfileSummaryResult } from '@/feat/user/profile/types';
import type { Theme } from '@/styles/theme';

import { ChartSection } from './ChartSection';
import { FollowListSection } from './FollowListSection';
import { HeatmapSection } from './HeatmapSection';
import { ProfileHeader } from './ProfileHeader';
import { StatsSection } from './StatsSection';

/**
 * 프로필 컨테이너 Props
 */
interface ProfileContainerProps {
  /** 프로필 요약 정보 */
  profileSummary: ProfileSummaryResult | null;
  /** 팔로잉 목록 */
  following: ProfileFollowUser[];
  /** 팔로워 목록 */
  followers: ProfileFollowUser[];
  /** 팔로잉 로딩 상태 */
  isFollowingLoading: boolean;
  /** 팔로워 로딩 상태 */
  isFollowersLoading: boolean;
  /** 다이아몬드 개수 */
  diamondCount: number;
  /** 사용자 클릭 핸들러 */
  onUserClick: (userId: number) => void;
}

/**
 * 프로필 컨테이너
 *
 * 프로필 페이지의 메인 레이아웃을 구성하는 컨테이너 컴포넌트입니다.
 * 헤더, 팔로우 리스트, 통계, 차트, 히트맵 섹션을 포함합니다.
 */
export const ProfileContainer = memo(
  ({
    profileSummary,
    following,
    followers,
    isFollowingLoading,
    isFollowersLoading,
    diamondCount,
    onUserClick,
  }: ProfileContainerProps) => {
    const theme = useTheme();

    const displayName = useMemo(
      () => profileSummary?.displayName ?? '사용자',
      [profileSummary?.displayName],
    );

    return (
      <main css={pageStyle}>
        <div css={pageContentStyle}>
          <header css={headerStyle}>
            <h1 css={pageTitleStyle(theme)}>PROFILE</h1>
          </header>

          <ProfileHeader profileSummary={profileSummary} diamondCount={diamondCount} />

          <div css={twoColumnGridStyle}>
            <FollowListSection
              following={following}
              followers={followers}
              isFollowingLoading={isFollowingLoading}
              isFollowersLoading={isFollowersLoading}
              onUserClick={onUserClick}
            />

            <StatsSection profileSummary={profileSummary} displayName={displayName} />
          </div>

          <div css={twoColumnGridStyle}>
            <HeatmapSection />

            <ChartSection />
          </div>
        </div>
      </main>
    );
  },
);

ProfileContainer.displayName = 'ProfileContainer';

const pageStyle = css`
  flex: 1;
  min-height: 100vh;
  padding: 2rem 1.5rem 7.5rem;
`;

const pageContentStyle = css`
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const pageTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.primary.main};
  letter-spacing: 0.12em;
  padding-left: 0.5rem;
`;

const twoColumnGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;

  @media (max-width: 56.25rem) {
    grid-template-columns: 1fr;
  }
`;
