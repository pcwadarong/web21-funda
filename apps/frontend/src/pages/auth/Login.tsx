import { useCallback, useState } from 'react';

import { LoginForm } from '@/feat/auth/components/LoginForm';
import { authService } from '@/services/authService';

export const Login = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGitHubLogin = useCallback(() => {
    setIsLoggingIn(true);

    setTimeout(() => {
      authService.loginWithGitHub();
    }, 0);
  }, []);

  const handleGoogleLogin = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  return (
    <LoginForm
      onGoogleLogin={handleGoogleLogin}
      onGitHubLogin={handleGitHubLogin}
      isLoggingIn={isLoggingIn}
    />
  );
};
