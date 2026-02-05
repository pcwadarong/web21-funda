import { css, Global, ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import ErrorBoundary from '@/features/error/components/ErrorBoundary';
import { ErrorView } from '@/features/error/components/ErrorView';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider, useThemeStore } from '@/store/themeStore';
import { ToastProvider } from '@/store/toastStore';
import { darkTheme, lightTheme } from '@/styles/theme';

const queryClient = new QueryClient();

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const APP_ERROR_FALLBACK = {
  title: '서비스 이용에 불편을 드려 죄송합니다.',
  description: '일시적인 오류가 발생했습니다.',
  onSecondaryButtonClick: () => window.location.reload(),
};

function GlobalStyles() {
  const { isDarkMode } = useThemeStore();
  return <Global styles={globalStyle(isDarkMode)} />;
}

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { isDarkMode } = useThemeStore();
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeStoreProvider>
        <ThemeWrapper>
          <ErrorBoundary fallback={<ErrorView {...APP_ERROR_FALLBACK} />}>
            <AuthProvider>
              <SocketProvider namespace="/battle">
                <ToastProvider>
                  <ModalProvider>{children}</ModalProvider>
                </ToastProvider>
              </SocketProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeWrapper>
      </ThemeStoreProvider>
    </QueryClientProvider>
  );
}

const globalStyle = (isDarkMode: boolean) => css`
  body {
    background: ${isDarkMode
      ? '#1c1d2bff'
      : 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)'};
    transition: background 0.3s ease;
  }

  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;
  }

  ::-webkit-scrollbar-thumb {
    outline: none;
    border-radius: 10px;
    border: 4px solid transparent;
    box-shadow: inset 8px 8px 0 #c8c8c8;
  }

  ::-webkit-scrollbar-thumb:hover {
    border: 4px solid transparent;
    box-shadow: inset 8px 8px 0 #878787;
  }

  ::-webkit-scrollbar-track {
    box-shadow: none;
    background-color: transparent;
  }
`;
