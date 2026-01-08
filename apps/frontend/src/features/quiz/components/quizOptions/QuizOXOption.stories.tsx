import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { QuizOXOption } from '@/feat/quiz/components/quizOptions/QuizOXOption';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof QuizOXOption> = {
  title: 'Features/Quiz/QuizOXOption',
  component: QuizOXOption,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'OX 퀴즈의 선택지 옵션 컴포넌트입니다. O 또는 X를 선택할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizOXOption>;

export const Default: Story = {
  args: {
    option: 'O',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Selected: Story = {
  args: {
    option: 'O',
    isSelected: true,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Correct: Story = {
  args: {
    option: 'O',
    isSelected: true,
    isCorrect: true,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Wrong: Story = {
  args: {
    option: 'X',
    isSelected: true,
    isCorrect: false,
    isWrong: true,
    onClick: () => {},
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    option: 'O',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    option: 'O',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    disabled: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByText('O');

    await userEvent.click(option);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
