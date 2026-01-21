import { useMutation } from '@tanstack/react-query';

import { notificationService } from '@/services/userService';

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
