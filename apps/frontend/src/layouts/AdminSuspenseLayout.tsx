import { css, useTheme } from '@emotion/react';
import { type ReactNode, Suspense } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import { Sidebar } from '@/layouts/Sidebar';
import type { Theme } from '@/styles/theme';

interface AdminLayoutProps {
  children?: ReactNode;
}

const ADMIN_TABS = [
  { label: '랭킹 관리', path: '/admin/leaderboard' },
  { label: '퀴즈 리포트', path: '/admin/quizzes/reports' },
  { label: '퀴즈 업로드', path: '/admin/quizzes/upload' },
  { label: '유닛 개요 업로드', path: '/admin/units/overview/upload' },
] as const;

export const AdminSuspenseLayout = ({ children }: AdminLayoutProps) => {
  const theme = useTheme();
  const location = useLocation();

  if (location.pathname === '/admin') return <Navigate to={ADMIN_TABS[0].path} replace />;

  return (
    <div css={containerStyle}>
      <Sidebar />
      <main css={mainContentStyle}>
        <header css={headerStyle(theme)}>
          <h1 css={titleStyle(theme)}>관리자 대시보드</h1>
          <nav css={tabListStyle}>
            {ADMIN_TABS.map(tab => (
              <Link
                key={tab.path}
                to={tab.path}
                css={[tabItemStyle(theme), location.pathname === tab.path && activeTabStyle(theme)]}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        <section css={contentAreaStyle}>
          <div css={scrollInnerStyle}>
            <Suspense fallback={<Loading />}>{children || <Outlet />}</Suspense>
          </div>
        </section>
      </main>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  height: 100vh;
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

const headerStyle = (theme: Theme) => css`
  flex-shrink: 0;
  padding: 32px 32px 0 32px;
  background: ${theme.colors.surface.strong};
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  margin-bottom: 24px;
  color: ${theme.colors.text.strong};
`;

const tabListStyle = css`
  display: flex;
  gap: 8px;
`;

const tabItemStyle = (theme: Theme) => css`
  padding: 12px 20px;
  text-decoration: none;
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.text.weak};
  border-bottom: 2px solid transparent;
  transition: all 0.2s;

  &:hover {
    color: ${theme.colors.primary.main};
  }

  @media (max-width: 768px) {
    font-size: ${theme.typography['12Medium'].fontSize};
  }
`;

const activeTabStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
  font-weight: 700;
  border-bottom: 2px solid ${theme.colors.primary.main};
`;

const contentAreaStyle = css`
  flex: 1;
  overflow-y: auto;
  padding: 32px;

  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const scrollInnerStyle = css`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
