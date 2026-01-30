import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolveLog } from '../progress/entities/solve-log.entity';
import { UserStepAttempt } from '../progress/entities/user-step-attempt.entity';
import { Field } from '../roadmap/entities/field.entity';
import { User } from '../users/entities/user.entity';

import { UserFollow } from './entities/user-follow.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, SolveLog, UserStepAttempt, Field, UserFollow])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
