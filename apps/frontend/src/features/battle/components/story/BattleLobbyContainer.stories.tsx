import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { BattleLobbyContainer } from '@/feat/battle/components/lobby/BattleLobbyContainer';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider } from '@/store/themeStore';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof BattleLobbyContainer> = {
  title: 'Features/Battle/BattleLobbyContainer',
  component: BattleLobbyContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '배틀 메인 컨테이너 컴포넌트입니다. 설명 모달과 방 생성 버튼을 포함합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeStoreProvider>
        <ThemeProvider theme={lightTheme}>
          <ModalProvider>
            <Story />
          </ModalProvider>
        </ThemeProvider>
      </ThemeStoreProvider>
    ),
  ],
  args: {
    onClick: action('create-room'),
  },
};

export default meta;
type Story = StoryObj<typeof BattleLobbyContainer>;

export const Default: Story = {};
