import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { QuizOX } from '@/feat/quiz/components/quizType/QuizOX';
import type { DefaultContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: DefaultContent = {
  question: '테스트 문제',
  options: [
    { id: 'o', text: 'O' },
    { id: 'x', text: 'X' },
  ],
};

const meta: Meta<typeof QuizOX> = {
  title: 'Features/Quiz/Types/QuizOX',
  component: QuizOX,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'OX 퀴즈 컴포넌트입니다. O 또는 X 중 하나를 선택합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizOX>;

export const Default: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const SelectedO: Story = {
  args: {
    content: mockContent,
    selectedAnswer: 'o',
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const SelectedX: Story = {
  args: {
    content: mockContent,
    selectedAnswer: 'x',
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const ShowResult: Story = {
  args: {
    content: mockContent,
    selectedAnswer: 'o',
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
    const optionO = canvas.getByText('O');

    await userEvent.click(optionO);
    await expect(args.onAnswerChange).toHaveBeenCalledWith('o');
  },
};
