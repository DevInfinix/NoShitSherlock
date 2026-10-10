"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface DetectiveCardProps {
  email?: string;
  agentTag?: string;
  codename?: string;
  isPasswordFocused?: boolean;
  isFlipped?: boolean;
  onCardClick?: () => void;
}

function CardMesh({
  email = "",
  agentTag = "004",
  codename = "",
  isPasswordFocused = false,
  isFlipped = false,
  onCardClick,
}: DetectiveCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });
  const { pointer } = useThree();

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

  // Redraw front texture
  useEffect(() => {
    const ctx = frontTexture.image.getContext("2d");
    if (!ctx) return;
    const w = 1024;
    const h = 1440;

    // Card background: deep worn leather/ink-raised with brass rim
    ctx.fillStyle = "#120f0d";
    ctx.fillRect(0, 0, w, h);

    // Inner paper container
    ctx.fillStyle = "#1c1714";
    ctx.fillRect(24, 24, w - 48, h - 48);

    // Subtle weathered gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "rgba(169, 135, 74, 0.08)");
    grad.addColorStop(0.5, "rgba(100, 27, 27, 0.12)");
    grad.addColorStop(1, "rgba(9, 8, 7, 0.4)");
    ctx.fillStyle = grad;
    ctx.fillRect(24, 24, w - 48, h - 48);

    // Outer double brass border
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, w - 72, h - 72);
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, w - 96, h - 96);

    // Clip Slot cutout at top center
    ctx.fillStyle = "#090807";
    ctx.beginPath();
    ctx.roundRect(w / 2 - 120, 56, 240, 24, 12);
    ctx.fill();
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Header Title
    ctx.fillStyle = "#a9874a";
    ctx.font = "bold 32px 'TBJ Valmist', Georgia, serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText("SCOTLAND YARD", w / 2, 140);

    ctx.fillStyle = "#b8ad98";
    ctx.font = "20px monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("SPECIAL INVESTIGATION BUREAU", w / 2, 175);

    ctx.strokeStyle = "rgba(169, 135, 74, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 205);
    ctx.lineTo(w - 100, 205);
    ctx.stroke();

    // Detective Silhouette Photo Box
    const photoX = 80;
    const photoY = 240;
    const photoW = 340;
    const photoH = 440;

    ctx.fillStyle = "#090807";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 4;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Detective Silhouette
    ctx.fillStyle = "#2d241e";
    ctx.beginPath();
    // Torso / trench coat
    ctx.moveTo(photoX + 50, photoY + photoH);
    ctx.lineTo(photoX + 110, photoY + photoH - 140);
    ctx.lineTo(photoX + photoW - 110, photoY + photoH - 140);
    ctx.lineTo(photoX + photoW - 50, photoY + photoH);
    ctx.closePath();
    ctx.fill();

    // Fedora silhouette
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

    // Photo watermark stamp
    ctx.save();
    ctx.translate(photoX + photoW - 60, photoY + photoH - 50);
    ctx.rotate(-0.25);
    ctx.strokeStyle = "#a92a28";
    ctx.lineWidth = 4;
    ctx.strokeRect(-60, -30, 120, 60);
    ctx.fillStyle = "#a92a28";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("VERIFIED", 0, 8);
    ctx.restore();

    // Right Column: Clearance Metadata
    ctx.textAlign = "left";
    ctx.letterSpacing = "2px";

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 18px monospace";
    ctx.fillText("OPERATIVE NO.", 460, 270);

    ctx.fillStyle = "#e7ddc8";
    ctx.font = "bold 64px 'TBJ Valmist', Georgia, serif";
    ctx.fillText(`AGENT ${agentTag || "004"}`, 460, 340);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 18px monospace";
    ctx.fillText("CALLSIGN / IDENTIFIER", 460, 410);

    ctx.fillStyle = "#e7ddc8";
    ctx.font = "bold 24px monospace";
    const displayName = codename || email.split("@")[0] || "UNIDENTIFIED";
    const truncatedName =
      displayName.length > 18 ? `${displayName.substring(0, 16)}..` : displayName;
    ctx.fillText(truncatedName.toUpperCase(), 460, 445);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 18px monospace";
    ctx.fillText("CLEARANCE LEVEL", 460, 515);

    ctx.fillStyle = "#a9874a";
    ctx.font = "bold 24px monospace";
    ctx.fillText("CLASS IV — DOSSIER ACCESS", 460, 550);

    ctx.fillStyle = "#78716a";
    ctx.font = "bold 18px monospace";
    ctx.fillText("STATUS", 460, 620);

    ctx.fillStyle = isPasswordFocused ? "#a92a28" : "#4ade80";
    ctx.font = "bold 22px monospace";
    ctx.fillText(isPasswordFocused ? "● VERIFYING CREDENTIALS" : "● CLEARED FOR DUTY", 460, 655);

    // Middle Divider Line
    ctx.strokeStyle = "rgba(169, 135, 74, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 720);
    ctx.lineTo(w - 80, 720);
    ctx.stroke();

    // Fingerprint Graphic
    const fpX = 140;
    const fpY = 880;
    ctx.strokeStyle = "rgba(169, 135, 74, 0.35)";
    ctx.lineWidth = 3;
    for (let r = 15; r <= 85; r += 14) {
      ctx.beginPath();
      ctx.ellipse(fpX, fpY, r, r * 1.35, 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Official Seal / Stamp on front
    ctx.save();
    ctx.translate(w / 2 + 100, 880);
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
    ctx.font = "14px monospace";
    ctx.fillText("OFFICIAL INVESTIGATOR", 0, 5);
    ctx.fillText("LONDON, UK", 0, 35);
    ctx.restore();

    // Bottom Barcode & Serial Number
    ctx.fillStyle = "#090807";
    ctx.fillRect(80, 1080, w - 160, 180);
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 1080, w - 160, 180);

    // Procedural Barcode Lines
    ctx.fillStyle = "#e7ddc8";
    let bx = 120;
    while (bx < w - 120) {
      const bw = (bx % 7) + 2;
      ctx.fillRect(bx, 1110, bw, 90);
      bx += bw + (bx % 5) + 3;
    }

    ctx.fillStyle = "#b8ad98";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText(`NSS-SY-${agentTag || "004"}-883492-X`, w / 2, 1235);

    // Footer notice
    ctx.fillStyle = "#78716a";
    ctx.font = "16px monospace";
    ctx.letterSpacing = "2px";
    ctx.fillText("AUTHORIZED UNDER THE REVISED INVESTIGATION REPAIR ACT", w / 2, 1340);

    frontTexture.needsUpdate = true;
  }, [email, agentTag, codename, isPasswordFocused, frontTexture]);

  // Redraw back texture
  useEffect(() => {
    const ctx = backTexture.image.getContext("2d");
    if (!ctx) return;
    const w = 1024;
    const h = 1440;

    // Card background
    ctx.fillStyle = "#120f0d";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#1c1714";
    ctx.fillRect(24, 24, w - 48, h - 48);

    // Brass border
    ctx.strokeStyle = "#a9874a";
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, w - 72, h - 72);

    // Magnetic Stripe across the top
    ctx.fillStyle = "#080706";
    ctx.fillRect(24, 120, w - 48, 180);
    ctx.strokeStyle = "rgba(169, 135, 74, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 120, w - 48, 180);

    // Metallic microchip simulation
    const chipX = 100;
    const chipY = 360;
    const chipW = 200;
    const chipH = 160;

    ctx.fillStyle = "#a9874a";
    ctx.fillRect(chipX, chipY, chipW, chipH);
    ctx.strokeStyle = "#2d241e";
    ctx.lineWidth = 3;
    ctx.strokeRect(chipX, chipY, chipW, chipH);

    // Chip contact traces
    ctx.strokeRect(chipX, chipY + 50, chipW, 60);
    ctx.beginPath();
    ctx.moveTo(chipX + 100, chipY);
    ctx.lineTo(chipX + 100, chipY + chipH);
    ctx.stroke();

    // Legal Warning Paragraph
    ctx.fillStyle = "#e7ddc8";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "left";
    ctx.letterSpacing = "1px";
    ctx.fillText("NOTICE OF CONFIDENTIALITY & RETRIEVAL", 340, 390);

    ctx.fillStyle = "#b8ad98";
    ctx.font = "18px Georgia, serif";
    const textLines = [
      "This warrant identification remains the sovereign property of the",
      "Special Investigation Bureau, Scotland Yard. The bearer is authorized",
      "to enter crime scenes, requisition forensic transcripts, and correlate",
      "unresolved evidence chronologically upon the departmental pinboard.",
      "Loss or surrender must be reported immediately to dispatch.",
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
    const sigName = codename || email.split("@")[0] || "Sherlock Holmes";
    ctx.fillText(sigName, 120, 740);

    // Cryptographic Access Block
    ctx.fillStyle = "#090807";
    ctx.fillRect(80, 860, w - 160, 240);
    ctx.strokeStyle = "#641b1b";
    ctx.lineWidth = 3;
    ctx.strokeRect(80, 860, w - 160, 240);

    ctx.fillStyle = "#a92a28";
    ctx.font = "bold 22px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("ENCRYPTED PASSCODE HASH VERIFICATION", 110, 910);

    ctx.fillStyle = "#e7ddc8";
    ctx.font = "20px monospace";
    ctx.fillText(`HASH: [SHA-256::${agentTag || "004"}::993a4f8b012]`, 110, 960);
    ctx.fillText("CIPHER: AES-GCM-256 / SCOTLAND_YARD_GATEWAY", 110, 1000);
    ctx.fillStyle = "#a9874a";
    ctx.fillText("CLEARANCE STATE: GRANTED FOR CASE ACCESS", 110, 1050);

    // Red Evidence Stamp
    ctx.save();
    ctx.translate(w / 2, 1220);
    ctx.rotate(0.12);
    ctx.strokeStyle = "#a92a28";
    ctx.lineWidth = 6;
    ctx.strokeRect(-220, -50, 440, 100);
    ctx.fillStyle = "#a92a28";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "center";
    ctx.letterSpacing = "6px";
    ctx.fillText("SCOTLAND YARD", 0, -8);
    ctx.font = "bold 20px monospace";
    ctx.fillText("CLASSIFIED DOSSIER DIVISION", 0, 26);
    ctx.restore();

    backTexture.needsUpdate = true;
  }, [email, agentTag, codename, backTexture]);

  // Interactive mouse tilt & flip animation
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Flip target: 180 degrees (Math.PI) if flipped or password focused
    const shouldFlip = isFlipped || isPasswordFocused;
    const targetYRot = shouldFlip ? Math.PI : 0;

    // Tilt based on mouse position
    targetRotation.current.x = -pointer.y * 0.35;
    targetRotation.current.y = targetYRot + pointer.x * 0.35;

    // Smooth interpolation with damping
    const lerpFactor = Math.min(delta * 7, 1);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      lerpFactor,
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      lerpFactor,
    );
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: R3F 3D Canvas group element
    <group ref={meshRef} onClick={onCardClick} scale={1.2} position={[0, 0, 0]}>
      {/* Front Face of the Badge */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.5, 3.52]} />
        <meshPhysicalMaterial
          map={frontTexture}
          roughness={0.25}
          metalness={0.15}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Back Face of the Badge */}
      <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.5, 3.52]} />
        <meshPhysicalMaterial
          map={backTexture}
          roughness={0.25}
          metalness={0.15}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Thick Card Rim (Dark Leather / Brass Core) */}
      <mesh>
        <boxGeometry args={[2.52, 3.54, 0.022]} />
        <meshStandardMaterial color="#090807" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Metallic Brass Clip at Top */}
      <mesh position={[0, 1.82, 0.03]}>
        <boxGeometry args={[0.7, 0.22, 0.08]} />
        <meshStandardMaterial color="#a9874a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Lanyard Strap Loop */}
      <mesh position={[0, 2.3, 0.02]}>
        <cylinderGeometry args={[0.07, 0.07, 1.0, 16]} />
        <meshStandardMaterial color="#1f1814" roughness={0.9} />
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
    <div className="relative w-full h-[460px] md:h-[540px] flex items-center justify-center">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 4.4], fov: 46 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 5, 4]} intensity={2.2} color="#fbf4e8" />
        <directionalLight position={[-4, -3, 2]} intensity={0.9} color="#a9874a" />
        <pointLight position={[0, 2, 3]} intensity={1.6} color="#e7ddc8" />

        <CardMesh
          {...props}
          isFlipped={props.isFlipped ?? internalFlip}
          onCardClick={handleToggleFlip}
        />
      </Canvas>

      {/* Interactive Flip Hint Badge */}
      <button
        type="button"
        onClick={handleToggleFlip}
        className="absolute bottom-2 right-4 text-[11px] font-mono tracking-widest uppercase px-3 py-1 bg-ink/80 text-brass border border-brass/40 hover:border-brass hover:bg-ink-raised transition-colors rounded cursor-pointer shadow-lg z-10"
      >
        [ Flip Warrant Card ⟳ ]
      </button>
    </div>
  );
}
