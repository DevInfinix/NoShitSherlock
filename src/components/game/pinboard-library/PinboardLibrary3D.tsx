"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { soundEngine } from "@/lib/audio/sound-engine";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { Catenary3DYarn } from "./Catenary3DYarn";
import { PinnedCaseCard3D } from "./PinnedCaseCard3D";
import { createDarkWalnutWoodTexture, createProceduralGreenFeltTexture } from "./textures";

interface PinboardLibrary3DProps {
  cases: ActiveCaseListing[];
  hoveredCase: ActiveCaseListing | null;
  selectedCase: ActiveCaseListing | null;
  onHoverCase: (c: ActiveCaseListing | null) => void;
  onSelectCase: (c: ActiveCaseListing) => void;
}

/**
 * Rising Smoke Particle Effect from the crystal ashtray.
 */
function AshtraySmokeParticles({ position }: { position: [number, number, number] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 30;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0] + (Math.random() - 0.5) * 0.12;
      pos[i * 3 + 1] = position[1] + Math.random() * 0.75;
      pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.12;

      spd[i * 3] = (Math.random() - 0.5) * 0.003;
      spd[i * 3 + 1] = 0.0035 + Math.random() * 0.0035;
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
      if (arr[idxY] > position[1] + 1.1) {
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
        size={0.036}
        color="#8B9AA8"
        transparent
        opacity={0.32}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * 3D Tangible Detective Desk Ledge with Banker's lamp, magnifying glass, fountain pen, ashtray.
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
        color: new THREE.Color("#20140D"),
        roughness: 0.65,
        metalness: 0.05,
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
      <mesh position={[0, -0.35, 0]} material={woodMaterial} receiveShadow>
        <boxGeometry args={[18, 0.7, 1.2]} />
      </mesh>
      {/* Polished brass edge guard rail */}
      <mesh position={[0, 0.02, 0.6]} material={brassMaterial}>
        <boxGeometry args={[18, 0.035, 0.035]} />
      </mesh>

      {/* 1. Classic Banker's Lamp at far left */}
      <group position={[-5.8, 0.12, 0.4]}>
        <mesh material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 0.1, 24]} />
        </mesh>
        <mesh position={[0, 0.12, 0]} material={brassMaterial}>
          <cylinderGeometry args={[0.09, 0.09, 0.14, 16]} />
        </mesh>
        <mesh position={[0, 0.46, 0]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.6, 12]} />
        </mesh>
        <mesh
          position={[0, 0.78, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={emeraldGlass}
          castShadow
        >
          <cylinderGeometry args={[0.18, 0.18, 0.68, 24, 1, false, 0, Math.PI]} />
        </mesh>
        {/* Warm lamp glow illuminating the desk */}
        <pointLight position={[0, 0.72, 0.1]} color="#FFE6A8" intensity={1.2} distance={3.2} />
      </group>

      {/* 2. Antique Black Lacquer Fountain Pen on Brass Rest */}
      <group position={[-0.4, 0.05, 0.45]} rotation={[0, 0.22, 0]}>
        <mesh position={[-0.18, 0, 0]} material={brassMaterial} castShadow>
          <boxGeometry args={[0.07, 0.05, 0.1]} />
        </mesh>
        <mesh position={[0.18, 0, 0]} material={brassMaterial} castShadow>
          <boxGeometry args={[0.07, 0.05, 0.1]} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.72, 16]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.2} />
        </mesh>
        <mesh position={[0.38, 0.03, 0]} rotation={[0, 0, -Math.PI / 2]} material={brassMaterial}>
          <coneGeometry args={[0.02, 0.09, 16]} />
        </mesh>
      </group>

      {/* 3. Vintage Brass Magnifying Glass at bottom right */}
      <group position={[4.6, 0.07, 0.45]} rotation={[-Math.PI / 2, 0, -0.32]}>
        <mesh material={brassMaterial} castShadow>
          <torusGeometry args={[0.36, 0.03, 12, 24]} />
        </mesh>
        <mesh material={glassMaterial}>
          <cylinderGeometry args={[0.34, 0.34, 0.015, 24]} />
        </mesh>
        <mesh position={[0, -0.62, 0]} material={woodMaterial} castShadow>
          <cylinderGeometry args={[0.036, 0.048, 0.58, 12]} />
        </mesh>
      </group>

      {/* 4. Heavy Glass Ashtray with Lit Cigarette & Smoke */}
      <mesh position={[-2.8, 0.08, 0.5]} material={glassMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.52, 0.13, 8]} />
      </mesh>
      <mesh position={[-2.65, 0.14, 0.5]} rotation={[0, 0.35, 0.3]}>
        <cylinderGeometry args={[0.017, 0.017, 0.3, 8]} />
        <meshStandardMaterial color="#ECE4D8" roughness={0.7} />
      </mesh>
      <mesh position={[-2.52, 0.19, 0.5]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#FF5500" />
      </mesh>
      <AshtraySmokeParticles position={[-2.52, 0.23, 0.5]} />
    </group>
  );
}

/**
 * 3D Detective Room Back Wall Layer (Option 3.a: Cinematic Full Room).
 * Shows aged Victorian wallpaper, carved chair rail, and dark walnut wainscoting surrounding the noticeboard.
 */
function DetectiveRoomBackWall({ width, height }: { width: number; height: number }) {
  const wallWidth = width * 1.5;
  const wallHeight = height * 1.5;

  return (
    <group position={[0, 0, -0.2]}>
      {/* Upper Victorian Wallpaper */}
      <mesh position={[0, wallHeight * 0.15, 0]} receiveShadow>
        <planeGeometry args={[wallWidth, wallHeight * 0.7]} />
        <meshStandardMaterial color="#221C18" roughness={0.92} />
      </mesh>

      {/* Chair Rail Moulding */}
      <mesh position={[0, -wallHeight * 0.2, 0.01]}>
        <boxGeometry args={[wallWidth, 0.14, 0.05]} />
        <meshStandardMaterial color="#2B1A10" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Lower Dark Walnut Wainscoting */}
      <mesh position={[0, -wallHeight * 0.38, 0]} receiveShadow>
        <planeGeometry args={[wallWidth, wallHeight * 0.36]} />
        <meshStandardMaterial color="#160E08" roughness={0.8} />
      </mesh>

      {/* Wall Sconce Left Light Fixture */}
      <group position={[-width * 0.62, height * 0.3, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.14, 0.05, 16]} />
          <meshStandardMaterial color="#C89E58" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.18, 0.1]}>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
          <meshStandardMaterial color="#C89E58" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.38, 0.16]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#FFE6AA"
            emissive="#FFBA42"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
        <pointLight position={[0, 0.4, 0.22]} color="#FFDF9E" intensity={0.7} distance={4.5} />
      </group>

      {/* Wall Sconce Right Light Fixture */}
      <group position={[width * 0.62, height * 0.3, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.14, 0.05, 16]} />
          <meshStandardMaterial color="#C89E58" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.18, 0.1]}>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
          <meshStandardMaterial color="#C89E58" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.38, 0.16]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#FFE6AA"
            emissive="#FFBA42"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
        <pointLight position={[0, 0.4, 0.22]} color="#FFDF9E" intensity={0.7} distance={4.5} />
      </group>
    </group>
  );
}

/**
 * 3D Dark Walnut Wood Frame encasing the noticeboard with brass corner joiners
 * and central engraved brass title plaque.
 */
function WalnutNoticeboardFrame({ width, height }: { width: number; height: number }) {
  const { diffuse, bump } = useMemo(() => createDarkWalnutWoodTexture(), []);

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

  const frameThickness = 0.4;
  const frameDepth = 0.15;
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
              <boxGeometry args={[0.3, 0.3, 0.016]} />
            </mesh>
            <mesh position={[0, 0, 0.01]} material={brassMaterial}>
              <sphereGeometry args={[0.022, 8, 8]} />
            </mesh>
          </group>
        );
      })}

      {/* Center Engraved Brass Plaque at Top Frame */}
      <group position={[0, halfH - frameThickness / 2, frameDepth / 2 + 0.012]}>
        <mesh material={brassMaterial} castShadow>
          <boxGeometry args={[3.4, 0.22, 0.018]} />
        </mesh>
        <mesh position={[-1.58, 0, 0.01]} material={brassMaterial}>
          <cylinderGeometry args={[0.016, 0.016, 0.01, 8]} />
        </mesh>
        <mesh position={[1.58, 0, 0.01]} material={brassMaterial}>
          <cylinderGeometry args={[0.016, 0.016, 0.01, 8]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Smooth Fluid Camera Rig with low-pass damping.
 */
function CameraRig({ focusedCasePos }: { focusedCasePos: [number, number] | null }) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const parallaxX = pointer.x * 0.16;
    const parallaxY = pointer.y * 0.12;

    let targetX = parallaxX;
    let targetY = parallaxY;
    let targetZ = 6.8;

    if (focusedCasePos) {
      targetX = focusedCasePos[0] * 0.18 + parallaxX * 0.04;
      targetY = focusedCasePos[1] * 0.18 + parallaxY * 0.04;
      targetZ = 6.1; // Smooth focus pull
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.6, clampedDelta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.6, clampedDelta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.6, clampedDelta);

    camera.lookAt(targetX * 0.15, targetY * 0.15, 0);
  });

  return null;
}

/**
 * Internal Responsive 3D Pinboard Scene with British Green Baize felt,
 * detective room backdrop, and central radiating yarn.
 */
function PinboardScene({
  cases,
  hoveredCase,
  selectedCase,
  onHoverCase,
  onSelectCase,
}: PinboardLibrary3DProps) {
  const { viewport } = useThree();

  const { diffuse, bump } = useMemo(() => createProceduralGreenFeltTexture(), []);

  useEffect(() => {
    return () => {
      diffuse.dispose();
      bump.dispose();
    };
  }, [diffuse, bump]);

  // Layout for cases across the board
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
        p.pos[1] + 1.25 * scale,
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
        p.pos[1] + 1.25 * scale,
        0.12,
      ]);
      return { cardLayouts: positions, yarnPoints: yarn, cardScale: scale };
    }

    // Wide Desktop: Responsive horizontal spread
    const spread = Math.min(1.0, viewport.width / 13.5);
    const scale = Math.max(0.85, Math.min(1.0, viewport.width / 12));
    const positions: Array<{ pos: [number, number, number]; rotZ: number }> = [
      { pos: [-4.4 * spread, 0.85, 0.05], rotZ: -0.035 },
      { pos: [-2.2 * spread, -0.65, 0.05], rotZ: 0.025 },
      { pos: [0.0, 1.05, 0.05], rotZ: -0.015 },
      { pos: [2.2 * spread, -0.65, 0.05], rotZ: 0.03 },
      { pos: [4.4 * spread, 0.85, 0.05], rotZ: -0.025 },
    ];
    const yarn: Array<[number, number, number]> = positions.map((p) => [
      p.pos[0],
      p.pos[1] + 1.25 * scale,
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

  const boardWidth = Math.max(15, viewport.width * 1.15);
  const boardHeight = Math.max(9.5, viewport.height * 1.15);

  return (
    <>
      {/* 1. Main Key Studio Light */}
      <directionalLight
        position={[4.5, 7.5, 5.5]}
        color="#FFF8EC"
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* 2. Soft Cool Window Fill Light from Left */}
      <directionalLight position={[-6.0, 3.5, 3.0]} color="#8DAECF" intensity={0.65} />

      {/* 3. Front Fill Light to illuminate card details evenly */}
      <directionalLight position={[0, -2, 4]} color="#FFE8C2" intensity={0.5} />

      {/* 4. Detective Room Back Wall Layer (Option 3.a) */}
      <DetectiveRoomBackWall width={boardWidth} height={boardHeight} />

      {/* 5. British Police Green Felt Baize Noticeboard Surface (Option 1.a) */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[boardWidth, boardHeight]} />
        <meshStandardMaterial
          map={diffuse}
          bumpMap={bump}
          bumpScale={0.035}
          roughness={0.9}
          metalness={0.01}
        />
      </mesh>

      {/* 6. 3D Dark Walnut Wood Frame encasing the board */}
      <WalnutNoticeboardFrame width={boardWidth} height={boardHeight} />

      {/* 7. Procedural Red Wool Yarn Radiating from Central Hub (Option 5.a) */}
      <Catenary3DYarn
        hubPoint={[0, 1.85, 0.12]}
        points={yarnPoints}
        isHovered={hoveredCase !== null}
      />

      {/* 8. Pinned Case Dossier Cards (Option 2.a & 4.a: 3D Drei Html transform) */}
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
            onHover={(c) => {
              if (c && c.slug !== hoveredCase?.slug) {
                soundEngine.playPaper();
              }
              onHoverCase(c);
            }}
            onSelect={(c) => {
              soundEngine.playStamp();
              onSelectCase(c);
            }}
          />
        );
      })}

      {/* 9. Tangible Detective Props on the Bottom Desk Ledge (Option 8) */}
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
          toneMappingExposure: 1.05,
        }}
        shadows
        className="w-full h-full"
      >
        <color attach="background" args={["#0D0B09"]} />
        <ambientLight color="#FFF3DC" intensity={1.35} />
        <PinboardScene {...props} />
      </Canvas>
    </div>
  );
}
