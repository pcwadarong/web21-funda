import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
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
          <Environment preset="studio" environmentIntensity={0.4} />
          <directionalLight
            position={[-4, 3, 10]}
            intensity={2}
            color="#b1adff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <ContactShadows opacity={0.25} scale={10} blur={3} far={4} />
          <FoxModel scale={0.5} position={[0, 0, 0]} />
        </Suspense>

        <OrbitControls makeDefault minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  );
}
