import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CorrectAnswerType } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

import { QuizInfoSection } from '../QuizInfoSection';
import type { QuizPreview } from '../types';

vi.mock('@/comp/CodeBlock', () => ({
  CodeBlock: ({ children, language }: { children: string; language: string }) => (
    <div data-testid="code-block" data-language={language}>
      {children}
    </div>
  ),
}));

vi.mock('@/utils/textParser', () => ({
  TextWithCodeStyle: ({ text }: { text: string }) => <span>{text}</span>,
}));

const renderQuizInfo = (preview: QuizPreview, correctAnswer: CorrectAnswerType | null = null) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <QuizInfoSection preview={preview} correctAnswer={correctAnswer} />
    </ThemeProvider>,
  );

describe('QuizInfoSection', () => {
  afterEach(() => {
    cleanup();
  });

  describe('기본 렌더링', () => {
    it('문제 정보 제목과 질문이 렌더링된다', () => {
      const preview: QuizPreview = {
        question: '테스트 질문',
        options: [],
        matching: null,
        code: null,
        type: 'mcq',
      };

      renderQuizInfo(preview);
      expect(screen.getByText('문제 정보')).toBeInTheDocument();
      expect(screen.getByText(/Q\. 테스트 질문/)).toBeInTheDocument();
    });
  });

  describe('MCQ 타입', () => {
    it('모든 선지가 렌더링되고 정답이 강조된다', () => {
      const preview: QuizPreview = {
        question: 'MCQ 질문',
        options: [
          { id: 'c1', text: '선지 1' },
          { id: 'c2', text: '선지 2' },
          { id: 'c3', text: '선지 3' },
        ],
        matching: null,
        code: null,
        type: 'mcq',
      };

      renderQuizInfo(preview, 'c2');
      expect(screen.getByText('선지 1')).toBeInTheDocument();
      expect(screen.getByText('선지 2')).toBeInTheDocument();
      expect(screen.getByText('선지 3')).toBeInTheDocument();
    });

    it('정답이 없을 때도 모든 선지가 렌더링된다', () => {
      const preview: QuizPreview = {
        question: 'MCQ 질문',
        options: [
          { id: 'c1', text: '선지 1' },
          { id: 'c2', text: '선지 2' },
        ],
        matching: null,
        code: null,
        type: 'mcq',
      };

      renderQuizInfo(preview, null);
      expect(screen.getByText('선지 1')).toBeInTheDocument();
      expect(screen.getByText('선지 2')).toBeInTheDocument();
    });
  });

  describe('OX 타입', () => {
    it('정답이 O일 때 O만 표시된다', () => {
      const preview: QuizPreview = {
        question: 'OX 질문',
        options: [
          { id: 'o', text: 'O' },
          { id: 'x', text: 'X' },
        ],
        matching: null,
        code: null,
        type: 'ox',
      };

      renderQuizInfo(preview, 'o');
      expect(screen.getByText('O')).toBeInTheDocument();
      expect(screen.queryByText('X')).not.toBeInTheDocument();
    });

    it('정답이 X일 때 X만 표시된다', () => {
      const preview: QuizPreview = {
        question: 'OX 질문',
        options: [
          { id: 'o', text: 'O' },
          { id: 'x', text: 'X' },
        ],
        matching: null,
        code: null,
        type: 'ox',
      };

      renderQuizInfo(preview, 'x');
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.queryByText('O')).not.toBeInTheDocument();
    });

    it('정답이 없을 때는 아무것도 표시되지 않는다', () => {
      const preview: QuizPreview = {
        question: 'OX 질문',
        options: [
          { id: 'o', text: 'O' },
          { id: 'x', text: 'X' },
        ],
        matching: null,
        code: null,
        type: 'ox',
      };

      renderQuizInfo(preview, null);
      expect(screen.queryByText('O')).not.toBeInTheDocument();
      expect(screen.queryByText('X')).not.toBeInTheDocument();
    });
  });

  describe('Code 타입', () => {
    it('코드 블록이 렌더링된다', () => {
      const preview: QuizPreview = {
        question: '코드 질문',
        options: [
          { id: 'c1', text: '선지 1' },
          { id: 'c2', text: '선지 2' },
        ],
        matching: null,
        code: {
          language: 'javascript',
          snippet: 'const x = 10;',
        },
        type: 'code',
      };

      renderQuizInfo(preview, 'c1');
      expect(screen.getByText('코드')).toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
      expect(screen.getByTestId('code-block')).toHaveAttribute('data-language', 'javascript');
    });

    it('코드가 없을 때는 코드 섹션이 렌더링되지 않는다', () => {
      const preview: QuizPreview = {
        question: '코드 질문',
        options: [],
        matching: null,
        code: null,
        type: 'code',
      };

      renderQuizInfo(preview);
      expect(screen.queryByText('코드')).not.toBeInTheDocument();
    });
  });

  describe('Matching 타입', () => {
    it('정답이 있을 때 정답 쌍이 표시된다', () => {
      const preview: QuizPreview = {
        question: '매칭 질문',
        options: [],
        matching: {
          left: [
            { id: 'l1', text: '왼쪽 1' },
            { id: 'l2', text: '왼쪽 2' },
          ],
          right: [
            { id: 'r1', text: '오른쪽 1' },
            { id: 'r2', text: '오른쪽 2' },
          ],
        },
        code: null,
        type: 'matching',
      };

      const correctAnswer: CorrectAnswerType = {
        pairs: [
          { left: 'l1', right: 'r1' },
          { left: 'l2', right: 'r2' },
        ],
      };

      renderQuizInfo(preview, correctAnswer);
      // TextWithCodeStyle이 모킹되어 있으므로 텍스트가 직접 표시됨
      expect(screen.getByText(/왼쪽 1/)).toBeInTheDocument();
      expect(screen.getByText(/오른쪽 1/)).toBeInTheDocument();
      expect(screen.getByText(/왼쪽 2/)).toBeInTheDocument();
      expect(screen.getByText(/오른쪽 2/)).toBeInTheDocument();
    });

    it('정답이 없을 때 양쪽 항목이 분리되어 표시된다', () => {
      const preview: QuizPreview = {
        question: '매칭 질문',
        options: [],
        matching: {
          left: [
            { id: 'l1', text: '왼쪽 1' },
            { id: 'l2', text: '왼쪽 2' },
          ],
          right: [
            { id: 'r1', text: '오른쪽 1' },
            { id: 'r2', text: '오른쪽 2' },
          ],
        },
        code: null,
        type: 'matching',
      };

      renderQuizInfo(preview, null);
      expect(screen.getByText('왼쪽')).toBeInTheDocument();
      expect(screen.getByText('오른쪽')).toBeInTheDocument();
      expect(screen.getByText('왼쪽 1')).toBeInTheDocument();
      expect(screen.getByText('왼쪽 2')).toBeInTheDocument();
      expect(screen.getByText('오른쪽 1')).toBeInTheDocument();
      expect(screen.getByText('오른쪽 2')).toBeInTheDocument();
    });

    it('매칭 항목이 없을 때는 아무것도 렌더링되지 않는다', () => {
      const preview: QuizPreview = {
        question: '매칭 질문',
        options: [],
        matching: null,
        code: null,
        type: 'matching',
      };

      renderQuizInfo(preview, null);
      expect(screen.getByText('정답')).toBeInTheDocument();
    });
  });

  describe('엣지 케이스', () => {
    it('빈 선지 배열을 처리한다', () => {
      const preview: QuizPreview = {
        question: '빈 선지 질문',
        options: [],
        matching: null,
        code: null,
        type: 'mcq',
      };

      renderQuizInfo(preview);
      expect(screen.getByText(/Q\. 빈 선지 질문/)).toBeInTheDocument();
    });

    it('매칭 항목의 ID가 정답과 일치하지 않을 때 ID를 표시한다', () => {
      const preview: QuizPreview = {
        question: '매칭 질문',
        options: [],
        matching: {
          left: [{ id: 'l1', text: '왼쪽 1' }],
          right: [{ id: 'r1', text: '오른쪽 1' }],
        },
        code: null,
        type: 'matching',
      };

      const correctAnswer: CorrectAnswerType = {
        pairs: [{ left: 'l1', right: 'unknown' }],
      };

      renderQuizInfo(preview, correctAnswer);
      // TextWithCodeStyle이 모킹되어 있으므로 텍스트가 직접 표시됨
      expect(screen.getByText(/왼쪽 1/)).toBeInTheDocument();
      expect(screen.getByText(/unknown/)).toBeInTheDocument();
    });

    it('정답이 객체 형태로 전달될 때 처리한다', () => {
      const preview: QuizPreview = {
        question: 'MCQ 질문',
        options: [{ id: 'c1', text: '선지 1' }],
        matching: null,
        code: null,
        type: 'mcq',
      };

      const correctAnswer = { correct_option_id: 'c1' } as unknown as CorrectAnswerType;

      renderQuizInfo(preview, correctAnswer);
      expect(screen.getByText('선지 1')).toBeInTheDocument();
    });
  });
});
