import * as THREE from "three";

/**
 * Fast, lightweight procedural British Police Green Felt Baize texture (256x256).
 * Instant initialization without CPU freezing.
 */
export function createProceduralGreenFeltTexture(): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
} {
  if (typeof window === "undefined") {
    return { diffuse: new THREE.Texture(), bump: new THREE.Texture() };
  }

  const size = 256;
  const dCanvas = document.createElement("canvas");
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext("2d");

  if (dCtx && bCtx) {
    // Rich British police racing green baize base (#1D482F)
    dCtx.fillStyle = "#1E4A31";
    dCtx.fillRect(0, 0, size, size);

    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, size, size);

    // Fast noise overlay
    const imgData = dCtx.getImageData(0, 0, size, size);
    const px = imgData.data;
    for (let i = 0; i < px.length; i += 4) {
      const noise = (Math.random() - 0.5) * 28;
      px[i] = Math.min(255, Math.max(0, 30 + noise * 0.4));
      px[i + 1] = Math.min(255, Math.max(0, 74 + noise));
      px[i + 2] = Math.min(255, Math.max(0, 49 + noise * 0.5));
    }
    dCtx.putImageData(imgData, 0, 0);

    // Subtle pushpin puncture holes
    for (let p = 0; p < 25; p++) {
      const px_x = Math.random() * size;
      const px_y = Math.random() * size;
      dCtx.fillStyle = "rgba(10, 25, 15, 0.7)";
      dCtx.beginPath();
      dCtx.arc(px_x, px_y, 2.0, 0, Math.PI * 2);
      dCtx.fill();
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(8, 5);
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(8, 5);
  bump.needsUpdate = true;

  return { diffuse, bump };
}

/**
 * Fast procedural dark walnut wood texture (256x256).
 */
export function createDarkWalnutWoodTexture(): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
} {
  if (typeof window === "undefined") {
    return { diffuse: new THREE.Texture(), bump: new THREE.Texture() };
  }

  const size = 256;
  const dCanvas = document.createElement("canvas");
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext("2d");

  if (dCtx) {
    dCtx.fillStyle = "#26170E";
    dCtx.fillRect(0, 0, size, size);

    // Wood grain streaks
    for (let x = 0; x < size; x += 3) {
      const alpha = 0.08 + Math.random() * 0.15;
      dCtx.strokeStyle =
        Math.random() > 0.5 ? `rgba(14, 8, 4, ${alpha})` : `rgba(58, 36, 22, ${alpha})`;
      dCtx.lineWidth = 1.5 + Math.random() * 2;
      dCtx.beginPath();
      dCtx.moveTo(x, 0);
      dCtx.lineTo(x + (Math.random() - 0.5) * 6, size);
      dCtx.stroke();
    }
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(4, 1);
  diffuse.needsUpdate = true;

  return { diffuse, bump: diffuse };
}

/**
 * Procedural Wool Yarn PBR Textures (256x256).
 * Produces matte spun 2-ply wool fiber diffuse, helical thread bump map,
 * and high-roughness micro-fuzz map to eliminate any plasticky look.
 */
export function createWoolYarnTextures(): {
  diffuse: THREE.Texture;
  bump: THREE.Texture;
  roughness: THREE.Texture;
} {
  if (typeof window === "undefined") {
    return {
      diffuse: new THREE.Texture(),
      bump: new THREE.Texture(),
      roughness: new THREE.Texture(),
    };
  }

  const size = 256;
  const dCanvas = document.createElement("canvas");
  dCanvas.width = size;
  dCanvas.height = size;
  const dCtx = dCanvas.getContext("2d");

  const bCanvas = document.createElement("canvas");
  bCanvas.width = size;
  bCanvas.height = size;
  const bCtx = bCanvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext("2d");

  if (!dCtx || !bCtx || !rCtx) {
    return {
      diffuse: new THREE.Texture(dCanvas),
      bump: new THREE.Texture(bCanvas),
      roughness: new THREE.Texture(rCanvas),
    };
  }

  // Deep villain crime-scene crimson wool dye (#8B141E)
  dCtx.fillStyle = "#8B141E";
  dCtx.fillRect(0, 0, size, size);

  // Neutral bump map base
  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, size, size);

  // Ultra-matte roughness base (#F0F0F0 ~ 0.94) to eliminate any plasticky reflection
  rCtx.fillStyle = "#F0F0F0";
  rCtx.fillRect(0, 0, size, size);

  // Microscopic fiber fuzz noise
  const imgData = dCtx.getImageData(0, 0, size, size);
  const px = imgData.data;
  for (let i = 0; i < px.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    px[i] = Math.min(255, Math.max(0, (px[i] ?? 0) + noise * 0.8));
    px[i + 1] = Math.min(255, Math.max(0, (px[i + 1] ?? 0) + noise * 0.2));
    px[i + 2] = Math.min(255, Math.max(0, (px[i + 2] ?? 0) + noise * 0.2));
  }
  dCtx.putImageData(imgData, 0, 0);

  // Helical 2-ply twisted spun wool cords with shadowed crevices & bright fiber loops
  for (let y = 0; y < size; y += 8) {
    const twist = Math.sin((y / size) * Math.PI * 4) * 8;

    // Highlighted fiber loop ridge
    dCtx.strokeStyle = "rgba(182, 34, 46, 0.65)";
    dCtx.lineWidth = 4.5;
    dCtx.beginPath();
    dCtx.moveTo(0, y + twist);
    dCtx.lineTo(size, y - twist);
    dCtx.stroke();

    // Bump ridge
    bCtx.strokeStyle = "rgba(220, 220, 220, 0.6)";
    bCtx.lineWidth = 4.0;
    bCtx.beginPath();
    bCtx.moveTo(0, y + twist);
    bCtx.lineTo(size, y - twist);
    bCtx.stroke();

    // Shadowed twisted crevice groove
    dCtx.strokeStyle = "rgba(55, 6, 12, 0.75)";
    dCtx.lineWidth = 2.5;
    dCtx.beginPath();
    dCtx.moveTo(0, y + twist + 4);
    dCtx.lineTo(size, y - twist + 4);
    dCtx.stroke();

    // Bump depression
    bCtx.strokeStyle = "rgba(35, 35, 35, 0.7)";
    bCtx.lineWidth = 2.5;
    bCtx.beginPath();
    bCtx.moveTo(0, y + twist + 4);
    bCtx.lineTo(size, y - twist + 4);
    bCtx.stroke();
  }

  const diffuse = new THREE.CanvasTexture(dCanvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(24, 2);
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(24, 2);
  bump.needsUpdate = true;

  const roughness = new THREE.CanvasTexture(rCanvas);
  roughness.colorSpace = THREE.NoColorSpace;
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(24, 2);
  roughness.needsUpdate = true;

  return { diffuse, bump, roughness };
}

/**
 * Fast procedural wool yarn bump texture (128x128).
 */
export function createWoolYarnBumpTexture(): THREE.Texture {
  return createWoolYarnTextures().bump;
}

/**
 * Procedural Victorian Window Grill Shadow Gobo Texture (1024x1024).
 * Projects dark diagonal multi-pane window mullions & arched sash bars
 * with realistic soft penumbra blur and feathered edge falloff ("slight fade only in edges").
 */
export function createWindowGrillShadowTexture(): THREE.Texture {
  if (typeof window === "undefined") return new THREE.Texture();

  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture(canvas);

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  // Diagonal projection angle (-22 degrees) from high window
  ctx.translate(size * 0.48, size * 0.48);
  ctx.rotate(-0.36);

  const shadowColor = "rgba(4, 3, 2, 0.72)";
  ctx.fillStyle = shadowColor;
  ctx.shadowColor = "rgba(4, 3, 2, 0.85)";
  ctx.shadowBlur = 28;

  const w = size * 1.5;
  const h = size * 1.5;
  const startX = -w / 2;
  const startY = -h / 2;

  // Window vertical mullion bars (multi-pane gothic/victorian sash)
  const barWidth = 48;
  const colSpacing = w / 4;
  for (let c = 1; c < 4; c++) {
    const x = startX + c * colSpacing - barWidth / 2;
    ctx.fillRect(x, startY, barWidth, h);
  }

  // Window horizontal transom bars
  const transHeight = 46;
  const rowSpacing = h / 5;
  for (let r = 1; r < 5; r++) {
    const y = startY + r * rowSpacing - transHeight / 2;
    ctx.fillRect(startX, y, w, transHeight);
  }

  // Heavy outer window casement frame
  ctx.lineWidth = 72;
  ctx.strokeStyle = shadowColor;
  ctx.strokeRect(startX, startY, w, h);

  // Arched top sash curve
  ctx.beginPath();
  ctx.arc(0, startY + rowSpacing * 1.15, w * 0.42, Math.PI, 0, false);
  ctx.lineWidth = 56;
  ctx.stroke();

  ctx.restore();

  // "Slight fade only in edges": feather out the outer 12-15% margin
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const edgeFadeGrad = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.35,
    size * 0.5,
    size * 0.5,
    size * 0.495,
  );
  edgeFadeGrad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
  edgeFadeGrad.addColorStop(0.72, "rgba(0, 0, 0, 0.98)");
  edgeFadeGrad.addColorStop(0.9, "rgba(0, 0, 0, 0.5)");
  edgeFadeGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
  ctx.fillStyle = edgeFadeGrad;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Aged Golden Manila / Tea-Stained Cardstock Texture (1024x1414).
 * Generates realistic paper grain, coffee stains, fold creases, rusty staples,
 * red ledger margin line, classified rubber stamp, case title, security clearance,
 * and typewriter dossier lines directly on 3D canvas texture.
 */
export function createAgedPaperTexture(
  title: string,
  code: string,
  difficulty: number,
  paperToneIndex = 0,
  size = 1024,
): { diffuse: THREE.Texture; bump: THREE.Texture; roughness: THREE.Texture } {
  if (typeof window === "undefined") {
    return {
      diffuse: new THREE.Texture(),
      bump: new THREE.Texture(),
      roughness: new THREE.Texture(),
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

  const rCanvas = document.createElement("canvas");
  rCanvas.width = canvas.width;
  rCanvas.height = canvas.height;
  const rCtx = rCanvas.getContext("2d");

  if (!ctx || !bCtx || !rCtx) {
    return {
      diffuse: new THREE.Texture(canvas),
      bump: new THREE.Texture(bCanvas),
      roughness: new THREE.Texture(rCanvas),
    };
  }

  const w = canvas.width;
  const h = canvas.height;

  // Initial bump base (neutral middle gray 128)
  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, w, h);

  // Initial roughness base: paper is rough matte (#E8E8E8 ~ 0.91 roughness)
  rCtx.fillStyle = "#E8E8E8";
  rCtx.fillRect(0, 0, w, h);

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

  // Compressed fibers along fold: slightly smoother roughness
  rCtx.strokeStyle = "rgba(160, 160, 160, 0.5)";
  rCtx.lineWidth = 4.0;
  rCtx.beginPath();
  rCtx.moveTo(0, h * 0.5);
  rCtx.lineTo(w, h * 0.505);
  rCtx.stroke();

  // Secondary diagonal fold crease (top-right corner dog-eared wear)
  ctx.strokeStyle = "rgba(80, 56, 30, 0.18)";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(w * 0.78, 0);
  ctx.lineTo(w, h * 0.18);
  ctx.stroke();

  bCtx.strokeStyle = "rgba(40, 40, 40, 0.4)";
  bCtx.lineWidth = 2.5;
  bCtx.beginPath();
  bCtx.moveTo(w * 0.78, 0);
  bCtx.lineTo(w, h * 0.18);
  bCtx.stroke();

  // 5. Twin Rusty Staples at Top Margin with Oxidized Rust Stains
  const staple1X = w * 0.32;
  const staple2X = w * 0.68;
  const stapleY = 22;

  // Rust halo
  const rustGrad1 = ctx.createRadialGradient(staple1X, stapleY, 4, staple1X, stapleY, 32);
  rustGrad1.addColorStop(0, "rgba(115, 60, 22, 0.65)");
  rustGrad1.addColorStop(0.45, "rgba(145, 75, 28, 0.28)");
  rustGrad1.addColorStop(1, "rgba(115, 60, 22, 0.0)");
  ctx.fillStyle = rustGrad1;
  ctx.beginPath();
  ctx.arc(staple1X, stapleY, 32, 0, Math.PI * 2);
  ctx.fill();

  const rustGrad2 = ctx.createRadialGradient(staple2X, stapleY, 4, staple2X, stapleY, 32);
  rustGrad2.addColorStop(0, "rgba(115, 60, 22, 0.65)");
  rustGrad2.addColorStop(0.45, "rgba(145, 75, 28, 0.28)");
  rustGrad2.addColorStop(1, "rgba(115, 60, 22, 0.0)");
  ctx.fillStyle = rustGrad2;
  ctx.beginPath();
  ctx.arc(staple2X, stapleY, 32, 0, Math.PI * 2);
  ctx.fill();

  // Dark Iron Staple Wire Bars
  ctx.fillStyle = "#1E1812";
  ctx.fillRect(staple1X - 22, stapleY - 3, 44, 7);
  ctx.fillRect(staple2X - 22, stapleY - 3, 44, 7);

  // Staple wire sheen
  ctx.fillStyle = "rgba(255, 250, 240, 0.4)";
  ctx.fillRect(staple1X - 20, stapleY - 2, 40, 2);
  ctx.fillRect(staple2X - 20, stapleY - 2, 40, 2);

  // Staple metallic low roughness
  rCtx.fillStyle = "#383838";
  rCtx.fillRect(staple1X - 22, stapleY - 3, 44, 7);
  rCtx.fillRect(staple2X - 22, stapleY - 3, 44, 7);

  // Staple puncture holes in bump
  bCtx.fillStyle = "#000000";
  bCtx.fillRect(staple1X - 24, stapleY - 4, 48, 8);
  bCtx.fillRect(staple2X - 24, stapleY - 4, 48, 8);

  // 6. Forensic Coffee Cup Ring Stain
  const cupX = w * 0.72;
  const cupY = h * 0.66;
  const cupRadius = 88;

  ctx.save();
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

  ctx.fillStyle = "rgba(168, 22, 38, 0.92)";
  ctx.font = "bold 26px 'Courier New', Courier, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`SCOTLAND YARD // ${code.toUpperCase()}`, 0, 2);
  ctx.restore();

  // 10. Case Title in Classic Noir Serif
  ctx.fillStyle = "#140E0A";
  ctx.font = "bold 44px 'Georgia', serif";
  ctx.textAlign = "left";
  ctx.fillText(title, 115, 230);

  // Title underline
  ctx.strokeStyle = "rgba(60, 42, 24, 0.55)";
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(115, 248);
  ctx.lineTo(w - 110, 248);
  ctx.stroke();

  // 11. Security Clearance Star Gauge
  const starsFilled = "★".repeat(difficulty);
  const starsEmpty = "☆".repeat(Math.max(0, 5 - difficulty));
  ctx.fillStyle = "#785832";
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillText(`CLEARANCE: ${starsFilled}${starsEmpty} [CLASS ${difficulty}/5]`, 115, 282);

  // 12. Typewritten Case Narrative Lines
  ctx.fillStyle = "rgba(28, 20, 14, 0.88)";
  ctx.font = "19px 'Courier New', Courier, monospace";
  const startY = 330;
  const lineSpacing = 32;
  const sampleLines = [
    "INCIDENT RECORD // SECTION 01 REPORT",
    "SUBJECT FOUND IN LOCKED BLACKWOOD CHAMBERS.",
    "MULTIPLE REDACTED ENTRIES IN FINANCIAL LEDGER.",
    "ALL FORENSIC TRANSCRIPTS AND WIRETAPS FILED.",
    "TIMELINE ANALYSIS REQUIRED PRIOR TO VERDICT.",
    "",
    "STATUS: ACTIVE INVESTIGATION IN PROGRESS.",
    "EVIDENCE REPOSITORY OPEN FOR FORENSIC REVIEW.",
    "COGNITIVE DEDUCTION REQUIRED: EXAMINE PROOFS.",
    "",
    "CLICK CARD TO INSPECT EXPANDED EVIDENCE DOSSIER.",
  ];

  sampleLines.forEach((line, idx) => {
    ctx.fillText(line, 115, startY + idx * lineSpacing);
  });

  // 13. Metropolitan Police Watermark Seal
  ctx.save();
  ctx.translate(w * 0.5, h * 0.72);
  ctx.strokeStyle = "rgba(140, 30, 40, 0.16)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 120, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(140, 30, 40, 0.22)";
  ctx.fillText("METROPOLITAN CRIMINAL ARCHIVES", 0, 0);
  ctx.restore();

  // Final PBR Textures
  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.colorSpace = THREE.SRGBColorSpace;
  diffuse.needsUpdate = true;

  const bump = new THREE.CanvasTexture(bCanvas);
  bump.colorSpace = THREE.NoColorSpace;
  bump.needsUpdate = true;

  const roughness = new THREE.CanvasTexture(rCanvas);
  roughness.colorSpace = THREE.NoColorSpace;
  roughness.needsUpdate = true;

  return { diffuse, bump, roughness };
}
