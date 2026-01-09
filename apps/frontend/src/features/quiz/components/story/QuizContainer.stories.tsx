import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'vitest';

import { QuizContainer } from '@/feat/quiz/components/QuizContainer';
import type { QuizQuestion } from '@/feat/quiz/types';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

const mockQuizzes: QuizQuestion[] = [
  {
    id: 1,
    type: 'ox',
    content: {
      question: 'React는 프레임워크인가요?',
      options: [
        { id: 'O', text: 'O' },
        { id: 'X', text: 'X' },
      ],
    },
  },
];

const meta: Meta<typeof QuizContainer> = {
  title: 'Features/Quiz/QuizContainer',
  component: QuizContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <ModalProvider>
          <MemoryRouter initialEntries={['/quiz/1/1']}>
            <div style={{ backgroundColor: lightTheme.colors.surface.default, minHeight: '100vh' }}>
              <Story />
            </div>
          </MemoryRouter>
        </ModalProvider>
      </ThemeProvider>
    ),
  ],
  args: {
    quizzes: mockQuizzes,
    currentQuizIndex: 0,
    currentQuestionStatus: 'idle',
    selectedAnswers: [null],
    quizSolutions: [null],
    questionStatuses: ['idle'],
    isCheckDisabled: true,
    isLastQuestion: false,
    handleAnswerChange: () => {},
    handleCheckAnswer: async () => {},
    handleNextQuestion: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof QuizContainer>;

/** 1. 초기 상태: 아무것도 선택하지 않았을 때 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkButton = canvas.getByText('정답 확인');
    await expect(checkButton).toBeDisabled();
  },
};

/** 2. 옵션 선택 상태: 버튼이 활성화된 UI를 시뮬레이션 */
export const SelectOption: Story = {
  args: {
    selectedAnswers: ['O'], // 이미 선택된 상태로 주입
    isCheckDisabled: false, // 버튼 활성화 상태 주입
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkButton = canvas.getByText('정답 확인');
    await expect(checkButton).not.toBeDisabled();
  },
};

/** 3. 정답 확인 중 상태: 로딩 UI 확인 */
export const CheckAnswerLoading: Story = {
  args: {
    selectedAnswers: ['O'],
    currentQuestionStatus: 'checking', // 로딩 중 상태 주입
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // View 컴포넌트 내부 로직에 따라 '정답 확인 중..' 텍스트가 노출되는지 확인
    await expect(canvas.getByText(/확인 중/)).toBeInTheDocument();
  },
};

/** 4. 정답 확인 완료 상태: 해설 및 다음 버튼 노출 */
export const AnswerChecked: Story = {
  args: {
    currentQuestionStatus: 'checked',
    selectedAnswers: ['O'],
    quizSolutions: [
      {
        correctAnswer: 'O',
        explanation: 'React는 라이브러리이지만 프레임워크처럼 생태계가 큽니다.',
      },
    ],
    questionStatuses: ['checked'],
  },
};
