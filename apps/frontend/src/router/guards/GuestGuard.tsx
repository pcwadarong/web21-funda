import { Navigate, Outlet } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useAuthStore, useIsAuthReady } from '@/store/authStore';

export const GuestGuard = () => {
  const isAuthReady = useIsAuthReady();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  if (!isAuthReady) return <Loading />;
  // 이미 로그인된 사용자가 /login에 접근하면 /learn으로 보냄
  if (isLoggedIn) return <Navigate to="/learn" replace />;

  return <Outlet />;
};
