import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizOption } from '@/feat/quiz/components/quizOptions/QuizOption';
import { lightTheme } from '@/styles/theme';

const renderQuizOption = (props = {}) => {
  const defaultProps = {
    label: 'A',
    option: '테스트 옵션',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    onClick: vi.fn(),
    disabled: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <QuizOption {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizOption 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizOption();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('테스트 옵션')).toBeInTheDocument();
  });

  it('클릭 시 onClick 핸들러가 호출된다', () => {
    const handleClick = vi.fn();
    renderQuizOption({ onClick: handleClick });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태일 때 클릭이 비활성화된다', () => {
    const handleClick = vi.fn();
    renderQuizOption({ disabled: true, onClick: handleClick });

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('isSelected가 true일 때 선택된 스타일이 적용된다', () => {
    renderQuizOption({ isSelected: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isCorrect가 true일 때 정답 스타일이 적용된다', () => {
    renderQuizOption({ isCorrect: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('isWrong이 true일 때 오답 스타일이 적용된다', () => {
    renderQuizOption({ isWrong: true });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('label과 option 텍스트가 올바르게 표시된다', () => {
    renderQuizOption({ label: 'B', option: '다른 옵션' });
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('다른 옵션')).toBeInTheDocument();
  });
});
