import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * GitHub OAuth 흐름 중 발생한 오류를 로그로 남기고, 에러 원인을 더 명확하게 전달하기 위한 가드.
 */
@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  private readonly logger = new Logger(GithubAuthGuard.name);

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err) {
      this.logger.error(`GitHub OAuth 처리 중 오류 발생: ${String(err)}`);
      throw err;
    }

    if (!user) {
      const request = context.switchToHttp().getRequest();
      const code = request.query?.code as string | undefined;
      this.logger.error(
        `GitHub OAuth 인증 실패. code=${code ?? '없음'}, info=${JSON.stringify(info)}`,
      );
      throw new UnauthorizedException('GitHub 인증에 실패했습니다.');
    }

    return user;
  }
}
