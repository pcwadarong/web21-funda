import { css, Global, ThemeProvider } from '@emotion/react';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/providers/AuthProvider';
import { router } from '@/router';
import { ModalProvider } from '@/store/modalStore';
import { ThemeStoreProvider, useThemeStore } from '@/store/themeStore';
import { ToastProvider } from '@/store/toastStore';
import { darkTheme, lightTheme } from '@/styles/theme';

function AppContent() {
  const { isDarkMode } = useThemeStore();

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
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <RouterProvider router={router} />
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
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
