import { css, useTheme } from '@emotion/react';
import { memo } from 'react';

import SVGIcon from '@/comp/SVGIcon';
import type { ProfileSummaryResult } from '@/features/profile/types';
import type { Theme } from '@/styles/theme';

/**
 * 통계 아이템 설정 타입
 */
interface StatItemConfig {
  /** 아이콘 이름 */
  icon: 'CheckCircle' | 'Sheet' | 'Streak';
  /** 라벨 텍스트 */
  label: string;
  /** 값 텍스트 */
  getValue: (summary: ProfileSummaryResult | null) => string;
}

/**
 * 통계 섹션 Props
 */
interface StatsSectionProps {
  /** 프로필 요약 정보 */
  profileSummary: ProfileSummaryResult | null;
  /** 사용자 표시 이름 */
  displayName: string;
}

/**
 * 통계 아이템 설정 배열 (상수)
 */
const STATS_CONFIG: StatItemConfig[] = [
  {
    icon: 'CheckCircle',
    label: '총 학습 시간',
    getValue: summary => (summary ? `${summary.totalStudyTimeMinutes} min` : '-'),
  },
  {
    icon: 'Sheet',
    label: '총 문제 수',
    getValue: summary => (summary ? `${summary.solvedQuizzesCount}` : '-'),
  },
  {
    icon: 'Streak',
    label: '연속 학습일수',
    getValue: summary => (summary ? `${summary.currentStreak} days` : '-'),
  },
];

/**
 * 통계 섹션
 *
 * 사용자의 학습 통계(총 학습 시간, 총 문제 수, 연속 학습일수)를 아이콘과 함께 표시합니다.
 *
 * React.memo로 메모이제이션되어 props가 변경되지 않으면 리렌더링되지 않습니다.
 */
export const StatsSection = memo(({ profileSummary, displayName }: StatsSectionProps) => {
  const theme = useTheme();

  return (
    <section css={cardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>{displayName}의 통계</h2>
      <div css={statListStyle}>
        {STATS_CONFIG.map((stat, index) => (
          <div key={index} css={statItemStyle(theme)}>
            <SVGIcon icon={stat.icon} />
            <div>
              <span css={statLabelStyle(theme)}>{stat.label}</span>
              <p css={statValueStyle(theme)}>{stat.getValue(profileSummary)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';

const cardStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 1.25rem 1.5rem;
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const sectionTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.primary.main};
`;

const statListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const statItemStyle = (theme: Theme) => css`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem 0.875rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.primary.surface};
`;

const statLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  display: block;
  margin-bottom: 0.25rem;
`;

const statValueStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  color: ${theme.colors.text.default};
  margin: 0;
`;
