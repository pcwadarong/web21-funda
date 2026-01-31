import type {
  ProfileFollowUser,
  ProfileSearchUser,
  ProfileSummaryResult,
} from '@/features/profile/types';

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
   * 대상 사용자를 팔로우합니다.
   */
  async followUser(userId: number): Promise<{ isFollowing: boolean }> {
    return apiFetch.post<{ isFollowing: boolean }>(`/profiles/${userId}/follow`);
  },

  /**
   * 대상 사용자를 언팔로우합니다.
   */
  async unfollowUser(userId: number): Promise<{ isFollowing: boolean }> {
    return apiFetch.delete<{ isFollowing: boolean }>(`/profiles/${userId}/follow`);
  },

  /**
   * 사용자 검색 결과를 가져옵니다.
   */
  async searchUsers(keyword: string): Promise<ProfileSearchUser[]> {
    const query = new URLSearchParams();
    query.set('keyword', keyword);
    return apiFetch.get<ProfileSearchUser[]>(`/profiles/search?${query.toString()}`);
  },
};
