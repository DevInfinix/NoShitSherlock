"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { createAgedPaperTexture } from "./textures";

interface PinnedCaseCard3DProps {
  caseItem: ActiveCaseListing;
  caseIndex?: number;
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
  caseIndex = 0,
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
  const dimPlaneRef = useRef<THREE.Mesh>(null);

  // 1. Procedural Aged Golden Manila / Tea-Stained Parchment Textures
  const { diffuse, bump } = useMemo(
    () =>
      createAgedPaperTexture(
        caseItem.title,
        `CASE-0${caseItem.id}`,
        caseItem.difficulty,
        caseIndex,
        1024,
      ),
    [caseItem.title, caseItem.id, caseItem.difficulty, caseIndex],
  );

  // 2. Antique Turned Brass Pushpin Material
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C89E58"),
        metalness: 0.86,
        roughness: 0.26,
      }),
    [],
  );

  // 3. Realistic Manila Paper Material with Dog-Eared Corner Curvature Shader
  const paperMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: diffuse,
      bumpMap: bump,
      bumpScale: 0.035,
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    // Custom GLSL vertex displacement for physical dog-eared paper curl
    mat.customProgramCacheKey = () => "curled-paper-dossier-v2";
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        // Smooth dog-eared corner curl at bottom-right (uv.x -> 1.0, uv.y -> 0.0)
        float brDistance = length(vec2(uv.x - 1.0, uv.y - 0.0));
        float brCurl = smoothstep(0.48, 0.0, brDistance) * 0.085;

        // Subtle top-left lift (uv.x -> 0.0, uv.y -> 1.0)
        float tlDistance = length(vec2(uv.x - 0.0, uv.y - 1.0));
        float tlCurl = smoothstep(0.38, 0.0, tlDistance) * 0.045;

        // Gravitational bow: paper sags slightly forward away from board in center
        float centralBow = sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * 0.028;

        transformed.z += (brCurl + tlCurl + centralBow);
        `,
      );
    };

    return mat;
  }, [diffuse, bump]);

  useEffect(() => {
    return () => {
      diffuse.dispose();
      bump.dispose();
      paperMaterial.dispose();
      brassMaterial.dispose();
    };
  }, [diffuse, bump, paperMaterial, brassMaterial]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth Z elevation on hover: card pulls forward toward flashlight
    const targetZ = position[2] + (isHovered ? 0.65 : 0);
    meshRef.current.position.z = THREE.MathUtils.damp(
      meshRef.current.position.z,
      targetZ,
      7.0,
      delta,
    );

    // Subtle pointer parallax tilt
    const targetRotX = isHovered ? -pointerOffset.current.y * 0.22 : 0;
    const targetRotY = isHovered ? pointerOffset.current.x * 0.24 : 0;
    const targetRotZ = baseRotationZ + (isHovered ? 0 : 0);

    meshRef.current.rotation.x = THREE.MathUtils.damp(
      meshRef.current.rotation.x,
      targetRotX,
      6.0,
      delta,
    );
    meshRef.current.rotation.y = THREE.MathUtils.damp(
      meshRef.current.rotation.y,
      targetRotY,
      6.0,
      delta,
    );
    meshRef.current.rotation.z = THREE.MathUtils.damp(
      meshRef.current.rotation.z,
      targetRotZ,
      6.0,
      delta,
    );

    // Smooth radial atmospheric dimming: when another card is hovered, fade to 60% dimming smoothly
    if (dimPlaneRef.current) {
      const targetDimOpacity = isDimmed && !isHovered ? 0.58 : 0;
      const mat = dimPlaneRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, targetDimOpacity, 9.0, delta);
      dimPlaneRef.current.visible = mat.opacity > 0.01;
    }
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F Canvas group element
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      rotation={[0, 0, baseRotationZ]}
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
      {/* 3D Paper Dossier Cardstock Mesh with 32x32 segments for smooth curvature */}
      <mesh material={paperMaterial} castShadow receiveShadow>
        <planeGeometry args={[1.9, 2.62, 32, 32]} />
      </mesh>

      {/* Atmospheric Dimming Shroud with smooth ease opacity transition */}
      <mesh ref={dimPlaneRef} position={[0, 0, 0.018]} visible={false}>
        <planeGeometry args={[1.92, 2.64]} />
        <meshBasicMaterial color="#060504" transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Heavy Stepped Brass Pushpin at top center of paper */}
      <group position={[0, 1.22, 0.06]}>
        {/* Steel pin shaft piercing paper */}
        <mesh position={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.014, 0.014, 0.1, 12]} />
          <meshStandardMaterial color="#888888" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Stepped brass base flange */}
        <mesh position={[0, 0, 0.01]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.075, 0.09, 0.045, 16]} />
        </mesh>
        {/* Brass grip collar */}
        <mesh position={[0, 0, 0.06]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.06, 0.075, 0.075, 16]} />
        </mesh>
        {/* Crimson enamel lacquer domed top */}
        <mesh position={[0, 0, 0.1]} castShadow>
          <sphereGeometry args={[0.062, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#A81626" metalness={0.25} roughness={0.18} />
        </mesh>
      </group>
    </group>
  );
}
