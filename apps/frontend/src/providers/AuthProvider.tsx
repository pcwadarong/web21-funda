import { useEffect } from 'react';

import { authService } from '@/services/authService';
import { useAuthActions } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, clearAuth } = useAuthActions();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. 먼저 /me로 유저 정보 확인
        console.log('[AuthProvider] 유저 정보 조회 중...');
        const user = await authService.getCurrentUser();

        if (user) {
          setUser(user);

          console.log('[AuthProvider] 유저 정보 조회 성공:', user);
        } else {
          // /me 실패 시 refresh 시도 (refreshToken은 쿠키에 있음)

          console.log('[AuthProvider] /me 실패. Refresh 시도...');
          const refreshResult = await authService.refreshToken();

          if (refreshResult) {
            setUser(refreshResult.user);
            console.log('[AuthProvider] Refresh 성공 - 유저 정보:', refreshResult.user);
          } else {
            console.log('[AuthProvider] Refresh 실패. 로그인되지 않은 상태입니다.');
            clearAuth();
          }
        }
      } catch (error) {
        console.error('[AuthProvider] 인증 초기화 중 오류:', error);
        clearAuth();
      }
    };

    initializeAuth();
  }, [setUser, clearAuth]);

  return <>{children}</>;
};
