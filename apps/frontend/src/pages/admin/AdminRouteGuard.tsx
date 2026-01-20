import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore, useIsAuthReady } from '@/store/authStore';

/**
 * 관리자 전용 라우트를 보호한다.
 */
export const AdminRouteGuard = () => {
  const isAuthReady = useIsAuthReady();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const user = useAuthStore(state => state.user);

  if (!isAuthReady) {
    return null;
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/learn" replace />;
  }

  return <Outlet />;
};
