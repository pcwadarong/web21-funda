import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizOX } from '@/feat/quiz/components/quizType/QuizOX';
import type { DefaultContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: DefaultContent = {
  question: '테스트 문제',
  options: [
    { id: 'o', text: 'O' },
    { id: 'x', text: 'X' },
  ],
};

const renderQuizOX = (props = {}) => {
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
      <QuizOX {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizOX 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizOX();
    expect(screen.getByText('O')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('O 선택지 클릭 시 onAnswerChange가 올바른 id로 호출된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizOX({ onAnswerChange: handleAnswerChange });

    const optionO = screen.getByText('O');
    fireEvent.click(optionO);

    expect(handleAnswerChange).toHaveBeenCalledWith('o');
  });

  it('X 선택지 클릭 시 onAnswerChange가 올바른 id로 호출된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizOX({ onAnswerChange: handleAnswerChange });

    const optionX = screen.getByText('X');
    fireEvent.click(optionX);

    expect(handleAnswerChange).toHaveBeenCalledWith('x');
  });

  it('selectedAnswer가 o일 때 O 선택지가 선택된 상태로 표시된다', () => {
    renderQuizOX({ selectedAnswer: 'o' });
    const buttonO = screen.getByRole('button', { name: 'O' });
    const buttonX = screen.getByRole('button', { name: 'X' });

    expect(buttonO).toHaveAttribute('aria-pressed', 'true');
    expect(buttonX).toHaveAttribute('aria-pressed', 'false');
    expect(buttonO).toHaveAttribute('data-selected', 'true');
  });

  it('selectedAnswer가 x일 때 X 선택지가 선택된 상태로 표시된다', () => {
    renderQuizOX({ selectedAnswer: 'x' });
    const buttonO = screen.getByRole('button', { name: 'O' });
    const buttonX = screen.getByRole('button', { name: 'X' });

    expect(buttonX).toHaveAttribute('aria-pressed', 'true');
    expect(buttonO).toHaveAttribute('aria-pressed', 'false');
    expect(buttonX).toHaveAttribute('data-selected', 'true');
  });

  it('showResult가 true일 때 정답/오답 상태가 표시되고 클릭이 막힌다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizOX({
      selectedAnswer: 'o',
      correctAnswer: 'x',
      showResult: true,
      onAnswerChange: handleAnswerChange,
    });

    const buttonO = screen.getByRole('button', { name: 'O' });
    const buttonX = screen.getByRole('button', { name: 'X' });

    // 결과 표시 중엔 클릭 불가
    expect(buttonO).toBeDisabled();
    expect(buttonX).toBeDisabled();

    // 선택된 오답(O) / 정답(X) 상태 표기
    expect(buttonO).toHaveAttribute('data-wrong', 'true');
    expect(buttonX).toHaveAttribute('data-correct', 'true');

    fireEvent.click(buttonX);
    expect(handleAnswerChange).not.toHaveBeenCalled();
  });

  it('disabled가 true일 때 모든 선택지가 비활성화된다', () => {
    renderQuizOX({ disabled: true });
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
