"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createWoolYarnBumpTexture } from "./textures";

interface Catenary3DYarnProps {
  hubPoint?: [number, number, number];
  points: Array<[number, number, number]>;
  isHovered?: boolean;
}

export function Catenary3DYarn({
  hubPoint = [0, 1.45, 0.1],
  points,
  isHovered = false,
}: Catenary3DYarnProps) {
  const groupRef = useRef<THREE.Group>(null);
  const springDisplacement = useRef(0);
  const springVelocity = useRef(0);

  const woolBumpMap = useMemo(() => createWoolYarnBumpTexture(), []);

  const woolMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#BA1E28"),
        bumpMap: woolBumpMap,
        bumpScale: 0.04,
        roughness: 0.88,
        metalness: 0.02,
      }),
    [woolBumpMap],
  );

  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C89E58"),
        metalness: 0.88,
        roughness: 0.25,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      woolBumpMap.dispose();
      woolMaterial.dispose();
      brassMaterial.dispose();
    };
  }, [woolBumpMap, woolMaterial, brassMaterial]);

  useEffect(() => {
    if (isHovered) {
      springVelocity.current += 0.08;
    }
  }, [isHovered]);

  const radiatingCurves = useMemo(() => {
    if (points.length === 0) return [];

    return points.map((pCard) => {
      const dist = Math.hypot(pCard[0] - hubPoint[0], pCard[1] - hubPoint[1]);
      const sagDepth = 0.18 + dist * 0.06;
      const steps = 24;
      const strandPoints: THREE.Vector3[] = [];

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = THREE.MathUtils.lerp(hubPoint[0], pCard[0], t);
        const yBase = THREE.MathUtils.lerp(hubPoint[1], pCard[1], t);
        const zBase = THREE.MathUtils.lerp(hubPoint[2], pCard[2], t);
        const sag = Math.sin(t * Math.PI) * sagDepth;

        strandPoints.push(new THREE.Vector3(x, yBase - sag, zBase));
      }

      return new THREE.CatmullRomCurve3(strandPoints);
    });
  }, [hubPoint, points]);

  useFrame((_, delta) => {
    const k = 22.0;
    const c = 3.5;
    const force = -k * springDisplacement.current - c * springVelocity.current;
    springVelocity.current += force * Math.min(delta, 0.05);
    springDisplacement.current += springVelocity.current * Math.min(delta, 0.05);

    if (groupRef.current) {
      groupRef.current.position.y = springDisplacement.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Scotland Yard Hub Anchor Pushpin */}
      <group position={hubPoint}>
        <mesh position={[0, 0, -0.02]} material={brassMaterial}>
          <cylinderGeometry args={[0.14, 0.16, 0.04, 20]} />
        </mesh>
        <mesh position={[0, 0, 0.02]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.06, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.06]} castShadow>
          <sphereGeometry args={[0.075, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#8B141E" metalness={0.2} roughness={0.15} />
        </mesh>
      </group>

      {/* Radiating Crimson Wool Yarn Strands */}
      {radiatingCurves.map((curve, idx) => {
        const key = `yarn-strand-${idx}`;
        return (
          <mesh
            key={key}
            geometry={new THREE.TubeGeometry(curve, 36, 0.024, 8, false)}
            material={woolMaterial}
            castShadow
          />
        );
      })}
    </group>
  );
}
