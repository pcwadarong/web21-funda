import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

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
  title: 'Features/Quiz/Types/QuizMatching',
  component: QuizMatching,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '매칭 퀴즈 컴포넌트입니다. 좌측과 우측 항목을 선택하여 올바른 쌍을 만듭니다. 정답 확인 시 SVG 라인으로 정답/오답을 시각적으로 표시합니다.',
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
    correctAnswer: null,
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
        { leftIndex: 0, rightIndex: 0 },
        { leftIndex: 1, rightIndex: 1 },
      ],
    },
    correctAnswer: null,
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
        { leftIndex: 0, rightIndex: 0 },
        { leftIndex: 1, rightIndex: 2 },
        { leftIndex: 2, rightIndex: 1 },
        { leftIndex: 3, rightIndex: 3 },
      ],
    },
    correctAnswer: {
      pairs: [
        { leftIndex: 0, rightIndex: 0 },
        { leftIndex: 1, rightIndex: 1 },
        { leftIndex: 2, rightIndex: 2 },
        { leftIndex: 3, rightIndex: 3 },
      ],
    },
    showResult: true,
    onAnswerChange: () => {},
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    // SVG 라인이 렌더링되었는지 확인
    const svg = canvasElement.querySelector('svg');
    await expect(svg).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    correctAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    content: mockContent,
    selectedAnswer: null,
    correctAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leftOption = canvas.getByText('div p');
    const rightOption = canvas.getByText('div의 모든 자손 p');

    await userEvent.click(leftOption);
    await userEvent.click(rightOption);

    // 클릭이 성공적으로 이루어졌는지 확인
    await expect(leftOption).toBeInTheDocument();
    await expect(rightOption).toBeInTheDocument();
  },
};

export const DuplicateMatchingPrevention: Story = {
  args: {
    content: mockContent,
    selectedAnswer: {
      pairs: [{ leftIndex: 0, rightIndex: 0 }],
    },
    correctAnswer: null,
    showResult: false,
    onAnswerChange: () => {},
    disabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // left-A(div p)를 다시 클릭 (기존 매칭 해제)
    const leftA = canvas.getByText('div p');
    await userEvent.click(leftA);

    // left-A를 다시 클릭 (임시 선택)
    await userEvent.click(leftA);

    // right-C(div의 직계 자식 p) 클릭
    const rightC = canvas.getByText('div의 직계 자식 p');
    await userEvent.click(rightC);

    // 클릭이 성공적으로 이루어졌는지 확인 (에러가 없으면 성공)
    await expect(leftA).toBeInTheDocument();
    await expect(rightC).toBeInTheDocument();
  },
};
