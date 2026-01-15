import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 리프레시 토큰 인증을 처리하는 가드.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
