import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { type Profile, Strategy } from 'passport-github2';

/**
 * GitHub OAuth 전략.
 */
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'GITHUB_CALLBACK_URL',
        'http://localhost:3000/api/auth/github/callback',
      ),
      scope: ['user:email'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile): GithubProfile {
    const emails = profile.emails?.map(email => {
      const hasPrimaryFlag = 'primary' in email;
      const primaryValue = hasPrimaryFlag
        ? Boolean((email as { primary?: boolean }).primary)
        : false;

      return {
        value: email.value,
        primary: primaryValue,
      };
    });
    const photos = profile.photos?.map(photo => ({ value: photo.value }));

    return {
      id: profile.id,
      username: profile.username ?? '',
      displayName: profile.displayName ?? '',
      profileUrl: profile.profileUrl ?? undefined,
      emails,
      photos,
      raw: (profile as Profile & { _json?: unknown })._json,
      accessToken,
    };
  }
}

export interface GithubProfile {
  id: string;
  username: string;
  displayName: string;
  profileUrl?: string;
  emails?: Array<{ value: string; primary?: boolean }>;
  photos?: Array<{ value: string }>;
  raw?: unknown;
  accessToken?: string;
}
