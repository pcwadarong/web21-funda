import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { LeaderboardStateMessage } from '@/feat/leaderboard/components/LeaderboardStateMessage';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof LeaderboardStateMessage> = {
  title: 'Features/Leaderboard/LeaderboardStateMessage',
  component: LeaderboardStateMessage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '에러, 빈 상태, 미할당 상태를 표시하는 컴포넌트입니다. 미할당 상태일 경우 스켈레톤 UI를 함께 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div
          style={{
            background: 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)',
            minHeight: '400px',
            padding: '24px',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    state: 'error',
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardStateMessage>;

export const ErrorState: Story = {
  args: {
    state: 'error',
  },
};

export const ErrorWithCustomMessage: Story = {
  args: {
    state: 'error',
    message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
};

export const ServerError: Story = {
  args: {
    state: 'error',
    message: '서버 오류가 발생했습니다. 관리자에게 문의해주세요.',
  },
};

export const Empty: Story = {
  args: {
    state: 'empty',
  },
};

export const Unassigned: Story = {
  args: {
    state: 'unassigned',
  },
};
