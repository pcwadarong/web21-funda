import { css, useTheme } from '@emotion/react';

import { Avatar } from '@/components/Avatar';
import SVGIcon from '@/components/SVGIcon';
import type { ProfileSearchUser } from '@/features/user/profile/types';
import type { Theme } from '@/styles/theme';
import { palette } from '@/styles/token';

interface UserSearchModalProps {
  keyword: string;
  users: ProfileSearchUser[];
  isLoading: boolean;
  pendingUserId?: number | null;
  onKeywordChange: (value: string) => void;
  onUserClick: (userId: number) => void;
  onFollowToggle: (userId: number, isFollowing: boolean) => void;
}

export const UserSearchModal = ({
  keyword,
  users,
  isLoading,
  pendingUserId = null,
  onKeywordChange,
  onUserClick,
  onFollowToggle,
}: UserSearchModalProps) => {
  const theme = useTheme();
  const trimmedKeyword = keyword.trim();
  const shouldSearch = trimmedKeyword.length >= 1;

  const emptyMessage = !shouldSearch
    ? '친구를 추가하면 서로의 진행 상황과 프로필을 확인할 수 있습니다.'
    : users.length === 0 && !isLoading
      ? '검색 결과가 없습니다.'
      : null;

  return (
    <div css={containerStyle(theme)}>
      <div css={searchInputWrapperStyle(theme)}>
        <span css={searchIconStyle(theme)}>
          <SVGIcon icon="Search" size="sm" />
        </span>
        <input
          value={keyword}
          onChange={event => onKeywordChange(event.target.value)}
          placeholder="사용자 이름 또는 이메일 검색"
          css={searchInputStyle(theme)}
        />
      </div>

      <div css={resultListStyle}>
        {isLoading && <p css={emptyTextStyle(theme)}>검색 중...</p>}
        {!isLoading && emptyMessage && <p css={emptyTextStyle(theme)}>{emptyMessage}</p>}
        {shouldSearch &&
          !isLoading &&
          users.map(user => {
            const isPending = pendingUserId === user.userId;
            return (
              <div key={user.userId} css={resultItemStyle(theme)}>
                <button
                  type="button"
                  css={userInfoButtonStyle}
                  onClick={() => onUserClick(user.userId)}
                >
                  <Avatar
                    src={user.profileImageUrl}
                    name={user.displayName}
                    size="sm"
                    css={avatarStyle(theme)}
                    alt={`${user.displayName} 프로필`}
                  />
                  <div css={textStyle}>
                    <strong css={nameStyle(theme)}>{user.displayName}</strong>
                    <span css={subStyle(theme)}>
                      {user.experience} XP · {user.tier?.name ?? '-'}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  css={followButtonStyle(theme, user.isFollowing)}
                  onClick={event => {
                    event.stopPropagation();
                    onFollowToggle(user.userId, user.isFollowing);
                  }}
                  disabled={isPending}
                >
                  {user.isFollowing ? '언팔로우하기' : '팔로우하기'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const containerStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 480px;
  color: ${theme.colors.text.default};
`;

const searchInputWrapperStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.small};
  padding: 0 0.75rem;
  background: ${theme.colors.surface.default};
`;

const searchIconStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.light};
  margin-right: 0.5rem;
`;

const searchInputStyle = (theme: Theme) => css`
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.75rem 0;
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${theme.colors.text.light};
  }
`;

const resultListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
`;

const resultItemStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const userInfoButtonStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
`;

const avatarStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.surface};
`;

const textStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;

const subStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const followButtonStyle = (theme: Theme, isFollowing: boolean) => css`
  border: none;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  background: ${isFollowing ? theme.colors.surface.strong : theme.colors.primary.main};
  color: ${isFollowing ? theme.colors.text.default : palette.grayscale[50]};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const emptyTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  text-align: center;
`;
