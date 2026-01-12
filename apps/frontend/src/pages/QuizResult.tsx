import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { PointEffect } from '@/feat/quiz/components/PointEffect';
import { QuizResultContent } from '@/feat/quiz/components/QuizResultContent';
import { formatDuration } from '@/feat/quiz/utils/formatDuration';

// TODO: FETCH
const response = {
  successRate: 30,
  xpGained: undefined,
  durationMs: 270000,
} as const;

export const QuizResult = () => {
  const [showPointEffect, setShowPointEffect] = useState(true);
  const [isLogin] = useState(false); // TODO: 실제 로그인 상태로 대체
  const [isFirstToday] = useState(true); // TODO: 실제 오늘 첫 문제 여부로 대체

  const hasXP = typeof response.xpGained === 'number';

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

  console.log(response);
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
