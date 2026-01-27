import { Module } from '@nestjs/common';

import { BattleController } from './battle.controller';
import { BattleGateway } from './battle.gateway';
import { BattleService } from './battle.service';
import { BattleStore } from './battle.store';

@Module({
  controllers: [BattleController],
  providers: [BattleStore, BattleService, BattleGateway],
})
export class BattleModule {}
