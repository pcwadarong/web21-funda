import { Injectable } from '@nestjs/common';

import { BattleRoomState } from './battle-state';

@Injectable()
export class BattleStore {
  private readonly rooms = new Map<string, BattleRoomState>();

  /**
   * 방 상태를 조회한다.
   *
   * @param roomId 방 ID
   * @returns 방 상태
   */
  getRoom(roomId: string): BattleRoomState | null {
    return this.rooms.get(roomId) ?? null;
  }

  /**
   * 방 상태를 저장한다.
   *
   * @param room 방 상태
   * @returns 없음
   */
  setRoom(room: BattleRoomState): void {
    this.rooms.set(room.roomId, room);
  }

  /**
   * 방을 삭제한다.
   *
   * @param roomId 방 ID
   * @returns 없음
   */
  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  /**
   * 방 존재 여부를 확인한다.
   *
   * @param roomId 방 ID
   * @returns 존재 여부
   */
  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /**
   * 모든 방 상태를 조회한다.
   *
   * @returns 방 상태 목록
   */
  getAllRooms(): BattleRoomState[] {
    return Array.from(this.rooms.values());
  }
}
