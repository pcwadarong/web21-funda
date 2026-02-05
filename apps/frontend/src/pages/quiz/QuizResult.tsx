import { useLocation, useNavigate } from 'react-router-dom';

import type { QuizResultState } from '@/feat/quiz/components/QuizResultContainer';
import { QuizResultContainer } from '@/feat/quiz/components/QuizResultContainer';
import { useStorage } from '@/hooks/useStorage';
import { useIsLoggedIn } from '@/store/authStore';

function isQuizResultState(value: unknown): value is QuizResultState {
  if (value === null || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return typeof o.currentStreak === 'number' && typeof o.isFirstSolveToday === 'boolean';
}

export const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = useIsLoggedIn();
  const { removeGuestStepAttempt, uiState, updateUIState } = useStorage();

  const resultState = isQuizResultState(location.state) ? location.state : null;

  const handleNavigate = (path: string, state?: { from?: string }) => {
    if (path === '/auth/check') {
      navigate('/auth/check', { state: { from: state?.from ?? '/learn' } });
      return;
    }
    navigate(path);
  };

  return (
    <QuizResultContainer
      resultState={resultState}
      isLogin={isLogin}
      onNavigate={handleNavigate}
      removeGuestStepAttempt={removeGuestStepAttempt}
      updateUIState={updateUIState}
      uiState={uiState}
    />
  );
};
