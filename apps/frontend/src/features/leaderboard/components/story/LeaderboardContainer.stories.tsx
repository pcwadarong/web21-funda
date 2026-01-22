import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { LeaderboardContainer } from '@/feat/leaderboard/components/LeaderboardContainer';
import type { WeeklyRankingResult } from '@/feat/leaderboard/types';
import { lightTheme } from '@/styles/theme';

const mockWeeklyRanking: WeeklyRankingResult = {
  weekKey: '2025-01',
  tier: {
    id: 1,
    name: '브론즈',
    orderIndex: 1,
  },
  groupIndex: 1,
  totalMembers: 25,
  myRank: 5,
  myWeeklyXp: 850,
  members: [
    {
      rank: 1,
      userId: 1,
      displayName: '김개발',
      profileImageUrl: null,
      xp: 1250,
      isMe: false,
      rankZone: 'PROMOTION',
    },
    {
      rank: 2,
      userId: 2,
      displayName: '이코딩',
      profileImageUrl: null,
      xp: 1180,
      isMe: false,
      rankZone: 'PROMOTION',
    },
    {
      rank: 3,
      userId: 3,
      displayName: '박프로그래밍',
      profileImageUrl: null,
      xp: 1100,
      isMe: false,
      rankZone: 'PROMOTION',
    },
    {
      rank: 4,
      userId: 4,
      displayName: '최알고리즘',
      profileImageUrl: null,
      xp: 1050,
      isMe: false,
      rankZone: 'MAINTAIN',
    },
    {
      rank: 5,
      userId: 5,
      displayName: '정자료구조',
      profileImageUrl: null,
      xp: 980,
      isMe: true,
      rankZone: 'MAINTAIN',
    },
    {
      rank: 6,
      userId: 6,
      displayName: '강데이터',
      profileImageUrl: null,
      xp: 920,
      isMe: false,
      rankZone: 'MAINTAIN',
    },
    {
      rank: 7,
      userId: 7,
      displayName: '윤네트워크',
      profileImageUrl: null,
      xp: 850,
      isMe: false,
      rankZone: 'MAINTAIN',
    },
    {
      rank: 8,
      userId: 8,
      displayName: '임보안',
      profileImageUrl: null,
      xp: 780,
      isMe: false,
      rankZone: 'DEMOTION',
    },
    {
      rank: 9,
      userId: 9,
      displayName: '한클라우드',
      profileImageUrl: null,
      xp: 720,
      isMe: false,
      rankZone: 'DEMOTION',
    },
    {
      rank: 10,
      userId: 10,
      displayName: '서데브옵스',
      profileImageUrl: null,
      xp: 650,
      isMe: false,
      rankZone: 'DEMOTION',
    },
  ],
};

const meta: Meta<typeof LeaderboardContainer> = {
  title: 'Features/Leaderboard/LeaderboardContainer',
  component: LeaderboardContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '리더보드 메인 컨테이너 컴포넌트입니다. 로딩, 에러, 빈 상태, 미할당 상태, 정상 상태를 모두 처리합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div
          style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)' }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    weeklyRanking: mockWeeklyRanking,
    isLoading: false,
    errorMessage: null,
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardContainer>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    weeklyRanking: null,
    isLoading: true,
    errorMessage: null,
  },
};

export const Error: Story = {
  args: {
    weeklyRanking: null,
    isLoading: false,
    errorMessage: '랭킹 정보를 불러오지 못했습니다.',
  },
};

export const Empty: Story = {
  args: {
    weeklyRanking: null,
    isLoading: false,
    errorMessage: null,
  },
};

export const Unassigned: Story = {
  args: {
    weeklyRanking: {
      ...mockWeeklyRanking,
      groupIndex: null,
    },
    isLoading: false,
    errorMessage: null,
  },
};

export const WithManyMembers: Story = {
  args: {
    weeklyRanking: {
      ...mockWeeklyRanking,
      totalMembers: 100,
      members: Array.from({ length: 30 }, (_, i) => ({
        rank: i + 1,
        userId: i + 1,
        displayName: `사용자${i + 1}`,
        profileImageUrl: null,
        xp: 1500 - i * 20,
        isMe: i === 14,
        rankZone: i < 10 ? 'PROMOTION' : i < 20 ? 'MAINTAIN' : 'DEMOTION',
      })),
    },
    isLoading: false,
    errorMessage: null,
  },
};
