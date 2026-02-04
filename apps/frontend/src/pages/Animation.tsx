import styled from '@emotion/styled';
import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useState } from 'react';

import { FoxModel } from '@/feat/character/Fox';
import { FoxLighting } from '@/feat/character/Foxlighting';
import type { FoxAnimationConfig } from '@/feat/character/types';

// -----------------------------------------------------------------------
// Constants & Types
// -----------------------------------------------------------------------

type AnimKey = keyof FoxAnimationConfig;

const FACE_EXPRESSIONS: AnimKey[] = ['smile', 'bigSmile', 'wink'];

const MOUTH_OPTIONS = [
  { key: 'openMouth', value: false, label: '다물기', icon: '🤐' },
  { key: 'openMouth', value: 'a', label: '"아" 발음', icon: '👄' },
  { key: 'openMouth', value: 'o', label: '"오" 발음', icon: '⭕' },
] as const;

const CATEGORIES = [
  {
    title: '얼굴 애니메이션',
    items: [
      { key: 'smile', value: true, label: '웃기', icon: '😊' },
      { key: 'bigSmile', value: true, label: '활짝 웃기', icon: '😆' },
      { key: 'wink', value: true, label: '윙크하기', icon: '😉' },
    ],
  },
  {
    title: '제스처',
    items: [{ key: 'wagTail', value: true, label: '꼬리 흔들기', icon: '🦊' }],
  },
  {
    title: '기타 설정',
    items: [
      { key: 'blink', value: true, label: '눈 깜빡임 자동', icon: '👁️' },
      { key: 'lookAt', value: true, label: '시선 추적', icon: '👀' },
    ],
  },
] as const;

export function FoxAnimation() {
  const [animation, setAnimation] = useState<FoxAnimationConfig>({
    waveHand: false,
    blink: false,
    lookAt: false,
    autoRotate: false,
    speedMultiplier: 1,
    smile: false,
    bigSmile: false,
    wink: false,
    wiggleHips: false,
    wagTail: false,
    wiggleEars: false,
    openMouth: false,
  });

  const updateAnim = useCallback((key: AnimKey, value: FoxAnimationConfig[AnimKey]) => {
    setAnimation(prev => {
      const next = { ...prev, [key]: value };
      const setFaceExpression = (k: AnimKey, val: boolean) => {
        (next as Record<AnimKey, number | boolean>)[k] = val;
      };

      // 배타적 얼굴 표정 로직
      if (FACE_EXPRESSIONS.includes(key) && value === true) {
        FACE_EXPRESSIONS.forEach(k => {
          setFaceExpression(k, k === key);
        });
        next.openMouth = false;
        next.blink = false;
      }

      // 입 모양 변경 시 표정 초기화
      if (key === 'openMouth' && value !== false)
        FACE_EXPRESSIONS.forEach(k => setFaceExpression(k, false));

      // 자동 깜빡임 활성화 시 표정 초기화
      if (key === 'blink' && value === true)
        FACE_EXPRESSIONS.forEach(k => setFaceExpression(k, false));

      return next;
    });
  }, []);

  const speedValue = animation.speedMultiplier ?? 1;

  return (
    <div
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
      role="region"
      aria-label="Fox 캐릭터 애니메이션 컨트롤"
    >
      <ControlPanel role="group" aria-label="Fox Controller">
        <div
          style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}
          aria-hidden="true"
        >
          🦊 Fox Controller
        </div>

        {CATEGORIES.map(cat => (
          <Section key={cat.title} role="group" aria-label={cat.title}>
            <SectionTitle>{cat.title}</SectionTitle>
            {cat.items.map(item => (
              <ControlLabel key={item.key}>
                <input
                  type="checkbox"
                  checked={!!animation[item.key]}
                  onChange={e => updateAnim(item.key, e.target.checked)}
                  aria-label={item.label}
                />
                {item.icon} {item.label}
              </ControlLabel>
            ))}
          </Section>
        ))}

        <Section role="group" aria-label="입 모양">
          <SectionTitle>입 모양</SectionTitle>
          {MOUTH_OPTIONS.map(opt => (
            <ControlLabel key={String(opt.value)}>
              <input
                type="radio"
                name="mouth"
                checked={animation.openMouth === opt.value}
                onChange={() => updateAnim('openMouth', opt.value)}
                aria-label={opt.label}
              />
              {opt.icon} {opt.label}
            </ControlLabel>
          ))}
        </Section>

        <Section role="group" aria-label="속도 조절">
          <SectionTitle>속도 조절 ({(animation.speedMultiplier ?? 1).toFixed(1)}x)</SectionTitle>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={speedValue}
            onChange={e => updateAnim('speedMultiplier', parseFloat(e.target.value))}
            style={{ width: '100%' }}
            aria-valuenow={speedValue}
            aria-valuemin={0.1}
            aria-valuemax={2}
            aria-label={`속도 ${speedValue.toFixed(1)}배`}
          />
        </Section>
      </ControlPanel>

      <Canvas shadows camera={{ position: [0, 1.2, 5], fov: 45 }}>
        <Suspense fallback={null}>
          <FoxLighting />
          <FoxModel scale={0.5} position={[0, 0, 0]} animation={animation} enhancedEyes={true} />
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

// -----------------------------------------------------------------------
// Styled Components
// -----------------------------------------------------------------------

const ControlPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  width: 260px;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  font-family: 'system-ui', sans-serif;
  font-size: 13px;
`;

const Section = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #333;
`;

const ControlLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    opacity: 0.7;
  }
  input {
    cursor: pointer;
    margin: 0;
  }
`;
