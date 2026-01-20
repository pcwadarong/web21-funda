import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { lightTheme } from '@/styles/theme';

import { AppearanceSection } from '../AppearanceSection';

const meta: Meta<typeof AppearanceSection> = {
  title: 'Features/User/Setting/AppearanceSection',
  component: AppearanceSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '화면 설정 컴포넌트입니다. 다크 모드 등의 설정을 제공합니다.',
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
    onDarkModeToggle: () => {},
    isDarkMode: false,
  },
};

export default meta;
type Story = StoryObj<typeof AppearanceSection>;

export const Default: Story = {
  args: {
    isDarkMode: false,
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('효과음')).toBeInTheDocument();
    await expect(canvas.getByText('효과음')).toBeInTheDocument();
  },
};
