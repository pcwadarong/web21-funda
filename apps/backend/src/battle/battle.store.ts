import { Injectable } from '@nestjs/common';

import { BattleRoomState } from './battle-state';

@Injectable()
export class BattleStore {
  private readonly rooms = new Map<string, BattleRoomState>();

  getRoom(roomId: string): BattleRoomState | null {
    return this.rooms.get(roomId) ?? null;
  }

  setRoom(room: BattleRoomState): void {
    this.rooms.set(room.roomId, room);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }
}
