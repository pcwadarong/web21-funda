import { apiFetch } from './api';

/**
 * 배틀 방 생성 응답 형식
 */
export interface CreateBattleRoomResponse {
  roomId: string;
  inviteToken: string;
}

export const battleService = {
  /**
   * 배틀 방을 생성하고 초대 토큰을 반환한다.
   */
  async createBattleRoom(): Promise<CreateBattleRoomResponse> {
    return apiFetch.post<CreateBattleRoomResponse>(`/battles/rooms`);
  },
};
