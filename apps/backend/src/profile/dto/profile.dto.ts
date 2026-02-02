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

export interface ProfileSearchUser {
  userId: number;
  displayName: string;
  email: string | null;
  profileImageUrl: string | null;
  experience: number;
  tier: ProfileTierSummary | null;
  isFollowing: boolean;
}

export interface FollowStateResult {
  isFollowing: boolean;
}
