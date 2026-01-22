import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { Loading } from '@/components/Loading';

/**
 * 사이드바 없이 전체 화면에 대해 Suspense와 Loading만 적용하는 레이아웃
 */
export const PageSuspenseLayout = () => (
  <Suspense fallback={<Loading />}>
    <Outlet />
  </Suspense>
);
