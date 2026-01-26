import { Module } from '@nestjs/common';

import { BattleGateway } from './battle.gateway';
import { BattleService } from './battle.service';
import { BattleStore } from './battle.store';

@Module({
  providers: [BattleStore, BattleService, BattleGateway],
})
export class BattleModule {}
