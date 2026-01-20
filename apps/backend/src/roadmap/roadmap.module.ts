import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CodeFormatter } from '../common/utils/code-formatter';
import { SolveLog, UserStepAttempt, UserStepStatus } from '../progress/entities';

import { CheckpointQuizPool, Field, Quiz, Step, Unit } from './entities';
import { FieldsController } from './fields.controller';
import { QuizzesController } from './quizzes.controller';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { StepsController } from './steps.controller';

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
      CheckpointQuizPool,
    ]),
  ],
  controllers: [RoadmapController, FieldsController, StepsController, QuizzesController],
  providers: [RoadmapService, CodeFormatter],
  exports: [TypeOrmModule],
})
export class RoadmapModule {}
