import * as THREE from "three";

/**
 * Generates an ultra-detailed procedural Portuguese cork texture with micro-pores,
 * natural bark flecks, and depth variation.
 */
export function createProceduralCorkTexture(size = 512): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
} {
  if (typeof window === "undefined") {
    // SSR fallback dummy textures
    return {
      diffuse: new THREE.Texture(),
      bump: new THREE.Texture(),
    };
  }

  // 1. Diffuse Color Map
  const dCanvas = document.createElement("canvas");
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext("2d");

  // 2. Bump Depth Map
  const bCanvas = document.createElement("canvas");
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext("2d");

  if (dCtx && bCtx) {
    // Base cork warm amber-brown wash
    dCtx.fillStyle = "#795436";
    dCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);

    // Multi-layered pore noise and flecks
    const imgData = dCtx.getImageData(0, 0, size, size);
    const dPixels = imgData.data;
    const bImgData = bCtx.getImageData(0, 0, size, size);
    const bPixels = bImgData.data;

    for (let i = 0; i < dPixels.length; i += 4) {
      // High-frequency noise
      const n1 = (Math.random() - 0.5) * 35;
      const n2 = Math.random() < 0.08 ? (Math.random() - 0.5) * 60 : 0; // occasional deep pore
      const n3 = Math.random() < 0.03 ? 40 : 0; // light bark fleck

      // RGB tone modulation
      dPixels[i] = Math.min(255, Math.max(0, 121 + n1 + n2 + n3)); // Red
      dPixels[i + 1] = Math.min(255, Math.max(0, 84 + n1 * 0.8 + n2 + n3)); // Green
      dPixels[i + 2] = Math.min(255, Math.max(0, 54 + n1 * 0.6 + n2 + n3)); // Blue
      dPixels[i + 3] = 255;

      // Bump height
      const height = Math.min(255, Math.max(0, 128 + n1 * 2 + n2 * 3));
      bPixels[i] = height;
      bPixels[i + 1] = height;
      bPixels[i + 2] = height;
      bPixels[i + 3] = 255;
    }

    dCtx.putImageData(imgData, 0, 0);
    bCtx.putImageData(bImgData, 0, 0);

    // Add subtle larger organic bark patches
    for (let j = 0; j < 30; j++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 25 + 5;
      dCtx.fillStyle = Math.random() > 0.5 ? "rgba(91, 62, 37, 0.25)" : "rgba(148, 110, 74, 0.2)";
      dCtx.beginPath();
      dCtx.arc(x, y, r, 0, Math.PI * 2);
      dCtx.fill();
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(3, 2);

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 2);

  return { diffuse, bump };
}

/**
 * Generates an aged Manila paper texture with deckle edge roughness,
 * subtle crease lines, and coffee/patina rings.
 */
export function createAgedPaperTexture(
  title: string,
  code: string,
  difficulty: number,
  size = 512,
): THREE.Texture {
  if (typeof window === "undefined") {
    return new THREE.Texture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size * 1.35; // Standard 3:4 dossier aspect ratio
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const w = canvas.width;
  const h = canvas.height;

  // 1. Aged manila background
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, "#F2EADB");
  bgGrad.addColorStop(0.7, "#E6DBC5");
  bgGrad.addColorStop(1, "#D6C7AC");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Weathered edges & subtle vignette
  ctx.fillStyle = "rgba(70, 50, 30, 0.08)";
  ctx.fillRect(0, 0, w, 16);
  ctx.fillRect(0, h - 16, w, 16);
  ctx.fillRect(0, 0, 16, h);
  ctx.fillRect(w - 16, 0, 16, h);

  // 3. Faint ledger ruled margin line
  ctx.strokeStyle = "rgba(167, 25, 45, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(42, h);
  ctx.stroke();

  // 4. Header Classification Stamp
  ctx.save();
  ctx.translate(w / 2, 60);
  ctx.rotate(-0.04);
  ctx.strokeStyle = "rgba(167, 25, 45, 0.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-160, -22, 320, 44);

  ctx.fillStyle = "#A7192D";
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`CONFIDENTIAL // ${code}`, 0, 6);
  ctx.restore();

  // 5. Official Case Title
  ctx.fillStyle = "#1C1510";
  ctx.font = "bold 26px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(title, 60, 140);

  // 6. Difficulty Stars & Metadata
  ctx.font = "14px 'Courier New', monospace";
  ctx.fillStyle = "#554335";
  const stars = "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
  ctx.fillText(`LEVEL: ${stars} [DIFFICULTY ${difficulty}/5]`, 60, 175);

  // 7. Simulated Typewriter Body Text Lines
  ctx.fillStyle = "rgba(28, 21, 16, 0.7)";
  ctx.font = "12px 'Courier New', monospace";
  const dummyLines = [
    "INCIDENT DOSSIER // RECONSTRUCTION PENDING",
    "------------------------------------------",
    "Evidence collected at scene requires chronological",
    "verification. Cross-examine forensic exhibits,",
    "witness affidavits, and wiretapped intercepts.",
    "",
    "STATUS: RESTRICTED HOMICIDE ARCHIVE",
  ];

  dummyLines.forEach((line, idx) => {
    ctx.fillText(line, 60, 230 + idx * 24);
  });

  // 8. Bottom Seal / Watermark
  ctx.save();
  ctx.translate(w - 100, h - 90);
  ctx.rotate(0.08);
  ctx.strokeStyle = "rgba(121, 96, 74, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(121, 96, 74, 0.5)";
  ctx.font = "10px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("SCOTLAND YARD", 0, -6);
  ctx.fillText("BUREAU ARCHIVE", 0, 10);
  ctx.restore();

  // 9. Subtle Coffee Stain / Water Drop on corner
  ctx.save();
  ctx.fillStyle = "rgba(100, 70, 40, 0.07)";
  ctx.beginPath();
  ctx.arc(w - 60, 70, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(100, 70, 40, 0.15)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
