import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { PageSuspenseLayout } from '@/layouts/PageSuspenseLayout';
import { SidebarSuspenseLayout } from '@/layouts/SidebarSuspenseLayout';
import { AuthCheck } from '@/pages/auth/AuthCheck';
import { Login } from '@/pages/auth/Login';
import { Landing } from '@/pages/common/Landing';
import { NotFound } from '@/pages/common/NotFound';
import { AdminGuard } from '@/router/guards/AdminGuard';
import { GuestGuard } from '@/router/guards/GuestGuard';
import { LoginGuard } from '@/router/guards/LoginGuard';
import { guestLoader, protectedLoader } from '@/router/loaders/authLoaders';
// import { ServicePreparation } from '@/pages/common/ServicePreparation';

// Lazy loading 컴포넌트들
const AdminQuizUpload = lazy(() =>
  import('@/pages/admin/QuizUpload').then(m => ({ default: m.AdminQuizUpload })),
);
const AdminLeaderboard = lazy(() =>
  import('@/pages/admin/Leaderboard').then(m => ({ default: m.AdminLeaderboard })),
);
const Leaderboard = lazy(() =>
  import('@/pages/Leaderboard').then(m => ({ default: m.Leaderboard })),
);
const Battle = lazy(() => import('@/pages/battle/Battle').then(m => ({ default: m.Battle })));
const Reports = lazy(() => import('@/pages/admin/Reports').then(m => ({ default: m.Reports })));
const InitialFields = lazy(() =>
  import('@/pages/learn/InitialFields').then(m => ({ default: m.InitialFields })),
);
const Learn = lazy(() => import('@/pages/learn/Learn').then(m => ({ default: m.Learn })));
const Roadmap = lazy(() => import('@/pages/learn/Roadmap').then(m => ({ default: m.Roadmap })));
const SelectField = lazy(() =>
  import('@/pages/learn/SelectField').then(m => ({ default: m.SelectField })),
);
const Quiz = lazy(() => import('@/pages/quiz/Quiz').then(m => ({ default: m.Quiz })));
const QuizResult = lazy(() =>
  import('@/pages/quiz/QuizResult').then(m => ({ default: m.QuizResult })),
);
const QuizReviewResult = lazy(() =>
  import('@/pages/quiz/QuizReviewResult').then(m => ({ default: m.QuizReviewResult })),
);
const QuizResultError = lazy(() =>
  import('@/pages/quiz/QuizResultError').then(m => ({ default: m.QuizResultError })),
);
const Profile = lazy(() => import('@/pages/user/Profile').then(m => ({ default: m.Profile })));
const Setting = lazy(() => import('@/pages/user/Setting').then(m => ({ default: m.Setting })));
const Unsubscribe = lazy(() =>
  import('@/pages/user/Unsubscribe').then(m => ({ default: m.Unsubscribe })),
);
const BattleQuizPage = lazy(() =>
  import('@/pages/battle/BattleQuizPage').then(m => ({ default: m.BattleQuizPage })),
);

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // 공용 페이지
      { index: true, element: <Landing /> },
      {
        element: <PageSuspenseLayout />, // 사이드바 없는 레이아웃
        children: [
          {
            path: 'quiz',
            children: [
              { index: true, element: <Quiz /> },
              { path: 'result', element: <QuizResult /> },
              { path: 'error', element: <QuizResultError /> },
              { path: 'review-result', element: <QuizReviewResult /> },
            ],
          },
          { path: 'battle/:inviteToken', element: <BattleQuizPage /> }, //임시 적용 (state로 변경 예정)
        ],
      },
      {
        element: <SidebarSuspenseLayout />,
        children: [
          { path: 'learn', element: <Learn /> },
          { path: 'learn/select-field', element: <SelectField /> },
          { path: 'learn/roadmap', element: <Roadmap /> },
          { path: 'profile/:userId?', element: <Profile /> },
          { path: 'setting', element: <Setting /> },
          { path: 'unsubscribe', element: <Unsubscribe /> },
          { path: 'battle', element: <Battle /> },
        ],
      },

      // 비로그인 사용자 전용
      {
        element: <GuestGuard />,
        loader: guestLoader,
        children: [
          { path: 'login', element: <Login /> },
          { path: 'auth/check', element: <AuthCheck /> },
          { path: 'initial-fields', element: <InitialFields /> },
        ],
      },

      // 로그인 사용자 전용
      {
        element: <LoginGuard />,
        loader: protectedLoader,
        children: [
          // 사이드바가 있는 페이지 그룹
          {
            element: <SidebarSuspenseLayout />,
            children: [
              {
                path: '/reports',
                element: <Reports />,
              },
              { path: 'leaderboard', element: <Leaderboard /> },
              { path: 'profile/:userId?', element: <Profile /> },
            ],
          },
          // 사이드바가 없는 페이지 그룹
          {
            element: <SidebarSuspenseLayout />,
            children: [
              // 관리자 전용 (이중 보호)
              {
                path: 'admin',
                element: <AdminGuard />,
                children: [
                  { path: 'leaderboard', element: <AdminLeaderboard /> },
                  { path: 'quizzes/upload', element: <AdminQuizUpload /> },
                  { path: 'quizzes/reports', element: <Reports /> },
                ],
              },
            ],
          },
        ],
      },

      // 404 페이지
      { path: '*', element: <NotFound /> },
    ],
  },
]);
