import type { Server } from 'socket.io';
import type { Socket } from 'socket.io';

import type { BattleRoomState } from './battle-state';
import { BattleGateway } from './battle.gateway';
import type { BattleService } from './battle.service';

const createRoom = (overrides: Partial<BattleRoomState>): BattleRoomState => ({
  roomId: 'room-1',
  hostParticipantId: 'participant-1',
  status: 'waiting',
  settings: {
    fieldSlug: 'fe',
    maxPlayers: 2,
    timeLimitType: 'recommended',
    timeLimitSeconds: 15,
  },
  participants: [
    {
      participantId: 'participant-1',
      userId: 1,
      displayName: 'player-1',
      score: 0,
      submissions: [],
      isConnected: true,
      isHost: true,
      joinedAt: Date.now(),
      leftAt: null,
    },
  ],
  readyParticipantIds: [],
  inviteToken: 'invite-1',
  inviteExpired: false,
  countdownEndsAt: null,
  startedAt: null,
  endedAt: null,
  currentQuizIndex: 0,
  totalQuizzes: 10,
  quizIds: [],
  quizEndsAt: null,
  resultEndsAt: null,
  ...overrides,
});

describe('BattleGateway', () => {
  it('대기실 상태에서 연결 해제 시 참가자를 퇴장 처리한다', () => {
    const room = createRoom({ status: 'waiting' });
    const battleService = {
      getAllRooms: jest.fn().mockReturnValue([room]),
      getRoom: jest.fn().mockReturnValue(room),
      saveRoom: jest.fn(),
    } as unknown as BattleService;

    const gateway = new BattleGateway(battleService);
    const emitMock = jest.fn();
    const serverMock = {
      to: jest.fn().mockReturnValue({ emit: emitMock }),
    } as unknown as Server;

    (gateway as unknown as { server: Server }).server = serverMock;

    const client = { id: 'participant-1' } as Socket;

    (
      gateway as unknown as {
        handleDisconnectInternal: (socket: Socket) => void;
      }
    ).handleDisconnectInternal(client);

    expect(battleService.saveRoom).toHaveBeenCalledTimes(1);

    const savedRoom = (battleService.saveRoom as jest.Mock).mock.calls[0][0] as BattleRoomState;
    expect(savedRoom.participants).toHaveLength(0);
  });
});
