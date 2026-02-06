import { Suspense, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useAuthStore, useIsAuthReady } from '@/store/authStore';

export const LoginGuard = () => {
  const isAuthReady = useIsAuthReady();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const navigate = useNavigate();

  // 로그아웃 후 리다이렉트 처리
  useEffect(() => {
    if (isAuthReady && !isLoggedIn) {
      const postLogoutRedirectPath = sessionStorage.getItem('postLogoutRedirectPath');
      if (postLogoutRedirectPath) {
        sessionStorage.removeItem('postLogoutRedirectPath');
        navigate(postLogoutRedirectPath, { replace: true });
      }
    }
  }, [isAuthReady, isLoggedIn, navigate]);

  if (!isAuthReady) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
};
