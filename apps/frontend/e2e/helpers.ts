export type ApiResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  result: T;
};

export type AuthUser = {
  id: number;
  displayName: string;
  email?: string | null;
  profileImageUrl?: string | null;
  role: 'user' | 'admin';
  isEmailSubscribed: boolean;
  heartCount: number;
  maxHeartCount: number;
  experience: number;
  diamondCount: number;
  currentStreak: number;
  provider: 'github' | 'google';
};

export function createSuccessResponse<T>(result: T): ApiResponse<T> {
  return {
    success: true,
    code: 200,
    message: 'OK',
    result,
  };
}

export function createFailureResponse(message: string): ApiResponse<null> {
  return {
    success: false,
    code: 400,
    message,
    result: null,
  };
}

export function buildAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 1,
    displayName: '테스트 사용자',
    email: 'test@example.com',
    profileImageUrl: null,
    role: 'user',
    isEmailSubscribed: false,
    heartCount: 5,
    maxHeartCount: 5,
    experience: 1200,
    diamondCount: 3,
    currentStreak: 2,
    provider: 'github',
    ...overrides,
  };
}
