import { css, useTheme } from '@emotion/react';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Modal } from '@/components/Modal';
import { ErrorView } from '@/features/error/components/ErrorView';
import { FollowListModal } from '@/features/profile/components/FollowListModal';
import {
  useProfileFollowers,
  useProfileFollowing,
  useProfileSummary,
} from '@/hooks/queries/profileQueries';
import { useAuthUser } from '@/store/authStore';
import type { Theme } from '@/styles/theme';

export const Profile = () => {
  const { userId } = useParams();
  const user = useAuthUser();
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const numericUserId = userId ? Number(userId) : null;
  const shouldFetch = Number.isFinite(numericUserId ?? NaN) ? numericUserId : null;

  const {
    data: profileSummary,
    error: profileSummaryError,
    isLoading: isProfileLoading,
  } = useProfileSummary(shouldFetch);
  const { data: followers, isLoading: isFollowersLoading } = useProfileFollowers(shouldFetch);
  const { data: following, isLoading: isFollowingLoading } = useProfileFollowing(shouldFetch);

  const followingList = useMemo(() => following ?? [], [following]);

  const followerList = useMemo(() => followers ?? [], [followers]);

  const followerCount = followerList.length;
  const followingCount = followingList.length;

  const activeList = useMemo(
    () => (activeTab === 'following' ? followingList : followerList),
    [activeTab, followerList, followingList],
  );

  const mainListItems = useMemo(() => activeList.slice(0, 3), [activeList]);

  if (!userId && user?.id) return <Navigate to={`/profile/${user.id}`} replace />;
  if (!userId && !user) return <Navigate to="/login" replace />;
  if (!isProfileLoading && (profileSummaryError || (shouldFetch !== null && !profileSummary))) {
    return (
      <ErrorView
        title="사용자를 찾을 수 없습니다."
        description="요청하신 사용자 정보가 존재하지 않습니다."
      />
    );
  }

  const isListLoading = activeTab === 'following' ? isFollowingLoading : isFollowersLoading;

  const displayName = profileSummary?.displayName ?? '사용자';
  const tierName = profileSummary?.tier?.name ?? 'BRONZE';
  const experience = profileSummary?.experience ?? 0;
  const diamondCount = 0;
  const totalStudyTimeText = profileSummary ? `${profileSummary.totalStudyTimeMinutes} min` : '-';
  const solvedQuizzesText = profileSummary ? `${profileSummary.solvedQuizzesCount}` : '-';
  const streakText = profileSummary ? `${profileSummary.currentStreak} days` : '-';
  const profileImageUrl = profileSummary?.profileImageUrl ?? null;
  const handleMoveToProfile = (targetUserId: number) => {
    navigate(`/profile/${targetUserId}`);
    setIsFollowModalOpen(false);
  };

  return (
    <main css={pageStyle}>
      <div css={pageContentStyle}>
        <header css={headerStyle}>
          <h1 css={pageTitleStyle(theme)}>PROFILE</h1>
        </header>
        <section css={headerCardStyle(theme)}>
          <div css={headerLeftStyle}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={`${displayName} 프로필`} css={avatarStyle(theme)} />
            ) : (
              <div css={avatarStyle(theme)} />
            )}
            <div css={headerInfoStyle}>
              <div css={nameRowStyle}>
                <h1 css={nameStyle(theme)}>{displayName}</h1>
                <span css={tierBadgeStyle(theme)}>{tierName}</span>
              </div>
              <div css={metaRowStyle(theme)}>
                <span>⚡ {experience} XP</span>
                <span>💎 {diamondCount}</span>
              </div>
            </div>
          </div>
          <button type="button" css={editButtonStyle(theme)} disabled>
            프로필 이미지 수정하기
          </button>
        </section>

        <div css={twoColumnGridStyle}>
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
                {isListLoading && <span css={emptyTextStyle(theme)}>로딩 중...</span>}
                {!isListLoading && activeList.length === 0 && (
                  <span css={emptyTextStyle(theme)}>표시할 사용자가 없습니다.</span>
                )}
                {!isListLoading &&
                  mainListItems.map(member => (
                    <button
                      key={member.userId}
                      type="button"
                      css={listItemButtonStyle(theme)}
                      onClick={() => handleMoveToProfile(member.userId)}
                    >
                      <div css={listItemStyle(theme)}>
                        {member.profileImageUrl ? (
                          <img
                            src={member.profileImageUrl}
                            alt={`${member.displayName} 프로필`}
                            css={listAvatarStyle(theme)}
                          />
                        ) : (
                          <div css={listAvatarStyle(theme)} />
                        )}
                        <div css={listTextStyle}>
                          <strong css={listNameStyle(theme)}>{member.displayName}</strong>
                          <span css={listSubStyle(theme)}>
                            {member.experience} XP · {member.tier?.name ?? '-'}
                          </span>
                        </div>
                        <span css={listRankStyle(theme)} />
                      </div>
                    </button>
                  ))}
              </div>
              <button
                type="button"
                css={moreButtonStyle(theme)}
                onClick={() => setIsFollowModalOpen(true)}
              >
                더보기
              </button>
            </div>
          </section>

          <section css={cardStyle(theme)}>
            <h2 css={sectionTitleStyle(theme)}>{displayName}의 통계</h2>
            <div css={statListStyle}>
              <div css={statItemStyle(theme)}>
                <span css={statLabelStyle(theme)}>총 학습 시간</span>
                <strong css={statValueStyle(theme)}>{totalStudyTimeText}</strong>
              </div>
              <div css={statItemStyle(theme)}>
                <span css={statLabelStyle(theme)}>푼 문제 수</span>
                <strong css={statValueStyle(theme)}>{solvedQuizzesText}</strong>
              </div>
              <div css={statItemStyle(theme)}>
                <span css={statLabelStyle(theme)}>현재 스트릭</span>
                <strong css={statValueStyle(theme)}>{streakText}</strong>
              </div>
            </div>
          </section>
        </div>

        <div css={twoColumnGridStyle}>
          <section css={cardStyle(theme)}>
            <h2 css={sectionTitleStyle(theme)}>연간 학습</h2>
            <div css={heatmapStyle}>
              {Array.from({ length: 84 }).map((_, index) => (
                <span key={index} css={heatmapCellStyle(theme)} />
              ))}
            </div>
          </section>

          <section css={cardStyle(theme)}>
            <h2 css={sectionTitleStyle(theme)}>학습 시간</h2>
            <p css={chartCaptionStyle(theme)}>최근 한 주, 하루 평균 학습 시간은 n분 n초예요.</p>
            <div css={chartPlaceholderStyle(theme)} />
            <div css={chartAxisStyle(theme)}>
              <span>2025.12.21</span>
              <span>2025.12.21</span>
            </div>
          </section>
        </div>
        {isFollowModalOpen && (
          <Modal
            title="친구 목록"
            content={
              <FollowListModal
                initialTab={activeTab}
                followingCount={followingCount}
                followerCount={followerCount}
                following={followingList}
                followers={followerList}
                isLoading={isListLoading}
                onUserClick={handleMoveToProfile}
              />
            }
            onClose={() => setIsFollowModalOpen(false)}
            maxWidth={720}
          />
        )}
      </div>
    </main>
  );
};

const pageStyle = css`
  flex: 1;
  min-height: 100vh;
  padding: 32px 24px 120px;
`;

const pageContentStyle = css`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const pageTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.primary.main};
  letter-spacing: 0.12em;
  padding-left: 0.5rem;
`;

const headerCardStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  background: linear-gradient(180deg, #6559ea 0%, #8b82ff 100%);
  color: ${theme.colors.surface.strong};
`;

const headerLeftStyle = css`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const avatarStyle = (theme: Theme) => css`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${theme.colors.primary.light};
  object-fit: cover;
  overflow: hidden;
`;

const headerInfoStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const nameRowStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const nameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
`;

const tierBadgeStyle = (theme: Theme) => css`
  padding: 4px 10px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.semilight};
  color: ${theme.colors.primary.dark};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const metaRowStyle = (theme: Theme) => css`
  display: flex;
  gap: 16px;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
`;

const editButtonStyle = (theme: Theme) => css`
  padding: 10px 16px;
  border-radius: ${theme.borderRadius.medium};
  border: none;
  background: ${theme.colors.primary.light};
  color: ${theme.colors.primary.dark};
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  cursor: not-allowed;
`;

const twoColumnGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const cardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 20px 24px;
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  padding: 6px 0 8px;
  font-size: ${theme.typography['12Medium'].fontSize};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${isActive ? theme.colors.primary.main : theme.colors.text.light};
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const followListBodyStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 210px;
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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary.surface};
  object-fit: cover;
  overflow: hidden;
`;

const listTextStyle = css`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const listNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const listSubStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const listRankStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const emptyTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  padding: 8px 4px;
`;

const moreButtonStyle = (theme: Theme) => css`
  align-self: flex-end;
  margin-top: auto;
  border: none;
  background: transparent;
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['12Medium'].fontSize};
  cursor: pointer;
`;

const sectionTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const statListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const statItemStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.surface};
`;

const statLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const statValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.default};
`;

const heatmapStyle = css`
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 6px;
`;

const heatmapCellStyle = (theme: Theme) => css`
  width: 100%;
  padding-top: 100%;
  border-radius: 6px;
  background: ${theme.colors.surface.bold};
`;

const chartCaptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
`;

const chartPlaceholderStyle = (theme: Theme) => css`
  height: 140px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const chartAxisStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;
