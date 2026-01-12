import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';

import { LoginForm } from '@/feat/auth/components/LoginForm';
import { lightTheme } from '@/styles/theme';

const meta: Meta<typeof LoginForm> = {
  title: 'Features/Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '로그인 폼 컴포넌트입니다. Google과 GitHub로 로그인할 수 있습니다.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <ThemeProvider theme={lightTheme}>
        <div style={{ backgroundColor: lightTheme.colors.surface.default, minHeight: '100vh' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    onGoogleLogin: () => {},
    onGitHubLogin: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 제목 확인
    await expect(canvas.getByText('Funda')).toBeInTheDocument();
    await expect(canvas.getByText('재미있게 배우는 개발 지식')).toBeInTheDocument();

    // 소셜 증명 텍스트 확인
    await expect(canvas.getByText(/10,000\+명의 개발자가/)).toBeInTheDocument();

    // 버튼 확인
    const googleButton = canvas.getByRole('button', { name: /Google로 계속하기/i });
    const githubButton = canvas.getByRole('button', { name: /GitHub로 계속하기/i });

    await expect(googleButton).toBeInTheDocument();
    await expect(githubButton).toBeInTheDocument();
  },
};

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Google 버튼 클릭 테스트
    const googleButton = canvas.getByRole('button', { name: /Google로 계속하기/i });
    await expect(googleButton).toBeInTheDocument();
    await expect(googleButton).not.toBeDisabled();
    await userEvent.click(googleButton);

    // GitHub 버튼 클릭 테스트
    const githubButton = canvas.getByRole('button', { name: /GitHub로 계속하기/i });
    await expect(githubButton).toBeInTheDocument();
    await expect(githubButton).not.toBeDisabled();
    await userEvent.click(githubButton);
  },
};
