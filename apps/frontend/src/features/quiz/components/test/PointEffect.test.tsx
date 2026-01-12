import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { lightTheme } from '@/styles/theme';

// 1. Star SVG 모킹 (vite-plugin-svgr 대응)
vi.mock('@/assets/star3d.svg?react', () => ({
  default: () => <svg data-testid="star-svg" />,
}));

vi.mock('@/comp/SVGIcon', () => ({
  // 파티클에서 사용하는 SVGIcon 모킹
  default: () => <div data-testid="particle-star" />,
}));

// 2. 모킹 완료 후 컴포넌트 가져오기
const { PointEffect } = await import('@/feat/quiz/components/PointEffect');

const renderPointEffect = (points: number) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <PointEffect points={points} />
    </ThemeProvider>,
  );

describe('PointEffect 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('전달된 포인트 점수가 화면에 올바르게 표시된다', () => {
    const testPoints = 1250;
    renderPointEffect(testPoints);

    // 숫자가 포함되어 있는지 확인
    expect(screen.getByText('1250')).toBeInTheDocument();
  });

  it('"POINT" 라벨이 화면에 렌더링된다', () => {
    renderPointEffect(100);
    expect(screen.getByText('POINT')).toBeInTheDocument();
  });

  it('별(Star) 아이콘이 화면에 렌더링된다', () => {
    renderPointEffect(100);
    // 모킹한 data-testid로 확인
    expect(screen.getByTestId('star-svg')).toBeInTheDocument();
  });
});
