import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiAskModule } from './ai-ask/ai-ask.module';
import { AuthModule } from './auth/auth.module';
import { BackofficeModule } from './backoffice/backoffice.module';
import { createTypeOrmOptions } from './config/typeorm.config';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationModule } from './notification/notification.module';
import { ProgressModule } from './progress/progress.module';
import { RankingModule } from './ranking/ranking.module';
import { ReportModule } from './report/report.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'local'}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: createTypeOrmOptions,
    }),
    AuthModule,
    RoadmapModule,
    ProgressModule,
    BackofficeModule,
    MetricsModule,
    ReportModule,
    ScheduleModule.forRoot(),
    NotificationModule,
    RankingModule,
    AiAskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
