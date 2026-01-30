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
