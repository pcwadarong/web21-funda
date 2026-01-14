export const authService = {
  async loginWithGoogle(): Promise<void> {
    // TODO: Google OAuth 연동 예정
    throw new Error('Not implemented');
  },

  async loginWithGitHub(): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
    const targetUrl = `${baseUrl}/auth/github`;

    window.location.href = targetUrl;
  },

  async logout(): Promise<void> {
    // TODO: Implement logout
    throw new Error('Not implemented');
  },

  async getCurrentUser(): Promise<null> {
    // TODO: Implement get current user
    return null;
  },
};
