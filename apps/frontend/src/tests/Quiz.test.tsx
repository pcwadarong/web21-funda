import { ThemeProvider } from '@emotion/react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Quiz } from '@/pages/Quiz';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

// 페이지 레벨 테스트를 위해 하위 컴포넌트(QuizContentCard)를 모킹합니다.
vi.mock('@/feat/quiz/components/QuizContentCard', () => ({
  QuizContentCard: ({
    question,
    status,
    isSubmitDisabled,
    onAnswerChange,
    onCheck,
    onNext,
  }: {
    question: unknown;
    status: 'idle' | 'checking' | 'checked';
    isSubmitDisabled: boolean;
    onAnswerChange: (a: unknown) => void;
    onCheck: () => void;
    onNext: () => void;
  }) => {
    type MatchingQuestion = {
      type?: string;
      content?: { matching_metadata: { left: string[]; right: string[] } };
    };
    const handleSelect = () => {
      const q = question as MatchingQuestion;
      if (q?.type === 'matching') {
        const left: string[] = q.content!.matching_metadata.left;
        const right: string[] = q.content!.matching_metadata.right;
        const pairs = left.map((l: string, i: number) => ({ left: l, right: right[i] }));
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

// 결과 페이지 네비게이션 호출 확인을 위해 useNavigate를 부분 모킹
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderQuiz = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ModalProvider>
        <MemoryRouter initialEntries={['/quiz']}>
          <Quiz />
        </MemoryRouter>
      </ModalProvider>
    </ThemeProvider>,
  );

describe('Quiz 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('초기 렌더링: 헤더와 비활성화된 정답 확인 버튼만 확인한다', () => {
    renderQuiz();

    // 퀴즈 헤더 확인
    expect(screen.getByText(/1\/5/)).toBeInTheDocument();

    // 정답 확인 버튼이 비활성화되어 있어야 함
    const checkButton = screen.getByText('정답 확인');
    expect(checkButton).toBeDisabled();
  });

  it('마지막 문제에서 다음으로 → 결과 페이지 네비게이션 호출', async () => {
    renderQuiz();

    // 5문제를 순차 진행
    for (let step = 1; step <= 5; step += 1) {
      await act(async () => {
        fireEvent.click(screen.getByText('옵션 선택'));
      });
      await act(async () => {
        fireEvent.click(screen.getByText('정답 확인'));
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        fireEvent.click(screen.getByText('다음 문제로'));
      });
    }

    expect(navigateMock).toHaveBeenCalledWith('/quiz/result');
  });
});
