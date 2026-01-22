import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useEffect } from 'react';
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
            <FetchMockProvider>
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
            </FetchMockProvider>
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
      await expect(await canvas.findByText('복습 시작')).toBeInTheDocument();
    } else {
      await expect(canvas.getByText(/로그인 후 복습 노트를 확인해보세요/)).toBeInTheDocument();
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
    // 2. 복습 노트 로그인 유도 확인
    await expect(canvas.getByText(/로그인 후 복습 노트를 확인해보세요/)).toBeInTheDocument();

    // 3. 오늘의 목표 로그인 유도 확인
    await expect(canvas.getByText(/로그인 후 진도를 저장해보세요/)).toBeInTheDocument();

    // 4. 진행바(progressbar)가 렌더링되지 않았는지 확인
    const progressBars = canvas.queryAllByRole('progressbar');
    await expect(progressBars.length).toBe(0);
  },
};

export const FieldDropdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('option', { name: '프론트엔드' })).toBeInTheDocument();
    await expect(canvas.getByRole('option', { name: '백엔드' })).toBeInTheDocument();
  },
};

const FetchMockProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url =
        typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
      if (url.endsWith('/api/fields')) {
        return new Response(
          JSON.stringify({
            success: true,
            code: 200,
            message: 'ok',
            result: {
              fields: [
                {
                  slug: 'frontend',
                  name: '프론트엔드',
                  description: '사용자 인터페이스와 웹 프론트엔드 개발',
                  icon: 'Frontend',
                },
                {
                  slug: 'backend',
                  name: '백엔드',
                  description: '서버와 데이터베이스, API 개발',
                  icon: 'Backend',
                },
              ],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (url.includes('/api/progress/reviews')) {
        return new Response(
          JSON.stringify({
            success: true,
            code: 200,
            message: 'ok',
            result: [
              {
                id: 1,
                type: 'mcq',
                content: {
                  question: '복습 문제 1',
                  options: [
                    { id: 'c1', text: '선택지 1' },
                    { id: 'c2', text: '선택지 2' },
                  ],
                },
              },
              {
                id: 2,
                type: 'ox',
                content: {
                  question: '복습 문제 2',
                  options: [
                    { id: 'o', text: 'O' },
                    { id: 'x', text: 'X' },
                  ],
                },
              },
              {
                id: 3,
                type: 'matching',
                content: {
                  question: '복습 문제 3',
                  matching_metadata: {
                    left: [
                      { id: 'l1', text: '왼쪽 1' },
                      { id: 'l2', text: '왼쪽 2' },
                    ],
                    right: [
                      { id: 'r1', text: '오른쪽 1' },
                      { id: 'r2', text: '오른쪽 2' },
                    ],
                  },
                },
              },
              {
                id: 4,
                type: 'code',
                content: {
                  question: '복습 문제 4',
                  options: [
                    { id: 'c1', text: '선택지 1' },
                    { id: 'c2', text: '선택지 2' },
                  ],
                  code_metadata: {
                    language: 'javascript',
                    snippet: 'const value = 1;',
                  },
                },
              },
              {
                id: 5,
                type: 'mcq',
                content: {
                  question: '복습 문제 5',
                  options: [
                    { id: 'c1', text: '선택지 1' },
                    { id: 'c2', text: '선택지 2' },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
};
