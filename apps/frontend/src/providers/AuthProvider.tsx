import { useCallback, useEffect, useRef } from 'react';

import { useCurrentUserQuery } from '@/hooks/queries/authQueries';
import { progressService } from '@/services/progressService';
import { useAuthActions } from '@/store/authStore';
import { storageUtil } from '@/utils/storage';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, clearAuth, setAuthReady } = useAuthActions();
  const hasSynced = useRef(false);

  const { data } = useCurrentUserQuery();

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

  useEffect(() => {
    const finalizeAuth = async () => {
      if (data) {
        await syncLocalProgress();
        setUser(data);
      } else {
        clearAuth();
      }
      setAuthReady(true);
    };

    finalizeAuth().catch(() => {
      clearAuth();
      setAuthReady(true);
    });
  }, [clearAuth, data, setAuthReady, setUser, syncLocalProgress]);

  return <>{children}</>;
};
