import { css } from '@emotion/react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/layouts/Sidebar';

export const LearnLayout = () => (
  <div css={containerStyle}>
    <Sidebar />
    {/* 이곳에 Learn,SelectField 가 이 자리에 사용됌 */}
    <Outlet />
  </div>
);

const containerStyle = css`
  display: flex;
`;
