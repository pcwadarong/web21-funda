import { css } from '@emotion/react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/layouts/Sidebar';

export const LearnLayout = () => (
  <div css={containerStyle}>
    <Sidebar />
    {/* Learn,SelectField */}
    <Outlet />
  </div>
);

const containerStyle = css`
  display: flex;
`;
