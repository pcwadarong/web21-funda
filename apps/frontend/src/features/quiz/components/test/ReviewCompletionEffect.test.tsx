import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ReviewCompletionEffect } from '@/feat/quiz/components/ReviewCompletionEffect';
import { lightTheme } from '@/styles/theme';

describe('ReviewCompletionEffect 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('복습 완료 문구가 화면에 표시된다', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <ReviewCompletionEffect />
      </ThemeProvider>,
    );

    expect(screen.getByText('복습 완료!')).toBeInTheDocument();
  });
});
