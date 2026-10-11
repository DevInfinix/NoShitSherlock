"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface Catenary3DYarnProps {
  points: Array<[number, number, number]>;
  isHovered?: boolean;
}

/**
 * Creates a procedural wool micro-fiber bump texture for the yarn surface.
 */
function createWoolFuzzBumpTexture(): THREE.Texture {
  if (typeof window === "undefined") return new THREE.Texture();

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 128, 128);

  const imgData = ctx.getImageData(0, 0, 128, 128);
  const pixels = imgData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const fuzz = (Math.random() - 0.5) * 80;
    const val = Math.min(255, Math.max(0, 128 + fuzz));
    pixels[i] = val;
    pixels[i + 1] = val;
    pixels[i + 2] = val;
    pixels[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 2);
  return texture;
}

/**
 * Procedural 3D Crimson Wool Yarn Engine with harmonic spring sag physics.
 */
export function Catenary3DYarn({ points, isHovered = false }: Catenary3DYarnProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Harmonic spring oscillator state for yarn physical sway
  const springState = useRef({
    displacement: 0,
    velocity: 0,
    target: 0,
  });

  const woolFuzzMap = useMemo(() => createWoolFuzzBumpTexture(), []);

  useEffect(() => {
    return () => {
      woolFuzzMap.dispose();
    };
  }, [woolFuzzMap]);

  // Authentic matte crimson wool material (zero plastic shine)
  const woolMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#9E1B27"),
        roughness: 0.96, // completely matte wool
        metalness: 0.02,
        bumpMap: woolFuzzMap,
        bumpScale: 0.05,
      }),
    [woolFuzzMap],
  );

  // Deep dark shadow underneath yarn on the felt board
  const shadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#080F0A"),
        transparent: true,
        opacity: 0.45,
      }),
    [],
  );

  // Generate 3D tube geometries with natural catenary sag between each sequential pair
  const tubeMeshes = useMemo(() => {
    const meshes: Array<{
      curve: THREE.CatmullRomCurve3;
      shadowCurve: THREE.CatmullRomCurve3;
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

      // Distance-dependent gravitational catenary sag
      const dist = pA.distanceTo(pB);
      const sag = Math.max(0.18, Math.min(0.52, dist * 0.13));

      // Midpoint droop with forward Z displacement to clear paper cards
      const mid = pA.clone().add(pB).multiplyScalar(0.5);
      mid.y -= sag;
      mid.z = Math.max(pA.z, pB.z) + 0.06;

      const curve = new THREE.CatmullRomCurve3([pA, mid, pB]);

      // Shadow projection curve resting directly on the felt surface (z: 0.01)
      const sA = new THREE.Vector3(pA.x, pA.y - 0.04, 0.01);
      const sMid = new THREE.Vector3(mid.x, mid.y - 0.04, 0.01);
      const sB = new THREE.Vector3(pB.x, pB.y - 0.04, 0.01);
      const shadowCurve = new THREE.CatmullRomCurve3([sA, sMid, sB]);

      meshes.push({ curve, shadowCurve, pA, pB, sag });
    }

    return meshes;
  }, [points]);

  // Trigger spring disturbance on hover transition
  useEffect(() => {
    if (isHovered) {
      springState.current.velocity += 0.45; // perturb thread
    }
  }, [isHovered]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Second-order harmonic spring integration: F = -k*x - c*v
    const k = 28.0; // spring stiffness
    const c = 3.8; // damping factor
    const force = -k * springState.current.displacement - c * springState.current.velocity;
    springState.current.velocity += force * Math.min(0.033, delta);
    springState.current.displacement += springState.current.velocity * Math.min(0.033, delta);

    groupRef.current.position.y = springState.current.displacement * 0.025;
  });

  return (
    <group ref={groupRef}>
      {tubeMeshes.map((item) => {
        const yarnGeo = new THREE.TubeGeometry(item.curve, 36, 0.016, 7, false);
        const shadowGeo = new THREE.TubeGeometry(item.shadowCurve, 24, 0.014, 5, false);

        return (
          <group key={`yarn-thread-${item.pA.x.toFixed(2)}-${item.pB.x.toFixed(2)}`}>
            {/* Soft contact shadow on the green felt */}
            <mesh geometry={shadowGeo} material={shadowMaterial} />
            {/* Primary crimson wool yarn strand */}
            <mesh geometry={yarnGeo} material={woolMaterial} castShadow />
          </group>
        );
      })}
    </group>
  );
}
