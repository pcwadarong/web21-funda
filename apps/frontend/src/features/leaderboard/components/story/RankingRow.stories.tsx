import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { RankingRow } from '@/feat/leaderboard/components/RankingRow';
import type { RankingMember } from '@/feat/leaderboard/types';
import { lightTheme } from '@/styles/theme';

const mockMember: RankingMember = {
  rank: 1,
  userId: 1,
  displayName: '김개발',
  profileImageUrl: null,
  xp: 1250,
  isMe: false,
  rankZone: 'PROMOTION',
};

const meta: Meta<typeof RankingRow> = {
  title: 'Features/Leaderboard/RankingRow',
  component: RankingRow,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '개별 랭킹 행을 표시하는 컴포넌트입니다. 사용자 본인일 경우 하이라이트됩니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story): ReactElement => (
      <ThemeProvider theme={lightTheme}>
        <div
          style={{
            backgroundColor: lightTheme.colors.surface.default,
            minHeight: '100vh',
            padding: '24px',
          }}
        >
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Story />
          </ol>
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    member: mockMember,
  },
};

export default meta;
type Story = StoryObj<typeof RankingRow>;

export const Default: Story = {};

export const IsMe: Story = {
  args: {
    member: {
      ...mockMember,
      isMe: true,
      rank: 2,
    },
  },
};

export const WithProfileImage: Story = {
  args: {
    member: {
      ...mockMember,
      profileImageUrl: 'https://i.pravatar.cc/150?img=1',
    },
  },
};

export const HighRank: Story = {
  args: {
    member: {
      ...mockMember,
      rank: 1,
      xp: 5000,
      displayName: '최고수',
    },
  },
};

export const LowRank: Story = {
  args: {
    member: {
      ...mockMember,
      rank: 50,
      xp: 100,
      displayName: '초보자',
    },
  },
};

export const LongName: Story = {
  args: {
    member: {
      ...mockMember,
      displayName: '매우긴이름을가진사용자닉네임입니다',
    },
  },
};
