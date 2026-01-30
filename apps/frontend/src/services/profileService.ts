import type {
  DailyStatsResult,
  FieldDailyStatsResult,
  ProfileFollowUser,
  ProfileSummaryResult,
} from '@/feat/user/profile/types';

import { apiFetch } from './api';

export const profileService = {
  /**
   * 프로필 요약 정보를 가져옵니다.
   */
  async getProfileSummary(userId: number): Promise<ProfileSummaryResult> {
    return apiFetch.get<ProfileSummaryResult>(`/profiles/${userId}`);
  },

  /**
   * 팔로워 목록을 가져옵니다.
   */
  async getFollowers(userId: number): Promise<ProfileFollowUser[]> {
    return apiFetch.get<ProfileFollowUser[]>(`/profiles/${userId}/followers`);
  },

  /**
   * 팔로잉 목록을 가져옵니다.
   */
  async getFollowing(userId: number): Promise<ProfileFollowUser[]> {
    return apiFetch.get<ProfileFollowUser[]>(`/profiles/${userId}/following`);
  },

  /**
   * 최근 7일간 일일 통계를 가져옵니다.
   */
  async getDailyStats(userId: number): Promise<DailyStatsResult> {
    return apiFetch.get<DailyStatsResult>(`/profiles/${userId}/daily-stats`);
  },

  /**
   * 최근 7일간 필드별 문제 풀이 통계를 가져옵니다.
   */
  async getFieldDailyStats(userId: number): Promise<FieldDailyStatsResult> {
    return apiFetch.get<FieldDailyStatsResult>(`/profiles/${userId}/field-daily-stats`);
  },
};
