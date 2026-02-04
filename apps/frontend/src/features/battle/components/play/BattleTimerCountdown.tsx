import type { Theme } from '@emotion/react';
import { css, useTheme } from '@emotion/react';
import { useEffect, useRef } from 'react';

import timerSound from '@/assets/audio/timer.mp3';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { useSound } from '@/hooks/useSound';
import { useBattleStore } from '@/store/battleStore';

/**
 * 배틀 타이머 카운트다운을 표시합니다.
 *
 * @param params props
 * @param params.isResultPhase 결과 단계 여부
 * @param params.isForHeader 헤더 표시 여부 (`mm:ss`)
 * @returns 헤더/본문 타이머 UI(또는 `null`)
 */
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

  /** 문제 전환/단계 전환 시 사운드 상태 초기화 */
  useEffect(() => {
    lastPlayedSecond.current = null;
    prevSecondsRef.current = null;
  }, [endsAt, isResultPhase]);

  /** 감소 중이고 3초가 되는 순간에만 1회 재생 */
  useEffect(() => {
    if (displaySeconds === null || isResultPhase) {
      lastPlayedSecond.current = null;
      prevSecondsRef.current = null;
      return;
    }

    const isCountingDown =
      prevSecondsRef.current !== null && displaySeconds < prevSecondsRef.current;

    if (displaySeconds === 3 && lastPlayedSecond.current !== displaySeconds && isCountingDown) {
      playSound({ src: timerSound, currentTime: 0, volume: 0.5 });
      lastPlayedSecond.current = displaySeconds;
    }

    prevSecondsRef.current = displaySeconds;
  }, [playSound, displaySeconds, isResultPhase]);

  /** 아직 계산 전이면 헤더는 `--:--`, 그 외는 숨김 */
  if (displaySeconds === null) {
    return isForHeader ? <div css={timerPlaceholderStyle(theme)}>--:--</div> : null;
  }

  return isForHeader ? (
    <div css={timerStyle(theme, displaySeconds)}>{formatTimer(displaySeconds)}</div>
  ) : (
    <span>{displaySeconds}</span>
  );
};

/**
 * 초(second)를 `mm:ss`로 변환합니다.
 * @param totalSeconds 총 초
 * @returns `mm:ss`
 */
const formatTimer = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * 헤더 타이머 스타일.
 * @param theme 테마
 * @param seconds 남은 초
 * @returns Emotion 스타일
 */
const timerStyle = (theme: Theme, seconds: number) => css`
  min-width: 55px;
  font-size: ${theme.typography['24Bold'].fontSize};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${seconds <= 3 ? theme.colors.error.main : theme.colors.primary.main};
  ${timerJiggleKeyframes};
  ${seconds > 0 && seconds <= 3 ? 'animation: timer-jiggle 0.6s ease-in-out infinite;' : ''}
`;

/**
 * 헤더 플레이스홀더(`--:--`) 스타일.
 * @param theme 테마
 * @returns Emotion 스타일
 */
const timerPlaceholderStyle = (theme: Theme) => css`
  min-width: 55px;
  font-size: ${theme.typography['24Bold'].fontSize};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${theme.colors.text.weak};
`;

/** 3초 이하에서 적용되는 흔들림 애니메이션 */
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
