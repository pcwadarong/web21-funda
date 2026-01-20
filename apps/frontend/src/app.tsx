import { css, Global, ThemeProvider } from '@emotion/react';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from '@/router';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider, useThemeStore } from '@/store/themeStore';
import { ToastProvider } from '@/store/toastStore';
import { darkTheme, lightTheme } from '@/styles/theme';

import { Loading } from './components/Loading';
import ErrorBoundary from './features/error/components/ErrorBoundary';
import { ErrorView } from './features/error/components/ErrorView';
import { AuthProvider } from './providers/AuthProvider';

function AppContent() {
  const { isDarkMode } = useThemeStore();

  const APP_ERROR_FALLBACK = {
    title: '서비스 이용에 불편을 드려 죄송합니다.',
    description: '일시적인 오류가 발생했습니다.',
    onSecondaryButtonClick: () => window.location.reload(),
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Global
        styles={css`
          body {
            background: ${isDarkMode
              ? '#1c1d2bff'
              : 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)'};
            transition: background 0.3s ease; // 부드러운 전환 효과
          }
        `}
      />

      <ErrorBoundary fallback={<ErrorView {...APP_ERROR_FALLBACK} />}>
        <Suspense fallback={<Loading />}>
          <AuthProvider>
            <ToastProvider>
              <ModalProvider>
                <RouterProvider router={router} />
              </ModalProvider>
            </ToastProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ThemeStoreProvider>
      <AppContent />
    </ThemeStoreProvider>
  );
}
