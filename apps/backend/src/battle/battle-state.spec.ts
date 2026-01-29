import { applyLeave, applyStart, BattleRoomState } from './battle-state';

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
  startedAt: null,
  endedAt: null,
  currentQuizIndex: 0,
  totalQuizzes: 10,
  quizIds: [],
  quizEndsAt: null,
  resultEndsAt: null,
};

describe('battle-state', () => {
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
});
