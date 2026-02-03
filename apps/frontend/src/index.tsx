import { createRoot } from 'react-dom/client';

import { worker } from '@/mocks/browser';

import App from './app';

import '@/styles/main.css';

const startApp = async () => {
  if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_ENABLE_MSW === 'true') {
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  createRoot(document.getElementById('root')!).render(<App />);
};
startApp();
