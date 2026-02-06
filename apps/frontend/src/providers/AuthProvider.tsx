import { useCallback, useEffect, useRef } from 'react';

import { useCurrentUserQuery } from '@/hooks/queries/authQueries';
import { useAuthActions } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, clearAuth, setAuthReady } = useAuthActions();
  const hasRequestedGuestId = useRef(false);

  const { data, isLoading, isError } = useCurrentUserQuery();

  // 비로그인 사용자에게 client_id 발급
  const initGuestId = useCallback(async () => {
    if (hasRequestedGuestId.current) return;

    hasRequestedGuestId.current = true;

    await fetch('/api/auth/guest-id', { method: 'GET' });
  }, []);

  useEffect(() => {
    const finalizeAuth = async () => {
      if (isLoading) return;

      if (isError) {
        clearAuth();
        setAuthReady(true);
        return;
      }

      if (data) {
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
  }, [clearAuth, data, initGuestId, isError, isLoading, setAuthReady, setUser]);

  return <>{children}</>;
};
