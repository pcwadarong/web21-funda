import { useLocation, useNavigate } from 'react-router-dom';

import type { QuizResultState } from '@/feat/quiz/components/QuizResultContainer';
import { QuizResultContainer } from '@/feat/quiz/components/QuizResultContainer';
import { useStorage } from '@/hooks/useStorage';
import { useIsLoggedIn } from '@/store/authStore';

export const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = useIsLoggedIn();
  const { removeGuestStepAttempt, uiState, updateUIState } = useStorage();

  const resultState = (location.state as QuizResultState | null) ?? null;

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
