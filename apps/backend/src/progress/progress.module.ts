import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolveLog, UserQuizStatus, UserStepStatus } from './entities';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuizStatus, UserStepStatus, SolveLog])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [TypeOrmModule],
})
export class ProgressModule {}
