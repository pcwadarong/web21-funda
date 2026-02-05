import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Overview } from '@/pages/learn/Overview';
import { lightTheme } from '@/styles/theme';

const mockUseUnitOverview = vi.fn();

vi.mock('@/hooks/queries/unitQueries', () => ({
  useUnitOverview: (unitId: number | null) => mockUseUnitOverview(unitId),
}));

vi.mock('@/comp/MarkdownRenderer', () => ({
  MarkdownRenderer: ({ text }: { text: string }) => <div data-testid="markdown">{text}</div>,
}));

vi.mock('@/comp/SVGIcon', () => ({
  default: () => null,
}));

const renderOverview = (route: string) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/learn/overview/:unitId" element={<Overview />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('Overview 페이지', () => {
  it('개요 데이터를 마크다운으로 렌더링한다', () => {
    mockUseUnitOverview.mockReturnValue({
      data: {
        unit: {
          id: 1,
          title: 'HTML',
          overview: '### 개요',
        },
      },
      isLoading: false,
      error: null,
    });

    renderOverview('/learn/overview/1');

    expect(screen.getByText('HTML')).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('### 개요');
  });

  it('개요가 비어있으면 안내 메시지를 보여준다', () => {
    mockUseUnitOverview.mockReturnValue({
      data: {
        unit: {
          id: 2,
          title: 'CSS',
          overview: '   ',
        },
      },
      isLoading: false,
      error: null,
    });

    renderOverview('/learn/overview/2');

    expect(screen.getByText('아직 작성된 학습 개요가 없습니다.')).toBeInTheDocument();
  });
});
