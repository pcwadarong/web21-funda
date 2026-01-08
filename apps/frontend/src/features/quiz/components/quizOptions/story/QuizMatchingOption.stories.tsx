import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { QuizMatchingOption } from '@/feat/quiz/components/quizOptions/QuizMatchingOption';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof QuizMatchingOption> = {
  title: 'Features/Quiz/QuizMatchingOption',
  component: QuizMatchingOption,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '매칭 퀴즈의 선택지 옵션 컴포넌트입니다. 좌우 항목을 연결하는 데 사용됩니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: '300px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizMatchingOption>;

export const Default: Story = {
  args: {
    option: 'div p',
    isSelected: false,
    isMatched: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Selected: Story = {
  args: {
    option: 'div p',
    isSelected: true,
    isMatched: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Matched: Story = {
  args: {
    option: 'div p',
    isSelected: false,
    isMatched: true,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Correct: Story = {
  args: {
    option: 'div p',
    isSelected: false,
    isMatched: true,
    isCorrect: true,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Wrong: Story = {
  args: {
    option: 'div p',
    isSelected: false,
    isMatched: true,
    isCorrect: false,
    isWrong: true,
    onClick: () => {},
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    option: 'div p',
    isSelected: false,
    isMatched: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    option: 'div p',
    isSelected: false,
    isMatched: false,
    isCorrect: false,
    isWrong: false,
    disabled: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByText('div p');

    await userEvent.click(option);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
