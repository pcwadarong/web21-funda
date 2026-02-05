import type * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

type ActionName = 'hello_action' | 'eyebrow' | 'eyelash' | 'head' | 'teeth' | 'tongue';

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

export type GLTFResult = GLTF & {
  nodes: {
    eyebrow: THREE.Mesh;
    eyelash: THREE.Mesh;
    teeth: THREE.Mesh;
    tongue: THREE.Mesh;
    head: THREE.Mesh;
    ear_inside: THREE.Mesh;
    nose: THREE.Mesh;
    Sphere001: THREE.Mesh;
    Sphere001_1: THREE.Mesh;
    Sphere003: THREE.Mesh;
    Sphere003_1: THREE.Mesh;
    body: THREE.SkinnedMesh;
    muffler: THREE.SkinnedMesh;
    tail: THREE.SkinnedMesh;
    tail_1: THREE.Bone;
    tail001: THREE.Bone;
    tail002: THREE.Bone;
    tail003: THREE.Bone;
    tail004: THREE.Bone;
    muffler_tail: THREE.SkinnedMesh;
    ['DEF-spine']: THREE.Bone;
    ['DEF-spine001']: THREE.Bone;
    ['DEF-spine002']: THREE.Bone;
    ['DEF-spine003']: THREE.Bone;
    ['DEF-spine004']: THREE.Bone;
    ['DEF-spine005']: THREE.Bone;
    ['DEF-spine006']: THREE.Bone;
    ['DEF-pelvisL']: THREE.Bone;
    ['DEF-pelvisR']: THREE.Bone;
    ['DEF-thighL']: THREE.Bone;
    ['DEF-thighR']: THREE.Bone;
    ['DEF-earL']: THREE.Bone;
    ['DEF-earL001']: THREE.Bone;
    ['DEF-earL002']: THREE.Bone;
    ['DEF-earL004']: THREE.Bone;
    ['DEF-earR']: THREE.Bone;
    ['DEF-earR001']: THREE.Bone;
    ['DEF-earR002']: THREE.Bone;
    ['DEF-earR004']: THREE.Bone;
    ['DEF-teethT']: THREE.Bone;
    ['DEF-nose002']: THREE.Bone;
    ['DEF-noseL001']: THREE.Bone;
    ['DEF-noseR001']: THREE.Bone;
    ['DEF-eye_masterL']: THREE.Bone;
    ['DEF-lidBL']: THREE.Bone;
    ['DEF-lidTL']: THREE.Bone;
    ['DEF-eyeL']: THREE.Bone;
    ['DEF-eye_masterR']: THREE.Bone;
    ['DEF-lidBR']: THREE.Bone;
    ['DEF-lidTR']: THREE.Bone;
    ['DEF-eyeR']: THREE.Bone;
    ['DEF-teethB']: THREE.Bone;
    ['DEF-tongue']: THREE.Bone;
    ['DEF-jaw_master']: THREE.Bone;
    ['DEF-chin']: THREE.Bone;
    ['DEF-jaw']: THREE.Bone;
    ['DEF-jawL']: THREE.Bone;
    ['DEF-jawR']: THREE.Bone;
    ['DEF-lipTL']: THREE.Bone;
    ['DEF-lipTR']: THREE.Bone;
    ['DEF-lipBL']: THREE.Bone;
    ['DEF-lipBR']: THREE.Bone;
    ['DEF-browBL']: THREE.Bone;
    ['DEF-browBL004']: THREE.Bone;
    ['DEF-browBR']: THREE.Bone;
    ['DEF-browBR004']: THREE.Bone;
    ['DEF-browTL']: THREE.Bone;
    ['DEF-browTL001']: THREE.Bone;
    ['DEF-browTL003']: THREE.Bone;
    ['DEF-browTR']: THREE.Bone;
    ['DEF-browTR001']: THREE.Bone;
    ['DEF-browTR003']: THREE.Bone;
    ['DEF-cheekBL']: THREE.Bone;
    ['DEF-cheekBR']: THREE.Bone;
    ['DEF-cheekTL']: THREE.Bone;
    ['DEF-cheekTR']: THREE.Bone;
    ['DEF-foreheadL']: THREE.Bone;
    ['DEF-foreheadL001']: THREE.Bone;
    ['DEF-foreheadL002']: THREE.Bone;
    ['DEF-foreheadR']: THREE.Bone;
    ['DEF-foreheadR001']: THREE.Bone;
    ['DEF-foreheadR002']: THREE.Bone;
    ['DEF-nose']: THREE.Bone;
    ['DEF-nose004']: THREE.Bone;
    ['DEF-templeL']: THREE.Bone;
    ['DEF-templeR']: THREE.Bone;
    ['DEF-shoulderL']: THREE.Bone;
    ['DEF-upper_armL']: THREE.Bone;
    ['DEF-shoulderR']: THREE.Bone;
    ['DEF-upper_armR']: THREE.Bone;
    ['DEF-breastL']: THREE.Bone;
    ['DEF-breastR']: THREE.Bone;
    neutral_bone: THREE.Bone;
    muff: THREE.Bone;
    muff001: THREE.Bone;
    muff002: THREE.Bone;
    muff003: THREE.Bone;
  };
  materials: {
    eyebrow: THREE.MeshStandardMaterial;
    eyelash: THREE.MeshStandardMaterial;
    teeth: THREE.MeshStandardMaterial;
    tongue: THREE.MeshStandardMaterial;
    ear_inside: THREE.MeshStandardMaterial;
    nose: THREE.MeshStandardMaterial;
    eye: THREE.MeshStandardMaterial;
    iris: THREE.MeshStandardMaterial;
    body: THREE.MeshStandardMaterial;
    muffler: THREE.MeshStandardMaterial;
    face: THREE.MeshStandardMaterial;
    tail: THREE.MeshStandardMaterial;
    muffler_tail: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export type FundyNodes = GLTFResult['nodes'];

/**
 * 여우 애니메이션 컨트롤러
 * Bone 기반 애니메이션 + Shape Key 조합
 */
export interface FundyAnimationConfig {
  /** 눈 깜빡임 */
  blink?: boolean;
  /** hello_action 재생 */
  helloAction?: number;
  /** 웃기 */
  smile?: boolean;
  /** 입 벌리며 웃기 */
  bigSmile?: boolean;
  /** 윙크 */
  wink?: boolean;
  /** 입 벌리기 (a, o 발음) */
  openMouth?: 'a' | 'o' | false;
  /** 시선 추적 (마우스) */
  lookAt?: boolean;
  /** 애니메이션 속도 배율 */
  speedMultiplier?: number;
}

/**
 * 여우 모델의 Shape Key가 있는 메시들
 */
export interface FundyMorphMeshes {
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
  eyebrow: THREE.Mesh & {
    morphTargetDictionary?: { a?: number };
    morphTargetInfluences?: number[];
  };

  /** 속눈썹 (eyelash) - Shape Keys: closed, smile, wink */
  eyelash: THREE.Mesh & {
    morphTargetDictionary?: { closed?: number; smile?: number; wink?: number; bigger?: number };
    morphTargetInfluences?: number[];
  };

  /** 머리 (head) - Shape Keys: a, mouth_smile, eyes_closed, o, wink */
  head: THREE.Mesh & {
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
