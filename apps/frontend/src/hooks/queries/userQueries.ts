import { useMutation, useQuery } from '@tanstack/react-query';

import type {
  DailyStatsResult,
  FieldDailyStatsResult,
  ProfileFollowUser,
  ProfileStreakDay,
  ProfileSummaryResult,
} from '@/feat/user/profile/types';
import { notificationService, userService } from '@/services/userService';

type UnsubscribeRequest = {
  email: string;
  token: string;
};

type UnsubscribeResponse = {
  success: boolean;
  message: string;
};

export const useUnsubscribeMutation = () =>
  useMutation<UnsubscribeResponse, Error, UnsubscribeRequest>({
    mutationFn: data => notificationService.unsubscribe(data),
  });

export const userKeys = {
  summary: (userId: number) => ['profile', 'summary', userId] as const,
  followers: (userId: number) => ['profile', 'followers', userId] as const,
  following: (userId: number) => ['profile', 'following', userId] as const,
  dailyStats: (userId: number) => ['profile', 'daily-stats', userId] as const,
  fieldDailyStats: (userId: number) => ['profile', 'field-daily-stats', userId] as const,
  streaks: (userId: number) => ['user', 'streaks', userId] as const,
};

export const useProfileSummary = (userId: number | null) =>
  useQuery<ProfileSummaryResult, Error>({
    queryKey: userId ? userKeys.summary(userId) : ['profile', 'summary', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getProfileSummary(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
    retry: false,
  });

export const useProfileFollowers = (userId: number | null) =>
  useQuery<ProfileFollowUser[], Error>({
    queryKey: userId ? userKeys.followers(userId) : ['profile', 'followers', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getFollowers(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileFollowing = (userId: number | null) =>
  useQuery<ProfileFollowUser[], Error>({
    queryKey: userId ? userKeys.following(userId) : ['profile', 'following', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getFollowing(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileDailyStats = (userId: number | null) =>
  useQuery<DailyStatsResult, Error>({
    queryKey: userId ? userKeys.dailyStats(userId) : ['profile', 'daily-stats', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getDailyStats(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileFieldDailyStats = (userId: number | null) =>
  useQuery<FieldDailyStatsResult, Error>({
    queryKey: userId ? userKeys.fieldDailyStats(userId) : ['profile', 'field-daily-stats', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getFieldDailyStats(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileStreaks = (userId: number | null) =>
  useQuery<ProfileStreakDay[], Error>({
    queryKey: userId ? userKeys.streaks(userId) : ['user', 'streaks', 'empty'],
    queryFn: () => {
      if (userId === null) {
        throw new Error('사용자 ID가 필요합니다.');
      }
      return userService.getProfileStreaks(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });
