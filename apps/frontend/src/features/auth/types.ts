export interface AuthUser {
  id: number;
  displayName: string;
  email?: string | null;
  profileImageUrl?: string | null;
  role: 'user' | 'admin';
  heartCount: number;
  maxHeartCount: number;
  experience: number;
  currentStreak: number;
  provider: 'github' | 'google';
}
