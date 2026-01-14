import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, UserRefreshToken } from '../users/entities';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './github.strategy';
import { JwtAccessStrategy } from './jwt-access.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'local-access-secret'),
        signOptions: {
          expiresIn: `${config.get<number>('JWT_ACCESS_TTL', 900)}s`,
        },
      }),
    }),
    TypeOrmModule.forFeature([User, UserRefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
