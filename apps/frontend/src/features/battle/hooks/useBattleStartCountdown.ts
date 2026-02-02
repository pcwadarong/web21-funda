import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_INTERVAL_MS = 1000;

/**
 * 배틀 시작 카운트다운 진행 상태를 관리한다.
 *
 * - 첫 퀴즈 진입 시 한 번만 동작하도록 설계
 * - 외부에서 라벨 변경 시점을 제어할 수 있도록 인터벌을 분리
 */
export const useBattleStartCountdown = ({
  isActive,
  intervalMs = DEFAULT_INTERVAL_MS,
  steps: customSteps,
  onTick,
  onComplete,
}: {
  isActive: boolean;
  intervalMs?: number;
  steps?: string[];
  onTick?: (label: string) => void;
  onComplete?: () => void;
}) => {
  const steps = useMemo(() => customSteps ?? ['3', '2', '1', 'START'], [customSteps]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!isActive || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setCurrentIndex(0);
    setIsVisible(true);
  }, [isActive]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const currentLabel = steps[currentIndex];
    onTick?.(currentLabel);

    if (currentIndex >= steps.length - 1) {
      const hideTimer = window.setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, intervalMs);

      return () => window.clearTimeout(hideTimer);
    }

    const timerId = window.setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, intervalMs);

    return () => window.clearTimeout(timerId);
  }, [currentIndex, intervalMs, isVisible, onComplete, onTick, steps]);

  return {
    isVisible,
    label: steps[currentIndex],
  };
};
