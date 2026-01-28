import { useGLTF, useTexture } from '@react-three/drei';
import { type ThreeElements, useGraph } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useFixSkinnedMesh } from '@/feat/character/hooks/useFixSkinnedMesh';
import { useFoxAnimation } from '@/feat/character/hooks/usefoxanimation';
import type { FoxAnimationConfig, GLTFResult } from '@/feat/character/types';

import { useFoxDebug } from './useFoxDebug';

export type FoxModelProps = ThreeElements['group'] & {
  animation?: FoxAnimationConfig;
  enhancedEyes?: boolean;
};

export const FoxModel = forwardRef<THREE.Group, FoxModelProps>(
  ({ animation, enhancedEyes = true, ...props }, ref) => {
    const group = useRef<THREE.Group>(null!);

    // ref 전달
    useImperativeHandle(ref, () => group.current);

    // GLTF 로드 (캐싱됨)
    const { scene } = useGLTF('/fox/model.glb') as unknown as GLTFResult;

    // 씬 복제 (인스턴스마다 독립적인 애니메이션을 위해)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;

    useFoxDebug(nodes);

    // 눈알 반짝이는 재질
    const eyeTextures = useTexture(
      enhancedEyes
        ? [
            '/fox/textures/eyes_color.png',
            '/fox/textures/eyes_roughness.png',
            '/fox/textures/eyes_transmission.png',
          ]
        : [],
    );

    const eyeMaterial = useMemo(() => {
      if (eyeTextures.length !== 3) return undefined;
      const [colorMap, roughnessMap, transmissionMap] = eyeTextures;
      return new THREE.MeshPhysicalMaterial({
        map: colorMap,
        roughnessMap: roughnessMap,
        transmissionMap: transmissionMap,
        transmission: 0.95,
        ior: 1.2, // 유리 굴절률
        thickness: 0.1,
        roughness: 0.1,
        metalness: 0,
        clearcoat: 1, // 코팅 효과
        clearcoatRoughness: 0.1,
      });
    }, [eyeTextures]);

    useEffect(() => () => eyeMaterial?.dispose(), [eyeMaterial]);

    // SkinnedMesh 수정
    useFixSkinnedMesh(clone);

    // 애니메이션 컨트롤러
    useFoxAnimation(nodes, animation);

    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="rig_body">
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
                material={eyeMaterial ?? materials.eye}
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
                material={eyeMaterial ?? materials.eye}
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

          {nodes.rig_tail && (
            <group name="rig_tail">
              <primitive object={nodes.rig_tail} />
              {nodes.tail_1?.geometry?.attributes?.position && (
                <skinnedMesh
                  name="tail_1"
                  geometry={nodes.tail_1.geometry}
                  material={materials.tail}
                  skeleton={nodes.tail_1.skeleton}
                  frustumCulled={false}
                />
              )}
            </group>
          )}

          {nodes.rig_muffler && (
            <group name="rig_muffler">
              <primitive object={nodes.rig_muffler} />
              {nodes.muffler001?.geometry?.attributes?.position && (
                <skinnedMesh
                  name="muffler001"
                  geometry={nodes.muffler001.geometry}
                  material={materials.muffler_tail}
                  skeleton={nodes.muffler001.skeleton}
                  frustumCulled={false}
                />
              )}
            </group>
          )}
        </group>
      </group>
    );
  },
);

FoxModel.displayName = 'FoxModel';

useGLTF.preload('/fox/model.glb');
