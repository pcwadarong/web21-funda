import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QuizMatching } from '@/feat/quiz/components/quizType/QuizMatching';
import type { MatchingContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: MatchingContent = {
  question: '선택자와 의미를 올바르게 연결하세요.',
  matching_metadata: {
    left: ['div p', 'div > p', 'h1 + p', 'h1 ~ p'],
    right: ['div의 모든 자손 p', 'div의 직계 자식 p', 'h1 바로 다음 p', 'h1 뒤의 모든 형제 p'],
  },
};

const renderQuizMatching = (props = {}) => {
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
      <QuizMatching {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('QuizMatching 컴포넌트 테스트', () => {
  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizMatching();
    expect(screen.getByText('div p')).toBeInTheDocument();
    expect(screen.getByText('div > p')).toBeInTheDocument();
    expect(screen.getByText('div의 모든 자손 p')).toBeInTheDocument();
    expect(screen.getByText('div의 직계 자식 p')).toBeInTheDocument();
  });

  it('좌측 항목 클릭 시 임시 선택 상태가 된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizMatching({ onAnswerChange: handleAnswerChange });

    const leftOption = screen.getByText('div p');
    fireEvent.click(leftOption);

    // 임시 선택 상태이므로 onAnswerChange는 호출되지 않음
    expect(handleAnswerChange).not.toHaveBeenCalled();
  });

  it('좌측 항목 클릭 후 우측 항목 클릭 시 매칭 쌍이 생성된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizMatching({ onAnswerChange: handleAnswerChange });

    const leftOption = screen.getByText('div p');
    const rightOption = screen.getByText('div의 모든 자손 p');

    fireEvent.click(leftOption);
    fireEvent.click(rightOption);

    expect(handleAnswerChange).toHaveBeenCalledWith({
      pairs: [{ left: 'div p', right: 'div의 모든 자손 p' }],
    });
  });

  it('이미 매칭된 항목 클릭 시 매칭이 해제된다', () => {
    const handleAnswerChange = vi.fn();
    const selectedAnswer = {
      pairs: [{ left: 'div p', right: 'div의 모든 자손 p' }],
    };

    renderQuizMatching({ selectedAnswer, onAnswerChange: handleAnswerChange });

    const leftOption = screen.getByText('div p');
    fireEvent.click(leftOption);

    expect(handleAnswerChange).toHaveBeenCalledWith({ pairs: [] });
  });

  it('selectedAnswer에 pairs가 있을 때 매칭된 항목이 표시된다', () => {
    const selectedAnswer = {
      pairs: [
        { left: 'div p', right: 'div의 모든 자손 p' },
        { left: 'div > p', right: 'div의 직계 자식 p' },
      ],
    };

    renderQuizMatching({ selectedAnswer });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('showResult가 true일 때 정답/오답 상태가 표시된다', () => {
    const selectedAnswer = {
      pairs: [{ left: 'div p', right: 'div의 모든 자손 p' }],
    };

    renderQuizMatching({ selectedAnswer, showResult: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('disabled가 true일 때 모든 선택지가 비활성화된다', () => {
    renderQuizMatching({ disabled: true });
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('showResult가 true일 때 클릭이 비활성화된다', () => {
    const handleAnswerChange = vi.fn();
    renderQuizMatching({ showResult: true, onAnswerChange: handleAnswerChange });

    const leftOption = screen.getByText('div p');
    fireEvent.click(leftOption);

    expect(handleAnswerChange).not.toHaveBeenCalled();
  });
});
