import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { QuizMCQ } from '@/feat/quiz/components/quizType/QuizMCQ';
import type { DefaultContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: DefaultContent = {
  question: '테스트 문제',
  options: [
    { id: 'c1', text: '첫 번째 선택지' },
    { id: 'c2', text: '두 번째 선택지' },
    { id: 'c3', text: '세 번째 선택지' },
    { id: 'c4', text: '네 번째 선택지' },
  ],
};

const meta: Meta<typeof QuizMCQ> = {
  title: 'Features/Quiz/Types/QuizMCQ',
  component: QuizMCQ,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '객관식(Multiple Choice Question) 퀴즈 컴포넌트입니다. 여러 선택지 중 하나를 선택합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: '500px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizMCQ>;

export const Default: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const Selected: Story = {
  args: {
    content: mockContent,
    selectedAnswer: 'c2',
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const ShowResult: Story = {
  args: {
    content: mockContent,
    selectedAnswer: 'c1',
    showResult: true,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    showResult: false,
    disabled: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByText('첫 번째 선택지');

    await userEvent.click(option);
    await expect(args.onAnswerChange).toHaveBeenCalledWith('c1');
  },
};
