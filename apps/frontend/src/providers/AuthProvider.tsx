import { useCallback, useEffect, useRef } from 'react';

import { useCurrentUserQuery } from '@/hooks/queries/authQueries';
import { useSyncStepHistoryMutation } from '@/hooks/queries/progressQueries';
import { useAuthActions } from '@/store/authStore';
import { storageUtil } from '@/utils/storage';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, clearAuth, setAuthReady } = useAuthActions();
  const hasSynced = useRef(false);
  const hasRequestedGuestId = useRef(false);

  const { data } = useCurrentUserQuery();
  const syncStepHistoryMutation = useSyncStepHistoryMutation();

  // 비로그인 사용자에게 client_id 발급
  const initGuestId = useCallback(async () => {
    if (hasRequestedGuestId.current) return;

    hasRequestedGuestId.current = true;
    try {
      console.log('initGuestId - fetching /api/auth/guest-id');
      const response = await fetch('/api/auth/guest-id', { method: 'GET' });
      console.log('initGuestId - response status:', response.status);
      console.log('initGuestId - response ok:', response.ok);
      const data = await response.json();
      console.log('initGuestId - response data:', data);
      const { clientId } = data.result;
      console.log('Guest clientId issued:', clientId);
    } catch (error) {
      console.error('Failed to get guest ID:', error);
    }
  }, []);

  // 로컬 기록 서버와 동기화
  const syncLocalProgress = useCallback(async () => {
    if (hasSynced.current) return;

    const storage = storageUtil.get();
    const stepIds = storage.solved_step_history;
    if (stepIds.length === 0) return;

    hasSynced.current = true;
    try {
      await syncStepHistoryMutation.mutateAsync(stepIds);
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
        await initGuestId();
        clearAuth();
      }
      setAuthReady(true);
    };

    finalizeAuth().catch(() => {
      clearAuth();
      setAuthReady(true);
    });
  }, [clearAuth, data, setAuthReady, setUser, syncLocalProgress, initGuestId]);

  return <>{children}</>;
};
