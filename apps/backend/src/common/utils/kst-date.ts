const KST_TIME_ZONE = 'Asia/Seoul';

interface KstDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const getPartValue = (parts: Intl.DateTimeFormatPart[], type: string): number => {
  for (const part of parts) {
    if (part.type === type) {
      const numberValue = Number(part.value);
      if (!Number.isNaN(numberValue)) {
        return numberValue;
      }
    }
  }
  return 0;
};

const getKstDateTimeParts = (date: Date): KstDateTimeParts => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(date);

  return {
    year: getPartValue(parts, 'year'),
    month: getPartValue(parts, 'month'),
    day: getPartValue(parts, 'day'),
    hour: getPartValue(parts, 'hour'),
    minute: getPartValue(parts, 'minute'),
    second: getPartValue(parts, 'second'),
  };
};

const buildUtcDateFromParts = (parts: KstDateTimeParts, milliseconds: number): Date =>
  new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      milliseconds,
    ),
  );

/**
 * 서버 타임존과 무관하게 KST 기준 현재 시각을 만든다.
 */
export const getKstNow = (): Date => {
  const now = new Date();
  const parts = getKstDateTimeParts(now);
  return buildUtcDateFromParts(parts, now.getMilliseconds());
};

/**
 * KST 기준으로 다음 날 0시를 계산한다.
 *
 * @param date 기준 시각
 * @returns 다음 날 0시(KST)
 */
export const getKstNextDayStart = (date: Date): Date => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  return new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));
};

interface KstWeekInfo {
  weekKey: string;
  startsAt: Date;
  endsAt: Date;
}

const getIsoWeekInfo = (date: Date): { weekYear: number; weekNumber: number } => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayOfWeek = target.getUTCDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

  target.setUTCDate(target.getUTCDate() + 4 - isoDay);

  const weekYear = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const diffDays = Math.floor((target.getTime() - yearStart.getTime()) / 86400000) + 1;
  const weekNumber = Math.ceil(diffDays / 7);

  return { weekYear, weekNumber };
};

const getKstWeekStart = (date: Date): Date => {
  const base = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayOfWeek = base.getUTCDay();
  const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

  base.setUTCDate(base.getUTCDate() - (isoDay - 1));
  base.setUTCHours(0, 0, 0, 0);

  return base;
};

/**
 * KST 기준 주차 키(YYYY-WW)를 반환한다.
 *
 * @param date 기준 시각
 * @returns 주차 키
 */
export const getKstWeekKey = (date: Date): string => {
  const { weekYear, weekNumber } = getIsoWeekInfo(date);
  const paddedWeek = String(weekNumber).padStart(2, '0');

  return `${weekYear}-${paddedWeek}`;
};

/**
 * KST 기준 주차 정보(주차 키와 시작/종료 시각)를 계산한다.
 *
 * @param date 기준 시각
 * @returns 주차 정보
 */
export const getKstWeekInfo = (date: Date): KstWeekInfo => {
  const startsAt = getKstWeekStart(date);
  const endsAt = new Date(startsAt);
  endsAt.setUTCDate(endsAt.getUTCDate() + 7);

  return {
    weekKey: getKstWeekKey(date),
    startsAt,
    endsAt,
  };
};
