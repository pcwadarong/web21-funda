import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from './types/jwt-payload.type';

type RequestWithCookies = Request & { cookies?: Record<string, string> };

/**
 * 액세스 토큰 검증 전략.
 * Bearer 헤더 또는 쿠키에서 토큰을 읽을 수 있다.
 */
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const cookieExtractor = (request: RequestWithCookies): string | null => {
      const tokenFromCookie = request.cookies?.accessToken;
      if (tokenFromCookie && tokenFromCookie.length > 0) return tokenFromCookie;

      const rawCookieHeader = request.headers?.cookie;
      if (!rawCookieHeader || typeof rawCookieHeader !== 'string') return null;

      const parsed = JwtAccessStrategy.parseCookieHeader(rawCookieHeader);
      if (parsed.accessToken && parsed.accessToken.length > 0) return parsed.accessToken;

      return null;
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'local-access-secret'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
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
