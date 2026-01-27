import { Injectable } from '@nestjs/common';

import { BattleStore } from './battle.store';
import { BattleRoomState } from './battle-state';

@Injectable()
export class BattleService {
  constructor(private readonly battleStore: BattleStore) {}

  /**
   * 방 상태를 조회한다.
   *
   * @param roomId 방 ID
   * @returns 방 상태
   */
  getRoom(roomId: string): BattleRoomState | null {
    return this.battleStore.getRoom(roomId);
  }

  /**
   * 방 상태를 저장한다.
   *
   * @param room 방 상태
   * @returns 없음
   */
  saveRoom(room: BattleRoomState): void {
    this.battleStore.setRoom(room);
  }

  /**
   * 방을 삭제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  removeRoom(roomId: string): void {
    this.battleStore.deleteRoom(roomId);
  }

  /**
   * 모든 방 상태를 조회한다.
   *
   * @returns 방 상태 목록
   */
  getAllRooms(): BattleRoomState[] {
    return this.battleStore.getAllRooms();
  }
}
