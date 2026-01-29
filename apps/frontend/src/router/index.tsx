import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AdminSuspenseLayout } from '@/layouts/AdminSuspenseLayout';
import { BattleFlowLayout } from '@/layouts/BattleFlowLayout';
import { PageSuspenseLayout } from '@/layouts/PageSuspenseLayout';
import { SidebarSuspenseLayout } from '@/layouts/SidebarSuspenseLayout';
// import { ServicePreparation } from '@/pages/common/ServicePreparation';
import { AuthCheck } from '@/pages/auth/AuthCheck';
import { Login } from '@/pages/auth/Login';
import { Landing } from '@/pages/common/Landing';
import { NotFound } from '@/pages/common/NotFound';
import { AdminGuard } from '@/router/guards/AdminGuard';
import { GuestGuard } from '@/router/guards/GuestGuard';
import { LoginGuard } from '@/router/guards/LoginGuard';
import { guestLoader, protectedLoader } from '@/router/loaders/authLoaders';

// Lazy loading 컴포넌트들
const AdminQuizUpload = lazy(() =>
  import('@/pages/admin/QuizUpload').then(m => ({ default: m.AdminQuizUpload })),
);
const AdminUnitOverviewUpload = lazy(() =>
  import('@/pages/admin/UnitOverviewUpload').then(m => ({ default: m.AdminUnitOverviewUpload })),
);
const AdminLeaderboard = lazy(() =>
  import('@/pages/admin/Leaderboard').then(m => ({ default: m.AdminLeaderboard })),
);
const Reports = lazy(() => import('@/pages/admin/Reports').then(m => ({ default: m.Reports })));

const Leaderboard = lazy(() =>
  import('@/pages/Leaderboard').then(m => ({ default: m.Leaderboard })),
);
const BattleLobby = lazy(() =>
  import('@/pages/battle/BattleLobbyPage').then(m => ({ default: m.BattleLobbyPage })),
);
const BattleSetup = lazy(() =>
  import('@/pages/battle/BattleSetupPage').then(m => ({ default: m.BattleSetupPage })),
);
const BattlePlay = lazy(() =>
  import('@/pages/battle/BattlePlayPage').then(m => ({ default: m.BattlePlayPage })),
);
const BattleResult = lazy(() =>
  import('@/pages/battle/BattleResultPage').then(m => ({ default: m.BattleResultPage })),
);
const InitialFields = lazy(() =>
  import('@/pages/learn/InitialFields').then(m => ({ default: m.InitialFields })),
);
const Learn = lazy(() => import('@/pages/learn/Learn').then(m => ({ default: m.Learn })));
const Roadmap = lazy(() => import('@/pages/learn/Roadmap').then(m => ({ default: m.Roadmap })));
const SelectField = lazy(() =>
  import('@/pages/learn/SelectField').then(m => ({ default: m.SelectField })),
);
const Quiz = lazy(() => import('@/pages/quiz/Quiz').then(m => ({ default: m.Quiz })));
const Overview = lazy(() => import('@/pages/learn/Overview').then(m => ({ default: m.Overview })));
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
const Animation = lazy(() => import('@/pages/Animation').then(m => ({ default: m.FoxAnimation })));

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
        ],
      },
      {
        element: <SidebarSuspenseLayout />,
        children: [
          { path: 'learn', element: <Learn /> },
          { path: 'learn/select-field', element: <SelectField /> },
          { path: 'learn/roadmap', element: <Roadmap /> },
          { path: 'learn/overview/:unitId', element: <Overview /> },
          { path: 'profile/:userId?', element: <Profile /> },
          { path: 'setting', element: <Setting /> },
          { path: 'unsubscribe', element: <Unsubscribe /> },
          { path: 'animation', element: <Animation /> },
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

      // 배틀 전용
      {
        element: <BattleFlowLayout />,
        children: [
          {
            element: <PageSuspenseLayout />,
            children: [
              { path: 'battle/play', element: <BattlePlay /> },
              { path: 'battle/result', element: <BattleResult /> },
            ],
          },
          {
            element: <SidebarSuspenseLayout />,
            children: [
              { path: 'battle', element: <BattleLobby /> },
              { path: 'battle/:inviteToken', element: <BattleSetup /> },
            ],
          },
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
          // 관리자 전용 (이중 보호)
          {
            element: <AdminSuspenseLayout />,
            children: [
              {
                path: 'admin',
                element: <AdminGuard />,
                children: [
                  { path: 'leaderboard', element: <AdminLeaderboard /> },
                  { path: 'quizzes/upload', element: <AdminQuizUpload /> },
                  { path: 'units/overview/upload', element: <AdminUnitOverviewUpload /> },
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
