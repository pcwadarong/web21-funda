import { createBrowserRouter, redirect } from 'react-router-dom';

import { LearnLayout } from '@/layouts/LearnLayout';
import { AdminQuizUpload } from '@/pages/AdminQuizUpload';
import { AuthCheck } from '@/pages/AuthCheck';
import { Error } from '@/pages/Error';
import { InitialFields } from '@/pages/InitialFields';
import { Landing } from '@/pages/Landing';
import { Learn } from '@/pages/Learn';
import { Login } from '@/pages/Login';
import { Overview } from '@/pages/Overview';
import { Quiz } from '@/pages/Quiz';
import { QuizResult } from '@/pages/QuizResult';
import { Roadmap } from '@/pages/Roadmap';
import { SelectField } from '@/pages/SelectField';
import { ServicePreparation } from '@/pages/ServicePreparation';
import { Streak } from '@/pages/Streak';

const isLoggedIn = false; // TODO: 추후 실제 로그인 상태로 변경 필요

// 보호된 페이지를 위한 공통 로더
// 로그인이 안 되어 있다면 로그인 페이지로 강제 이동
const protectedLoader = () => {
  if (!isLoggedIn) return redirect('/login');
  return null;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/initial-fields',
    element: <InitialFields />,
  },
  {
    path: '/admin/quizzes/upload',
    element: <AdminQuizUpload />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/learn',
    element: <LearnLayout />,
    children: [
      {
        index: true,
        element: <Learn />,
      },
      {
        path: 'select-field',
        element: <SelectField />,
      },
      {
        path: 'roadmap',
        element: <Roadmap />,
      },
    ],
  },
  {
    path: '/overview/:unitId',
    element: <Overview />,
  },
  {
    path: '/quiz',
    element: <Quiz />,
  },
  {
    path: '/quiz/result',
    element: <QuizResult />,
  },
  {
    path: '/auth/check',
    element: <AuthCheck />,
  },
  {
    path: '/streak',
    element: <Streak />,
    loader: protectedLoader,
  },
  {
    path: '/leaderboard/:groupId',
    element: <ServicePreparation />,
    loader: protectedLoader,
  },
  {
    path: '/setting',
    element: <ServicePreparation />,
  },
  {
    path: '/profile/:userId',
    element: <ServicePreparation />,
    loader: protectedLoader,
  },
  {
    path: '*',
    element: <Error />,
  },
]);
