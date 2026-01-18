import { useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useIsLoggedIn, useIsAuthReady } from '@/store/authStore';
import { LandingContainer } from '@/feat/landing/components/LandingContainer';

export const Landing = () => {
  const navigate = useNavigate();
  const isLoggedIn = useIsLoggedIn();
  const isAuthReady = useIsAuthReady();

  const handleStart = useCallback(() => {
    navigate('/initial-fields');
  }, [navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // 1. 초기 인증 정보를 가져오는 중이면 대기
  if (!isAuthReady) return null;

  // 2. 이미 로그인된 상태라면 메인 학습 페이지로 리다이렉트
  if (isLoggedIn) return <Navigate to="/learn" replace />;

  // 3. 비로그인 유저에게 UI 컨테이너 렌더링
  return <LandingContainer onStart={handleStart} onLogin={handleLogin} />;
};
