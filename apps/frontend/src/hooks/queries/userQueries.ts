import { useMutation, useQuery } from '@tanstack/react-query';

import type { ProfileStreakDay } from '@/feat/user/profile/types';
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
  streaks: (userId: number) => ['user', 'streaks', userId] as const,
};

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
