import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { QuizCode } from '@/feat/quiz/components/quizType/QuizCode';
import type { CodeContent } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const mockContent: CodeContent = {
  question: 'data-state가 "open"인 요소만 선택하려고 합니다. 빈칸에 들어갈 선택자를 고르세요.',
  options: [
    { id: 'c1', text: '[data-state="open"]' },
    { id: 'c2', text: '[data-state^="open"]' },
    { id: 'c3', text: '[data-state*="open"]' },
    { id: 'c4', text: '[data-state$="open"]' },
  ],
  code_metadata: {
    language: 'css',
    snippet: '{{BLANK}} {\n  opacity: 1;\n}',
  },
};

const meta: Meta<typeof QuizCode> = {
  title: 'Features/Quiz/QuizCode',
  component: QuizCode,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '코드 퀴즈 컴포넌트입니다. 코드 스니펫과 함께 선택지를 제공합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: '600px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuizCode>;

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
    const option = canvas.getByText('[data-state="open"]');

    await userEvent.click(option);
    await expect(args.onAnswerChange).toHaveBeenCalledWith('c1');
  },
};
