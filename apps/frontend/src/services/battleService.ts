import { apiFetch } from './api';

/**
 * 배틀 방 생성 응답 형식
 */
export interface CreateBattleRoomResponse {
  roomId: string;
  inviteToken: string;
}

export interface JoinBattleRoomResponse {
  roomId: string;
  canJoin: boolean;
}

export const battleService = {
  /**
   * 배틀 방을 생성하고 초대 토큰을 반환한다.
   */
  async createBattleRoom(): Promise<CreateBattleRoomResponse> {
    return apiFetch.post<CreateBattleRoomResponse>(`/battles/rooms`);
  },

  /**
   * 초대 토큰으로 방 참가 가능 여부를 확인한다.
   */
  async joinBattleRoom(inviteToken: string): Promise<JoinBattleRoomResponse> {
    return apiFetch.post<JoinBattleRoomResponse>(`/battles/rooms/join`, { inviteToken });
  },
};
