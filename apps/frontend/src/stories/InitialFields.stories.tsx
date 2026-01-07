import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { InitialFields } from '@/pages/InitialFields';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof InitialFields> = {
  title: 'Pages/InitialFields',
  component: InitialFields,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '비로그인 사용자가 퀴즈를 시작하기 전, 학습 분야를 최초 1회 선택하는 페이지입니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <div style={{ backgroundColor: lightTheme.colors.surface.default }}>
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InitialFields>;

// 인터랙션 테스트 (자동 클릭 시뮬레이션)
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // '프론트엔드' 필드 찾기 및 클릭
    const frontendField = canvas.getByText('프론트엔드');
    await userEvent.click(frontendField);

    // 버튼 활성화 여부 확인 (비활성 속성이 사라졌는지 확인)
    const startButton = canvas.getByRole('button', { name: /선택 완료하고 시작하기/i });
    await expect(startButton).not.toBeDisabled();

    // 완료 버튼 클릭
    await userEvent.click(startButton);
  },
};
