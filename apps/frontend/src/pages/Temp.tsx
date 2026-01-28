import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';

import { FoxModel } from '@/feat/character/Fox';

export default function TempPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute' }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <FoxModel scale={0.5} position={[0, 0, 0]} />
        </Suspense>

        <OrbitControls makeDefault minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
}
