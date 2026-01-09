import { css, useTheme } from '@emotion/react';
import { Link } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import { useStorage } from '@/hooks/useStorage';
import type { Theme } from '@/styles/theme';

// TODO: 유저 정보 수정
const USER_STATS = {
  learningDays: 4,
  diamond: 0,
  field: 'FE',
  streak: 5,
  wrongAnswers: 5,
} as const;

// TODO: 오늘의 목표 추가
const TODAY_GOALS = [
  { id: 'xp', label: '10 XP 획득하기', current: 20, target: 50 },
  { id: 'lessons', label: '2개의 완벽한 레슨 끝내기', current: 2, target: 2 },
] as const;

const isLoggedIn = false; // TODO: 추후 실제 로그인 상태로 변경 필요

export const LearnRightSidebar = () => {
  const theme = useTheme();
  const { progress, uiState } = useStorage();
  const heartCount = isLoggedIn ? USER_STATS.learningDays : progress.heart;

  return (
    <aside css={rightSectionStyle}>
      <div css={statsContainerStyle}>
        <Link to="/learn/select-field" css={rightSidebarLinkStyle}>
          <div css={statContainerStyle}>
            <span css={statIconStyle}>
              {/* TODO: 각 field의 해당하는 SVG 아이콘으로 반영되도록 변경 필요 */}
              <SVGIcon icon="Frontend" size="md" />
            </span>
            <span css={statValueStyle(theme)}>{uiState.last_viewed.field_slug.toUpperCase()}</span>
          </div>
        </Link>
        {isLoggedIn && (
          <>
            <div css={statContainerStyle}>
              <span css={statIconStyle}>
                <SVGIcon icon="Diamond" size="md" />
              </span>
              <span css={statValueStyle(theme)}>{USER_STATS.diamond}</span>
            </div>
            <div css={statContainerStyle}>
              <span css={statIconStyle}>
                <SVGIcon icon="Streak" size="md" />
              </span>
              <span css={statValueStyle(theme)}>{USER_STATS.streak}</span>
            </div>
          </>
        )}

        <div css={statContainerStyle}>
          <span css={statIconStyle}>
            <SVGIcon icon="Heart" size="lg" />
          </span>
          <span css={statValueStyle(theme)}>{heartCount}</span>
        </div>
      </div>

      <div css={cardStyle(theme)}>
        <div css={cardHeaderStyle}>
          <span css={cardIconStyle}>
            <SVGIcon icon="Book" size="md" />
          </span>
          <span css={cardTitleStyle(theme)}>오답 노트</span>
        </div>
        {isLoggedIn ? (
          <button css={reviewBadgeStyle(theme)}>{USER_STATS.wrongAnswers}개 문제 복습 필요</button>
        ) : (
          <Link to="/login" css={rightSidebarLinkStyle}>
            <div css={reviewBadgeStyle(theme)}>로그인 후 문제를 복습해보세요!</div>
          </Link>
        )}
      </div>

      <div css={cardStyle(theme)}>
        <div css={cardHeaderStyle}>
          <span css={cardIconStyle}>
            <SVGIcon icon="Fire" size="md" />
          </span>
          <span css={cardTitleStyle(theme)}>오늘의 목표</span>
        </div>
        {isLoggedIn ? (
          <div css={goalsContentStyle}>
            {TODAY_GOALS.map(goal => (
              <div key={goal.id} css={goalItemStyle}>
                <div css={goalLabelContainerStyle}>
                  <span css={goalLabelStyle(theme)}>{goal.label}</span>
                  <span css={goalProgressStyle(theme)}>
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <div css={progressBarContainerStyle(theme)}>
                  <div css={progressBarStyle(theme, (goal.current / goal.target) * 100)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Link to="/login" css={rightSidebarLinkStyle}>
            <div css={reviewBadgeStyle(theme)}>로그인 후 진도를 저장해보세요!</div>
          </Link>
        )}
      </div>
    </aside>
  );
};

const rightSectionStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 320px;
  min-width: 320px;
  overflow-y: auto;
  padding-right: 8px;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const statsContainerStyle = css`
  display: flex;
  align-items: center;
  justify-content: ${isLoggedIn ? 'space-between' : 'normal'};
  gap: 8px;
`;

const statContainerStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: ${theme.borderRadius.small};

  &:hover {
    background: ${theme.colors.surface.bold};
  }
`;

const statIconStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const rightSidebarLinkStyle = css`
  text-decoration: none;
  color: inherit;
`;

const statValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.default};
  margin-right: 8px;
`;

const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
`;

const cardHeaderStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const cardIconStyle = css`
  display: flex;
  align-items: center;
  font-size: 20px;
`;

const cardTitleStyle = (theme: Theme) => css`
  flex: 1;
  font-size: ${theme.typography['16Bold'].fontSize};
  line-height: ${theme.typography['16Bold'].lineHeight};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const reviewBadgeStyle = (theme: Theme) => css`
  padding: 12px 16px;
  background: ${theme.colors.primary.surface};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  text-align: center;
`;

const goalsContentStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const goalItemStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const goalLabelContainerStyle = css`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const goalLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;

const goalProgressStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const progressBarContainerStyle = (theme: Theme) => css`
  width: 100%;
  height: 8px;
  background: ${theme.colors.surface.default};
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
`;

const progressBarStyle = (theme: Theme, percentage: number) => css`
  width: ${percentage}%;
  height: 100%;
  background: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.small};
  transition: width 150ms ease;
`;
