import { OrbitControls, useProgress } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type * as THREE from 'three';

import { FundyLighting } from '@/feat/fundy/components/FundyLighting';
import { FundyModel } from '@/feat/fundy/components/Model';
import type { FundyAnimationConfig, FundyIdleExpression } from '@/feat/fundy/types';
import { FundyStoreProvider, useFundyStore } from '@/store/fundyStore';

type Vec3 = [number, number, number];

type FundyPreviewCanvasProps = {
  initialAnimation?: Partial<FundyAnimationConfig>;
  autoHello?: boolean;
  autoAction?: 'hello' | 'peek' | 'fall' | 'battle' | 'trophy';
  trophyHold?: boolean;
  idleExpression?: FundyIdleExpression;
  idleExpressionHold?: boolean;
  idleExpressionDelayMs?: number;
  scale?: number;
  position?: [number, number, number];
  riseOnMount?: boolean;
  riseFromY?: number;
  riseDurationMs?: number;
  autoActionDelayMs?: number;
  enableTripleClickFall?: boolean;
  tripleClickWindowMs?: number;
  camera?: { position?: [number, number, number]; fov?: number };
  target?: [number, number, number];
};

function FundyPreviewContent({
  autoHello = true,
  autoAction,
  trophyHold,
  scale = 0.45,
  position = [0, 0, 0],
  riseOnMount = false,
  riseFromY = -1.2,
  riseDurationMs = 700,
  autoActionDelayMs = 500,
  enableTripleClickFall = true,
  tripleClickWindowMs = 700,
  target = [0, 1, 0],
}: Omit<FundyPreviewCanvasProps, 'initialAnimation' | 'camera'>) {
  const animation = useFundyStore(state => state.animation);
  const { triggerHello, triggerPeek, triggerFall, triggerBattle, triggerTrophy } = useFundyStore(
    state => state.actions,
  );
  const modelRef = useRef<THREE.Group>(null);
  const riseStartRef = useRef<number | null>(null);
  const riseDoneRef = useRef(false);
  const riseTarget = useMemo<Vec3>(() => [position[0], position[1], position[2]], [position]);
  const riseStart = useMemo<Vec3>(
    () =>
      riseOnMount ? [position[0], riseFromY, position[2]] : [position[0], position[1], position[2]],
    [position, riseFromY, riseOnMount],
  );
  const { active } = useProgress();
  const hasTriggeredRef = useRef(false);
  const lastActionKeyRef = useRef<string | null>(null);
  const triggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionKey = autoAction ?? (autoHello ? 'hello' : 'none');
  const clickTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (lastActionKeyRef.current !== actionKey) {
      lastActionKeyRef.current = actionKey;
      hasTriggeredRef.current = false;
      if (triggerTimerRef.current) {
        clearTimeout(triggerTimerRef.current);
        triggerTimerRef.current = null;
      }
    }
  }, [actionKey]);

  useEffect(() => {
    if (actionKey === 'none') return;
    if (active) return;
    if (hasTriggeredRef.current) return;
    if (triggerTimerRef.current) return;

    triggerTimerRef.current = setTimeout(
      () => {
        hasTriggeredRef.current = true;
        triggerTimerRef.current = null;

        switch (actionKey) {
          case 'peek':
            triggerPeek();
            return;
          case 'fall':
            triggerFall();
            return;
          case 'battle':
            triggerBattle();
            return;
          case 'trophy':
            triggerTrophy();
            return;
          case 'hello':
          default:
            triggerHello();
            return;
        }
      },
      Math.max(0, autoActionDelayMs),
    );

    return () => {
      if (triggerTimerRef.current) {
        clearTimeout(triggerTimerRef.current);
        triggerTimerRef.current = null;
      }
    };
  }, [
    actionKey,
    active,
    autoActionDelayMs,
    triggerHello,
    triggerPeek,
    triggerFall,
    triggerBattle,
    triggerTrophy,
  ]);

  useEffect(() => {
    if (!riseOnMount) return;
    riseStartRef.current = null;
    riseDoneRef.current = false;
    if (modelRef.current) {
      modelRef.current.position.set(riseStart[0], riseStart[1], riseStart[2]);
    }
  }, [riseOnMount, riseStart]);

  useFrame(state => {
    if (!riseOnMount) return;
    if (riseDoneRef.current) return;
    const model = modelRef.current;
    if (!model) return;

    if (riseStartRef.current === null) {
      riseStartRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - riseStartRef.current;
    const duration = Math.max(0.001, riseDurationMs / 1000);
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    model.position.set(
      riseTarget[0],
      riseStart[1] + (riseTarget[1] - riseStart[1]) * eased,
      riseTarget[2],
    );

    if (progress >= 1) {
      riseDoneRef.current = true;
    }
  });

  const handleTripleClick = useCallback(
    (event: { button?: number }) => {
      if (!enableTripleClickFall) return;
      if (event.button !== undefined && event.button !== 0) return;
      const now = performance.now();
      const windowMs = Math.max(200, tripleClickWindowMs);
      const nextTimes = clickTimesRef.current.filter(time => now - time < windowMs);
      nextTimes.push(now);
      clickTimesRef.current = nextTimes;
      if (nextTimes.length >= 3) {
        clickTimesRef.current = [];
        triggerFall();
      }
    },
    [enableTripleClickFall, triggerFall, tripleClickWindowMs],
  );

  return (
    <>
      <FundyLighting />
      <FundyModel
        ref={modelRef}
        scale={scale}
        position={riseStart}
        animation={animation}
        enhancedEyes
        trophyHold={trophyHold}
        onPointerDown={handleTripleClick}
      />
      <OrbitControls makeDefault target={target} enablePan={false} enableZoom={false} />
    </>
  );
}

function FundyPreviewScene({
  autoHello = true,
  autoAction,
  trophyHold,
  scale = 0.45,
  position = [0, 0, 0],
  riseOnMount = false,
  riseFromY = -1.2,
  riseDurationMs = 700,
  autoActionDelayMs = 500,
  enableTripleClickFall = true,
  tripleClickWindowMs = 700,
  camera,
  target = [0, 1, 0],
}: Omit<FundyPreviewCanvasProps, 'initialAnimation'>) {
  return (
    <Canvas
      frameloop="always"
      camera={{ position: camera?.position ?? [0, 1.1, 4.2], fov: camera?.fov ?? 40 }}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
      style={{ background: 'transparent' }}
    >
      <FundyPreviewContent
        autoHello={autoHello}
        autoAction={autoAction}
        trophyHold={trophyHold}
        scale={scale}
        position={position}
        riseOnMount={riseOnMount}
        riseFromY={riseFromY}
        riseDurationMs={riseDurationMs}
        autoActionDelayMs={autoActionDelayMs}
        enableTripleClickFall={enableTripleClickFall}
        tripleClickWindowMs={tripleClickWindowMs}
        target={target}
      />
    </Canvas>
  );
}

export function FundyPreviewCanvas({
  initialAnimation,
  autoHello = true,
  autoAction,
  trophyHold,
  scale,
  position,
  riseOnMount,
  riseFromY,
  riseDurationMs,
  autoActionDelayMs = 500,
  enableTripleClickFall,
  tripleClickWindowMs,
  camera,
  target,
  idleExpression,
  idleExpressionHold,
  idleExpressionDelayMs,
}: FundyPreviewCanvasProps) {
  return (
    <FundyStoreProvider
      initialAnimation={initialAnimation}
      idleExpression={idleExpression}
      idleExpressionHold={idleExpressionHold}
      idleExpressionDelayMs={idleExpressionDelayMs}
    >
      <FundyPreviewScene
        autoHello={autoHello}
        autoAction={autoAction}
        trophyHold={trophyHold}
        scale={scale}
        position={position}
        riseOnMount={riseOnMount}
        riseFromY={riseFromY}
        riseDurationMs={riseDurationMs}
        autoActionDelayMs={autoActionDelayMs}
        enableTripleClickFall={enableTripleClickFall}
        tripleClickWindowMs={tripleClickWindowMs}
        camera={camera}
        target={target}
      />
    </FundyStoreProvider>
  );
}
