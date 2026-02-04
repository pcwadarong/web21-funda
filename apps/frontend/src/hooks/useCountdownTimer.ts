import { useEffect, useState } from 'react';

interface UseCountdownTimerParams {
  endsAt?: number | null;
  serverTime: number;
}

export const useCountdownTimer = ({ endsAt, serverTime }: UseCountdownTimerParams) => {
  const [displaySeconds, setDisplaySeconds] = useState<number | null>(null);

  useEffect(() => {
    const hasValidEndsAt = typeof endsAt === 'number' && Number.isFinite(endsAt) && endsAt > 0;
    const hasValidServerTime =
      typeof serverTime === 'number' && Number.isFinite(serverTime) && serverTime > 0;

    if (hasValidEndsAt && hasValidServerTime) {
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
  }, [endsAt, serverTime]);

  return displaySeconds;
};
