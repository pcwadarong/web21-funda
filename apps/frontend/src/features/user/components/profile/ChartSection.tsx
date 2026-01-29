import { css, useTheme } from '@emotion/react';

import type { Theme } from '@/styles/theme';

/**
 * 차트 섹션 Props
 */
interface ChartSectionProps {
  /** 시작 날짜 텍스트 */
  startDate?: string;
  /** 종료 날짜 텍스트 */
  endDate?: string;
  /** 차트 설명 텍스트 */
  caption?: string;
}

/**
 * 차트 섹션 (Placeholder)
 *
 * 학습 시간을 차트 형태로 표시하는 섹션입니다.
 * 현재는 디자인 규격에 맞는 placeholder만 구현되어 있습니다.
 */
export const ChartSection = ({
  startDate = '2025.12.21',
  endDate = '2025.12.21',
  caption = '최근 한 주, 하루 평균 학습 시간은 n분 n초예요.',
}: ChartSectionProps) => {
  const theme = useTheme();

  return (
    <section css={cardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>학습 시간</h2>
      <p css={chartCaptionStyle(theme)}>{caption}</p>
      <div css={chartPlaceholderStyle(theme)} />
      <div css={chartAxisStyle(theme)}>
        <span>{startDate}</span>
        <span>{endDate}</span>
      </div>
    </section>
  );
};

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

const chartCaptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.text.light};
  margin: 0;
`;

const chartPlaceholderStyle = (theme: Theme) => css`
  height: 8.75rem;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
`;

const chartAxisStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;
