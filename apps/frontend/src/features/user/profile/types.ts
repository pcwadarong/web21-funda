export interface ProfileTierSummary {
  id: number;
  name: string;
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

export interface ProfileSearchUser {
  userId: number;
  displayName: string;
  email: string | null;
  profileImageUrl: string | null;
  experience: number;
  tier: ProfileTierSummary | null;
  isFollowing: boolean;
}

export interface ProfileStreakDay {
  userId: number;
  date: string;
  solvedCount: number;
}

export interface DailyStatsData {
  date: string;
  studySeconds: number;
  solvedCount: number;
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
