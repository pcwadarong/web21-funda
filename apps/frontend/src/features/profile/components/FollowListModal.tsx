import { css, useTheme } from '@emotion/react';
import { useMemo, useState } from 'react';

import type { ProfileFollowUser } from '@/features/profile/types';
import type { Theme } from '@/styles/theme';

interface FollowListModalProps {
  initialTab: 'following' | 'followers';
  followingCount: number;
  followerCount: number;
  followers: ProfileFollowUser[];
  following: ProfileFollowUser[];
  isLoading: boolean;
}

export const FollowListModal = ({
  initialTab,
  followingCount,
  followerCount,
  followers,
  following,
  isLoading,
}: FollowListModalProps) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>(initialTab);
  const list = useMemo(
    () => (activeTab === 'following' ? following : followers),
    [activeTab, followers, following],
  );
  const emptyText =
    activeTab === 'following' ? '팔로잉한 사용자가 없습니다.' : '팔로워가 없습니다.';

  return (
    <div css={containerStyle(theme)}>
      <div css={tabRowStyle(theme)}>
        <button
          type="button"
          css={tabStyle(theme, activeTab === 'following')}
          onClick={() => setActiveTab('following')}
        >
          팔로잉 {followingCount}
        </button>
        <button
          type="button"
          css={tabStyle(theme, activeTab === 'followers')}
          onClick={() => setActiveTab('followers')}
        >
          팔로워 {followerCount}
        </button>
      </div>
      <div css={listWrapperStyle()}>
        {isLoading && <p css={emptyTextStyle(theme)}>로딩 중...</p>}
        {!isLoading && list.length === 0 && <p css={emptyTextStyle(theme)}>{emptyText}</p>}
        {!isLoading &&
          list.map(member => (
            <div key={member.userId} css={listItemStyle(theme)}>
              {member.profileImageUrl ? (
                <img
                  src={member.profileImageUrl}
                  alt={`${member.displayName} 프로필`}
                  css={avatarStyle(theme)}
                />
              ) : (
                <div css={avatarStyle(theme)} />
              )}
              <div css={textStyle}>
                <strong css={nameStyle(theme)}>{member.displayName}</strong>
                <span css={subStyle(theme)}>
                  {member.experience} XP · {member.tier?.name ?? '-'}
                </span>
              </div>
              <span css={rankStyle(theme)} />
            </div>
          ))}
      </div>
    </div>
  );
};

const containerStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: ${theme.colors.text.default};
  min-height: 420px;
`;

const tabRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const tabStyle = (theme: Theme, isActive: boolean) => css`
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${isActive ? theme.colors.primary.main : theme.colors.text.light};
  border-bottom: 2px solid ${isActive ? theme.colors.primary.main : 'transparent'};
`;

const listWrapperStyle = () => css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 320px;
  max-height: 480px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
`;

const listItemStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const avatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary.surface};
  object-fit: cover;
`;

const textStyle = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const subStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const rankStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const emptyTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;
