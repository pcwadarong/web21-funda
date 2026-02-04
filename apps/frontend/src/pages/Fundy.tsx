import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';

import { FundyControllerContainer } from '@/feat/fundy/components/FundyControllerContainer';
import { FundyLighting } from '@/feat/fundy/components/FundyLighting';
import { FundyModel } from '@/feat/fundy/components/Model';
import type { FundyAnimationConfig } from '@/feat/fundy/types';

export function PlayWithFundy() {
  const [animation, setAnimation] = useState<FundyAnimationConfig>({
    blink: false,
    lookAt: false,
    helloAction: 0,
    speedMultiplier: 1,
    smile: false,
    bigSmile: false,
    wink: false,
    openMouth: false,
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <FundyControllerContainer animation={animation} setAnimation={setAnimation} />

      <Canvas shadows camera={{ position: [0, 1.2, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <FundyLighting />
          <FundyModel scale={0.5} position={[0, 0, 0]} animation={animation} enhancedEyes={true} />
          <OrbitControls
            makeDefault
            target={[0, 0.8, 0]}
            minDistance={2}
            maxDistance={10}
            enablePan={false}
          />
        </Suspense>
        {process.env.NODE_ENV === 'development' && <Stats />}
      </Canvas>
    </div>
  );
}
