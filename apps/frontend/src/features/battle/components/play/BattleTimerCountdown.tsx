import type { Theme } from '@emotion/react';
import { css, useTheme } from '@emotion/react';
import { useEffect, useRef } from 'react';

import timerSound from '@/assets/audio/timer.mp3';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { useSound } from '@/hooks/useSound';
import { useBattleStore } from '@/store/battleStore';

export const BattleTimerCountdown = ({
  isResultPhase,
  isForHeader = false,
}: {
  isResultPhase: boolean;
  isForHeader?: boolean;
}) => {
  const theme = useTheme();

  const { playSound } = useSound();

  const endsAt = useBattleStore(state => (isResultPhase ? state.resultEndsAt : state.quizEndsAt));
  const serverTime = useBattleStore(state => state.serverTime);
  const displaySeconds = useCountdownTimer({ endsAt, serverTime });

  const lastPlayedSecond = useRef<number | null>(null);

  const prevSecondsRef = useRef<number | null>(null);

  useEffect(() => {
    if (displaySeconds === null || isResultPhase) {
      lastPlayedSecond.current = null;
      prevSecondsRef.current = null;
      return;
    }

    const isCountingDown =
      prevSecondsRef.current !== null && displaySeconds < prevSecondsRef.current;

    if (
      displaySeconds > 0 &&
      displaySeconds <= 3 &&
      lastPlayedSecond.current !== displaySeconds &&
      isCountingDown
    ) {
      playSound({ src: timerSound, currentTime: 0, volume: 0.5 });
      lastPlayedSecond.current = displaySeconds;
    }

    prevSecondsRef.current = displaySeconds;
  }, [playSound, displaySeconds, isResultPhase]);

  if (displaySeconds === null) {
    return isForHeader ? <div css={timerPlaceholderStyle(theme)}>--:--</div> : null;
  }

  return isForHeader ? (
    <div css={timerStyle(theme, displaySeconds)}>{formatTimer(displaySeconds)}</div>
  ) : (
    <span>{displaySeconds}</span>
  );
};

const formatTimer = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const timerStyle = (theme: Theme, seconds: number) => css`
  min-width: 55px;
  font-size: ${theme.typography['24Bold'].fontSize};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${seconds <= 3 ? theme.colors.error.main : theme.colors.primary.main};
  ${timerJiggleKeyframes};
  ${seconds > 0 && seconds <= 3 ? 'animation: timer-jiggle 0.6s ease-in-out infinite;' : ''}
`;

const timerPlaceholderStyle = (theme: Theme) => css`
  min-width: 55px;
  font-size: ${theme.typography['24Bold'].fontSize};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${theme.colors.text.weak};
`;

const timerJiggleKeyframes = css`
  @keyframes timer-jiggle {
    0% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-2px);
    }
    40% {
      transform: translateX(2px);
    }
    60% {
      transform: translateX(-2px);
    }
    80% {
      transform: translateX(2px);
    }
    100% {
      transform: translateX(0);
    }
  }
`;
