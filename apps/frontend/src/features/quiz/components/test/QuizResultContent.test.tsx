import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import { lightTheme } from '@/styles/theme';

// SVGIcon 모킹
vi.mock('@/comp/SVGIcon', () => ({
  default: () => <span data-testid="svg-icon" />,
}));

const mockResultData = {
  xpGained: 50,
  successRate: 70,
  durationMs: '1:40',
  currentStreak: 3,
  isFirstSolveToday: false,
};

const renderQuizResultContent = (props = {}) => {
  const defaultProps = {
    resultData: mockResultData,
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <QuizResultContent {...defaultProps} />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('QuizResultContent 컴포넌트 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderQuizResultContent();
    expect(screen.getByText('LESSON COMPLETE!')).toBeInTheDocument();
    expect(screen.getByText('획득 XP')).toBeInTheDocument();
    expect(screen.getByText('성공률')).toBeInTheDocument();
    expect(screen.getByText('소요 시간')).toBeInTheDocument();
  });

  it('결과 데이터가 올바르게 표시된다', () => {
    renderQuizResultContent();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('1:40')).toBeInTheDocument();
  });

  it('버튼이 올바르게 렌더링된다', () => {
    renderQuizResultContent();
    expect(screen.getByText('학습 계속하기')).toBeInTheDocument();
    expect(screen.getByText('메인 페이지로 이동하기')).toBeInTheDocument();
  });

  describe('데이터 누락 케이스', () => {
    it('모든 데이터가 null일 때 안내문구가 표시된다', () => {
      renderQuizResultContent({
        resultData: {
          xpGained: null,
          successRate: null,
          durationMs: '-',
          currentStreak: 1,
          isFirstSolveToday: false,
        },
      });

      expect(
        screen.getByText('결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.'),
      ).toBeInTheDocument();
    });

    it('일부 데이터만 null일 때 안내문구가 표시된다', () => {
      renderQuizResultContent({
        resultData: {
          xpGained: 50,
          successRate: null,
          durationMs: '1:30',
          currentStreak: 2,
          isFirstSolveToday: false,
        },
      });

      expect(
        screen.getByText('결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.'),
      ).toBeInTheDocument();
    });

    it('모든 데이터가 있을 때 안내문구가 표시되지 않는다', () => {
      renderQuizResultContent({
        resultData: {
          xpGained: 50,
          successRate: 70,
          durationMs: '1:40',
          currentStreak: 3,
          isFirstSolveToday: false,
        },
      });

      expect(
        screen.queryByText('결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('네비게이션 동작', () => {
    it('학습 계속하기 버튼 클릭 시 onNextNavigation이 호출된다', () => {
      const handleNextNavigation = vi.fn();
      renderQuizResultContent({ onNextNavigation: handleNextNavigation });
      const button = screen.getByText('학습 계속하기');
      fireEvent.click(button);

      expect(handleNextNavigation).toHaveBeenCalledTimes(1);
    });

    it('메인 페이지로 이동하기 버튼 클릭 시 onMainNavigation이 호출된다', () => {
      const handleMainNavigation = vi.fn();
      renderQuizResultContent({ onMainNavigation: handleMainNavigation });
      const button = screen.getByText('메인 페이지로 이동하기');
      fireEvent.click(button);

      expect(handleMainNavigation).toHaveBeenCalledTimes(1);
    });
  });

  describe('다양한 결과 데이터 케이스', () => {
    it('높은 점수 데이터가 올바르게 표시된다', () => {
      renderQuizResultContent({
        resultData: {
          xpGained: 100,
          successRate: 95,
          durationMs: '0:45',
          currentStreak: 10,
          isFirstSolveToday: false,
        },
      });

      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('0:45')).toBeInTheDocument();
    });

    it('낮은 점수 데이터가 올바르게 표시된다', () => {
      renderQuizResultContent({
        resultData: {
          xpGained: 10,
          successRate: 30,
          durationMs: '5:20',
          currentStreak: 1,
          isFirstSolveToday: false,
        },
      });

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('5:20')).toBeInTheDocument();
    });

    it('xpGained가 0일 때도 올바르게 표시된다', () => {
      renderQuizResultContent({
        resultData: {
          xpGained: 0,
          successRate: 50,
          durationMs: '2:00',
          currentStreak: 4,
          isFirstSolveToday: false,
        },
      });

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
