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
  activeCase: ActiveCaseListing | null;
  onHoverCase: (c: ActiveCaseListing | null) => void;
  onSelectCase: (c: ActiveCaseListing) => void;
}

/**
 * Venetian Blind Slats Shadow Caster.
 * Geometry positioned in front of the key spotlight to cast
 * authentic noir chiaroscuro horizontal blind slats across the corkboard.
 */
function VenetianBlindSlatShadows() {
  const slats = useMemo(() => {
    const list: Array<[number, number, number]> = [];
    for (let i = -8; i <= 8; i++) {
      list.push([0, i * 0.45, 3.2]);
    }
    return list;
  }, []);

  return (
    <group>
      {slats.map((pos) => (
        <mesh key={`slat-${pos[1]}`} position={pos} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[16, 0.18, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Procedural Desk Ledge Props at the bottom of the pinboard:
 * Brass lamp neck, glass ashtray, magnifying glass, evidence envelope.
 */
function DeskLedgeProps() {
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
    <group position={[0, -3.7, 0.4]}>
      {/* Heavy Walnut Desk Ledge */}
      <mesh position={[0, -0.4, 0]} material={woodMaterial} receiveShadow>
        <boxGeometry args={[16, 0.6, 2.5]} />
      </mesh>

      {/* Brass Lamp Base at bottom left */}
      <mesh position={[-4.8, 0.08, 0.4]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.16, 24]} />
      </mesh>
      <mesh position={[-4.8, 0.6, 0.4]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.0, 16]} />
      </mesh>

      {/* Vintage Magnifying Glass at bottom right */}
      <group position={[4.5, 0.06, 0.4]} rotation={[-Math.PI / 2, 0, -0.4]}>
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
      <mesh position={[-2.4, 0.08, 0.6]} material={glassMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.58, 0.14, 8]} />
      </mesh>
    </group>
  );
}

/**
 * Camera Rig providing cursor parallax and smooth focus camera panning onto hovered case.
 */
function CameraRig({ activeCase }: { activeCase: ActiveCaseListing | null }) {
  const { camera, pointer } = useThree();

  const casePositions = useMemo<Record<string, [number, number]>>(() => {
    return {
      "case-01-missing-ledger": [-4.2, 1.1],
      "case-02-static-on-the-line": [-2.1, -0.6],
      "case-03-the-vanishing-bride": [0.0, 1.2],
      "case-04-the-last-reservation": [2.1, -0.5],
      "case-05-flat-4b": [4.2, 1.0],
    };
  }, []);

  useFrame((_, delta) => {
    // Parallax sway
    const parallaxX = pointer.x * 0.45;
    const parallaxY = pointer.y * 0.3;

    // If a case is hovered, gently pull camera toward it
    let targetX = parallaxX;
    let targetY = parallaxY;
    let targetZ = 6.4;

    if (activeCase && casePositions[activeCase.slug]) {
      const pos = casePositions[activeCase.slug];
      if (pos) {
        targetX = pos[0] * 0.35 + parallaxX * 0.2;
        targetY = pos[1] * 0.35 + parallaxY * 0.2;
        targetZ = 5.8; // Subtle zoom
      }
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);

    camera.lookAt(targetX * 0.4, targetY * 0.4, 0);
  });

  return null;
}

export function PinboardLibrary3D({
  cases,
  activeCase,
  onHoverCase,
  onSelectCase,
}: PinboardLibrary3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Procedural Corkboard Textures
  const { diffuse, bump } = useMemo(() => createProceduralCorkTexture(512), []);

  useEffect(() => {
    return () => {
      diffuse.dispose();
      bump.dispose();
    };
  }, [diffuse, bump]);

  // 2. Fixed layout coordinates for the 5 cases across the pinboard
  const cardLayouts = useMemo<Array<{ pos: [number, number, number]; rotZ: number }>>(
    () => [
      { pos: [-4.2, 1.15, 0.05], rotZ: -0.035 },
      { pos: [-2.1, -0.65, 0.05], rotZ: 0.03 },
      { pos: [0.0, 1.25, 0.05], rotZ: -0.015 },
      { pos: [2.1, -0.55, 0.05], rotZ: 0.035 },
      { pos: [4.2, 1.05, 0.05], rotZ: -0.025 },
    ],
    [],
  );

  // 3. Sequential Red Yarn Connecting Points (aligned to each card's pushpin coordinate)
  const yarnPoints = useMemo<Array<[number, number, number]>>(() => {
    return [
      [-4.2, 2.3, 0.12],
      [-2.1, 0.5, 0.12],
      [0.0, 2.4, 0.12],
      [2.1, 0.6, 0.12],
      [4.2, 2.2, 0.12],
    ];
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[640px] bg-[#0E0B09] flex items-center justify-center">
        <span className="font-mono text-xs tracking-widest text-[#A9874A] uppercase animate-pulse">
          ASSEMBLING INVESTIGATION PINBOARD...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[650px] select-none">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 6.4], fov: 48 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#0A0806"]} />

        {/* Ambient Dark Noir Tone */}
        <ambientLight color="#241B14" intensity={0.45} />

        {/* Venetian Blind Key Spotlight (casts horizontal shadow slats across pinboard) */}
        <spotLight
          position={[0, 4.5, 5.5]}
          target-position={[0, 0, 0]}
          color="#FFF2D4"
          intensity={3.8}
          angle={Math.PI / 2.8}
          penumbra={0.65}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* Soft Cool Moonlight Fill Light from right window */}
        <directionalLight position={[6, 3, 2]} color="#7F9AB5" intensity={0.35} />

        {/* Venetian Blind Geometry Casting Chiaroscuro Slats */}
        <VenetianBlindSlatShadows />

        {/* 1. Large Portuguese Corkboard Surface */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[14.2, 8.2]} />
          <meshStandardMaterial
            map={diffuse}
            bumpMap={bump}
            bumpScale={0.06}
            roughness={0.85}
            metalness={0.02}
          />
        </mesh>

        {/* 2. Heavy Dark Walnut Wooden Border Frame */}
        <group position={[0, 0, 0.03]}>
          {/* Top Frame */}
          <mesh position={[0, 4.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[14.4, 0.35, 0.1]} />
            <meshStandardMaterial color="#1E140D" roughness={0.7} />
          </mesh>
          {/* Bottom Frame */}
          <mesh position={[0, -4.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[14.4, 0.35, 0.1]} />
            <meshStandardMaterial color="#1E140D" roughness={0.7} />
          </mesh>
          {/* Left Frame */}
          <mesh position={[-7.15, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.35, 8.4, 0.1]} />
            <meshStandardMaterial color="#1E140D" roughness={0.7} />
          </mesh>
          {/* Right Frame */}
          <mesh position={[7.15, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.35, 8.4, 0.1]} />
            <meshStandardMaterial color="#1E140D" roughness={0.7} />
          </mesh>
        </group>

        {/* 3. Procedural Red Yarn Connecting the 5 Cases */}
        <Catenary3DYarn points={yarnPoints} isHovered={activeCase !== null} />

        {/* 4. The 5 Pinned 3D Case Dossier Cards */}
        {cases.map((caseItem, index) => {
          const layout = cardLayouts[index] ?? {
            pos: [index * 2 - 4, 0, 0.05],
            rotZ: 0,
          };
          const isHovered = activeCase?.slug === caseItem.slug;
          const isDimmed = activeCase !== null && !isHovered;

          return (
            <PinnedCaseCard3D
              key={caseItem.slug}
              caseItem={caseItem}
              position={layout.pos}
              baseRotationZ={layout.rotZ}
              isHovered={isHovered}
              isDimmed={isDimmed}
              onHover={onHoverCase}
              onSelect={onSelectCase}
            />
          );
        })}

        {/* 5. Base Desk Ledge Props */}
        <DeskLedgeProps />

        {/* 6. Dynamic Camera Rig with Mouse Parallax & Focus Pan */}
        <CameraRig activeCase={activeCase} />
      </Canvas>
    </div>
  );
}
