import { useMutation } from '@tanstack/react-query';

import { notificationService } from '@/services/userService';

type UnsubscribeRequest = Parameters<typeof notificationService.unsubscribe>[0];
type UnsubscribeResponse = Awaited<ReturnType<typeof notificationService.unsubscribe>>;

export const useUnsubscribeMutation = () =>
  useMutation<UnsubscribeResponse, Error, UnsubscribeRequest>({
    mutationFn: data => notificationService.unsubscribe(data),
  });
