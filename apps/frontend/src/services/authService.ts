import type { AuthUser } from '@/types';

export const authService = {
  async loginWithGoogle(): Promise<AuthUser> {
    // TODO: Implement Google OAuth login
    throw new Error('Not implemented');
  },

  async loginWithGitHub(): Promise<AuthUser> {
    // TODO: Implement GitHub OAuth login
    throw new Error('Not implemented');
  },

  async logout(): Promise<void> {
    // TODO: Implement logout
    throw new Error('Not implemented');
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    // TODO: Implement get current user
    return null;
  },
};
