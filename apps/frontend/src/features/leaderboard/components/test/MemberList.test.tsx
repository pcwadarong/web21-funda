import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MemberList } from '@/feat/leaderboard/components/MemberList';
import type { RankingMember } from '@/feat/leaderboard/types';
import { lightTheme } from '@/styles/theme';

// RankingRow 모킹
vi.mock('@/feat/leaderboard/components/RankingRow', () => ({
  RankingRow: ({ member }: { member: RankingMember }) => (
    <div data-testid={`ranking-row-${member.userId}`}>
      {member.displayName} - {member.rank}
    </div>
  ),
}));

const mockMembers: RankingMember[] = [
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
];

const renderMemberList = (members: RankingMember[] = mockMembers) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemberList members={members} />
    </ThemeProvider>,
  );

describe('MemberList 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderMemberList();

    expect(screen.getByTestId('ranking-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('ranking-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('ranking-row-3')).toBeInTheDocument();
  });

  it('모든 멤버가 올바른 순서로 렌더링된다', () => {
    renderMemberList();

    const row1 = screen.getByTestId('ranking-row-1');
    const row2 = screen.getByTestId('ranking-row-2');
    const row3 = screen.getByTestId('ranking-row-3');

    expect(row1).toHaveTextContent('사용자1 - 1');
    expect(row2).toHaveTextContent('사용자2 - 2');
    expect(row3).toHaveTextContent('사용자3 - 3');
  });

  it('멤버 목록이 비어있을 때 빈 상태 메시지가 표시된다', () => {
    renderMemberList([]);

    expect(screen.getByText('해당 구역에 인원이 없습니다.')).toBeInTheDocument();
    expect(screen.queryByTestId(/ranking-row-/)).not.toBeInTheDocument();
  });

  it('단일 멤버가 올바르게 렌더링된다', () => {
    renderMemberList([mockMembers[0]]);

    expect(screen.getByTestId('ranking-row-1')).toBeInTheDocument();
    expect(screen.queryByTestId('ranking-row-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('ranking-row-3')).not.toBeInTheDocument();
  });

  it('많은 수의 멤버가 올바르게 렌더링된다', () => {
    const manyMembers = Array.from({ length: 10 }, (_, i) => ({
      ...mockMembers[0],
      userId: i + 1,
      rank: i + 1,
      displayName: `사용자${i + 1}`,
    }));

    renderMemberList(manyMembers);

    expect(screen.getByTestId('ranking-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('ranking-row-10')).toBeInTheDocument();
    expect(screen.queryByText('해당 구역에 인원이 없습니다.')).not.toBeInTheDocument();
  });
});
