import { lazy } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import { SideBarLayout } from '@/layouts/SideBarLayout';
import { AdminRouteGuard } from '@/pages/admin/AdminRouteGuard';
import { AuthCheck } from '@/pages/auth/AuthCheck';
import { Login } from '@/pages/auth/Login';
import { GlobalError } from '@/pages/common/GlobalError';
import { Landing } from '@/pages/common/Landing';
import { NotFound } from '@/pages/common/NotFound';
import Unsubscribe from '@/pages/user/Unsubscribe';
import { useAuthStore } from '@/store/authStore';

const AdminQuizUpload = lazy(() =>
  import('@/pages/admin/QuizUpload').then(module => ({ default: module.AdminQuizUpload })),
);
const ServicePreparation = lazy(() =>
  import('@/pages/common/ServicePreparation').then(module => ({
    default: module.ServicePreparation,
  })),
);
const Leaderboard = lazy(() =>
  import('@/pages/Leaderboard').then(module => ({ default: module.Leaderboard })),
);
const InitialFields = lazy(() =>
  import('@/pages/learn/InitialFields').then(module => ({ default: module.InitialFields })),
);
const Learn = lazy(() => import('@/pages/learn/Learn').then(module => ({ default: module.Learn })));
const Roadmap = lazy(() =>
  import('@/pages/learn/Roadmap').then(module => ({ default: module.Roadmap })),
);
const SelectField = lazy(() =>
  import('@/pages/learn/SelectField').then(module => ({ default: module.SelectField })),
);
const Quiz = lazy(() => import('@/pages/quiz/Quiz').then(module => ({ default: module.Quiz })));
const QuizResult = lazy(() =>
  import('@/pages/quiz/QuizResult').then(module => ({ default: module.QuizResult })),
);
const QuizResultError = lazy(() =>
  import('@/pages/quiz/QuizResultError').then(module => ({ default: module.QuizResultError })),
);
const Profile = lazy(() =>
  import('@/pages/user/Profile').then(module => ({ default: module.Profile })),
);
const Setting = lazy(() =>
  import('@/pages/user/Setting').then(module => ({ default: module.Setting })),
);

// 보호된 페이지를 위한 공통 로더
const protectedLoader = () => {
  const { isLoggedIn, isAuthReady } = useAuthStore.getState();
  if (!isAuthReady) return null;
  if (!isLoggedIn) return redirect('/login');
  return null;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
    errorElement: <GlobalError />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/auth/check',
    element: <AuthCheck />,
  },

  // 학습 관련
  {
    path: '/learn',
    element: <SideBarLayout />,
    children: [
      { index: true, element: <Learn /> },
      { path: 'select-field', element: <SelectField /> },
      { path: 'roadmap', element: <Roadmap /> },
    ],
  },
  {
    path: '/learn/overview/:unitId',
    // element: <Overview />,
    element: <ServicePreparation />,
  },

  // 퀴즈 관련 (Quiz)
  {
    path: '/quiz',
    children: [
      { index: true, element: <Quiz /> }, // /quiz
      { path: 'result', element: <QuizResult /> }, // /quiz/result
      { path: 'error', element: <QuizResultError /> }, // /quiz/error
    ],
  },

  // 로그인 보호 + SideBarLayout 사용
  {
    loader: protectedLoader,
    element: <SideBarLayout />,
    children: [
      { path: '/leaderboard', element: <Leaderboard /> },
      { path: '/profile/:userId?', element: <Profile /> },
      { path: '/setting', element: <Setting /> },
    ],
  },

  // 관리자 (Admin)
  {
    path: '/admin',
    element: <AdminRouteGuard />,
    children: [
      {
        path: 'quizzes',
        children: [
          { path: 'upload', element: <AdminQuizUpload /> }, // /admin/quizzes/upload
        ],
      },
    ],
  },
  {
    path: '/unsubscribe',
    element: <Unsubscribe />,
  },
  {
    path: '/initial-fields',
    element: <InitialFields />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
