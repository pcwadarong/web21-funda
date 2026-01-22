import { css, Global, ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';

import { Loading } from '@/components/Loading';
import ErrorBoundary from '@/features/error/components/ErrorBoundary';
import { ErrorView } from '@/features/error/components/ErrorView';
import { AuthProvider } from '@/providers/AuthProvider';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider, useThemeStore } from '@/store/themeStore';
import { ToastProvider } from '@/store/toastStore';
import { darkTheme, lightTheme } from '@/styles/theme';

const queryClient = new QueryClient();

const APP_ERROR_FALLBACK = {
  title: '서비스 이용에 불편을 드려 죄송합니다.',
  description: '일시적인 오류가 발생했습니다.',
  onSecondaryButtonClick: () => window.location.reload(),
};

function GlobalStyles() {
  const { isDarkMode } = useThemeStore();
  return (
    <Global
      styles={css`
        body {
          background: ${isDarkMode
            ? '#1c1d2bff'
            : 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)'};
          transition: background 0.3s ease;
        }
      `}
    />
  );
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
            <Suspense fallback={<Loading />}>
              <AuthProvider>
                <ToastProvider>
                  <ModalProvider>{children}</ModalProvider>
                </ToastProvider>
              </AuthProvider>
            </Suspense>
          </ErrorBoundary>
        </ThemeWrapper>
      </ThemeStoreProvider>
    </QueryClientProvider>
  );
}
