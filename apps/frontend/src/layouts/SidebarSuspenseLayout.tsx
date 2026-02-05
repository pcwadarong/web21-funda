import { css } from '@emotion/react';
import { type ReactNode, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import ErrorBoundary from '@/features/error/components/ErrorBoundary';
import { ErrorView } from '@/features/error/components/ErrorView';
import { Sidebar } from '@/layouts/Sidebar';

interface SidebarLayoutProps {
  children?: ReactNode;
}

export const SidebarSuspenseLayout = ({ children }: SidebarLayoutProps) => {
  const location = useLocation();

  return (
    <div css={containerStyle}>
      <Sidebar />
      <main css={mainContentStyle(location.pathname)}>
        <ErrorBoundary fallback={<ErrorView {...ERROR_FALLBACK} />}>
          <Suspense fallback={<Loading />}>{children || <Outlet />}</Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};
const ERROR_FALLBACK = {
  title: '콘텐츠를 불러올 수 없습니다.',
  description: '문제가 계속되면 다시 시도해주세요.',
  onSecondaryButtonClick: () => window.location.reload(),
};
const containerStyle = css`
  display: flex;
  height: 100dvh;
  flex-direction: row;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const mainContentStyle = (location: string) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;

  @media (max-width: 768px) {
    padding-bottom: 96px;
  }

  ${location === '/learn' &&
  `
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar {
        display: none;
      }

      @media (max-width: 768px) {
        padding-bottom: 0;
      }
  `}
`;
