import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ProfileFollowUser, ProfileSummaryResult } from '@/features/profile/types';
import { profileService } from '@/services/profileService';

export const profileKeys = {
  summary: (userId: number) => ['profile', 'summary', userId] as const,
  followers: (userId: number) => ['profile', 'followers', userId] as const,
  following: (userId: number) => ['profile', 'following', userId] as const,
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

export const useFollowUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => profileService.followUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.summary(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.following(userId) });
    },
  });
};

export const useUnfollowUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => profileService.unfollowUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.summary(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.followers(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.following(userId) });
    },
  });
};
