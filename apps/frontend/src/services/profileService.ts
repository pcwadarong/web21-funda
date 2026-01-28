import type { ProfileFollowUser, ProfileSummaryResult } from '@/features/profile/types';

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
};
