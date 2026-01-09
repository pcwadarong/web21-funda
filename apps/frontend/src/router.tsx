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
    path: '/login',
    element: <Login />,
  },
  {
    path: '/auth/check',
    element: <AuthCheck />,
  },

  // 학습 + 레이아웃 통일
  {
    path: '/learn',
    element: <LearnLayout />,
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
    ],
  },

  // 사용자 및 소셜 (User)
  {
    loader: protectedLoader,
    children: [
      { path: '/streak', element: <Streak /> },
      { path: '/leaderboard/:groupId', element: <ServicePreparation /> },
      { path: '/profile/:userId', element: <ServicePreparation /> },
    ],
  },

  // 4. 관리자 (Admin)
  {
    path: '/admin',
    children: [
      {
        path: 'quizzes',
        children: [
          { path: 'upload', element: <AdminQuizUpload /> }, // /admin/quizzes/upload
        ],
      },
    ],
  },

  // 기타 설정 및 공통
  {
    path: '/setting',
    // element: <Setting />,
    element: <ServicePreparation />,
  },
  {
    path: '/initial-fields',
    element: <InitialFields />,
  },
  {
    path: '*',
    element: <Error />,
  },
]);
