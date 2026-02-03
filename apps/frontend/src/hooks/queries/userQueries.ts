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
import { useAuthStore } from '@/store/authStore';

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
    onSuccess: (result, userId) => {
      const authUser = useAuthStore.getState().user;
      const isFollowingNow = result.isFollowing;

      queryClient.setQueryData<ProfileSummaryResult>(userKeys.summary(userId), previousSummary =>
        previousSummary
          ? {
              ...previousSummary,
              followerCount:
                result.targetFollowerCount ??
                previousSummary.followerCount + (isFollowingNow ? 1 : -1),
            }
          : previousSummary,
      );

      if (authUser) {
        queryClient.setQueryData<ProfileSummaryResult>(
          userKeys.summary(authUser.id),
          previousSummary =>
            previousSummary
              ? {
                  ...previousSummary,
                  followingCount:
                    result.followerFollowingCount ??
                    previousSummary.followingCount + (isFollowingNow ? 1 : -1),
                }
              : previousSummary,
        );
      }

      queryClient.setQueryData<ProfileFollowUser[]>(
        userKeys.followers(userId),
        previousFollowers => {
          if (!previousFollowers || !authUser) {
            return previousFollowers;
          }

          const isAlreadyFollower = previousFollowers.some(
            follower => follower.userId === authUser.id,
          );

          if (isAlreadyFollower) {
            return previousFollowers;
          }

          const nextFollower: ProfileFollowUser = {
            userId: authUser.id,
            displayName: authUser.displayName,
            profileImageUrl: authUser.profileImageUrl ?? null,
            experience: authUser.experience,
            tier: null,
          };

          return [nextFollower, ...previousFollowers];
        },
      );

      if (authUser) {
        queryClient.setQueryData<ProfileFollowUser[]>(
          userKeys.following(authUser.id),
          previousFollowing => {
            if (!previousFollowing) {
              return previousFollowing;
            }

            const isAlreadyFollowing = previousFollowing.some(
              followingUser => followingUser.userId === userId,
            );

            if (isAlreadyFollowing) {
              return previousFollowing;
            }

            const targetSummary = queryClient.getQueryData<ProfileSummaryResult>(
              userKeys.summary(userId),
            );

            if (!targetSummary) {
              return previousFollowing;
            }

            const nextFollowing: ProfileFollowUser = {
              userId: targetSummary.userId,
              displayName: targetSummary.displayName,
              profileImageUrl: targetSummary.profileImageUrl ?? null,
              experience: targetSummary.experience,
              tier: targetSummary.tier ?? null,
            };

            return [nextFollowing, ...previousFollowing];
          },
        );
      }

      queryClient.invalidateQueries({ queryKey: userKeys.summary(userId), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: userKeys.followers(userId), refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: userKeys.following(userId), refetchType: 'all' });
      if (authUser) {
        queryClient.invalidateQueries({
          queryKey: userKeys.summary(authUser.id),
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: userKeys.following(authUser.id),
          refetchType: 'all',
        });
      }
    },
  });
};

export const useUnfollowUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { targetUserId: number; myId: number }) =>
      userService.unfollowUser(params.targetUserId),
    onSuccess: (result, params) => {
      const { targetUserId, myId } = params;
      const authUser = useAuthStore.getState().user;
      const isFollowingNow = result.isFollowing;

      queryClient.setQueryData<ProfileSummaryResult>(
        userKeys.summary(targetUserId),
        previousSummary =>
          previousSummary
            ? {
                ...previousSummary,
                followerCount:
                  result.targetFollowerCount ??
                  previousSummary.followerCount + (isFollowingNow ? 1 : -1),
              }
            : previousSummary,
      );

      if (authUser) {
        queryClient.setQueryData<ProfileSummaryResult>(
          userKeys.summary(authUser.id),
          previousSummary =>
            previousSummary
              ? {
                  ...previousSummary,
                  followingCount:
                    result.followerFollowingCount ??
                    previousSummary.followingCount + (isFollowingNow ? 1 : -1),
                }
              : previousSummary,
        );
      }

      queryClient.setQueryData<ProfileFollowUser[]>(
        userKeys.followers(targetUserId),
        previousFollowers => {
          if (!previousFollowers || !authUser) {
            return previousFollowers;
          }

          return previousFollowers.filter(follower => follower.userId !== myId);
        },
      );

      if (authUser) {
        queryClient.setQueryData<ProfileFollowUser[]>(
          userKeys.following(authUser.id),
          previousFollowing => {
            if (!previousFollowing) {
              return previousFollowing;
            }

            return previousFollowing.filter(followingUser => followingUser.userId !== targetUserId);
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: userKeys.summary(targetUserId),
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.followers(targetUserId),
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.following(targetUserId),
        refetchType: 'all',
      });
      if (authUser) {
        queryClient.invalidateQueries({
          queryKey: userKeys.summary(authUser.id),
          refetchType: 'all',
        });
        queryClient.invalidateQueries({
          queryKey: userKeys.following(authUser.id),
          refetchType: 'all',
        });
      }
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
    staleTime: 0,
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
    staleTime: 0,
  });

export const useProfileFollowing = (userId: number | null) =>
  useQuery<ProfileFollowUser[], Error>({
    queryKey: userId ? userKeys.following(userId) : ['user', 'following', 'empty'],
    queryFn: () => {
      if (userId === null) throw new Error('사용자 ID가 필요합니다.');
      return userService.getFollowing(userId);
    },
    enabled: userId !== null,
    staleTime: 0,
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
