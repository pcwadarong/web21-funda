import { ThemeProvider } from '@emotion/react';
import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';

import { initialState, useAuthStore } from '@/store/authStore';
import { darkTheme, lightTheme } from '@/styles/theme';

import '@/styles/main.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },

  globalTypes: {
    authStatus: {
      name: 'Authentication',
      description: '로그인 상태 설정',
      defaultValue: 'logged-out',
      toolbar: {
        icon: 'user',
        items: [
          { value: 'logged-in', title: 'Logged In', left: '👤' },
          { value: 'logged-out', title: 'Logged Out', left: '🚫' },
        ],
        showName: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const background = context.globals.backgrounds?.value;
      const theme = background === 'dark' ? darkTheme : lightTheme;

      const authStatus = context.parameters.authStatus || context.globals.authStatus;
      const targetState = authStatus === 'logged-in';

      useEffect(() => {
        useAuthStore.setState({ isLoggedIn: targetState });
        return () => {
          useAuthStore.setState(initialState);
        };
      }, [targetState]);
      return (
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
