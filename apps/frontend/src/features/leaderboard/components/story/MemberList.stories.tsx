import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { MemberList } from '@/feat/leaderboard/components/MemberList';
import type { RankingMember } from '@/feat/leaderboard/types';
import { lightTheme } from '@/styles/theme';

const mockMembers: RankingMember[] = [
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
    isMe: true,
    rankZone: 'PROMOTION',
  },
  {
    rank: 3,
    userId: 3,
    displayName: '박프로그래밍',
    profileImageUrl: null,
    xp: 1100,
    isMe: false,
    rankZone: 'MAINTAIN',
  },
  {
    rank: 4,
    userId: 4,
    displayName: '최알고리즘',
    profileImageUrl: null,
    xp: 1050,
    isMe: false,
    rankZone: 'DEMOTION',
  },
  {
    rank: 5,
    userId: 5,
    displayName: '정자료구조',
    profileImageUrl: null,
    xp: 980,
    isMe: false,
    rankZone: 'DEMOTION',
  },
];

const meta: Meta<typeof MemberList> = {
  title: 'Features/Leaderboard/MemberList',
  component: MemberList,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '랭킹 멤버 목록을 표시하는 컴포넌트입니다. 빈 배열일 경우 빈 상태 메시지를 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div
          style={{
            backgroundColor: lightTheme.colors.surface.strong,
            padding: '24px',
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    members: mockMembers,
  },
};

export default meta;
type Story = StoryObj<typeof MemberList>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    members: [],
  },
};

export const SingleMember: Story = {
  args: {
    members: [mockMembers[0]!],
  },
};

export const WithProfileImages: Story = {
  args: {
    members: mockMembers.map((member, index) => ({
      ...member,
      profileImageUrl: `https://i.pravatar.cc/150?img=${index + 1}`,
    })),
  },
};
