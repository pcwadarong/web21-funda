import type {
  DailyStatsResult,
  FieldDailyStatsResult,
  ProfileFollowUser,
  ProfileStreakDay,
  ProfileSummaryResult,
} from '@/feat/user/profile/types';

import { apiFetch } from './api';

const resolveTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
const buildTimeZoneHeader = () => ({ 'x-time-zone': resolveTimeZone() });

interface UnsubscribeRequest {
  email: string;
  token: string;
}

interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

export const userService = {
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
   * 연간 스트릭 데이터(잔디)를 가져옵니다.
   */
  async getProfileStreaks(userId: number): Promise<ProfileStreakDay[]> {
    return apiFetch.get<ProfileStreakDay[]>(`/profiles/${userId}/streaks`, {
      headers: buildTimeZoneHeader(),
    });
  },

  /**
   * 최근 7일간 일일 통계를 가져옵니다.
   */
  async getDailyStats(userId: number): Promise<DailyStatsResult> {
    return apiFetch.get<DailyStatsResult>(`/profiles/${userId}/daily-stats`, {
      headers: buildTimeZoneHeader(),
    });
  },

  /**
   * 최근 7일간 필드별 문제 풀이 통계를 가져옵니다.
   */
  async getFieldDailyStats(userId: number): Promise<FieldDailyStatsResult> {
    return apiFetch.get<FieldDailyStatsResult>(`/profiles/${userId}/field-daily-stats`, {
      headers: buildTimeZoneHeader(),
    });
  },
};

export const notificationService = {
  /**
   * 이메일 수신 거부 요청
   * @param data 수신 거부할 이메일 정보
   * @returns 처리 결과 메시지
   */
  unsubscribe: async (data: UnsubscribeRequest): Promise<UnsubscribeResponse> =>
    apiFetch.patch<UnsubscribeResponse>('/notification/unsubscribe', data),
};
