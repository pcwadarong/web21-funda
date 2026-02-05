import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RankingRow } from '@/feat/leaderboard/components/RankingRow';
import type { RankingMember } from '@/feat/leaderboard/types';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹
vi.mock('@/components/SVGIcon', () => ({
  default: ({ icon, style }: { icon: string; style?: Record<string, unknown> }) => (
    <span data-testid={`svg-icon-${icon}`} data-style={JSON.stringify(style)} />
  ),
}));

const ensureMatchMedia = () => {
  if (typeof window.matchMedia === 'function') return;

  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const mockMember: RankingMember = {
  rank: 1,
  userId: 1,
  displayName: '테스트 사용자',
  profileImageUrl: null,
  xp: 1000,
  isMe: false,
  rankZone: 'PROMOTION',
};

const renderRankingRow = (
  member: RankingMember = mockMember,
  xpLabel?: string,
  onClick?: () => void,
) =>
  render(
    <ThemeStoreProvider>
      <ThemeProvider theme={lightTheme}>
        <RankingRow member={member} xpLabel={xpLabel} onClick={onClick} />
      </ThemeProvider>
    </ThemeStoreProvider>,
  );

describe('RankingRow 컴포넌트 테스트', () => {
  beforeEach(() => {
    localStorage.setItem('theme', 'light');
    ensureMatchMedia();
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem('theme');
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderRankingRow();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument();
    expect(screen.getByText('1,000 XP')).toBeInTheDocument();
  });

  it('티어 정보가 있으면 표시된다', () => {
    renderRankingRow({
      ...mockMember,
      tierName: 'GOLD',
    });

    expect(screen.getByTestId('svg-icon-TierGold')).toBeInTheDocument();
  });

  it('프로필 이미지가 없을 때 아바타 라벨이 표시된다', () => {
    renderRankingRow({
      ...mockMember,
      displayName: '홍길동',
      profileImageUrl: null,
    });

    expect(screen.getByText('홍길')).toBeInTheDocument();
  });

  it('프로필 이미지가 있을 때 이미지가 표시된다', () => {
    renderRankingRow({
      ...mockMember,
      profileImageUrl: 'https://example.com/avatar.jpg',
    });

    const img = screen.getByAltText('테스트 사용자 프로필');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('isMe가 true일 때 "나" 배지가 표시된다', () => {
    renderRankingRow({
      ...mockMember,
      isMe: true,
    });

    expect(screen.getByText('나')).toBeInTheDocument();
  });

  it('isMe가 false일 때 "나" 배지가 표시되지 않는다', () => {
    renderRankingRow({
      ...mockMember,
      isMe: false,
    });

    expect(screen.queryByText('나')).not.toBeInTheDocument();
  });

  describe('RankZone 아이콘 렌더링', () => {
    it('PROMOTION일 때 ArrowLeft 아이콘이 90도 회전되어 표시된다', () => {
      renderRankingRow({
        ...mockMember,
        rankZone: 'PROMOTION',
      });

      const icon = screen.getByTestId('svg-icon-ArrowLeft');
      expect(icon).toBeInTheDocument();
      const style = JSON.parse(icon.getAttribute('data-style') || '{}');
      expect(style.transform).toBe('rotate(90deg)');
    });

    it('DEMOTION일 때 ArrowLeft 아이콘이 270도 회전되어 표시된다', () => {
      renderRankingRow({
        ...mockMember,
        rankZone: 'DEMOTION',
      });

      const icon = screen.getByTestId('svg-icon-ArrowLeft');
      expect(icon).toBeInTheDocument();
      const style = JSON.parse(icon.getAttribute('data-style') || '{}');
      expect(style.transform).toBe('rotate(270deg)');
    });

    it('MAINTAIN일 때 Minus 아이콘이 표시된다', () => {
      renderRankingRow({
        ...mockMember,
        rankZone: 'MAINTAIN',
      });

      const icon = screen.getByTestId('svg-icon-Minus');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('XP 포맷팅', () => {
    it('XP 값이 천 단위로 포맷팅되어 표시된다', () => {
      renderRankingRow({
        ...mockMember,
        xp: 12345,
      });

      expect(screen.getByText('12,345 XP')).toBeInTheDocument();
    });

    it('XP 값이 0일 때도 올바르게 표시된다', () => {
      renderRankingRow({
        ...mockMember,
        xp: 0,
      });

      expect(screen.getByText('0 XP')).toBeInTheDocument();
    });

    it('XP 라벨을 변경할 수 있다', () => {
      renderRankingRow(
        {
          ...mockMember,
          xp: 1500,
        },
        '주차 XP',
      );

      expect(screen.getByText('1,500 주차 XP')).toBeInTheDocument();
    });
  });

  describe('아바타 라벨 생성', () => {
    it('이름이 2자 이상일 때 앞 2자를 표시한다', () => {
      renderRankingRow({
        ...mockMember,
        displayName: '홍길동',
        profileImageUrl: null,
      });

      expect(screen.getByText('홍길')).toBeInTheDocument();
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    it('이름이 1자일 때 그대로 표시한다', () => {
      renderRankingRow({
        ...mockMember,
        displayName: '홍',
        profileImageUrl: null,
      });

      expect(screen.getAllByText('홍')).toHaveLength(2);
    });

    it('영문 이름이 2자 이상일 때 앞 2자를 대문자로 표시한다', () => {
      renderRankingRow({
        ...mockMember,
        displayName: 'john doe',
        profileImageUrl: null,
      });

      expect(screen.getByText('JO')).toBeInTheDocument();
      expect(screen.getByText('john doe')).toBeInTheDocument();
    });

    it('이름이 비어있을 때 "??"을 표시한다', () => {
      renderRankingRow({
        ...mockMember,
        displayName: '',
        profileImageUrl: null,
      });

      expect(screen.getByText('??')).toBeInTheDocument();
    });
  });

  describe('프로필 이동 클릭', () => {
    it('행을 클릭하면 onClick이 호출된다', () => {
      const handleClick = vi.fn();

      renderRankingRow(mockMember, undefined, handleClick);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Enter 키를 누르면 onClick이 호출된다', () => {
      const handleClick = vi.fn();

      renderRankingRow(mockMember, undefined, handleClick);

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Space 키를 누르면 onClick이 호출된다', () => {
      const handleClick = vi.fn();

      renderRankingRow(mockMember, undefined, handleClick);

      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
