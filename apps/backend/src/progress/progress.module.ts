import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CodeFormatter } from '../common/utils/code-formatter';
import { QuizContentService } from '../common/utils/quiz-content.service';
import { Quiz, Step } from '../roadmap/entities';
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
      Quiz,
      User,
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService, CodeFormatter, QuizContentService],
  exports: [TypeOrmModule],
})
export class ProgressModule {}
