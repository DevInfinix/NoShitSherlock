"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { Catenary3DYarn } from "./Catenary3DYarn";
import { PinnedCaseCard3D } from "./PinnedCaseCard3D";
import {
  createDarkWalnutWoodTexture,
  createProceduralGreenFeltTexture,
  createSoftWindowBlindGoBoTexture,
} from "./textures";

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
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Classic Detective Clutter Desk Ledge Props at the bottom of the pinboard:
 * Antique Banker's lamp, crystal ashtray with smoldering cigarette, magnifying glass, fountain pen.
 */
function DeskLedgeProps({ yPos }: { yPos: number }) {
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C89E58"),
        metalness: 0.88,
        roughness: 0.24,
      }),
    [],
  );

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#180F0A"),
        roughness: 0.72,
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

  const emeraldGlass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#184D2B"),
        emissive: new THREE.Color("#082212"),
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.1,
        transmission: 0.45,
        thickness: 0.4,
      }),
    [],
  );

  return (
    <group position={[0, yPos, 0.4]}>
      {/* Heavy Dark Walnut Desk Ledge */}
      <mesh position={[0, -0.4, 0]} material={woodMaterial} receiveShadow>
        <boxGeometry args={[18, 0.8, 1.2]} />
      </mesh>
      {/* Polished brass edge guard rail */}
      <mesh position={[0, 0.02, 0.6]} material={brassMaterial}>
        <boxGeometry args={[18, 0.04, 0.04]} />
      </mesh>

      {/* 1. Classic Banker's Lamp at far left */}
      <group position={[-5.8, 0.12, 0.4]}>
        {/* Stepped brass base */}
        <mesh material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.42, 0.52, 0.1, 24]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={brassMaterial}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
        </mesh>
        {/* Curved brass arm */}
        <mesh position={[0, 0.48, 0]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.65, 12]} />
        </mesh>
        {/* Emerald green cased glass hood */}
        <mesh
          position={[0, 0.82, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={emeraldGlass}
          castShadow
        >
          <cylinderGeometry args={[0.2, 0.2, 0.72, 24, 1, false, 0, Math.PI]} />
        </mesh>
        {/* Soft warm lamp glow */}
        <pointLight position={[0, 0.75, 0.1]} color="#FFE8B0" intensity={0.9} distance={2.5} />
      </group>

      {/* 2. Antique Black Lacquer Fountain Pen on Brass Rest */}
      <group position={[-0.8, 0.06, 0.45]} rotation={[0, 0.25, 0]}>
        {/* Brass pen rest cradle */}
        <mesh position={[-0.2, 0, 0]} material={brassMaterial} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.12]} />
        </mesh>
        <mesh position={[0.2, 0, 0]} material={brassMaterial} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.12]} />
        </mesh>
        {/* Pen barrel */}
        <mesh position={[0, 0.035, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.75, 16]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.22} />
        </mesh>
        {/* Gold nib & trim */}
        <mesh position={[0.4, 0.035, 0]} rotation={[0, 0, -Math.PI / 2]} material={brassMaterial}>
          <coneGeometry args={[0.022, 0.1, 16]} />
        </mesh>
      </group>

      {/* 3. Vintage Brass Magnifying Glass at bottom right */}
      <group position={[4.6, 0.08, 0.45]} rotation={[-Math.PI / 2, 0, -0.35]}>
        <mesh material={brassMaterial} castShadow>
          <torusGeometry args={[0.38, 0.032, 12, 24]} />
        </mesh>
        <mesh material={glassMaterial}>
          <cylinderGeometry args={[0.36, 0.36, 0.015, 24]} />
        </mesh>
        <mesh position={[0, -0.65, 0]} material={woodMaterial} castShadow>
          <cylinderGeometry args={[0.038, 0.05, 0.6, 12]} />
        </mesh>
      </group>

      {/* 4. Heavy Glass Ashtray with Lit Cigarette & Smoke */}
      <mesh position={[-2.8, 0.08, 0.5]} material={glassMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.55, 0.14, 8]} />
      </mesh>
      {/* Cigarette stub */}
      <mesh position={[-2.65, 0.15, 0.5]} rotation={[0, 0.35, 0.3]}>
        <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
        <meshStandardMaterial color="#ECE4D8" roughness={0.7} />
      </mesh>
      {/* Glowing amber ash tip */}
      <mesh position={[-2.52, 0.2, 0.5]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#FF5500" />
      </mesh>
      {/* Rising Smoke Effect */}
      <AshtraySmokeParticles position={[-2.52, 0.24, 0.5]} />
    </group>
  );
}

/**
 * Dynamic Detective Flashlight Spotlight tracking mouse pointer coordinates.
 * Tight, sharp forensic beam with crisp penumbra.
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
    spotRef.current.position.set(targetX * 0.85, targetY * 0.85, 4.8);
  });

  return (
    <>
      <object3D ref={targetRef} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        target={targetRef.current || undefined}
        position={[0, 0, 4.8]}
        color="#FFF5E4"
        intensity={3.8}
        distance={12}
        angle={0.34}
        penumbra={0.42}
        decay={1.8}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0002}
      />
    </>
  );
}

/**
 * Smooth Fluid Camera Rig with low-pass damping to prevent micro-jitter.
 */
function CameraRig({ focusedCasePos }: { focusedCasePos: [number, number] | null }) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const parallaxX = pointer.x * 0.22;
    const parallaxY = pointer.y * 0.16;

    let targetX = parallaxX;
    let targetY = parallaxY;
    let targetZ = 6.8;

    if (focusedCasePos) {
      targetX = focusedCasePos[0] * 0.25 + parallaxX * 0.06;
      targetY = focusedCasePos[1] * 0.25 + parallaxY * 0.06;
      targetZ = 6.2; // Smooth fluid focus zoom
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.6, clampedDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.6, clampedDelta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.6, clampedDelta);

    camera.lookAt(targetX * 0.2, targetY * 0.2, 0);
  });

  return null;
}

/**
 * 3D Dark Walnut Wood Frame encasing the noticeboard with brass corner joiners
 * and central engraved brass title plaque.
 */
function WalnutNoticeboardFrame({ width, height }: { width: number; height: number }) {
  const { diffuse, bump } = useMemo(() => createDarkWalnutWoodTexture(512), []);

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: diffuse,
        bumpMap: bump,
        bumpScale: 0.04,
        roughness: 0.65,
        metalness: 0.08,
      }),
    [diffuse, bump],
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
      diffuse.dispose();
      bump.dispose();
      woodMaterial.dispose();
      brassMaterial.dispose();
    };
  }, [diffuse, bump, woodMaterial, brassMaterial]);

  const frameThickness = 0.42;
  const frameDepth = 0.16;
  const halfW = width / 2;
  const halfH = height / 2;

  return (
    <group position={[0, 0, 0.04]}>
      {/* Top Beam */}
      <mesh
        position={[0, halfH - frameThickness / 2, 0]}
        material={woodMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, frameThickness, frameDepth]} />
      </mesh>
      {/* Bottom Beam */}
      <mesh
        position={[0, -halfH + frameThickness / 2, 0]}
        material={woodMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, frameThickness, frameDepth]} />
      </mesh>
      {/* Left Beam */}
      <mesh
        position={[-halfW + frameThickness / 2, 0, 0]}
        material={woodMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameThickness, height, frameDepth]} />
      </mesh>
      {/* Right Beam */}
      <mesh
        position={[halfW - frameThickness / 2, 0, 0]}
        material={woodMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[frameThickness, height, frameDepth]} />
      </mesh>

      {/* 4 Antique Brass L-Corner Joiner Brackets */}
      {[
        [-halfW + 0.2, halfH - 0.2],
        [halfW - 0.2, halfH - 0.2],
        [-halfW + 0.2, -halfH + 0.2],
        [halfW - 0.2, -halfH + 0.2],
      ].map(([cx, cy], i) => {
        const key = `corner-bracket-${i}`;
        return (
          <group key={key} position={[cx ?? 0, cy ?? 0, frameDepth / 2 + 0.01]}>
            <mesh material={brassMaterial} castShadow>
              <boxGeometry args={[0.32, 0.32, 0.018]} />
            </mesh>
            {/* Corner Rivet */}
            <mesh position={[0, 0, 0.012]} material={brassMaterial}>
              <sphereGeometry args={[0.024, 8, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* Center Engraved Brass Plaque at Top Frame */}
      <group position={[0, halfH - frameThickness / 2, frameDepth / 2 + 0.012]}>
        <mesh material={brassMaterial} castShadow>
          <boxGeometry args={[3.2, 0.22, 0.018]} />
        </mesh>
        {/* Plaque Screws */}
        <mesh position={[-1.48, 0, 0.01]} material={brassMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.01, 8]} />
        </mesh>
        <mesh position={[1.48, 0, 0.01]} material={brassMaterial}>
          <cylinderGeometry args={[0.018, 0.018, 0.01, 8]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Internal Responsive 3D Pinboard Scene with Green Baize felt,
 * cold stormy moonlight, horizontal venetian blinds, and procedural wool yarn.
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

  // 1. Procedural British Police Green Felt Baize Textures
  const { diffuse, bump } = useMemo(() => createProceduralGreenFeltTexture(1024), []);
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
    if (windowLightRef.current) {
      const time = state.clock.getElapsedTime();
      // Cold stormy moonlight subtle flicker (#5A738E)
      const stormFlicker = Math.sin(time * 3.4) * 0.08 + Math.cos(time * 7.1) * 0.04;
      const thunder = Math.sin(time * 0.22) > 0.985 ? 0.35 : 0;
      windowLightRef.current.intensity = 1.25 + stormFlicker + thunder;
    }
  });

  // Calculate layout for cases based on responsive viewport
  const { cardLayouts, yarnPoints, cardScale } = useMemo(() => {
    const isUltraNarrow = viewport.width < 7.5;
    const isNarrow = viewport.width < 11.5;

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
        p.pos[1] + 1.22 * scale,
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
        p.pos[1] + 1.22 * scale,
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
      { pos: [2.3 * spread, -0.55, 0.05], rotZ: 0.035 },
      { pos: [4.6 * spread, 1.15, 0.05], rotZ: -0.025 },
    ];
    const yarn: Array<[number, number, number]> = positions.map((p) => [
      p.pos[0],
      p.pos[1] + 1.22 * scale,
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

  const boardWidth = Math.max(16, viewport.width * 1.2);
  const boardHeight = Math.max(10, viewport.height * 1.2);

  return (
    <>
      {/* 1. Stormy Blue-Gray Moonlight (#5A738E) from the Right Window */}
      <directionalLight
        ref={windowLightRef}
        position={[7.5, 3.8, 3.6]}
        color="#5A738E"
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* 2. Soft Blue Moonlight Fill Light from the Left */}
      <directionalLight position={[-7.0, 3.0, 2.5]} color="#3B4E5F" intensity={0.4} />

      {/* 3. British Police Green Felt Baize Noticeboard Surface */}
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

      {/* 4. Horizontal Venetian Blind Shadows Projection (Clean premultiplied alpha, zero WebGL warnings) */}
      <mesh position={[0, 0, 0.005]} receiveShadow>
        <planeGeometry args={[boardWidth, boardHeight]} />
        <meshBasicMaterial map={goboShadowTexture} transparent opacity={0.34} depthWrite={false} />
      </mesh>

      {/* 5. 3D Dark Walnut Wood Frame encasing the board */}
      <WalnutNoticeboardFrame width={boardWidth} height={boardHeight} />

      {/* 6. Procedural Red Wool Yarn with Catenary Sag and Harmonic Spring Bounce */}
      <Catenary3DYarn points={yarnPoints} isHovered={hoveredCase !== null} />

      {/* 7. The Pinned 3D Case Dossier Cards with Corner-Curl Shader */}
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
            caseIndex={index}
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

      {/* 8. Forensic Spotlight tracking mouse cursor */}
      <CursorFlashlight />

      {/* 9. Tangible Detective Props on the Bottom Desk Ledge */}
      <DeskLedgeProps yPos={-boardHeight / 2 + 0.35} />

      {/* 10. Smooth Steady-Cam Rig */}
      <CameraRig focusedCasePos={focusedCasePos} />
    </>
  );
}

/**
 * Primary 3D Pinboard Library Canvas Component.
 */
export function PinboardLibrary3D(props: PinboardLibrary3DProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#080605] flex items-center justify-center font-mono text-xs text-[#A9874A]">
        LOADING EVIDENCE BOARD...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 46 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.95,
        }}
        shadows
        className="w-full h-full"
      >
        <color attach="background" args={["#060504"]} />
        <ambientLight color="#18130E" intensity={0.7} />
        <PinboardScene {...props} />
      </Canvas>
    </div>
  );
}
