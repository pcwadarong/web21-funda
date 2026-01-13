import { Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { GithubAuthGuard } from './guards/github.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { RequestMeta } from './types/request-meta.type';
import { AuthService } from './auth.service';
import type { GithubProfile } from './github.strategy';
import type { RefreshRequestUser } from './jwt-refresh.strategy';

type GithubRequest = {
  user?: GithubProfile;
  headers?: Record<string, unknown>;
  ip?: string;
};

type RefreshRequest = {
  user?: RefreshRequestUser;
  headers?: Record<string, unknown>;
  ip?: string;
};

type LogoutRequest = {
  cookies?: Record<string, string>;
};

type RequestWithMeta = {
  headers?: Record<string, unknown>;
  ip?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubLogin(): void {
    // GitHub OAuth 로그인 URL로 리다이렉트된다. 로직은 Strategy에서 처리
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Req() req: GithubRequest, @Res({ passthrough: true }) res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('GitHub 프로필 정보를 확인할 수 없습니다.');
    }

    const meta = this.toRequestMeta(req);
    const { accessToken, refreshToken, user } = await this.authService.handleGithubLogin(
      req.user,
      meta,
    );

    this.authService.attachRefreshTokenCookie(res, refreshToken);

    return {
      result: {
        accessToken,
        user,
      },
      message: 'GitHub 로그인에 성공했습니다.',
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: RefreshRequest, @Res({ passthrough: true }) res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('리프레시 토큰을 확인할 수 없습니다.');
    }

    const meta = this.toRequestMeta(req);
    const { accessToken, refreshToken, user } = await this.authService.rotateRefreshToken(
      req.user.sub,
      req.user.refreshToken,
      meta,
    );

    this.authService.attachRefreshTokenCookie(res, refreshToken);

    return {
      result: {
        accessToken,
        user,
      },
      message: '액세스 토큰을 재발급했습니다.',
    };
  }

  @Post('logout')
  async logout(@Req() req: LogoutRequest, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    this.authService.clearRefreshTokenCookie(res);

    return {
      result: {
        success: true,
      },
      message: '로그아웃되었습니다.',
    };
  }

  /**
   * 요청 메타데이터(UA, IP)를 추출한다. 토큰 재사용 감지 시 참고한다.
   */
  private toRequestMeta(request: RequestWithMeta): RequestMeta {
    const userAgentHeader = request.headers?.['user-agent'];
    const userAgent = typeof userAgentHeader === 'string' ? userAgentHeader : undefined;
    const ipAddress = typeof request.ip === 'string' ? request.ip : undefined;

    return { userAgent, ipAddress };
  }
}
