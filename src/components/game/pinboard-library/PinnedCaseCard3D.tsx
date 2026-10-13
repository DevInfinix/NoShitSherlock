"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
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

function EvidencePhotoMesh({ slug }: { slug: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      `/cases/${slug}/images/image_1.webp`,
      (tex) => {
        if (!active) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error("Failed to load evidence photo:", slug, err);
      },
    );
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <group position={[0, 0.11, 0.003]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[0.7, 0.68]} />
        {texture ? (
          <meshPhysicalMaterial
            map={texture}
            roughness={0.16}
            metalness={0.04}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
          />
        ) : (
          <meshStandardMaterial color="#2B2018" roughness={0.8} />
        )}
      </mesh>
      {/* Specular Lamp Reflection Sheen on glossy emulsion */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.7, 0.68]} />
        <meshPhysicalMaterial
          color="#FFF0D4"
          transparent
          opacity={0.18}
          roughness={0.06}
          metalness={0.04}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * 3D Clipped Evidence Polaroid Photo.
 * Includes photo paper frame, loaded WebP evidence photograph,
 * red classification caption, and authentic turned brass wire paperclip.
 */
function PolaroidEvidencePhoto({
  slug,
  caseId,
  position = [0.36, -0.2, 0.075],
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

      {/* Actual Evidence Photo with Specular Emulsion Reflection */}
      <EvidencePhotoMesh slug={slug} />

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
  const pointerOffset = useRef({ x: 0, y: 0 });

  // 1. Procedural Aged Golden Manila / Tea-Stained Parchment Textures with 3-map PBR
  const { diffuse, bump, roughness } = useMemo(
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

  // 2. Realistic Manila Paper Material with Physical Curvature Shader Hook
  const paperMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: diffuse,
      bumpMap: bump,
      bumpScale: 0.038,
      roughnessMap: roughness,
      roughness: 0.88,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    mat.customProgramCacheKey = () => "aged-dossier-curled-paper";
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
        #include <begin_vertex>
        // Physical dog-eared corner curl and central gravitational paper bow
        float brCurl = smoothstep(0.70, 1.0, uv.x) * smoothstep(0.0, 0.32, 1.0 - uv.y) * 0.048;
        float tlCurl = smoothstep(0.0, 0.30, 1.0 - uv.x) * smoothstep(0.72, 1.0, uv.y) * 0.038;
        float centralBow = sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * 0.022;
        transformed.z += (brCurl + tlCurl + centralBow);
        `,
      );
    };
    return mat;
  }, [diffuse, bump, roughness]);

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
      roughness.dispose();
      paperMaterial.dispose();
      brassMaterial.dispose();
    };
  }, [diffuse, bump, roughness, paperMaterial, brassMaterial]);

  // Stable positioning with zero pop up hover animations
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.04);

    // Fluid parallel parallax elevation & subtle scale on hover
    const targetZ = position[2] + (isHovered ? 0.09 : 0);
    const targetScale = scale * (isHovered ? 1.04 : 1.0);

    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      5.5,
      clampedDelta,
    );
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5.5, clampedDelta),
    );

    // Smooth parallel pointer parallax tilt
    const targetRotX = isHovered ? -pointerOffset.current.y * 0.14 : 0;
    const targetRotY = isHovered ? pointerOffset.current.x * 0.16 : 0;
    const targetRotZ = isHovered ? baseRotationZ * 0.6 : baseRotationZ;

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      5.0,
      clampedDelta,
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY,
      5.0,
      clampedDelta,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotZ,
      5.0,
      clampedDelta,
    );
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
      onPointerMove={(e) => {
        e.stopPropagation();
        pointerOffset.current = {
          x: (e.uv?.x ?? 0.5) - 0.5,
          y: (e.uv?.y ?? 0.5) - 0.5,
        };
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
        <planeGeometry args={[1.9, 2.62, 32, 32]} />
      </mesh>

      {/* Clipped Evidence Polaroid Photograph */}
      <PolaroidEvidencePhoto
        slug={caseItem.slug}
        caseId={caseItem.id}
        position={[0.36, -0.2, 0.075]}
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
