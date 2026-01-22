import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LeaderboardContainer } from '@/feat/leaderboard/components/LeaderboardContainer';
import type { RankingMember, WeeklyRankingResult } from '@/feat/leaderboard/types';
import { lightTheme } from '@/styles/theme';

// 컴포넌트 모킹
vi.mock('@/components/Loading', () => ({
  Loading: ({ text }: { text: string }) => <div data-testid="loading">{text}</div>,
}));

vi.mock('@/feat/leaderboard/components/LeaderboardStateMessage', () => ({
  LeaderboardStateMessage: ({ state, message }: { state: string; message?: string }) => (
    <div data-testid={`state-message-${state}`}>{message || state}</div>
  ),
}));

vi.mock('@/feat/leaderboard/components/MemberList', () => ({
  MemberList: ({ members }: { members: RankingMember[] }) => (
    <div data-testid="member-list">
      {members.map((m, i) => (
        <div key={i} data-testid={`member-${m.userId}`}>
          {m.displayName}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/comp/SVGIcon', () => ({
  default: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

const mockWeeklyRanking: WeeklyRankingResult = {
  weekKey: '2024-01',
  tier: {
    id: 1,
    name: '브론즈',
    orderIndex: 1,
  },
  groupIndex: 1,
  totalMembers: 10,
  myRank: 5,
  myWeeklyXp: 500,
  members: [
    {
      rank: 1,
      userId: 1,
      displayName: '사용자1',
      profileImageUrl: null,
      xp: 1000,
      isMe: false,
      rankZone: 'PROMOTION',
    },
    {
      rank: 2,
      userId: 2,
      displayName: '사용자2',
      profileImageUrl: null,
      xp: 900,
      isMe: true,
      rankZone: 'MAINTAIN',
    },
    {
      rank: 3,
      userId: 3,
      displayName: '사용자3',
      profileImageUrl: null,
      xp: 800,
      isMe: false,
      rankZone: 'DEMOTION',
    },
  ],
};

const renderLeaderboardContainer = (
  props: Partial<React.ComponentProps<typeof LeaderboardContainer>> = {},
) => {
  const defaultProps = {
    weeklyRanking: null,
    isLoading: false,
    errorMessage: null,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <LeaderboardContainer {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('LeaderboardContainer 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderLeaderboardContainer();

    expect(screen.getByText('LEADERBOARD')).toBeInTheDocument();
  });

  describe('로딩 상태', () => {
    it('isLoading이 true일 때 Loading 컴포넌트가 표시된다', () => {
      renderLeaderboardContainer({ isLoading: true });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('랭킹 정보를 불러오는 중입니다.')).toBeInTheDocument();
    });

    it('로딩 중일 때 다른 컨텐츠가 표시되지 않는다', () => {
      renderLeaderboardContainer({
        isLoading: true,
        weeklyRanking: mockWeeklyRanking,
      });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('member-list')).not.toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('errorMessage가 있을 때 에러 메시지가 표시된다', () => {
      renderLeaderboardContainer({ errorMessage: '에러 발생' });

      expect(screen.getByTestId('state-message-error')).toBeInTheDocument();
      expect(screen.getByText('에러 발생')).toBeInTheDocument();
    });

    it('에러 상태일 때 정상 컨텐츠가 표시되지 않는다', () => {
      renderLeaderboardContainer({
        errorMessage: '에러 발생',
        weeklyRanking: mockWeeklyRanking,
      });

      expect(screen.getByTestId('state-message-error')).toBeInTheDocument();
      expect(screen.queryByTestId('member-list')).not.toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('weeklyRanking이 null일 때 빈 상태 메시지가 표시된다', () => {
      renderLeaderboardContainer({ weeklyRanking: null });

      expect(screen.getByTestId('state-message-empty')).toBeInTheDocument();
    });
  });

  describe('미할당 상태', () => {
    it('groupIndex가 null일 때 미할당 상태 메시지가 표시된다', () => {
      renderLeaderboardContainer({
        weeklyRanking: {
          ...mockWeeklyRanking,
          groupIndex: null,
        },
      });

      expect(screen.getByTestId('state-message-unassigned')).toBeInTheDocument();
    });
  });

  describe('정상 상태', () => {
    it('정상 상태일 때 리그 정보가 표시된다', () => {
      renderLeaderboardContainer({ weeklyRanking: mockWeeklyRanking });

      expect(screen.getByText('브론즈 리그')).toBeInTheDocument();
      expect(screen.getByText(/2024-01주차 · 그룹 1 · 총 10명/)).toBeInTheDocument();
    });

    it('정상 상태일 때 멤버 리스트가 표시된다', () => {
      renderLeaderboardContainer({ weeklyRanking: mockWeeklyRanking });

      // MemberList는 구역별로 여러 번 렌더링됨 (promotion, maintain, demotion)
      const memberLists = screen.getAllByTestId('member-list');
      expect(memberLists.length).toBeGreaterThan(0);

      // 각 멤버가 표시되는지 확인
      expect(screen.getByTestId('member-1')).toBeInTheDocument();
      expect(screen.getByTestId('member-2')).toBeInTheDocument();
      expect(screen.getByTestId('member-3')).toBeInTheDocument();
    });

    it('정상 상태일 때 구역별 헤더가 표시된다', () => {
      renderLeaderboardContainer({ weeklyRanking: mockWeeklyRanking });

      expect(screen.getByText('승급권')).toBeInTheDocument();
      expect(screen.getByText('강등권')).toBeInTheDocument();
    });
  });

  describe('새로고침 버튼', () => {
    it('onRefresh가 제공되면 새로고침 버튼이 표시된다', () => {
      const handleRefresh = vi.fn();
      renderLeaderboardContainer({
        weeklyRanking: mockWeeklyRanking,
        onRefresh: handleRefresh,
      });

      const refreshButton = screen.getByRole('button', { name: '리더보드 새로고침' });
      expect(refreshButton).toBeInTheDocument();
      expect(screen.getByTestId('icon-Refresh')).toBeInTheDocument();
    });

    it('onRefresh가 없으면 새로고침 버튼이 표시되지 않는다', () => {
      renderLeaderboardContainer({ weeklyRanking: mockWeeklyRanking });

      const refreshButton = screen.queryByRole('button');
      expect(refreshButton).not.toBeInTheDocument();
    });

    it('새로고침 버튼 클릭 시 onRefresh가 호출된다', () => {
      const handleRefresh = vi.fn();
      renderLeaderboardContainer({
        weeklyRanking: mockWeeklyRanking,
        onRefresh: handleRefresh,
      });

      const refreshButton = screen.getByRole('button', { name: '리더보드 새로고침' });
      fireEvent.click(refreshButton);

      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });

    it('isRefreshing이 true일 때 버튼이 비활성화된다', () => {
      const handleRefresh = vi.fn();
      renderLeaderboardContainer({
        weeklyRanking: mockWeeklyRanking,
        onRefresh: handleRefresh,
        isRefreshing: true,
      });

      const refreshButton = screen.getByRole('button', { name: '리더보드 새로고침' });
      expect(refreshButton).toBeDisabled();
    });

    it('isRefreshing이 false일 때 버튼이 활성화된다', () => {
      const handleRefresh = vi.fn();
      renderLeaderboardContainer({
        weeklyRanking: mockWeeklyRanking,
        onRefresh: handleRefresh,
        isRefreshing: false,
      });

      const refreshButton = screen.getByRole('button', { name: '리더보드 새로고침' });
      expect(refreshButton).not.toBeDisabled();
    });
  });

  describe('상태 우선순위', () => {
    it('로딩 상태가 다른 상태보다 우선한다', () => {
      renderLeaderboardContainer({
        isLoading: true,
        errorMessage: '에러',
        weeklyRanking: mockWeeklyRanking,
      });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('state-message-error')).not.toBeInTheDocument();
    });

    it('에러 상태가 빈 상태보다 우선한다', () => {
      renderLeaderboardContainer({
        errorMessage: '에러',
        weeklyRanking: null,
      });

      expect(screen.getByTestId('state-message-error')).toBeInTheDocument();
      expect(screen.queryByTestId('state-message-empty')).not.toBeInTheDocument();
    });
  });
});
