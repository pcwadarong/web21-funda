import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import { lightTheme } from '@/styles/theme';

const mockResultData = {
  xpGained: 50,
  successRate: 70,
  durationMs: '1:40',
};

const meta: Meta<typeof QuizResultContent> = {
  title: 'Features/Quiz/QuizResultContent',
  component: QuizResultContent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <div style={{ backgroundColor: lightTheme.colors.surface.default, minHeight: '100vh' }}>
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
  args: {
    resultData: mockResultData,
    isLogin: false,
    isFirstToday: false,
  },
};

export default meta;
type Story = StoryObj<typeof QuizResultContent>;

/**
 * [Default/Docs]
 * 기본 퀴즈 결과 화면입니다.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. 제목이 표시되는지 확인
    await expect(canvas.getByText('LESSON COMPLETE!')).toBeInTheDocument();

    // 2. 메트릭 카드들이 표시되는지 확인
    await expect(canvas.getByText('획득 XP')).toBeInTheDocument();
    await expect(canvas.getByText('성공률')).toBeInTheDocument();
    await expect(canvas.getByText('소요 시간')).toBeInTheDocument();

    // 3. 결과 데이터가 올바르게 표시되는지 확인
    await expect(canvas.getByText('50')).toBeInTheDocument();
    await expect(canvas.getByText('70%')).toBeInTheDocument();
    await expect(canvas.getByText('1:40')).toBeInTheDocument();

    // 4. 버튼들이 표시되는지 확인
    await expect(canvas.getByText('학습 계속하기')).toBeInTheDocument();
    await expect(canvas.getByText('메인 페이지로 이동하기')).toBeInTheDocument();

    // 5. 데이터가 모두 있으므로 안내문구가 표시되지 않는지 확인
    const noticeText = canvas.queryByText(
      '결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.',
    );
    await expect(noticeText).not.toBeInTheDocument();
  },
};

/**
 * [High Score]
 * 높은 점수를 받은 경우입니다.
 */
export const HighScore: Story = {
  args: {
    resultData: {
      xpGained: 100,
      successRate: 95,
      durationMs: '0:45',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 높은 점수 데이터가 올바르게 표시되는지 확인
    await expect(canvas.getByText('100')).toBeInTheDocument();
    await expect(canvas.getByText('95%')).toBeInTheDocument();
    await expect(canvas.getByText('0:45')).toBeInTheDocument();
  },
};

/**
 * [Missing Data]
 * 모든 데이터가 누락된 경우입니다. 안내문구가 표시됩니다.
 */
export const MissingData: Story = {
  args: {
    resultData: {
      xpGained: null,
      successRate: null,
      durationMs: '-',
    },
    isLogin: true,
    isFirstToday: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. 안내문구가 표시되는지 확인
    await expect(
      canvas.getByText('결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.'),
    ).toBeInTheDocument();

    // 2. 메트릭 카드들이 표시되는지 확인
    await expect(canvas.getByText('획득 XP')).toBeInTheDocument();
    await expect(canvas.getByText('성공률')).toBeInTheDocument();
    await expect(canvas.getByText('소요 시간')).toBeInTheDocument();

    // 3. 모든 메트릭 카드에서 데이터가 '-'로 표시되는지 확인
    // (xpGained, successRate가 null이고 durationMs가 '-'이므로 3개 모두 '-' 표시)
    const dashValues = canvas.getAllByText('-');
    await expect(dashValues.length).toBe(3); // 3개 모두 '-' 표시
  },
};

/**
 * [Partial Missing Data]
 * 일부 데이터만 누락된 경우입니다. 안내문구가 표시됩니다.
 */
export const PartialMissingData: Story = {
  args: {
    resultData: {
      xpGained: 50,
      successRate: null,
      durationMs: '1:30',
    },
    isLogin: true,
    isFirstToday: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. 일부 데이터는 표시되고 일부는 '-'로 표시되는지 확인
    await expect(canvas.getByText('50')).toBeInTheDocument();
    await expect(canvas.getByText('1:30')).toBeInTheDocument();

    // 2. 안내문구가 표시되는지 확인
    await expect(
      canvas.getByText('결과 데이터를 불러오지 못했어요. 기록은 정상 저장되었어요.'),
    ).toBeInTheDocument();
  },
};
