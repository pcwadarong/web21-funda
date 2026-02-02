/**
 * 날짜 범위 유틸리티 함수
 */

/**
 * 최근 N일간의 날짜 목록을 생성한다.
 *
 * @param {number} days 생성할 일수 (기본값: 7)
 * @returns {string[]} YYYY-MM-DD 형식의 날짜 문자열 배열
 */
export function getDateRange(days: number = 7): string[] {
  const dates: string[] = [];
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - (days - 1));

  for (let i = 0; i < days; i += 1) {
    const current = new Date(start);
    current.setDate(current.getDate() + i);
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

/**
 * 날짜 문자열을 라벨 형식으로 변환한다 (YYYY-MM-DD -> YYYY.MM.DD)
 *
 * @param {string} dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns {string} YYYY.MM.DD 형식의 날짜 문자열
 */
export function formatDateLabel(dateString: string): string {
  if (!dateString) return '';
  return dateString.replace(/-/g, '.');
}
