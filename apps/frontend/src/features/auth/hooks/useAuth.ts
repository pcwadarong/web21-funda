import { useCallback } from 'react';

import { authService } from '@/services/authService';

export const useAuth = () => {
  const loginWithGoogle = useCallback(async () => {
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  }, []);

  const loginWithGitHub = useCallback(async () => {
    try {
      await authService.loginWithGitHub();
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  }, []);

  return {
    loginWithGoogle,
    loginWithGitHub,
  };
};
