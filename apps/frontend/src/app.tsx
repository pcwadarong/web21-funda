import { RouterProvider } from 'react-router-dom';

import { router } from '@/router';

import { AppProvider } from './providers';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
