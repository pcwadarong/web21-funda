import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { lightTheme } from '@/styles/theme';

import { SettingContainer } from '../SettingContainer';

const meta: Meta<typeof SettingContainer> = {
  title: 'Features/user/SettingContainer',
  component: SettingContainer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '설정 컴포넌트입니다. 로그아웃과 다크 모드 토글을 제공합니다.',
      },
    },
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
    onLogout: () => {},
    onDarkModeToggle: () => {},
    isDarkMode: false,
  },
};

export default meta;
type Story = StoryObj<typeof SettingContainer>;

/**
 * [Default/Docs]
 * 기본 설정 컴포넌트입니다.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('로그아웃')).toBeInTheDocument();
    await expect(canvas.getByText('다크 모드')).toBeInTheDocument();
  },
};
