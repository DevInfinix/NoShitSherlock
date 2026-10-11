import * as THREE from "three";

/**
 * Generates an ultra-detailed procedural British Police Green Felt Baize texture
 * with woven velvet weave, micro-fibers, and pushpin puncture holes.
 */
export function createProceduralGreenFeltTexture(size = 1024): {
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
    // 1. British Police Forest Green Baize Base (Rich, visible racing green)
    dCtx.fillStyle = "#224A32";
    dCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);

    // 2. High-frequency felt microfiber and velvet nap noise
    const imgData = dCtx.getImageData(0, 0, size, size);
    const dPixels = imgData.data;
    const bImgData = bCtx.getImageData(0, 0, size, size);
    const bPixels = bImgData.data;

    for (let i = 0; i < dPixels.length; i += 4) {
      // Perlin-style micro-grain
      const grain = (Math.random() - 0.5) * 32;
      const isFiber = Math.random() < 0.08 ? 24 : 0; // stray felt wool fiber

      dPixels[i] = Math.min(255, Math.max(0, 34 + grain * 0.4)); // Earthy undertone
      dPixels[i + 1] = Math.min(255, Math.max(0, 74 + grain + isFiber)); // Vibrant forest green
      dPixels[i + 2] = Math.min(255, Math.max(0, 50 + grain * 0.5)); // Slate undertone
      dPixels[i + 3] = 255;

      const bumpHeight = Math.min(255, Math.max(0, 128 + grain * 2.0 + isFiber * 2.2));
      bPixels[i] = bumpHeight;
      bPixels[i + 1] = bumpHeight;
      bPixels[i + 2] = bumpHeight;
      bPixels[i + 3] = 255;
    }

    dCtx.putImageData(imgData, 0, 0);
    bCtx.putImageData(bImgData, 0, 0);

    // 3. Subtle old pushpin puncture perforations from archived cases
    for (let p = 0; p < 75; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;

      dCtx.fillStyle = "rgba(5, 12, 7, 0.75)";
      dCtx.beginPath();
      dCtx.arc(px, py, 2.2, 0, Math.PI * 2);
      dCtx.fill();

      // Shadowed depression in bump map
      bCtx.fillStyle = "rgba(10, 10, 10, 0.9)";
      bCtx.beginPath();
      bCtx.arc(px, py, 2.5, 0, Math.PI * 2);
      bCtx.fill();
    }

    // 4. Faint faded chalk reference lines from forensic investigators
    dCtx.strokeStyle = "rgba(220, 235, 225, 0.04)";
    dCtx.lineWidth = 1.5;
    dCtx.beginPath();
    dCtx.moveTo(0, size * 0.32);
    dCtx.lineTo(size, size * 0.33);
    dCtx.moveTo(size * 0.65, 0);
    dCtx.lineTo(size * 0.64, size);
    dCtx.stroke();
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(6, 4);
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(6, 4);
  bump.needsUpdate = true;

  return { diffuse, bump };
}

/**
 * Generates a soft Venetian Blind GoBo shadow mask texture with gentle tilt and blur.
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

  // Transparent dark base
  ctx.clearRect(0, 0, size, size);

  // Soft horizontal venetian blind slats casting shadow
  const slatCount = 14;
  const slatHeight = size / slatCount;

  for (let i = 0; i < slatCount; i++) {
    const y = i * slatHeight;
    // Radial soft gradient for each slat to simulate diffuse penumbra
    const grad = ctx.createLinearGradient(0, y, 0, y + slatHeight);
    grad.addColorStop(0, "rgba(0, 0, 0, 0.72)");
    grad.addColorStop(0.45, "rgba(0, 0, 0, 0.65)");
    grad.addColorStop(0.7, "rgba(0, 0, 0, 0.15)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0.0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, y, size, slatHeight);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.0, 1.0);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates dark walnut wood grain texture for the noticeboard border frame.
 */
export function createDarkWalnutWoodTexture(size = 512): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
} {
  if (typeof window === "undefined") {
    return { diffuse: new THREE.Texture(), bump: new THREE.Texture() };
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
    // Deep dark walnut base (#1A110B)
    dCtx.fillStyle = "#1E120A";
    dCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);

    // Longitudinal wood grain lines
    for (let x = 0; x < size; x += 3) {
      const wobble = Math.sin(x * 0.08) * 4 + (Math.random() - 0.5) * 2;
      const alpha = 0.08 + Math.random() * 0.14;
      dCtx.strokeStyle =
        Math.random() > 0.5 ? `rgba(10, 6, 3, ${alpha})` : `rgba(45, 28, 16, ${alpha})`;
      dCtx.lineWidth = 1.5 + Math.random() * 2;
      dCtx.beginPath();
      dCtx.moveTo(x + wobble, 0);
      dCtx.lineTo(x - wobble, size);
      dCtx.stroke();

      bCtx.strokeStyle = Math.random() > 0.5 ? "rgba(40, 40, 40, 0.3)" : "rgba(200, 200, 200, 0.3)";
      bCtx.lineWidth = 1.5;
      bCtx.beginPath();
      bCtx.moveTo(x + wobble, 0);
      bCtx.lineTo(x - wobble, size);
      bCtx.stroke();
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(4, 1);
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(4, 1);
  bump.needsUpdate = true;

  return { diffuse, bump };
}

/**
 * Procedural aged paper texture generator with all requested forensic artifacts:
 * - Aged golden manila parchment (#D9C5A0) or tea-stained pulpy document paper (#CBB994)
 * - Coffee cup stain rings with splatter
 * - Water droplet warping ripples
 * - Charred and weathered deckle bottom edges
 * - Twin rusted wire staples at the top margin
 * - Angled bold crimson rubber stamp ("CONFIDENTIAL // CLASSIFIED")
 * - Typewriter police headers and watermark seal
 */
export function createAgedPaperTexture(
  title: string,
  code: string,
  difficulty: number,
  paperToneIndex = 0,
  size = 1024,
): { diffuse: THREE.Texture; bump: THREE.Texture } {
  if (typeof window === "undefined") {
    return {
      diffuse: new THREE.Texture(),
      bump: new THREE.Texture(),
    };
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = Math.round(size * 1.38); // 1:1.38 dossier aspect ratio
  const ctx = canvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = canvas.width;
  bCanvas.height = canvas.height;
  const bCtx = bCanvas.getContext("2d");

  if (!ctx || !bCtx) {
    return {
      diffuse: new THREE.Texture(canvas),
      bump: new THREE.Texture(bCanvas),
    };
  }

  const w = canvas.width;
  const h = canvas.height;

  // Initial bump base
  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, w, h);

  // 1. Paper Base Tone: Alternates between Aged Golden Manila (#D9C5A0) & Tea-Stained Pulp (#CBB994)
  const isManila = paperToneIndex % 2 === 0;
  const baseGrad = ctx.createRadialGradient(w * 0.48, h * 0.46, 60, w * 0.5, h * 0.5, w * 0.85);

  if (isManila) {
    baseGrad.addColorStop(0, "#E2D3B7");
    baseGrad.addColorStop(0.55, "#D9C5A0");
    baseGrad.addColorStop(0.85, "#CCA97C");
    baseGrad.addColorStop(1, "#BA9666");
  } else {
    baseGrad.addColorStop(0, "#D6C7A8");
    baseGrad.addColorStop(0.55, "#CBB994");
    baseGrad.addColorStop(0.85, "#BBA47A");
    baseGrad.addColorStop(1, "#A88E62");
  }

  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Pulp Fibers & Tooth Grain
  const imgData = ctx.getImageData(0, 0, w, h);
  const px = imgData.data;
  for (let i = 0; i < px.length; i += 8) {
    const noise = (Math.random() - 0.5) * 16;
    px[i] = Math.min(255, Math.max(0, (px[i] ?? 0) + noise));
    px[i + 1] = Math.min(255, Math.max(0, (px[i + 1] ?? 0) + noise));
    px[i + 2] = Math.min(255, Math.max(0, (px[i + 2] ?? 0) + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Charred, Weathered Deckle Bottom and Side Edges
  const edgeBottom = ctx.createLinearGradient(0, h - 90, 0, h);
  edgeBottom.addColorStop(0, "rgba(50, 32, 16, 0.0)");
  edgeBottom.addColorStop(0.65, "rgba(52, 33, 14, 0.35)");
  edgeBottom.addColorStop(1, "rgba(28, 14, 6, 0.82)"); // charred burnt edge
  ctx.fillStyle = edgeBottom;
  ctx.fillRect(0, h - 90, w, 90);

  // Charred bump depression
  bCtx.fillStyle = "rgba(40, 40, 40, 0.5)";
  bCtx.fillRect(0, h - 45, w, 45);

  // Perimeter deckle aging
  ctx.fillStyle = "rgba(70, 48, 26, 0.12)";
  ctx.fillRect(0, 0, w, 28);
  ctx.fillRect(0, 0, 28, h);
  ctx.fillRect(w - 28, 0, 28, h);

  // 4. Central Horizontal & Diagonal Crease Fold Lines
  ctx.strokeStyle = "rgba(75, 52, 28, 0.22)";
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5);
  ctx.lineTo(w, h * 0.505);
  ctx.stroke();

  // Crease highlight reflection
  ctx.strokeStyle = "rgba(255, 252, 245, 0.35)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.5 - 2.5);
  ctx.lineTo(w, h * 0.505 - 2.5);
  ctx.stroke();

  // Crease indentation in bump map
  bCtx.strokeStyle = "rgba(20, 20, 20, 0.6)";
  bCtx.lineWidth = 3.5;
  bCtx.beginPath();
  bCtx.moveTo(0, h * 0.5);
  bCtx.lineTo(w, h * 0.505);
  bCtx.stroke();

  // 5. Twin Rusty Staples at Top Margin with Oxidized Rust Stains
  const staple1X = w * 0.32;
  const staple2X = w * 0.68;
  const stapleY = 22;

  // Rust halo
  const rustGrad1 = ctx.createRadialGradient(staple1X, stapleY, 3, staple1X, stapleY, 26);
  rustGrad1.addColorStop(0, "rgba(165, 82, 35, 0.55)");
  rustGrad1.addColorStop(1, "rgba(165, 82, 35, 0.0)");
  ctx.fillStyle = rustGrad1;
  ctx.fillRect(staple1X - 26, stapleY - 26, 52, 52);

  const rustGrad2 = ctx.createRadialGradient(staple2X, stapleY, 3, staple2X, stapleY, 26);
  rustGrad2.addColorStop(0, "rgba(165, 82, 35, 0.55)");
  rustGrad2.addColorStop(1, "rgba(165, 82, 35, 0.0)");
  ctx.fillStyle = rustGrad2;
  ctx.fillRect(staple2X - 26, stapleY - 26, 52, 52);

  // Iron staple bars
  ctx.fillStyle = "#1E1812";
  ctx.fillRect(staple1X - 12, stapleY - 2, 24, 5);
  ctx.fillRect(staple2X - 12, stapleY - 2, 24, 5);
  // Puncture slits
  ctx.fillStyle = "#090604";
  ctx.fillRect(staple1X - 13, stapleY - 3, 3, 7);
  ctx.fillRect(staple1X + 10, stapleY - 3, 3, 7);
  ctx.fillRect(staple2X - 13, stapleY - 3, 3, 7);
  ctx.fillRect(staple2X + 10, stapleY - 3, 3, 7);

  // 6. Forensic Coffee Cup Ring Stain with Meniscus & Splatters
  const cupX = w * 0.76;
  const cupY = h * 0.72;
  const cupRadius = 110;

  ctx.save();
  ctx.strokeStyle = "rgba(78, 44, 20, 0.42)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(cupX, cupY, cupRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Darker outer rim
  ctx.strokeStyle = "rgba(56, 28, 12, 0.55)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cupX, cupY, cupRadius + 4, 0, Math.PI * 2);
  ctx.stroke();

  // Coffee wash interior pooling
  const coffeeWash = ctx.createRadialGradient(cupX, cupY, 15, cupX, cupY, cupRadius);
  coffeeWash.addColorStop(0, "rgba(110, 68, 32, 0.04)");
  coffeeWash.addColorStop(0.85, "rgba(100, 60, 26, 0.12)");
  coffeeWash.addColorStop(1, "rgba(65, 36, 16, 0.28)");
  ctx.fillStyle = coffeeWash;
  ctx.beginPath();
  ctx.arc(cupX, cupY, cupRadius + 5, 0, Math.PI * 2);
  ctx.fill();

  // Coffee splatters & droplets
  for (let s = 0; s < 12; s++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = cupRadius + 15 + Math.random() * 45;
    const sx = cupX + Math.cos(angle) * dist;
    const sy = cupY + Math.sin(angle) * dist;
    ctx.fillStyle = "rgba(68, 38, 18, 0.55)";
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5 + Math.random() * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. Water Droplet Warping Ring
  const dropX = w * 0.22;
  const dropY = h * 0.38;
  const dropR = 48;
  ctx.save();
  ctx.strokeStyle = "rgba(85, 60, 35, 0.25)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(dropX, dropY, dropR, 0, Math.PI * 2);
  ctx.stroke();

  // Bump puckering around dried droplet
  bCtx.strokeStyle = "rgba(200, 200, 200, 0.4)";
  bCtx.lineWidth = 5;
  bCtx.beginPath();
  bCtx.arc(dropX, dropY, dropR, 0, Math.PI * 2);
  bCtx.stroke();
  ctx.restore();

  // 8. Red Ledger Margin Line
  ctx.strokeStyle = "rgba(180, 24, 38, 0.45)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(85, 0);
  ctx.lineTo(85, h);
  ctx.stroke();

  // 9. Bold Crimson Rubber Stamp ("RESTRICTED // CLASSIFIED")
  ctx.save();
  ctx.translate(w * 0.5, 125);
  ctx.rotate(-0.06); // slight hand-stamped slant
  ctx.strokeStyle = "rgba(168, 22, 38, 0.88)";
  ctx.lineWidth = 5.5;
  ctx.strokeRect(-240, -32, 480, 64);

  // Inner border
  ctx.lineWidth = 2;
  ctx.strokeRect(-234, -26, 468, 52);

  ctx.fillStyle = "#A81626";
  ctx.font = "bold 26px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`SCOTLAND YARD // ${code}`, 0, 8);
  ctx.restore();

  // 10. Case Dossier Title & Metadata in Classic Noir Typography
  ctx.fillStyle = "#16110D";
  ctx.font = "bold 38px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(title, 115, 260);

  // Difficulty Star Classification
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillStyle = "#5E4632";
  const stars = "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
  ctx.fillText(`SECURITY CLEARANCE: ${stars} [CLASS ${difficulty}/5]`, 115, 310);

  // Typewriter Body Lines
  ctx.fillStyle = "rgba(22, 17, 13, 0.82)";
  ctx.font = "18px 'Courier New', monospace";
  const typewriterLines = [
    "INCIDENT RECORD // CENTRAL HOMICIDE DIVISION",
    "--------------------------------------------------",
    "1. Field exhibits collected at incident location.",
    "2. Requires timeline chronological reconstruction.",
    "3. Inspect sworn witness statements & audio intercepts.",
    "",
    "CAUTION: UNAUTHORIZED DISCLOSURE PUNISHABLE BY LAW.",
  ];

  typewriterLines.forEach((line, idx) => {
    ctx.fillText(line, 115, 380 + idx * 36);
  });

  // 11. Police Seal Watermark Emblem at bottom right
  ctx.save();
  ctx.translate(w - 180, h - 190);
  ctx.rotate(0.05);
  ctx.strokeStyle = "rgba(88, 62, 38, 0.35)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillStyle = "rgba(88, 62, 38, 0.4)";
  ctx.textAlign = "center";
  ctx.fillText("METROPOLITAN", 0, -28);
  ctx.fillText("CRIMINAL ARCHIVE", 0, 5);
  ctx.fillText("★ LONDON ★", 0, 38);
  ctx.restore();

  // Final Texture setup with proper color space
  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.needsUpdate = true;

  return { diffuse, bump };
}

/**
 * Procedural Wool Yarn bump map texture with twisted fibers.
 */
export function createWoolYarnBumpTexture(size = 256): THREE.Texture {
  if (typeof window === "undefined") return new THREE.Texture();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Twisted spiral ply lines
  for (let y = 0; y < size; y += 4) {
    const twist = Math.sin(y * 0.15) * 8;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(40, 40, 40, 0.45)" : "rgba(210, 210, 210, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y + twist);
    ctx.lineTo(size, y - twist);
    ctx.stroke();
  }

  // Stray wool fuzz noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const px = imgData.data;
  for (let i = 0; i < px.length; i += 4) {
    const fuzz = (Math.random() - 0.5) * 70;
    const val = Math.min(255, Math.max(0, (px[i] ?? 128) + fuzz));
    px[i] = val;
    px[i + 1] = val;
    px[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 2);
  texture.needsUpdate = true;
  return texture;
}
