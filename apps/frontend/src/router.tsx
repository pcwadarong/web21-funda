import { createBrowserRouter } from 'react-router-dom';

import { AuthCheck } from '@/pages/AuthCheck';
import { Error } from '@/pages/Error';
import { Fields } from '@/pages/Fields';
import { Landing } from '@/pages/Landing';
import { Learn } from '@/pages/Learn';
import { Login } from '@/pages/Login';
import { Overview } from '@/pages/Overview';
import { Quiz } from '@/pages/Quiz';
import { QuizResult } from '@/pages/QuizResult';
import { ServicePreparation } from '@/pages/ServicePreparation';
import { Streak } from '@/pages/Streak';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/fields',
    element: <Fields />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/learn',
    element: <Learn />,
  },
  {
    path: '/overview/:unitId',
    element: <Overview />,
  },
  {
    path: '/quiz/:unitId/:stepId',
    element: <Quiz />,
  },
  {
    path: '/quiz/:unitId/:stepId/result',
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
