import { useTheme } from '@emotion/react';
import { memo, useMemo } from 'react';

import { ChartCard } from '@/feat/user/profile/components/ChartCard';
import type { DailyStatsResult, FieldDailyStatsResult } from '@/feat/user/profile/types';
import { getFieldColorByIndex } from '@/feat/user/profile/utils/fieldColors';
import { getDateRange } from '@/utils/dateRange';
import { formatSeconds } from '@/utils/formatDate';

/**
 * Y축 스케일을 계산한다.
 * 최소/최대 틱 수를 만족하는 적절한 스텝을 선택한다.
 *
 * @param {number} maxValue 최대값
 * @param {number[]} stepCandidates 스텝 후보 배열
 * @param {number} minTicks 최소 틱 수
 * @param {number} maxTicks 최대 틱 수
 * @returns {{yMax: number, ticks: number[]}} Y축 스케일 정보
 */
const buildScale = (
  maxValue: number,
  stepCandidates: number[],
  minTicks: number,
  maxTicks: number,
): { yMax: number; ticks: number[] } => {
  const safeMax = Math.max(maxValue, stepCandidates[0]);
  let chosenStep = stepCandidates[0];
  let chosenTicks = Math.ceil(safeMax / chosenStep);

  for (const step of stepCandidates) {
    const tickCount = Math.ceil(safeMax / step);
    if (tickCount >= minTicks && tickCount <= maxTicks) {
      chosenStep = step;
      chosenTicks = tickCount;
      break;
    }
    const candidateDistance = Math.abs(tickCount - minTicks);
    const chosenDistance = Math.abs(chosenTicks - minTicks);
    if (candidateDistance < chosenDistance) {
      chosenStep = step;
      chosenTicks = tickCount;
    }
  }

  const rawTickCount = Math.ceil(safeMax / chosenStep);
  const tickCount = Math.max(minTicks, rawTickCount);
  const yMax = chosenStep * tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => index * chosenStep);

  return { yMax, ticks };
};

/**
 * 학습 시간용 Y축 스케일을 계산한다.
 * 최소 30분(1800초)을 기준으로 5분 또는 10분 단위로 스케일을 설정한다.
 *
 * @param {number} maxSeconds 최대 학습 시간 (초)
 * @returns {{yMax: number, ticks: number[]}} Y축 스케일 정보
 */
const buildTimeScale = (maxSeconds: number): { yMax: number; ticks: number[] } => {
  const minMax = Math.max(maxSeconds, 1800);
  const step = minMax <= 1500 ? 300 : 600; // 5분 또는 10분 단위
  const tickCount = Math.max(4, Math.min(5, Math.ceil(minMax / step)));
  const yMax = step * tickCount;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => index * step);
  return { yMax, ticks };
};

/**
 * 초를 분 단위로 변환하여 라벨로 사용한다.
 *
 * @param {number} seconds 초 단위 시간
 * @returns {string} "X분" 형식의 문자열
 */
const formatMinutesLabel = (seconds: number): string => `${Math.floor(seconds / 60)}분`;

/**
 * 문제 수를 "X문제" 형식으로 포맷한다.
 *
 * @param {number} count 문제 수
 * @returns {string} 포맷된 문자열
 */
const formatSolvedCount = (count: number): string => `${count}문제`;

/**
 * 숫자를 그대로 문자열로 변환한다 (Y축 라벨용)
 *
 * @param {number} count 숫자
 * @returns {string} 문자열
 */
const formatCountLabel = (count: number): string => `${count}`;

/**
 * 차트 섹션 Props
 */
interface ChartSectionProps {
  /** 최근 7일 일일 통계 */
  dailyStats: DailyStatsResult | null;
  /** 최근 7일 필드별 통계 */
  fieldDailyStats: FieldDailyStatsResult | null;
}

/**
 * 차트 섹션 컴포넌트
 *
 * 학습 시간 및 분야별 학습 량 추이 그래프를 표시한다.
 */
export const ChartSection = memo(({ dailyStats, fieldDailyStats }: ChartSectionProps) => {
  const theme = useTheme();

  // 최근 7일간의 날짜 목록 (폴백용)
  const fallbackDates = useMemo(() => getDateRange(7), []);

  // 학습 시간 데이터 준비
  const timeData = dailyStats?.dailyData?.length
    ? dailyStats.dailyData.map(item => ({ date: item.date, value: item.studySeconds }))
    : fallbackDates.map(date => ({ date, value: 0 }));

  const timeScale = buildTimeScale(dailyStats?.periodMaxSeconds ?? 0);
  const timeCaption = `최근 한 주, 하루 평균 학습 시간은 ${formatSeconds(
    dailyStats?.periodAverageSeconds ?? 0,
  )}예요.`;

  const chartDates = timeData.map(item => item.date);

  // 필드별 시리즈 데이터 준비
  const fieldSeries = (fieldDailyStats?.fields ?? []).map((field, index) => {
    const valueMap = new Map(field.dailyData?.map(item => [item.date, item.solvedCount]));
    const values = chartDates.map(date => valueMap.get(date) ?? 0);
    return {
      id: field.fieldId,
      label: field.fieldName,
      values,
      color: getFieldColorByIndex(index, theme),
      tooltipFormatter: formatSolvedCount,
    };
  });

  const fieldAverage = fieldDailyStats?.fields?.length
    ? Math.floor(fieldDailyStats.fields.reduce((sum, field) => sum + field.totalSolvedCount, 0) / 7)
    : 0;
  const fieldCaption = `최근 한 주, 하루 평균 학습 문제 수는 ${fieldAverage}문제예요.`;
  const fieldMaxValue = Math.max(1, ...fieldSeries.flatMap(series => series.values));
  const fieldScale = buildScale(fieldMaxValue, [1, 2, 5, 10], 4, 5);

  return (
    <>
      <ChartCard
        title="학습 시간"
        caption={timeCaption}
        dates={chartDates}
        series={[
          {
            id: 'study-time',
            label: '',
            values: timeData.map(item => item.value),
            color: theme.colors.primary.main,
            tooltipFormatter: formatSeconds,
          },
        ]}
        yScale={timeScale}
        yLabelFormatter={formatMinutesLabel}
        startDate={timeData[0]?.date}
        endDate={timeData[timeData.length - 1]?.date}
        theme={theme}
      />
      <ChartCard
        title="분야별 학습 량"
        caption={fieldCaption}
        dates={chartDates}
        series={
          fieldSeries.length
            ? fieldSeries
            : [
                {
                  id: 'empty-field',
                  label: '분야별',
                  values: chartDates.map(() => 0),
                  color: theme.colors.primary.main,
                  tooltipFormatter: formatSolvedCount,
                },
              ]
        }
        yScale={fieldScale}
        yLabelFormatter={formatCountLabel}
        startDate={chartDates[0]}
        endDate={chartDates[chartDates.length - 1]}
        theme={theme}
        legendItems={fieldSeries.map(series => ({
          id: series.id,
          label: series.label,
          color: series.color,
        }))}
      />
    </>
  );
});

ChartSection.displayName = 'ChartSection';
