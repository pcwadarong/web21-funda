import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisService } from '../common/redis/redis.service';
import { CodeFormatter } from '../common/utils/code-formatter';
import { QuizContentService } from '../common/utils/quiz-content.service';
import { CheckpointQuizPool, Quiz, Step } from '../roadmap/entities';
import { User } from '../users/entities/user.entity';

import { SolveLog, UserQuizStatus, UserStepAttempt, UserStepStatus } from './entities';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserQuizStatus,
      UserStepStatus,
      UserStepAttempt,
      SolveLog,
      Step,
      CheckpointQuizPool,
      Quiz,
      User,
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService, CodeFormatter, QuizContentService, RedisService],
  exports: [TypeOrmModule],
})
export class ProgressModule {}
