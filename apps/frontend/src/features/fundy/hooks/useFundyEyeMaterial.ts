import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * 눈알 반짝임 재질 생성/정리 훅
 */
export function useFundyEyeMaterial(textures: THREE.Texture[]) {
  const eyeMaterial = useMemo(() => {
    if (textures.length !== 3) return undefined;
    const [colorMap, roughnessMap, transmissionMap] = textures;
    return new THREE.MeshPhysicalMaterial({
      map: colorMap,
      roughnessMap: roughnessMap,
      transmissionMap: transmissionMap,
      transmission: 0.95,
      ior: 1.2, // 유리 굴절률
      thickness: 0.1,
      roughness: 0.1,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
  }, [textures]);

  useEffect(() => () => eyeMaterial?.dispose(), [eyeMaterial]);

  return eyeMaterial;
}
