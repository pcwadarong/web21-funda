import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useBattleSocket } from '../useBattleSocket';

const connectMock = vi.fn();
const emitMock = vi.fn();
const onMock = vi.fn();
const offMock = vi.fn();

let socketStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

const socketMock = {
  id: 'socket-1',
  emit: emitMock,
  on: onMock,
  off: offMock,
};

const battleActions = {
  setBattleState: vi.fn(),
  setParticipants: vi.fn(),
  setQuiz: vi.fn(),
  setQuizSolution: vi.fn(),
  setQuestionStatus: vi.fn(),
  setSelectedAnswer: vi.fn(),
  reset: vi.fn(),
};

const battleState = {
  roomId: null,
  inviteToken: null,
  settings: null,
  hostParticipantId: null,
  status: 'waiting',
  participants: [],
  rankings: [],
  rewards: [],
  currentQuizIndex: 0,
  totalQuizzes: 0,
  remainingSeconds: 0,
  currentQuiz: null,
  currentQuizId: null,
  quizEndsAt: null,
  resultEndsAt: null,
  selectedAnswers: [],
  quizSolutions: [],
  questionStatuses: [],
  actions: battleActions,
};

vi.mock('@/providers/SocketProvider', () => ({
  useSocketContext: () => ({
    socket: socketMock,
    status: socketStatus,
    connect: connectMock,
    disconnect: vi.fn(),
  }),
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (state: any) => unknown) =>
    selector({
      isLoggedIn: true,
      user: { id: 1, displayName: 'Alice', profileImageUrl: null },
      isAuthReady: true,
    }),
}));

vi.mock('@/store/battleStore', () => {
  const storeHook = (selector?: (state: any) => unknown) =>
    selector ? selector(battleState) : battleState;

  storeHook.getState = () => ({
    roomId: null,
    participants: [],
  });

  return {
    useBattleStore: storeHook,
  };
});

vi.mock('@/store/toastStore', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('useBattleSocket', () => {
  it('소켓 연결 전 join 요청을 보관하고 연결 후 재시도한다', async () => {
    const { result, rerender } = renderHook(() => useBattleSocket());

    act(() => {
      result.current.joinBattle('room-1', { userId: 1, displayName: 'Alice' });
    });

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(emitMock).not.toHaveBeenCalled();

    socketStatus = 'connected';
    rerender();

    await waitFor(() => {
      expect(emitMock).toHaveBeenCalledWith('battle:join', {
        roomId: 'room-1',
        userId: 1,
        displayName: 'Alice',
      });
    });
  });
});
