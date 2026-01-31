/**
 * 날짜 포맷팅 유틸리티 함수
 */

/**
 * 서버 데이터와 매칭하기 위한 표준 키 생성 (YYYY-MM-DD)
 * UTC 기준으로 날짜를 변환한다.
 *
 * @param {Date} date Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDateKeyUtc = (date: Date): string =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;

/**
 * UI 화면 표시용 날짜 포맷 (YYYY년 MM월 DD일)
 * UTC 기준으로 날짜를 변환한다.
 *
 * @param {Date} date Date 객체
 * @returns {string} YYYY년 MM월 DD일 형식의 날짜 문자열
 */
export const formatDateDisplayName = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜 문자열을 안전하게 UTC 키로 변환한다.
 * 파싱에 실패하거나 유효하지 않은 날짜인 경우 원본 문자열의 처음 10자리를 반환한다.
 *
 * @param {string} value 날짜 문자열
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const normalizeDateKey = (value: string): string => {
  // YYYY-MM-DD 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const datePart = value.slice(0, 10);
  if (!dateRegex.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return datePart;

  // 포맷된 결과가 원본과 일치하는지 확인 (자동 보정 방지)
  const formatted = formatDateKeyUtc(parsed);
  if (formatted !== datePart) return datePart;

  return formatted;
};

/**
 * 초를 "X분 Y초" 형식으로 포맷한다.
 *
 * @param {number} seconds 초 단위 시간
 * @returns {string} 포맷된 문자열
 */
export const formatSeconds = (seconds: number): string => {
  const safeSeconds = Math.max(seconds, 0);
  const intSeconds = Math.floor(safeSeconds);
  const minutes = Math.floor(intSeconds / 60);
  const remainingSeconds = intSeconds % 60;
  return `${minutes}분 ${remainingSeconds}초`;
};
