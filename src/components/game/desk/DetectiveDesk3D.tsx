"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Suppress THREE.Clock deprecation warning on Three.js r186+
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }
    originalWarn(...args);
  };
}

interface DetectiveDeskProps {
  viewMode: "inspection" | "reading";
  onToggleViewMode?: () => void;
}

/**
 * Procedural Banker's Lamp with brass stand and emerald-green cased glass hood.
 */
function BankerLamp({ position }: { position: [number, number, number] }) {
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C59E58"),
        metalness: 0.85,
        roughness: 0.28,
      }),
    [],
  );

  const greenGlassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#1B4D2E"),
        emissive: new THREE.Color("#0A2614"),
        emissiveIntensity: 0.4,
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.4,
        thickness: 0.5,
      }),
    [],
  );

  return (
    <group position={position}>
      {/* Heavy Stepped Brass Base */}
      <mesh position={[0, 0.08, 0]} material={brassMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.16, 32]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.45, 0.6, 0.1, 32]} />
      </mesh>

      {/* Main Brass Stem / Upright */}
      <mesh position={[0, 1.2, 0]} material={brassMaterial} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 2.0, 16]} />
      </mesh>

      {/* Curved Upper Neck Arch */}
      <mesh
        position={[0.25, 2.15, 0]}
        rotation={[0, 0, -Math.PI / 4]}
        material={brassMaterial}
        castShadow
      >
        <cylinderGeometry args={[0.06, 0.06, 0.7, 16]} />
      </mesh>

      {/* Crossbar Horizontal Pivot */}
      <mesh
        position={[0.5, 2.38, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={brassMaterial}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 1.3, 16]} />
      </mesh>

      {/* Emerald Green Glass Hood (Half Cylinder) */}
      <mesh
        position={[0.5, 2.34, 0]}
        rotation={[0, 0, Math.PI / 12]}
        material={greenGlassMaterial}
        castShadow
      >
        <cylinderGeometry args={[0.38, 0.38, 1.4, 32, 1, false, 0, Math.PI]} />
      </mesh>

      {/* Pull Chain with Ball Pendant */}
      <mesh position={[0.5, 1.8, 0.35]} material={brassMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 0.8, 8]} />
      </mesh>
      <mesh position={[0.5, 1.38, 0.35]} material={brassMaterial}>
        <sphereGeometry args={[0.045, 16, 16]} />
      </mesh>

      {/* Warm Light Bulb Mesh inside hood */}
      <mesh position={[0.5, 2.25, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#FFF5D6" />
      </mesh>

      {/* Conic Spotlight casting onto desk */}
      <spotLight
        position={[0.5, 2.2, 0]}
        target-position={[2.0, 0, 0.5]}
        color="#FFF1CC"
        intensity={4.2}
        distance={15}
        angle={Math.PI / 3.2}
        penumbra={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Emerald Ambient Glow */}
      <pointLight position={[0.5, 2.4, 0]} color="#2E7D46" intensity={1.2} distance={4} />
    </group>
  );
}

/**
 * Vintage Detective Desk Props: Magnifying Glass, Fountain Pen, Ashtray, Brass Clips.
 */
function DeskProps() {
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C59E58"),
        metalness: 0.85,
        roughness: 0.3,
      }),
    [],
  );

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#2C1D14"),
        roughness: 0.7,
        metalness: 0.05,
      }),
    [],
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#EBF3FA"),
        transmission: 0.85,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
      }),
    [],
  );

  return (
    <group>
      {/* Vintage Magnifying Glass */}
      <group position={[4.2, 0.06, 0.8]} rotation={[-Math.PI / 2, 0, 0.35]}>
        {/* Brass Ring */}
        <mesh material={brassMaterial} castShadow>
          <torusGeometry args={[0.5, 0.04, 16, 32]} />
        </mesh>
        {/* Glass Lens */}
        <mesh material={glassMaterial}>
          <cylinderGeometry args={[0.48, 0.48, 0.02, 32]} />
        </mesh>
        {/* Turned Wooden Handle */}
        <mesh position={[0, -0.9, 0]} material={woodMaterial} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.8, 16]} />
        </mesh>
        <mesh position={[0, -0.45, 0]} material={brassMaterial}>
          <cylinderGeometry args={[0.065, 0.065, 0.12, 16]} />
        </mesh>
      </group>

      {/* Vintage Fountain Pen */}
      <group position={[3.8, 0.04, -1.2]} rotation={[0, 0.75, 0]}>
        {/* Black Lacquer Barrel */}
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.04, 1.2, 16]} />
          <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Brass Ring & Clip */}
        <mesh position={[0, 0.35, 0]} material={brassMaterial}>
          <cylinderGeometry args={[0.042, 0.042, 0.08, 16]} />
        </mesh>
        {/* Brass Nib Point */}
        <mesh position={[0, 0.65, 0]} material={brassMaterial}>
          <coneGeometry args={[0.032, 0.15, 16]} />
        </mesh>
      </group>

      {/* Glass Ashtray */}
      <group position={[-3.8, 0.08, 2.2]}>
        <mesh material={glassMaterial} castShadow receiveShadow>
          <cylinderGeometry args={[0.65, 0.75, 0.16, 8]} />
        </mesh>
      </group>

      {/* Scattered Brass Paperclips */}
      {(
        [
          [-2.4, 0.02, 1.4, 0.5],
          [-2.2, 0.02, 1.6, -0.8],
          [3.2, 0.02, 1.8, 1.2],
          [3.4, 0.02, 1.5, -0.3],
        ] as const
      ).map(([x, y, z, rot], idx) => (
        <mesh
          key={`paperclip-${x}-${z}-${idx}`}
          position={[x, y, z]}
          rotation={[-Math.PI / 2, 0, rot]}
          material={brassMaterial}
        >
          <torusGeometry args={[0.06, 0.012, 8, 16, Math.PI * 1.6]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Floating Dust Particles illuminated by the desk lamp beam.
 */
function AmbientDustMotes({ count = 45 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 3.5 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;

      spd[i * 3] = (Math.random() - 0.5) * 0.002;
      spd[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, spd];
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const attr = geo.attributes.position;
    if (!attr) return;

    const array = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idxY = i * 3 + 1;
      const speedY = speeds[idxY] ?? 0.002;
      const curY = array[idxY] ?? 0;
      array[idxY] = curY + speedY;
      if (array[idxY] > 3.8) {
        array[idxY] = 0.2;
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
        size={0.035}
        color="#FFEBB3"
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Camera Controller handling smooth view transitions and mouse parallax.
 */
function CameraRig({ viewMode }: { viewMode: "inspection" | "reading" }) {
  const { camera, pointer } = useThree();

  const targetPos = useMemo(() => {
    if (viewMode === "reading") {
      return new THREE.Vector3(0, 4.8, 1.4);
    }
    return new THREE.Vector3(0, 3.2, 5.2);
  }, [viewMode]);

  const lookAtTarget = useMemo(() => {
    if (viewMode === "reading") {
      return new THREE.Vector3(0, 0, 0.4);
    }
    return new THREE.Vector3(0, 0.3, 0);
  }, [viewMode]);

  useFrame((_, delta) => {
    // Parallax damping
    const parallaxX = pointer.x * 0.4;
    const parallaxY = pointer.y * 0.25;

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetPos.x + parallaxX,
      3.5,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetPos.y + parallaxY,
      3.5,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 3.5, delta);

    camera.lookAt(lookAtTarget);
  });

  return null;
}

export function DetectiveDesk3D({ viewMode, onToggleViewMode }: DetectiveDeskProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 bg-[#0E0B09] flex items-center justify-center">
        <span className="font-mono text-xs tracking-widest text-[#A9874A]">
          INITIALIZING BUREAU DESK...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[580px] select-none">
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 3.2, 5.2], fov: 46 }}
        className="w-full h-full pointer-events-none"
      >
        <color attach="background" args={["#0D0A08"]} />

        {/* Global Dark Noir Fill Light */}
        <ambientLight color="#241B15" intensity={0.5} />

        {/* Moonlight Rim Backlight */}
        <directionalLight position={[4, 5, -5]} color="#7A93A6" intensity={0.4} />

        {/* Desk Surface (Polished Dark Walnut) */}
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <boxGeometry args={[16, 0.5, 12]} />
          <meshStandardMaterial color="#211812" roughness={0.55} metalness={0.08} />
        </mesh>

        {/* Banker's Lamp at Top-Left */}
        <BankerLamp position={[-3.6, 0, -1.8]} />

        {/* Authentic Detective Props */}
        <DeskProps />

        {/* Floating Ambient Dust */}
        <AmbientDustMotes count={40} />

        {/* Smooth Camera Rig */}
        <CameraRig viewMode={viewMode} />
      </Canvas>

      {/* Perspective / Reading View Mode Switcher Button */}
      {onToggleViewMode && (
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={onToggleViewMode}
            className="flex items-center gap-2 border border-[#A9874A]/60 bg-[#15110F]/90 px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase text-[#E7DDC8] backdrop-blur-md transition-all hover:border-[#A9874A] hover:bg-[#15110F] cursor-pointer"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#A9874A] animate-pulse" />
            {viewMode === "reading" ? "3D Desk Perspective" : "Forensic Examination Focus"}
          </button>
        </div>
      )}
    </div>
  );
}
