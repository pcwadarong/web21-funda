import { useGLTF } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { type GLTF, SkeletonUtils } from 'three-stdlib';

import { useFixSkinnedMesh } from './hooks/useFixSkinnedMesh';

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

type GLTFResult = GLTF & {
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
    tail: THREE.Bone;
    Bone: THREE.Bone;
    Armature: THREE.Object3D; // 꼬리 Armature 그룹
    Armature001: THREE.Object3D;
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

export function FoxModel(props: React.JSX.IntrinsicElements['group']) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/fox/model.glb') as unknown as GLTFResult;
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;

  useFixSkinnedMesh(clone);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        {/* 리깅 루트 및 MCH 컨트롤러 뼈대 */}
        <group name="rig005">
          <primitive object={nodes.root} />
          <primitive object={nodes['MCH-torsoparent']} />
          <primitive object={nodes['MCH-hand_ikparentL']} />
          <primitive object={nodes['MCH-upper_arm_ik_targetparentL']} />
          <primitive object={nodes['MCH-hand_ikparentR']} />
          <primitive object={nodes['MCH-upper_arm_ik_targetparentR']} />
          <primitive object={nodes['MCH-eye_commonparent']} />
          <primitive object={nodes['MCH-foot_ikparentL']} />
          <primitive object={nodes['MCH-thigh_ik_targetparentL']} />
          <primitive object={nodes['MCH-foot_ikparentR']} />
          <primitive object={nodes['MCH-thigh_ik_targetparentR']} />
          <primitive object={nodes['MCH-lip_armBL001']} />
          <primitive object={nodes['MCH-lip_armBR001']} />
          <primitive object={nodes['MCH-lip_armTL001']} />
          <primitive object={nodes['MCH-lip_armTR001']} />

          {/* 메인 캐릭터 바디 및 얼굴 파트 */}
          {nodes.body?.geometry?.attributes?.position && (
            <skinnedMesh
              name="body"
              geometry={nodes.body.geometry}
              material={materials.body}
              skeleton={nodes.body.skeleton}
              frustumCulled={false}
            />
          )}

          {nodes.ear_inside?.geometry?.attributes?.position && (
            <skinnedMesh
              name="ear_inside"
              geometry={nodes.ear_inside.geometry}
              material={materials.ear_inside}
              skeleton={nodes.ear_inside.skeleton}
              frustumCulled={false}
            />
          )}

          {nodes.eye_left?.geometry?.attributes?.position && (
            <skinnedMesh
              name="eye_left"
              geometry={nodes.eye_left.geometry}
              material={materials.eye}
              skeleton={nodes.eye_left.skeleton}
              frustumCulled={false}
            >
              {nodes.iris_left?.geometry?.attributes?.position && (
                <skinnedMesh
                  name="iris_left"
                  geometry={nodes.iris_left.geometry}
                  material={materials.iris}
                  skeleton={nodes.iris_left.skeleton}
                  frustumCulled={false}
                />
              )}
            </skinnedMesh>
          )}

          {nodes.eye_right?.geometry?.attributes?.position && (
            <skinnedMesh
              name="eye_right"
              geometry={nodes.eye_right.geometry}
              material={materials.eye}
              skeleton={nodes.eye_right.skeleton}
              frustumCulled={false}
            >
              {nodes.iris_right?.geometry?.attributes?.position && (
                <skinnedMesh
                  name="iris_right"
                  geometry={nodes.iris_right.geometry}
                  material={materials.iris}
                  skeleton={nodes.iris_right.skeleton}
                  frustumCulled={false}
                />
              )}
            </skinnedMesh>
          )}

          {nodes.muffler?.geometry?.attributes?.position && (
            <skinnedMesh
              name="muffler"
              geometry={nodes.muffler.geometry}
              material={materials.muffler}
              skeleton={nodes.muffler.skeleton}
              frustumCulled={false}
            />
          )}

          {nodes.nose_1?.geometry?.attributes?.position && (
            <skinnedMesh
              name="nose_1"
              geometry={nodes.nose_1.geometry}
              material={materials.nose}
              skeleton={nodes.nose_1.skeleton}
              frustumCulled={false}
            />
          )}

          {nodes.eyebrow?.geometry?.attributes?.position && (
            <skinnedMesh
              name="eyebrow"
              geometry={nodes.eyebrow.geometry}
              material={materials.eyebrow}
              skeleton={nodes.eyebrow.skeleton}
              morphTargetDictionary={nodes.eyebrow.morphTargetDictionary}
              morphTargetInfluences={nodes.eyebrow.morphTargetInfluences}
              frustumCulled={false}
            />
          )}

          {nodes.eyelash?.geometry?.attributes?.position && (
            <skinnedMesh
              name="eyelash"
              geometry={nodes.eyelash.geometry}
              material={materials.eyelash}
              skeleton={nodes.eyelash.skeleton}
              morphTargetDictionary={nodes.eyelash.morphTargetDictionary}
              morphTargetInfluences={nodes.eyelash.morphTargetInfluences}
              frustumCulled={false}
            />
          )}

          {nodes.head_1?.geometry?.attributes?.position && (
            <skinnedMesh
              name="head_1"
              geometry={nodes.head_1.geometry}
              material={materials.face}
              skeleton={nodes.head_1.skeleton}
              morphTargetDictionary={nodes.head_1.morphTargetDictionary}
              morphTargetInfluences={nodes.head_1.morphTargetInfluences}
              frustumCulled={false}
            />
          )}
        </group>
        {/* tail, muffler tail */}
        {nodes.Armature && <primitive object={nodes.Armature} />}
        {nodes.Armature001 && <primitive object={nodes.Armature001} />}
      </group>
    </group>
  );
}

useGLTF.preload('/fox/model.glb');
