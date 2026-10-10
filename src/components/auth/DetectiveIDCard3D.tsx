"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Suppress THREE.Clock deprecation warning from internal R3F loop on Three.js r186+
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

export interface DetectiveCardProps {
  email?: string;
  agentTag?: string;
  codename?: string;
  isPasswordFocused?: boolean;
  isFlipped?: boolean;
  hoveredProvider?: "email" | "google" | "github" | null;
  onCardClick?: () => void;
}

function CardMesh({
  email = "",
  agentTag = "???",
  codename = "",
  isPasswordFocused = false,
  isFlipped = false,
  hoveredProvider = null,
  onCardClick,
}: DetectiveCardProps) {
  const cardGroupRef = useRef<THREE.Group>(null);
  const { pointer, size } = useThree();

  // Create high-res canvas textures for front and back
  const { frontTexture, backTexture } = useMemo(() => {
    const fCanvas = document.createElement("canvas");
    fCanvas.width = 1024;
    fCanvas.height = 1440;
    const fCtx = fCanvas.getContext("2d");

    const bCanvas = document.createElement("canvas");
    bCanvas.width = 1024;
    bCanvas.height = 1440;
    const bCtx = bCanvas.getContext("2d");

    const fTex = new THREE.CanvasTexture(fCanvas);
    const bTex = new THREE.CanvasTexture(bCanvas);
    fTex.colorSpace = THREE.SRGBColorSpace;
    bTex.colorSpace = THREE.SRGBColorSpace;

    return {
      frontCanvas: fCanvas,
      frontCtx: fCtx,
      frontTexture: fTex,
      backCanvas: bCanvas,
      backCtx: bCtx,
      backTexture: bTex,
    };
  }, []);

  // Compute live display names and email
  const cleanEmail = email.trim();
  const rawUsername = codename && codename !== "RECRUIT" ? codename.trim() : "";
  const rawEmailPrefix = cleanEmail ? cleanEmail.split("@")[0] : "";
  const activeCallsign = (rawUsername || rawEmailPrefix || "RECRUIT").toUpperCase();
  const activeEmail = cleanEmail ? cleanEmail.toLowerCase() : "PENDING CLEARANCE";
  const displayTag = agentTag === "???" || !agentTag ? "???" : agentTag;

  // Redraw front texture with rich gradients and detailed noir artwork
  useEffect(() => {
    const ctx = frontTexture.image.getContext("2d");
    if (!ctx) return;
    const w = 1024;
    const h = 1440;

    // Card background: deep worn leather / ink-raised with brass rim
    ctx.fillStyle = "#120f0d";
    ctx.fillRect(0, 0, w, h);

    // Inner paper container
    ctx.fillStyle = "#171310";
    ctx.fillRect(24, 24, w - 48, h - 48);

    // Rich weathered gradient reflecting hovered provider
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (hoveredProvider === "google") {
      grad.addColorStop(0, "rgba(59, 130, 246, 0.4)");
      grad.addColorStop(0.3, "rgba(14, 165, 233, 0.2)");
      grad.addColorStop(0.7, "rgba(169, 135, 74, 0.08)");
      grad.addColorStop(1, "rgba(9, 8, 7, 0.7)");
    } else if (hoveredProvider === "github") {
      grad.addColorStop(0, "rgba(168, 85, 247, 0.4)");
      grad.addColorStop(0.3, "rgba(192, 132, 252, 0.2)");
      grad.addColorStop(0.7, "rgba(100, 27, 27, 0.12)");
      grad.addColorStop(1, "rgba(9, 8, 7, 0.7)");
    } else if (hoveredProvider === "email") {
      grad.addColorStop(0, "rgba(169, 42, 40, 0.45)");
      grad.addColorStop(0.3, "rgba(100, 27, 27, 0.25)");
      grad.addColorStop(0.7, "rgba(169, 135, 74, 0.1)");
      grad.addColorStop(1, "rgba(9, 8, 7, 0.7)");
    } else {
      grad.addColorStop(0, "rgba(169, 135, 74, 0.15)");
      grad.addColorStop(0.4, "rgba(100, 27, 27, 0.12)");
      grad.addColorStop(1, "rgba(9, 8, 7, 0.65)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(24, 24, w - 48, h - 48);

    // Embossed double brass border
    ctx.strokeStyle = hoveredProvider ? "#f3e8d2" : "#a9874a";
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#a9874a";
    ctx.strokeRect(48, 48, w - 96, h - 96);

    // Decorative corner brass brackets
    const bracketLen = 36;
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(56, 56 + bracketLen);
    ctx.lineTo(56, 56);
    ctx.lineTo(56 + bracketLen, 56);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(w - 56 - bracketLen, 56);
    ctx.lineTo(w - 56, 56);
    ctx.lineTo(w - 56, 56 + bracketLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(56, h - 56 - bracketLen);
    ctx.lineTo(56, h - 56);
    ctx.lineTo(56 + bracketLen, h - 56);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(w - 56 - bracketLen, h - 56);
    ctx.lineTo(w - 56, h - 56);
    ctx.lineTo(w - 56, h - 56 - bracketLen);
    ctx.stroke();

    // Clip slot cutout at top center
    ctx.fillStyle = "#090807";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 120, 56, 240, 24, 12);
    ctx.fill();
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Header Title: No Shit Sherlock
    ctx.fillStyle = "#a9874a";
    ctx.font = "bold 34px 'TBJ Valmist', Georgia, serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText("NO SHIT SHERLOCK", w / 2, 138);

    ctx.fillStyle = "#b8ad98";
    ctx.font = "18px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("DEPARTMENT OF UNRESOLVED INVESTIGATIONS", w / 2, 172);

    ctx.strokeStyle = "rgba(169, 135, 74, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 202);
    ctx.lineTo(w - 100, 202);
    ctx.stroke();

    // Detective Silhouette Photo Box
    const photoX = 80;
    const photoY = 236;
    const photoW = 340;
    const photoH = 440;

    ctx.fillStyle = "#090807";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 4;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Silhouette Torso
    ctx.fillStyle = "#2d241e";
    ctx.beginPath();
    ctx.moveTo(photoX + 50, photoY + photoH);
    ctx.lineTo(photoX + 110, photoY + photoH - 140);
    ctx.lineTo(photoX + photoW - 110, photoY + photoH - 140);
    ctx.lineTo(photoX + photoW - 50, photoY + photoH);
    ctx.closePath();
    ctx.fill();

    // Fedora
    ctx.fillStyle = "#1e1814";
    ctx.beginPath();
    ctx.ellipse(photoX + photoW / 2, photoY + 180, 110, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(photoX + photoW / 2, photoY + 160, 65, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Collar lapels
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(photoX + 120, photoY + photoH - 140);
    ctx.lineTo(photoX + photoW / 2, photoY + photoH - 60);
    ctx.lineTo(photoX + photoW - 120, photoY + photoH - 140);
    ctx.stroke();

    // Verified Stamp watermark on photo
    ctx.save();
    ctx.translate(photoX + photoW - 65, photoY + photoH - 50);
    ctx.rotate(-0.25);
    ctx.strokeStyle = "#a92a28";
    ctx.lineWidth = 4;
    ctx.strokeRect(-60, -30, 120, 60);
    ctx.fillStyle = "#a92a28";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("VERIFIED", 0, 8);
    ctx.restore();

    // Right Column: Operative Details (LIVE UPDATING)
    ctx.textAlign = "left";
    ctx.letterSpacing = "2px";

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 17px monospace";
    ctx.fillText("OPERATIVE NO.", 460, 264);

    ctx.fillStyle = "#e7ddc8";
    ctx.font = "bold 64px 'TBJ Valmist', Georgia, serif";
    ctx.fillText(`AGENT ${displayTag}`, 460, 330);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 17px monospace";
    ctx.fillText("CALLSIGN", 460, 395);

    ctx.fillStyle = "#e7ddc8";
    ctx.font = "bold 26px monospace";
    const truncatedName =
      activeCallsign.length > 17 ? `${activeCallsign.substring(0, 15)}..` : activeCallsign;
    ctx.fillText(truncatedName, 460, 428);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 17px monospace";
    ctx.fillText("OPERATIVE TELEGRAPH", 460, 485);

    ctx.fillStyle = "#b8ad98";
    ctx.font = "20px monospace";
    const truncatedEmail =
      activeEmail.length > 22 ? `${activeEmail.substring(0, 20)}..` : activeEmail;
    ctx.fillText(truncatedEmail, 460, 516);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 17px monospace";
    ctx.fillText("CLEARANCE STATUS", 460, 580);

    // Dynamic Hover Indicator on front
    if (hoveredProvider === "google") {
      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 20px monospace";
      ctx.fillText("● GOOGLE OAUTH CLEARANCE", 460, 615);
    } else if (hoveredProvider === "github") {
      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 20px monospace";
      ctx.fillText("● GITHUB KEY CLEARANCE", 460, 615);
    } else if (hoveredProvider === "email") {
      ctx.fillStyle = "#f87171";
      ctx.font = "bold 20px monospace";
      ctx.fillText("● TELEGRAPH PASSCODE CLEARANCE", 460, 615);
    } else if (isPasswordFocused) {
      ctx.fillStyle = "#a92a28";
      ctx.font = "bold 20px monospace";
      ctx.fillText("● VERIFYING CREDENTIALS", 460, 615);
    } else {
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 20px monospace";
      ctx.fillText("● ACTIVE INVESTIGATOR", 460, 615);
    }

    // Divider Line
    ctx.strokeStyle = "rgba(169, 135, 74, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 715);
    ctx.lineTo(w - 80, 715);
    ctx.stroke();

    // Fingerprint Graphic
    const fpX = 140;
    const fpY = 875;
    ctx.strokeStyle = "rgba(169, 135, 74, 0.35)";
    ctx.lineWidth = 3;
    for (let r = 15; r <= 85; r += 14) {
      ctx.beginPath();
      ctx.ellipse(fpX, fpY, r, r * 1.35, 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Official Project Seal
    ctx.save();
    ctx.translate(w / 2 + 100, 875);
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#a9874a";
    ctx.font = "bold 18px 'TBJ Valmist', Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("NO SHIT SHERLOCK", 0, -25);
    ctx.font = "13px monospace";
    ctx.fillText("COLD CASE INVESTIGATOR", 0, 5);
    ctx.fillText("LONDON DISTRICT", 0, 35);
    ctx.restore();

    // Bottom Barcode & Serial Number
    ctx.fillStyle = "#090807";
    ctx.fillRect(80, 1070, w - 160, 180);
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 1070, w - 160, 180);

    // Procedural Barcode Lines
    ctx.fillStyle = "#e7ddc8";
    let bx = 120;
    while (bx < w - 120) {
      const bw = (bx % 7) + 2;
      ctx.fillRect(bx, 1100, bw, 90);
      bx += bw + (bx % 5) + 3;
    }

    ctx.fillStyle = "#b8ad98";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText(`NSS-DOI-${displayTag}-883492-X`, w / 2, 1225);

    // Footer notice
    ctx.fillStyle = "#78716a";
    ctx.font = "16px monospace";
    ctx.letterSpacing = "2px";
    ctx.fillText("AUTHORIZED WARRANT • DEPARTMENT OF UNRESOLVED INVESTIGATIONS", w / 2, 1335);

    frontTexture.needsUpdate = true;
  }, [displayTag, activeCallsign, activeEmail, isPasswordFocused, hoveredProvider, frontTexture]);

  // Redraw back texture
  useEffect(() => {
    const ctx = backTexture.image.getContext("2d");
    if (!ctx) return;
    const w = 1024;
    const h = 1440;

    // Card background
    ctx.fillStyle = "#120f0d";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#181412";
    ctx.fillRect(24, 24, w - 48, h - 48);

    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, w - 72, h - 72);

    // Magnetic Stripe across top
    ctx.fillStyle = "#080706";
    ctx.fillRect(24, 120, w - 48, 180);
    ctx.strokeStyle = "rgba(169, 135, 74, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 120, w - 48, 180);

    // Microchip
    const chipX = 100;
    const chipY = 360;
    const chipW = 200;
    const chipH = 160;

    ctx.fillStyle = "#a9874a";
    ctx.fillRect(chipX, chipY, chipW, chipH);
    ctx.strokeStyle = "#2d241e";
    ctx.lineWidth = 3;
    ctx.strokeRect(chipX, chipY, chipW, chipH);

    ctx.strokeRect(chipX, chipY + 50, chipW, 60);
    ctx.beginPath();
    ctx.moveTo(chipX + 100, chipY);
    ctx.lineTo(chipX + 100, chipY + chipH);
    ctx.stroke();

    // Legal & Operational Directives
    ctx.fillStyle = "#e7ddc8";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1px";
    ctx.fillText("CONFIDENTIAL INVESTIGATIVE DOSSIER", 340, 390);

    ctx.fillStyle = "#b8ad98";
    ctx.font = "18px Georgia, serif";
    const textLines = [
      "This warrant card certifies the operative as an authorized investigator",
      "for No Shit Sherlock: Department of Unresolved Investigations.",
      "Bearer is granted access to examine crime scenes, decrypt ciphers,",
      "and reconstruct chronological clues upon the evidence pinboard.",
      "Loss of credentials must be immediately reported to dispatch.",
    ];
    let ty = 430;
    for (const line of textLines) {
      ctx.fillText(line, 340, ty);
      ty += 28;
    }

    // Signature Panel
    ctx.fillStyle = "#e7ddc8";
    ctx.fillRect(80, 640, w - 160, 160);
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 640, w - 160, 160);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 16px monospace";
    ctx.fillText("AUTHORIZED OPERATIVE SIGNATURE", 95, 670);

    // Handwritten cursive signature
    ctx.fillStyle = "#1e1b4b";
    ctx.font = "italic 48px 'Caveat', cursive, serif";
    ctx.fillText(activeCallsign || "Sherlock Holmes", 120, 740);

    // Cryptographic Access Block
    ctx.fillStyle = "#090807";
    ctx.fillRect(80, 860, w - 160, 240);
    ctx.strokeStyle = "#641b1b";
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 860, w - 160, 240);

    ctx.fillStyle = "#a92a28";
    ctx.font = "bold 22px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("AUTHENTICATION CREDENTIALS", 110, 910);

    ctx.fillStyle = "#e7ddc8";
    ctx.font = "20px monospace";
    ctx.fillText(`HASH: [SHA-256::NSS-${displayTag}::993a4f8b]`, 110, 960);
    ctx.fillText(`TELEGRAPH: ${activeEmail}`, 110, 1000);
    ctx.fillStyle = "#a9874a";
    ctx.fillText("CLEARANCE: GRANTED FOR ALL ACTIVE DOSSIERS", 110, 1050);

    // Red Evidence Stamp
    ctx.save();
    ctx.translate(w / 2, 1220);
    ctx.rotate(0.12);
    ctx.strokeStyle = "#a92a28";
    ctx.lineWidth = 6;
    ctx.strokeRect(-220, -50, 440, 100);
    ctx.fillStyle = "#a92a28";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "5px";
    ctx.fillText("NO SHIT SHERLOCK", 0, -8);
    ctx.font = "bold 18px monospace";
    ctx.fillText("UNRESOLVED CASES DIVISION", 0, 26);
    ctx.restore();

    backTexture.needsUpdate = true;
  }, [displayTag, activeCallsign, activeEmail, backTexture]);

  // Butter-Smooth Lenient Mouse Tilt (No wobble, no harsh jitter)
  useFrame((_, delta) => {
    if (!cardGroupRef.current) return;

    // Flip target: 180 degrees (Math.PI)
    const shouldFlip = isFlipped || isPasswordFocused;
    const targetYRot = shouldFlip ? Math.PI : 0;

    // Lenient, smooth target rotation with restrained amplitude
    const targetRotX = -pointer.y * 0.15;
    const targetRotY = targetYRot + pointer.x * 0.18;

    // Frame-rate independent exponential damping
    const smoothFactor = 1 - Math.exp(-5.5 * Math.min(delta, 0.1));

    cardGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      cardGroupRef.current.rotation.x,
      targetRotX,
      smoothFactor,
    );
    cardGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      cardGroupRef.current.rotation.y,
      targetRotY,
      smoothFactor,
    );
    cardGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      cardGroupRef.current.rotation.z,
      -pointer.x * 0.04,
      smoothFactor,
    );
  });

  // Responsive scale: compute based on canvas aspect ratio
  const isMobile = size.width < 500;
  const responsiveScale = isMobile ? 0.92 : 1.12;

  return (
    // Single unified group: badge + hardware are permanently anchored together
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F Canvas group element
    <group
      ref={cardGroupRef}
      onClick={onCardClick}
      scale={responsiveScale}
      position={[0, -0.05, 0]}
    >
      {/* Top Metallic Brass Swivel Clip & Ring permanently affixed to the badge slot */}
      <group position={[0, 2.05, 0.02]}>
        {/* Metal Swivel Body */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
          <meshStandardMaterial color="#c5a059" roughness={0.25} metalness={0.9} />
        </mesh>
        {/* Swivel D-Ring */}
        <mesh position={[0, 0.24, 0]}>
          <torusGeometry args={[0.14, 0.035, 16, 24]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Metal Clamp gripping through the slot */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.78, 0.22, 0.09]} />
          <meshStandardMaterial color="#a9874a" roughness={0.25} metalness={0.9} />
        </mesh>
      </group>

      {/* Front Face with Realistic Clearcoat & Reflections */}
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[2.75, 3.86]} />
        <meshPhysicalMaterial
          map={frontTexture}
          roughness={0.2}
          metalness={0.15}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          reflectivity={0.9}
        />
      </mesh>

      {/* Back Face */}
      <mesh position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.75, 3.86]} />
        <meshPhysicalMaterial
          map={backTexture}
          roughness={0.25}
          metalness={0.2}
          clearcoat={0.7}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Laminated Card Rim */}
      <mesh>
        <boxGeometry args={[2.78, 3.89, 0.026]} />
        <meshStandardMaterial color="#0b0908" roughness={0.65} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function DetectiveIDCard3D(props: DetectiveCardProps) {
  const [internalFlip, setInternalFlip] = useState(false);

  const handleToggleFlip = () => {
    setInternalFlip((prev) => !prev);
    if (props.onCardClick) props.onCardClick();
  };

  return (
    <button
      type="button"
      aria-label="Interactive 3D Detective ID Badge. Click card to flip."
      onClick={handleToggleFlip}
      className="relative w-full h-[540px] sm:h-[640px] lg:h-[780px] xl:h-[840px] flex items-center justify-center cursor-pointer select-none bg-transparent border-none p-0 outline-none overflow-visible"
    >
      {/* 3D Canvas with camera framed with ample margins preventing ANY boundary cutoff */}
      <Canvas camera={{ position: [0, 0, 6.4], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        {/* Ambient base illumination */}
        <ambientLight intensity={1.2} />

        {/* Golden dramatic lighting from the left */}
        <directionalLight position={[-5, 0, 3.5]} intensity={2.8} color="#e5b85c" />

        {/* Key neutral light from top-right */}
        <directionalLight position={[4, 6, 4]} intensity={2.2} color="#fbf4e8" />

        {/* Fill center light */}
        <pointLight position={[0, 1, 3.5]} intensity={1.5} color="#e7ddc8" />

        {/* Subtle oxblood under-glow */}
        <pointLight position={[0, -3, 2]} intensity={0.9} color="#641b1b" />

        <CardMesh
          {...props}
          isFlipped={props.isFlipped ?? internalFlip}
          onCardClick={handleToggleFlip}
        />
      </Canvas>
    </button>
  );
}
