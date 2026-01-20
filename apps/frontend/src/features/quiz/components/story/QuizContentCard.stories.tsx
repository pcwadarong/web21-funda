import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { QuizContentCard } from '@/feat/quiz/components/QuizContentCard';
import type { QuizQuestion } from '@/feat/quiz/types';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

const sampleQuestion: QuizQuestion = {
  id: 1,
  type: 'mcq',
  content: {
    question: '테스트 질문(QuizContentCard)',
    options: [
      { id: 'c1', text: '첫 번째 선택지' },
      { id: 'c2', text: '두 번째 선택지' },
    ],
  },
};

const meta: Meta<typeof QuizContentCard> = {
  title: 'Features/Quiz/QuizContentCard',
  component: QuizContentCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '퀴즈 카드 UI(헤더/문제 렌더러/해설/푸터 버튼)를 구성하는 컴포넌트입니다. 상태(status)에 따라 버튼과 해설 노출이 달라집니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <ModalProvider>
          <div
            style={{
              width: '760px',
              backgroundColor: lightTheme.colors.surface.default,
              padding: '24px',
            }}
          >
            <Story />
          </div>
        </ModalProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizContentCard>;

export const IdleDisabled: Story = {
  args: {
    question: sampleQuestion,
    status: 'idle',
    selectedAnswer: null,
    onAnswerChange: () => {},
    isSubmitDisabled: true,
    onCheck: () => {},
    onNext: () => {},
    isLast: false,
    isReviewMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: '정답 확인' });
    await expect(btn).toBeDisabled();
  },
};

export const IdleEnabled: Story = {
  args: {
    question: sampleQuestion,
    status: 'idle',
    selectedAnswer: 'c1',
    onAnswerChange: () => {},
    isSubmitDisabled: false,
    onCheck: () => {},
    onNext: () => {},
    isLast: false,
    isReviewMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: '정답 확인' });
    await expect(btn).not.toBeDisabled();
  },
};

export const Checking: Story = {
  args: {
    question: sampleQuestion,
    status: 'checking',
    selectedAnswer: 'c1',
    onAnswerChange: () => {},
    isSubmitDisabled: false,
    onCheck: () => {},
    onNext: () => {},
    isLast: false,
    isReviewMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '확인 중..' })).toBeInTheDocument();
  },
};

export const Checked: Story = {
  args: {
    question: sampleQuestion,
    status: 'checked',
    selectedAnswer: 'c1',
    onAnswerChange: () => {},
    isSubmitDisabled: false,
    onCheck: () => {},
    onNext: () => {},
    isLast: false,
    isReviewMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '해설 보기' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: '다음 문제' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'AI 질문' })).toBeInTheDocument();
  },
};

export const CheckedLast: Story = {
  args: {
    question: sampleQuestion,
    status: 'checked',
    selectedAnswer: 'c1',
    onAnswerChange: () => {},
    isSubmitDisabled: false,
    onCheck: () => {},
    onNext: () => {},
    isLast: true,
    isReviewMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();
  },
};

export const CheckedLastReview: Story = {
  args: {
    question: sampleQuestion,
    status: 'checked',
    selectedAnswer: 'c1',
    onAnswerChange: () => {},
    isSubmitDisabled: false,
    onCheck: () => {},
    onNext: () => {},
    isLast: true,
    isReviewMode: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: '복습 완료' })).toBeInTheDocument();
  },
};

export const OpenReportModal: Story = {
  args: {
    question: sampleQuestion,
    status: 'idle',
    selectedAnswer: null,
    onAnswerChange: () => {},
    isSubmitDisabled: true,
    onCheck: () => {},
    onNext: () => {},
    isLast: false,
    isReviewMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '신고' }));
    await expect(canvas.getByText('오류 신고')).toBeInTheDocument();
  },
};
