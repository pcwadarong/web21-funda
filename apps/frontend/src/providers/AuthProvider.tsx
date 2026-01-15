import { useEffect, useRef } from 'react';

import { authService } from '@/services/authService';
import { progressService } from '@/services/progressService';
import { useAuthActions } from '@/store/authStore';
import { storageUtil } from '@/utils/storage';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, clearAuth, setAuthReady } = useAuthActions();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncLocalProgress = async () => {
      if (hasSynced.current) return;
      hasSynced.current = true;

      const storage = storageUtil.get();
      const stepIds = storage.solved_step_history;

      if (stepIds.length === 0) return;

      try {
        await progressService.syncStepHistory(stepIds);
        // 동기화 성공 시 localStorage 초기화
        storageUtil.set({
          ...storage,
          solved_step_history: [],
        });
      } catch (error) {
        console.error('풀이 기록 동기화 실패:', error);
        hasSynced.current = false; // 다음에 다시 시도할 수 있도록
      }
    };

    const initializeAuth = async () => {
      try {
        // 1. 먼저 /me로 유저 정보 확인
        const user = await authService.getCurrentUser();

        if (user) {
          // 동기화 먼저 완료
          await syncLocalProgress();
          // 동기화 후 최신 user 정보 조회
          const updatedUser = await authService.getCurrentUser();
          if (updatedUser) {
            setUser(updatedUser);
          }
        } else {
          // /me 실패 시 refresh 시도 (refreshToken은 쿠키에 있음)
          const refreshResult = await authService.refreshToken();

          if (refreshResult) {
            // 동기화 먼저 완료
            await syncLocalProgress();
            // 동기화 후 최신 user 정보 조회
            const updatedUser = await authService.getCurrentUser();
            if (updatedUser) {
              setUser(updatedUser);
            }
          } else {
            clearAuth();
          }
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
