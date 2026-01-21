import { css, ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, JSX, ReactNode } from 'react';

import { Loading } from '@/components/Loading';
import { ThemeStoreProvider, useThemeStore } from '@/store/themeStore';
import { darkTheme, lightTheme } from '@/styles/theme';

type LoadingProps = ComponentProps<typeof Loading>;

const ThemeBridge = ({ children }: { children: ReactNode }) => {
  const { isDarkMode } = useThemeStore();
  return <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>{children}</ThemeProvider>;
};

const withTheme =
  (mode: 'light' | 'dark') => (Story: () => JSX.Element, context: { viewMode?: string }) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', mode);
    }

    const isDocs = context.viewMode === 'docs';

    return (
      <ThemeStoreProvider key={mode}>
        <ThemeBridge>
          <div
            css={css`
              width: 100%;
              max-height: ${isDocs ? '500px' : 'none'};
              overflow-x: hidden;
              overflow-y: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Story />
          </div>
        </ThemeBridge>
      </ThemeStoreProvider>
    );
  };

const meta: Meta<LoadingProps> = {
  title: 'Components/Loading',
  component: Loading,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [withTheme('light')],
  argTypes: {
    text: {
      control: { type: 'text' },
    },
  },
  args: {
    text: 'Loading',
  },
};

export default meta;
type Story = StoryObj<LoadingProps>;

export const Light: Story = {};

export const Dark: Story = {
  decorators: [withTheme('dark')],
};
