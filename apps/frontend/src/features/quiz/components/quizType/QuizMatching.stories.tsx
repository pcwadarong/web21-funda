import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { QuizMatching } from '@/feat/quiz/components/quizType/QuizMatching';
import type { MatchingContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: MatchingContent = {
  question: '선택자와 의미를 올바르게 연결하세요.',
  matching_metadata: {
    left: ['div p', 'div > p', 'h1 + p', 'h1 ~ p'],
    right: ['div의 모든 자손 p', 'div의 직계 자식 p', 'h1 바로 다음 p', 'h1 뒤의 모든 형제 p'],
  },
};

const meta: Meta<typeof QuizMatching> = {
  title: 'Features/Quiz/QuizMatching',
  component: QuizMatching,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '매칭 퀴즈 컴포넌트입니다. 좌측과 우측 항목을 선택하여 올바른 쌍을 만듭니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: '700px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizMatching>;

export const Default: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const WithPairs: Story = {
  args: {
    content: mockContent,
    selectedAnswer: {
      pairs: [
        { left: 'div p', right: 'div의 모든 자손 p' },
        { left: 'div > p', right: 'div의 직계 자식 p' },
      ],
    },
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
};

export const ShowResult: Story = {
  args: {
    content: mockContent,
    selectedAnswer: {
      pairs: [
        { left: 'div p', right: 'div의 모든 자손 p' },
        { left: 'div > p', right: 'div의 직계 자식 p' },
        { left: 'h1 + p', right: 'h1 바로 다음 p' },
        { left: 'h1 ~ p', right: 'h1 뒤의 모든 형제 p' },
      ],
    },
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
    const leftOption = canvas.getByText('div p');
    const rightOption = canvas.getByText('div의 모든 자손 p');

    await userEvent.click(leftOption);
    await userEvent.click(rightOption);

    await expect(args.onAnswerChange).toHaveBeenCalled();
  },
};
