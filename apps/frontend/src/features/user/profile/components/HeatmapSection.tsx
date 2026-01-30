import { css, useTheme } from '@emotion/react';
import { memo } from 'react';

import type { Theme } from '@/styles/theme';

/**
 * 히트맵 섹션 Props
 */
interface HeatmapSectionProps {
  /** 표시할 주 수 (기본값: 12주 = 84일) */
  weeks?: number;
}

/**
 * 히트맵 섹션 (Placeholder)
 *
 * 연간 학습 활동을 히트맵 형태로 표시하는 섹션입니다.
 * 현재는 디자인 규격에 맞는 placeholder만 구현되어 있습니다.
 */
export const HeatmapSection = memo(({ weeks = 12 }: HeatmapSectionProps) => {
  const theme = useTheme();
  const totalDays = weeks * 7; // 12주 = 84일

  return (
    <section css={cardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>연간 학습</h2>
      <div css={heatmapStyle}>
        {Array.from({ length: totalDays }).map((_, index) => (
          <span key={index} css={heatmapCellStyle(theme)} />
        ))}
      </div>
    </section>
  );
});

HeatmapSection.displayName = 'HeatmapSection';

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

const heatmapStyle = css`
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  gap: 0.375rem;
`;

const heatmapCellStyle = (theme: Theme) => css`
  width: 100%;
  padding-top: 100%;
  border-radius: 0.375rem;
  background: ${theme.colors.surface.bold};
`;
