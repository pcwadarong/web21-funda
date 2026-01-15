import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { RoadmapContainer } from '@/feat/roadmap/components/RoadmapContainer';
import type { RoadmapUnit } from '@/feat/roadmap/types';
import { lightTheme } from '@/styles/theme';

const mockUnits: RoadmapUnit[] = [
  {
    id: 1,
    title: 'HTML & CSS 기초',
    description: '웹의 기본 구조와 스타일링',
    progress: 100,
    successRate: 92,
    status: 'completed',
    variant: 'full',
  },
  {
    id: 2,
    title: 'JavaScript 기초',
    description: '프로그래밍의 기본 개념',
    progress: 100,
    successRate: 88,
    status: 'completed',
    variant: 'full',
  },
  {
    id: 3,
    title: '자료구조와 알고리즘',
    description: '컴퓨터 과학의 기초를 마스터하세요',
    progress: 45,
    successRate: 85,
    status: 'active',
    variant: 'full',
  },
  {
    id: 4,
    title: 'DOM 조작',
    description: '웹 페이지를 동적으로 제어하기',
    progress: 0,
    successRate: 0,
    status: 'normal',
    variant: 'compact',
  },
];

const meta: Meta<typeof RoadmapContainer> = {
  title: 'Features/Roadmap/RoadmapContainer',
  component: RoadmapContainer,
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
    fieldName: '프론트엔드',
    units: mockUnits,
    isLoggedIn: false,
    onUnitClick: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof RoadmapContainer>;

export const Default: Story = {};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
  },
};
