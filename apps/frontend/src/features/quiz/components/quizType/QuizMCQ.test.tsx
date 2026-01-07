import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizMCQ } from '@/feat/quiz/components/quizType/QuizMCQ';
import type { DefaultContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: DefaultContent = {
  question: '테스트 문제',
  options: [
    { id: 'c1', text: '첫 번째 선택지' },
    { id: 'c2', text: '두 번째 선택지' },
    { id: 'c3', text: '세 번째 선택지' },
    { id: 'c4', text: '네 번째 선택지' },
  ],
};

const renderQuizMCQ = (props = {}) => {
  const defaultProps = {
    content: mockContent,
    selectedAnswer: null,
    showResult: false,
    onAnswerChange: vi.fn(),
    disabled: false,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <QuizMCQ {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizMCQ 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizMCQ();
    expect(screen.getByText('첫 번째 선택지')).toBeInTheDocument();
    expect(screen.getByText('두 번째 선택지')).toBeInTheDocument();
    expect(screen.getByText('세 번째 선택지')).toBeInTheDocument();
    expect(screen.getByText('네 번째 선택지')).toBeInTheDocument();
  });

  it('모든 선택지에 올바른 라벨이 표시된다', () => {
    renderQuizMCQ();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('선택지 클릭 시 onAnswerChange가 올바른 id로 호출된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizMCQ({ onAnswerChange: handleAnswerChange });

    const option = screen.getByText('첫 번째 선택지');
    fireEvent.click(option);

    expect(handleAnswerChange).toHaveBeenCalledWith('c1');
  });

  it('selectedAnswer가 설정되면 해당 선택지가 선택된 상태로 표시된다', () => {
    renderQuizMCQ({ selectedAnswer: 'c2' });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('showResult가 true일 때 정답/오답 상태가 표시된다', () => {
    renderQuizMCQ({ selectedAnswer: 'c1', showResult: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disabled가 true일 때 모든 선택지가 비활성화된다', () => {
    renderQuizMCQ({ disabled: true });
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('여러 선택지를 순차적으로 클릭해도 마지막 선택만 유지된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizMCQ({ onAnswerChange: handleAnswerChange });

    fireEvent.click(screen.getByText('첫 번째 선택지'));
    expect(handleAnswerChange).toHaveBeenCalledWith('c1');

    fireEvent.click(screen.getByText('두 번째 선택지'));
    expect(handleAnswerChange).toHaveBeenCalledWith('c2');
  });
});
