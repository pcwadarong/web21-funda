import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { authService } from '@/services/authService';

export const useCurrentUserQuery = () =>
  useSuspenseQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      if (user) return user;

      const refreshResult = await authService.refreshToken();
      if (!refreshResult) return null;

      return authService.getCurrentUser();
    },
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
