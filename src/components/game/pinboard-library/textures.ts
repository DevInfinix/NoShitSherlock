import * as THREE from "three";

/**
 * Generates an ultra-detailed procedural Green Felt Baize police noticeboard texture
 * with micro-fibers, velvet weave, and pin puncture marks.
 */
export function createProceduralGreenFeltTexture(size = 512): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
} {
  if (typeof window === "undefined") {
    return {
      diffuse: new THREE.Texture(),
      bump: new THREE.Texture(),
    };
  }

  const dCanvas = document.createElement("canvas");
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext("2d");

  if (dCtx && bCtx) {
    // 1. Deep forest green base
    dCtx.fillStyle = "#122015";
    dCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);

    // 2. Microfiber velvet noise
    const imgData = dCtx.getImageData(0, 0, size, size);
    const dPixels = imgData.data;
    const bImgData = bCtx.getImageData(0, 0, size, size);
    const bPixels = bImgData.data;

    for (let i = 0; i < dPixels.length; i += 4) {
      const n = (Math.random() - 0.5) * 25;
      const fiber = Math.random() < 0.05 ? 20 : 0; // tiny felt fiber

      dPixels[i] = Math.min(255, Math.max(0, 18 + n * 0.4)); // Deep red channel
      dPixels[i + 1] = Math.min(255, Math.max(0, 32 + n + fiber)); // Forest green
      dPixels[i + 2] = Math.min(255, Math.max(0, 21 + n * 0.5)); // Deep blue
      dPixels[i + 3] = 255;

      const height = Math.min(255, Math.max(0, 128 + n * 1.5 + fiber * 2));
      bPixels[i] = height;
      bPixels[i + 1] = height;
      bPixels[i + 2] = height;
      bPixels[i + 3] = 255;
    }

    dCtx.putImageData(imgData, 0, 0);
    bCtx.putImageData(bImgData, 0, 0);

    // 3. Subtle scattered pushpin puncture marks from past cold cases
    for (let p = 0; p < 45; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      dCtx.fillStyle = "rgba(6, 12, 8, 0.6)";
      dCtx.beginPath();
      dCtx.arc(px, py, 1.8, 0, Math.PI * 2);
      dCtx.fill();

      bCtx.fillStyle = "rgba(0, 0, 0, 0.7)";
      bCtx.beginPath();
      bCtx.arc(px, py, 2.0, 0, Math.PI * 2);
      bCtx.fill();
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
 * Generates a soft GoBo texture casting subtle, diffuse window grill / blind shadows.
 */
export function createSoftWindowBlindGoBoTexture(size = 512): THREE.Texture {
  if (typeof window === "undefined") {
    return new THREE.Texture();
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.Texture(canvas);

  // Soft ambient illuminated base
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  // Blurred window slats & crossbars
  ctx.filter = "blur(14px)";
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";

  // Horizontal blind slats
  const slatCount = 9;
  const step = size / slatCount;
  for (let i = 0; i < slatCount; i++) {
    ctx.fillRect(0, i * step + step * 0.25, size, step * 0.45);
  }

  // Vertical window mullion dividing the frame
  ctx.fillRect(size * 0.48, 0, size * 0.08, size);

  ctx.filter = "none";

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Generates an aged Manila paper texture with heavy weathering,
 * crease fold displacement lines, coffee stains, and burned/weathered edges.
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
  canvas.height = Math.round(size * 1.35); // 3:4.05 dossier aspect ratio
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.Texture(canvas);
  }

  const w = canvas.width;
  const h = canvas.height;

  // 1. Aged manila parchment radial gradient
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.75);
  bgGrad.addColorStop(0, "#EAE0CD");
  bgGrad.addColorStop(0.65, "#DECFAf");
  bgGrad.addColorStop(1, "#C9B692");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Weathered, burnt/stained deckle edges
  ctx.fillStyle = "rgba(60, 42, 22, 0.12)";
  ctx.fillRect(0, 0, w, 20);
  ctx.fillRect(0, h - 20, w, 20);
  ctx.fillRect(0, 0, 20, h);
  ctx.fillRect(w - 20, 0, 20, h);

  // 3. Central horizontal & diagonal crease fold lines
  ctx.strokeStyle = "rgba(80, 58, 36, 0.14)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.48);
  ctx.lineTo(w, h * 0.49);
  ctx.moveTo(0, h * 0.72);
  ctx.lineTo(w, h * 0.73);
  ctx.stroke();

  // Highlight crease reflection line
  ctx.strokeStyle = "rgba(255, 250, 240, 0.25)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.48 - 2);
  ctx.lineTo(w, h * 0.49 - 2);
  ctx.stroke();

  // 4. Twin staple puncture holes at top margin
  ctx.fillStyle = "#120E0A";
  ctx.fillRect(w * 0.35, 12, 10, 3);
  ctx.fillRect(w * 0.65, 12, 10, 3);
  ctx.fillStyle = "rgba(140, 95, 55, 0.4)"; // rust stain around staple
  ctx.fillRect(w * 0.35 - 3, 10, 16, 7);
  ctx.fillRect(w * 0.65 - 3, 10, 16, 7);

  // 5. Red Ledger Margin Line
  ctx.strokeStyle = "rgba(167, 25, 45, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(42, h);
  ctx.stroke();

  // 6. Header Classification Rubber Stamp
  ctx.save();
  ctx.translate(w / 2, 60);
  ctx.rotate(-0.035);
  ctx.strokeStyle = "rgba(167, 25, 45, 0.88)";
  ctx.lineWidth = 3;
  ctx.strokeRect(-160, -22, 320, 44);

  ctx.fillStyle = "#A7192D";
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`CONFIDENTIAL // ${code}`, 0, 6);
  ctx.restore();

  // 7. Case Title
  ctx.fillStyle = "#1C1510";
  ctx.font = "bold 25px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(title, 60, 138);

  // 8. Difficulty Indicator
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillStyle = "#554335";
  const stars = "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
  ctx.fillText(`LEVEL: ${stars} [DIFFICULTY ${difficulty}/5]`, 60, 172);

  // 9. Typewriter Body Lines
  ctx.fillStyle = "rgba(28, 21, 16, 0.75)";
  ctx.font = "12px 'Courier New', monospace";
  const dummyLines = [
    "HOMICIDE DIVISION // ACTIVE EVIDENCE EXAM",
    "------------------------------------------",
    "Evidence collected at scene requires chronological",
    "verification. Cross-examine forensic exhibits,",
    "witness affidavits, and wiretapped intercepts.",
    "",
    "STATUS: RESTRICTED CENTRAL ARCHIVE",
  ];

  dummyLines.forEach((line, idx) => {
    ctx.fillText(line, 60, 224 + idx * 24);
  });

  // 10. Scotland Yard Seal / Watermark
  ctx.save();
  ctx.translate(w - 95, h - 85);
  ctx.rotate(0.08);
  ctx.strokeStyle = "rgba(100, 75, 50, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(100, 75, 50, 0.45)";
  ctx.font = "9px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText("METROPOLITAN", 0, -6);
  ctx.fillText("POLICE EVIDENCE", 0, 8);
  ctx.restore();

  // 11. Prominent Coffee Ring Stain on corner
  ctx.save();
  ctx.fillStyle = "rgba(85, 55, 30, 0.08)";
  ctx.beginPath();
  ctx.arc(w - 65, 75, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(95, 62, 35, 0.16)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
