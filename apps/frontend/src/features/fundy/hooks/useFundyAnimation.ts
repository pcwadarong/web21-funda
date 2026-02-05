import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FundyAnimationConfig, FundyNodes } from '../types';

/**
 * 얼굴 애니메이션 구성 데이터
 */
const EXPRESSION_CONFIGS = {
  smileSoft: {
    head: { mouth_smile: 1, eyes_closed: 0, wink: 0, a: 0, o: 0 },
    eyelash: { bigger: 1, wink: 0 },
    teeth: { smile: 1, a: 0, o: 0 },
    eyebrow: { up: 0, wink: 0, down: 0 },
  },
  smileEyesClosed: {
    head: { mouth_smile: 1, eyes_closed: 1, wink: 0, a: 0, o: 0 },
    eyelash: { smile: 1, wink: 0, bigger: 0 },
    teeth: { smile: 1, a: 0, o: 0 },
    eyebrow: { up: 0, wink: 0, down: 0 },
  },
  smileOpenBig: {
    head: { eyes_closed: 1, mouth_smile: 0.7, wink: 0, a: 0.8, o: 0 },
    eyelash: { smile: 1, wink: 0, bigger: 0 },
    teeth: { smile: 0.7, a: 0.8, o: 0 },
    eyebrow: { up: 1, wink: 0, down: 0 },
  },
  wink: {
    head: { wink: 1, mouth_smile: 0, a: 0, o: 0, eyes_closed: 0 },
    eyelash: { wink: 1, smile: 0, bigger: 0 },
    teeth: { smile: 1, a: 0, o: 0 },
    eyebrow: { up: 0, wink: 1, down: 0 },
  },
  open_A: {
    head: { a: 1, o: 0, mouth_smile: 0, wink: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0, bigger: 0 },
    teeth: { a: 1, o: 0, smile: 0 },
    tongue: { a: 1 },
    eyebrow: { up: 0, wink: 0, down: 0 },
  },
  open_O: {
    head: { a: 0, o: 1, mouth_smile: 0, wink: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0, bigger: 0 },
    teeth: { a: 0, o: 1, smile: 0 },
    eyebrow: { up: 0, wink: 0, down: 0 },
  },
  default: {
    head: { mouth_smile: 0, wink: 0, a: 0, o: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0, bigger: 0 },
    teeth: { smile: 0, a: 0, o: 0 },
    eyebrow: { up: 0, wink: 0, down: 0 },
    tongue: { a: 0 },
  },
} as const;

/**
 * Shape Key를 안전하게 설정하는 헬퍼
 * @param mesh - Morph 대상 Mesh
 * @param targetName - Morph 타겟 이름
 * @param value - 설정할 influence 값
 * @param smooth - 부드러운 LERP 전환 여부
 */
function setMorphTarget(mesh: any, targetName: string, value: number, smooth: boolean = false) {
  if (!mesh?.morphTargetDictionary || !mesh?.morphTargetInfluences) return;
  const idx = mesh.morphTargetDictionary[targetName];
  if (idx === undefined) return;

  // 부드럽게 보간하거나 즉시 설정
  mesh.morphTargetInfluences[idx] = smooth
    ? THREE.MathUtils.lerp(mesh.morphTargetInfluences[idx] || 0, value, 0.1)
    : value;
}

/**
 * Fundy 얼굴 애니메이션 훅
 * @param nodes - 모델 노드들
 * @param config - 애니메이션 설정
 */
export function useFundyAnimation(nodes: FundyNodes, config: FundyAnimationConfig = {}) {
  const {
    blink = false,
    lookAt = false,
    speedMultiplier = 1,
    smile = false,
    smileSoft = false,
    bigSmile = false,
    wink = false,
    openMouth = false,
  } = config;

  const clockRef = useRef(0);
  const blinkState = useRef({ timer: 0, next: Math.random() * 3 + 2, isBlinking: false });
  const mouseLerp = useRef(new THREE.Vector2());

  // 머리 및 눈의 초기 회전값 기억
  const restRotations = useRef({
    ready: false,
    head: undefined as THREE.Euler | undefined,
    eyeL: undefined as THREE.Euler | undefined,
    eyeR: undefined as THREE.Euler | undefined,
  });

  const refs = useMemo(() => {
    const asBone = (node?: THREE.Object3D | null) =>
      node && (node as THREE.Bone).isBone ? (node as THREE.Bone) : undefined;

    const pick = <T>(...values: Array<T | undefined | null>) =>
      values.find(Boolean) as T | undefined;

    return {
      bones: {
        defHead: asBone(
          pick(
            nodes['DEF-spine006'],
            nodes['DEF-spine005'],
            nodes['DEF-spine004'],
            nodes['DEF-spine003'],
            nodes['DEF-spine002'],
            nodes['DEF-spine001'],
            nodes['DEF-spine'],
          ),
        ),
        eyeL: asBone(pick(nodes['DEF-eye_masterL'], nodes['DEF-eyeL'])),
        eyeR: asBone(pick(nodes['DEF-eye_masterR'], nodes['DEF-eyeR'])),
      },
      morphs: {
        eyelash: nodes.eyelash,
        head: nodes.head,
        eyebrow: nodes.eyebrow,
        teeth: nodes.teeth,
        tongue: nodes.tongue,
      },
    };
  }, [nodes]);

  useFrame((state, delta) => {
    const { bones, morphs } = refs;
    if (!morphs) return;

    clockRef.current += delta * speedMultiplier;

    // ==========================================
    // 얼굴 애니메이션 및 입 모양
    // ==========================================

    let currentKey: keyof typeof EXPRESSION_CONFIGS = 'default';
    if (smileSoft) currentKey = 'smileSoft';
    else if (smile) currentKey = 'smileEyesClosed';
    else if (bigSmile) currentKey = 'smileOpenBig';
    else if (wink) currentKey = 'wink';
    else if (openMouth === 'a') currentKey = 'open_A';
    else if (openMouth === 'o') currentKey = 'open_O';

    // 표정에 따른 morph target 반영
    const currentConfig = EXPRESSION_CONFIGS[currentKey];

    Object.entries(currentConfig).forEach(([meshName, targets]) => {
      const mesh = morphs[meshName as keyof typeof morphs];
      if (!mesh) return;

      Object.entries(targets).forEach(([targetName, value]) => {
        // 깜빡이는 중일 때는 eyes_closed 무시
        if (targetName === 'eyes_closed' && blinkState.current.isBlinking) return;
        setMorphTarget(mesh, targetName, value as number, true);
      });
    });

    // ==========================================
    // 눈 깜빡임
    // ==========================================

    if (blink && morphs.eyelash) {
      const s = blinkState.current;
      s.timer += delta;

      if (s.timer >= s.next) {
        const progress = (s.timer - s.next) * 8;

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

    // 회전 기준값 초기 저장
    if (!restRotations.current.ready) {
      if (bones.defHead || bones.eyeL || bones.eyeR) {
        restRotations.current = {
          ready: true,
          head: bones.defHead?.rotation.clone(),
          eyeL: bones.eyeL?.rotation.clone(),
          eyeR: bones.eyeR?.rotation.clone(),
        };
      }
    }

    // 마우스 따라 시선 회전
    if (lookAt) {
      const { pointer } = state;
      mouseLerp.current.lerp(pointer, 0.1);

      const headRotationY = mouseLerp.current.x * 0.6; // 좌우 (방향 반전)
      const headRotationX = -mouseLerp.current.y * 0.4; // 상하 (방향 반전)
      const eyeRotationY = mouseLerp.current.x * 0.9;
      const eyeRotationX = -mouseLerp.current.y * 0.6;

      if (bones.defHead) {
        bones.defHead.rotation.y = THREE.MathUtils.lerp(
          bones.defHead.rotation.y,
          headRotationY,
          0.1,
        );
        bones.defHead.rotation.x = THREE.MathUtils.lerp(
          bones.defHead.rotation.x,
          headRotationX,
          0.1,
        );
        bones.defHead.updateMatrixWorld(true);

        if (bones.eyeL) {
          bones.eyeL.rotation.y = THREE.MathUtils.lerp(bones.eyeL.rotation.y, eyeRotationY, 0.15);
          bones.eyeL.rotation.x = THREE.MathUtils.lerp(bones.eyeL.rotation.x, eyeRotationX, 0.15);
          bones.eyeL.updateMatrixWorld(true);
        }
        if (bones.eyeR) {
          bones.eyeR.rotation.y = THREE.MathUtils.lerp(bones.eyeR.rotation.y, eyeRotationY, 0.15);
          bones.eyeR.rotation.x = THREE.MathUtils.lerp(bones.eyeR.rotation.x, eyeRotationX, 0.15);
          bones.eyeR.updateMatrixWorld(true);
        }
        if (bones.defHead && restRotations.current.head) {
          bones.defHead.rotation.y = THREE.MathUtils.lerp(
            bones.defHead.rotation.y,
            restRotations.current.head.y,
            0.1,
          );
          bones.defHead.rotation.x = THREE.MathUtils.lerp(
            bones.defHead.rotation.x,
            restRotations.current.head.x,
            0.1,
          );
          bones.defHead.updateMatrixWorld(true);
        }
        if (bones.eyeL && restRotations.current.eyeL) {
          bones.eyeL.rotation.y = THREE.MathUtils.lerp(
            bones.eyeL.rotation.y,
            restRotations.current.eyeL.y,
            0.15,
          );
          bones.eyeL.rotation.x = THREE.MathUtils.lerp(
            bones.eyeL.rotation.x,
            restRotations.current.eyeL.x,
            0.15,
          );
          bones.eyeL.updateMatrixWorld(true);
        }
        if (bones.eyeR && restRotations.current.eyeR) {
          bones.eyeR.rotation.y = THREE.MathUtils.lerp(
            bones.eyeR.rotation.y,
            restRotations.current.eyeR.y,
            0.15,
          );
          bones.eyeR.rotation.x = THREE.MathUtils.lerp(
            bones.eyeR.rotation.x,
            restRotations.current.eyeR.x,
            0.15,
          );
          bones.eyeR.updateMatrixWorld(true);
        }
      }
    }

    // SkinnedMesh 업데이트 강제
    Object.values(nodes).forEach(node => {
      if (!node) return;
      const skinned = node as THREE.SkinnedMesh;
      if (!skinned.isSkinnedMesh) return;
      if (!skinned.skeleton || typeof skinned.skeleton.update !== 'function') return;
      skinned.skeleton.update();
    });
  });

  return {
    isAnimating: !!(blink || lookAt || smile || smileSoft || bigSmile || wink || openMouth),
  };
}
