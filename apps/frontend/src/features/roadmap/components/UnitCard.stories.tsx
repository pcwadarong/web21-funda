import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { UnitCard } from '@/feat/roadmap/components/UnitCard';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { lightTheme } from '@/styles/theme';

type UnitCardProps = {
  unit: RoadmapUnit;
  isLoggedIn: boolean;
};

const baseUnit: RoadmapUnit = {
  id: 1,
  title: 'HTML & CSS 기초',
  description: '웹의 기본 구조와 스타일링',
  progress: 75,
  score: 88,
  status: 'active',
  variant: 'full',
};

const meta: Meta<UnitCardProps> = {
  title: 'Roadmap/UnitCard',
  component: UnitCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div
          style={{
            background: lightTheme.colors.surface.default,
            padding: 24,
            minWidth: 320,
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    unit: baseUnit,
    isLoggedIn: true,
  },
};

export default meta;
type Story = StoryObj<UnitCardProps>;

export const Active: Story = {
  args: {
    unit: baseUnit,
  },
};

export const Completed: Story = {
  args: {
    unit: {
      ...baseUnit,
      status: 'completed',
      progress: 100,
      score: 92,
    },
  },
};

export const LoggedOut: Story = {
  args: {
    unit: {
      ...baseUnit,
      status: 'completed',
      progress: 100,
      score: 92,
    },
    isLoggedIn: false,
  },
};
