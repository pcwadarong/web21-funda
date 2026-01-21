import { css } from '@emotion/react';
import { type ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import { Sidebar } from '@/layouts/Sidebar';

interface SideBarLayoutProps {
  children?: ReactNode;
}

export const SidebarSuspenseLayout = ({ children }: SideBarLayoutProps) => (
  <div css={containerStyle}>
    <Sidebar />
    <Suspense fallback={<Loading />}>{children || <Outlet />}</Suspense>
  </div>
);

const containerStyle = css`
  display: flex;
  min-height: 100vh;
`;
