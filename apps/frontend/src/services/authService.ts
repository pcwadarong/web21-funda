import type { AuthUser } from '@/feat/auth/types';

import { apiFetch, BASE_URL } from './api';

interface RefreshResponse {
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export const authService = {
  async loginWithGoogle(): Promise<void> {
    // TODO: Google OAuth 연동 예정
    throw new Error('Not implemented');
  },

  async loginWithGitHub(): Promise<void> {
    const targetUrl = `${BASE_URL}/auth/github`;
    window.location.href = targetUrl;
  },

  async logout(): Promise<void> {
    return apiFetch.post('/auth/logout');
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiFetch.get<MeResponse>('/auth/me');
      return response.user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  async refreshToken(): Promise<RefreshResponse | null> {
    try {
      const response = await apiFetch.post<RefreshResponse>('/auth/refresh');
      return response;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  },
};
