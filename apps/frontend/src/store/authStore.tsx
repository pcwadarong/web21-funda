import { create } from 'zustand';

import type { AuthUser } from '@/feat/auth/types';

// 스토어의 데이터 타입 정의
interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  actions: {
    setIsLoggedIn: (status: boolean) => void;
    setUser: (user: AuthUser | null) => void;
    clearAuth: () => void;
  };
}

const initialState = {
  isLoggedIn: false,
  user: null,
};

export const useAuthStore = create<AuthState>(set => ({
  ...initialState,
  actions: {
    setIsLoggedIn: status => set({ isLoggedIn: status }),
    setUser: user => set({ user, isLoggedIn: !!user }),
    clearAuth: () => set(initialState),
  },
}));
