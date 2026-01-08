import type { ReactNode } from 'react';

import { Sidebar } from '@/layouts/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => (
  <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
    <Sidebar />
    <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
  </div>
);
