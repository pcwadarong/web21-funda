import { ContactShadows, Environment } from '@react-three/drei';

/**
 * 여우 캐릭터 전용 조명 설정
 */
export function FundyLighting() {
  return (
    <>
      {/* HDR 환경광 (반사 및 간접조명) */}
      <Environment preset="studio" environmentIntensity={0.4} />

      {/* Key Light - 메인 조명 (정면 약간 위) */}
      <directionalLight
        position={[-4, 3, 10]}
        intensity={2}
        color="#b1adff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* 부드러운 그림자 */}
      <ContactShadows opacity={0.2} scale={8} blur={2.5} far={4} />
    </>
  );
}
