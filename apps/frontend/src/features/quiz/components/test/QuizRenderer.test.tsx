import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizRenderer } from '@/feat/quiz/components/QuizRenderer';
import { lightTheme } from '@/styles/theme';

vi.mock('./quizType/QuizMCQ', () => ({
  QuizMCQ: (props: { disabled: boolean; showResult: boolean }) => (
    <div
      data-testid="mcq"
      data-disabled={String(props.disabled)}
      data-showresult={String(props.showResult)}
    />
  ),
}));

vi.mock('./quizType/QuizOX', () => ({
  QuizOX: (props: { disabled: boolean; showResult: boolean }) => (
    <div
      data-testid="ox"
      data-disabled={String(props.disabled)}
      data-showresult={String(props.showResult)}
    />
  ),
}));

vi.mock('./quizType/QuizCode', () => ({
  QuizCode: (props: { disabled: boolean; showResult: boolean }) => (
    <div
      data-testid="code"
      data-disabled={String(props.disabled)}
      data-showresult={String(props.showResult)}
    />
  ),
}));

vi.mock('./quizType/QuizMatching', () => ({
  QuizMatching: (props: { disabled: boolean; showResult: boolean }) => (
    <div
      data-testid="matching"
      data-disabled={String(props.disabled)}
      data-showresult={String(props.showResult)}
    />
  ),
}));

describe('QuizRenderer', () => {
  const renderWithTheme = (ui: React.ReactNode) =>
    render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

  it('type=mcq면 QuizMCQ를 렌더링한다', () => {
    renderWithTheme(
      <QuizRenderer
        question={{
          id: 1,
          type: 'mcq',
          content: { question: 'Q', options: [{ id: 'c1', text: 'A' }] },
        }}
        selectedAnswer={null}
        correctAnswer={null}
        onAnswerChange={vi.fn()}
        showResult={false}
        disabled={false}
      />,
    );

    expect(screen.getByTestId('mcq')).toBeInTheDocument();
  });

  it('type=ox면 QuizOX를 렌더링한다', () => {
    renderWithTheme(
      <QuizRenderer
        question={{
          id: 1,
          type: 'ox',
          content: {
            question: 'Q',
            options: [
              { id: 'o', text: 'O' },
              { id: 'x', text: 'X' },
            ],
          },
        }}
        selectedAnswer={null}
        correctAnswer={null}
        onAnswerChange={vi.fn()}
        showResult={false}
        disabled={false}
      />,
    );

    expect(screen.getByTestId('ox')).toBeInTheDocument();
  });

  it('type=code면 QuizCode를 렌더링한다', () => {
    renderWithTheme(
      <QuizRenderer
        question={{
          id: 1,
          type: 'code',
          content: {
            question: 'Q',
            options: [{ id: 'c1', text: 'A' }],
            code_metadata: { language: 'css', snippet: 'a {}' },
          },
        }}
        selectedAnswer={null}
        correctAnswer={null}
        onAnswerChange={vi.fn()}
        showResult={false}
        disabled={true}
      />,
    );

    const el = screen.getByTestId('code');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-disabled', 'true');
  });

  it('type=matching이면 QuizMatching을 렌더링한다', () => {
    renderWithTheme(
      <QuizRenderer
        question={{
          id: 1,
          type: 'matching',
          content: {
            question: 'Q',
            matching_metadata: { left: ['L1'], right: ['R1'] },
          },
        }}
        selectedAnswer={null}
        correctAnswer={null}
        onAnswerChange={vi.fn()}
        showResult={true}
        disabled={true}
      />,
    );

    const el = screen.getByTestId('matching');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-showresult', 'true');
  });

  it('알 수 없는 type이면 안내 문구를 렌더링한다(런타임 보호)', () => {
    renderWithTheme(
      <QuizRenderer
        // TS 타입상 불가능하지만, 런타임 안전성 체크
        question={{ id: 1, type: 'unknown', content: { question: 'Q', options: [] } } as any}
        selectedAnswer={null}
        correctAnswer={null}
        onAnswerChange={vi.fn()}
        showResult={false}
        disabled={false}
      />,
    );

    expect(screen.getByText(/지원하지 않는 퀴즈 유형입니다: unknown/)).toBeInTheDocument();
  });
});
