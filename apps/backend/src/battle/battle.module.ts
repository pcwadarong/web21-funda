import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field } from '../roadmap/entities/field.entity';
import { Quiz } from '../roadmap/entities/quiz.entity';
import { Step } from '../roadmap/entities/step.entity';
import { Unit } from '../roadmap/entities/unit.entity';

import { BattleController } from './battle.controller';
import { BattleGateway } from './battle.gateway';
import { BattleService } from './battle.service';
import { BattleStore } from './battle.store';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Step, Unit, Field])],
  controllers: [BattleController],
  providers: [BattleStore, BattleService, BattleGateway],
})
export class BattleModule {}
