import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UnitCard } from '@/feat/roadmap/components/UnitCard';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { lightTheme } from '@/styles/theme';

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

const baseUnit: RoadmapUnit = {
  id: 1,
  title: 'HTML & CSS 기초',
  description: '웹의 기본 구조와 스타일링',
  progress: 45,
  score: 85,
  status: 'active',
  variant: 'full',
};

const renderUnitCard = (unit: RoadmapUnit, isLoggedIn: boolean, onClick?: () => void) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <UnitCard unit={unit} isLoggedIn={isLoggedIn} onClick={onClick} />
    </ThemeProvider>,
  );

describe('UnitCard 컴포넌트 테스트', () => {
  it('로그인 상태에서 진행률과 정답률이 표시된다', () => {
    // given
    const unit = { ...baseUnit, progress: 60, successRate: 90 };

    // when
    renderUnitCard(unit, true);

    // then
    expect(screen.getByText('진행률')).toBeInTheDocument();
    expect(screen.getByText('정답률')).toBeInTheDocument();
    expect(screen.getByText(text => text.replace(/\s/g, '') === '60%')).toBeInTheDocument();
    expect(screen.getByText(text => text.replace(/\s/g, '') === '90%')).toBeInTheDocument();
  });

  it('비로그인 상태에서는 진행률/정답률이 숨겨진다', () => {
    // given
    const unit = { ...baseUnit, progress: 70, score: 88 };

    // when
    renderUnitCard(unit, false);

    // then
    expect(screen.queryByText('진행률')).not.toBeInTheDocument();
    expect(screen.queryByText('정답률')).not.toBeInTheDocument();
    expect(screen.queryByText('70%')).not.toBeInTheDocument();
    expect(screen.queryByText('88%')).not.toBeInTheDocument();
  });

  it('완료 상태에서 배지가 표시된다', () => {
    // given
    const unit = { ...baseUnit, status: 'completed' as const };

    // when
    renderUnitCard(unit, true);

    // then
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('카드를 클릭하면 onClick이 호출된다', () => {
    // given
    const onClick = vi.fn();

    // when
    renderUnitCard(baseUnit, true, onClick);
    fireEvent.click(screen.getByText(baseUnit.title));

    // then
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
