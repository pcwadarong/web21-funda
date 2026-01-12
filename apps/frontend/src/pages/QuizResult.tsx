import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PointEffect } from '@/feat/quiz/components/PointEffect';
import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import type { StepCompletionResult } from '@/feat/quiz/types';
import { formatDuration } from '@/feat/quiz/utils/formatDuration';

export const QuizResult = () => {
  const location = useLocation();
  const [showPointEffect, setShowPointEffect] = useState(true);
  const [isLogin] = useState(false); // TODO: 실제 로그인 상태로 대체
  const [isFirstToday] = useState(true); // TODO: 실제 오늘 첫 문제 여부로 대체

  // Quiz.tsx에서 전달된 result 데이터
  const response = (location.state as StepCompletionResult | null) ?? {
    successRate: undefined,
    xpGained: undefined,
    durationMs: undefined,
  };

  const hasXP = typeof response.xpGained === 'number' && response.xpGained > 0;

  const resultData = {
    xpGained: response.xpGained ?? null,
    successRate: response.successRate ?? null,
    durationMs: formatDuration(response.durationMs),
  };

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
        <PointEffect key="point-effect" points={resultData.xpGained!} />
      ) : (
        <QuizResultContent
          key="result-content"
          resultData={resultData}
          isLogin={isLogin}
          isFirstToday={isFirstToday}
        />
      )}
    </AnimatePresence>
  );
};
