import { apiFetch } from './api';

interface CreateBattleRoomResponse {
  roomId: string;
  inviteToken: string;
}

interface JoinBattleRoomResponse {
  roomId: string;
  canJoin: boolean;
}

export const battleService = {
  createBattleRoom: async (): Promise<CreateBattleRoomResponse> =>
    apiFetch.post('/battles/rooms', {}),

  joinBattleRoom: async (inviteToken: string): Promise<JoinBattleRoomResponse> =>
    apiFetch.post('/battles/rooms/join', { inviteToken }),
};
