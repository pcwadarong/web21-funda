import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ReviewCompletionEffect } from '@/feat/quiz/components/ReviewCompletionEffect';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof ReviewCompletionEffect> = {
  title: 'Features/Quiz/ReviewCompletionEffect',
  component: ReviewCompletionEffect,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReviewCompletionEffect>;

export const Default: Story = {};
