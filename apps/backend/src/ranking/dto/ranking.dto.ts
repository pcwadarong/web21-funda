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

export interface MyTierResult {
  tier: RankingTierSummary | null;
  diamondCount: number;
}
