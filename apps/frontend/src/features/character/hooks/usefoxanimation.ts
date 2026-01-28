import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FoxAnimationConfig, FoxNodes } from '../types';

/**
 * 재사용을 위한 임시 객체들 (Garbage Collection 방지)
 */
const _targetPos = new THREE.Vector3(); // 마우스가 가리키는 3D 공간의 목표 지점
const _currentPos = new THREE.Vector3(); // 현재 여우 머리(Bone)의 세계관(World) 좌표
const _direction = new THREE.Vector3(); // 머리에서 목표 지점을 향하는 화살표(방향 벡터)
const _quat = new THREE.Quaternion(); // 방향 벡터를 회전값으로 변환하기 위한 4원수(Quaternion)
const _euler = new THREE.Euler(); // Quaternion을 x, y, z로 변환한 값
const _v0 = new THREE.Vector3(0, 0, -1); // 모델이 기본적으로 바라보는 정면 방향 기준점

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
    head: { a: 0.4, o: 1, mouth_smile: 0, wink: 0, eyes_closed: 0 },
    eyelash: { smile: 0, wink: 0 },
    teeth: { a: 0.4, o: 1, smile: 0 },
    tongue: { a: 0.4 },
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
    autoRotate = false,
    speedMultiplier = 1,
    smile = false,
    bigSmile = false,
    wiggleHips = false,
    wagTail = false,
    wiggleEars = false,
    wink = false,
    openMouth = false,
  } = config;

  const clockRef = useRef(0);
  const blinkState = useRef({ timer: 0, next: Math.random() * 3 + 2, isBlinking: false });
  const mouseLerp = useRef(new THREE.Vector2());

  const refs = useMemo(
    () => ({
      bones: {
        // 손
        handL: nodes['hand_ik.L'] as THREE.Bone,
        handR: nodes['hand_ik.R'] as THREE.Bone,

        // 머리 & 눈
        headCommon: nodes['MCH-eye_commonparent'] as THREE.Bone,
        head: nodes.head as THREE.Bone,
        eyeL: nodes['eye.L'] as THREE.Bone,
        eyeR: nodes['eye.R'] as THREE.Bone,

        // 몸통
        hips: nodes.hips as THREE.Bone,
        torso: nodes.torso as THREE.Bone,
        spine: nodes.spine_fk as THREE.Bone,

        // 꼬리
        tail: nodes.tail as THREE.Bone,
        tail1: nodes.tail001 as THREE.Bone,
        tail2: nodes.tail002 as THREE.Bone,
        tail3: nodes.tail003 as THREE.Bone,
        tail4: nodes.tail004 as THREE.Bone,

        // 귀
        earL: nodes['ear.L'] as THREE.Bone,
        earR: nodes['ear.R'] as THREE.Bone,

        // 눈썹
        browTL: nodes['brow.T.L'] as THREE.Bone,
        browTR: nodes['brow.T.R'] as THREE.Bone,
        browBL: nodes['brow.B.L'] as THREE.Bone,
        browBR: nodes['brow.B.R'] as THREE.Bone,

        // 입
        jaw: nodes.jaw as THREE.Bone,
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

    // 손 흔들기
    if (waveHand && bones.handL && bones.handR) {
      const angle = Math.sin(time * 3) * 0.5;
      bones.handL.rotation.z = Math.max(0, angle);
      bones.handR.rotation.z = Math.min(0, -angle);
    }

    // 엉덩이 흔들기
    if (wiggleHips && bones.hips) {
      const sway = Math.sin(time * 2) * 0.1;
      bones.hips.rotation.z = sway;
      bones.hips.position.x = sway * 0.05;
    }

    // 꼬리 흔들기
    if (wagTail) {
      const wag = Math.sin(time * 4);
      [bones.tail, bones.tail1, bones.tail2, bones.tail3, bones.tail4].forEach((b, i) => {
        if (b) b.rotation.y = wag * (0.2 - i * 0.05);
      });
    }

    // 귀 움직이기
    if (wiggleEars) {
      const wiggle = Math.sin(time * 3) * 0.15;
      if (bones.earL) bones.earL.rotation.z = wiggle;
      if (bones.earR) bones.earR.rotation.z = -wiggle;
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

    if (lookAt && bones.headCommon) {
      const { pointer, camera } = state;
      mouseLerp.current.lerp(pointer, 0.1);

      _targetPos.set(mouseLerp.current.x * 2, mouseLerp.current.y * 2, -5);
      _targetPos.applyMatrix4(camera.matrixWorld);

      bones.headCommon.getWorldPosition(_currentPos);
      _direction.subVectors(_targetPos, _currentPos).normalize();
      _quat.setFromUnitVectors(_v0, _direction);
      _euler.setFromQuaternion(_quat);

      bones.headCommon.rotation.x = THREE.MathUtils.lerp(
        bones.headCommon.rotation.x,
        _euler.x * 0.3,
        0.1,
      );
      bones.headCommon.rotation.y = THREE.MathUtils.lerp(
        bones.headCommon.rotation.y,
        _euler.y * 0.3,
        0.1,
      );
    }

    // ==========================================
    // 자동 회전
    // ==========================================

    if (autoRotate && bones.head) {
      bones.head.rotation.y = Math.sin(time * 0.5) * 0.2;
    }
  });

  return {
    isAnimating: !!(
      waveHand ||
      blink ||
      lookAt ||
      autoRotate ||
      smile ||
      bigSmile ||
      wiggleHips ||
      wagTail ||
      wiggleEars ||
      wink ||
      openMouth
    ),
  };
}
