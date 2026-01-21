import { Navigate, Outlet } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useAuthStore, useIsAuthReady } from '@/store/authStore';

export const LoginGuard = () => {
  const isAuthReady = useIsAuthReady();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  if (!isAuthReady) return <Loading />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <Outlet />;
};
