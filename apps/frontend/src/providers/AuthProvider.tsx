import { useCallback, useEffect, useRef } from 'react';

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

  // 로컬 기록 서버와 동기화
  const syncLocalProgress = useCallback(async () => {
    if (hasSynced.current) return;

    const storage = storageUtil.get();
    const stepIds = storage.solved_step_history;
    if (stepIds.length === 0) return;

    hasSynced.current = true;
    try {
      await progressService.syncStepHistory(stepIds);
      storageUtil.set({ ...storage, solved_step_history: [] });
    } catch {
      hasSynced.current = false;
    }
  }, []);

  // 인증 성공 시 동기화 및 정보 갱신
  const handleAuthSuccess = useCallback(async () => {
    await syncLocalProgress();
    const updatedUser = await authService.getCurrentUser();
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [syncLocalProgress, setUser]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. 유효한 세션이 있는지 확인
        let user = await authService.getCurrentUser();

        // 2. 세션이 없다면 토큰 재발급 시도
        if (!user) {
          const refreshResult = await authService.refreshToken();
          if (refreshResult) user = refreshResult.user;
        }

        // 3. 최종적으로 인증된 상태라면 후속 처리 실행
        if (user) await handleAuthSuccess();
        else clearAuth();
      } catch {
        clearAuth();
      } finally {
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, [clearAuth, setAuthReady, handleAuthSuccess]);

  return <>{children}</>;
};
