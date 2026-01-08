import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect } from 'vitest';

import { Quiz } from '@/pages/Quiz';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof Quiz> = {
  title: 'Pages/Quiz',
  component: Quiz,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '퀴즈 풀이 페이지 컴포넌트입니다. 퀴즈 데이터 로딩, 답변 상태 관리, 정답 확인 및 페이지 이동 로직을 담당합니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <ModalProvider>
          <MemoryRouter initialEntries={['/quiz/1/1']}>
            <div style={{ backgroundColor: lightTheme.colors.surface.default }}>
              <Story />
            </div>
          </MemoryRouter>
        </ModalProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Quiz>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 초기 상태 확인: 정답 확인 버튼이 비활성화되어 있어야 함
    const checkButton = canvas.getByText('정답 확인');
    await expect(checkButton).toBeDisabled();
  },
};

export const SelectOption: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 첫 번째 문제의 옵션 클릭
    const option = canvas.getByText('O');
    await userEvent.click(option);

    // 옵션 선택 후 버튼 활성화 확인
    const checkButton = canvas.getByText('정답 확인');
    await expect(checkButton).not.toBeDisabled();
  },
};

export const CheckAnswer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 옵션 선택
    const option = canvas.getByText('O');
    await userEvent.click(option);

    // 정답 확인 버튼 클릭
    const checkButton = canvas.getByText('정답 확인');
    await userEvent.click(checkButton);

    // 로딩 상태 확인
    await expect(canvas.getByText('정답 확인 중..')).toBeInTheDocument();
  },
};
