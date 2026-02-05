import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { action } from 'storybook/actions';

import { BattleResultContainer } from '@/feat/battle/components/result/BattleResultContainer';
import type { BattleParticipant, BattleReward, Ranking } from '@/feat/battle/types';
import { useSound } from '@/hooks/useSound';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

const participants: BattleParticipant[] = [
  {
    participantId: 'p1',
    userId: 101,
    displayName: 'Alex',
    score: 120,
    scoreDelta: 10,
    avatar: undefined,
    isHost: true,
    isConnected: true,
    joinedAt: Date.now() - 1000 * 60 * 3,
    leftAt: null,
  },
  {
    participantId: 'p2',
    userId: 102,
    displayName: 'Bo',
    score: 110,
    scoreDelta: -10,
    avatar: undefined,
    isHost: false,
    isConnected: true,
    joinedAt: Date.now() - 1000 * 60 * 3,
    leftAt: null,
  },
  {
    participantId: 'p3',
    userId: 103,
    displayName: 'Casey',
    score: 90,
    scoreDelta: 10,
    avatar: undefined,
    isHost: false,
    isConnected: true,
    joinedAt: Date.now() - 1000 * 60 * 3,
    leftAt: null,
  },
  {
    participantId: 'p4',
    userId: 104,
    displayName: 'Dana',
    score: 70,
    scoreDelta: -10,
    avatar: undefined,
    isHost: false,
    isConnected: true,
    joinedAt: Date.now() - 1000 * 60 * 3,
    leftAt: null,
  },
];

const rankings: Ranking[] = participants.map(({ participantId, displayName, score }) => ({
  participantId,
  displayName,
  score,
}));

const rewards: BattleReward[] = [
  { participantId: 'p1', rewardType: 'diamond', amount: 3 },
  { participantId: 'p2', rewardType: 'diamond', amount: 2 },
  { participantId: 'p3', rewardType: 'diamond', amount: 1 },
];

const meta: Meta<typeof BattleResultContainer> = {
  title: 'Features/Battle/BattleResultContainer',
  component: BattleResultContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '배틀 결과 화면 컨테이너 컴포넌트입니다. 시상대와 순위 리스트를 표시합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeStoreProvider>
        <ThemeProvider theme={lightTheme}>
          <Story />
        </ThemeProvider>
      </ThemeStoreProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BattleResultContainer>;

export const Default: Story = {
  args: {
    rankings,
    participants,
    rewards,
    timeLeft: 15,
    onRestart: action('restart'),
    onLeave: action('leave'),
  },
  render: args => {
    const [key, setKey] = useState(0);
    const { resumeAudioContext } = useSound();

    const handleReplay = async () => {
      await resumeAudioContext();
      setKey(prev => prev + 1);
    };

    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleReplay}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            padding: '10px 20px',
            cursor: 'pointer',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#7659EA',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          다시 재생 (Replay)
        </button>
        <BattleResultContainer key={key} {...args} />
      </div>
    );
  },
};
