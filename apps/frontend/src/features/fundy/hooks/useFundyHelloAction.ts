import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useFundyStore } from '@/store/fundyStore';

const getIdleExpressionConfig = (expression: string) => {
  const reset = {
    smile: false,
    smileSoft: false,
    bigSmile: false,
    wink: false,
    angry: false,
    openMouth: false as const,
  };

  switch (expression) {
    case 'smileSoft':
      return { ...reset, smileSoft: true };
    case 'wink':
      return { ...reset, wink: true };
    case 'smileEyesClosed':
      return { ...reset, smile: true };
    case 'smileOpenBig':
      return { ...reset, bigSmile: true };
    case 'open_O':
      return { ...reset, openMouth: 'o' as const };
    case 'open_A':
      return { ...reset, openMouth: 'a' as const };
    case 'angry':
      return { ...reset, angry: true };
    default:
      return reset;
  }
};

export function useFundyHelloAction(params: {
  helloAction?: number;
  lookAt?: boolean;
  helloActionClip?: THREE.AnimationAction | null;
  actionTrigger?: number;
  actionClip?: THREE.AnimationAction | null;
  debugName?: string;
  idleExpressionOverride?: string;
  forceIdleExpressionOverride?: boolean;
  idleExpressionHoldOverride?: boolean;
  idleExpressionDelayMsOverride?: number;
  resetClips?: Array<THREE.AnimationAction | null | undefined>;
}) {
  const { setActionLocked, setSystemAnimation } = useFundyStore(state => state.actions);
  const idleExpression = useFundyStore(state => state.idleExpression);
  const idleExpressionHold = useFundyStore(state => state.idleExpressionHold);
  const idleExpressionDelayMs = useFundyStore(state => state.idleExpressionDelayMs);
  const forceActionRelease = useFundyStore(state => state.forceActionRelease);
  const idleExpressionRef = useRef(idleExpression);
  const idleExpressionHoldRef = useRef(idleExpressionHold);
  const idleExpressionDelayMsRef = useRef(idleExpressionDelayMs);
  const forceActionReleaseRef = useRef(forceActionRelease);
  const lastPlayedRef = useRef<number>(0);
  const pendingHelloRef = useRef<number | undefined>(undefined);
  const prevLookAtRef = useRef<boolean | undefined>(undefined);
  const isPlayingRef = useRef(false);
  const cleanedRef = useRef(false);

  useEffect(() => {
    idleExpressionRef.current = idleExpression;
    idleExpressionHoldRef.current = idleExpressionHold;
    idleExpressionDelayMsRef.current = idleExpressionDelayMs;
    forceActionReleaseRef.current = forceActionRelease;
  }, [idleExpression, idleExpressionHold, idleExpressionDelayMs, forceActionRelease]);

  useEffect(() => {
    const trigger = params.actionTrigger ?? params.helloAction ?? 0;

    if (trigger === 0) return;

    // clip 준비 전 트리거가 들어오면 보관
    if (!params.actionClip && !params.helloActionClip) {
      if (trigger !== lastPlayedRef.current) pendingHelloRef.current = trigger;
      return;
    }
  }, [params.actionTrigger, params.helloAction, params.actionClip, params.helloActionClip]);

  useEffect(() => {
    const hello = params.actionClip ?? params.helloActionClip;
    if (!hello) return;

    const trigger = params.actionTrigger ?? params.helloAction ?? 0;
    if (trigger === 0 && !pendingHelloRef.current) return;

    const baseExpression = idleExpressionRef.current;
    const baseHold = idleExpressionHoldRef.current ?? false;
    const overrideExpression = params.idleExpressionOverride;
    const canOverride =
      overrideExpression &&
      (params.forceIdleExpressionOverride === true || baseExpression === 'default');
    const resolvedExpression = canOverride ? overrideExpression : baseExpression;
    const resolvedDelay =
      params.idleExpressionDelayMsOverride ?? idleExpressionDelayMsRef.current ?? 0;
    const holdOverride = params.idleExpressionHoldOverride;
    const shouldHoldOverride = holdOverride === true;
    const postHold =
      forceActionReleaseRef.current === true
        ? false
        : holdOverride === false
          ? baseHold
          : shouldHoldOverride || baseHold;
    const postExpression = shouldHoldOverride ? resolvedExpression : baseExpression;

    const effectiveTrigger =
      pendingHelloRef.current && pendingHelloRef.current > lastPlayedRef.current
        ? pendingHelloRef.current
        : trigger;

    if (effectiveTrigger === lastPlayedRef.current) return;
    pendingHelloRef.current = undefined;
    lastPlayedRef.current = effectiveTrigger;

    // 1. 기존 상태 백업 및 잠금
    setActionLocked(true);
    prevLookAtRef.current = params.lookAt;
    isPlayingRef.current = true;
    cleanedRef.current = false;

    // 2. 다른 액션 정리
    if (params.resetClips?.length) {
      params.resetClips.forEach(action => {
        if (!action || action === hello) return;
        action.stop();
        action.reset();
        action.enabled = true;
        action.paused = false;
      });
    }

    // 3. 다른 시스템 애니메이션 중단 (표정 겹침 방지)
    const resetExpression = getIdleExpressionConfig('default');
    setSystemAnimation({ lookAt: false });
    setSystemAnimation({ blink: false });
    setSystemAnimation(resetExpression);

    // 4. 애니메이션 실행
    hello.reset();
    hello.setLoop(THREE.LoopOnce, 1);
    hello.clampWhenFinished = true;
    hello.fadeIn(0.15);
    hello.play();

    const mixer = hello.getMixer();
    let smileTimer: ReturnType<typeof setTimeout> | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const handleFinished = (e: any) => {
      if (e.action !== hello) return;
      cleanup();
    };

    const cleanup = () => {
      if (cleanedRef.current) return;
      cleanedRef.current = true;
      isPlayingRef.current = false;
      setActionLocked(false);
      if (prevLookAtRef.current !== undefined) {
        setSystemAnimation({ lookAt: prevLookAtRef.current });
      }
      if (postHold) setSystemAnimation(getIdleExpressionConfig(postExpression));
      else setSystemAnimation(resetExpression);
      setSystemAnimation({ blink: true });
      mixer.removeEventListener('finished', handleFinished);
      if (smileTimer) clearTimeout(smileTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
    };

    mixer.addEventListener('finished', handleFinished);

    // 액션 도중 특정 시점에 표정 변화 (store 기준)
    smileTimer = setTimeout(() => {
      if (resolvedExpression !== 'default') {
        setSystemAnimation(getIdleExpressionConfig(resolvedExpression));
      }
    }, resolvedDelay);

    safetyTimer = setTimeout(cleanup, (hello.getClip().duration ?? 0) * 1000 + 200);

    return () => {
      mixer.removeEventListener('finished', handleFinished);
      if (smileTimer) clearTimeout(smileTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (isPlayingRef.current) cleanup();
    };
  }, [
    params.actionTrigger,
    params.helloAction,
    params.actionClip,
    params.helloActionClip,
    params.idleExpressionOverride,
    params.idleExpressionHoldOverride,
    params.idleExpressionDelayMsOverride,
    params.forceIdleExpressionOverride,
    params.resetClips,
    setActionLocked,
    setSystemAnimation,
  ]);
}
