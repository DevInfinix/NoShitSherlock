"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface Catenary3DYarnProps {
  points: Array<[number, number, number]>;
  isHovered?: boolean;
}

/**
 * Procedural 3D Red Yarn Engine.
 * Generates continuous crimson wool thread linking adjacent pushpins
 * with realistic gravitational catenary sag and subtle spring oscillation.
 */
export function Catenary3DYarn({ points, isHovered = false }: Catenary3DYarnProps) {
  const groupRef = useRef<THREE.Group>(null);
  const vibrationRef = useRef(0);

  // Wool yarn material with high roughness and deep crimson hue
  const yarnMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#A7192D"),
        roughness: 0.85,
        metalness: 0.05,
      }),
    [],
  );

  // Generate 3D tube geometries with natural gravitational catenary sag between each pair
  const tubeMeshes = useMemo(() => {
    const meshes: Array<{
      curve: THREE.CatmullRomCurve3;
      pA: THREE.Vector3;
      pB: THREE.Vector3;
      sag: number;
    }> = [];

    for (let i = 0; i < points.length - 1; i++) {
      const pAArr = points[i];
      const pBArr = points[i + 1];
      if (!pAArr || !pBArr) continue;

      const pA = new THREE.Vector3(...pAArr);
      const pB = new THREE.Vector3(...pBArr);

      // Distance-dependent gravitational sag
      const dist = pA.distanceTo(pB);
      const sag = Math.max(0.15, Math.min(0.45, dist * 0.12));

      // Calculate mid-sag point with slight outward Z displacement so thread clears paper
      const mid = pA.clone().add(pB).multiplyScalar(0.5);
      mid.y -= sag;
      mid.z = Math.max(pA.z, pB.z) + 0.05;

      const curve = new THREE.CatmullRomCurve3([pA, mid, pB]);
      meshes.push({ curve, pA, pB, sag });
    }

    return meshes;
  }, [points]);

  useFrame((state, delta) => {
    // Subtle spring physics / tension vibration when user hovers cards
    if (isHovered) {
      vibrationRef.current = THREE.MathUtils.damp(vibrationRef.current, 1, 4, delta);
    } else {
      vibrationRef.current = THREE.MathUtils.damp(vibrationRef.current, 0, 2, delta);
    }

    if (groupRef.current && vibrationRef.current > 0.01) {
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(time * 12) * 0.012 * vibrationRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      {tubeMeshes.map((item) => {
        const geo = new THREE.TubeGeometry(item.curve, 32, 0.014, 6, false);
        return (
          <mesh
            key={`yarn-thread-${item.pA.x}-${item.pB.x}`}
            geometry={geo}
            material={yarnMaterial}
            castShadow
          />
        );
      })}
    </group>
  );
}
