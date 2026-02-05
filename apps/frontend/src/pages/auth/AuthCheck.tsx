import { useLocation, useNavigate } from 'react-router-dom';

import { AuthCheckContainer } from '@/feat/auth/components/AuthCheckContainer';
import { useStorage } from '@/hooks/useStorage';

export const AuthCheck = () => {
  const { updateUIState, uiState } = useStorage();
  const location = useLocation();
  const navigate = useNavigate();
  const { from } = (location.state as { from?: string } | undefined) ?? {};

  const handleLogin = () => {
    navigate('/login');
  };

  const handleContinue = () => {
    if (from === '/quiz') {
      navigate('/quiz');
      updateUIState({
        current_quiz_step_id: uiState.current_quiz_step_id + 1,
      });
    } else {
      navigate('/learn');
    }
  };

  return <AuthCheckContainer from={from} onLogin={handleLogin} onContinue={handleContinue} />;
};
