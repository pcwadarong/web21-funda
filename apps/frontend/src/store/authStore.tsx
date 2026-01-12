import { create } from 'zustand';

// 스토어의 데이터 타입 정의
interface AuthState {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
}

export const initialState = {
  isLoggedIn: false,
};

export const useAuthStore = create<AuthState>(set => ({
  ...initialState,
  setIsLoggedIn: (status: boolean) => set({ isLoggedIn: status }),
}));
