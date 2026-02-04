import { ThemeProvider } from '@emotion/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import type { QuizQuestion } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const openModalMock = vi.fn();

vi.mock('@/store/modalStore', async () => {
  const actual = await vi.importActual('@/store/modalStore');
  return {
    ...(actual as object),
    useModal: () => ({ openModal: openModalMock }),
  };
});

vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

vi.mock('@/feat/quiz/components/QuizRenderer', () => ({
  QuizRenderer: (props: { disabled: boolean; showResult: boolean }) => (
    <div
      data-testid="quiz-renderer"
      data-disabled={String(props.disabled)}
      data-show={String(props.showResult)}
    />
  ),
}));

const baseQuestion: QuizQuestion = {
  id: 1,
  type: 'mcq',
  content: {
    question: '테스트 질문',
    options: [
      { id: 'c1', text: '첫 번째 선택지' },
      { id: 'c2', text: '두 번째 선택지' },
    ],
  },
};

const renderCard = (overrides: Partial<React.ComponentProps<typeof QuizContentCard>> = {}) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <QuizContentCard
        question={baseQuestion}
        status="idle"
        selectedAnswer={null}
        correctAnswer={null}
        explanation="문제 해설 내용이 여기에 노출됩니다."
        onAnswerChange={vi.fn()}
        isSubmitDisabled
        isDontKnowDisabled={false}
        onCheck={vi.fn()}
        onDontKnow={vi.fn()}
        onNext={vi.fn()}
        isLast={false}
        isReviewMode={false}
        {...overrides}
      />
    </ThemeProvider>,
  );

describe('QuizContentCard', () => {
  beforeEach(() => {
    openModalMock.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('헤더에 문제 텍스트와 신고 버튼이 렌더링된다', () => {
    renderCard();
    expect(screen.getByText('테스트 질문')).toBeInTheDocument();
    expect(screen.getByText('신고')).toBeInTheDocument();
  });

  it('신고 버튼 클릭 시 openModal이 호출된다', () => {
    renderCard();
    fireEvent.click(screen.getByText('신고'));
    expect(openModalMock).toHaveBeenCalledWith('오류 신고', expect.anything());
  });

  it('status=idle && isSubmitDisabled=true이면 정답 확인 버튼이 비활성화된다', () => {
    renderCard({ isSubmitDisabled: true });
    const btn = screen.getByRole('button', { name: '정답 확인' });
    expect(btn).toBeDisabled();
  });

  it('status=idle && isSubmitDisabled=false이면 정답 확인 버튼이 활성화된다', () => {
    renderCard({ isSubmitDisabled: false });
    const btn = screen.getByRole('button', { name: '정답 확인' });
    expect(btn).not.toBeDisabled();
  });

  it('status=checking이면 버튼 라벨이 "확인 중.."으로 변경된다', () => {
    renderCard({ status: 'checking' });
    expect(screen.getByRole('button', { name: '확인 중..' })).toBeInTheDocument();
  });

  it('status=idle일 때 QuizRenderer에 disabled=false, showResult=false가 전달된다', () => {
    renderCard({ status: 'idle' });
    expect(screen.getByTestId('quiz-renderer')).toHaveAttribute('data-disabled', 'false');
    expect(screen.getByTestId('quiz-renderer')).toHaveAttribute('data-show', 'false');
  });

  it('status=checked일 때 QuizRenderer에 disabled=true, showResult=true가 전달된다', () => {
    renderCard({ status: 'checked' });
    expect(screen.getByTestId('quiz-renderer')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('quiz-renderer')).toHaveAttribute('data-show', 'true');
  });

  it('status=checked이면 해설 영역과 2개 버튼(다음 문제/AI 질문)이 노출된다', () => {
    const onNext = vi.fn();
    renderCard({ status: 'checked', onNext, isLast: false });

    //TODO: 수정
    expect(screen.getByText('문제 해설 내용이 여기에 노출됩니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 문제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI 질문' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('status=checked && isLast=true이면 다음 버튼 라벨이 "결과 보기"로 변경된다', () => {
    renderCard({ status: 'checked', isLast: true, isReviewMode: false });
    expect(screen.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();
  });

  it('status=checked && isLast=true && isReviewMode=true이면 다음 버튼 라벨이 "복습 완료"로 변경된다', () => {
    renderCard({ status: 'checked', isLast: true, isReviewMode: true });
    expect(screen.getByRole('button', { name: '복습 완료' })).toBeInTheDocument();
  });

  it('AI 질문 버튼 클릭 시 openModal이 호출된다', () => {
    renderCard({ status: 'checked' });
    fireEvent.click(screen.getByRole('button', { name: 'AI 질문' }));
    expect(openModalMock).toHaveBeenCalledWith(
      'AI에게 질문하기',
      expect.anything(),
      expect.anything(),
    );
  });

  it('idle 상태에서 정답 확인 버튼 클릭 시 onCheck가 호출된다', () => {
    const onCheck = vi.fn();
    renderCard({ isSubmitDisabled: false, onCheck });
    fireEvent.click(screen.getByRole('button', { name: '정답 확인' }));
    expect(onCheck).toHaveBeenCalledTimes(1);
  });

  it('idle 상태에서 잘 모르겠어요 버튼 클릭 시 onDontKnow가 호출된다', () => {
    const onDontKnow = vi.fn();
    renderCard({ onDontKnow });
    fireEvent.click(screen.getByRole('button', { name: '잘 모르겠어요' }));
    expect(onDontKnow).toHaveBeenCalledTimes(1);
  });

  it('isDontKnowDisabled=true이면 잘 모르겠어요 버튼이 비활성화된다', () => {
    renderCard({ isDontKnowDisabled: true });
    const btn = screen.getByRole('button', { name: '잘 모르겠어요' });
    expect(btn).toBeDisabled();
  });

  it('status=checked이면 잘 모르겠어요 버튼이 노출되지 않는다', () => {
    renderCard({ status: 'checked' });
    expect(screen.queryByRole('button', { name: '잘 모르겠어요' })).not.toBeInTheDocument();
  });

  it('복습 모드이면 잘 모르겠어요 버튼이 노출되지 않는다', () => {
    renderCard({ isReviewMode: true });
    expect(screen.queryByRole('button', { name: '잘 모르겠어요' })).not.toBeInTheDocument();
  });
});
