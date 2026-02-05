import { useAnimations, useGLTF, useTexture } from '@react-three/drei';
import { type ThreeElements, useGraph } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useFixSkinnedMesh } from '@/feat/fundy/hooks/useFixSkinnedMesh';
import { useFundyAnimation } from '@/feat/fundy/hooks/useFundyAnimation';
import type { FundyAnimationConfig, GLTFResult } from '@/feat/fundy/types';
import { useFundyStore } from '@/store/fundyStore';

export type FundyModelProps = ThreeElements['group'] & {
  animation?: FundyAnimationConfig;
  enhancedEyes?: boolean;
};

export const FundyModel = forwardRef<THREE.Group, FundyModelProps>(
  ({ animation, enhancedEyes = true, ...props }, ref) => {
    const group = useRef<THREE.Group>(null!);
    const { setActionLocked, setSystemAnimation } = useFundyStore(state => state.actions);
    const prevLookAtRef = useRef<boolean | undefined>(undefined);

    // ref 전달
    useImperativeHandle(ref, () => group.current);

    // GLTF 로드 (캐싱됨)
    const { scene, animations } = useGLTF('/fundy/model.glb') as unknown as GLTFResult;

    // 씬 복제 (인스턴스마다 독립적인 애니메이션을 위해)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
    const { actions } = useAnimations(animations, group);

    // 눈알 반짝이는 재질
    const eyeTextures = useTexture(
      enhancedEyes
        ? [
            '/fundy/textures/eyes_color.png',
            '/fundy/textures/eyes_roughness.png',
            '/fundy/textures/eyes_transmission.png',
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

    useEffect(() => {
      const eyeMat = enhancedEyes && eyeMaterial ? eyeMaterial : materials.eye;
      const irisMat = materials.iris;

      const eyeMeshes = [nodes.Sphere001, nodes.Sphere003].filter(
        (mesh): mesh is THREE.Mesh => !!mesh && (mesh as THREE.Mesh).isMesh,
      );
      const irisMeshes = [nodes.Sphere001_1, nodes.Sphere003_1].filter(
        (mesh): mesh is THREE.Mesh => !!mesh && (mesh as THREE.Mesh).isMesh,
      );

      eyeMeshes.forEach(mesh => {
        mesh.material = eyeMat;
        mesh.material.needsUpdate = true;
      });

      irisMeshes.forEach(mesh => {
        mesh.material = irisMat;
      });
    }, [enhancedEyes, eyeMaterial, materials.eye, materials.iris, nodes]);

    // SkinnedMesh 수정
    useFixSkinnedMesh(clone);
    // 애니메이션 컨트롤러
    useFundyAnimation(nodes, animation);

    const prevHelloRef = useRef<number | undefined>(undefined);
    useEffect(() => {
      const hello = actions?.hello_action;
      if (!hello) return;

      const trigger = animation?.helloAction ?? 0;
      if (prevHelloRef.current === trigger) return;
      prevHelloRef.current = trigger;
      if (trigger === 0) return;

      setActionLocked(true);
      prevLookAtRef.current = animation?.lookAt;
      setSystemAnimation({ lookAt: false });
      setSystemAnimation({ smileSoft: false });

      hello.reset();
      hello.setLoop(THREE.LoopOnce, 1);
      hello.clampWhenFinished = true;
      hello.fadeIn(0.15);
      hello.play();

      const mixer = hello.getMixer();
      let smileTimer: ReturnType<typeof setTimeout> | null = null;
      let safetyUnlockTimer: ReturnType<typeof setTimeout> | null = null;
      const handleFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
        if (event.action !== hello) return;
        if (smileTimer) clearTimeout(smileTimer);
        if (safetyUnlockTimer) clearTimeout(safetyUnlockTimer);
        setActionLocked(false);
        if (prevLookAtRef.current !== undefined) {
          setSystemAnimation({ lookAt: prevLookAtRef.current });
        }
        setSystemAnimation({ smileSoft: false });
        mixer.removeEventListener('finished', handleFinished);
      };
      mixer.addEventListener('finished', handleFinished);

      smileTimer = setTimeout(() => {
        setSystemAnimation({ smileSoft: true });
      }, 300);

      safetyUnlockTimer = setTimeout(
        () => {
          setActionLocked(false);
          if (prevLookAtRef.current !== undefined) {
            setSystemAnimation({ lookAt: prevLookAtRef.current });
          }
          setSystemAnimation({ smileSoft: false });
        },
        (hello.getClip().duration ?? 0) * 1000 + 200,
      );

      return () => {
        if (smileTimer) clearTimeout(smileTimer);
        if (safetyUnlockTimer) clearTimeout(safetyUnlockTimer);
        mixer.removeEventListener('finished', handleFinished);
      };
    }, [actions, animation?.helloAction, setActionLocked, setSystemAnimation]);

    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="bone_body">
            <primitive object={nodes['DEF-spine']} />
            <primitive object={nodes['DEF-pelvisL']} />
            <primitive object={nodes['DEF-pelvisR']} />
            <primitive object={nodes['DEF-thighL']} />
            <primitive object={nodes['DEF-thighR']} />
            <primitive object={nodes['DEF-earL']} />
            <primitive object={nodes['DEF-earL001']} />
            <primitive object={nodes['DEF-earL002']} />
            <primitive object={nodes['DEF-earL004']} />
            <primitive object={nodes['DEF-earR']} />
            <primitive object={nodes['DEF-earR001']} />
            <primitive object={nodes['DEF-earR002']} />
            <primitive object={nodes['DEF-earR004']} />
            <primitive object={nodes['DEF-teethT']} />
            <primitive object={nodes['DEF-nose002']} />
            <primitive object={nodes['DEF-noseL001']} />
            <primitive object={nodes['DEF-noseR001']} />
            <primitive object={nodes['DEF-eye_masterL']} />
            <primitive object={nodes['DEF-lidBL']} />
            <primitive object={nodes['DEF-lidTL']} />
            <primitive object={nodes['DEF-eyeL']} />
            <primitive object={nodes['DEF-eye_masterR']} />
            <primitive object={nodes['DEF-lidBR']} />
            <primitive object={nodes['DEF-lidTR']} />
            <primitive object={nodes['DEF-eyeR']} />
            <primitive object={nodes['DEF-teethB']} />
            <primitive object={nodes['DEF-tongue']} />
            <primitive object={nodes['DEF-jaw_master']} />
            <primitive object={nodes['DEF-chin']} />
            <primitive object={nodes['DEF-jaw']} />
            <primitive object={nodes['DEF-jawL']} />
            <primitive object={nodes['DEF-jawR']} />
            <primitive object={nodes['DEF-lipTL']} />
            <primitive object={nodes['DEF-lipTR']} />
            <primitive object={nodes['DEF-lipBL']} />
            <primitive object={nodes['DEF-lipBR']} />
            <primitive object={nodes['DEF-browBL']} />
            <primitive object={nodes['DEF-browBL004']} />
            <primitive object={nodes['DEF-browBR']} />
            <primitive object={nodes['DEF-browBR004']} />
            <primitive object={nodes['DEF-browTL']} />
            <primitive object={nodes['DEF-browTL001']} />
            <primitive object={nodes['DEF-browTL003']} />
            <primitive object={nodes['DEF-browTR']} />
            <primitive object={nodes['DEF-browTR001']} />
            <primitive object={nodes['DEF-browTR003']} />
            <primitive object={nodes['DEF-cheekBL']} />
            <primitive object={nodes['DEF-cheekBR']} />
            <primitive object={nodes['DEF-cheekTL']} />
            <primitive object={nodes['DEF-cheekTR']} />
            <primitive object={nodes['DEF-foreheadL']} />
            <primitive object={nodes['DEF-foreheadL001']} />
            <primitive object={nodes['DEF-foreheadL002']} />
            <primitive object={nodes['DEF-foreheadR']} />
            <primitive object={nodes['DEF-foreheadR001']} />
            <primitive object={nodes['DEF-foreheadR002']} />
            <primitive object={nodes['DEF-nose']} />
            <primitive object={nodes['DEF-nose004']} />
            <primitive object={nodes['DEF-templeL']} />
            <primitive object={nodes['DEF-templeR']} />
            <primitive object={nodes['DEF-shoulderL']} />
            <primitive object={nodes['DEF-upper_armL']} />
            <primitive object={nodes['DEF-shoulderR']} />
            <primitive object={nodes['DEF-upper_armR']} />
            <primitive object={nodes['DEF-breastL']} />
            <primitive object={nodes['DEF-breastR']} />
            <primitive object={nodes.neutral_bone} />
            <skinnedMesh
              name="body"
              geometry={nodes.body.geometry}
              material={materials.body}
              skeleton={nodes.body.skeleton}
            />
            <skinnedMesh
              name="muffler"
              geometry={nodes.muffler.geometry}
              material={materials.muffler}
              skeleton={nodes.muffler.skeleton}
            />
          </group>

          <group
            name="bone_tail"
            position={[-0.02, 1.011, -0.334]}
            rotation={[-0.428, 0, -1.034]}
            scale={2.178}
          >
            <primitive object={nodes.tail_1} />
            {nodes.tail?.geometry?.attributes?.position && (
              <skinnedMesh
                name="tail"
                geometry={nodes.tail.geometry}
                material={materials.tail}
                skeleton={nodes.tail.skeleton}
                frustumCulled={false}
              />
            )}
          </group>

          <group
            name="bone_muffler_tail"
            position={[0.192, 2.203, 0.612]}
            rotation={[-0.103, -0.003, -3.112]}
          >
            <primitive object={nodes.muff} />
            <skinnedMesh
              name="muffler_tail"
              geometry={nodes.muffler_tail.geometry}
              material={materials.muffler_tail}
              skeleton={nodes.muffler_tail.skeleton}
            />
          </group>
        </group>
      </group>
    );
  },
);

FundyModel.displayName = 'FundyModel';

useGLTF.preload('/fundy/model.glb');
