"use client";

import { Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { soundEngine } from "@/lib/audio/sound-engine";
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

/**
 * 3D Clipped Evidence Polaroid Photo.
 * Includes photo paper frame, loaded WebP evidence photograph,
 * red classification caption, and authentic turned brass wire paperclip.
 */
function PolaroidEvidencePhoto({
  slug,
  caseId,
  position = [0.38, -0.24, 0.015],
  rotationZ = 0.045,
}: {
  slug: string;
  caseId: number;
  position?: [number, number, number];
  rotationZ?: number;
}) {
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C89E58"),
        metalness: 0.88,
        roughness: 0.24,
      }),
    [],
  );

  const captionTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#FAF6EE";
    ctx.fillRect(0, 0, 512, 128);

    ctx.font = "bold 26px 'Courier New', monospace";
    ctx.fillStyle = "#A81626";
    ctx.textAlign = "center";
    ctx.fillText(`EXHIBIT A // CASE-0${caseId}`, 256, 48);

    ctx.font = "18px 'Courier New', monospace";
    ctx.fillStyle = "#554030";
    ctx.fillText("CRIME SCENE FORENSIC", 256, 88);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [caseId]);

  useEffect(() => {
    return () => {
      brassMaterial.dispose();
      captionTexture?.dispose();
    };
  }, [brassMaterial, captionTexture]);

  return (
    <group position={position} rotation={[0, 0, rotationZ]}>
      {/* Drop Shadow under Polaroid */}
      <mesh position={[0.02, -0.02, -0.005]}>
        <planeGeometry args={[0.82, 1.04]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* Polaroid Cream Cardstock Border */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[0.8, 1.02]} />
        <meshStandardMaterial color="#FAF6EE" roughness={0.7} metalness={0.03} />
      </mesh>

      {/* Actual WebP Evidence Photograph */}
      <Suspense
        fallback={
          <mesh position={[0, 0.11, 0.002]}>
            <planeGeometry args={[0.7, 0.68]} />
            <meshStandardMaterial color="#1A1410" roughness={0.8} />
          </mesh>
        }
      >
        <Image
          url={`/cases/${slug}/images/image_1.webp`}
          scale={[0.7, 0.68]}
          position={[0, 0.11, 0.002]}
          toneMapped
        />
      </Suspense>

      {/* Polaroid Bottom Caption Area */}
      {captionTexture && (
        <mesh position={[0, -0.34, 0.002]}>
          <planeGeometry args={[0.7, 0.18]} />
          <meshBasicMaterial map={captionTexture} />
        </mesh>
      )}

      {/* 3D Turned Brass Wire Paperclip looping over top edge */}
      <group position={[0.15, 0.5, 0.012]} rotation={[0, 0, -0.06]}>
        {/* Front Wire Legs */}
        <mesh position={[-0.022, -0.1, 0.004]} material={brassMaterial}>
          <cylinderGeometry args={[0.007, 0.007, 0.22, 8]} />
        </mesh>
        <mesh position={[0.022, -0.07, 0.004]} material={brassMaterial}>
          <cylinderGeometry args={[0.007, 0.007, 0.16, 8]} />
        </mesh>
        {/* Top Wire Loop */}
        <mesh position={[0, 0.01, 0.004]} rotation={[0, 0, Math.PI / 2]} material={brassMaterial}>
          <cylinderGeometry args={[0.007, 0.007, 0.044, 8]} />
        </mesh>
        {/* Back Clamping Wire */}
        <mesh position={[-0.022, -0.08, -0.012]} material={brassMaterial}>
          <cylinderGeometry args={[0.007, 0.007, 0.18, 8]} />
        </mesh>
      </group>
    </group>
  );
}

export function PinnedCaseCard3D({
  caseItem,
  caseIndex = 0,
  position,
  baseRotationZ = 0,
  scale = 1.0,
  isHovered,
  isDimmed: _isDimmed,
  onHover,
  onSelect,
}: PinnedCaseCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);

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

  // 2. Realistic Manila Paper Material
  const paperMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: diffuse,
      bumpMap: bump,
      bumpScale: 0.035,
      roughness: 0.85,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
  }, [diffuse, bump]);

  // 3. Antique Turned Brass Pushpin Material
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
      paperMaterial.dispose();
      brassMaterial.dispose();
    };
  }, [diffuse, bump, paperMaterial, brassMaterial]);

  // Stable positioning with zero pop up hover animations
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.rotation.set(0, 0, baseRotationZ);
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F Canvas interactive group
    <group
      ref={groupRef}
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
      onClick={(e) => {
        e.stopPropagation();
        soundEngine.playStamp();
        onSelect(caseItem);
      }}
    >
      {/* 3D Drop Shadow onto the Felt Board */}
      <mesh position={[0.04, -0.05, -0.02]}>
        <planeGeometry args={[1.96, 2.68]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isHovered ? 0.35 : 0.25}
          depthWrite={false}
        />
      </mesh>

      {/* 3D Paper Dossier Cardstock Mesh with Full Typography, Stamps & Incident Lines */}
      <mesh material={paperMaterial} castShadow receiveShadow>
        <planeGeometry args={[1.9, 2.62, 16, 16]} />
      </mesh>

      {/* Clipped Evidence Polaroid Photograph */}
      <PolaroidEvidencePhoto
        slug={caseItem.slug}
        caseId={caseItem.id}
        position={[0.38, -0.22, 0.015]}
        rotationZ={0.045}
      />

      {/* Subtle hover outline ring */}
      {isHovered && (
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[1.94, 2.66]} />
          <meshBasicMaterial
            color="#A9874A"
            wireframe
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3D Brass Pushpin at top center of paper */}
      <group position={[0, 1.25, 0.08]}>
        <mesh position={[0, 0, -0.04]} material={brassMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.08, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.01]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.075, 0.09, 0.04, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.05]} material={brassMaterial} castShadow>
          <cylinderGeometry args={[0.06, 0.075, 0.06, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.09]} castShadow>
          <sphereGeometry args={[0.058, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#A81626" metalness={0.25} roughness={0.18} />
        </mesh>
      </group>
    </group>
  );
}
