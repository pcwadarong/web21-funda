/**
 * 티어 정보
 */
export interface TierInfo {
  id: number;
  name: string;
  orderIndex: number;
}

/**
 * 랭킹 멤버 정보
 */
export interface RankingMember {
  rank: number;
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  xp: number;
  isMe: boolean;
  rankZone: RankingZone;
  tierName?: string;
  tierOrderIndex?: number;
}

/**
 * 주간 랭킹 결과
 */
export interface WeeklyRankingResult {
  weekKey: string;
  tier: TierInfo;
  groupIndex: number | null;
  totalMembers: number;
  myRank: number;
  myWeeklyXp: number;
  members: RankingMember[];
}

export interface OverallRankingResult {
  weekKey: string;
  totalMembers: number;
  myRank: number | null;
  myWeeklyXp: number;
  members: RankingMember[];
}

export interface RankingMeResult {
  tier: {
    id: number;
    name: string;
    orderIndex: number;
  } | null;
  diamondCount: number;
}

/**
 * 랭킹 존
 */
export type RankingZone = 'PROMOTION' | 'MAINTAIN' | 'DEMOTION';
