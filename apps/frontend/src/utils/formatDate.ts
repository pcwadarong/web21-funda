// src/utils/date.ts

/**
 * 서버 데이터와 매칭하기 위한 표준 키 생성 (YYYY-MM-DD)
 */
export const formatDateKeyUtc = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;

/**
 * UI 화면 표시용 날짜 포맷 (YYYY년 MM월 DD일)
 */
export const formatDateDisplayName = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜 문자열을 안전하게 UTC 키로 변환
 */
export const normalizeDateKey = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }
  return formatDateKeyUtc(parsed);
};
