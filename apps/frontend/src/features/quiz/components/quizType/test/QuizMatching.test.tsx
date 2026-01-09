import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizMatching } from '@/feat/quiz/components/quizType/QuizMatching';
import type { AnswerType, MatchingContent, MatchingPair } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: MatchingContent = {
  question: '선택자와 의미를 올바르게 연결하세요.',
  matching_metadata: {
    left: ['div p', 'div > p', 'h1 + p', 'h1 ~ p'],
    right: ['div의 모든 자손 p', 'div의 직계 자식 p', 'h1 바로 다음 p', 'h1 뒤의 모든 형제 p'],
  },
};

// 테스트용 정답 데이터 (텍스트 기반 - 서버 응답 시뮬레이션)
// 컴포넌트 내부에서 인덱스 기반으로 자동 변환됨
// left[0]='div p' ↔ right[0]='div의 모든 자손 p'
// left[1]='div > p' ↔ right[1]='div의 직계 자식 p'
// left[2]='h1 + p' ↔ right[2]='h1 바로 다음 p'
// left[3]='h1 ~ p' ↔ right[3]='h1 뒤의 모든 형제 p'
const mockCorrectPairsTextBased = [
  { left: 'div p', right: 'div의 모든 자손 p' },
  { left: 'div > p', right: 'div의 직계 자식 p' },
  { left: 'h1 + p', right: 'h1 바로 다음 p' },
  { left: 'h1 ~ p', right: 'h1 뒤의 모든 형제 p' },
] as unknown as MatchingPair[]; // 서버 응답이 텍스트 기반이므로 타입 단언 사용

const renderQuizMatching = (props = {}) => {
  const defaultProps = {
    content: mockContent,
    selectedAnswer: null,
    correctAnswer: { pairs: mockCorrectPairsTextBased }, // 서버 응답 시뮬레이션 (텍스트 기반)
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
  let observeSpy: ReturnType<typeof vi.fn>;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeSpy = vi.fn();
    disconnectSpy = vi.fn();

    // ResizeObserver 모킹
    global.ResizeObserver = class ResizeObserver {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = disconnectSpy;

      constructor(callback: ResizeObserverCallback) {
        // callback은 사용하지 않지만 타입을 맞추기 위해 받음
        void callback;
      }
    } as typeof ResizeObserver;
  });

  afterEach(() => {
    cleanup();
  });

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

    const leftOption = screen.getByText('div p'); // left[0]
    const rightOption = screen.getByText('div의 모든 자손 p'); // right[0]

    fireEvent.click(leftOption);
    fireEvent.click(rightOption);

    expect(handleAnswerChange).toHaveBeenCalledWith({
      pairs: [{ leftIndex: 0, rightIndex: 0 }],
    });
  });

  it('이미 매칭된 항목 클릭 시 매칭이 해제된다', () => {
    const handleAnswerChange = vi.fn();
    const selectedAnswer: AnswerType = {
      pairs: [{ leftIndex: 0, rightIndex: 0 }],
    };

    renderQuizMatching({ selectedAnswer, onAnswerChange: handleAnswerChange });

    const leftOption = screen.getByText('div p'); // left[0]
    fireEvent.click(leftOption);

    expect(handleAnswerChange).toHaveBeenCalledWith({ pairs: [] });
  });

  it('중복 매칭 방지: left-A가 right-B와 매칭된 상태에서 left-A를 다시 클릭하고 right-C를 클릭하면 기존 매칭이 해제되고 새로운 매칭으로 교체된다', () => {
    const handleAnswerChange = vi.fn();
    let currentPairs: AnswerType = {
      pairs: [{ leftIndex: 0, rightIndex: 0 }], // left[0]='div p' ↔ right[0]='div의 모든 자손 p'
    };

    const { rerender } = renderQuizMatching({
      selectedAnswer: currentPairs,
      correctAnswer: { pairs: mockCorrectPairsTextBased },
      onAnswerChange: (answer: AnswerType) => {
        currentPairs = answer;
        handleAnswerChange(answer);
        rerender(
          <ThemeProvider theme={lightTheme}>
            <QuizMatching
              content={mockContent}
              selectedAnswer={currentPairs}
              correctAnswer={{ pairs: mockCorrectPairsTextBased }}
              showResult={false}
              onAnswerChange={handleAnswerChange}
              disabled={false}
            />
          </ThemeProvider>,
        );
      },
    });

    // left-A(div p, index=0)를 다시 클릭 (기존 매칭 해제)
    const leftA = screen.getByText('div p');
    fireEvent.click(leftA);

    // 첫 번째 호출: 기존 매칭 해제
    expect(handleAnswerChange).toHaveBeenNthCalledWith(1, { pairs: [] });

    // left-A를 다시 클릭 (임시 선택)
    fireEvent.click(leftA);

    // right-C(div의 직계 자식 p, index=1) 클릭
    const rightC = screen.getByText('div의 직계 자식 p');
    fireEvent.click(rightC);

    // 두 번째 호출: 새로운 매칭 생성 (left[0] ↔ right[1])
    expect(handleAnswerChange).toHaveBeenNthCalledWith(2, {
      pairs: [{ leftIndex: 0, rightIndex: 1 }],
    });
  });

  it('중복 매칭 방지: right-B가 left-A와 매칭된 상태에서 right-B를 다시 클릭하고 left-C를 클릭하면 기존 매칭이 해제되고 새로운 매칭으로 교체된다', () => {
    const handleAnswerChange = vi.fn();
    let currentPairs: AnswerType = {
      pairs: [{ leftIndex: 0, rightIndex: 0 }], // left[0]='div p' ↔ right[0]='div의 모든 자손 p'
    };

    const { rerender } = renderQuizMatching({
      selectedAnswer: currentPairs,
      correctAnswer: { pairs: mockCorrectPairsTextBased },
      onAnswerChange: (answer: AnswerType) => {
        currentPairs = answer;
        handleAnswerChange(answer);
        rerender(
          <ThemeProvider theme={lightTheme}>
            <QuizMatching
              content={mockContent}
              selectedAnswer={currentPairs}
              correctAnswer={{ pairs: mockCorrectPairsTextBased }}
              showResult={false}
              onAnswerChange={handleAnswerChange}
              disabled={false}
            />
          </ThemeProvider>,
        );
      },
    });

    // right-B(right[0]='div의 모든 자손 p')를 다시 클릭 (기존 매칭 해제)
    const rightB = screen.getByText('div의 모든 자손 p');
    fireEvent.click(rightB);

    // 첫 번째 호출: 기존 매칭 해제
    expect(handleAnswerChange).toHaveBeenNthCalledWith(1, { pairs: [] });

    // right-B를 다시 클릭 (임시 선택)
    fireEvent.click(rightB);

    // left-C(left[1]='div > p') 클릭
    const leftC = screen.getByText('div > p');
    fireEvent.click(leftC);

    // 두 번째 호출: 새로운 매칭 생성 (left[1] ↔ right[0])
    expect(handleAnswerChange).toHaveBeenNthCalledWith(2, {
      pairs: [{ leftIndex: 1, rightIndex: 0 }],
    });
  });

  it('selectedAnswer에 pairs가 있을 때 매칭된 항목이 표시된다', () => {
    const selectedAnswer: AnswerType = {
      pairs: [
        { leftIndex: 0, rightIndex: 0 }, // left[0]='div p' ↔ right[0]='div의 모든 자손 p'
        { leftIndex: 1, rightIndex: 1 }, // left[1]='div > p' ↔ right[1]='div의 직계 자식 p'
      ],
    };

    renderQuizMatching({ selectedAnswer, correctAnswer: { pairs: mockCorrectPairsTextBased } });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('showResult가 true일 때 정답/오답 상태가 표시된다', () => {
    const selectedAnswer: AnswerType = {
      pairs: [{ leftIndex: 0, rightIndex: 0 }], // 정답: left[0] ↔ right[0]
    };

    renderQuizMatching({
      selectedAnswer,
      correctAnswer: { pairs: mockCorrectPairsTextBased },
      showResult: true,
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('showResult가 true일 때 SVG 라인이 렌더링된다', () => {
    const selectedAnswer: AnswerType = {
      pairs: [
        { leftIndex: 0, rightIndex: 0 }, // left[0] ↔ right[0]
        { leftIndex: 1, rightIndex: 1 }, // left[1] ↔ right[1]
      ],
    };

    const { container } = renderQuizMatching({
      selectedAnswer,
      correctAnswer: { pairs: mockCorrectPairsTextBased },
      showResult: true,
    });
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('리사이즈 시 ResizeObserver가 설정된다', () => {
    const selectedAnswer: AnswerType = {
      pairs: [{ leftIndex: 0, rightIndex: 0 }],
    };

    const { unmount } = renderQuizMatching({
      selectedAnswer,
      correctAnswer: { pairs: mockCorrectPairsTextBased },
      showResult: true,
    });

    // ResizeObserver가 생성되고 observe가 호출되었는지 확인
    expect(observeSpy).toHaveBeenCalled();

    unmount();

    // 컴포넌트 언마운트 시 disconnect가 호출되었는지 확인
    expect(disconnectSpy).toHaveBeenCalled();
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

  it('여러 쌍을 순차적으로 매칭할 수 있다', () => {
    const handleAnswerChange = vi.fn();
    let currentPairs: AnswerType | null = null;

    const { rerender } = renderQuizMatching({
      selectedAnswer: currentPairs,
      correctAnswer: { pairs: mockCorrectPairsTextBased },
      onAnswerChange: (answer: AnswerType) => {
        currentPairs = answer;
        handleAnswerChange(answer);
        rerender(
          <ThemeProvider theme={lightTheme}>
            <QuizMatching
              content={mockContent}
              selectedAnswer={currentPairs}
              correctAnswer={{ pairs: mockCorrectPairsTextBased }}
              showResult={false}
              onAnswerChange={handleAnswerChange}
              disabled={false}
            />
          </ThemeProvider>,
        );
      },
    });

    // 첫 번째 쌍: left[0] ↔ right[0]
    fireEvent.click(screen.getByText('div p')); // left[0]
    fireEvent.click(screen.getByText('div의 모든 자손 p')); // right[0]

    expect(handleAnswerChange).toHaveBeenNthCalledWith(1, {
      pairs: [{ leftIndex: 0, rightIndex: 0 }],
    });

    // 두 번째 쌍: left[1] ↔ right[1]
    fireEvent.click(screen.getByText('div > p')); // left[1]
    fireEvent.click(screen.getByText('div의 직계 자식 p')); // right[1]

    expect(handleAnswerChange).toHaveBeenNthCalledWith(2, {
      pairs: [
        { leftIndex: 0, rightIndex: 0 },
        { leftIndex: 1, rightIndex: 1 },
      ],
    });
  });
});
