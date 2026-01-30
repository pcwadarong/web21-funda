import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolveLog } from '../progress/entities/solve-log.entity';
import { UserStepAttempt } from '../progress/entities/user-step-attempt.entity';
import { User } from '../users/entities/user.entity';

import { ProfileCharacter } from './entities/profile-character.entity';
import { UserFollow } from './entities/user-follow.entity';
import { UserProfileCharacter } from './entities/user-profile-character.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      SolveLog,
      UserStepAttempt,
      UserFollow,
      ProfileCharacter,
      UserProfileCharacter,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
