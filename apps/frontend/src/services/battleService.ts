import type { BattleRoomSettings } from '@/feat/battle/types';

import { apiFetch } from './api';

/**
 * 배틀 방 생성 응답 형식
 */
export interface CreateBattleRoomResponse {
  roomId: string;
  inviteToken: string;
}

interface JoinBattleRoomResponse {
  roomId: string;
  canJoin: boolean;
  settings: BattleRoomSettings;
}

export const battleService = {
  createBattleRoom: async (): Promise<CreateBattleRoomResponse> =>
    apiFetch.post('/battles/rooms', {}),

  joinBattleRoom: async (inviteToken: string): Promise<JoinBattleRoomResponse> =>
    apiFetch.post('/battles/rooms/join', { inviteToken }),
};
