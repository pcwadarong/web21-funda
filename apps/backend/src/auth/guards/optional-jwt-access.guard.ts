import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

type RequestWithCookies = Request & { cookies?: Record<string, string> };

@Injectable()
export class OptionalJwtAccessGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithCookies>();
    const hasToken = this.hasAccessToken(request);

    if (hasToken === false) {
      return true;
    }

    return super.canActivate(context);
  }

  private hasAccessToken(request: RequestWithCookies): boolean {
    const tokenFromHeader = this.getTokenFromAuthorizationHeader(request);
    if (tokenFromHeader !== null) {
      return true;
    }

    const tokenFromCookie = this.getTokenFromCookie(request);
    if (tokenFromCookie !== null) {
      return true;
    }

    return false;
  }

  private getTokenFromAuthorizationHeader(request: Request): string | null {
    const authorizationHeader = request.headers?.authorization;
    if (authorizationHeader === undefined || authorizationHeader === null) {
      return null;
    }

    if (typeof authorizationHeader !== 'string') {
      return null;
    }

    if (authorizationHeader.length === 0) {
      return null;
    }

    const prefix = 'Bearer ';
    if (!authorizationHeader.startsWith(prefix)) {
      return null;
    }

    const token = authorizationHeader.slice(prefix.length).trim();
    if (token.length === 0) {
      return null;
    }

    return token;
  }

  private getTokenFromCookie(request: RequestWithCookies): string | null {
    const tokenFromCookie = request.cookies?.accessToken;
    if (tokenFromCookie !== undefined && tokenFromCookie !== null && tokenFromCookie.length > 0) {
      return tokenFromCookie;
    }

    const rawCookieHeader = request.headers?.cookie;
    if (rawCookieHeader === undefined || rawCookieHeader === null) {
      return null;
    }

    if (typeof rawCookieHeader !== 'string') {
      return null;
    }

    if (rawCookieHeader.length === 0) {
      return null;
    }

    const parsedCookie = this.parseCookieHeader(rawCookieHeader);
    const tokenFromHeaderCookie = parsedCookie.accessToken;
    if (
      tokenFromHeaderCookie !== undefined &&
      tokenFromHeaderCookie !== null &&
      tokenFromHeaderCookie.length > 0
    ) {
      return tokenFromHeaderCookie;
    }

    return null;
  }

  private parseCookieHeader(header: string): Record<string, string> {
    return header.split(';').reduce<Record<string, string>>((accumulator, part) => {
      const [rawKey, ...rest] = part.split('=');
      const key = rawKey?.trim();
      if (!key) {
        return accumulator;
      }

      const value = rest.join('=').trim();
      accumulator[key] = value;
      return accumulator;
    }, {});
  }
}
