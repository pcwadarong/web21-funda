import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 액세스 토큰 인증을 처리하는 가드.
 */
@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt') {}
