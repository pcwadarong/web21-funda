import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Roadmap } from '@/pages/Roadmap';
import { lightTheme } from '@/styles/theme';

const mockNavigate = vi.fn();
const mockUpdateUIState = vi.fn();

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useStorage', () => ({
  useStorage: () => ({
    updateUIState: mockUpdateUIState,
  }),
}));

vi.mock('@/feat/roadmap/components/UnitCard', () => ({
  UnitCard: ({ unit, onClick }: { unit: { title: string }; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {unit.title}
    </button>
  ),
}));

const renderRoadmap = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <Roadmap />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('Roadmap 페이지 테스트', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUpdateUIState.mockClear();
  });

  it('로드맵 기본 텍스트가 렌더링된다', () => {
    // given

    // when
    renderRoadmap();

    // then
    expect(screen.getByText('Frontend 로드맵')).toBeInTheDocument();
    expect(screen.getByText('단계별로 학습하며 전문가가 되어보세요')).toBeInTheDocument();
    expect(screen.getByText('분야 선택으로 돌아가기')).toBeInTheDocument();
  });

  it('로그아웃 상태에서는 진행률 요약이 표시되지 않는다', () => {
    // given

    // when
    renderRoadmap();

    // then
    expect(screen.queryByText('2/5 완료')).not.toBeInTheDocument();
    expect(screen.queryByText('40%')).not.toBeInTheDocument();
  });

  it('유닛 카드를 클릭하면 상태 저장과 이동이 호출된다', () => {
    // given
    renderRoadmap();

    // when
    fireEvent.click(screen.getByText('HTML & CSS 기초'));

    // then
    expect(mockUpdateUIState).toHaveBeenCalledWith({
      last_viewed: {
        field_slug: 'fe',
        unit_id: 1,
      },
    });
    expect(mockNavigate).toHaveBeenCalledWith('/learn');
  });
});
