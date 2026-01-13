import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { QuizHeader } from '@/feat/quiz/components/QuizHeader';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof QuizHeader> = {
  title: 'Features/Quiz/QuizHeader',
  component: QuizHeader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={['/quiz/1/1']}>
          <div style={{ backgroundColor: lightTheme.colors.surface.default, minHeight: '100vh' }}>
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
  args: {
    currentStep: 1,
    totalSteps: 10,
    completedSteps: 0,
  },
};

export default meta;
type Story = StoryObj<typeof QuizHeader>;

export const Default: Story = {};

export const HalfProgress: Story = {
  args: {
    currentStep: 5,
    totalSteps: 10,
    completedSteps: 5,
  },
};

export const ExitModalOpen: Story = {
  args: {
    currentStep: 3,
    totalSteps: 10,
    completedSteps: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '✕' }));
    await expect(canvas.getByText('학습 종료')).toBeInTheDocument();
  },
};
