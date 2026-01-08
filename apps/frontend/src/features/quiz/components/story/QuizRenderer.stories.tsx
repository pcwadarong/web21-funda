import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect } from 'vitest';

import { QuizRenderer } from '@/feat/quiz/components/QuizRenderer';
import type { AnswerType, QuizQuestion } from '@/feat/quiz/types';
import { lightTheme } from '@/styles/theme';

const StatefulRenderer = ({ question }: { question: QuizQuestion }) => {
  const [selected, setSelected] = useState<AnswerType | null>(null);
  const selectedText =
    selected === null ? 'none' : typeof selected === 'string' ? selected : JSON.stringify(selected);

  return (
    <div>
      <div data-testid="selected">{selectedText}</div>
      <QuizRenderer
        question={question}
        selectedAnswer={selected}
        onAnswerChange={setSelected}
        showResult={false}
        disabled={false}
      />
    </div>
  );
};

const meta: Meta<typeof StatefulRenderer> = {
  title: 'Features/Quiz/QuizRenderer',
  component: StatefulRenderer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '퀴즈 타입(type)에 따라 적절한 퀴즈 컴포넌트를 선택하여 렌더링하는 라우터(매핑) 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ width: '720px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatefulRenderer>;

export const MCQ: Story = {
  args: {
    question: {
      id: 1,
      type: 'mcq',
      content: {
        question: '테스트 문제(MCQ)',
        options: [
          { id: 'c1', text: '첫 번째 선택지' },
          { id: 'c2', text: '두 번째 선택지' },
          { id: 'c3', text: '세 번째 선택지' },
          { id: 'c4', text: '네 번째 선택지' },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('첫 번째 선택지'));
    await expect(canvas.getByTestId('selected')).not.toHaveTextContent('none');
  },
};

export const OX: Story = {
  args: {
    question: {
      id: 1,
      type: 'ox',
      content: {
        question: '테스트 문제(OX)',
        options: [
          { id: 'o', text: 'O' },
          { id: 'x', text: 'X' },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('O'));
    await expect(canvas.getByTestId('selected')).not.toHaveTextContent('none');
  },
};

export const Code: Story = {
  args: {
    question: {
      id: 1,
      type: 'code',
      content: {
        question: '테스트 문제(Code)',
        options: [
          { id: 'c1', text: '[data-state="open"]' },
          { id: 'c2', text: '[data-state^="open"]' },
        ],
        code_metadata: {
          language: 'css',
          snippet: '{{BLANK}} {\n  opacity: 1;\n}',
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('[data-state="open"]'));
    await expect(canvas.getByTestId('selected')).not.toHaveTextContent('none');
  },
};

export const Matching: Story = {
  args: {
    question: {
      id: 1,
      type: 'matching',
      content: {
        question: '테스트 문제(Matching)',
        matching_metadata: {
          left: ['div p'],
          right: ['div의 모든 자손 p'],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('div p'));
    await userEvent.click(canvas.getByText('div의 모든 자손 p'));
    await expect(canvas.getByTestId('selected')).not.toHaveTextContent('none');
  },
};
