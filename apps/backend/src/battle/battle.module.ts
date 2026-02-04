import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisService } from '../common/redis/redis.service';
import { CodeFormatter } from '../common/utils/code-formatter';
import { QuizContentService } from '../common/utils/quiz-content.service';
import { QuizResultService } from '../common/utils/quiz-result.service';
import { Field } from '../roadmap/entities/field.entity';
import { Quiz } from '../roadmap/entities/quiz.entity';
import { Step } from '../roadmap/entities/step.entity';
import { Unit } from '../roadmap/entities/unit.entity';
import { User } from '../users/entities/user.entity';

import { BattleController } from './battle.controller';
import { BattleGateway } from './battle.gateway';
import { BattleService } from './battle.service';
import { BattleStore } from './battle.store';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Step, Unit, Field, User])],
  controllers: [BattleController],
  providers: [
    BattleStore,
    BattleService,
    BattleGateway,
    CodeFormatter,
    QuizContentService,
    QuizResultService,
    RedisService,
  ],
})
export class BattleModule {}
