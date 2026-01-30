import type { RankingTierName } from '../../ranking/entities/ranking-tier.enum';

export interface ProfileTierSummary {
  id: number;
  name: RankingTierName;
  orderIndex: number;
}

export interface ProfileSummaryResult {
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  experience: number;
  currentStreak: number;
  tier: ProfileTierSummary | null;
  followerCount: number;
  followingCount: number;
  totalStudyTimeSeconds: number;
  totalStudyTimeMinutes: number;
  solvedQuizzesCount: number;
}

export interface ProfileFollowUser {
  userId: number;
  displayName: string;
  profileImageUrl: string | null;
  experience: number;
  tier: ProfileTierSummary | null;
}

export interface ProfileStreakDay {
  userId: number;
  date: string;
  solvedCount: number;
}

export interface FollowStateResult {
  isFollowing: boolean;
}

export interface DailyStatsData {
  date: string;
  studySeconds: number;
}

export interface DailyStatsResult {
  dailyData: DailyStatsData[];
  periodMaxSeconds: number;
  periodAverageSeconds: number;
}

export interface FieldDailyStatsData {
  date: string;
  solvedCount: number;
}

export interface FieldDailyStatsItem {
  fieldId: number;
  fieldName: string;
  fieldSlug: string;
  dailyData: FieldDailyStatsData[];
  periodMaxSolvedCount: number;
  periodAverageSolvedCount: number;
  totalSolvedCount: number;
}

export interface FieldDailyStatsResult {
  fields: FieldDailyStatsItem[];
}
