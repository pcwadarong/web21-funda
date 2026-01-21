import type { UseQueryOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { progressService } from '@/services/progressService';

export const useSyncStepHistoryMutation = () =>
  useMutation({
    mutationFn: (stepIds: number[]) => progressService.syncStepHistory(stepIds),
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
