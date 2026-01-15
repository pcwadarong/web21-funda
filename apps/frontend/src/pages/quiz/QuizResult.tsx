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
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // 비로그인 사용자의 임시 저장 데이터 삭제
  useEffect(() => {
    if (guestStepId !== undefined) removeGuestStepAttempt(guestStepId);
  }, [guestStepId, removeGuestStepAttempt]);

  // 경험치 연출(PointEffect)을 2초 동안 보여준 후 종료
  useEffect(() => {
    if (!hasXP) setShowPointEffect(false);
    else {
      const timer = setTimeout(() => setShowPointEffect(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasXP]);

  // 스트릭 애니메이션 종료 후 이동 처리
  useEffect(() => {
    if (!showStreakAnimation || !pendingPath) return;

    const timer = setTimeout(() => {
      navigate(pendingPath);
      setShowStreakAnimation(false);
      setPendingPath(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [showStreakAnimation, pendingPath, navigate]);

  /**
   * 네비게이션 통합 핸들러
   * - 비로그인: 로그인 체크 페이지로
   * - 오늘 첫 풀이: 스트릭 애니메이션 재생 후 이동
   * - 일반 완료: 즉시 다음 퀴즈 단계로 이동
   */
  const handleNavigation = (targetPath: string, shouldUpdateStep: boolean = false) => {
    if (!isLogin) {
      navigate('/auth/check', { state: { from: targetPath } });
      return;
    }

    if (shouldUpdateStep) updateUIState({ current_quiz_step_id: uiState.current_quiz_step_id + 1 });

    if (resultData.isFirstSolveToday) {
      setPendingPath(targetPath);
      setShowStreakAnimation(true);
    } else navigate(targetPath);
  };

  // 렌더링 조건부 처리 (순서: 경험치 -> 스트릭 -> 결과창)
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
          onNextNavigation={() => handleNavigation('/quiz', true)}
          onMainNavigation={() => handleNavigation('/learn')}
        />
      )}
    </AnimatePresence>
  );
};
