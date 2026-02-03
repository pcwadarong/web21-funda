import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * GLTF 모델의 모든 SkinnedMesh에 frustumCulled를 비활성화하고
 * geometry의 bounding box/sphere를 계산하는 hook
 */
export function useFixSkinnedMesh(scene: THREE.Group | THREE.Object3D) {
  useEffect(() => {
    if (!scene) return;

    scene.traverse(child => {
      if (child instanceof THREE.SkinnedMesh) {
        // Frustum culling 비활성화 (렌더링 강제)
        child.frustumCulled = false;

        // Geometry 유효성 검사 및 bounding 계산
        const geo = child.geometry;
        if (geo?.attributes?.position && geo.attributes.position.count > 0) {
          try {
            if (!geo.boundingBox) geo.computeBoundingBox();
            if (!geo.boundingSphere) geo.computeBoundingSphere();
          } catch (error) {
            console.warn(`Failed to compute bounds for ${child.name}:`, error);
          }
        }

        // MorphTargets 초기화 (shape keys 있는 경우)
        if (child.morphTargetInfluences && child.morphTargetDictionary) {
          // morphTargetInfluences가 undefined인 경우 초기화
          const morphCount = Object.keys(child.morphTargetDictionary).length;
          if (child.morphTargetInfluences.length !== morphCount) {
            child.morphTargetInfluences = new Array(morphCount).fill(0);
          }
        }
      }
    });
  }, [scene]);
}
