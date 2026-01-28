import type * as THREE from 'three';
import type { GLTF } from 'three-stdlib';

type ActionName =
  | 'rig.005'
  | 'eyebrow'
  | 'eyelash'
  | 'head'
  | 'teeth'
  | 'tongue'
  | 'Armature'
  | 'Armature.001';

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
    Bone: THREE.Bone;
    Armature: THREE.Object3D; // 꼬리 Armature 그룹
    Armature001: THREE.Object3D; // 머플러 꼬리 Armature 그룹
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
