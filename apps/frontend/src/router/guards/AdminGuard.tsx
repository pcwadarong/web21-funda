import { Navigate, Outlet } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useAuthStore, useIsAuthReady } from '@/store/authStore';

/**
 * 관리자 권한을 체크하는 Guard
 * Router 레벨에서 이미 로그인 여부를 체크했으므로, 여기서는 관리자 권한만 확인한다.
 */
export const AdminGuard = () => {
  const isAuthReady = useIsAuthReady();
  const user = useAuthStore(state => state.user);

  // 인증 준비 중일 때는 아무것도 렌더링하지 않음
  if (!isAuthReady) return <Loading />;

  // 사용자가 없거나 관리자 권한이 없으면 접근 거부
  if (!user || user.role !== 'admin') {
    return <Navigate to="/learn" replace />;
  }

  return <Outlet />;
};
