import { createBrowserRouter } from 'react-router-dom';

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
        index: true, // 그냥 /learn 접속 시
        element: <Learn />,
      },
      {
        path: 'select-field', // /learn/select-field 접속 시
        element: <SelectField />, // 사이드바는 유지된 채 중앙만 SelectField로 바뀜
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
  },
  {
    path: '/leaderboard/:groupId',
    element: <ServicePreparation />,
  },
  {
    path: '/setting',
    element: <ServicePreparation />,
  },
  {
    path: '/profile/:userId',
    element: <ServicePreparation />,
  },
  {
    path: '*',
    element: <Error />,
  },
]);
