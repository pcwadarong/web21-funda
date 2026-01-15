import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import type { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt') {
  // 비로그인도 통과시키되, 유효한 토큰이면 req.user를 채우기 위해 사용한다.
  handleRequest<TUser = JwtPayload | null>(err: unknown, user: TUser): TUser | null {
    if (err || !user) {
      return null;
    }

    return user;
  }
}
