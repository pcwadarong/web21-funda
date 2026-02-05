/**
 * 캐시 키 생성 규칙을 한 곳에서 관리해 일관성을 유지한다.
 */
export const CacheKeys = {
  quizContent: (quizId: number): string => `quiz_content:${quizId}`,
  fieldList: (): string => 'fields:list',
  fieldUnits: (fieldSlug: string): string => `fields:${fieldSlug}:units`,
  firstUnit: (fieldSlug: string): string => `fields:${fieldSlug}:first_unit`,
  unitOverview: (unitId: number): string => `unit:overview:${unitId}`,
  rankingWeekly: (weekKey: string, userId: number): string => `ranking:weekly:${weekKey}:${userId}`,
  rankingOverall: (weekKey: string, userId: number): string =>
    `ranking:overall:${weekKey}:${userId}`,
  profileStats: (type: string, userId: number, timeZone: string): string =>
    `profile:stats:${type}:${userId}:${timeZone}`,
  guestStepIds: (clientId: string): string => `step_ids:${clientId}`,
  guestHeart: (clientId: string): string => `heart:${clientId}`,
};

/**
 * 캐시 TTL을 한 곳에서 관리해 정책 변경 시 수정 범위를 줄인다.
 */
export const CACHE_TTL_SECONDS = {
  quizContent: 24 * 60 * 60,
  fieldList: 24 * 60 * 60,
  fieldUnits: 24 * 60 * 60,
  firstUnit: 24 * 60 * 60,
  unitOverview: 24 * 60 * 60,
  ranking: 60,
  profileStats: 5 * 60,
  guestProgress: 30 * 24 * 60 * 60,
};
