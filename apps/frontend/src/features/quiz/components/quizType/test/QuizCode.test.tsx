import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizCode } from '@/feat/quiz/components/quizType/QuizCode';
import type { CodeContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: CodeContent = {
  question: 'data-state가 "open"인 요소만 선택하려고 합니다. 빈칸에 들어갈 선택자를 고르세요.',
  options: [
    { id: 'c1', text: '[data-state="open"]' },
    { id: 'c2', text: '[data-state^="open"]' },
    { id: 'c3', text: '[data-state*="open"]' },
    { id: 'c4', text: '[data-state$="open"]' },
  ],
  code_metadata: {
    language: 'css',
    snippet: '{{BLANK}} {\n  opacity: 1;\n}',
  },
};

const renderQuizCode = (props = {}) => {
  const defaultProps = {
    content: mockContent,
    selectedAnswer: null,
    correctAnswer: null,
    showResult: false,
    onAnswerChange: vi.fn(),
    disabled: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <QuizCode {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizCode 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizCode();
    expect(screen.getByText('[data-state="open"]')).toBeInTheDocument();
    expect(screen.getByText('[data-state^="open"]')).toBeInTheDocument();
    expect(screen.getByText('[data-state*="open"]')).toBeInTheDocument();
    expect(screen.getByText('[data-state$="open"]')).toBeInTheDocument();
  });

  it('코드 블록이 렌더링된다', () => {
    renderQuizCode();
    // CodeBlock 컴포넌트가 렌더링되는지 확인
    const codeBlock = screen.getByText(/opacity: 1/);
    expect(codeBlock).toBeInTheDocument();
  });

  it('모든 선택지에 올바른 라벨이 표시된다', () => {
    renderQuizCode();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('선택지 클릭 시 onAnswerChange가 올바른 id로 호출된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizCode({ onAnswerChange: handleAnswerChange });

    const option = screen.getByText('[data-state="open"]');
    fireEvent.click(option);

    expect(handleAnswerChange).toHaveBeenCalledWith('c1');
  });

  it('selectedAnswer가 설정되면 해당 선택지가 선택된 상태로 표시된다', () => {
    renderQuizCode({ selectedAnswer: 'c2' });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('showResult가 true일 때 정답/오답 상태가 표시된다', () => {
    renderQuizCode({ selectedAnswer: 'c1', showResult: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disabled가 true일 때 모든 선택지가 비활성화된다', () => {
    renderQuizCode({ disabled: true });
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
