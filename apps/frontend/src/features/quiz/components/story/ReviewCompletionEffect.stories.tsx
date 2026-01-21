import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

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
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReviewCompletionEffect>;

export const Default: Story = {
  render: () => {
    const [key, setKey] = useState(0);

    return (
      <div>
        <button
          onClick={() => setKey(prev => prev + 1)}
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
        <ReviewCompletionEffect key={key} />
      </div>
    );
  },
};
