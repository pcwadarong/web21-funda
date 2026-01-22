import { useTheme } from '@emotion/react';
import { css, type Theme } from '@emotion/react';

import SVGIcon from '@/comp/SVGIcon';
import { Loading } from '@/components/Loading';
import { LeaderboardStateMessage } from '@/feat/leaderboard/components/LeaderboardStateMessage';
import { MemberList } from '@/feat/leaderboard/components/MemberList';
import type { WeeklyRankingResult } from '@/feat/leaderboard/types';
import { buildRemainingDaysText, groupMembersByZone } from '@/feat/leaderboard/utils';

interface LeaderboardContainerProps {
  weeklyRanking: WeeklyRankingResult | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export const LeaderboardContainer = ({
  weeklyRanking,
  isLoading,
  errorMessage,
}: LeaderboardContainerProps) => {
  const theme = useTheme();

  // 상태 결정
  let stateType: 'error' | 'empty' | 'unassigned' | 'normal' = 'normal';
  let stateMessage: string | undefined;

  if (errorMessage) {
    stateType = 'error';
    stateMessage = errorMessage;
  } else if (!weeklyRanking) {
    stateType = 'empty';
  } else if (weeklyRanking.groupIndex === null) {
    stateType = 'unassigned';
  } else {
    stateType = 'normal';
  }

  const leagueTitle =
    weeklyRanking && weeklyRanking.groupIndex !== null ? `${weeklyRanking.tier.name} 리그` : '';
  const groupedMembers = weeklyRanking ? groupMembersByZone(weeklyRanking.members) : null;
  const remainingDaysText = weeklyRanking ? buildRemainingDaysText(weeklyRanking.weekKey) : '';

  return (
    <main css={pageStyle}>
      <div css={pageContentStyle}>
        <header css={headerStyle}>
          <h1 css={pageTitleStyle(theme)}>LEADERBOARD</h1>
        </header>

        {isLoading ? (
          <Loading text="랭킹 정보를 불러오는 중입니다." />
        ) : stateType !== 'normal' ? (
          <LeaderboardStateMessage state={stateType} message={stateMessage} />
        ) : (
          <>
            <section css={summaryCardStyle(theme)} data-section="summary">
              <div css={summaryLeftStyle}>
                <p css={summaryTitleStyle(theme)}>{leagueTitle}</p>
                <p css={summarySubTextStyle(theme)}>
                  {weeklyRanking!.weekKey}주차 · 그룹 {weeklyRanking!.groupIndex} · 총{' '}
                  {weeklyRanking!.totalMembers}명
                </p>
              </div>
              <div css={summaryRightStyle(theme)}>{remainingDaysText}</div>
            </section>

            <section css={leaderboardCardStyle(theme)} data-section="ranking">
              <div css={zoneSectionStyle}>
                <MemberList members={groupedMembers!.promotion} />
              </div>
              <div css={zoneSectionStyle}>
                <div css={zoneHeaderStyle(theme, 'PROMOTION')}>
                  <SVGIcon
                    icon="ArrowLeft"
                    style={{ transform: 'rotate(90deg)', color: theme.colors.success.main }}
                    size="sm"
                  />
                  <span>승급권</span>
                </div>
                <MemberList members={groupedMembers!.maintain} />
              </div>
              <div css={zoneSectionStyle}>
                <div css={zoneHeaderStyle(theme, 'DEMOTION')}>
                  <SVGIcon
                    icon="ArrowLeft"
                    style={{ transform: 'rotate(270deg)', color: theme.colors.error.main }}
                    size="sm"
                  />
                  <span>강등권</span>
                </div>
                <MemberList members={groupedMembers!.demotion} />
              </div>
            </section>
          </>
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
  align-items: flex-end;
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

const summaryCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  background: linear-gradient(180deg, #6559ea 0%, #8b82ff 100%);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  color: ${theme.colors.surface.default};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const summaryLeftStyle = css`
  display: flex;
  flex-direction: column;
`;

const summaryTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  margin-bottom: 0.5rem;
`;

const summarySubTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
`;

const summaryRightStyle = (theme: Theme) => css`
  background: #ffffff33;
  border-radius: ${theme.borderRadius.large};
  padding: 0.5rem 1rem;
`;

const leaderboardCardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const zoneSectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
`;

const zoneHeaderStyle = (theme: Theme, zoneType?: 'PROMOTION' | 'DEMOTION') => css`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  font-size: ${theme.typography['12Bold'].fontSize};
  color: ${zoneType === 'PROMOTION'
    ? theme.colors.success.main
    : zoneType === 'DEMOTION'
      ? theme.colors.error.main
      : theme.colors.text.weak};
  padding: 8px 0;
`;
