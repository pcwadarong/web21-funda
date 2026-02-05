import { useEffect } from 'react';
import type * as THREE from 'three';

import type { GLTFResult } from '@/feat/fundy/types';

/**
 * 눈알/홍채 재질을 모델에 적용하는 훅
 */
export function useApplyEyeMaterials(params: {
  enhancedEyes: boolean;
  eyeMaterial?: THREE.Material;
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
}) {
  const { enhancedEyes, eyeMaterial, nodes, materials } = params;

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
}
