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

export const useReviewQueueQuery = (
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof progressService.getReviewQueue>>, Error>,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: ['review-queue'],
    queryFn: () => progressService.getReviewQueue(),
    ...options,
  });
