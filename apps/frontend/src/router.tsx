import { lazy } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import { PageSuspenseLayout } from '@/layouts/PageSuspenseLayout';
import { SidebarSuspenseLayout } from '@/layouts/SidebarSuspenseLayout';
import { AdminRouteGuard } from '@/pages/admin/AdminRouteGuard';
import { AuthCheck } from '@/pages/auth/AuthCheck';
import { Login } from '@/pages/auth/Login';
import { Landing } from '@/pages/common/Landing';
import { NotFound } from '@/pages/common/NotFound';
// import { ServicePreparation } from '@/pages/common/ServicePreparation';
import { useAuthStore } from '@/store/authStore';

// Lazy loading 컴포넌트들
const AdminQuizUpload = lazy(() =>
  import('@/pages/admin/QuizUpload').then(m => ({ default: m.AdminQuizUpload })),
);
const Leaderboard = lazy(() =>
  import('@/pages/Leaderboard').then(m => ({ default: m.Leaderboard })),
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
const QuizResult = lazy(() =>
  import('@/pages/quiz/QuizResult').then(m => ({ default: m.QuizResult })),
);
const QuizResultError = lazy(() =>
  import('@/pages/quiz/QuizResultError').then(m => ({ default: m.QuizResultError })),
);
const Profile = lazy(() => import('@/pages/user/Profile').then(m => ({ default: m.Profile })));
const Setting = lazy(() => import('@/pages/user/Setting').then(m => ({ default: m.Setting })));
const Unsubscribe = lazy(() =>
  import('@/pages/user/Unsubscribe').then(m => ({ default: m.Unsubscribe })),
);

const protectedLoader = () => {
  const { isLoggedIn, isAuthReady } = useAuthStore.getState();
  if (!isAuthReady) return null;
  if (!isLoggedIn) return redirect('/login');
  return null;
};

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'auth/check', element: <AuthCheck /> },

      // 사이드바가 있는 페이지들
      {
        element: <SidebarSuspenseLayout />,
        children: [
          { path: 'learn', element: <Learn /> },
          { path: 'learn/select-field', element: <SelectField /> },
          { path: 'learn/roadmap', element: <Roadmap /> },
          { path: 'leaderboard', element: <Leaderboard />, loader: protectedLoader },
          { path: 'profile/:userId?', element: <Profile />, loader: protectedLoader },
          { path: 'setting', element: <Setting />, loader: protectedLoader },
        ],
      },

      // 사이드바가 없는 페이지들
      {
        element: <PageSuspenseLayout />,
        children: [
          {
            path: 'quiz',
            children: [
              { index: true, element: <Quiz /> },
              { path: 'result', element: <QuizResult /> },
              { path: 'error', element: <QuizResultError /> },
            ],
          },
          { path: 'initial-fields', element: <InitialFields /> },
          { path: 'unsubscribe', element: <Unsubscribe /> },
          {
            path: 'admin',
            element: <AdminRouteGuard />,
            children: [{ path: 'quizzes/upload', element: <AdminQuizUpload /> }],
          },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]);
