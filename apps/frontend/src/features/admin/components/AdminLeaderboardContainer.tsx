import { css, keyframes, type Theme, useTheme } from '@emotion/react';
import type { FormEvent } from 'react';

import SVGIcon from '@/comp/SVGIcon';
import { Loading } from '@/components/Loading';
import { InfoLeaderBoardModal } from '@/feat/leaderboard/components/InfoLeaderBoardModal';
import { LeaderboardStateMessage } from '@/feat/leaderboard/components/LeaderboardStateMessage';
import { MemberList } from '@/feat/leaderboard/components/MemberList';
import type { WeeklyRankingResult } from '@/feat/leaderboard/types';
import { buildRemainingDaysText, groupMembersByZone } from '@/feat/leaderboard/utils';
import { useModal } from '@/store/modalStore';
import { colors } from '@/styles/token';

interface AdminLeaderboardFilters {
  tierName: string;
  groupIndex: string;
}

interface AdminLeaderboardContainerProps {
  weeklyRanking: WeeklyRankingResult | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  filters: AdminLeaderboardFilters;
  onFilterChange: (field: keyof AdminLeaderboardFilters, value: string) => void;
  onApplyFilters: () => void;
  formError: string | null;
  hasAppliedFilters: boolean;
}

export const AdminLeaderboardContainer = ({
  weeklyRanking,
  isLoading,
  errorMessage,
  onRefresh,
  isRefreshing = false,
  filters,
  onFilterChange,
  onApplyFilters,
  formError,
  hasAppliedFilters,
}: AdminLeaderboardContainerProps) => {
  const theme = useTheme();
  const { openModal } = useModal();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApplyFilters();
  };

  let stateType: 'error' | 'empty' | 'normal' = 'normal';
  let stateMessage: string | undefined;

  if (errorMessage) {
    stateType = 'error';
    stateMessage = errorMessage;
  } else if (!weeklyRanking) {
    stateType = 'empty';
    stateMessage = hasAppliedFilters
      ? '랭킹 데이터를 찾지 못했습니다.'
      : '티어/그룹을 선택하고 조회하세요.';
  } else if (weeklyRanking.totalMembers === 0) {
    stateType = 'empty';
    stateMessage = '해당 그룹에 랭킹 데이터가 없습니다.';
  } else {
    stateType = 'normal';
  }

  const leagueTitle = weeklyRanking ? `${weeklyRanking.tier.name} 리그` : '';
  const groupedMembers = weeklyRanking ? groupMembersByZone(weeklyRanking.members) : null;
  const remainingDaysText = weeklyRanking ? buildRemainingDaysText(weeklyRanking.weekKey) : '';
  const tierOptions = buildTierOptions();
  const groupOptions = buildGroupOptions();

  return (
    <div css={pageContentStyle}>
      <form css={filterCardStyle(theme)} onSubmit={handleSubmit}>
        <div css={filterGridStyle}>
          <label css={filterLabelStyle(theme)} htmlFor="admin-ranking-tier">
            <span>티어</span>
            <select
              id="admin-ranking-tier"
              value={filters.tierName}
              onChange={event => onFilterChange('tierName', event.target.value)}
              css={filterSelectStyle(theme)}
            >
              <option value="">선택</option>
              {tierOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label css={filterLabelStyle(theme)} htmlFor="admin-ranking-group">
            <span>그룹 번호</span>
            <select
              id="admin-ranking-group"
              value={filters.groupIndex}
              onChange={event => onFilterChange('groupIndex', event.target.value)}
              css={filterSelectStyle(theme)}
            >
              <option value="">선택</option>
              {groupOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div css={filterActionsStyle}>
          {formError && <p css={formErrorStyle(theme)}>{formError}</p>}
          {onRefresh && stateType === 'normal' && (
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
          <button css={filterSubmitStyle(theme)} type="submit" disabled={isLoading}>
            조회
          </button>
        </div>
      </form>

      {isLoading ? (
        <Loading text="랭킹 정보를 불러오는 중입니다." />
      ) : stateType !== 'normal' ? (
        <LeaderboardStateMessage state={stateType} message={stateMessage} />
      ) : (
        <>
          <section css={summaryCardStyle(theme)} data-section="summary">
            <div>
              <div css={summaryMainStyle}>
                <h2 css={summaryTitleStyle(theme)}>{leagueTitle}</h2>
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
              </div>
              <p css={summarySubTextStyle(theme)}>
                {weeklyRanking!.weekKey}주차 · 그룹 {weeklyRanking!.groupIndex} · 총{' '}
                {weeklyRanking!.totalMembers}명
              </p>
            </div>
            <div css={summaryRightStyle(theme)}>{remainingDaysText}</div>
          </section>

          <section css={leaderboardCardStyle(theme)} data-section="ranking">
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
          </section>
        </>
      )}
    </div>
  );
};

const pageContentStyle = css`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const filterCardStyle = (theme: Theme) => css`
  padding: 20px;
  border-radius: ${theme.borderRadius.large};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.strong};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const filterGridStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
`;

const filterLabelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.default};
`;

const filterInputStyle = (theme: Theme) => css`
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${theme.colors.primary.light};
  }
`;

const filterSelectStyle = (theme: Theme) => css`
  ${filterInputStyle(theme)};
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, ${theme.colors.text.weak} 50%),
    linear-gradient(135deg, ${theme.colors.text.weak} 50%, transparent 50%),
    linear-gradient(to right, ${theme.colors.border.default}, ${theme.colors.border.default});
  background-position:
    calc(100% - 18px) calc(50% - 2px),
    calc(100% - 12px) calc(50% - 2px),
    calc(100% - 2.2rem) 50%;
  background-size:
    6px 6px,
    6px 6px,
    1px 60%;
  background-repeat: no-repeat;
  padding-right: 2.4rem;
`;

const filterActionsStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const formErrorStyle = (theme: Theme) => css`
  color: ${theme.colors.error.main};
  font-size: ${theme.typography['16Medium'].fontSize};
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
  margin-left: auto;

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

const filterSubmitStyle = (theme: Theme) => css`
  padding: 10px 20px;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.main};
  color: ${colors.light.grayscale[50]};
  font-size: ${theme.typography['16Bold'].fontSize};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
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

const buildTierOptions = () => [
  { value: 'BRONZE', label: 'BRONZE' },
  { value: 'SILVER', label: 'SILVER' },
  { value: 'GOLD', label: 'GOLD' },
  { value: 'SAPPHIRE', label: 'SAPPHIRE' },
  { value: 'RUBY', label: 'RUBY' },
  { value: 'MASTER', label: 'MASTER' },
];

const buildGroupOptions = () => {
  const options: Array<{ value: string; label: string }> = [];

  for (let index = 1; index <= 20; index += 1) {
    options.push({ value: String(index), label: String(index) });
  }

  return options;
};
