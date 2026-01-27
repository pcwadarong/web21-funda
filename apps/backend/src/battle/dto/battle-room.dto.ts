export type CreateBattleRoomRequest = {
  fieldSlug?: string;
  maxPlayers?: number;
  timeLimitType?: 'recommended' | 'relaxed' | 'fast';
};

export type CreateBattleRoomResponse = {
  roomId: string;
  inviteToken: string;
};

export type JoinBattleRoomRequest = {
  inviteToken: string;
};

export type JoinBattleRoomResponse = {
  roomId: string;
  canJoin: boolean;
};
