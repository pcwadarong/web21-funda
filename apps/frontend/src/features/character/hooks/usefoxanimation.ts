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

export function useFoxAnimation(nodes: FoxNodes, config: FoxAnimationConfig = {}) {
  // 0. 기본 설정값 유지
  const {
    waveHand = false,
    blink = true,
    lookAt = false,
    autoRotate = false,
    speedMultiplier = 1,
  } = config;

  // 애니메이션 상태 추적을 위한 Ref
  const clockRef = useRef(0);
  const blinkState = useRef({ timer: 0, next: Math.random() * 3 + 2 });
  const mouseLerp = useRef(new THREE.Vector2());

  // 1. 필요한 본(Bone)과 메시(Mesh)
  const refs = useMemo(
    () => ({
      bones: {
        handL: nodes['hand_ik.L'] as THREE.Bone,
        handR: nodes['hand_ik.R'] as THREE.Bone,
        headCommon: nodes['MCH-eye_commonparent'] as THREE.Bone,
        head: nodes['head'] as THREE.Bone,
        tail: nodes.tail as THREE.Bone,
      },
      morphs: {
        eyelash: nodes.eyelash as THREE.SkinnedMesh,
        head: nodes.head_1 as THREE.SkinnedMesh,
      },
    }),
    [nodes],
  );

  // 2. 메인 애니메이션 루프
  useFrame((state, delta) => {
    const { bones, morphs } = refs;
    if (!bones || !morphs) return;

    clockRef.current += delta * speedMultiplier;
    const time = clockRef.current;

    // --- 기능 1. 손 흔들기 (좌우 교대) ---
    if (waveHand && bones.handL && bones.handR) {
      const angle = Math.sin(time * 3) * 0.5;
      bones.handL.rotation.z = Math.max(0, angle);
      bones.handR.rotation.z = Math.min(0, -angle);
    }

    // --- 기능 2. 눈 깜빡임 (Shape Key 제어) ---
    if (blink && morphs.eyelash) {
      const s = blinkState.current;
      s.timer += delta;

      if (s.timer >= s.next) {
        const progress = (s.timer - s.next) * 10;
        if (progress < 1) {
          const blinkValue = Math.sin(progress * Math.PI);

          // Eyelash와 Head 메시의 Morph Target을 동시에 업데이트
          [morphs.eyelash, morphs.head].forEach(mesh => {
            const influences = mesh.morphTargetInfluences;
            const dict = mesh.morphTargetDictionary;
            const idx = dict?.closed ?? dict?.eyes_closed;
            if (influences && idx !== undefined) influences[idx] = blinkValue;
          });
        } else {
          s.timer = 0;
          s.next = Math.random() * 3 + 2;
        }
      }
    }

    // --- 기능 3. 시선 추적 (마우스/카메라) ---
    if (lookAt && bones.headCommon) {
      const { pointer, camera } = state;
      mouseLerp.current.lerp(pointer, 0.1); // 마우스 위치 부드럽게 보간

      // 1. NDC(화면 좌표)를 3D 월드 좌표로 변환
      _targetPos.set(mouseLerp.current.x * 2, mouseLerp.current.y * 2, -5);
      _targetPos.applyMatrix4(camera.matrixWorld);

      // 2. 여우 머리의 현재 위치 구하기
      bones.headCommon.getWorldPosition(_currentPos);

      // 3. 머리에서 타겟까지의 방향 계산 (방향 = 타겟 - 현재위치)
      _direction.subVectors(_targetPos, _currentPos).normalize();

      // 4. 기준 방향(_v0)에서 목표 방향(_direction)으로 회전하는 양 계산
      _quat.setFromUnitVectors(_v0, _direction);

      // 5. 계산된 4원수 회전값을 Euler(각도)로 변환
      _euler.setFromQuaternion(_quat);

      // 최종 회전 적용 (회전 각도 제한)
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

    // --- 기능 4. 자동 회전 (여우가 고개를 까딱임) ---
    if (autoRotate && bones.head) bones.head.rotation.y = Math.sin(time * 0.5) * 0.2;
  });

  return { isAnimating: !!(waveHand || blink || lookAt || autoRotate) };
}
