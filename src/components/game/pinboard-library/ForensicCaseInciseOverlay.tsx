"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { soundEngine } from "@/lib/audio/sound-engine";
import type { ActiveCaseListing } from "@/server/services/game-session-service";

interface ForensicCaseInciseOverlayProps {
  activeCase: ActiveCaseListing | null;
  onClose: () => void;
}

/**
 * Procedural Incident Report Sheet Texture (1024x1380).
 * Generates official Scotland Yard header, case title, security clearance stars,
 * wrapped typewriter narrative lines, reward points, and status.
 */
function createDossierReportSheetTexture(activeCase: ActiveCaseListing): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
} {
  if (typeof window === "undefined") {
    return { diffuse: new THREE.Texture(), bump: new THREE.Texture() };
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1380;
  const ctx = canvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = 1024;
  bCanvas.height = 1380;
  const bCtx = bCanvas.getContext("2d");

  if (!ctx || !bCtx) {
    return { diffuse: new THREE.Texture(canvas), bump: new THREE.Texture(bCanvas) };
  }

  const w = canvas.width;
  const h = canvas.height;

  // Bump neutral
  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, w, h);

  // Aged manila paper sheet tone
  const grad = ctx.createRadialGradient(w * 0.45, h * 0.45, 80, w * 0.5, h * 0.5, w * 0.85);
  grad.addColorStop(0, "#EAE0CA");
  grad.addColorStop(0.65, "#E0D4B9");
  grad.addColorStop(0.9, "#CDBE9F");
  grad.addColorStop(1, "#B8A783");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Paper fiber noise
  const imgData = ctx.getImageData(0, 0, w, h);
  const px = imgData.data;
  for (let i = 0; i < px.length; i += 8) {
    const n = (Math.random() - 0.5) * 18;
    px[i] = Math.min(255, Math.max(0, (px[i] ?? 0) + n));
    px[i + 1] = Math.min(255, Math.max(0, (px[i + 1] ?? 0) + n));
    px[i + 2] = Math.min(255, Math.max(0, (px[i + 2] ?? 0) + n * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  // Red ledger margin line
  ctx.strokeStyle = "rgba(180, 24, 38, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(85, 0);
  ctx.lineTo(85, h);
  ctx.stroke();

  // Horizontal fold crease across middle
  ctx.strokeStyle = "rgba(75, 52, 28, 0.22)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w, h * 0.5);
  ctx.stroke();

  bCtx.strokeStyle = "rgba(20, 20, 20, 0.6)";
  bCtx.lineWidth = 4;
  bCtx.beginPath();
  bCtx.moveTo(0, h * 0.5);
  bCtx.lineTo(w, h * 0.5);
  bCtx.stroke();

  // Coffee cup stain
  const cupX = w * 0.76;
  const cupY = h * 0.72;
  ctx.save();
  ctx.strokeStyle = "rgba(60, 32, 14, 0.48)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cupX, cupY, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Top Classified Header Rubber Stamp
  ctx.save();
  ctx.translate(w * 0.5, 90);
  ctx.rotate(-0.04);
  ctx.strokeStyle = "rgba(168, 22, 38, 0.9)";
  ctx.lineWidth = 4.5;
  ctx.strokeRect(-250, -28, 500, 56);
  ctx.fillStyle = "rgba(168, 22, 38, 0.92)";
  ctx.font = "bold 24px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`INCIDENT DOSSIER // FILE #${activeCase.id.toString().padStart(3, "0")}`, 0, 0);
  ctx.restore();

  // Case Title
  ctx.fillStyle = "#140E0A";
  ctx.font = "bold 44px 'Georgia', serif";
  ctx.textAlign = "left";
  ctx.fillText(activeCase.title, 115, 210);

  ctx.strokeStyle = "rgba(50, 35, 20, 0.5)";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(115, 228);
  ctx.lineTo(w - 90, 228);
  ctx.stroke();

  // Clearance Stars
  const starsFilled = "★".repeat(activeCase.difficulty);
  const starsEmpty = "☆".repeat(Math.max(0, 5 - activeCase.difficulty));
  ctx.fillStyle = "#6B1D24";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillText(
    `CLEARANCE LEVEL: ${starsFilled}${starsEmpty} [CLASS ${activeCase.difficulty}/5]`,
    115,
    275,
  );

  // Dispatch Summary section header
  ctx.fillStyle = "#554030";
  ctx.font = "bold 18px 'Courier New', monospace";
  ctx.fillText("DISPATCH SUMMARY & DETECTIVE BRIEF:", 115, 335);

  // Wrapped narrative lines
  ctx.fillStyle = "rgba(22, 16, 12, 0.92)";
  ctx.font = "20px 'Georgia', serif";
  const words = (activeCase.description || "").split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    if (`${cur} ${word}`.length > 38) {
      lines.push(cur.trim());
      cur = word;
    } else {
      cur += ` ${word}`;
    }
  }
  if (cur) lines.push(cur.trim());

  lines.forEach((line, i) => {
    ctx.fillText(line, 115, 375 + i * 36);
  });

  // Score & Status Box
  const boxY = 375 + lines.length * 36 + 40;
  ctx.strokeStyle = "rgba(40, 28, 18, 0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(115, boxY, w - 230, 140);

  ctx.fillStyle = "rgba(40, 28, 18, 0.05)";
  ctx.fillRect(115, boxY, w - 230, 140);

  ctx.font = "bold 17px 'Courier New', monospace";
  ctx.fillStyle = "#554030";
  ctx.fillText("MAXIMUM SCORE REWARD:", 135, boxY + 40);
  ctx.fillStyle = "#16110D";
  ctx.font = "bold 26px 'Georgia', serif";
  ctx.fillText(`${activeCase.maxScore} PTS`, 135, boxY + 80);

  ctx.font = "bold 17px 'Courier New', monospace";
  ctx.fillStyle = "#554030";
  ctx.fillText("INVESTIGATION STATUS:", 550, boxY + 40);
  ctx.font = "bold 20px 'Courier New', monospace";
  if (activeCase.activeSessionStatus === "COMPLETED") {
    ctx.fillStyle = "#A7192D";
    ctx.fillText("[SOLVED]", 550, boxY + 80);
  } else if (activeCase.activeSessionStatus === "IN_PROGRESS") {
    ctx.fillStyle = "#A9874A";
    ctx.fillText(`IN PROGRESS (${activeCase.activeSessionScore ?? 0} PTS)`, 550, boxY + 80);
  } else {
    ctx.fillStyle = "#6B5848";
    ctx.fillText("[UNSOLVED COLD FILE]", 550, boxY + 80);
  }

  // Official Seal Watermark
  ctx.save();
  ctx.translate(w * 0.5, h * 0.86);
  ctx.strokeStyle = "rgba(140, 24, 34, 0.16)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 105, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "bold 15px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(140, 24, 34, 0.22)";
  ctx.fillText("METROPOLITAN CRIMINAL ARCHIVES", 0, 0);
  ctx.restore();

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.needsUpdate = true;

  return { diffuse, bump };
}

/**
 * Procedural Manila Folder Backing Texture (1024x768).
 */
function createManilaFolderCoverTexture(): { diffuse: THREE.Texture; bump: THREE.Texture } {
  if (typeof window === "undefined") {
    return { diffuse: new THREE.Texture(), bump: new THREE.Texture() };
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { diffuse: new THREE.Texture(), bump: new THREE.Texture() };

  // Aged Manila cardstock gradient
  const grad = ctx.createRadialGradient(512, 384, 50, 512, 384, 600);
  grad.addColorStop(0, "#DBC8A6");
  grad.addColorStop(0.7, "#CDAA7D");
  grad.addColorStop(1, "#A88355");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 768);

  // Center vertical spine fold crease
  ctx.strokeStyle = "rgba(45, 26, 12, 0.35)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(512, 0);
  ctx.lineTo(512, 768);
  ctx.stroke();

  // Weathered perimeter
  ctx.fillStyle = "rgba(40, 20, 8, 0.18)";
  ctx.fillRect(0, 0, 1024, 25);
  ctx.fillRect(0, 743, 1024, 25);

  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.needsUpdate = true;

  return { diffuse, bump: diffuse };
}

/**
 * Evidence Photo Mesh with Specular Lamp Reflection.
 */
function DossierPhotoMesh({ url }: { url: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      if (active) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        setTexture(tex);
      }
    });
    return () => {
      active = false;
    };
  }, [url]);

  return (
    <group position={[0, 0.22, 0.003]}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.34, 1.3]} />
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
      {/* Glossy photographic clearcoat lamp reflection overlay */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[1.34, 1.3]} />
        <meshPhysicalMaterial
          color="#FFEBC2"
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
 * 3D Physical Case Dossier Scene with Interactive 360 Rotation Controls.
 */
function CaseDossier3DScene({
  activeCase,
  previewImage,
}: {
  activeCase: ActiveCaseListing;
  previewImage: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const sheetTextures = useMemo(() => createDossierReportSheetTexture(activeCase), [activeCase]);

  const folderTextures = useMemo(() => createManilaFolderCoverTexture(), []);

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
    ctx.fillText(`EXHIBIT A // CASE-0${activeCase.id}`, 256, 48);

    ctx.font = "18px 'Courier New', monospace";
    ctx.fillStyle = "#554030";
    ctx.fillText("CRIME SCENE RECONSTRUCTION STILL", 256, 88);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [activeCase.id]);

  useEffect(() => {
    return () => {
      sheetTextures.diffuse.dispose();
      sheetTextures.bump.dispose();
      folderTextures.diffuse.dispose();
      folderTextures.bump.dispose();
      brassMaterial.dispose();
      captionTexture?.dispose();
    };
  }, [sheetTextures, folderTextures, brassMaterial, captionTexture]);

  // Subtle breathing idle rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.02;
  });

  return (
    <>
      {/* Warm Banker Lamp Spotlight shining over the open dossier */}
      <spotLight
        position={[-1.6, 2.5, 2.4]}
        color="#FFAE42"
        intensity={3.8}
        distance={12}
        penumbra={0.8}
        castShadow
        shadow-bias={-0.0001}
      />
      <pointLight position={[-1.6, 2.5, 1.4]} color="#FFC473" intensity={2.2} distance={8} />

      {/* Key Studio Light */}
      <directionalLight
        position={[2.8, 3.8, 2.6]}
        color="#FFF5E4"
        intensity={1.75}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Cool ambient fill */}
      <directionalLight position={[-3.2, 1.2, 1.8]} color="#7E9EB8" intensity={0.45} />
      <ambientLight color="#34281E" intensity={0.75} />

      {/* Main Interactive 3D Case Dossier Group */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Drop shadow under open folder */}
        <mesh position={[0.04, -0.05, -0.04]}>
          <planeGeometry args={[4.46, 3.02]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} depthWrite={false} />
        </mesh>

        {/* 1. Open Manila Folder Backing */}
        <mesh position={[0, 0, -0.01]} castShadow receiveShadow>
          <planeGeometry args={[4.4, 2.95, 32, 16]} />
          <meshStandardMaterial
            map={folderTextures.diffuse}
            bumpMap={folderTextures.bump}
            bumpScale={0.02}
            roughness={0.84}
            metalness={0.02}
          />
        </mesh>

        {/* 2. Left Page: Typewritten Incident Report Sheet */}
        <mesh position={[-1.06, 0.02, 0.006]} castShadow receiveShadow>
          <planeGeometry args={[1.94, 2.6, 16, 16]} />
          <meshStandardMaterial
            map={sheetTextures.diffuse}
            bumpMap={sheetTextures.bump}
            bumpScale={0.035}
            roughness={0.88}
            metalness={0.01}
          />
        </mesh>

        {/* 3. Right Page: 3D Clipped Evidence Polaroid Photo */}
        <group position={[1.1, 0.08, 0.014]} rotation={[0, 0, -0.035]}>
          {/* Drop shadow under polaroid */}
          <mesh position={[0.025, -0.025, -0.005]}>
            <planeGeometry args={[1.56, 1.98]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
          </mesh>

          {/* Polaroid Cream Cardstock Frame */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <planeGeometry args={[1.52, 1.94]} />
            <meshStandardMaterial color="#FAF7F0" roughness={0.7} metalness={0.02} />
          </mesh>

          {/* Actual Photograph with Specular Lamp Reflection Sheen */}
          <DossierPhotoMesh url={previewImage} />

          {/* Polaroid Bottom Caption Area */}
          {captionTexture && (
            <mesh position={[0, -0.62, 0.002]}>
              <planeGeometry args={[1.34, 0.32]} />
              <meshBasicMaterial map={captionTexture} />
            </mesh>
          )}

          {/* 3D Turned Brass Paperclip Clamping Polaroid to Dossier */}
          <group position={[0.28, 0.96, 0.014]} rotation={[0, 0, -0.06]}>
            <mesh position={[-0.03, -0.16, 0.006]} material={brassMaterial}>
              <cylinderGeometry args={[0.01, 0.01, 0.36, 8]} />
            </mesh>
            <mesh position={[0.03, -0.11, 0.006]} material={brassMaterial}>
              <cylinderGeometry args={[0.01, 0.01, 0.26, 8]} />
            </mesh>
            <mesh
              position={[0, 0.02, 0.006]}
              rotation={[0, 0, Math.PI / 2]}
              material={brassMaterial}
            >
              <cylinderGeometry args={[0.01, 0.01, 0.06, 8]} />
            </mesh>
            <mesh position={[-0.03, -0.14, -0.018]} material={brassMaterial}>
              <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

export function ForensicCaseInciseOverlay({ activeCase, onClose }: ForensicCaseInciseOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        soundEngine.playPaper();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!activeCase) return null;

  const previewImage = `/cases/${activeCase.slug}/images/image_1.webp`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#0A0705]/92 backdrop-blur-md select-none"
      >
        {/* Full-viewport Interactive 3D Case Dossier Canvas */}
        <div className="absolute inset-0 z-0">
          {mounted ? (
            <Canvas
              camera={{ position: [0, 0, 4.4], fov: 42 }}
              dpr={[1, 2]}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.05,
              }}
              shadows
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={2.4}
                maxDistance={6.2}
                maxPolarAngle={Math.PI / 2 + 0.25}
                minPolarAngle={0.15}
              />
              <CaseDossier3DScene activeCase={activeCase} previewImage={previewImage} />
            </Canvas>
          ) : (
            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#A9874A]">
              OPENING INVESTIGATION DOSSIER...
            </div>
          )}
        </div>

        {/* Floating Minimal In-World Header */}
        <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-10 pointer-events-none flex items-center justify-between gap-4">
          <div className="pointer-events-auto border border-[#A9874A]/40 bg-[#100D0A]/90 px-3.5 py-1.5 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#A7192D] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] font-bold">
              SCOTLAND YARD {"//"} FILE #{activeCase.id.toString().padStart(3, "0")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playPaper();
              onClose();
            }}
            className="pointer-events-auto border border-[#A9874A]/40 bg-[#100D0A]/90 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#E7DDC8] hover:border-[#A7192D] hover:bg-[#A7192D]/20 transition-colors shadow-2xl cursor-pointer"
          >
            &times; Return to Noticeboard (ESC)
          </button>
        </div>

        {/* Floating Minimal In-World Action Footer */}
        <div className="absolute bottom-5 inset-x-4 sm:inset-x-8 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playPaper();
              onClose();
            }}
            className="pointer-events-auto border border-[#A9874A]/40 bg-[#100D0A]/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#B8AD98] hover:border-[#A9874A] hover:text-[#E7DDC8] transition-colors shadow-2xl cursor-pointer"
          >
            &larr; Back to Board
          </button>

          <div className="hidden sm:block pointer-events-none font-mono text-[10px] uppercase tracking-widest text-[#A9874A]/70 bg-[#100D0A]/80 px-3 py-1.5 border border-[#A9874A]/25 backdrop-blur-md shadow-xl">
            DRAG TO ROTATE 3D DOSSIER &bull; SCROLL TO ZOOM
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            {/* Evidence Pinboard link: ONLY visible when case is completed */}
            {activeCase.activeSessionStatus === "COMPLETED" && (
              <Link
                href={`/pinboard/${activeCase.slug}`}
                onClick={() => soundEngine.playPaper()}
                className="border border-[#A9874A]/60 bg-[#100D0A]/90 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#A9874A] hover:bg-[#A9874A] hover:text-[#100D0A] transition-colors shadow-2xl"
              >
                Evidence Pinboard &rarr;
              </Link>
            )}

            <Link
              href={`/cases/${activeCase.slug}`}
              onClick={() => soundEngine.playStamp()}
              className="border-2 border-[#A7192D] bg-[#A7192D] hover:bg-[#8A1424] text-[#E7DDC8] px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95"
            >
              {activeCase.activeSessionStatus === "IN_PROGRESS"
                ? "Continue Investigation →"
                : "Open Case File →"}
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
