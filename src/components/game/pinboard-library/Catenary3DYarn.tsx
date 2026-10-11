"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createWoolYarnBumpTexture } from "./textures";

interface Catenary3DYarnProps {
  points: Array<[number, number, number]>;
  isHovered?: boolean;
}

/**
 * Procedural 3D Crimson Wool Yarn Engine with authentic gravitational catenary sag
 * and harmonic spring dampening physics.
 */
export function Catenary3DYarn({ points, isHovered = false }: Catenary3DYarnProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowMeshRef = useRef<THREE.Mesh>(null);

  // Harmonic spring oscillator state for yarn physical sway
  const springState = useRef({
    displacement: 0,
    velocity: 0,
    target: 0,
  });

  const woolBumpMap = useMemo(() => createWoolYarnBumpTexture(256), []);

  // Wool yarn PBR material: matte, thick crimson wool (#9E1A22)
  const woolMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9E1A22"),
        bumpMap: woolBumpMap,
        bumpScale: 0.055,
        roughness: 0.96,
        metalness: 0.0,
      }),
    [woolBumpMap],
  );

  // Soft contact shadow strand resting on the green felt
  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#080D0A"),
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      woolBumpMap.dispose();
      woolMaterial.dispose();
      shadowMaterial.dispose();
    };
  }, [woolBumpMap, woolMaterial, shadowMaterial]);

  // When hover state triggers, apply physical impulse to the yarn spring
  useEffect(() => {
    if (isHovered) {
      springState.current.velocity += 0.085;
    }
  }, [isHovered]);

  // Construct catenary curves through pushpin anchor points
  const curveSegments = useMemo(() => {
    if (points.length < 2) return null;

    const curves: THREE.CatmullRomCurve3[] = [];
    const shadowCurves: THREE.CatmullRomCurve3[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (!p1 || !p2) continue;

      const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      // Gravitational sag proportional to distance between pushpins
      const sagDepth = 0.22 + dist * 0.06;

      const steps = 18;
      const strandPoints: THREE.Vector3[] = [];
      const shadowPoints: THREE.Vector3[] = [];

      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        // Linear interpolation
        const x = THREE.MathUtils.lerp(p1[0], p2[0], t);
        const yBase = THREE.MathUtils.lerp(p1[1], p2[1], t);
        const zBase = THREE.MathUtils.lerp(p1[2], p2[2], t);

        // Gravitational catenary sag equation: 4 * sag * t * (1 - t)
        const sag = Math.sin(t * Math.PI) * sagDepth;

        strandPoints.push(new THREE.Vector3(x, yBase - sag, zBase + 0.015));
        shadowPoints.push(new THREE.Vector3(x, yBase - sag * 0.85, 0.008));
      }

      curves.push(new THREE.CatmullRomCurve3(strandPoints));
      shadowCurves.push(new THREE.CatmullRomCurve3(shadowPoints));
    }

    return { curves, shadowCurves };
  }, [points]);

  // Spring physics loop for natural physical bounce
  useFrame((_, delta) => {
    const k = 22.0; // Spring stiffness
    const c = 3.8; // Damping coefficient

    const spring = springState.current;
    const force = -k * spring.displacement - c * spring.velocity;
    spring.velocity += force * Math.min(delta, 0.05);
    spring.displacement += spring.velocity * Math.min(delta, 0.05);

    if (groupRef.current) {
      groupRef.current.position.y = spring.displacement;
    }
  });

  if (!curveSegments || points.length < 2) return null;

  return (
    <group ref={groupRef}>
      {curveSegments.curves.map((curve, idx) => {
        const key = `yarn-seg-${idx}-${curve.points.length}`;
        return (
          <group key={key}>
            {/* Soft Contact Shadow beneath Yarn */}
            <mesh
              ref={shadowMeshRef}
              geometry={
                new THREE.TubeGeometry(
                  curveSegments.shadowCurves[idx] ?? curve,
                  48,
                  0.026,
                  6,
                  false,
                )
              }
              material={shadowMaterial}
            />
            {/* Thick Crimson Wool Yarn Mesh */}
            <mesh
              ref={meshRef}
              geometry={new THREE.TubeGeometry(curve, 48, 0.032, 8, false)}
              material={woolMaterial}
              castShadow
            />
          </group>
        );
      })}
    </group>
  );
}
