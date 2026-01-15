import { createRoot } from 'react-dom/client';

import { worker } from '@/mocks/browser';

import App from './app';

import './styles/main.css';

const startApp = async () => {
  const enableMsw = import.meta.env.VITE_ENABLE_MSW === 'true';

  if (process.env.NODE_ENV === 'development' && enableMsw) {
    await worker.start({
      onUnhandledRequest: 'bypass', // 처리 안 된 요청은 통과
    });
  }

  createRoot(document.getElementById('root')!).render(<App />);
};
startApp();
