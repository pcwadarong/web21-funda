import { OrbitControls, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { FundyLighting } from '@/feat/fundy/components/FundyLighting';
import { FundyModel } from '@/feat/fundy/components/Model';
import type { FundyAnimationConfig, FundyIdleExpression } from '@/feat/fundy/types';
import { FundyStoreProvider, useFundyStore } from '@/store/fundyStore';

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
  camera?: { position?: [number, number, number]; fov?: number };
  target?: [number, number, number];
};

function FundyPreviewScene({
  autoHello = true,
  autoAction,
  trophyHold,
  scale = 0.45,
  position = [0, 0, 0],
  camera,
  target = [0, 1, 0],
}: Omit<FundyPreviewCanvasProps, 'initialAnimation'>) {
  const animation = useFundyStore(state => state.animation);
  const { triggerHello, triggerPeek, triggerFall, triggerBattle, triggerTrophy } = useFundyStore(
    state => state.actions,
  );
  const { active } = useProgress();
  const hasTriggeredRef = useRef(false);
  const lastActionKeyRef = useRef<string | null>(null);
  const actionKey = autoAction ?? (autoHello ? 'hello' : 'none');

  useEffect(() => {
    if (lastActionKeyRef.current !== actionKey) {
      lastActionKeyRef.current = actionKey;
      hasTriggeredRef.current = false;
    }
  }, [actionKey]);

  useEffect(() => {
    if (actionKey === 'none') return;
    if (active) return;
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

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
  }, [actionKey, active, triggerHello, triggerPeek, triggerFall, triggerBattle, triggerTrophy]);

  return (
    <Canvas
      shadows
      camera={{ position: camera?.position ?? [0, 1.1, 4.2], fov: camera?.fov ?? 40 }}
      gl={{ alpha: true }}
      style={{ background: 'transparent' }}
    >
      <FundyLighting />
      <FundyModel
        scale={scale}
        position={position}
        animation={animation}
        enhancedEyes
        trophyHold={trophyHold}
      />
      <OrbitControls makeDefault target={target} enablePan={false} enableZoom={false} />
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
        camera={camera}
        target={target}
      />
    </FundyStoreProvider>
  );
}
