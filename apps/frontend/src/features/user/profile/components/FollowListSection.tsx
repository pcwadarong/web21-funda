import { css, useTheme } from '@emotion/react';
import { memo, useMemo, useState } from 'react';

import { Avatar } from '@/components/Avatar';
import { Modal } from '@/components/Modal';
import { FollowListModal } from '@/feat/user/profile/components/FollowListModal';
import type { ProfileFollowUser } from '@/feat/user/profile/types';
import type { Theme } from '@/styles/theme';

/**
 * 팔로우 리스트 섹션 Props
 */
interface FollowListSectionProps {
  /** 팔로잉 목록 */
  following: ProfileFollowUser[];
  /** 팔로워 목록 */
  followers: ProfileFollowUser[];
  /** 팔로잉 로딩 상태 */
  isFollowingLoading: boolean;
  /** 팔로워 로딩 상태 */
  isFollowersLoading: boolean;
  /** 사용자 클릭 핸들러 */
  onUserClick: (userId: number) => void;
}

/**
 * 팔로우 리스트 섹션
 *
 * 팔로잉/팔로워 탭 전환 기능과 함께 최대 3명의 사용자를 미리보기로 표시합니다.
 * '더보기' 버튼을 통해 전체 목록을 모달로 확인할 수 있습니다.
 */
export const FollowListSection = memo(
  ({
    following,
    followers,
    isFollowingLoading,
    isFollowersLoading,
    onUserClick,
  }: FollowListSectionProps) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);

    const followingCount = following.length;
    const followerCount = followers.length;

    const activeList = useMemo(
      () => (activeTab === 'following' ? following : followers),
      [activeTab, followers, following],
    );

    const mainListItems = useMemo(() => activeList.slice(0, 3), [activeList]);

    const isListLoading = activeTab === 'following' ? isFollowingLoading : isFollowersLoading;

    const handleMoveToProfile = (targetUserId: number) => {
      onUserClick(targetUserId);
      setIsFollowModalOpen(false);
    };

    return (
      <>
        <section css={cardStyle(theme)}>
          <div css={tabRowStyle(theme, activeTab)}>
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
          <div css={followListBodyStyle}>
            <div css={listStyle}>
              {isListLoading && <EmptyView message="로딩 중..." theme={theme} />}
              {!isListLoading && activeList.length === 0 && (
                <EmptyView
                  message={
                    activeTab === 'following'
                      ? '아직 팔로잉한 사용자가 없어요.'
                      : '아직 나를 팔로우한 사용자가 없어요.'
                  }
                  theme={theme}
                />
              )}
              {!isListLoading &&
                mainListItems.map((member, index) => (
                  <FollowListItem
                    key={member.userId}
                    member={member}
                    rank={index + 1}
                    onClick={() => handleMoveToProfile(member.userId)}
                    theme={theme}
                  />
                ))}
            </div>
            {activeList.length > 3 && (
              <div css={actionRowStyle}>
                <button
                  type="button"
                  css={moreButtonStyle(theme)}
                  onClick={() => setIsFollowModalOpen(true)}
                >
                  {activeList.length - 3}명 더보기 &gt;
                </button>
              </div>
            )}
          </div>
        </section>

        {isFollowModalOpen && (
          <Modal
            title="친구 목록"
            content={
              <FollowListModal
                initialTab={activeTab}
                followingCount={followingCount}
                followerCount={followerCount}
                following={following}
                followers={followers}
                isLoading={isListLoading}
                onUserClick={handleMoveToProfile}
              />
            }
            onClose={() => setIsFollowModalOpen(false)}
            maxWidth={720}
          />
        )}
      </>
    );
  },
);

FollowListSection.displayName = 'FollowListSection';

/**
 * 팔로우 리스트 아이템 Props
 */
interface FollowListItemProps {
  /** 사용자 정보 */
  member: ProfileFollowUser;
  /** 순위 (1부터 시작) */
  rank: number;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 테마 */
  theme: Theme;
}

/**
 * 팔로우 리스트 아이템
 */
const FollowListItem = ({ member, rank, onClick, theme }: FollowListItemProps) => (
  <button type="button" css={listItemButtonStyle(theme)} onClick={onClick}>
    <div css={listItemStyle(theme)}>
      <Avatar
        src={member.profileImageUrl}
        name={member.displayName}
        size="sm"
        css={listAvatarStyle(theme)}
        alt={`${member.displayName} 프로필`}
      />
      <div css={listTextStyle}>
        <strong css={listNameStyle(theme)}>{member.displayName}</strong>
        <span css={listSubStyle(theme)}>
          {member.experience} XP · {member.tier?.name ?? '-'}
        </span>
      </div>
      <span css={listRankStyle(theme)}>#{rank}</span>
    </div>
  </button>
);

/**
 * 빈 상태 뷰 Props
 */
interface EmptyViewProps {
  /** 표시할 메시지 */
  message: string;
  /** 테마 */
  theme: Theme;
}

/**
 * 빈 상태 뷰
 */
const EmptyView = ({ message, theme }: EmptyViewProps) => (
  <span css={emptyTextStyle(theme)}>{message}</span>
);

const cardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 1.25rem 1.5rem;
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const tabRowStyle = (theme: Theme, activeTab: 'following' | 'followers') => css`
  position: relative;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid ${theme.colors.border.default};
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 50%;
    height: 2px;
    background: ${theme.colors.primary.main};
    transform: translateX(${activeTab === 'following' ? '0%' : '100%'});
    transition: transform 200ms ease;
  }
`;

const tabStyle = (theme: Theme, isActive: boolean) => css`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.375rem 0 0.5rem;
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${isActive ? theme.colors.primary.main : theme.colors.text.light};
  cursor: pointer;
`;

const followListBodyStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 13.125rem;
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const listItemStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const listItemButtonStyle = (theme: Theme) => css`
  border: none;
  padding: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: ${theme.borderRadius.medium};
  &:hover {
    background: ${theme.colors.surface.bold};
  }
`;

const listAvatarStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.surface};
`;

const listTextStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const listNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const listSubStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const listRankStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const emptyTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  padding: 0.5rem 0.25rem;
  text-align: center;
`;

const actionRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const moreButtonStyle = (theme: Theme) => css`
  align-self: flex-end;
  margin-top: auto;
  border: none;
  background: transparent;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['12Medium'].fontSize};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
