import { css, useTheme } from '@emotion/react';
import { memo, useMemo, useState, useRef } from 'react';
import { formatDate } from '@/utils/formatDate';
import { Popover } from '@/components/Popover';
import type { ProfileStreakDay } from '@/feat/user/profile/types';
import type { Theme } from '@/styles/theme';

/**
 * 히트맵 섹션 Props
 */
interface HeatmapSectionProps {
  /** 표시할 월 수 (기본값: 12개월) */
  months?: number;
  /** 스트릭 데이터 */
  streaks?: ProfileStreakDay[];
}

/**
 * 히트맵 섹션 (Placeholder)
 *
 * 연간 학습 활동을 히트맵 형태로 표시하는 섹션입니다.
 */
const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const msPerDay = 24 * 60 * 60 * 1000;
const formatDateKeyUtc = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;

const normalizeDateKey = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }
  return formatDateKeyUtc(parsed);
};

const resolveLevel = (count: number) => {
  if (count <= 0) return 0;
  if (count <= 5) return 1;
  if (count <= 10) return 2;
  if (count <= 15) return 3;
  return 4;
};

interface HoveredCell {
  date: Date;
  solvedCount: number;
  x: number;
  y: number;
}

export const HeatmapSection = memo(({ months = 12, streaks = [] }: HeatmapSectionProps) => {
  const theme = useTheme();
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const year = useMemo(() => {
    if (streaks.length === 0) {
      return new Date().getFullYear();
    }
    const parsedYear = Number(streaks[0]?.date?.slice(0, 4));
    return Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
  }, [streaks]);

  const streakMap = useMemo(() => {
    const map = new Map<string, number>();
    streaks.forEach(item => {
      map.set(normalizeDateKey(item.date), item.solvedCount);
    });
    return map;
  }, [streaks]);

  const startOfYear = useMemo(() => new Date(Date.UTC(year, 0, 1)), [year]);
  const endDate = useMemo(() => new Date(Date.UTC(year, months, 0)), [year, months]);
  const totalDays = useMemo(
    () => Math.floor((endDate.getTime() - startOfYear.getTime()) / msPerDay) + 1,
    [endDate, startOfYear],
  );
  const firstDayIndex = useMemo(() => new Date(year, 0, 1).getDay(), [year]);
  const totalCells = useMemo(
    () => Math.ceil((totalDays + firstDayIndex) / 7) * 7,
    [firstDayIndex, totalDays],
  );
  const weekColumns = useMemo(() => totalCells / 7, [totalCells]);

  const handleCellMouseEnter = (
    event: React.MouseEvent<HTMLSpanElement>,
    dayDate: Date,
    solvedCount: number,
  ) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setHoveredCell({
        date: dayDate,
        solvedCount,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const handleCellMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <section css={cardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>연간 학습</h2>
      <div css={heatmapContainerStyle} ref={containerRef}>
        <div css={heatmapLayoutStyle}>
          <div>
            <div css={monthLabelRowStyle(weekColumns)}>
              {monthLabels.slice(0, months).map((label, monthIndex) => {
                const dayOffset = (Date.UTC(year, monthIndex, 1) - Date.UTC(year, 0, 1)) / msPerDay;
                const column = Math.floor((firstDayIndex + dayOffset) / 7);
                return (
                  <span key={label} css={monthLabelStyle(theme, column)}>
                    {label}
                  </span>
                );
              })}
            </div>
            <div css={heatmapGridStyle(weekColumns)}>
              {Array.from({ length: totalCells }).map((_, index) => {
                const dayNumber = index - firstDayIndex + 1;
                const isPlaceholder = dayNumber <= 0 || dayNumber > totalDays;
                const dayDate = new Date(startOfYear.getTime() + (dayNumber - 1) * msPerDay);
                const dateKey = isPlaceholder ? '' : formatDateKeyUtc(dayDate);
                const solvedCount = isPlaceholder ? 0 : (streakMap.get(dateKey) ?? 0);
                const level = resolveLevel(solvedCount);

                return (
                  <span
                    key={`cell-${index}`}
                    css={heatmapCellStyle(theme, level, isPlaceholder)}
                    onMouseEnter={e =>
                      !isPlaceholder &&
                      solvedCount > 0 &&
                      handleCellMouseEnter(e, dayDate, solvedCount)
                    }
                    onMouseLeave={handleCellMouseLeave}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div css={legendStyle(theme)}>
          <span>Less</span>
          <div css={legendDotsStyle}>
            {Array.from({ length: 5 }).map((_, index) => (
              <span key={index} css={legendDotStyle(theme, index)} />
            ))}
          </div>
          <span>More</span>
        </div>
        <Popover
          x={hoveredCell?.x ?? 0}
          y={hoveredCell?.y ?? 0}
          isVisible={hoveredCell !== null}
          onMouseEnter={() => hoveredCell && setHoveredCell(hoveredCell)}
          onMouseLeave={handleCellMouseLeave}
        >
          {hoveredCell && (
            <>
              <p>
                {formatDate(hoveredCell.date)} {hoveredCell.solvedCount}개
              </p>
            </>
          )}
        </Popover>
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

const heatmapContainerStyle = css`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const heatmapLayoutStyle = css`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  overflow-x: auto;
`;

const monthLabelRowStyle = (columns: number) => css`
  display: grid;
  grid-template-columns: repeat(${columns}, 0.7rem);
  gap: 0.3rem;
  height: 1rem;
  margin-bottom: 0.4rem;
`;

const monthLabelStyle = (theme: Theme, column: number) => css`
  grid-column: ${column + 1};
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  text-align: left;
  white-space: nowrap;
  word-break: keep-all;
`;

const heatmapGridStyle = (columns: number) => css`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 0.8rem);
  grid-template-columns: repeat(${columns}, 0.7rem);
  gap: 0.3rem;
`;

const heatmapCellStyle = (theme: Theme, level: number, isEmpty = false) => {
  const palette = [
    '#82828d1a',
    theme.colors.primary.surface,
    theme.colors.primary.semilight,
    theme.colors.primary.light,
    theme.colors.primary.main,
  ];

  return css`
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 2px;
    background: ${isEmpty ? '#82828d1a' : palette[level]};
  `;
};

const legendStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const legendDotsStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
`;

const legendDotStyle = (theme: Theme, level: number) => css`
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: ${[
    '#82828d1a',
    theme.colors.primary.surface,
    theme.colors.primary.semilight,
    theme.colors.primary.light,
    theme.colors.primary.main,
  ][level]};
`;
