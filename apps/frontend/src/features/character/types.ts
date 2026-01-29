import type * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

type ActionName =
  | 'rig_body'
  | 'eyebrow'
  | 'eyelash'
  | 'head'
  | 'teeth'
  | 'tongue'
  | 'rig_tail'
  | 'rig_muffler';

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

export type GLTFResult = GLTF & {
  nodes: {
    teeth: THREE.Mesh;
    tongue_1: THREE.Mesh;
    body: THREE.SkinnedMesh;
    ear_inside: THREE.SkinnedMesh;
    eye_left: THREE.SkinnedMesh;
    iris_left: THREE.SkinnedMesh;
    eye_right: THREE.SkinnedMesh;
    iris_right: THREE.SkinnedMesh;
    muffler: THREE.SkinnedMesh;
    nose_1: THREE.SkinnedMesh;
    eyebrow: THREE.SkinnedMesh;
    eyelash: THREE.SkinnedMesh;
    head_1: THREE.SkinnedMesh;
    tail_1: THREE.SkinnedMesh;
    muffler001: THREE.SkinnedMesh;
    root: THREE.Bone;
    ['MCH-torsoparent']: THREE.Bone;
    ['MCH-hand_ikparentL']: THREE.Bone;
    ['MCH-upper_arm_ik_targetparentL']: THREE.Bone;
    ['MCH-hand_ikparentR']: THREE.Bone;
    ['MCH-upper_arm_ik_targetparentR']: THREE.Bone;
    ['MCH-eye_commonparent']: THREE.Bone;
    ['MCH-foot_ikparentL']: THREE.Bone;
    ['MCH-thigh_ik_targetparentL']: THREE.Bone;
    ['MCH-foot_ikparentR']: THREE.Bone;
    ['MCH-thigh_ik_targetparentR']: THREE.Bone;
    ['MCH-lip_armBL001']: THREE.Bone;
    ['MCH-lip_armBR001']: THREE.Bone;
    ['MCH-lip_armTL001']: THREE.Bone;
    ['MCH-lip_armTR001']: THREE.Bone;
    [key: string]: any;
    tail: THREE.Bone;
    muffler_tail: THREE.Bone;
    rig_tail: THREE.Object3D; // 꼬리 Armature 그룹
    rig_muffler: THREE.Object3D; // 머플러 꼬리 Armature 그룹
  };
  materials: {
    teeth: THREE.MeshStandardMaterial;
    tongue: THREE.MeshStandardMaterial;
    body: THREE.MeshStandardMaterial;
    ear_inside: THREE.MeshStandardMaterial;
    eye: THREE.MeshStandardMaterial;
    iris: THREE.MeshStandardMaterial;
    muffler: THREE.MeshStandardMaterial;
    nose: THREE.MeshStandardMaterial;
    eyebrow: THREE.MeshStandardMaterial;
    eyelash: THREE.MeshStandardMaterial;
    face: THREE.MeshStandardMaterial;
    tail: THREE.MeshStandardMaterial;
    muffler_tail: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export type FoxNodes = GLTFResult['nodes'];

/**
 * 여우 애니메이션 컨트롤러
 * Bone 기반 애니메이션 + Shape Key 조합
 */
export interface FoxAnimationConfig {
  /** 손 흔들기 */
  waveHand?: boolean;
  /** 눈 깜빡임 */
  blink?: boolean;
  /** 웃기 */
  smile?: boolean;
  /** 입 벌리며 웃기 */
  bigSmile?: boolean;
  /** 윙크 */
  wink?: boolean;
  /** 엉덩이 흔들기 (무게 중심 이동) */
  wiggleHips?: boolean;
  /** 꼬리 흔들기 */
  wagTail?: boolean;
  /** 귀 움직이기 */
  wiggleEars?: boolean;
  /** 입 벌리기 (a, o 발음) */
  openMouth?: 'a' | 'o' | false;
  /** 시선 추적 (마우스) */
  lookAt?: boolean;
  /** 자동 회전 */
  autoRotate?: boolean;
  /** 애니메이션 속도 배율 */
  speedMultiplier?: number;
}

/**
 * 여우 모델의 Shape Key가 있는 메시들
 */
export interface FoxMorphMeshes {
  /** 이빨 (teeth) - Shape Keys: a, smile, o */
  teeth: THREE.Mesh & {
    morphTargetDictionary?: { a?: number; smile?: number; o?: number };
    morphTargetInfluences?: number[];
  };

  /** 혀 (tongue) - Shape Keys: a */
  tongue: THREE.Mesh & {
    morphTargetDictionary?: { a?: number };
    morphTargetInfluences?: number[];
  };

  /** 눈썹 (eyebrow) - Shape Keys: Key 1 (올리기) */
  eyebrow: THREE.SkinnedMesh & {
    morphTargetDictionary?: { a?: number };
    morphTargetInfluences?: number[];
  };

  /** 속눈썹 (eyelash) - Shape Keys: closed, smile, wink */
  eyelash: THREE.SkinnedMesh & {
    morphTargetDictionary?: { closed?: number; smile?: number; wink?: number };
    morphTargetInfluences?: number[];
  };

  /** 머리 (head) - Shape Keys: a, mouth_smile, eyes_closed, o, wink */
  head: THREE.SkinnedMesh & {
    morphTargetDictionary?: {
      a?: number;
      mouth_smile?: number;
      eyes_closed?: number;
      o?: number;
      wink?: number;
    };
    morphTargetInfluences?: number[];
  };
}
