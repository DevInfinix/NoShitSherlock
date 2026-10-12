"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { soundEngine } from "@/lib/audio/sound-engine";
import type { ActiveCaseListing } from "@/server/services/game-session-service";

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

function getCasePreviewImage(slug: string): string {
  if (slug === "case-01-missing-ledger") {
    return "/cases/case-01-missing-ledger/images/case1_image1.webp";
  }
  return `/cases/${slug}/images/image_1.webp`;
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
  const router = useRouter();
  const groupRef = useRef<THREE.Group>(null);
  const pointerOffset = useRef({ x: 0, y: 0 });
  const [imgFailed, setImgFailed] = useState(false);

  // Turned Brass Pushpin Material
  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C89E58"),
        metalness: 0.88,
        roughness: 0.25,
      }),
    [],
  );

  const previewImage = getCasePreviewImage(caseItem.slug);
  const isManila = caseIndex % 2 === 0;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth Z elevation on hover: card smoothly lifts forward into large incise inspection
    const targetZ = position[2] + (isHovered ? 1.55 : 0);
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      6.0,
      delta,
    );

    // Dynamic scale expansion during 3D Incise inspection
    const targetScale = scale * (isHovered ? 1.32 : 1.0);
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6.0, delta),
    );

    // Subtle pointer parallax tilt during inspection
    const targetRotX = isHovered ? -pointerOffset.current.y * 0.22 : 0;
    const targetRotY = isHovered ? pointerOffset.current.x * 0.24 : 0;
    const targetRotZ = isHovered ? 0 : baseRotationZ;

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      5.0,
      delta,
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY,
      5.0,
      delta,
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotZ,
      5.0,
      delta,
    );
  });

  const handleLaunchCase = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playStamp();
    router.push(`/cases/${caseItem.slug}`);
  };

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
        onSelect(caseItem);
      }}
    >
      {/* 3D Drop Shadow onto the Felt Board */}
      <mesh position={[0.04, -0.05, -0.02]}>
        <planeGeometry args={[2.0, 2.75]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isHovered ? 0.35 : 0.45}
          depthWrite={false}
        />
      </mesh>

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

      {/* Drei HTML Transform: Retina-Crisp Tactile Manila Dossier Card */}
      <Html
        transform
        distanceFactor={3.2}
        position={[0, 0, 0.02]}
        className="pointer-events-auto select-none"
      >
        <div
          className={`relative w-[310px] min-h-[415px] p-5 rounded-xs transition-opacity duration-200 cursor-pointer shadow-2xl ${
            isDimmed && !isHovered ? "opacity-35" : "opacity-100"
          }`}
          style={{
            background: isManila
              ? "radial-gradient(circle at 45% 45%, #F4EBD8 0%, #EFE4CC 55%, #DECCA5 85%, #CAA975 100%)"
              : "radial-gradient(circle at 45% 45%, #EDE3C8 0%, #E8DCBE 55%, #D6BF97 85%, #BA9C6C 100%)",
            color: "#16110D",
            boxShadow: isHovered
              ? "0 28px 45px -12px rgba(0, 0, 0, 0.85), 0 0 0 2px rgba(169, 135, 74, 0.6)"
              : "0 14px 25px -8px rgba(0, 0, 0, 0.7)",
          }}
        >
          {/* Burnt Charred Deckle Bottom Edge */}
          <div
            className="absolute inset-x-0 bottom-0 h-9 pointer-events-none rounded-b-xs"
            style={{
              background:
                "linear-gradient(to top, rgba(16, 8, 3, 0.95) 0%, rgba(36, 18, 8, 0.6) 45%, transparent 100%)",
            }}
          />

          {/* Yellowed Tape Strips */}
          <div
            className="absolute -top-2.5 left-5 w-14 h-5 pointer-events-none rotate-[-4deg] opacity-75"
            style={{
              background: "rgba(225, 195, 130, 0.6)",
              border: "1px solid rgba(255, 245, 215, 0.4)",
            }}
          />
          <div
            className="absolute -bottom-2 right-4 w-16 h-5 pointer-events-none rotate-[6deg] opacity-75"
            style={{
              background: "rgba(225, 195, 130, 0.6)",
              border: "1px solid rgba(255, 245, 215, 0.4)",
            }}
          />

          {/* Twin Staples at Top Margin */}
          <div className="absolute top-2.5 left-16 w-4 h-1.5 bg-[#1B1510] shadow-sm rounded-xs border-t border-[#8C5528]" />
          <div className="absolute top-2.5 right-16 w-4 h-1.5 bg-[#1B1510] shadow-sm rounded-xs border-t border-[#8C5528]" />

          {/* Red Ledger Margin Line */}
          <div className="absolute top-0 bottom-0 left-7 w-[1.5px] bg-[#A81626]/35 pointer-events-none" />

          {/* Header Rubber Stamp */}
          <div className="flex items-center justify-between border-b-2 border-[#16110D]/20 pb-2 mb-3">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#A81626] border border-[#A81626] px-1.5 py-0.5 rotate-[-1deg]">
              SCOTLAND YARD {"//"} EVIDENCE
            </span>
            <span className="font-mono text-[10px] text-[#554030] font-bold">
              FILE #{caseItem.id.toString().padStart(3, "0")}
            </span>
          </div>

          {/* Case Title in Classic Noir Serif */}
          <h2 className="font-serif text-lg font-bold leading-tight text-[#16110D] mb-1">
            {caseItem.title}
          </h2>

          {/* Clearance Level */}
          <div className="font-mono text-[10px] text-[#785938] mb-3 flex items-center gap-1.5">
            <span>CLEARANCE:</span>
            <span className="text-[#A9874A] tracking-wider font-bold">
              {"★".repeat(caseItem.difficulty)}
              {"☆".repeat(5 - caseItem.difficulty)}
            </span>
          </div>

          {/* Crime Scene Polaroid (Option 5.a: Clipped to Top-Right / Float) */}
          <div className="relative my-2 flex items-center justify-center">
            <div className="relative bg-[#FAF6EE] p-1.5 pb-4 shadow-md rotate-[2deg] border border-[#D5C6A8] max-w-[170px]">
              {/* Paperclip clamping polaroid */}
              <div className="absolute -top-3.5 right-4 w-3.5 h-8 border-2 border-[#C89E58] rounded-full z-10 shadow-sm" />

              {/* Photo Image */}
              <div className="w-[155px] h-[105px] overflow-hidden bg-[#15110F] relative">
                {!imgFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt={caseItem.title}
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover filter contrast-110 sepia-[0.35]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#18130E] text-[#B8AD98] font-mono text-[9px]">
                    <span className="text-[#A81626] font-bold">[EVIDENCE PHOTO]</span>
                    <span>RESTRICTED ARCHIVE</span>
                  </div>
                )}
              </div>
              <div className="font-mono text-[8px] text-[#A81626] text-center mt-1.5 font-bold uppercase tracking-wider">
                EXHIBIT A {"//"} SCENE
              </div>
            </div>
          </div>

          {/* Typewriter Dossier Debrief */}
          <p className="font-serif text-[11px] leading-relaxed text-[#2B2017] mb-3 line-clamp-3 italic">
            "{caseItem.description}"
          </p>

          {/* Coffee Ring Stain Overlay */}
          <div
            className="absolute bottom-8 left-4 w-20 h-20 rounded-full border-4 border-[#5E3618]/30 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 12px rgba(85, 45, 18, 0.25)",
            }}
          />

          {/* Expanded 3D Incise Actions (Option 4.a: Revealed / Highlighted on Hover) */}
          <div className="mt-3 pt-2 border-t border-[#16110D]/20 flex items-center justify-between">
            <div className="font-mono text-[9px] text-[#554030]">
              STATUS: <span className="text-[#A81626] font-bold">ACTIVE</span>
            </div>

            <button
              type="button"
              onClick={handleLaunchCase}
              className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer shadow-md ${
                isHovered
                  ? "bg-[#641B1B] text-[#E7DDC8] border-[#A81626] scale-105"
                  : "bg-[#18120B] text-[#E7DDC8] border-[#A9874A]/40 hover:bg-[#641B1B]"
              }`}
            >
              Enter Investigation &rarr;
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}
