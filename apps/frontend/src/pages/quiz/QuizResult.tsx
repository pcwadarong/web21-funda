import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PointEffect } from '@/feat/quiz/components/PointEffect';
import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import { formatDuration } from '@/feat/quiz/utils/formatDuration';
import { useStorage } from '@/hooks/useStorage';
import { useIsLoggedIn } from '@/store/authStore';

type QuizResultState = {
  score?: number;
  experience?: number;
  correctCount?: number;
  totalQuizzes?: number | null;
  answeredQuizzes?: number;
  successRate?: number;
  durationSeconds?: number;
  firstSolve?: boolean;
  xpGained?: number;
  durationMs?: number;
  guestStepId?: number;
};

export const QuizResult = () => {
  const location = useLocation();
  const [showPointEffect, setShowPointEffect] = useState(true);
  const isLogin = useIsLoggedIn();
  const [isFirstToday] = useState(true); // TODO: 실제 오늘 첫 문제 여부로 대체
  const { removeGuestStepAttempt } = useStorage();

  // Quiz.tsx에서 전달된 result 데이터
  const response = (location.state as QuizResultState | null) ?? null;
  const guestStepId = response?.guestStepId;

  const xpValue = response?.experience ?? response?.xpGained;
  const durationMs =
    response?.durationMs ??
    (typeof response?.durationSeconds === 'number' ? response.durationSeconds * 1000 : null);
  const hasXP = typeof xpValue === 'number' && xpValue > 0;

  const resultData = {
    xpGained: response?.xpGained ?? null,
    experience: response?.experience ?? null,
    successRate: response?.successRate ?? null,
    durationMs: formatDuration(durationMs),
  };

  const firstSolve = response?.firstSolve ?? isFirstToday;

  useEffect(() => {
    if (guestStepId === undefined) {
      return;
    }

    removeGuestStepAttempt(guestStepId);
  }, [guestStepId, removeGuestStepAttempt]);

  useEffect(() => {
    if (!hasXP) {
      setShowPointEffect(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowPointEffect(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasXP]);

  return (
    <AnimatePresence mode="wait">
      {showPointEffect && hasXP ? (
        <PointEffect key="point-effect" points={xpValue!} />
      ) : (
        <QuizResultContent
          key="result-content"
          resultData={resultData}
          isLogin={isLogin}
          isFirstToday={firstSolve}
        />
      )}
    </AnimatePresence>
  );
};
