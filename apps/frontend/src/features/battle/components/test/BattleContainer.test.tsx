import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BattleLobbyContainer } from '@/feat/battle/components/lobby/BattleLobbyContainer';
import { lightTheme } from '@/styles/theme';

const mockOpenModal = vi.fn();

vi.mock('@/store/modalStore', () => ({
  useModal: () => ({
    openModal: mockOpenModal,
  }),
}));

const renderBattleLobbyContainer = (onClick = vi.fn()) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <BattleLobbyContainer onClick={onClick} />
    </ThemeProvider>,
  );

describe('BattleLobbyContainer 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderBattleLobbyContainer();

    expect(screen.getByText('실시간 CS 퀴즈 배틀')).toBeInTheDocument();
  });

  it('설명 버튼 클릭 시 모달 오픈 함수가 호출된다', () => {
    renderBattleLobbyContainer();

    fireEvent.click(screen.getByRole('button', { name: '실시간 배틀 설명서 열기' }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
    expect(mockOpenModal).toHaveBeenCalledWith(
      '실시간 배틀이란?',
      expect.any(Object),
      expect.objectContaining({ maxWidth: 880 }),
    );
  });

  it('방 생성하기 버튼 클릭 시 onClick이 호출된다', () => {
    const onClick = vi.fn();
    renderBattleLobbyContainer(onClick);

    fireEvent.click(screen.getByText('방 생성하기'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
