import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { PointEffect } from '@/feat/quiz/components/PointEffect';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof PointEffect> = {
  title: 'Features/Quiz/PointEffect',
  component: PointEffect,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '퀴즈 페이지에서 결과 페이지로 넘어가기 전 나타나는 효과 화면입니다.',
      },
    },
  },
  tags: ['autodocs'],
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

export const Default: StoryObj<typeof PointEffect> = {
  argTypes: {
    points: {
      control: { type: 'range', min: 0, max: 10000, step: 10 },
      description: '획득한 포인트 점수입니다.',
    },
  },
  render: args => {
    // 애니메이션을 다시 보기 위한 새로고침용 상태
    const [key, setKey] = useState(0);

    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setKey(prev => prev + 1)}
          style={{
            position: 'absolute',
            bottom: '40px', // 버튼을 아래로 내려서 연출을 가리지 않게 함
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
        <PointEffect key={key} {...args} />
      </div>
    );
  },
  args: {
    points: 1250,
  },
};
