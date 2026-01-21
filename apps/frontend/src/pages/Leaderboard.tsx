import { css, useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';

import { apiFetch } from '@/services/api';
import type { Theme } from '@/styles/theme';

interface TierInfo {
  id: number;
  name: string;
  orderIndex: number;
}

interface RankingMeResult {
  tier: TierInfo;
  diamondCount: number;
}

interface RankingMember {
  rank: number;
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  xp: number;
  isMe: boolean;
}

interface WeeklyRankingResult {
  weekKey: string;
  tier: TierInfo;
  groupIndex: number;
  totalMembers: number;
  myRank: number;
  myWeeklyXp: number;
  members: RankingMember[];
}

export const Leaderboard = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rankingMe, setRankingMe] = useState<RankingMeResult | null>(null);
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyRankingResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRankingData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const meResult = await apiFetch.get<RankingMeResult>('/ranking/me');
        const weeklyResult = await apiFetch.get<WeeklyRankingResult>('/ranking/weekly');

        if (!isMounted) {
          return;
        }

        setRankingMe(meResult);
        setWeeklyRanking(weeklyResult);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : '랭킹 정보를 불러오지 못했습니다.';
        setErrorMessage(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchRankingData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main css={pageStyle}>
        <div css={pageContentStyle}>
          <header css={headerStyle}>
            <div>
              <p css={pageEyebrowStyle(theme)}>Leaderboard</p>
              <h1 css={pageTitleStyle(theme)}>랭킹</h1>
            </div>
          </header>
          <div css={stateCardStyle(theme)}>랭킹 정보를 불러오는 중입니다.</div>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main css={pageStyle}>
        <div css={pageContentStyle}>
          <header css={headerStyle}>
            <div>
              <p css={pageEyebrowStyle(theme)}>Leaderboard</p>
              <h1 css={pageTitleStyle(theme)}>랭킹</h1>
            </div>
          </header>
          <div css={stateCardStyle(theme)}>{errorMessage}</div>
        </div>
      </main>
    );
  }

  if (!rankingMe || !weeklyRanking) {
    return (
      <main css={pageStyle}>
        <div css={pageContentStyle}>
          <header css={headerStyle}>
            <div>
              <p css={pageEyebrowStyle(theme)}>Leaderboard</p>
              <h1 css={pageTitleStyle(theme)}>랭킹</h1>
            </div>
          </header>
          <div css={stateCardStyle(theme)}>랭킹 데이터가 비어 있습니다.</div>
        </div>
      </main>
    );
  }

  const leagueTitle = `${weeklyRanking.tier.name} 리그`;

  return (
    <main css={pageStyle}>
      <div css={pageContentStyle}>
        <header css={headerStyle}>
          <div>
            <p css={pageEyebrowStyle(theme)}>Leaderboard</p>
            <h1 css={pageTitleStyle(theme)}>랭킹</h1>
          </div>
        </header>

        <section css={summaryCardStyle(theme)} data-section="summary">
          <div css={summaryLeftStyle}>
            <p css={summaryTitleStyle(theme)}>{leagueTitle}</p>
            <p css={summarySubTextStyle(theme)}>
              {weeklyRanking.weekKey} · 그룹 {weeklyRanking.groupIndex} · 총{' '}
              {weeklyRanking.totalMembers}명
            </p>
          </div>
          <div css={summaryRightStyle}>
            <div css={summaryItemStyle(theme)}>
              <span>내 랭킹</span>
              <strong>{weeklyRanking.myRank}위</strong>
            </div>
            <div css={summaryItemStyle(theme)}>
              <span>주간 XP</span>
              <strong>{weeklyRanking.myWeeklyXp}점</strong>
            </div>
            <div css={summaryItemStyle(theme)}>
              <span>다이아</span>
              <strong>{rankingMe.diamondCount}개</strong>
            </div>
          </div>
        </section>

        <section css={leaderboardCardStyle(theme)} data-section="ranking">
          <header css={listHeaderStyle}>
            <div>
              <p css={listTitleTextStyle(theme)}>이번 주차 랭킹</p>
              <p css={listTitleSubTextStyle(theme)}>
                {weeklyRanking.weekKey} · {leagueTitle}
              </p>
            </div>
          </header>

          <ol css={listStyle}>
            {weeklyRanking.members.map(member => {
              let meBadge = null;

              if (member.isMe) {
                meBadge = <span css={meBadgeStyle(theme)}>나</span>;
              }

              return (
                <li key={member.userId} css={rankingRowStyle(theme, member.isMe)}>
                  <span css={rankNumberStyle(theme, member.isMe)}>{member.rank}</span>
                  <div css={avatarStyle(theme)}>
                    {member.profileImageUrl ? (
                      <img
                        src={member.profileImageUrl}
                        alt={`${member.displayName} 프로필`}
                        css={avatarImageStyle}
                      />
                    ) : (
                      <span css={avatarTextStyle(theme)}>{getAvatarLabel(member.displayName)}</span>
                    )}
                  </div>
                  <div css={nameBlockStyle}>
                    <span css={memberNameStyle(theme)}>{member.displayName}</span>
                    {meBadge}
                  </div>
                  <div css={xpBlockStyle}>
                    <span css={xpValueStyle(theme)}>{member.xp.toLocaleString()} XP</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
};

const getAvatarLabel = (displayName: string) => {
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    return '?';
  }

  return trimmedName.slice(0, 2).toUpperCase();
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
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const pageEyebrowStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.weak};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const pageTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['32Bold'].fontSize};
  line-height: ${theme.typography['32Bold'].lineHeight};
  font-weight: ${theme.typography['32Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const summaryCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const summaryLeftStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const summaryTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const summarySubTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.weak};
`;

const summaryRightStyle = css`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const summaryItemStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.weak};

  strong {
    font-size: ${theme.typography['16Bold'].fontSize};
    line-height: ${theme.typography['16Bold'].lineHeight};
    font-weight: ${theme.typography['16Bold'].fontWeight};
    color: ${theme.colors.text.strong};
  }
`;

const leaderboardCardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  padding: 20px;
`;

const listHeaderStyle = css`
  margin-bottom: 16px;
`;

const listTitleTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const listTitleSubTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.weak};
`;

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const rankingRowStyle = (theme: Theme, isMe: boolean) => {
  let rowBackground = 'transparent';

  if (isMe) {
    rowBackground = theme.colors.primary.surface;
  }

  return css`
    display: grid;
    grid-template-columns: 36px 44px 1fr 110px;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: ${theme.borderRadius.medium};
    background: ${rowBackground};
    border: 1px solid ${theme.colors.border.default};

    @media (max-width: 768px) {
      grid-template-columns: 30px 40px 1fr auto;
      padding: 12px;
    }
  `;
};

const rankNumberStyle = (theme: Theme, isMe: boolean) => {
  let rankColor = theme.colors.text.strong;

  if (isMe) {
    rankColor = theme.colors.primary.main;
  }

  return css`
    font-size: ${theme.typography['16Bold'].fontSize};
    line-height: ${theme.typography['16Bold'].lineHeight};
    font-weight: ${theme.typography['16Bold'].fontWeight};
    color: ${rankColor};
    text-align: center;
  `;
};

const avatarStyle = (theme: Theme) => css`
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: ${theme.colors.surface.default};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

const avatarImageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const avatarTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.primary.dark};
`;

const nameBlockStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const memberNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.strong};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const meBadgeStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.primary.main};
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.primary.main};
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
`;

const xpBlockStyle = css`
  display: flex;
  justify-content: flex-end;
`;

const xpValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  color: ${theme.colors.text.weak};
`;

const stateCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  color: ${theme.colors.text.weak};
`;
