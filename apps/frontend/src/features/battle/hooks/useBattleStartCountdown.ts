import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_INTERVAL_MS = 1000;
const COUNTDOWN_POLL_MS = 100;

/**
 * 배틀 시작 카운트다운 진행 상태를 관리한다.
 *
 * - endsAt 기준으로 라벨을 계산해 네트워크 지연에도 동일한 타이밍을 보장한다.
 * - 카운트다운이 끝나면 자동으로 숨기고 완료 콜백을 호출한다.
 */
export const useBattleStartCountdown = ({
  endsAt,
  intervalMs = DEFAULT_INTERVAL_MS,
  steps: customSteps,
  onTick,
  onComplete,
}: {
  endsAt: number | null;
  intervalMs?: number;
  steps?: string[];
  onTick?: (label: string) => void;
  onComplete?: () => void;
}) => {
  const steps = useMemo(() => {
    const baseSteps = customSteps ?? ['3', '2', '1', 'START'];
    return baseSteps.length > 0 ? baseSteps : ['START'];
  }, [customSteps]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const lastLabelRef = useRef<string | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;
    lastLabelRef.current = null;
  }, [endsAt]);

  useEffect(() => {
    if (!endsAt) {
      setIsVisible(false);
      return;
    }

    const totalDurationMs = steps.length * intervalMs;
    const startAt = endsAt - totalDurationMs;

    const updateCountdown = () => {
      const now = Date.now();

      if (now < startAt) {
        setIsVisible(false);
        return;
      }

      if (now >= endsAt) {
        setIsVisible(false);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onComplete?.();
        }
        return;
      }

      const elapsedMs = now - startAt;
      const nextIndex = Math.min(steps.length - 1, Math.floor(elapsedMs / intervalMs));
      const nextLabel = steps[nextIndex] ?? steps[0] ?? '';

      setCurrentIndex(nextIndex);
      setIsVisible(true);

      if (nextLabel !== lastLabelRef.current) {
        lastLabelRef.current = nextLabel;
        onTick?.(nextLabel);
      }
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, COUNTDOWN_POLL_MS);

    return () => window.clearInterval(timerId);
  }, [endsAt, intervalMs, onComplete, onTick, steps]);

  return {
    isVisible,
    label: steps[currentIndex] ?? steps[0] ?? '',
  };
};
