import { css, useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';

import { apiFetch } from '@/services/api';
import type { Theme } from '@/styles/theme';

interface TierInfo {
  id: number;
  name: string;
  orderIndex: number;
}

interface RankingMember {
  rank: number;
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  xp: number;
  isMe: boolean;
  rankZone: RankingZone;
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

type RankingZone = 'PROMOTION' | 'MAINTAIN' | 'DEMOTION';

export const Leaderboard = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyRankingResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRankingData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const weeklyResult = await apiFetch.get<WeeklyRankingResult>('/ranking/weekly');

        if (!isMounted) {
          return;
        }

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

  if (!weeklyRanking) {
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

  // 아직 랭킹에 들어가지 않았을 경우 스켈레톤 UI 처리
  const isUnassignedGroup = weeklyRanking.groupIndex === null;

  if (isUnassignedGroup) {
    return (
      <main css={pageStyle}>
        <div css={pageContentStyle}>
          <header css={headerStyle}>
            <div>
              <p css={pageEyebrowStyle(theme)}>Leaderboard</p>
              <h1 css={pageTitleStyle(theme)}>랭킹</h1>
            </div>
          </header>
          <div css={stateCardStyle(theme)}>
            이번 주차에 아직 랭킹이 없습니다. 문제를 풀면 랭킹이 생성됩니다.
          </div>
          <div css={skeletonListStyle}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} css={skeletonRowStyle(theme)} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const leagueTitle = `${weeklyRanking.tier.name} 리그`;
  const groupedMembers = groupMembersByZone(weeklyRanking.members);
  const remainingDaysText = buildRemainingDaysText(weeklyRanking.weekKey);

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
              <span>{remainingDaysText}</span>
            </div>
          </div>
        </section>

        <section css={leaderboardCardStyle(theme)} data-section="ranking">
          <header css={listHeaderStyle}>
            <div>
              <p css={listTitleTextStyle(theme)}>이번 주차 랭킹</p>
            </div>
          </header>

          <div css={zoneSectionStyle}>
            <div css={zoneHeaderStyle(theme)}>승급권</div>
            {renderMemberList(groupedMembers.promotion, theme)}
          </div>
          <div css={zoneSectionStyle}>
            <div css={zoneHeaderStyle(theme)}>유지권</div>
            {renderMemberList(groupedMembers.maintain, theme)}
          </div>
          <div css={zoneSectionStyle}>
            <div css={zoneHeaderStyle(theme)}>강등권</div>
            {renderMemberList(groupedMembers.demotion, theme)}
          </div>
        </section>
      </div>
    </main>
  );
};

const renderMemberList = (members: RankingMember[], theme: Theme) => {
  if (members.length === 0) {
    return <div css={emptyTextStyle(theme)}>해당 구역에 인원이 없습니다.</div>;
  }

  return (
    <ol css={listStyle}>
      {members.map(member => {
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
  );
};

const getAvatarLabel = (displayName: string) => {
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    return '?';
  }

  return trimmedName.slice(0, 2).toUpperCase();
};

/**
 * 승급/유지/강등 구역으로 사용자를 분리한다.
 *
 * @param {RankingMember[]} members - 주간 랭킹 멤버 목록
 * @returns 구역별 멤버 목록
 */
const groupMembersByZone = (members: RankingMember[]) => {
  const grouped = {
    promotion: [] as RankingMember[],
    maintain: [] as RankingMember[],
    demotion: [] as RankingMember[],
  };

  members.forEach(member => {
    if (member.rankZone === 'PROMOTION') {
      grouped.promotion.push(member);
      return;
    }

    if (member.rankZone === 'DEMOTION') {
      grouped.demotion.push(member);
      return;
    }

    grouped.maintain.push(member);
  });

  return grouped;
};

/**
 * 주차 키를 기준으로 종료까지 남은 날짜 문구를 생성한다.
 *
 * @param {string} weekKey - YYYY-WW 형식의 주차 키
 * @returns {string} 남은 날짜 문구
 */
const buildRemainingDaysText = (weekKey: string) => {
  const remainingDays = calculateRemainingDaysFromWeekKey(weekKey);

  if (remainingDays === null) {
    return '종료 정보 없음';
  }

  if (remainingDays <= 0) {
    return '오늘 종료';
  }

  if (remainingDays === 1) {
    return '1일 후 종료';
  }

  return `${remainingDays}일 후 종료`;
};

/**
 * 주차 키를 기준으로 종료까지 남은 날짜를 계산한다.
 * - KST 기준 월요일 00:00 시작, 다음 주 월요일 00:00 종료로 계산한다.
 *
 * @param {string} weekKey - YYYY-WW 형식의 주차 키
 * @returns {number | null} 남은 일수 (계산 불가 시 null)
 */
const calculateRemainingDaysFromWeekKey = (weekKey: string) => {
  const parsedWeekKey = parseWeekKey(weekKey);

  if (!parsedWeekKey) {
    return null;
  }

  const { year, week } = parsedWeekKey;
  const weekStartUtc = getIsoWeekMondayUtc(year, week);
  const weekStartKstUtc = new Date(weekStartUtc.getTime() - KST_OFFSET_MS);
  const weekEndUtcTimestamp = weekStartKstUtc.getTime() + WEEK_MS;
  const nowUtcTimestamp = Date.now();
  const remainingMs = weekEndUtcTimestamp - nowUtcTimestamp;

  if (remainingMs <= 0) {
    return 0;
  }

  const remainingDays = Math.ceil(remainingMs / DAY_MS);

  return remainingDays;
};

/**
 * 주차 키를 연도/주차 정보로 파싱한다.
 *
 * @param {string} weekKey - YYYY-WW 형식의 주차 키
 * @returns {{ year: number; week: number } | null} 파싱 결과
 */
const parseWeekKey = (weekKey: string) => {
  const matchResult = /^(\d{4})-(\d{2})$/.exec(weekKey);

  if (!matchResult) {
    return null;
  }

  const year = Number(matchResult[1]);
  const week = Number(matchResult[2]);

  if (Number.isNaN(year) || Number.isNaN(week)) {
    return null;
  }

  if (week < 1 || week > 53) {
    return null;
  }

  return { year, week };
};

/**
 * ISO 주차 기준으로 월요일 00:00(UTC)을 반환한다.
 *
 * @param {number} year - ISO 연도
 * @param {number} week - ISO 주차
 * @returns {Date} UTC 기준 월요일 00:00
 */
const getIsoWeekMondayUtc = (year: number, week: number) => {
  const jan4Utc = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4Utc.getUTCDay();
  const daysFromMonday = (jan4Day + 6) % 7;
  const week1MondayUtc = new Date(Date.UTC(year, 0, 4 - daysFromMonday));
  const targetWeekOffset = (week - 1) * 7 * DAY_MS;

  return new Date(week1MondayUtc.getTime() + targetWeekOffset);
};

const DAY_MS = 1000 * 60 * 60 * 24;
const WEEK_MS = DAY_MS * 7;
const KST_OFFSET_MS = 1000 * 60 * 60 * 9;

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

const listStyle = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const zoneSectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
`;

const zoneHeaderStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const emptyTextStyle = (theme: Theme) => css`
  padding: 8px 12px;
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.weak};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
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
  color: ${theme.colors.text.default};
`;

const stateCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  color: ${theme.colors.text.weak};
`;

const skeletonListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const skeletonRowStyle = (theme: Theme) => css`
  height: 56px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
`;
