import { css } from '@emotion/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Popover } from '@/components/Popover';
import type { Theme } from '@/styles/theme';
import { formatDateLabel } from '@/utils/dateRange';

/**
 * 차트 시리즈 데이터 인터페이스
 */
interface ChartSeries {
  /** 시리즈 고유 ID */
  id: string | number;
  /** 시리즈 라벨 */
  label: string;
  /** 각 날짜별 값 배열 */
  values: number[];
  /** 시리즈 색상 */
  color: string;
  /** 툴팁 포맷터 함수 */
  tooltipFormatter: (value: number) => string;
  /** 0값일 때 툴팁 표시를 막을지 여부 */
  disableZeroTooltip?: boolean;
}

/** 차트 너비 (SVG viewBox 기준) */
const CHART_WIDTH = 520;
/** 차트 높이 (SVG viewBox 기준) */
const CHART_HEIGHT = 180;
/** 차트 패딩 (상, 우, 하, 좌) */
const CHART_PADDING = { top: 12, right: 16, bottom: 24, left: 48 };

/**
 * 차트 카드 Props
 */
interface ChartCardProps {
  /** 차트 제목 */
  title: string;
  /** 차트 설명 */
  caption: string;
  /** 날짜 배열 (YYYY-MM-DD 형식) */
  dates: string[];
  /** 차트 시리즈 데이터 배열 */
  series: ChartSeries[];
  /** Y축 스케일 정보 */
  yScale: { yMax: number; ticks: number[] };
  /** Y축 라벨 포맷터 함수 */
  yLabelFormatter: (value: number) => string;
  /** 시작 날짜 (표시용) */
  startDate?: string;
  /** 종료 날짜 (표시용) */
  endDate?: string;
  /** 테마 객체 */
  theme: Theme;
  /** 범례 아이템 배열 */
  legendItems?: { id: string | number; label: string; color: string }[];
}

/**
 * 베지어 곡선을 사용하여 부드러운 경로를 생성한다.
 *
 * @param {Array<{x: number, y: number}>} points 좌표점 배열
 * @returns {string} SVG path 문자열
 */
const createSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  const firstPoint = points[0];
  if (!firstPoint) return '';
  if (points.length === 1) return `M ${firstPoint.x} ${firstPoint.y}`;

  const smoothing = 0.2;

  /**
   * 베지어 곡선의 제어점을 계산한다.
   *
   * @param {Object} current 현재 점
   * @param {Object} previous 이전 점
   * @param {Object} next 다음 점
   * @param {boolean} reverse 역방향 여부
   * @returns {Object} 제어점 좌표
   */
  const controlPoint = (
    current: { x: number; y: number },
    previous: { x: number; y: number } | undefined,
    next: { x: number; y: number } | undefined,
    reverse: boolean,
  ) => {
    const p = previous ?? current;
    const n = next ?? current;
    const o = {
      x: current.x + (n.x - p.x) * smoothing,
      y: current.y + (n.y - p.y) * smoothing,
    };
    return reverse
      ? {
          x: current.x - (o.x - current.x),
          y: current.y - (o.y - current.y),
        }
      : o;
  };

  const path = points.reduce((acc, point, index, array) => {
    if (index === 0) return `M ${point.x} ${point.y}`;

    const previous = array[index - 1];
    if (!previous) return acc;
    const next = array[index + 1];
    const prevPrev = array[index - 2];
    const cp1 = controlPoint(previous, prevPrev, point, false);
    const cp2 = controlPoint(point, previous, next, true);
    return `${acc} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${point.x} ${point.y}`;
  }, '');

  return path;
};

/**
 * 영역 차트를 위한 경로를 생성한다.
 * 베이스라인까지의 영역을 포함한다.
 *
 * @param {Array<{x: number, y: number}>} points 좌표점 배열
 * @param {number} baseline 베이스라인 Y 좌표
 * @returns {string} SVG path 문자열
 */
const createAreaPath = (points: { x: number; y: number }[], baseline: number): string => {
  if (points.length === 0) return '';

  const linePath = createSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  if (!last || !first) return linePath;
  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
};

/**
 * 차트 카드 컴포넌트
 *
 * SVG를 사용하여 선형 차트를 렌더링한다.
 * 호버 시 툴팁을 표시하고, 여러 시리즈를 지원한다.
 */
export const ChartCard = ({
  title,
  caption,
  dates,
  series,
  yScale,
  yLabelFormatter,
  startDate,
  endDate,
  theme,
  legendItems = [],
}: ChartCardProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: CHART_WIDTH, height: CHART_HEIGHT });
  const [activePoint, setActivePoint] = useState<{
    x: number;
    y: number;
    value: number;
    label: string;
    tooltipFormatter: (value: number) => string;
    color: string;
    disableZeroTooltip?: boolean;
  } | null>(null);

  /**
   * 컨테이너 크기 변경 감지
   * ResizeObserver를 사용하여 차트 컨테이너의 크기 변화를 감지한다.
   */
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setContainerSize({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  /**
   * 시리즈별 포인트 그룹 계산
   * 각 시리즈의 좌표, 경로, 색상 등을 계산한다.
   */
  const pointGroups = useMemo(() => {
    const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const maxValue = yScale.yMax > 0 ? yScale.yMax : 1;
    const count = dates.length;

    return series.map(seriesItem => {
      const points = seriesItem.values.map((value, index) => {
        const ratio = count > 1 ? index / (count - 1) : 0;
        const x = CHART_PADDING.left + plotWidth * ratio;
        const y =
          CHART_HEIGHT - CHART_PADDING.bottom - (Math.min(value, maxValue) / maxValue) * plotHeight;
        return {
          x,
          y,
          value,
          label: seriesItem.label,
          tooltipFormatter: seriesItem.tooltipFormatter,
          color: seriesItem.color,
          disableZeroTooltip: seriesItem.disableZeroTooltip,
        };
      });

      return {
        id: seriesItem.id,
        color: seriesItem.color,
        points,
        linePath: createSmoothPath(points),
        areaPath: createAreaPath(points, CHART_HEIGHT - CHART_PADDING.bottom),
      };
    });
  }, [dates.length, series, yScale.yMax]);
  const rawGradientId = useId();
  const gradientId = useMemo(() => rawGradientId.replace(/:/g, '-'), [rawGradientId]);

  const popoverPosition = useMemo(() => {
    if (!activePoint) return null;

    const x = (activePoint.x / CHART_WIDTH) * containerSize.width;
    const y = (activePoint.y / CHART_HEIGHT) * containerSize.height;
    return { x, y };
  }, [activePoint, containerSize.height, containerSize.width]);

  const xLabels = useMemo(() => {
    const start = formatDateLabel(startDate ?? dates[0] ?? '');
    const end = formatDateLabel(endDate ?? dates[dates.length - 1] ?? '');
    return { start, end };
  }, [dates, endDate, startDate]);

  return (
    <section css={cardStyle(theme)}>
      <h2 css={sectionTitleStyle(theme)}>{title}</h2>
      <p css={chartCaptionStyle(theme)}>{caption}</p>
      <div css={chartWrapperStyle} ref={containerRef}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          css={chartSvgStyle}
        >
          <defs>
            {pointGroups.map((group, index) => {
              const seriesGradientId = `${gradientId}-${index}`;
              return (
                <linearGradient
                  key={seriesGradientId}
                  id={seriesGradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={group.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={group.color} stopOpacity="0" />
                </linearGradient>
              );
            })}
          </defs>

          {yScale.ticks.map(tick => {
            const y =
              CHART_HEIGHT -
              CHART_PADDING.bottom -
              (tick / yScale.yMax) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={CHART_WIDTH - CHART_PADDING.right}
                  y2={y}
                  stroke={theme.colors.border.default}
                  strokeWidth="1"
                />
                <text
                  x={CHART_PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill={theme.colors.text.weak}
                  fontSize="11"
                >
                  {yLabelFormatter(tick)}
                </text>
              </g>
            );
          })}

          {dates.map((_, index) => {
            const x = pointGroups[0]?.points[index]?.x ?? CHART_PADDING.left;
            return (
              <line
                key={`x-${index}`}
                x1={x}
                y1={CHART_PADDING.top}
                x2={x}
                y2={CHART_HEIGHT - CHART_PADDING.bottom}
                stroke={theme.colors.border.default}
                strokeWidth="1"
              />
            );
          })}

          {pointGroups.map((group, index) => (
            <path
              key={`area-${group.id}`}
              d={group.areaPath}
              fill={`url(#${gradientId}-${index})`}
            />
          ))}
          {pointGroups.map(group => (
            <path
              key={`line-${group.id}`}
              d={group.linePath}
              fill="none"
              stroke={group.color}
              strokeWidth="2.5"
            />
          ))}

          {pointGroups.map(group =>
            group.points.map((point, index) => (
              <g key={`point-${group.id}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  fill={point.color}
                  stroke={theme.colors.surface.strong}
                  strokeWidth="2"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="transparent"
                  onMouseEnter={() => {
                    if (point.disableZeroTooltip && point.value === 0) return;
                    setActivePoint(point);
                  }}
                  onMouseLeave={() => setActivePoint(null)}
                />
              </g>
            )),
          )}
        </svg>
        {popoverPosition && activePoint && (
          <Popover x={popoverPosition.x} y={popoverPosition.y} isVisible offsetY={-56}>
            {activePoint.label
              ? `${activePoint.label} · ${activePoint.tooltipFormatter(activePoint.value)}`
              : activePoint.tooltipFormatter(activePoint.value)}
          </Popover>
        )}
      </div>
      <div css={chartAxisStyle(theme)}>
        <span>{xLabels.start}</span>
        <span>{xLabels.end}</span>
      </div>
      {legendItems.length > 0 && (
        <div css={legendStyle}>
          {legendItems.map(item => (
            <span key={item.id} css={legendItemStyle(theme)}>
              <span css={legendDotStyle(item.color)} />
              {item.label}
            </span>
          ))}
        </div>
      )}
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
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  margin: 0;
`;

const chartWrapperStyle = css`
  position: relative;
  height: 11.25rem;
`;

const chartSvgStyle = css`
  display: block;
`;

const chartAxisStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const legendStyle = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const legendItemStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.light};
  min-width: 0;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const legendDotStyle = (color: string) => css`
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: ${color};
`;
