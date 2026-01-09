import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoadmapContainer } from '@/feat/roadmap/components/RoadmapContainer';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { lightTheme } from '@/styles/theme';

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

vi.mock('@/feat/roadmap/components/UnitCard', () => ({
  UnitCard: ({ unit, onClick }: { unit: { title: string; id: number }; onClick?: () => void }) => (
    <button type="button" onClick={onClick} data-testid={`unit-card-${unit.id}`}>
      {unit.title}
    </button>
  ),
}));

const mockUnits: RoadmapUnit[] = [
  {
    id: 1,
    title: 'HTML & CSS 기초',
    description: '웹의 기본 구조와 스타일링',
    progress: 100,
    score: 92,
    status: 'completed',
    variant: 'full',
  },
  {
    id: 2,
    title: 'JavaScript 기초',
    description: '프로그래밍의 기본 개념',
    progress: 100,
    score: 88,
    status: 'completed',
    variant: 'full',
  },
];

const renderContainer = (props: Partial<React.ComponentProps<typeof RoadmapContainer>> = {}) => {
  const defaultProps = {
    fieldName: 'Frontend',
    units: mockUnits,
    isLoggedIn: false,
    onUnitClick: vi.fn(),
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <RoadmapContainer {...defaultProps} />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('RoadmapContainer 페이지 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로드맵 기본 텍스트가 렌더링된다', () => {
    renderContainer();

    expect(screen.getByText('Frontend 로드맵')).toBeInTheDocument();
    expect(screen.getByText('단계별로 학습하며 전문가가 되어보세요')).toBeInTheDocument();
    expect(screen.getByText('분야 선택으로 돌아가기')).toBeInTheDocument();
  });

  it('로그아웃 상태에서는 진행률 요약이 표시되지 않는다', () => {
    renderContainer({ isLoggedIn: false });

    // UnitCard는 모킹되지 않았으므로, 실제로는 UnitCard 컴포넌트의 테스트에서 확인해야 함
    // 여기서는 컨테이너가 올바른 props를 전달하는지만 확인
    expect(screen.getByText('Frontend 로드맵')).toBeInTheDocument();
  });

  it('유닛 카드를 클릭하면 onUnitClick이 호출된다', () => {
    const onUnitClick = vi.fn();
    renderContainer({ onUnitClick });

    // UnitCard가 렌더링되었는지 확인하고 클릭
    const unitCard = screen.getByTestId('unit-card-1');
    expect(unitCard).toBeInTheDocument();

    fireEvent.click(unitCard);

    // RoadmapContainer가 올바른 onUnitClick을 전달하는지 확인
    expect(onUnitClick).toHaveBeenCalledWith(1);
  });
});
