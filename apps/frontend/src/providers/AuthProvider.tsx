import { useEffect } from 'react';

import { authService } from '@/services/authService';
import { useAuthActions } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, clearAuth, setAuthReady } = useAuthActions();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. 먼저 /me로 유저 정보 확인
        const user = await authService.getCurrentUser();

        if (user) setUser(user);
        else {
          // /me 실패 시 refresh 시도 (refreshToken은 쿠키에 있음)
          const refreshResult = await authService.refreshToken();

          if (refreshResult) setUser(refreshResult.user);
          else clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, [setUser, clearAuth, setAuthReady]);

  return <>{children}</>;
};
