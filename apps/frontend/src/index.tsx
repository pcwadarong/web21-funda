import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

import { worker } from '@/mocks/browser';

import App from './app';

import './styles/main.css';

const queryClient = new QueryClient();

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const startApp = async () => {
  const enableMsw = import.meta.env.VITE_ENABLE_MSW === 'true';

  if (process.env.NODE_ENV === 'development' && enableMsw) {
    await worker.start({
      onUnhandledRequest: 'bypass', // 처리 안 된 요청은 통과
    });
  }

  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
};
startApp();
