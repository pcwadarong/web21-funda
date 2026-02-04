import { css, keyframes, type Theme, useTheme } from '@emotion/react';
import { useState } from 'react';

import SVGIcon from '@/comp/SVGIcon';
import { Loading } from '@/components/Loading';
import { InfoLeaderBoardModal } from '@/feat/leaderboard/components/InfoLeaderBoardModal';
import { LeaderboardStateMessage } from '@/feat/leaderboard/components/LeaderboardStateMessage';
import { MemberList } from '@/feat/leaderboard/components/MemberList';
import type { OverallRankingResult, WeeklyRankingResult } from '@/feat/leaderboard/types';
import { buildRemainingDaysText, groupMembersByZone } from '@/feat/leaderboard/utils';
import { useModal } from '@/store/modalStore';
import { colors } from '@/styles/token';
import { getTierIconName } from '@/utils/tier';

interface LeaderboardContainerProps {
  weeklyRanking: WeeklyRankingResult | null;
  overallRanking: OverallRankingResult | null;
  isWeeklyLoading: boolean;
  isOverallLoading: boolean;
  weeklyErrorMessage: string | null;
  overallErrorMessage: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

type LeaderboardView = 'MY_LEAGUE' | 'OVERALL';

export const LeaderboardContainer = ({
  weeklyRanking,
  overallRanking,
  isWeeklyLoading,
  isOverallLoading,
  weeklyErrorMessage,
  overallErrorMessage,
  onRefresh,
  isRefreshing = false,
}: LeaderboardContainerProps) => {
  const theme = useTheme();
  const { openModal } = useModal();
  const [activeLeaderboardView, setActiveLeaderboardView] = useState<LeaderboardView>('MY_LEAGUE');

  const isMyLeagueView = activeLeaderboardView === 'MY_LEAGUE';
  const isOverallView = activeLeaderboardView === 'OVERALL';

  let indicatorTranslateX = '0%';
  if (isOverallView) {
    indicatorTranslateX = '100%';
  }

  const handleSelectMyLeague = () => {
    setActiveLeaderboardView('MY_LEAGUE');
  };

  const handleSelectOverall = () => {
    setActiveLeaderboardView('OVERALL');
  };

  const activeErrorMessage = isMyLeagueView ? weeklyErrorMessage : overallErrorMessage;
  const activeRanking = isMyLeagueView ? weeklyRanking : overallRanking;
  const isLoading = isMyLeagueView ? isWeeklyLoading : isOverallLoading;

  // 상태 결정
  let stateType: 'error' | 'empty' | 'unassigned' | 'normal' = 'normal';
  let stateMessage: string | undefined;

  if (activeErrorMessage) {
    stateType = 'error';
    stateMessage = activeErrorMessage;
  } else if (!activeRanking) {
    stateType = 'empty';
  } else if (isMyLeagueView && weeklyRanking?.groupIndex === null) {
    stateType = 'unassigned';
  } else {
    stateType = 'normal';
  }

  const leagueTitle = isMyLeagueView
    ? weeklyRanking && weeklyRanking.groupIndex !== null
      ? `${weeklyRanking.tier.name} 리그`
      : ''
    : '전체 순위';

  const tierIconName =
    isMyLeagueView && weeklyRanking?.tier ? getTierIconName(weeklyRanking.tier.name) : null;
  const groupedMembers =
    weeklyRanking && isMyLeagueView ? groupMembersByZone(weeklyRanking.members) : null;
  const remainingDaysText = activeRanking ? buildRemainingDaysText(activeRanking.weekKey) : '';
  const summaryDetailText = activeRanking
    ? isMyLeagueView
      ? `${activeRanking.weekKey}주차 · 그룹 ${weeklyRanking!.groupIndex} · 총 ${activeRanking.totalMembers}명`
      : `${activeRanking.weekKey}주차 · 총 ${activeRanking.totalMembers}명`
    : '';
  const overallMembers = [...(overallRanking?.members ?? [])]
    .sort((left, right) => {
      const leftTierOrderIndex = left.tierOrderIndex ?? 0;
      const rightTierOrderIndex = right.tierOrderIndex ?? 0;

      if (leftTierOrderIndex !== rightTierOrderIndex) {
        return rightTierOrderIndex - leftTierOrderIndex;
      }

      if (left.xp !== right.xp) {
        return right.xp - left.xp;
      }

      return left.userId - right.userId;
    })
    .map((member, index) => ({
      ...member,
      rank: index + 1,
    }));

  return (
    <main css={pageStyle}>
      <div css={pageContentStyle}>
        <header css={headerStyle}>
          <h1 css={pageTitleStyle(theme)}>LEADERBOARD</h1>
          {onRefresh && (
            <button
              css={refreshButtonStyle(theme, isRefreshing)}
              onClick={onRefresh}
              type="button"
              disabled={isRefreshing}
              aria-label="리더보드 새로고침"
            >
              <SVGIcon icon="Refresh" size="sm" />
            </button>
          )}
        </header>

        <section aria-label="랭킹 보기 전환">
          <div css={leaderboardSwitchRailStyle(theme)}>
            <div css={leaderboardSwitchStyle(theme, indicatorTranslateX)} role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={isMyLeagueView}
                onClick={handleSelectMyLeague}
                css={leaderboardSwitchButtonStyle(theme, isMyLeagueView)}
              >
                나의 리그
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isOverallView}
                onClick={handleSelectOverall}
                css={leaderboardSwitchButtonStyle(theme, isOverallView)}
              >
                전체 순위
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <Loading text="랭킹 정보를 불러오는 중입니다." />
        ) : stateType !== 'normal' ? (
          <LeaderboardStateMessage state={stateType} message={stateMessage} />
        ) : (
          <>
            <section css={summaryCardStyle(theme)} data-section="summary">
              <div>
                <div css={summaryMainStyle}>
                  {tierIconName && (
                    <span css={summaryTierIconStyle}>
                      <SVGIcon icon={tierIconName} size="lg" />
                    </span>
                  )}
                  <h2 css={summaryTitleStyle(theme)}>{leagueTitle}</h2>
                  {isMyLeagueView && (
                    <button
                      type="button"
                      aria-label="리더보드 안내 열기"
                      css={infoButtonStyle(theme)}
                      onClick={() =>
                        openModal('리더보드란?', <InfoLeaderBoardModal />, {
                          maxWidth: 880,
                        })
                      }
                    >
                      <span>?</span>
                    </button>
                  )}
                </div>
                <p css={summarySubTextStyle(theme)}>{summaryDetailText}</p>
              </div>
              <div css={summaryRightStyle(theme)}>{remainingDaysText}</div>
            </section>

            <section css={leaderboardCardStyle(theme)} data-section="ranking">
              {isMyLeagueView ? (
                <>
                  {weeklyRanking!.tier.name !== 'MASTER' && (
                    <div css={zoneSectionStyle}>
                      <MemberList members={groupedMembers!.promotion} />
                      <div css={zoneHeaderStyle(theme, 'PROMOTION')}>
                        <SVGIcon
                          style={{ transform: 'rotate(90deg)', color: theme.colors.success.main }}
                          icon="ArrowLeft"
                          size="sm"
                        />
                        <span>승급권</span>
                      </div>
                    </div>
                  )}
                  <div css={zoneSectionStyle}>
                    <MemberList members={groupedMembers!.maintain} />
                  </div>
                  {/* BRONZE가 아닐 때만 강등권 표시 */}
                  {weeklyRanking!.tier.name !== 'BRONZE' && (
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
                  )}
                </>
              ) : (
                <div css={zoneSectionStyle}>
                  <MemberList
                    members={overallMembers}
                    emptyMessage="이번 주 랭킹에 인원이 없습니다."
                    showRankZoneIcon={false}
                    xpLabel="XP"
                  />
                </div>
              )}
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

const refreshButtonStyle = (theme: Theme, isRefreshing: boolean) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.medium};
  transition: background-color 150ms ease;

  ${isRefreshing &&
  css`
    animation: ${keyframes`
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `} 1s linear infinite;
  `}

  &:hover {
    background: ${isRefreshing ? 'transparent' : theme.colors.surface.bold};
  }
`;

const summaryCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  background: linear-gradient(180deg, #6559ea 0%, #8b82ff 100%);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  color: ${colors.light.grayscale[50]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const summaryMainStyle = css`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const summaryTierIconStyle = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  transform: translateY(-4px);
`;

const summaryTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  margin-bottom: 0.5rem;
`;

const infoButtonStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
  padding: 0.5rem;
  margin: -0.5rem;

  span {
    display: inline-block;
    background: ${theme.colors.grayscale[200]};
    width: 24px;
    border-radius: 100px;
    margin-bottom: 6px;
    font-weight: bold;
    padding-bottom: 2px;
  }
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

const leaderboardSwitchRailStyle = (theme: Theme) => css`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const leaderboardSwitchStyle = (theme: Theme, indicatorTranslateX: string) => css`
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  width: min(260px, 100%);
  padding-bottom: 4px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 50%;
    height: 2px;
    background: ${theme.colors.primary.main};
    transform: translateX(${indicatorTranslateX});
    transition: transform 200ms ease;
  }
`;

const leaderboardSwitchButtonStyle = (theme: Theme, isActive: boolean) => css`
  border: none;
  background: transparent;
  padding: 6px 0 10px;
  font-size: ${theme.typography['14Medium'].fontSize};
  line-height: ${theme.typography['14Medium'].lineHeight};
  font-weight: ${theme.typography['14Medium'].fontWeight};
  color: ${isActive ? theme.colors.primary.main : theme.colors.text.light};
  cursor: pointer;
  transition: color 200ms ease;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.main};
    outline-offset: 2px;
  }
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
