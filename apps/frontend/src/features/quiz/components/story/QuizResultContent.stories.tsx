import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import { lightTheme } from '@/styles/theme';

const mockResultData = {
  xp: 50,
  successRate: 70,
  timeTaken: '1:40',
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

export const Default: Story = {};

export const LoggedIn: Story = {
  args: {
    isLogin: true,
  },
};

export const FirstToday: Story = {
  args: {
    isLogin: true,
    isFirstToday: true,
  },
};

export const HighScore: Story = {
  args: {
    resultData: {
      xp: 100,
      successRate: 95,
      timeTaken: '0:45',
    },
  },
};
