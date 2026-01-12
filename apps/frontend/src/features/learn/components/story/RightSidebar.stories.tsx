import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';

import { LearnRightSidebar } from '@/feat/learn/components/RightSidebar';
import { ModalProvider } from '@/store/modalStore';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof LearnRightSidebar> = {
  title: 'Features/Learn/RightSidebar',
  component: LearnRightSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '학습 페이지의 오른쪽 사이드바입니다. 상단 툴바의 Authentication 설정에 따라 로그인/비로그인 UI가 전환됩니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <ModalProvider>
          <MemoryRouter>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: lightTheme.colors.surface.default,
                minHeight: '100vh',
                padding: '24px',
              }}
            >
              <Story />
            </div>
          </MemoryRouter>
        </ModalProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LearnRightSidebar>;

/**
 * [Default/Docs]
 * 상단 툴바(Globals)의 Authentication 설정에 따라 동적으로 변합니다.
 */
export const Default: Story = {
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const isLoggedIn = globals.authStatus === 'logged-in';

    if (isLoggedIn) {
      await expect(canvas.getByText(/5개 문제 복습 필요/)).toBeInTheDocument();
    } else {
      await expect(canvas.getByText(/로그인 후 문제를 복습해보세요/)).toBeInTheDocument();
    }
  },
};

/**
 * [Logged In 고정]
 * 툴바 설정과 관계없이 항상 로그인된 상태를 보여줍니다.
 */
export const LoggedIn: Story = {
  parameters: {
    authStatus: 'logged-in', // preview.tsx의 데코레이터에서 이 값을 읽어 상태를 강제합니다.
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 3. 로그인 유도 문구가 사라졌는지 확인
    const loginPrompts = canvas.queryAllByText(/로그인 후/);
    await expect(loginPrompts.length).toBe(0);
  },
};

/**
 * [Logged Out 고정]
 * 툴바 설정과 관계없이 항상 로그아웃된 상태를 보여줍니다.
 */
export const LoggedOut: Story = {
  parameters: {
    authStatus: 'logged-out',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 2. 오답 노트 로그인 유도 확인
    await expect(canvas.getByText(/로그인 후 문제를 복습해보세요/)).toBeInTheDocument();

    // 3. 오늘의 목표 로그인 유도 확인
    await expect(canvas.getByText(/로그인 후 진도를 저장해보세요/)).toBeInTheDocument();

    // 4. 진행바(progressbar)가 렌더링되지 않았는지 확인
    const progressBars = canvas.queryAllByRole('progressbar');
    await expect(progressBars.length).toBe(0);
  },
};
