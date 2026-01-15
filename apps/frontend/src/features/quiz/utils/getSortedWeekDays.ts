/**
 * 스트릭과 오늘 날짜를 기준으로 요일 배열을 정렬합니다.
 * @param currentStreak 현재 연속 학습 일수
 * @returns 정렬된 요일 문자열 배열 (예: ['Mo', 'Tu', 'We', ...])
 */
export const getSortedWeekdays = (currentStreak: number): string[] => {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayIndex = new Date().getDay(); // 일:0, 월:1, ... 토:6

  let startIndex: number;

  if (currentStreak <= 7) {
    // 7일 이내일 경우: 스트릭이 시작된 요일이 맨 앞으로
    // (음수가 나올 경우를 대비해 +7 후 %7 처리)
    startIndex = (todayIndex - (currentStreak - 1) + 7) % 7;
  } else {
    // 7일을 초과할 경우: 오늘이 맨 뒤로 (즉, 내일 요일이 맨 앞으로)
    startIndex = (todayIndex + 1) % 7;
  }

  // 시작 인덱스를 기준으로 배열 재조합
  return [...days.slice(startIndex), ...days.slice(0, startIndex)];
};
