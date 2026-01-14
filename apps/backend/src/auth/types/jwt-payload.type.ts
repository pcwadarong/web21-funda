import { AuthProvider, UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: number; // 사용자 ID
  role: UserRole;
  provider: AuthProvider;
}
