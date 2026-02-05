import { OrbitControls, Stats, useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';

import { Loading } from '@/comp/Loading';
import { FundyControllerContainer } from '@/feat/fundy/components/FundyControllerContainer';
import { FundyLighting } from '@/feat/fundy/components/FundyLighting';
import { FundyModel } from '@/feat/fundy/components/Model';
import type { FundyAnimationConfig } from '@/feat/fundy/types';

export function PlayWithFundy() {
  const { active } = useProgress();
  const [showOverlay, setShowOverlay] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
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

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (active) {
      setShowOverlay(true);
      setIsFadingOut(false);
    } else if (showOverlay) {
      setIsFadingOut(true);
      timeoutId = setTimeout(() => {
        setShowOverlay(false);
        setIsFadingOut(false);
      }, 200);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [active, showOverlay]);

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
      {showOverlay && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            opacity: isFadingOut ? 0 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          <Loading />
        </div>
      )}
    </div>
  );
}
