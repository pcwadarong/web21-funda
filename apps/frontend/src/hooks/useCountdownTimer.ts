import { useEffect, useState } from 'react';

interface UseCountdownTimerParams {
  endsAt?: number | null;
  remainingSeconds?: number | null;
  serverTime: number;
}

export const useCountdownTimer = ({
  endsAt,
  remainingSeconds,
  serverTime,
}: UseCountdownTimerParams) => {
  const [displaySeconds, setDisplaySeconds] = useState<number | null>(null);

  useEffect(() => {
    if (endsAt) {
      // 서버 시간과 클라이언트 시간의 offset 계산
      const offset = serverTime - Date.now();

      const tick = () => {
        // 서버 기준 현재 시각 (클라이언트 시각 + offset)
        const secondsLeft = Math.max(0, Math.ceil((endsAt - (Date.now() + offset)) / 1000));
        setDisplaySeconds(secondsLeft);
      };

      tick();
      const intervalId = window.setInterval(tick, 1000);
      return () => window.clearInterval(intervalId);
    }

    if (remainingSeconds === undefined || remainingSeconds === null) {
      setDisplaySeconds(null);
      return;
    }

    // endsAt이 없거나, 누락되었으면 remainingSeconds로 fallback
    setDisplaySeconds(remainingSeconds);
    const intervalId = window.setInterval(() => {
      setDisplaySeconds(prev => (prev !== null ? Math.max(0, prev - 1) : prev));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [endsAt, remainingSeconds, serverTime]);

  return displaySeconds;
};
