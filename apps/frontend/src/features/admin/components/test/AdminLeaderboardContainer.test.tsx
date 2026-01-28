import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminLeaderboardContainer } from '@/feat/admin/components/AdminLeaderboardContainer';
import type { RankingMember, WeeklyRankingResult } from '@/feat/leaderboard/types';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

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
  ],
};

const renderAdminLeaderboardContainer = (
  props: Partial<React.ComponentProps<typeof AdminLeaderboardContainer>> = {},
) => {
  const defaultProps = {
    weeklyRanking: null,
    isLoading: false,
    errorMessage: null,
    filters: {
      tierName: '',
      groupIndex: '',
    },
    onFilterChange: vi.fn(),
    onApplyFilters: vi.fn(),
    formError: null,
    hasAppliedFilters: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <ModalProvider>
        <AdminLeaderboardContainer {...defaultProps} />
      </ModalProvider>
    </ThemeProvider>,
  );
};

describe('AdminLeaderboardContainer 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('관리자 리더보드 타이틀이 표시된다', () => {
    renderAdminLeaderboardContainer();

    expect(screen.getByText('ADMIN LEADERBOARD')).toBeInTheDocument();
  });

  it('필터 입력과 조회 버튼이 표시된다', () => {
    renderAdminLeaderboardContainer();

    expect(screen.getByLabelText('티어')).toBeInTheDocument();
    expect(screen.getByLabelText('그룹 번호')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '조회' })).toBeInTheDocument();
  });

  it('조회 버튼 클릭 시 onApplyFilters가 호출된다', () => {
    const onApplyFilters = vi.fn();
    renderAdminLeaderboardContainer({ onApplyFilters });

    fireEvent.click(screen.getByRole('button', { name: '조회' }));

    expect(onApplyFilters).toHaveBeenCalledTimes(1);
  });

  it('정상 상태일 때 리그 정보가 표시된다', () => {
    renderAdminLeaderboardContainer({
      weeklyRanking: mockWeeklyRanking,
      hasAppliedFilters: true,
    });

    expect(screen.getByText('브론즈 리그')).toBeInTheDocument();
    expect(screen.getByText(/2024-01주차 · 그룹 1 · 총 10명/)).toBeInTheDocument();
  });
});
