import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const Login = () => {
  const { loginWithGoogle, loginWithGitHub } = useAuth();

  return <LoginForm onGoogleLogin={loginWithGoogle} onGitHubLogin={loginWithGitHub} />;
};
