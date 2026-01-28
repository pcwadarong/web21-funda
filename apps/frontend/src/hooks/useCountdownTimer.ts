import { useEffect, useState } from 'react';

interface UseCountdownTimerParams {
  endsAt?: number | null;
  remainingSeconds?: number | null;
}

export const useCountdownTimer = ({ endsAt, remainingSeconds }: UseCountdownTimerParams) => {
  const [displaySeconds, setDisplaySeconds] = useState<number | null>(null);

  useEffect(() => {
    if (endsAt) {
      const tick = () => {
        const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
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

    setDisplaySeconds(remainingSeconds);
    const intervalId = window.setInterval(() => {
      setDisplaySeconds(prev => (prev !== null ? Math.max(0, prev - 1) : prev));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [endsAt, remainingSeconds]);

  return displaySeconds;
};
