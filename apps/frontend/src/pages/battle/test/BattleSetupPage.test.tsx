import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BattleSetupPage } from '@/pages/battle/BattleSetupPage';

const mockUseBattleSocket = vi.fn();
const mockUseJoinBattleRoomQuery = vi.fn();
const mockLeaveBattle = vi.fn();

vi.mock('@/feat/battle/hooks/useBattleSocket', () => ({
  useBattleSocket: () => mockUseBattleSocket(),
}));

vi.mock('@/hooks/queries/battleQueries', () => ({
  useJoinBattleRoomQuery: (inviteToken: string) => mockUseJoinBattleRoomQuery(inviteToken),
}));

vi.mock('@/store/authStore', () => ({
  useAuthUser: () => null,
  useAuthProfileImageUrl: () => null,
}));

vi.mock('@/store/toastStore', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('@/components/Loading', () => ({
  Loading: () => <div data-testid="loading" />,
}));

vi.mock('@/features/battle/components/setup/BattleSetupContainer', () => ({
  BattleSetupContainer: () => <div data-testid="battle-setup" />,
}));

const defaultRoomSettings = { fieldSlug: 'cs', maxPlayers: 2, timeLimitType: 'recommended' };
let battleStateValue: {
  roomId: string | null;
  status: 'waiting' | 'countdown' | 'in_progress' | 'finished' | 'invalid';
  participants: [];
  settings: typeof defaultRoomSettings;
  countdownEndsAt: number | null;
};

const renderBattleSetupPage = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/battle/:inviteToken" element={<BattleSetupPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('BattleSetupPage 페이지', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    battleStateValue = {
      roomId: 'room-1',
      status: 'waiting',
      participants: [],
      settings: defaultRoomSettings,
      countdownEndsAt: null,
    };

    mockUseBattleSocket.mockReturnValue({
      socket: { id: 'socket-1' },
      battleState: battleStateValue,
      joinBattle: vi.fn(),
      leaveBattle: mockLeaveBattle,
      updateRoom: vi.fn(),
      startBattle: vi.fn(),
    });

    mockUseJoinBattleRoomQuery.mockReturnValue({
      data: {
        canJoin: true,
        roomId: 'room-1',
        settings: defaultRoomSettings,
      },
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('대기실에서 언마운트되면 leaveBattle을 호출한다', () => {
    const { unmount } = renderBattleSetupPage('/battle/invite-123');

    unmount();

    expect(mockLeaveBattle).toHaveBeenCalledTimes(1);
    expect(mockLeaveBattle).toHaveBeenCalledWith('room-1');
  });

  it('카운트다운 상태에서는 언마운트되어도 leaveBattle을 호출하지 않는다', () => {
    battleStateValue = {
      ...battleStateValue,
      status: 'countdown',
    };

    mockUseBattleSocket.mockReturnValue({
      socket: { id: 'socket-1' },
      battleState: battleStateValue,
      joinBattle: vi.fn(),
      leaveBattle: mockLeaveBattle,
      updateRoom: vi.fn(),
      startBattle: vi.fn(),
    });

    const { unmount } = renderBattleSetupPage('/battle/invite-123');

    unmount();

    expect(mockLeaveBattle).not.toHaveBeenCalled();
  });

  it('진행 중 상태에서는 언마운트되어도 leaveBattle을 호출하지 않는다', () => {
    battleStateValue = {
      ...battleStateValue,
      status: 'in_progress',
    };

    mockUseBattleSocket.mockReturnValue({
      socket: { id: 'socket-1' },
      battleState: battleStateValue,
      joinBattle: vi.fn(),
      leaveBattle: mockLeaveBattle,
      updateRoom: vi.fn(),
      startBattle: vi.fn(),
    });

    const { unmount } = renderBattleSetupPage('/battle/invite-123');

    unmount();

    expect(mockLeaveBattle).not.toHaveBeenCalled();
  });

  it('대기실에서 진행 중 상태로 전환될 때 leaveBattle을 호출하지 않는다', () => {
    const { rerender } = renderBattleSetupPage('/battle/invite-123');

    battleStateValue = {
      ...battleStateValue,
      status: 'in_progress',
    };

    mockUseBattleSocket.mockReturnValue({
      socket: { id: 'socket-1' },
      battleState: battleStateValue,
      joinBattle: vi.fn(),
      leaveBattle: mockLeaveBattle,
      updateRoom: vi.fn(),
      startBattle: vi.fn(),
    });

    rerender(
      <MemoryRouter initialEntries={['/battle/invite-123']}>
        <Routes>
          <Route path="/battle/:inviteToken" element={<BattleSetupPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockLeaveBattle).not.toHaveBeenCalled();
  });

  it('대기실에서 beforeunload가 발생하면 leaveBattle을 호출하지 않는다', () => {
    renderBattleSetupPage('/battle/invite-123');

    window.dispatchEvent(new Event('beforeunload'));

    expect(mockLeaveBattle).not.toHaveBeenCalled();
  });

  it('진행 중 상태에서는 beforeunload가 발생해도 leaveBattle을 호출하지 않는다', () => {
    battleStateValue = {
      ...battleStateValue,
      status: 'in_progress',
    };

    mockUseBattleSocket.mockReturnValue({
      socket: { id: 'socket-1' },
      battleState: battleStateValue,
      joinBattle: vi.fn(),
      leaveBattle: mockLeaveBattle,
      updateRoom: vi.fn(),
      startBattle: vi.fn(),
    });

    renderBattleSetupPage('/battle/invite-123');

    window.dispatchEvent(new Event('beforeunload'));

    expect(mockLeaveBattle).not.toHaveBeenCalled();
  });
});
