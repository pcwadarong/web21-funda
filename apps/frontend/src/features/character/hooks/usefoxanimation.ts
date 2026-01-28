import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FoxAnimationConfig, FoxNodes } from '@/feat/character/types';

export function useFoxAnimation(nodes: FoxNodes, config: FoxAnimationConfig = {}) {
  const {
    waveHand = false,
    blink = true,
    lookAt = false,
    autoRotate = false,
    speedMultiplier = 1,
  } = config;

  // 애니메이션 시간 추적
  const clockRef = useRef(0);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(Math.random() * 3 + 2); // 2-5초 랜덤

  // 시선 추적용 타겟
  const lookAtTarget = useRef(new THREE.Vector3());
  const mousePosition = useRef(new THREE.Vector2());

  // Bone 참조 캐싱 (성능 최적화)
  const bones = useMemo(() => {
    if (!nodes) return null;

    return {
      // 손 (왼쪽/오른쪽)
      handL: nodes['hand_ik.L'],
      handR: nodes['hand_ik.R'],

      // 머리 & 시선
      headCommon: nodes['MCH-eye_commonparent'],
      head: nodes['head'],

      // 꼬리
      tailRoot: nodes.tail,
    };
  }, [nodes]);

  // Shape Key 메시 참조
  const morphMeshes = useMemo(() => {
    if (!nodes) return null;

    return {
      eyelash: nodes.eyelash,
      eyebrow: nodes.eyebrow,
      head: nodes.head_1,
    };
  }, [nodes]);

  useFrame((state, delta) => {
    if (!bones || !morphMeshes) return;

    clockRef.current += delta * speedMultiplier;
    const time = clockRef.current;

    // 1. 손 흔들기 애니메이션 (좌우 교대)
    if (waveHand && bones.handL && bones.handR) {
      const waveSpeed = 3;
      const waveAngle = Math.sin(time * waveSpeed) * 0.5;

      // 왼손
      bones.handL.rotation.z = Math.max(0, waveAngle);

      // 오른손 (반대로)
      bones.handR.rotation.z = Math.min(0, -waveAngle);
    }

    // 2. 눈 깜빡임 (랜덤 간격)
    if (blink && morphMeshes.eyelash) {
      blinkTimerRef.current += delta;

      if (blinkTimerRef.current >= nextBlinkRef.current) {
        // 깜빡임 실행
        const blinkProgress = (blinkTimerRef.current - nextBlinkRef.current) * 10;

        if (blinkProgress < 1) {
          // 닫기 + 열기 (0 → 1 → 0)
          const blinkValue = Math.sin(blinkProgress * Math.PI);

          if (morphMeshes.eyelash.morphTargetInfluences) {
            // 'closed' shape key 활성화
            const closedIndex = morphMeshes.eyelash.morphTargetDictionary?.closed;
            if (closedIndex !== undefined) {
              morphMeshes.eyelash.morphTargetInfluences[closedIndex] = blinkValue;
            }
          }

          // 머리 메시도 같이 (눈 감는 표정)
          if (morphMeshes.head.morphTargetInfluences) {
            const eyesClosedIndex = morphMeshes.head.morphTargetDictionary?.eyes_closed;
            if (eyesClosedIndex !== undefined) {
              morphMeshes.head.morphTargetInfluences[eyesClosedIndex] = blinkValue;
            }
          }
        } else {
          // 깜빡임 끝, 다음 깜빡임 예약
          blinkTimerRef.current = 0;
          nextBlinkRef.current = Math.random() * 3 + 2;
        }
      }
    }

    // 3. 시선 추적 (마우스 또는 카메라)
    if (lookAt && bones.headCommon) {
      // 마우스 위치 → 3D 공간 변환
      const { mouse, camera } = state;

      // 마우스를 약간 부드럽게 따라가도록 lerp
      mousePosition.current.lerp(mouse, 0.1);

      // 카메라 앞 평면에 투영
      const distance = 5;
      lookAtTarget.current.set(mousePosition.current.x * 2, mousePosition.current.y * 2, -distance);
      lookAtTarget.current.applyMatrix4(camera.matrixWorld);

      // 머리가 타겟을 바라보도록
      const currentLookAt = new THREE.Vector3();
      bones.headCommon.getWorldPosition(currentLookAt);

      const direction = lookAtTarget.current.clone().sub(currentLookAt);
      const rotation = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, -1),
          direction.normalize(),
        ),
      );

      // 부드럽게 회전 (lerp)
      bones.headCommon.rotation.x = THREE.MathUtils.lerp(
        bones.headCommon.rotation.x,
        rotation.x * 0.3, // 30%만 적용 (너무 많이 움직이지 않도록)
        0.1,
      );
      bones.headCommon.rotation.y = THREE.MathUtils.lerp(
        bones.headCommon.rotation.y,
        rotation.y * 0.3,
        0.1,
      );
    }

    // 4. 자동 회전 (Y축)
    if (autoRotate && bones.head) {
      bones.head.rotation.y = Math.sin(time * 0.5) * 0.2;
    }
  });

  return {
    isAnimating: waveHand || blink || lookAt || autoRotate,
  };
}
