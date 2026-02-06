import { useAnimations, useGLTF, useTexture } from '@react-three/drei';
import { type ThreeElements, useGraph } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { useApplyEyeMaterials } from '@/feat/fundy/hooks/useApplyEyeMaterials';
import { useFixSkinnedMesh } from '@/feat/fundy/hooks/useFixSkinnedMesh';
import { useFundyEyeMaterial } from '@/feat/fundy/hooks/useFundyEyeMaterial';
import { useFundyHelloAction } from '@/feat/fundy/hooks/useFundyHelloAction';
import { useMorphAnimation } from '@/feat/fundy/hooks/useMorphAnimation';
import type { FundyAnimationConfig, GLTFResult } from '@/feat/fundy/types';

export type FundyModelProps = ThreeElements['group'] & {
  animation?: FundyAnimationConfig;
  enhancedEyes?: boolean;
};

export const FundyModel = forwardRef<THREE.Group, FundyModelProps>(
  ({ animation, enhancedEyes = true, ...props }, ref) => {
    const group = useRef<THREE.Group>(null!);
    const Primitive = ({ object }: { object?: THREE.Object3D | null }) =>
      object ? <primitive object={object} /> : null;
    const [actionClips, setActionClips] = useState<{
      hello?: THREE.AnimationAction | null;
      peek?: THREE.AnimationAction | null;
      fall?: THREE.AnimationAction | null;
      battle?: THREE.AnimationAction | null;
    }>({});

    // ref 전달
    useImperativeHandle(ref, () => group.current);

    // GLTF 로드 (캐싱됨)
    const { scene, animations } = useGLTF('/fundy/model.glb') as unknown as GLTFResult;

    // 씬 복제 (인스턴스마다 독립적인 애니메이션을 위해)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes, materials } = useGraph(clone) as unknown as GLTFResult;
    const { actions, clips, mixer } = useAnimations(animations, group);
    const helloActionRef = actions?.hello_action;
    const peekActionRef = actions?.peek_action;
    const fallActionRef = actions?.fall_action;
    const battleActionRef = actions?.battle_action;

    useEffect(() => {
      if (mixer && clips && group.current) {
        const getClip = (name: string) => clips.find(item => item.name === name);
        const next = {
          hello: getClip('hello_action'),
          peek: getClip('peek_action'),
          fall: getClip('fall_action'),
          battle: getClip('battle_action'),
        };
        if (next.hello || next.peek || next.fall || next.battle) {
          setActionClips({
            hello: next.hello ? mixer.clipAction(next.hello, group.current) : null,
            peek: next.peek ? mixer.clipAction(next.peek, group.current) : null,
            fall: next.fall ? mixer.clipAction(next.fall, group.current) : null,
            battle: next.battle ? mixer.clipAction(next.battle, group.current) : null,
          });
          return;
        }
      }
      if (helloActionRef || peekActionRef || fallActionRef || battleActionRef) {
        setActionClips({
          hello: helloActionRef ?? null,
          peek: peekActionRef ?? null,
          fall: fallActionRef ?? null,
          battle: battleActionRef ?? null,
        });
      }
    }, [helloActionRef, peekActionRef, fallActionRef, battleActionRef, clips, mixer]);

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

    // 눈알 재질 대체
    const eyeMaterial = useFundyEyeMaterial(eyeTextures);
    useApplyEyeMaterials({ enhancedEyes, eyeMaterial, nodes, materials });

    // SkinnedMesh 수정
    useFixSkinnedMesh(clone);
    // 애니메이션 컨트롤러
    useMorphAnimation(nodes, animation);

    const allActionClips = useMemo(
      () => [actionClips.hello, actionClips.peek, actionClips.fall, actionClips.battle],
      [actionClips.hello, actionClips.peek, actionClips.fall, actionClips.battle],
    );

    useFundyHelloAction({
      helloAction: animation?.helloAction,
      lookAt: animation?.lookAt,
      helloActionClip: actionClips.hello ?? null,
      idleExpressionOverride: 'smileSoft',
      resetClips: allActionClips,
    });
    useFundyHelloAction({
      actionTrigger: animation?.peekAction,
      actionClip: actionClips.peek ?? null,
      lookAt: animation?.lookAt,
      idleExpressionOverride: 'smileOpenBig',
      forceIdleExpressionOverride: true,
      idleExpressionDelayMsOverride: 0,
      resetClips: allActionClips,
    });
    useFundyHelloAction({
      actionTrigger: animation?.fallAction,
      actionClip: actionClips.fall ?? null,
      lookAt: animation?.lookAt,
      idleExpressionOverride: 'open_O',
      idleExpressionHoldOverride: false,
      forceIdleExpressionOverride: true,
      resetClips: allActionClips,
    });
    useFundyHelloAction({
      actionTrigger: animation?.battleAction,
      actionClip: actionClips.battle ?? null,
      lookAt: animation?.lookAt,
      idleExpressionOverride: 'angry',
      forceIdleExpressionOverride: true,
      resetClips: allActionClips,
    });

    return (
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="bone_body">
            <Primitive object={nodes['DEF-spine']} />
            <Primitive object={nodes['DEF-pelvisL']} />
            <Primitive object={nodes['DEF-pelvisR']} />
            <Primitive object={nodes['DEF-thighL']} />
            <Primitive object={nodes['DEF-thighR']} />
            <Primitive object={nodes['DEF-earL']} />
            <Primitive object={nodes['DEF-earL001']} />
            <Primitive object={nodes['DEF-earL002']} />
            <Primitive object={nodes['DEF-earL004']} />
            <Primitive object={nodes['DEF-earR']} />
            <Primitive object={nodes['DEF-earR001']} />
            <Primitive object={nodes['DEF-earR002']} />
            <Primitive object={nodes['DEF-earR004']} />
            <Primitive object={nodes['DEF-teethT']} />
            <Primitive object={nodes['DEF-nose002']} />
            <Primitive object={nodes['DEF-noseL001']} />
            <Primitive object={nodes['DEF-noseR001']} />
            <Primitive object={nodes['DEF-eye_masterL']} />
            <Primitive object={nodes['DEF-lidBL']} />
            <Primitive object={nodes['DEF-lidTL']} />
            <Primitive object={nodes['DEF-eyeL']} />
            <Primitive object={nodes['DEF-eye_masterR']} />
            <Primitive object={nodes['DEF-lidBR']} />
            <Primitive object={nodes['DEF-lidTR']} />
            <Primitive object={nodes['DEF-eyeR']} />
            <Primitive object={nodes['DEF-teethB']} />
            <Primitive object={nodes['DEF-tongue']} />
            <Primitive object={nodes['DEF-jaw_master']} />
            <Primitive object={nodes['DEF-chin']} />
            <Primitive object={nodes['DEF-jaw']} />
            <Primitive object={nodes['DEF-jawL']} />
            <Primitive object={nodes['DEF-jawR']} />
            <Primitive object={nodes['DEF-lipTL']} />
            <Primitive object={nodes['DEF-lipTR']} />
            <Primitive object={nodes['DEF-lipBL']} />
            <Primitive object={nodes['DEF-lipBR']} />
            <Primitive object={nodes['DEF-browBL']} />
            <Primitive object={nodes['DEF-browBL004']} />
            <Primitive object={nodes['DEF-browBR']} />
            <Primitive object={nodes['DEF-browBR004']} />
            <Primitive object={nodes['DEF-browTL']} />
            <Primitive object={nodes['DEF-browTL001']} />
            <Primitive object={nodes['DEF-browTL003']} />
            <Primitive object={nodes['DEF-browTR']} />
            <Primitive object={nodes['DEF-browTR001']} />
            <Primitive object={nodes['DEF-browTR003']} />
            <Primitive object={nodes['DEF-cheekBL']} />
            <Primitive object={nodes['DEF-cheekBR']} />
            <Primitive object={nodes['DEF-cheekTL']} />
            <Primitive object={nodes['DEF-cheekTR']} />
            <Primitive object={nodes['DEF-foreheadL']} />
            <Primitive object={nodes['DEF-foreheadL001']} />
            <Primitive object={nodes['DEF-foreheadL002']} />
            <Primitive object={nodes['DEF-foreheadR']} />
            <Primitive object={nodes['DEF-foreheadR001']} />
            <Primitive object={nodes['DEF-foreheadR002']} />
            <Primitive object={nodes['DEF-nose']} />
            <Primitive object={nodes['DEF-nose004']} />
            <Primitive object={nodes['DEF-templeL']} />
            <Primitive object={nodes['DEF-templeR']} />
            <Primitive object={nodes['DEF-shoulderL']} />
            <Primitive object={nodes['DEF-upper_armL']} />
            <Primitive object={nodes['DEF-shoulderR']} />
            <Primitive object={nodes['DEF-upper_armR']} />
            <Primitive object={nodes['DEF-breastL']} />
            <Primitive object={nodes['DEF-breastR']} />
            <Primitive object={nodes.neutral_bone} />
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
            <Primitive object={nodes.tail_1} />
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
            <Primitive object={nodes.muff} />
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
