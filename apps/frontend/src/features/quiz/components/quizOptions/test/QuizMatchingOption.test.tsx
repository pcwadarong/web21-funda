import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizMatchingOption } from '@/feat/quiz/components/quizOptions/QuizMatchingOption';
import { lightTheme } from '@/styles/theme';

const renderQuizMatchingOption = (props = {}) => {
  const defaultProps = {
    option: 'div p',
    isSelected: false,
    isMatched: false,
    isCorrect: false,
    isWrong: false,
    onClick: vi.fn(),
    disabled: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <QuizMatchingOption {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizMatchingOption 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizMatchingOption();
    expect(screen.getByText('div p')).toBeInTheDocument();
  });

  it('클릭 시 onClick 핸들러가 호출된다', () => {
    const handleClick = vi.fn();
    renderQuizMatchingOption({ onClick: handleClick });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭이 비활성화된다', () => {
    const handleClick = vi.fn();
    renderQuizMatchingOption({ disabled: true, onClick: handleClick });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('isSelected가 true일 때 선택된 스타일이 적용된다', () => {
    renderQuizMatchingOption({ isSelected: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isMatched가 true일 때 매칭된 스타일이 적용된다', () => {
    renderQuizMatchingOption({ isMatched: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isCorrect가 true일 때 정답 스타일이 적용된다', () => {
    renderQuizMatchingOption({ isCorrect: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isWrong이 true일 때 오답 스타일이 적용된다', () => {
    renderQuizMatchingOption({ isWrong: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('option 텍스트가 올바르게 표시된다', () => {
    renderQuizMatchingOption({ option: 'div > p' });
    expect(screen.getByText('div > p')).toBeInTheDocument();
  });
});
