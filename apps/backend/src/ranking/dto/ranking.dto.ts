import { RankingTierName } from '../entities/ranking-tier.enum';

export interface RankingTierSummary {
  id: number;
  name: RankingTierName;
  orderIndex: number;
}

export interface WeeklyRankingEntry {
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  xp: number;
  rank: number;
  isMe: boolean;
  rankZone: RankingZone;
}

export interface WeeklyRankingResult {
  weekKey: string;
  tier: RankingTierSummary | null;
  groupIndex: number | null;
  totalMembers: number;
  myRank: number | null;
  myWeeklyXp: number;
  members: WeeklyRankingEntry[];
}

export interface OverallRankingEntry {
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  xp: number;
  rank: number;
  isMe: boolean;
  rankZone: RankingZone;
  tierName: RankingTierName | null;
  tierOrderIndex: number | null;
}

export interface OverallRankingResult {
  weekKey: string;
  totalMembers: number;
  myRank: number | null;
  myWeeklyXp: number;
  members: OverallRankingEntry[];
}

export interface MyTierResult {
  tier: RankingTierSummary | null;
  diamondCount: number;
}

export type RankingZone = 'PROMOTION' | 'MAINTAIN' | 'DEMOTION';
