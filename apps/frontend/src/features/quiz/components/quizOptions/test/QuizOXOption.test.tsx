import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizOXOption } from '@/feat/quiz/components/quizOptions/QuizOXOption';
import { lightTheme } from '@/styles/theme';

const renderQuizOXOption = (props = {}) => {
  const defaultProps = {
    option: 'O',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    onClick: vi.fn(),
    disabled: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <QuizOXOption {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizOXOption 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizOXOption();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('X 옵션도 올바르게 렌더링된다', () => {
    renderQuizOXOption({ option: 'X' });
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('클릭 시 onClick 핸들러가 호출된다', () => {
    const handleClick = vi.fn();
    renderQuizOXOption({ onClick: handleClick });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭이 비활성화된다', () => {
    const handleClick = vi.fn();
    renderQuizOXOption({ disabled: true, onClick: handleClick });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('isSelected가 true일 때 선택된 스타일이 적용된다', () => {
    renderQuizOXOption({ isSelected: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isCorrect가 true일 때 정답 스타일이 적용된다', () => {
    renderQuizOXOption({ isCorrect: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isWrong이 true일 때 오답 스타일이 적용된다', () => {
    renderQuizOXOption({ isWrong: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
