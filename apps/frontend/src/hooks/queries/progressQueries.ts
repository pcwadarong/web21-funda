import type { UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { progressService } from '@/services/progressService';

type SyncStepHistoryResponse = {
  syncedCount: number;
};

export const useSyncStepHistoryMutation = () =>
  useMutation<SyncStepHistoryResponse, Error, number[]>({
    mutationFn: stepIds => progressService.syncStepHistory(stepIds),
  });

type ReviewQueueParams = {
  fieldSlug?: string;
  limit?: number;
};

export const useReviewQueueQuery = (
  params?: ReviewQueueParams,
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof progressService.getReviewQueue>>, Error>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: ['review-queue', params?.fieldSlug ?? 'all', params?.limit ?? null],
    queryFn: () => progressService.getReviewQueue(params),
    ...options,
  });

export const useTodayGoalsQuery = (
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof progressService.getTodayGoals>>, Error>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: ['today-goals'],
    queryFn: () => progressService.getTodayGoals(),
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    ...options,
  });
