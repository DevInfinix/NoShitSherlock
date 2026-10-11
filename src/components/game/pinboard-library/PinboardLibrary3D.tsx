"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { Catenary3DYarn } from "./Catenary3DYarn";
import { PinnedCaseCard3D } from "./PinnedCaseCard3D";
import { createProceduralCorkTexture } from "./textures";

interface PinboardLibrary3DProps {
  cases: ActiveCaseListing[];
  hoveredCase: ActiveCaseListing | null;
  selectedCase: ActiveCaseListing | null;
  onHoverCase: (c: ActiveCaseListing | null) => void;
  onSelectCase: (c: ActiveCaseListing) => void;
}

/**
 * Procedural Desk Ledge Props at the bottom of the pinboard:
 * Brass lamp base, glass ashtray, magnifying glass.
 */
function DeskLedgeProps({ yPos }: { yPos: number }) {
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C59E58"),
        metalness: 0.85,
        roughness: 0.28,
      }),
    [],
  );

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#21160F"),
        roughness: 0.7,
        metalness: 0.05,
      }),
    [],
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#E2ECF5"),
        transmission: 0.85,
        roughness: 0.12,
        ior: 1.5,
      }),
    [],
  );

  return (
    <group position={[0, yPos, 0.4]}>
      {/* Heavy Walnut Desk Ledge */}
      <mesh position={[0, -0.4, 0]} material={woodMaterial} receiveShadow>
        <boxGeometry args={[22, 0.6, 2.5]} />
      </mesh>

      {/* Brass Lamp Base at bottom left */}
      <mesh position={[-5.5, 0.08, 0.4]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.16, 24]} />
      </mesh>
      <mesh position={[-5.5, 0.6, 0.4]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.0, 16]} />
      </mesh>

      {/* Vintage Magnifying Glass at bottom right */}
      <group position={[5.2, 0.06, 0.4]} rotation={[-Math.PI / 2, 0, -0.4]}>
        <mesh material={brassMaterial} castShadow>
          <torusGeometry args={[0.42, 0.035, 12, 24]} />
        </mesh>
        <mesh material={glassMaterial}>
          <cylinderGeometry args={[0.4, 0.4, 0.015, 24]} />
        </mesh>
        <mesh position={[0, -0.7, 0]} material={woodMaterial} castShadow>
          <cylinderGeometry args={[0.04, 0.055, 0.65, 12]} />
        </mesh>
      </group>

      {/* Heavy Glass Ashtray */}
      <mesh position={[-2.8, 0.08, 0.6]} material={glassMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.58, 0.14, 8]} />
      </mesh>
    </group>
  );
}

/**
 * Dynamic Camera Rig with Mouse Parallax & Focus Pan.
 */
function CameraRig({ focusedCasePos }: { focusedCasePos: [number, number] | null }) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    const parallaxX = pointer.x * 0.4;
    const parallaxY = pointer.y * 0.25;

    let targetX = parallaxX;
    let targetY = parallaxY;
    let targetZ = 6.4;

    if (focusedCasePos) {
      targetX = focusedCasePos[0] * 0.4 + parallaxX * 0.15;
      targetY = focusedCasePos[1] * 0.4 + parallaxY * 0.15;
      targetZ = 5.9; // Subtle smooth zoom on focus
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);

    camera.lookAt(targetX * 0.35, targetY * 0.35, 0);
  });

  return null;
}

/**
 * Internal Scene Component adapting layout dynamically to viewport dimensions.
 */
function PinboardScene({
  cases,
  hoveredCase,
  selectedCase,
  onHoverCase,
  onSelectCase,
}: PinboardLibrary3DProps) {
  const { viewport } = useThree();

  // 1. Procedural Corkboard Textures
  const { diffuse, bump } = useMemo(() => createProceduralCorkTexture(512), []);

  useEffect(() => {
    return () => {
      diffuse.dispose();
      bump.dispose();
    };
  }, [diffuse, bump]);

  // 2. Responsive 3D Card Layout Coordinates ensuring zero viewport clipping
  const { cardLayouts, yarnPoints, cardScale } = useMemo(() => {
    const isUltraNarrow = viewport.width < 6.5; // Mobile portrait
    const isNarrow = viewport.width < 9.5; // Tablet / medium screen

    if (isUltraNarrow) {
      const scale = 0.72;
      const positions: Array<{ pos: [number, number, number]; rotZ: number }> = [
        { pos: [-1.15, 2.6, 0.05], rotZ: -0.04 },
        { pos: [1.15, 1.35, 0.05], rotZ: 0.03 },
        { pos: [-1.15, 0.05, 0.05], rotZ: -0.02 },
        { pos: [1.15, -1.35, 0.05], rotZ: 0.04 },
        { pos: [0.0, -2.7, 0.05], rotZ: -0.03 },
      ];
      const yarn: Array<[number, number, number]> = positions.map((p) => [
        p.pos[0],
        p.pos[1] + 1.15 * scale,
        0.12,
      ]);
      return { cardLayouts: positions, yarnPoints: yarn, cardScale: scale };
    }

    if (isNarrow) {
      const scale = 0.82;
      const positions: Array<{ pos: [number, number, number]; rotZ: number }> = [
        { pos: [-2.6, 1.4, 0.05], rotZ: -0.035 },
        { pos: [0.0, 1.6, 0.05], rotZ: 0.02 },
        { pos: [2.6, 1.3, 0.05], rotZ: -0.025 },
        { pos: [-1.4, -1.3, 0.05], rotZ: 0.03 },
        { pos: [1.4, -1.4, 0.05], rotZ: -0.03 },
      ];
      const yarn: Array<[number, number, number]> = positions.map((p) => [
        p.pos[0],
        p.pos[1] + 1.15 * scale,
        0.12,
      ]);
      return { cardLayouts: positions, yarnPoints: yarn, cardScale: scale };
    }

    // Wide Desktop: Responsive horizontal spread
    const spread = Math.min(1.0, viewport.width / 13.5);
    const scale = Math.max(0.85, Math.min(1.0, viewport.width / 12));
    const positions: Array<{ pos: [number, number, number]; rotZ: number }> = [
      { pos: [-4.6 * spread, 1.05, 0.05], rotZ: -0.035 },
      { pos: [-2.3 * spread, -0.65, 0.05], rotZ: 0.03 },
      { pos: [0.0, 1.25, 0.05], rotZ: -0.015 },
      { pos: [2.3 * spread, -0.6, 0.05], rotZ: 0.035 },
      { pos: [4.6 * spread, 0.95, 0.05], rotZ: -0.025 },
    ];
    const yarn: Array<[number, number, number]> = positions.map((p) => [
      p.pos[0],
      p.pos[1] + 1.15 * scale,
      0.12,
    ]);
    return { cardLayouts: positions, yarnPoints: yarn, cardScale: scale };
  }, [viewport.width]);

  // Active focused case position for camera tracking
  const activeItem = selectedCase ?? hoveredCase;
  const focusedCasePos = useMemo<[number, number] | null>(() => {
    if (!activeItem) return null;
    const idx = cases.findIndex((c) => c.slug === activeItem.slug);
    if (idx === -1 || !cardLayouts[idx]) return null;
    const l = cardLayouts[idx];
    return l ? [l.pos[0], l.pos[1]] : null;
  }, [activeItem, cases, cardLayouts]);

  const boardWidth = Math.max(18, viewport.width * 1.35);
  const boardHeight = Math.max(12, viewport.height * 1.35);

  return (
    <>
      {/* 1. Large Portuguese Corkboard Surface Covering Viewport */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[boardWidth, boardHeight]} />
        <meshStandardMaterial
          map={diffuse}
          bumpMap={bump}
          bumpScale={0.06}
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Procedural Red Yarn Connecting the Cases */}
      <Catenary3DYarn points={yarnPoints} isHovered={hoveredCase !== null} />

      {/* 3. The 5 Pinned 3D Case Dossier Cards */}
      {cases.map((caseItem, index) => {
        const layout = cardLayouts[index] ?? {
          pos: [index * 2 - 4, 0, 0.05],
          rotZ: 0,
        };
        const isHovered = hoveredCase?.slug === caseItem.slug;
        const isSelected = selectedCase?.slug === caseItem.slug;
        const isDimmed =
          (hoveredCase !== null && !isHovered) || (selectedCase !== null && !isSelected);

        return (
          <PinnedCaseCard3D
            key={caseItem.slug}
            caseItem={caseItem}
            position={layout.pos}
            baseRotationZ={layout.rotZ}
            scale={cardScale}
            isHovered={isHovered || isSelected}
            isDimmed={isDimmed}
            onHover={onHoverCase}
            onSelect={onSelectCase}
          />
        );
      })}

      {/* 4. Base Desk Ledge Props */}
      <DeskLedgeProps yPos={-viewport.height / 2 - 0.25} />

      {/* 5. Dynamic Camera Rig with Mouse Parallax & Focus Pan */}
      <CameraRig focusedCasePos={focusedCasePos} />
    </>
  );
}

export function PinboardLibrary3D({
  cases,
  hoveredCase,
  selectedCase,
  onHoverCase,
  onSelectCase,
}: PinboardLibrary3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-screen bg-[#0C0907] flex items-center justify-center">
        <span className="font-mono text-xs tracking-widest text-[#A9874A] uppercase animate-pulse">
          ASSEMBLING INVESTIGATION PINBOARD...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen select-none overflow-hidden">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 6.4], fov: 48 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#0C0907"]} />

        {/* 1. Warm Natural Ambient Light ensuring high clarity on all cards */}
        <ambientLight color="#FFF3DC" intensity={1.3} />

        {/* 2. Key Directional Studio Sun/Desk Light casting crisp soft shadows */}
        <directionalLight
          position={[4.5, 7.5, 5.5]}
          color="#FFF8EC"
          intensity={2.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* 3. Soft Cool Window Backlight from left */}
        <directionalLight position={[-6.0, 3.5, 3.0]} color="#8DAECF" intensity={0.65} />

        {/* 4. Front Fill Light to illuminate details */}
        <directionalLight position={[0, -2, 4]} color="#FFE8C2" intensity={0.5} />

        {/* The Responsive 3D Scene */}
        <PinboardScene
          cases={cases}
          hoveredCase={hoveredCase}
          selectedCase={selectedCase}
          onHoverCase={onHoverCase}
          onSelectCase={onSelectCase}
        />
      </Canvas>
    </div>
  );
}
