import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { lightTheme } from '@/styles/theme';

import { SoundSection } from '../SoundSection';

const meta: Meta<typeof SoundSection> = {
  title: 'Features/User/Setting/SoundSection',
  component: SoundSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '사운드 설정 컴포넌트입니다. 효과음 볼륨 조절을 제공합니다.',
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
    onSoundVolumeChange: () => {},
    soundVolume: 1,
  },
};

export default meta;
type Story = StoryObj<typeof SoundSection>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('사운드')).toBeInTheDocument();
    await expect(canvas.getByText('효과음')).toBeInTheDocument();
  },
};
