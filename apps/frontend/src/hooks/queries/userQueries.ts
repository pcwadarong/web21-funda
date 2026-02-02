import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  DailyStatsResult,
  FieldDailyStatsResult,
  ProfileFollowUser,
  ProfileSearchUser,
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
  summary: (userId: number) => ['user', 'summary', userId] as const,
  followers: (userId: number) => ['user', 'followers', userId] as const,
  following: (userId: number) => ['user', 'following', userId] as const,
  dailyStats: (userId: number) => ['user', 'daily-stats', userId] as const,
  fieldDailyStats: (userId: number) => ['user', 'field-daily-stats', userId] as const,
  streaks: (userId: number) => ['user', 'streaks', userId] as const,
  search: (keyword: string) => ['profile', 'search', keyword] as const,
};

export const useProfileSearchUsers = (keyword: string, enabled: boolean) =>
  useQuery<ProfileSearchUser[], Error>({
    queryKey: userKeys.search(keyword),
    queryFn: () => userService.searchUsers(keyword),
    enabled,
    staleTime: 1000 * 30,
  });

export const useFollowUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.followUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.summary(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.following(userId) });
    },
  });
};

export const useUnfollowUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => userService.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.summary(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.following(userId) });
    },
  });
};
export const useProfileSummary = (userId: number | null) =>
  useQuery<ProfileSummaryResult, Error>({
    queryKey: userId ? userKeys.summary(userId) : ['user', 'summary', 'empty'],
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
    queryKey: userId ? userKeys.followers(userId) : ['user', 'followers', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getFollowers(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileFollowing = (userId: number | null) =>
  useQuery<ProfileFollowUser[], Error>({
    queryKey: userId ? userKeys.following(userId) : ['user', 'following', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getFollowing(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileDailyStats = (userId: number | null) =>
  useQuery<DailyStatsResult, Error>({
    queryKey: userId ? userKeys.dailyStats(userId) : ['user', 'daily-stats', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getDailyStats(userId);
    },
    enabled: userId !== null,
    staleTime: 1000 * 60,
  });

export const useProfileFieldDailyStats = (userId: number | null) =>
  useQuery<FieldDailyStatsResult, Error>({
    queryKey: userId ? userKeys.fieldDailyStats(userId) : ['user', 'field-daily-stats', 'empty'],
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
