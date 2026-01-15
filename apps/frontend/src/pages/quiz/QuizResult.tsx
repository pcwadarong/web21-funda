import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PointEffect } from '@/feat/quiz/components/PointEffect';
import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import { Streak } from '@/feat/quiz/components/Streak';
import { formatDuration } from '@/feat/quiz/utils/formatDuration';
import { useStorage } from '@/hooks/useStorage';
import { useIsLoggedIn } from '@/store/authStore';

type QuizResultState = {
  answeredQuizzes?: number;
  correctCount?: number;
  currentStreak: number;
  durationSeconds?: number;
  experience?: number;
  isFirstSolveToday: boolean;
  score?: number;
  totalQuizzes?: number | null;
  successRate?: number;
  xpGained?: number;
  durationMs?: number;
  guestStepId?: number;
};

export const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = useIsLoggedIn();
  const { removeGuestStepAttempt, uiState, updateUIState } = useStorage();

  // 데이터 초기화 및 가공
  const response = (location.state as QuizResultState | null) ?? null;
  const guestStepId = response?.guestStepId;
  const xpValue = response?.experience ?? response?.xpGained;
  const durationMs =
    response?.durationMs ??
    (typeof response?.durationSeconds === 'number' ? response.durationSeconds * 1000 : null);
  const hasXP = typeof xpValue === 'number' && xpValue > 0;

  const resultData = {
    isFirstSolveToday: response?.isFirstSolveToday ?? false, // 오늘 첫 풀이 여부
    currentStreak: response?.currentStreak ?? 1, // 현재 스트릭
    xpGained: response?.xpGained ?? null,
    experience: response?.experience ?? null,
    successRate: response?.successRate ?? null,
    durationMs: formatDuration(durationMs),
  };

  const [showPointEffect, setShowPointEffect] = useState(true); // 경험치 획득 연출 여부
  const [showStreakAnimation, setShowStreakAnimation] = useState(false); // 스트릭 애니메이션 여부

  // 비로그인 사용자의 임시 저장 데이터 삭제
  useEffect(() => {
    if (guestStepId !== undefined) removeGuestStepAttempt(guestStepId);
  }, [guestStepId, removeGuestStepAttempt]);

  // 경험치 연출(PointEffect)을 2초 동안 보여준 후 종료
  useEffect(() => {
    if (!hasXP) {
      setShowPointEffect(false);
      return;
    }
    const timer = setTimeout(() => setShowPointEffect(false), 2000);
    return () => clearTimeout(timer);
  }, [hasXP]);

  // 스트릭 애니메이션 종료 후 이동 처리
  useEffect(() => {
    if (!showStreakAnimation) return;

    const timer = setTimeout(() => {
      navigate('/learn');
      setShowStreakAnimation(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showStreakAnimation, navigate]);

  /**
   * CASE 1: 다음 단계로 이동
   * - 비로그인: 로그인 체크 페이지로
   * - 오늘 첫 풀이: 스트릭 애니메이션 재생 후 이동
   * - 일반 완료: 즉시 다음 퀴즈 단계로 이동
   */
  const handleNextNavigation = () => {
    if (!isLogin) {
      navigate('/auth/check', { state: { from: '/quiz' } });
      return;
    }

    if (resultData.isFirstSolveToday) {
      setShowStreakAnimation(true); // 스트릭 연출 시작 (이후 useEffect에서 이동 처리)
    } else {
      // 즉시 이동 및 상태 업데이트
      updateUIState({ current_quiz_step_id: uiState.current_quiz_step_id + 1 });
      navigate('/quiz');
    }
  };

  /**
   * CASE 2: 메인(학습) 화면으로 이동
   * - 별도 연출 없이 즉시 /learn으로 이동
   */
  const handleMainNavigation = () => {
    if (!isLogin) {
      navigate('/auth/check', { state: { from: '/learn' } });
      return;
    }
    navigate('/learn');
  };

  // ---------------------------------------------------------
  // 4. 렌더링 조건부 처리 (순서: 경험치 -> 스트릭 -> 결과창)
  // ---------------------------------------------------------
  return (
    <AnimatePresence mode="wait">
      {/* 1순위: 경험치 획득 연출 */}
      {showPointEffect && hasXP ? (
        <PointEffect key="point-effect" points={xpValue!} />
      ) : /* 2순위: 스트릭 연출 (오늘 첫 풀이) */
      showStreakAnimation ? (
        <Streak key="streak-animation" currentStreak={resultData.currentStreak} />
      ) : (
        /* 3순위: 최종 결과 리포트 컨텐츠 */
        <QuizResultContent
          key="result-content"
          resultData={resultData}
          onNextNavigation={handleNextNavigation}
          onMainNavigation={handleMainNavigation}
        />
      )}
    </AnimatePresence>
  );
};
