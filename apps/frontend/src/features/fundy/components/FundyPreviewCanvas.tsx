import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';

import { FundyLighting } from '@/feat/fundy/components/FundyLighting';
import { FundyModel } from '@/feat/fundy/components/Model';
import type { FundyAnimationConfig } from '@/feat/fundy/types';
import { FundyStoreProvider, useFundyStore } from '@/store/fundyStore';

type FundyPreviewCanvasProps = {
  initialAnimation?: Partial<FundyAnimationConfig>;
  autoHello?: boolean;
  scale?: number;
  position?: [number, number, number];
  camera?: { position?: [number, number, number]; fov?: number };
  target?: [number, number, number];
};

function FundyPreviewScene({
  autoHello = true,
  scale = 0.45,
  position = [0, 0, 0],
  camera,
  target = [0, 1, 0],
}: Omit<FundyPreviewCanvasProps, 'initialAnimation'>) {
  const animation = useFundyStore(state => state.animation);
  const { triggerHello } = useFundyStore(state => state.actions);

  useEffect(() => {
    if (!autoHello) return;
    triggerHello();
  }, [autoHello, triggerHello]);

  return (
    <Canvas
      shadows
      camera={{ position: camera?.position ?? [0, 1.1, 4.2], fov: camera?.fov ?? 40 }}
      gl={{ alpha: true }}
      style={{ background: 'transparent' }}
    >
      <FundyLighting />
      <FundyModel scale={scale} position={position} animation={animation} enhancedEyes />
      <OrbitControls makeDefault target={target} enablePan={false} enableZoom={false} />
    </Canvas>
  );
}

export function FundyPreviewCanvas({
  initialAnimation,
  autoHello = true,
  scale,
  position,
  camera,
  target,
}: FundyPreviewCanvasProps) {
  return (
    <FundyStoreProvider initialAnimation={initialAnimation}>
      <FundyPreviewScene
        autoHello={autoHello}
        scale={scale}
        position={position}
        camera={camera}
        target={target}
      />
    </FundyStoreProvider>
  );
}
