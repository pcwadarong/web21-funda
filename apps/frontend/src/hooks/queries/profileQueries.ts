import { useQuery } from '@tanstack/react-query';

import type {
  DailyStatsResult,
  FieldDailyStatsResult,
  ProfileFollowUser,
  ProfileSummaryResult,
} from '@/feat/user/profile/types';
import { profileService } from '@/services/profileService';

export const profileKeys = {
  summary: (userId: number) => ['profile', 'summary', userId] as const,
  followers: (userId: number) => ['profile', 'followers', userId] as const,
  following: (userId: number) => ['profile', 'following', userId] as const,
  dailyStats: (userId: number) => ['profile', 'daily-stats', userId] as const,
  fieldDailyStats: (userId: number) => ['profile', 'field-daily-stats', userId] as const,
};

export const useProfileSummary = (userId: number | null) =>
  useQuery<ProfileSummaryResult, Error>({
    queryKey: userId ? profileKeys.summary(userId) : ['profile', 'summary', 'empty'],
    queryFn: () => {
      if (userId === null) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      return profileService.getProfileSummary(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
    retry: false,
  });

export const useProfileFollowers = (userId: number | null) =>
  useQuery<ProfileFollowUser[], Error>({
    queryKey: userId ? profileKeys.followers(userId) : ['profile', 'followers', 'empty'],
    queryFn: () => {
      if (userId === null) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      return profileService.getFollowers(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileFollowing = (userId: number | null) =>
  useQuery<ProfileFollowUser[], Error>({
    queryKey: userId ? profileKeys.following(userId) : ['profile', 'following', 'empty'],
    queryFn: () => {
      if (userId === null) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      return profileService.getFollowing(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileDailyStats = (userId: number | null) =>
  useQuery<DailyStatsResult, Error>({
    queryKey: userId ? profileKeys.dailyStats(userId) : ['profile', 'daily-stats', 'empty'],
    queryFn: () => {
      if (userId === null) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      return profileService.getDailyStats(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileFieldDailyStats = (userId: number | null) =>
  useQuery<FieldDailyStatsResult, Error>({
    queryKey: userId
      ? profileKeys.fieldDailyStats(userId)
      : ['profile', 'field-daily-stats', 'empty'],
    queryFn: () => {
      if (userId === null) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      return profileService.getFieldDailyStats(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });
