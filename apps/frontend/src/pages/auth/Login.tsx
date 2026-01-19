import { useCallback } from 'react';

import { LoginForm } from '@/feat/auth/components/LoginForm';
import { authService } from '@/services/authService';

export const Login = () => {
  const handleGitHubLogin = useCallback(() => {
    authService.loginWithGitHub();
  }, []);

  const handleGoogleLogin = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  return <LoginForm onGoogleLogin={handleGoogleLogin} onGitHubLogin={handleGitHubLogin} />;
};
