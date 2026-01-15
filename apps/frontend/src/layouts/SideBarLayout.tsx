import { css } from '@emotion/react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/layouts/Sidebar';

export const SideBarLayout = () => (
  <div css={containerStyle}>
    <Sidebar />
    <Outlet />
  </div>
);

const containerStyle = css`
  display: flex;
`;
