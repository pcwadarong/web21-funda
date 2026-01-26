import { Injectable } from '@nestjs/common';

import { BattleStore } from './battle.store';
import { BattleRoomState } from './battle-state';

@Injectable()
export class BattleService {
  constructor(private readonly battleStore: BattleStore) {}

  getRoom(roomId: string): BattleRoomState | null {
    return this.battleStore.getRoom(roomId);
  }

  saveRoom(room: BattleRoomState): void {
    this.battleStore.setRoom(room);
  }

  removeRoom(roomId: string): void {
    this.battleStore.deleteRoom(roomId);
  }
}
