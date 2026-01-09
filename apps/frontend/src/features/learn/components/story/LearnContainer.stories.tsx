import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { fn } from 'storybook/test';

import { LearnContainer } from '@/feat/learn/components/LearnContainer';
import type { LessonSection } from '@/feat/learn/types';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

const mockUnits: LessonSection[] = [
  {
    id: 1,
    title: 'HTML 기초',
    orderIndex: 1,
    steps: [
      {
        id: 101,
        title: 'HTML 구조 이해',
        orderIndex: 1,
        quizCount: 5,
        isCheckpoint: false,
        isCompleted: true,
        isLocked: false,
      },
      {
        id: 102,
        title: '시맨틱 태그',
        orderIndex: 2,
        quizCount: 4,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 103,
        title: '폼 요소',
        orderIndex: 3,
        quizCount: 4,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 104,
        title: '중간 점검',
        orderIndex: 4,
        quizCount: 6,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      },
      {
        id: 105,
        title: '미디어 태그',
        orderIndex: 5,
        quizCount: 3,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 106,
        title: '접근성 기초',
        orderIndex: 6,
        quizCount: 4,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 107,
        title: '최종 점검',
        orderIndex: 7,
        quizCount: 6,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
  {
    id: 2,
    title: 'CSS 기초',
    orderIndex: 2,
    steps: [
      {
        id: 201,
        title: '선택자 기초',
        orderIndex: 1,
        quizCount: 5,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 202,
        title: '박스 모델',
        orderIndex: 2,
        quizCount: 4,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 203,
        title: '레이아웃 기초',
        orderIndex: 3,
        quizCount: 4,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 204,
        title: '중간 점검',
        orderIndex: 4,
        quizCount: 6,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      },
      {
        id: 205,
        title: '포지셔닝',
        orderIndex: 5,
        quizCount: 5,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 206,
        title: '색상과 타이포',
        orderIndex: 6,
        quizCount: 3,
        isCheckpoint: false,
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 207,
        title: '최종 점검',
        orderIndex: 7,
        quizCount: 6,
        isCheckpoint: true,
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
];

const meta: Meta<typeof LearnContainer> = {
  title: 'Features/Learn/LearnContainer',
  component: LearnContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <ModalProvider>
          <MemoryRouter>
            <div style={{ backgroundColor: lightTheme.colors.surface.default, minHeight: '100vh' }}>
              <Story />
            </div>
          </MemoryRouter>
        </ModalProvider>
      </ThemeProvider>
    ),
  ],
  args: {
    units: mockUnits,
    activeUnit: mockUnits[0],
    scrollContainerRef: { current: null },
    headerRef: { current: null },
    registerUnitRef: () => () => {},
    onStepClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LearnContainer>;

export const Default: Story = {};
