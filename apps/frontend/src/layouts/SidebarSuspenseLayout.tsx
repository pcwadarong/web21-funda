import { css } from '@emotion/react';
import { type ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import { Sidebar } from '@/layouts/Sidebar';

interface SidebarLayoutProps {
  children?: ReactNode;
}

export const SidebarSuspenseLayout = ({ children }: SidebarLayoutProps) => (
  <div css={containerStyle}>
    <Sidebar />
    <main css={mainContentStyle}>
      <Suspense fallback={<Loading />}>{children || <Outlet />}</Suspense>
    </main>
  </div>
);

const containerStyle = css`
  display: flex;
  height: 100dvh;
  flex-direction: row;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const mainContentStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
`;
