import { redirect } from 'react-router-dom';

import { Loading } from '@/comp/Loading';
import { useAuthStore } from '@/store/authStore';

/**
 * 로그인 사용자 전용 Loader
 */
export const protectedLoader = () => {
  const { isLoggedIn, isAuthReady } = useAuthStore.getState();
  if (!isAuthReady) return <Loading />;
  if (!isLoggedIn) return redirect('/login');
  return null;
};

/**
 * 비로그인 사용자(Guest) 전용 Loader
 */
export const guestLoader = () => {
  const { isLoggedIn, isAuthReady } = useAuthStore.getState();
  if (!isAuthReady) return <Loading />;
  if (isLoggedIn) return redirect('/learn');
  return null;
};
