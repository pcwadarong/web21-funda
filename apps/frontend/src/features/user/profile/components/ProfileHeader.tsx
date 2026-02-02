import { css, useTheme } from '@emotion/react';
import { memo, useMemo } from 'react';

import SVGIcon from '@/comp/SVGIcon';
import { Avatar } from '@/components/Avatar';
import type { ProfileSummaryResult } from '@/feat/user/profile/types';
import type { Theme } from '@/styles/theme';
import { palette } from '@/styles/token';

/**
 * 프로필 헤더 컴포넌트 Props
 */
interface ProfileHeaderProps {
  /** 프로필 요약 정보 */
  profileSummary: ProfileSummaryResult | null;
  /** 다이아몬드 개수 */
  diamondCount: number;
  /** 프로필 이미지 영역 클릭 핸들러 */
  onProfileImageClick?: () => void;
  /** 내 프로필 여부 */
  isMyProfile: boolean;
  /** 팔로우 상태 */
  isFollowing: boolean;
  /** 팔로우 토글 핸들러 */
  onFollowToggle?: () => void;
}

/**
 * 프로필 헤더 섹션
 *
 * 그라데이션 배경의 헤더 영역으로, 프로필 이미지, 사용자 이름, 티어, XP, 다이아몬드 정보를 표시합니다.
 */
export const ProfileHeader = memo(
  ({
    profileSummary,
    diamondCount,
    onProfileImageClick,
    isMyProfile,
    isFollowing,
    onFollowToggle,
  }: ProfileHeaderProps) => {
    const theme = useTheme();

    const displayName = useMemo(
      () => profileSummary?.displayName ?? '사용자',
      [profileSummary?.displayName],
    );
    const tierName = useMemo(
      () => profileSummary?.tier?.name ?? 'BRONZE',
      [profileSummary?.tier?.name],
    );
    const experience = useMemo(() => profileSummary?.experience ?? 0, [profileSummary?.experience]);
    const profileImageUrl = useMemo(
      () => profileSummary?.profileImageUrl ?? null,
      [profileSummary?.profileImageUrl],
    );
    const isEditable = Boolean(onProfileImageClick) && isMyProfile;
    const shouldShowFollow = !isMyProfile && Boolean(onFollowToggle);

    return (
      <section css={headerCardStyle(theme)}>
        <div css={headerLeftWrapperStyle}>
          <div css={avatarWrapperStyle}>
            <Avatar
              src={profileImageUrl}
              name={displayName}
              size="md"
              css={avatarStyle(theme)}
              alt={`${displayName} 프로필`}
            />
            {isEditable && (
              <button
                type="button"
                css={avatarEditButtonStyle(theme, false)}
                onClick={onProfileImageClick}
                aria-label="프로필 이미지 변경"
              >
                <SVGIcon icon="Edit" size="sm" />
              </button>
            )}
          </div>
          <div css={headerInfoWrapperStyle}>
            <div css={nameRowWrapperStyle}>
              <h1 css={nameStyle(theme)}>{displayName}</h1>
            </div>
            <span css={tierBadgeStyle}>{tierName}</span>
            <div css={metaRowWrapperStyle}>
              <div css={metaItemStyle}>
                <SVGIcon icon="Xp" />
                <span>{experience} XP</span>
              </div>
              <div css={metaItemStyle}>
                <SVGIcon icon="Diamond" />
                <span>{diamondCount}</span>
              </div>
            </div>
          </div>
        </div>
        {isMyProfile ? (
          <div />
        ) : shouldShowFollow ? (
          <button type="button" css={rightActionButtonStyle(theme)} onClick={onFollowToggle}>
            {isFollowing ? '언팔로우하기' : '팔로우하기'}
          </button>
        ) : (
          <div />
        )}
      </section>
    );
  },
);

ProfileHeader.displayName = 'ProfileHeader';

const headerCardStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  background: linear-gradient(180deg, #6559ea 0%, #8b82ff 100%);
  color: ${palette.grayscale[50]};
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  box-shadow: 0 10px 20px rgba(107, 92, 231, 0.2);
`;

const headerLeftWrapperStyle = css`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const headerInfoWrapperStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const nameRowWrapperStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${palette.grayscale[50]};
`;

const tierBadgeStyle = css`
  letter-spacing: 0.05em;
  font-size: 0.875rem;
  padding-left: 2px;
`;

const metaRowWrapperStyle = css`
  display: flex;
  gap: 1rem;
`;

const metaItemStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
`;

const avatarWrapperStyle = css`
  position: relative;
  display: inline-flex;
`;

const avatarStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.light};
`;

const avatarEditButtonStyle = (theme: Theme, _isDisabled: boolean) => css`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  border: 2px solid ${palette.grayscale[50]};
  background: ${palette.grayscale[50]};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary.main};
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);

  &:hover {
    background: ${palette.grayscale[100]};
  }
`;

const rightActionButtonStyle = (theme: Theme) => css`
  padding: 0.625rem 1rem;
  border-radius: ${theme.borderRadius.medium};
  border: none;
  background: ${theme.colors.primary.light};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${palette.grayscale[50]};
  cursor: pointer;
  opacity: 0.95;
`;
