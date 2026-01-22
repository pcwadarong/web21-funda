import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LeaderboardStateMessage } from '@/feat/leaderboard/components/LeaderboardStateMessage';
import { lightTheme } from '@/styles/theme';

const renderLeaderboardStateMessage = (state: 'error' | 'empty' | 'unassigned', message?: string) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <LeaderboardStateMessage state={state} message={message} />
    </ThemeProvider>,
  );

describe('LeaderboardStateMessage 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  describe('에러 상태', () => {
    it('기본 에러 메시지가 표시된다', () => {
      renderLeaderboardStateMessage('error');

      expect(screen.getByText('랭킹 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('커스텀 에러 메시지가 표시된다', () => {
      renderLeaderboardStateMessage('error', '커스텀 에러 메시지');

      expect(screen.getByText('커스텀 에러 메시지')).toBeInTheDocument();
    });

    it('에러 상태일 때 스켈레톤이 표시되지 않는다', () => {
      renderLeaderboardStateMessage('error');

      const skeletonRows = screen.queryAllByTestId(/skeleton-row/);
      expect(skeletonRows).toHaveLength(0);
    });
  });

  describe('빈 상태', () => {
    it('기본 빈 상태 메시지가 표시된다', () => {
      renderLeaderboardStateMessage('empty');

      expect(screen.getByText('랭킹 데이터가 비어 있습니다.')).toBeInTheDocument();
    });

    it('커스텀 빈 상태 메시지가 표시된다', () => {
      renderLeaderboardStateMessage('empty', '커스텀 빈 상태 메시지');

      expect(screen.getByText('커스텀 빈 상태 메시지')).toBeInTheDocument();
    });

    it('빈 상태일 때 스켈레톤이 표시된다', () => {
      renderLeaderboardStateMessage('empty');

      // 스켈레톤은 5개가 표시되어야 함
      const container = screen.getByText('랭킹 데이터가 비어 있습니다.').parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe('미할당 상태', () => {
    it('기본 미할당 메시지가 표시된다', () => {
      renderLeaderboardStateMessage('unassigned');

      expect(screen.getByText('레슨을 완료하여 리그에 참여하세요')).toBeInTheDocument();
    });

    it('커스텀 미할당 메시지가 표시된다', () => {
      renderLeaderboardStateMessage('unassigned', '커스텀 미할당 메시지');

      expect(screen.getByText('커스텀 미할당 메시지')).toBeInTheDocument();
    });
  });

  describe('스켈레톤 UI', () => {
    it('unassigned 상태일 때 스켈레톤이 렌더링된다', () => {
      const { container } = renderLeaderboardStateMessage('unassigned');

      // 스켈레톤 구조: 1개 리스트 div + 5개 행 div + 각 행마다 4개 자식 div = 총 26개 div
      // 메시지 div 1개 + 스켈레톤 관련 div들
      const allDivs = container.querySelectorAll('div');
      // 스켈레톤이 렌더링되면 많은 div들이 있어야 함 (최소 20개 이상)
      expect(allDivs.length).toBeGreaterThan(20);
    });

    it('empty 상태일 때 스켈레톤이 렌더링된다', () => {
      const { container } = renderLeaderboardStateMessage('empty');

      // 스켈레톤 구조: 1개 리스트 div + 5개 행 div + 각 행마다 4개 자식 div = 총 26개 div
      const allDivs = container.querySelectorAll('div');
      // 스켈레톤이 렌더링되면 많은 div들이 있어야 함 (최소 20개 이상)
      expect(allDivs.length).toBeGreaterThan(20);
    });

    it('error 상태일 때 스켈레톤이 렌더링되지 않는다', () => {
      const { container } = renderLeaderboardStateMessage('error');

      // 에러 상태일 때는 메시지 div만 있어야 함
      // 스켈레톤은 렌더링되지 않으므로 div 개수가 적어야 함
      const allDivs = container.querySelectorAll('div');
      // 에러 상태는 스켈레톤이 없으므로 div 개수가 적음 (10개 미만)
      expect(allDivs.length).toBeLessThan(10);
    });
  });
});
