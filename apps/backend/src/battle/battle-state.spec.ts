import {
  applyCancelCountdown,
  applyDisconnect,
  applyLeave,
  applyStart,
  applyStartCountdown,
  BattleRoomState,
  clampMaxPlayers,
  MAX_BATTLE_PLAYERS,
} from './battle-state';

const baseRoomState: BattleRoomState = {
  roomId: 'room_test',
  hostParticipantId: 'socket-1',
  status: 'waiting',
  settings: {
    fieldSlug: 'fe',
    maxPlayers: 2,
    timeLimitType: 'recommended',
    timeLimitSeconds: 15,
  },
  participants: [
    {
      participantId: 'socket-1',
      userId: 1,
      displayName: 'host',
      score: 0,
      submissions: [],
      isConnected: true,
      isHost: true,
      joinedAt: 1,
      leftAt: null,
    },
    {
      participantId: 'socket-2',
      userId: 2,
      displayName: 'guest',
      score: 0,
      submissions: [],
      isConnected: true,
      isHost: false,
      joinedAt: 2,
      leftAt: null,
    },
  ],
  readyParticipantIds: ['socket-1', 'socket-2'],
  inviteToken: 'token',
  inviteExpired: false,
  countdownEndsAt: null,
  startedAt: null,
  endedAt: null,
  currentQuizIndex: 0,
  totalQuizzes: 10,
  quizIds: [],
  quizEndsAt: null,
  resultEndsAt: null,
};

describe('battle-state', () => {
  describe('clampMaxPlayers', () => {
    it('상한선을 초과하면 최대 인원으로 보정한다.', () => {
      const normalized = clampMaxPlayers(MAX_BATTLE_PLAYERS + 5);

      expect(normalized).toBe(MAX_BATTLE_PLAYERS);
    });

    it('상한선 이하의 값은 그대로 유지한다.', () => {
      const normalized = clampMaxPlayers(MAX_BATTLE_PLAYERS);

      expect(normalized).toBe(MAX_BATTLE_PLAYERS);
    });
  });

  it('applyLeave는 준비 완료 목록에서 이탈한 참가자를 제거한다.', () => {
    const nextRoom = applyLeave(baseRoomState, {
      roomId: baseRoomState.roomId,
      participantId: 'socket-2',
      now: 100,
      penaltyScore: 0,
    });

    expect(nextRoom.readyParticipantIds).toEqual(['socket-1']);
  });

  it('applyStart는 준비 완료 목록을 초기화한다.', () => {
    const nextRoom = applyStart(baseRoomState, {
      roomId: baseRoomState.roomId,
      requesterParticipantId: 'socket-1',
      now: 100,
      quizIds: [1, 2, 3],
    });

    expect(nextRoom.readyParticipantIds).toEqual([]);
  });

  it('applyStartCountdown는 카운트다운 정보를 저장한다.', () => {
    const nextRoom = applyStartCountdown(baseRoomState, {
      roomId: baseRoomState.roomId,
      requesterParticipantId: 'socket-1',
      now: 100,
      countdownEndsAt: 4100,
      quizIds: [1, 2, 3],
    });

    expect(nextRoom.status).toBe('countdown');
    expect(nextRoom.countdownEndsAt).toBe(4100);
    expect(nextRoom.quizIds).toEqual([1, 2, 3]);
  });

  it('applyCancelCountdown는 대기 상태로 되돌린다.', () => {
    const countdownRoom = applyStartCountdown(baseRoomState, {
      roomId: baseRoomState.roomId,
      requesterParticipantId: 'socket-1',
      now: 100,
      countdownEndsAt: 4100,
      quizIds: [1, 2, 3],
    });

    const nextRoom = applyCancelCountdown(countdownRoom);

    expect(nextRoom.status).toBe('waiting');
    expect(nextRoom.countdownEndsAt).toBeNull();
    expect(nextRoom.quizIds).toEqual([]);
  });

  it('applyDisconnect는 참가자를 목록에서 유지한 채 연결 해제 처리한다.', () => {
    const nextRoom = applyDisconnect(baseRoomState, {
      roomId: baseRoomState.roomId,
      participantId: 'socket-2',
      now: 200,
    });

    const disconnected = nextRoom.participants.find(p => p.participantId === 'socket-2');
    expect(disconnected?.isConnected).toBe(false);
  });

  it('applyLeave는 인원 부족으로 무효 처리될 때 endedAt을 기록한다.', () => {
    const inProgressRoom: BattleRoomState = {
      ...baseRoomState,
      status: 'in_progress',
    };

    const now = 500;
    const nextRoom = applyLeave(inProgressRoom, {
      roomId: inProgressRoom.roomId,
      participantId: 'socket-2',
      now,
      penaltyScore: -999,
    });

    expect(nextRoom.status).toBe('invalid');
    expect(nextRoom.endedAt).toBe(now);
  });
});
