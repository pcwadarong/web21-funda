import { css, Global, ThemeProvider } from '@emotion/react';
import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/providers/AuthProvider';
import { router } from '@/router';
import { ModalProvider } from '@/store/modalStore';
import { darkTheme, lightTheme } from '@/styles/theme';

import { ToastProvider } from './store/toastStore';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Global
        styles={css`
          body {
            background: ${isDarkMode
              ? '#1c1d2bff'
              : 'linear-gradient(180deg, #faf5ff 0%, #eff6ff 50%, #eef2ff 100%)'};
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
