import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FoxAnimationConfig, FoxNodes } from '../types';

/**
 * 표정 및 입 모양 구성 데이터
 */
const EXPRESSION_CONFIGS = {
  smile: {
    head: { mouth_smile: 1, eyes_closed: 1, wink: 0, a: 0, o: 0 },
    eyelash: { smile: 1, wink: 0 },
    teeth: { smile: 1, a: 0, o: 0 },
    eyebrow: { a: 0 },
  },
  bigSmile: {
    head: { eyes_closed: 1, mouth_smile: 0.7, wink: 0, a: 0.8, o: 0 },
    eyelash: { smile: 1, wink: 0 },
    teeth: { smile: 0.7, a: 0.8, o: 0 },
    eyebrow: { a: 1 },
  },
  wink: {
    head: { wink: 1, mouth_smile: 0, a: 0, o: 0, eyes_closed: 0 },
    eyelash: { wink: 1, smile: 0 },
    teeth: { smile: 1, a: 0, o: 0 },
    eyebrow: { a: 1 },
  },
  open_A: {
    head: { a: 1, o: 0, mouth_smile: 0, wink: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0 },
    teeth: { a: 1, o: 0, smile: 0 },
    tongue: { a: 1 },
    eyebrow: { a: 0 },
  },
  open_O: {
    head: { a: 0, o: 1, mouth_smile: 0, wink: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0 },
    teeth: { a: 0, o: 1, smile: 0 },
    eyebrow: { a: 0 },
  },
  default: {
    head: { mouth_smile: 0, wink: 0, a: 0, o: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0 },
    teeth: { smile: 0, a: 0, o: 0 },
    eyebrow: { a: 0 },
    tongue: { a: 0 },
  },
} as const;

/**
 * Shape Key를 안전하게 설정하는 헬퍼
 */
function setMorphTarget(mesh: any, targetName: string, value: number, smooth: boolean = false) {
  if (!mesh?.morphTargetDictionary || !mesh?.morphTargetInfluences) return;

  const idx = mesh.morphTargetDictionary[targetName];
  if (idx === undefined) return;

  if (smooth) {
    mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
      mesh.morphTargetInfluences[idx] || 0,
      value,
      0.1,
    );
  } else {
    mesh.morphTargetInfluences[idx] = value;
  }
}

export function useFoxAnimation(nodes: FoxNodes, config: FoxAnimationConfig = {}) {
  const {
    waveHand = false,
    blink = false,
    lookAt = false,
    speedMultiplier = 1,
    smile = false,
    bigSmile = false,
    wagTail = false,
    wink = false,
    openMouth = false,
  } = config;

  const clockRef = useRef(0);
  const blinkState = useRef({ timer: 0, next: Math.random() * 3 + 2, isBlinking: false });
  const mouseLerp = useRef(new THREE.Vector2());

  const refs = useMemo(
    () => ({
      bones: {
        defHead: nodes['DEF-spine.006'] as THREE.Bone,

        // 몸통
        torso: nodes.torso as THREE.Bone,
        spine: nodes.spine_fk as THREE.Bone,

        // 꼬리
        tail: nodes.tail as THREE.Bone,
        tail1: nodes.tail001 as THREE.Bone,
        tail2: nodes.tail002 as THREE.Bone,
        tail3: nodes.tail003 as THREE.Bone,
        tail4: nodes.tail004 as THREE.Bone,

        // 눈썹
        browTL: nodes['brow.T.L'] as THREE.Bone,
        browTR: nodes['brow.T.R'] as THREE.Bone,
        browBL: nodes['brow.B.L'] as THREE.Bone,
        browBR: nodes['brow.B.R'] as THREE.Bone,
      },
      morphs: {
        eyelash: nodes.eyelash,
        head: nodes.head_1,
        eyebrow: nodes.eyebrow,
        teeth: nodes.teeth,
        tongue: nodes.tongue_1,
      },
    }),
    [nodes],
  );

  useFrame((state, delta) => {
    const { bones, morphs } = refs;
    if (!bones || !morphs) return;

    clockRef.current += delta * speedMultiplier;
    const time = clockRef.current;

    // ==========================================
    // 얼굴 애니메이션 및 입 모양
    // ==========================================

    let currentKey: keyof typeof EXPRESSION_CONFIGS = 'default';
    if (smile) currentKey = 'smile';
    else if (bigSmile) currentKey = 'bigSmile';
    else if (wink) currentKey = 'wink';
    else if (openMouth === 'a') currentKey = 'open_A';
    else if (openMouth === 'o') currentKey = 'open_O';

    const currentConfig = EXPRESSION_CONFIGS[currentKey];

    Object.entries(currentConfig).forEach(([meshName, targets]) => {
      const mesh = morphs[meshName as keyof typeof morphs];
      if (!mesh) return;

      Object.entries(targets).forEach(([targetName, value]) => {
        if (targetName === 'eyes_closed' && blinkState.current.isBlinking) return;
        setMorphTarget(mesh, targetName, value as number, true);
      });
    });

    // ==========================================
    // 제스처
    // ==========================================

    // 꼬리 흔들기
    if (wagTail) {
      const wag = Math.sin(time * 4);
      [bones.tail, bones.tail1, bones.tail2, bones.tail3, bones.tail4].forEach((b, i) => {
        if (b) b.rotation.y = wag * (0.3 - i * 0.05);
        b.updateMatrixWorld(true);
      });
    }

    // ==========================================
    // 눈 깜빡임
    // ==========================================

    if (blink && morphs.eyelash) {
      const s = blinkState.current;
      s.timer += delta;

      if (s.timer >= s.next) {
        const progress = (s.timer - s.next) * 10;

        if (progress < 1) {
          const t = progress;
          const blinkValue = t < 0.5 ? t * 2 : 2 - t * 2;
          const safeValue = THREE.MathUtils.lerp(0.8, 1.0, blinkValue);

          setMorphTarget(morphs.eyelash, 'closed', safeValue);
          setMorphTarget(morphs.head, 'eyes_closed', safeValue);
          s.isBlinking = true;
        } else {
          setMorphTarget(morphs.eyelash, 'closed', 0);
          setMorphTarget(morphs.head, 'eyes_closed', 0);
          s.timer = 0;
          s.next = Math.random() * 3 + 2;
          s.isBlinking = false;
        }
      }
    }

    // ==========================================
    // 시선 추적
    // ==========================================

    if (lookAt && bones.defHead) {
      const { pointer } = state;
      mouseLerp.current.lerp(pointer, 0.1);

      const targetRotationY = -mouseLerp.current.x * 0.6; // 좌우
      const targetRotationX = mouseLerp.current.y * 0.4; // 상하

      bones.defHead.rotation.y = THREE.MathUtils.lerp(
        bones.defHead.rotation.y,
        targetRotationY,
        0.1,
      );
      bones.defHead.rotation.x = THREE.MathUtils.lerp(
        bones.defHead.rotation.x,
        targetRotationX,
        0.1,
      );

      bones.defHead.updateMatrixWorld(true);
    }

    // 5. SkinnedMesh 업데이트 강제
    Object.values(nodes).forEach(node => {
      // node가 존재하고, SkinnedMesh 타입이며, skeleton 객체가 실제로 있을 때만 호출
      if (node && (node as any).isSkinnedMesh && (node as any).skeleton) {
        (node as any).skeleton.update();
      }
    });
  });

  return {
    isAnimating: !!(
      waveHand ||
      blink ||
      lookAt ||
      smile ||
      bigSmile ||
      wagTail ||
      wink ||
      openMouth
    ),
  };
}
