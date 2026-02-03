import { useEffect, useRef, useState } from 'react';

export const useAnimatedNumber = (value: number, durationMs = 600) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = value;

    if (from === to) {
      setDisplayValue(value);
      return;
    }

    const step = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }
      const progress = Math.min(1, (timestamp - startRef.current) / durationMs);
      const next = Math.round(from + (to - from) * progress);
      setDisplayValue(next);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(step);
      } else {
        prevValueRef.current = to;
        startRef.current = null;
      }
    };

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, durationMs]);

  return displayValue;
};
