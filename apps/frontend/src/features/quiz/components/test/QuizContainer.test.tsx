import { ThemeProvider } from '@emotion/react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizContainer } from '@/feat/quiz/components/QuizContainer';
import type { QuizQuestion } from '@/feat/quiz/types';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

// 하위 컴포넌트 모킹
vi.mock('@/feat/quiz/components/QuizContentCard', () => ({
  QuizContentCard: (props: {
    question: unknown;
    status: 'idle' | 'checking' | 'checked';
    isSubmitDisabled: boolean;
    onAnswerChange: (a: unknown) => void;
    onCheck: () => void;
    onNext: () => void;
    isReviewMode: boolean;
  }) => {
    const { question, status, isSubmitDisabled, onAnswerChange, onCheck, onNext } = props;
    type MatchingQuestion = {
      type?: string;
      content?: {
        matching_metadata: {
          left: Array<{ id: string; text: string }>;
          right: Array<{ id: string; text: string }>;
        };
      };
    };
    const handleSelect = () => {
      const q = question as MatchingQuestion;
      if (q?.type === 'matching') {
        const left = q.content!.matching_metadata.left;
        const right = q.content!.matching_metadata.right;
        const pairs = left.map((item, i: number) => ({
          left: item.id,
          right: right[i]?.id ?? '',
        }));
        onAnswerChange({ pairs });
      } else {
        onAnswerChange('c1');
      }
    };

    return (
      <div>
        <button onClick={handleSelect}>옵션 선택</button>
        <button disabled={isSubmitDisabled} onClick={onCheck}>
          정답 확인
        </button>
        {status === 'checking' && <div>정답 확인 중..</div>}
        {status === 'checked' && <button onClick={onNext}>다음 문제로</button>}
      </div>
    );
  },
}));

const mockQuizzes: QuizQuestion[] = [
  {
    id: 1,
    type: 'mcq',
    content: {
      question: '테스트 문제 1',
      options: [
        { id: 'c1', text: '옵션 1' },
        { id: 'c2', text: '옵션 2' },
      ],
    },
  },
  {
    id: 2,
    type: 'mcq',
    content: {
      question: '테스트 문제 2',
      options: [
        { id: 'c1', text: '옵션 1' },
        { id: 'c2', text: '옵션 2' },
      ],
    },
  },
  {
    id: 3,
    type: 'mcq',
    content: {
      question: '테스트 문제 3',
      options: [
        { id: 'c1', text: '옵션 1' },
        { id: 'c2', text: '옵션 2' },
      ],
    },
  },
  {
    id: 4,
    type: 'mcq',
    content: {
      question: '테스트 문제 4',
      options: [
        { id: 'c1', text: '옵션 1' },
        { id: 'c2', text: '옵션 2' },
      ],
    },
  },
  {
    id: 5,
    type: 'mcq',
    content: {
      question: '테스트 문제 5',
      options: [
        { id: 'c1', text: '옵션 1' },
        { id: 'c2', text: '옵션 2' },
      ],
    },
  },
];

const renderContainer = (props: Partial<React.ComponentProps<typeof QuizContainer>> = {}) => {
  const defaultProps = {
    quizzes: mockQuizzes,
    currentQuizIndex: 0,
    currentQuestionStatus: 'idle' as const,
    selectedAnswers: [null],
    quizSolutions: [null],
    questionStatuses: ['idle' as const],
    isCheckDisabled: true,
    isLastQuestion: false,
    isReviewMode: false,
    handleAnswerChange: vi.fn(),
    handleCheckAnswer: vi.fn().mockResolvedValue(undefined),
    handleNextQuestion: vi.fn(),
    heartCount: 0,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <ModalProvider>
        <MemoryRouter initialEntries={['/quiz']}>
          <QuizContainer {...defaultProps} />
        </MemoryRouter>
      </ModalProvider>
    </ThemeProvider>,
  );
};

describe('QuizContainer 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('초기 렌더링: 헤더와 비활성화된 정답 확인 버튼만 확인한다', () => {
    renderContainer();

    // 퀴즈 헤더 확인
    expect(screen.getByText(/1\/5/)).toBeInTheDocument();

    // 정답 확인 버튼이 비활성화되어 있어야 함
    const checkButton = screen.getByText('정답 확인');
    expect(checkButton).toBeDisabled();
  });

  it('마지막 문제에서 다음으로 → handleNextQuestion 호출', async () => {
    const handleNextQuestion = vi.fn();
    renderContainer({
      currentQuizIndex: 4,
      isLastQuestion: true,
      currentQuestionStatus: 'checked',
      selectedAnswers: ['c1', 'c1', 'c1', 'c1', 'c1'],
      questionStatuses: ['checked', 'checked', 'checked', 'checked', 'checked'],
      handleNextQuestion,
    });

    // 마지막 문제에서 다음 버튼 클릭
    await act(async () => {
      fireEvent.click(screen.getByText('다음 문제로'));
    });

    expect(handleNextQuestion).toHaveBeenCalled();
  });

  it('퀴즈가 없을 때 렌더링되지 않는다', () => {
    const { container } = renderContainer({ quizzes: [] });

    expect(container).toBeEmptyDOMElement();
  });
});
