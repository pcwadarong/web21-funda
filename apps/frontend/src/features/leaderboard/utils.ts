import type { RankingMember } from './types';

const DAY_MS = 1000 * 60 * 60 * 24;
const WEEK_MS = DAY_MS * 7;
const KST_OFFSET_MS = 1000 * 60 * 60 * 9;

/**
 * 승급/유지/강등 구역으로 사용자를 분리한다.
 *
 * @param {RankingMember[]} members - 주간 랭킹 멤버 목록
 * @returns 구역별 멤버 목록
 */
export const groupMembersByZone = (members: RankingMember[]) => {
  const grouped = {
    promotion: [] as RankingMember[],
    maintain: [] as RankingMember[],
    demotion: [] as RankingMember[],
  };

  members.forEach(member => {
    if (member.rankZone === 'PROMOTION') {
      grouped.promotion.push(member);
      return;
    }

    if (member.rankZone === 'DEMOTION') {
      grouped.demotion.push(member);
      return;
    }

    grouped.maintain.push(member);
  });

  return grouped;
};

/**
 * 주차 키를 기준으로 종료까지 남은 날짜 문구를 생성한다.
 *
 * @param {string} weekKey - YYYY-WW 형식의 주차 키
 * @returns {string} 남은 날짜 문구
 */
export const buildRemainingDaysText = (weekKey: string) => {
  const remainingDays = calculateRemainingDaysFromWeekKey(weekKey);

  if (remainingDays === null) return '종료 정보 없음';
  if (remainingDays <= 0) return '오늘 종료';
  if (remainingDays === 1) return '1일 후 종료';
  return `${remainingDays}일 후 종료`;
};

/**
 * 주차 키를 기준으로 종료까지 남은 날짜를 계산한다.
 * - KST 기준 월요일 00:00 시작, 다음 주 월요일 00:00 종료로 계산한다.
 *
 * @param {string} weekKey - YYYY-WW 형식의 주차 키
 * @returns {number | null} 남은 일수 (계산 불가 시 null)
 */
const calculateRemainingDaysFromWeekKey = (weekKey: string) => {
  const parsedWeekKey = parseWeekKey(weekKey);

  if (!parsedWeekKey) return null;

  const { year, week } = parsedWeekKey;
  const weekStartUtc = getIsoWeekMondayUtc(year, week);
  const weekStartKstUtc = new Date(weekStartUtc.getTime() - KST_OFFSET_MS);
  const weekEndUtcTimestamp = weekStartKstUtc.getTime() + WEEK_MS;
  const nowUtcTimestamp = Date.now();
  const remainingMs = weekEndUtcTimestamp - nowUtcTimestamp;

  if (remainingMs <= 0) return 0;

  const remainingDays = Math.ceil(remainingMs / DAY_MS);
  return remainingDays;
};

/**
 * 주차 키를 연도/주차 정보로 파싱한다.
 *
 * @param {string} weekKey - YYYY-WW 형식의 주차 키
 * @returns {{ year: number; week: number } | null} 파싱 결과
 */
const parseWeekKey = (weekKey: string) => {
  const matchResult = /^(\d{4})-(\d{2})$/.exec(weekKey);
  if (!matchResult) return null;

  const year = Number(matchResult[1]);
  const week = Number(matchResult[2]);

  if (Number.isNaN(year) || Number.isNaN(week)) return null;
  if (week < 1 || week > 53) return null;

  return { year, week };
};

/**
 * ISO 주차 기준으로 월요일 00:00(UTC)을 반환한다.
 *
 * @param {number} year - ISO 연도
 * @param {number} week - ISO 주차
 * @returns {Date} UTC 기준 월요일 00:00
 */
const getIsoWeekMondayUtc = (year: number, week: number) => {
  const jan4Utc = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4Utc.getUTCDay();
  const daysFromMonday = (jan4Day + 6) % 7;
  const week1MondayUtc = new Date(Date.UTC(year, 0, 4 - daysFromMonday));
  const targetWeekOffset = (week - 1) * 7 * DAY_MS;

  return new Date(week1MondayUtc.getTime() + targetWeekOffset);
};
