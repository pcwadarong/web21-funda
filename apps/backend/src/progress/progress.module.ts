import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolveLog, UserQuizStatus, UserStepAttempt, UserStepStatus } from './entities';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuizStatus, UserStepStatus, UserStepAttempt, SolveLog])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [TypeOrmModule],
})
export class ProgressModule {}
