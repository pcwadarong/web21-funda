import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

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
    isDontKnowDisabled: false,
    isLastQuestion: false,
    isReviewMode: false,
    handleAnswerChange: () => {},
    handleCheckAnswer: async () => {},
    handleDontKnowAnswer: async () => {},
    handleNextQuestion: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof QuizContainer>;

/** 1. 초기 상태: 정답 확인 버튼 비활성화 검증 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkButton = canvas.getByRole('button', { name: /정답 확인/i });
    await expect(checkButton).toBeDisabled();
  },
};

/** 2. 옵션 선택 상태: 버튼 활성화 검증 */
export const SelectOption: Story = {
  args: {
    selectedAnswers: ['O'],
    isCheckDisabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkButton = canvas.getByRole('button', { name: /정답 확인/i });
    await expect(checkButton).not.toBeDisabled();
  },
};

/** 3. 로딩 상태: '확인 중' 텍스트 검증 */
export const CheckAnswerLoading: Story = {
  args: {
    selectedAnswers: ['O'],
    currentQuestionStatus: 'checking',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ✅ 정규표현식을 사용하여 텍스트 포함 여부 확인
    await expect(canvas.getByText(/확인 중/)).toBeInTheDocument();
  },
};

/** 4. 완료 상태: 해설 노출 검증 */
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 해설 텍스트가 화면에 나타나는지 확인
    await expect(canvas.getByText(/생태계가 큽니다/)).toBeInTheDocument();
  },
};
