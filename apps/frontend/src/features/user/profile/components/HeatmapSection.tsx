import { css, useTheme } from '@emotion/react';
import { memo, useMemo, useRef, useState } from 'react';

import { Popover } from '@/components/Popover';
import type { ProfileStreakDay } from '@/feat/user/profile/types';
import type { Theme } from '@/styles/theme';
import { formatDateDisplayName, formatDateKeyUtc, normalizeDateKey } from '@/utils/formatDate';

interface HeatmapSectionProps {
  /** 표시할 월 수 (기본값: 12개월) */
  months?: number;
  /** 스트릭 데이터 */
  streaks?: ProfileStreakDay[];
}

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

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const msPerDay = 24 * 60 * 60 * 1000;

/**
 * 문제 풀이 수에 따라 레벨을 결정하는 함수
 * @param count 문제 풀이 수
 * @returns 레벨
 */
const resolveLevel = (count: number) => {
  if (count <= 0) return 0;
  if (count <= 10) return 1;
  if (count <= 30) return 2;
  if (count <= 60) return 3;
  return 4;
};

interface HoveredCell {
  date: Date;
  solvedCount: number;
  x: number;
  y: number;
}

/**
 * 히트맵 섹션 컴포넌트
 * @param months 표시할 월 수 (기본값: 12개월)
 * @param streaks 스트릭 데이터
 * @returns 히트맵 섹션 컴포넌트
 */
export const HeatmapSection = memo(({ months = 12, streaks = [] }: HeatmapSectionProps) => {
  const theme = useTheme();
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 연도 계산
  const year = useMemo(() => {
    if (streaks.length === 0) return new Date().getFullYear();

    // 첫 번째 스트릭 데이터의 연도를 추출
    const parsedYear = Number(streaks[0]?.date?.slice(0, 4));
    return Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
  }, [streaks]);

  // 스트릭 데이터를 맵으로 변환
  const streakMap = useMemo(() => {
    const map = new Map<string, number>();
    streaks.forEach(item => {
      map.set(normalizeDateKey(item.date), item.solvedCount);
    });
    return map;
  }, [streaks]);

  // 연도의 시작 날짜 계산
  const startOfYear = useMemo(() => new Date(Date.UTC(year, 0, 1)), [year]);
  // 연도의 마지막 날짜 계산
  const endDate = useMemo(() => new Date(Date.UTC(year, months, 0)), [year, months]);
  const totalDays = useMemo(
    () => Math.floor((endDate.getTime() - startOfYear.getTime()) / msPerDay) + 1,
    [endDate, startOfYear],
  );
  // 연도의 첫 번째 날짜의 요일 인덱스 계산
  const firstDayIndex = useMemo(() => new Date(year, 0, 1).getDay(), [year]);
  // 총 셀 수 계산
  const totalCells = useMemo(
    () => Math.ceil((totalDays + firstDayIndex) / 7) * 7,
    [firstDayIndex, totalDays],
  );
  // 주 단위 열 수 계산
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
      <div css={heatmapContainerStyle}>
        <div css={heatmapLayoutStyle}>
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
          <div css={heatmapGridContainerStyle}>
            <div css={weekDayLabelRowStyle}>
              {weekDays.map(day => (
                <span key={day} css={weekDayLabelStyle(theme)}>
                  {day}
                </span>
              ))}
            </div>
            <div css={heatmapGridStyle(weekColumns)} ref={containerRef}>
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
                      {formatDateDisplayName(hoveredCell.date)} {hoveredCell.solvedCount}개
                    </p>
                  </>
                )}
              </Popover>
            </div>
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
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const heatmapLayoutStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  overflow-x: auto;
`;

const monthLabelRowStyle = (columns: number) => css`
  display: grid;
  grid-template-columns: repeat(${columns}, 0.7rem);
  gap: 0.3rem;
  margin-left: 1rem;
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
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(7, 0.8rem);
  grid-template-columns: repeat(${columns}, 0.7rem);
  gap: 0.3rem;
`;

const heatmapGridContainerStyle = css`
  display: flex;
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
    background: ${isEmpty ? 'transparent' : palette[level]};
  `;
};

const weekDayLabelRowStyle = css`
  display: flex;
  flex-direction: column;
  margin-top: -0.2rem;
`;

const weekDayLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  text-align: left;
  white-space: nowrap;
  word-break: keep-all;
`;

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
