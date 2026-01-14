import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from './types/jwt-payload.type';

export type RefreshRequestUser = JwtPayload & { refreshToken: string };

type RequestWithCookies = Request & { cookies?: Record<string, string> };

/**
 * 리프레시 토큰 검증 전략.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const cookieExtractor = (request: RequestWithCookies): string | null => {
      const tokenFromCookie = request.cookies?.refreshToken;
      if (tokenFromCookie && tokenFromCookie.length > 0) {
        return tokenFromCookie;
      }

      const rawCookieHeader = request.headers?.cookie;
      if (!rawCookieHeader || typeof rawCookieHeader !== 'string') {
        return null;
      }

      const parsed = JwtRefreshStrategy.parseCookieHeader(rawCookieHeader);
      if (parsed.refreshToken && parsed.refreshToken.length > 0) {
        return parsed.refreshToken;
      }

      return null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET', 'local-refresh-secret'),
      passReqToCallback: true,
    });
  }

  validate(request: RequestWithCookies, payload: JwtPayload): RefreshRequestUser {
    const refreshToken = JwtRefreshStrategy.extractRefreshToken(request);
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    return {
      ...payload,
      refreshToken,
    };
  }

  private static extractRefreshToken(request: RequestWithCookies): string | null {
    if (request.cookies?.refreshToken) {
      return request.cookies.refreshToken;
    }

    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader || typeof cookieHeader !== 'string') {
      return null;
    }

    const parsed = JwtRefreshStrategy.parseCookieHeader(cookieHeader);
    return parsed.refreshToken ?? null;
  }

  private static parseCookieHeader(header: string): Record<string, string> {
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
