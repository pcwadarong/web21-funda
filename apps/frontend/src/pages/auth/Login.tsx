import { LoginForm } from '@/feat/auth/components/LoginForm';
import { useAuth } from '@/feat/auth/hooks/useAuth';

export const Login = () => {
  const { loginWithGoogle, loginWithGitHub } = useAuth();

  return <LoginForm onGoogleLogin={loginWithGoogle} onGitHubLogin={loginWithGitHub} />;
};
