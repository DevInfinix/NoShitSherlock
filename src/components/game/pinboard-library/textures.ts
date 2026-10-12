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
 * Fast procedural wool yarn bump texture (128x128).
 */
export function createWoolYarnBumpTexture(): THREE.Texture {
  if (typeof window === "undefined") return new THREE.Texture();

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 4) {
    const twist = Math.sin(y * 0.2) * 6;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(40, 40, 40, 0.45)" : "rgba(210, 210, 210, 0.45)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, y + twist);
    ctx.lineTo(size, y - twist);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 2);
  texture.needsUpdate = true;
  return texture;
}
