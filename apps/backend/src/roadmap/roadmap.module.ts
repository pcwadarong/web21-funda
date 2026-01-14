import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolveLog, UserStepAttempt } from '../progress/entities';

import { Field, Quiz, Step, Unit } from './entities';
import { FieldsController } from './fields.controller';
import { QuizzesController } from './quizzes.controller';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { StepsController } from './steps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Field, Unit, Step, Quiz, SolveLog, UserStepAttempt])],
  controllers: [RoadmapController, FieldsController, StepsController, QuizzesController],
  providers: [RoadmapService],
  exports: [TypeOrmModule],
})
export class RoadmapModule {}
