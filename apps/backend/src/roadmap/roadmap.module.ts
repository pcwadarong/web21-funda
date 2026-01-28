import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisService } from '../common/redis/redis.service';
import { CodeFormatter } from '../common/utils/code-formatter';
import { QuizContentService } from '../common/utils/quiz-content.service';
import { SolveLog, UserStepAttempt, UserStepStatus } from '../progress/entities';
import { RankingModule } from '../ranking/ranking.module';
import { User } from '../users/entities/user.entity';

import { CheckpointQuizPool, Field, Quiz, Step, Unit } from './entities';
import { FieldsController } from './fields.controller';
import { QuizzesController } from './quizzes.controller';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { StepsController } from './steps.controller';
import { UnitsController } from './units.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Field,
      Unit,
      Step,
      Quiz,
      SolveLog,
      UserStepAttempt,
      UserStepStatus,
      User,
      CheckpointQuizPool,
    ]),
    RankingModule,
  ],
  controllers: [
    RoadmapController,
    FieldsController,
    StepsController,
    QuizzesController,
    UnitsController,
  ],
  providers: [RoadmapService, CodeFormatter, QuizContentService, RedisService],
  exports: [TypeOrmModule],
})
export class RoadmapModule {}
