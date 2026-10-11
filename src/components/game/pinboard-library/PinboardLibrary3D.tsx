"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { Catenary3DYarn } from "./Catenary3DYarn";
import { PinnedCaseCard3D } from "./PinnedCaseCard3D";
import { createProceduralGreenFeltTexture, createSoftWindowBlindGoBoTexture } from "./textures";

interface PinboardLibrary3DProps {
  cases: ActiveCaseListing[];
  hoveredCase: ActiveCaseListing | null;
  selectedCase: ActiveCaseListing | null;
  onHoverCase: (c: ActiveCaseListing | null) => void;
  onSelectCase: (c: ActiveCaseListing) => void;
}

/**
 * Rising Smoke Particle Effect from the vintage glass ashtray.
 */
function AshtraySmokeParticles({ position }: { position: [number, number, number] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 35;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.12;
      pos[i * 3 + 1] = position[1] + Math.random() * 0.8;
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.12;

      spd[i * 3] = (Math.random() - 0.5) * 0.003;
      spd[i * 3 + 1] = 0.004 + Math.random() * 0.004; // drift upward
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
    return [pos, spd];
  }, [position]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;
    if (!attr) return;

    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idxY = i * 3 + 1;
      const speedY = speeds[idxY] ?? 0.004;
      arr[idxY] = (arr[idxY] ?? position[1]) + speedY;
      if (arr[idxY] > position[1] + 1.2) {
        arr[idxY] = position[1];
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        color="#8B9AA8"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Classic Detective Clutter Desk Ledge Props at the bottom of the pinboard:
 * Antique brass lamp base, glass ashtray with burning cigarette and smoke, fountain pen, matchbook.
 */
function DeskLedgeProps({ yPos }: { yPos: number }) {
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C59E58"),
        metalness: 0.88,
        roughness: 0.22,
      }),
    [],
  );

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#180F0A"),
        roughness: 0.75,
        metalness: 0.04,
      }),
    [],
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#E2ECF5"),
        transmission: 0.88,
        roughness: 0.12,
        ior: 1.5,
      }),
    [],
  );

  return (
    <group position={[0, yPos, 0.4]}>
      {/* Heavy Dark Walnut Desk Ledge */}
      <mesh position={[0, -0.4, 0]} material={woodMaterial} receiveShadow>
        <boxGeometry args={[24, 0.65, 2.8]} />
      </mesh>

      {/* Antique Brass Lamp Base at bottom left */}
      <mesh position={[-5.4, 0.08, 0.45]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.55, 0.72, 0.16, 24]} />
      </mesh>
      <mesh position={[-5.4, 0.65, 0.45]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.065, 0.065, 1.1, 16]} />
      </mesh>

      {/* Vintage Fountain Pen with Gold Nib */}
      <group position={[3.6, 0.05, 0.4]} rotation={[0, 0.65, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.04, 1.25, 16]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.38, 0]} material={brassMaterial}>
          <cylinderGeometry args={[0.042, 0.042, 0.09, 16]} />
        </mesh>
        <mesh position={[0, 0.68, 0]} material={brassMaterial}>
          <coneGeometry args={[0.035, 0.16, 16]} />
        </mesh>
      </group>

      {/* Vintage Magnifying Glass at bottom right */}
      <group position={[5.2, 0.06, 0.45]} rotation={[-Math.PI / 2, 0, -0.4]}>
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

      {/* Heavy Glass Ashtray with Lit Cigarette & Smoke */}
      <mesh position={[-2.6, 0.08, 0.55]} material={glassMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.6, 0.15, 8]} />
      </mesh>
      {/* Cigarette stub */}
      <mesh position={[-2.45, 0.16, 0.55]} rotation={[0, 0.4, 0.35]}>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 8]} />
        <meshStandardMaterial color="#ECE4D8" roughness={0.7} />
      </mesh>
      {/* Glowing amber ash tip */}
      <mesh position={[-2.32, 0.22, 0.55]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#FF5500" />
      </mesh>
      {/* Rising Smoke Effect */}
      <AshtraySmokeParticles position={[-2.32, 0.26, 0.55]} />
    </group>
  );
}

/**
 * Dynamic Detective Flashlight Spotlight tracking mouse pointer coordinates.
 */
function CursorFlashlight() {
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const { pointer, viewport } = useThree();

  useFrame(() => {
    if (!spotRef.current || !targetRef.current) return;
    const targetX = (pointer.x * viewport.width) / 2;
    const targetY = (pointer.y * viewport.height) / 2;

    targetRef.current.position.set(targetX, targetY, 0);
    spotRef.current.position.set(targetX * 0.8, targetY * 0.8, 5.2);
  });

  return (
    <>
      <object3D ref={targetRef} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        target={targetRef.current || undefined}
        position={[0, 0, 5.2]}
        color="#FFF3DC"
        intensity={3.2}
        distance={14}
        angle={Math.PI / 4.2}
        penumbra={0.75}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
    </>
  );
}

/**
 * Dynamic Camera Rig with Mouse Parallax & Smooth Focus Pan.
 */
function CameraRig({ focusedCasePos }: { focusedCasePos: [number, number] | null }) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    const parallaxX = pointer.x * 0.35;
    const parallaxY = pointer.y * 0.22;

    let targetX = parallaxX;
    let targetY = parallaxY;
    let targetZ = 6.4;

    if (focusedCasePos) {
      targetX = focusedCasePos[0] * 0.38 + parallaxX * 0.12;
      targetY = focusedCasePos[1] * 0.38 + parallaxY * 0.12;
      targetZ = 5.9; // Smooth focus zoom
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 3.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 3.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3.5, delta);

    camera.lookAt(targetX * 0.3, targetY * 0.3, 0);
  });

  return null;
}

/**
 * Internal Responsive 3D Pinboard Scene with Green Baize felt,
 * stormy window chiaroscuro, and procedural wool yarn.
 */
function PinboardScene({
  cases,
  hoveredCase,
  selectedCase,
  onHoverCase,
  onSelectCase,
}: PinboardLibrary3DProps) {
  const { viewport } = useThree();
  const windowLightRef = useRef<THREE.DirectionalLight>(null);

  // 1. Procedural Green Felt Baize Textures
  const { diffuse, bump } = useMemo(() => createProceduralGreenFeltTexture(512), []);
  const goboShadowTexture = useMemo(() => createSoftWindowBlindGoBoTexture(512), []);

  useEffect(() => {
    return () => {
      diffuse.dispose();
      bump.dispose();
      goboShadowTexture.dispose();
    };
  }, [diffuse, bump, goboShadowTexture]);

  // Stormy rain lighting flicker from the right window in useFrame
  useFrame((state) => {
    if (!windowLightRef.current) return;
    const time = state.clock.getElapsedTime();
    const rainFlicker = 1.0 + Math.sin(time * 3.5) * 0.08 + (Math.random() < 0.003 ? 1.4 : 0.0);
    windowLightRef.current.intensity = 1.35 * rainFlicker;
  });

  // 2. Responsive 3D Card Layout Coordinates
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
      {/* Stormy Rain Window Light from the Right */}
      <directionalLight
        ref={windowLightRef}
        position={[7.5, 4.0, 3.8]}
        color="#8CA5B8"
        intensity={1.35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Soft Blue Moonlight Fill Light from the Left */}
      <directionalLight position={[-7.0, 3.0, 2.5]} color="#5B768E" intensity={0.5} />

      {/* 1. Large Portuguese Green Felt Noticeboard Surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[boardWidth, boardHeight]} />
        <meshStandardMaterial
          map={diffuse}
          bumpMap={bump}
          bumpScale={0.045}
          roughness={0.92}
          metalness={0.01}
        />
      </mesh>

      {/* Soft GoBo Window Blinds Shadow Projection Plane */}
      <mesh position={[0, 0, 0.005]} receiveShadow>
        <planeGeometry args={[boardWidth, boardHeight]} />
        <meshBasicMaterial
          map={goboShadowTexture}
          transparent
          opacity={0.38}
          blending={THREE.MultiplyBlending}
        />
      </mesh>

      {/* 2. Heavy Dark Walnut Frame with Distressed Brass Trim */}
      <group position={[0, 0, 0.03]}>
        <mesh position={[0, boardHeight / 2 - 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[boardWidth, 0.35, 0.1]} />
          <meshStandardMaterial color="#160E08" roughness={0.8} />
        </mesh>
        <mesh position={[0, -boardHeight / 2 + 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[boardWidth, 0.35, 0.1]} />
          <meshStandardMaterial color="#160E08" roughness={0.8} />
        </mesh>
        <mesh position={[-boardWidth / 2 + 0.15, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.35, boardHeight, 0.1]} />
          <meshStandardMaterial color="#160E08" roughness={0.8} />
        </mesh>
        <mesh position={[boardWidth / 2 - 0.15, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.35, boardHeight, 0.1]} />
          <meshStandardMaterial color="#160E08" roughness={0.8} />
        </mesh>
      </group>

      {/* 3. Procedural Red Yarn with Harmonic Spring Sag Physics */}
      <Catenary3DYarn points={yarnPoints} isHovered={hoveredCase !== null} />

      {/* 4. The 5 Pinned 3D Case Dossier Cards with Corner-Curl Shader */}
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

      {/* 5. Desk Ledge Props with Lit Cigarette & Smoke Particles */}
      <DeskLedgeProps yPos={-viewport.height / 2 - 0.25} />

      {/* 6. Dynamic Detective Flashlight Spotlight */}
      <CursorFlashlight />

      {/* 7. Camera Rig with Parallax & Focus Pan */}
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
      <div className="w-full h-full min-h-screen bg-[#080605] flex items-center justify-center">
        <span className="font-mono text-xs tracking-widest text-[#A9874A] uppercase animate-pulse">
          INITIALIZING CRIME LAB PINBOARD...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen select-none overflow-hidden cursor-none">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 6.4], fov: 48 }}
        className="w-full h-full"
      >
        <color attach="background" args={["#080605"]} />

        {/* Cinematic Noir Low-Exposure Ambient Light */}
        <ambientLight color="#18130E" intensity={0.65} />

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
