import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Loading } from '@/components/Loading';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

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

const renderLoading = (props: Partial<React.ComponentProps<typeof Loading>> = {}) => {
  const defaultProps = {
    text: 'Loading',
    ...props,
  };

  return render(
    <ThemeStoreProvider>
      <ThemeProvider theme={lightTheme}>
        <Loading {...defaultProps} />
      </ThemeProvider>
    </ThemeStoreProvider>,
  );
};

describe('Loading 컴포넌트 테스트', () => {
  beforeEach(() => {
    localStorage.setItem('theme', 'light');
    ensureMatchMedia();
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem('theme');
  });

  it('기본 텍스트가 렌더링된다', () => {
    renderLoading();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('커스텀 텍스트가 렌더링된다', () => {
    renderLoading({ text: '로딩 중' });
    expect(screen.getByText('로딩 중')).toBeInTheDocument();
  });
});
