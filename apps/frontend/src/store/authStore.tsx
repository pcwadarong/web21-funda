import { create } from 'zustand';

import type { AuthUser } from '@/feat/auth/types';

// 스토어의 데이터 타입 정의
interface AuthState {
  isLoggedIn: boolean;
  isAuthReady: boolean;
  user: AuthUser | null;
  actions: {
    setIsLoggedIn: (status: boolean) => void;
    setUser: (user: AuthUser | null) => void;
    setAuthReady: (status: boolean) => void;
    clearAuth: () => void;
  };
}

const initialState = {
  isLoggedIn: false,
  isAuthReady: false,
  user: null,
};

export const useAuthStore = create<AuthState>(set => ({
  ...initialState,
  actions: {
    setIsLoggedIn: status => set({ isLoggedIn: status }),
    setUser: user => set({ user, isLoggedIn: !!user }),
    setAuthReady: status => set({ isAuthReady: status }),
    clearAuth: () => set({ isLoggedIn: false, user: null }),
  },
}));

export const useAuthUser = () => useAuthStore(state => state.user);
export const useIsLoggedIn = () => useAuthStore(state => state.isLoggedIn);
export const useIsAuthReady = () => useAuthStore(state => state.isAuthReady);
export const useAuthActions = () => useAuthStore(state => state.actions);
