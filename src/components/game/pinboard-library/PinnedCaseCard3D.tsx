"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { createAgedPaperTexture } from "./textures";

interface PinnedCaseCard3DProps {
  caseItem: ActiveCaseListing;
  position: [number, number, number];
  baseRotationZ?: number;
  scale?: number;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: (item: ActiveCaseListing | null) => void;
  onSelect: (item: ActiveCaseListing) => void;
}

export function PinnedCaseCard3D({
  caseItem,
  position,
  baseRotationZ = 0,
  scale = 1.0,
  isHovered,
  isDimmed,
  onHover,
  onSelect,
}: PinnedCaseCard3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const pointerOffset = useRef({ x: 0, y: 0 });

  // 1. Procedural Aged Manila Paper Texture
  const paperTexture = useMemo(
    () =>
      createAgedPaperTexture(
        caseItem.title,
        `FILE #${caseItem.id.toString().padStart(3, "0")}`,
        caseItem.difficulty,
      ),
    [caseItem.title, caseItem.id, caseItem.difficulty],
  );

  // 2. Brass Pushpin Material
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C59E58"),
        metalness: 0.85,
        roughness: 0.25,
      }),
    [],
  );

  // 3. Multi-surface Paper Material (Front has dossier graphics, back/edges have kraft paper)
  const paperMaterials = useMemo(() => {
    const edgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#D8C9AE"),
      roughness: 0.85,
    });
    const frontMat = new THREE.MeshStandardMaterial({
      map: paperTexture,
      roughness: 0.75,
      metalness: 0.05,
    });
    return [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, edgeMat];
  }, [paperTexture]);

  useEffect(() => {
    return () => {
      paperTexture.dispose();
    };
  }, [paperTexture]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Target Z position: Lifts forward by 0.65 units when hovered
    const targetZ = position[2] + (isHovered ? 0.65 : 0);
    meshRef.current.position.z = THREE.MathUtils.damp(
      meshRef.current.position.z,
      targetZ,
      6.0,
      delta,
    );

    // Target Tilt Rotation: reacts to pointer when hovered, rests at baseRotationZ when idle
    const targetRotX = isHovered ? pointerOffset.current.y * 0.25 : 0;
    const targetRotY = isHovered ? pointerOffset.current.x * 0.25 : 0;
    const targetRotZ = isHovered ? 0 : baseRotationZ;

    meshRef.current.rotation.x = THREE.MathUtils.damp(
      meshRef.current.rotation.x,
      targetRotX,
      5.0,
      delta,
    );
    meshRef.current.rotation.y = THREE.MathUtils.damp(
      meshRef.current.rotation.y,
      targetRotY,
      5.0,
      delta,
    );
    meshRef.current.rotation.z = THREE.MathUtils.damp(
      meshRef.current.rotation.z,
      targetRotZ,
      5.0,
      delta,
    );

    // Scale dampening for tactile spring pop with responsive scale multiplier
    const targetScale = (isHovered ? 1.08 : 1.0) * scale;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.damp(meshRef.current.scale.x, targetScale, 6.0, delta),
    );
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F Canvas 3D object interaction
    <group
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(caseItem);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        // Viewport relative pointer tilt coordinates
        pointerOffset.current = {
          x: (e.uv?.x ?? 0.5) - 0.5,
          y: (e.uv?.y ?? 0.5) - 0.5,
        };
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(caseItem);
      }}
    >
      {/* 3D Paper Dossier Cardstock Mesh */}
      <mesh material={paperMaterials} castShadow receiveShadow>
        <boxGeometry args={[1.85, 2.5, 0.02]} />
      </mesh>

      {/* Atmospheric Dimming Shroud when another card is hovered */}
      {isDimmed && (
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[1.86, 2.51]} />
          <meshBasicMaterial color="#0A0807" transparent opacity={0.65} />
        </mesh>
      )}

      {/* Heavy Brass Pushpin at top center of paper */}
      <group position={[0, 1.15, 0.05]}>
        {/* Needle post */}
        <mesh position={[0, 0, -0.04]} material={brassMaterial}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 12]} />
        </mesh>
        {/* Outer Flange */}
        <mesh position={[0, 0, 0.01]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.075, 0.09, 0.05, 16]} />
        </mesh>
        {/* Grip Cap with Red Lacquer Center */}
        <mesh position={[0, 0, 0.06]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.06, 0.075, 0.08, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#A7192D" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Optional Gold Brass Paperclip at top-right corner */}
      <group position={[0.7, 1.05, 0.02]} rotation={[0, 0, 0.35]}>
        <mesh material={brassMaterial}>
          <torusGeometry args={[0.08, 0.012, 8, 16, Math.PI * 1.5]} />
        </mesh>
      </group>
    </group>
  );
}
