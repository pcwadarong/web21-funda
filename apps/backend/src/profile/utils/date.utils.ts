/**
 * 특정 타임존 기준으로 Date 객체의 년/월/일 부분을 추출한다.
 *
 * @param {Date} date Date 객체
 * @returns {{year: number, month: number, day: number}} KST 기준 년/월/일
 */
function getDateTimePartsInTimeZone(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find(p => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find(p => p.type === 'month')?.value ?? '0');
  const day = Number(parts.find(p => p.type === 'day')?.value ?? '0');

  return { year, month, day };
}

/**
 * Date 객체를 KST 기준 YYYY-MM-DD 형식의 문자열로 변환한다.
 *
 * @param {Date} date Date 객체
 * @returns {string} YYYY-MM-DD 형식 문자열 (KST 기준)
 */
export function toKstDateString(date: Date): string {
  return toDateStringInTimeZone(date, 'Asia/Seoul');
}

/**
 * Date 객체를 지정한 타임존 기준 YYYY-MM-DD 형식의 문자열로 변환한다.
 *
 * @param {Date} date Date 객체
 * @param {string} timeZone 타임존 (예: "Asia/Seoul")
 * @returns {string} YYYY-MM-DD 형식 문자열
 */
export function toDateStringInTimeZone(date: Date, timeZone: string): string {
  const { year, month, day } = getDateTimePartsInTimeZone(date, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * 최근 7일간의 날짜 목록을 생성한다.
 * 오늘을 포함하여 과거 6일까지 총 7일의 날짜를 KST 기준으로 반환한다.
 *
 * @returns {string[]} YYYY-MM-DD 형식의 날짜 문자열 배열 (7개, KST 기준)
 */
export function getLast7Days(timeZone = 'UTC'): string[] {
  const now = new Date();
  const { year, month, day } = getDateTimePartsInTimeZone(now, timeZone);

  // 타임존 기준 오늘 날짜를 UTC 기준으로 생성
  const todayInTz = new Date(Date.UTC(year, month - 1, day));
  const sevenDaysAgo = new Date(todayInTz);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6); // 최근 7일 (오늘 포함)

  const allDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setUTCDate(date.getUTCDate() + i);
    allDates.push(toDateStringInTimeZone(date, timeZone));
  }

  return allDates;
}

/**
 * 날짜 범위의 시작일과 종료일을 반환한다.
 *
 * @param {string[]} dates 날짜 배열
 * @returns {{ startDate: string; endDate: string }} 시작일과 종료일
 */
export function getDateRange(dates: string[]): { startDate: string; endDate: string } {
  return {
    startDate: dates[0] ?? '',
    endDate: dates[dates.length - 1] ?? '',
  };
}
