import type { Server, Socket } from 'socket.io';

import { BattleGateway } from './battle.gateway';
import type { BattleService } from './battle.service';
import type { BattleRoomState } from './battle-state';

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

  it('인원 부족으로 invalid 상태가 되면 예약 타이머를 정리해야 한다', () => {
    const room = createRoom({
      status: 'in_progress',
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
        {
          participantId: 'participant-2',
          userId: 2,
          displayName: 'player-2',
          score: 0,
          submissions: [],
          isConnected: true,
          isHost: false,
          joinedAt: Date.now(),
          leftAt: null,
        },
      ],
    });
    const battleService = {
      getRoom: jest.fn().mockReturnValue(room),
      saveRoom: jest.fn(),
    } as unknown as BattleService;

    const gateway = new BattleGateway(battleService);
    const emitMock = jest.fn();
    const serverMock = {
      to: jest.fn().mockReturnValue({ emit: emitMock }),
    } as unknown as Server;

    (gateway as unknown as { server: Server }).server = serverMock;

    const clearRoomTimersSpy = jest.spyOn(
      gateway as unknown as { clearRoomTimers: (roomId: string) => void },
      'clearRoomTimers',
    );

    const client = {
      id: 'participant-1',
      leave: jest.fn(),
      emit: jest.fn(),
    } as unknown as Socket;

    gateway.handleLeave({ roomId: room.roomId }, client);

    expect(clearRoomTimersSpy).toHaveBeenCalledWith(room.roomId);
    const savedRoom = (battleService.saveRoom as jest.Mock).mock.calls[0][0] as BattleRoomState;
    expect(savedRoom.status).toBe('invalid');
  });
});
