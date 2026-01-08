import { css, useTheme } from '@emotion/react';

import SVGIcon from '@/comp/SVGIcon';
import type { RoadmapUnit, UnitStatus, UnitVariant } from '@/feat/roadmap/types';
import type { Theme } from '@/styles/theme';

/**
 * 유닛 카드 컴포넌트 Props
 */
interface UnitCardProps {
  /** 유닛 데이터 */
  unit: RoadmapUnit;
  /** 로그인 여부 (비로그인 시 상태/배지/진행률을 숨김) */
  isLoggedIn: boolean;
  /** 카드 클릭 핸들러 (있을 때만 인터랙션 활성화) */
  onClick?: () => void;
}

/**
 * 로드맵 유닛 카드
 * - 상태(완료/학습중/기본)에 따라 배지/보더 컬러를 변경합니다.
 * - 로그인 상태에서만 진행률/정답률을 표시합니다.
 */
export const UnitCard = ({ unit, isLoggedIn, onClick }: UnitCardProps) => {
  const theme = useTheme();
  /**
   * 비로그인 시 상태를 normal로 고정해 UI를 단순화합니다.
   */
  const effectiveStatus: UnitStatus = isLoggedIn ? (unit.status ?? 'normal') : 'normal';
  /**
   * 유닛 카드 표시 타입 (full: 진행률/정답률 포함)
   */
  const effectiveVariant: UnitVariant = unit.variant ?? 'compact';
  /**
   * 진행률/정답률 기본값 처리
   */
  const progressValue = unit.progress ?? 0;
  const scoreValue = unit.score ?? 0;
  /**
   * 클릭 핸들러가 있을 때만 인터랙션 스타일/키보드 접근성 활성화
   */
  const isInteractive = Boolean(onClick);

  return (
    <article
      css={cardStyle(theme, effectiveStatus, isInteractive)}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <header css={cardHeaderStyle(effectiveVariant)}>
        <div>
          <h3 css={cardTitleStyle(theme)}>{unit.title}</h3>
          <p css={cardDescriptionStyle(theme)}>{unit.description}</p>
        </div>
        {effectiveStatus !== 'normal' && (
          <div css={statusBadgeStyle(theme, effectiveStatus)}>
            {effectiveStatus === 'completed' && <SVGIcon icon="Check" size="xs" />}
            {effectiveStatus === 'active' && <SVGIcon icon="Start" size="xs" />}
            <span>{getStatusLabel(effectiveStatus)}</span>
          </div>
        )}
      </header>
      {isLoggedIn && effectiveVariant === 'full' && (
        <>
          <div css={dividerStyle(theme)} />
          <div css={progressBlockStyle}>
            <div css={progressInfoRowStyle(theme)}>
              <div css={progressLabelWrapStyle}>
                <div css={progressLabelGroupStyle}>
                  <span>진행률</span>
                  <span css={progressValueStyle(theme, effectiveStatus)}>{progressValue}%</span>
                </div>
              </div>
              <span css={scoreTitleStyle}>정답률</span>
            </div>
            <div css={progressRowStyle}>
              <div css={progressTrackStyle(theme)}>
                <span css={progressFillStyle(theme, effectiveStatus, progressValue)} />
              </div>
              <span css={scoreBadgeStyle(theme, effectiveStatus)}>{scoreValue}%</span>
            </div>
          </div>
        </>
      )}
    </article>
  );
};

const cardStyle = (theme: Theme, status: UnitStatus, isInteractive: boolean) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.medium};
  border: 2px solid ${getStatusBorderColor(theme, status)};
  box-shadow: 0 18px 40px rgba(20, 20, 43, 0.08);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 150ms ease;

  ${isInteractive &&
  css`
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary.main};
      outline-offset: 3px;
    }
  `}
`;

const cardHeaderStyle = (variant: UnitVariant) => css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-direction: ${variant === 'compact' ? 'column' : 'row'};
`;

const cardTitleStyle = (theme: Theme) => css`
  margin: 0 0 6px;
  font-size: ${theme.typography['16Bold'].fontSize};
  line-height: ${theme.typography['16Bold'].lineHeight};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.strong};
`;

const cardDescriptionStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const statusBadgeStyle = (theme: Theme, status: UnitStatus) => css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: ${theme.borderRadius.large};
  background: ${getStatusBadgeBackground(theme, status)};
  color: ${getStatusBadgeText(theme, status)};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  white-space: nowrap;
`;

const dividerStyle = (theme: Theme) => css`
  height: 1px;
  background: ${theme.colors.border.default};
  opacity: 0.7;
`;

const progressBlockStyle = css`
  position: relative;
  padding-top: 18px;
`;

const progressInfoRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 44px;
  align-items: center;
  gap: 12px;
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const progressLabelWrapStyle = css`
  position: relative;
  width: 100%;
  height: 0;
`;

const progressLabelGroupStyle = css`
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const progressValueStyle = (theme: Theme, status: UnitStatus) => css`
  color: ${getStatusAccentColor(theme, status)};
`;

const progressRowStyle = css`
  display: grid;
  grid-template-columns: 1fr 44px;
  align-items: center;
  gap: 12px;
`;

const progressTrackStyle = (theme: Theme) => css`
  position: relative;
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: ${theme.colors.surface.bold};
  overflow: hidden;
`;

const progressFillStyle = (theme: Theme, status: UnitStatus, progress: number) => css`
  position: absolute;
  inset: 0;
  width: ${progress}%;
  background: ${getStatusAccentColor(theme, status)};
  border-radius: inherit;
`;

const scoreTitleStyle = css`
  position: absolute;
  top: -3px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const scoreBadgeStyle = (theme: Theme, status: UnitStatus) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 10px 10px;
  border-radius: 50%;
  background: ${getStatusAccentColor(theme, status)};
  color: ${theme.colors.surface.strong};
  font-size: ${theme.typography['12Bold'].fontSize};
  line-height: ${theme.typography['12Bold'].lineHeight};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const getStatusLabel = (status: UnitStatus) => {
  switch (status) {
    case 'completed':
      return '완료';
    case 'active':
      return '학습 중';
    default:
      return '';
  }
};

const getStatusAccentColor = (theme: Theme, status: UnitStatus) => {
  if (status === 'completed') {
    return theme.colors.success.main;
  }
  if (status === 'active') {
    return theme.colors.primary.main;
  }
  return theme.colors.border.default;
};

const getStatusBorderColor = (theme: Theme, status: UnitStatus) => {
  if (status === 'completed') {
    return theme.colors.success.main;
  }
  if (status === 'active') {
    return theme.colors.primary.main;
  }
  return theme.colors.border.default;
};

const getStatusBadgeBackground = (theme: Theme, status: UnitStatus) => {
  if (status === 'completed') {
    return theme.colors.success.light;
  }
  if (status === 'active') {
    return theme.colors.primary.surface;
  }
  return theme.colors.surface.bold;
};

const getStatusBadgeText = (theme: Theme, status: UnitStatus) => {
  if (status === 'normal') {
    return theme.colors.text.weak;
  }
  return theme.colors.text.strong;
};
