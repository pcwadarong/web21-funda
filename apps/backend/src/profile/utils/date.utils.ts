/**
 * 최근 7일간의 날짜 목록을 생성한다.
 *
 * @returns {string[]} YYYY-MM-DD 형식의 날짜 문자열 배열 (7개)
 */
export function getLast7Days(): string[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 최근 7일 (오늘 포함)

  const allDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    allDates.push(`${year}-${month}-${day}`);
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
