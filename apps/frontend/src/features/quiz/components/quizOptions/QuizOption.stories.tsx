import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { QuizOption } from '@/feat/quiz/components/quizOptions/QuizOption';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof QuizOption> = {
  title: 'Features/Quiz/QuizOption',
  component: QuizOption,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '객관식 퀴즈의 선택지 옵션 컴포넌트입니다. 선택, 정답, 오답 상태를 표시합니다.',
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
type Story = StoryObj<typeof QuizOption>;

export const Default: Story = {
  args: {
    label: 'A',
    option: '첫 번째 선택지',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Selected: Story = {
  args: {
    label: 'B',
    option: '선택된 옵션',
    isSelected: true,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Correct: Story = {
  args: {
    label: 'C',
    option: '정답인 옵션',
    isSelected: true,
    isCorrect: true,
    isWrong: false,
    onClick: () => {},
    disabled: false,
  },
};

export const Wrong: Story = {
  args: {
    label: 'D',
    option: '오답인 옵션',
    isSelected: true,
    isCorrect: false,
    isWrong: true,
    onClick: () => {},
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    label: 'E',
    option: '비활성화된 옵션',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    onClick: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    label: 'A',
    option: '클릭해보세요',
    isSelected: false,
    isCorrect: false,
    isWrong: false,
    disabled: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByText('클릭해보세요');

    await userEvent.click(option);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
