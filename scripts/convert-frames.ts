import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

async function main() {
  const sourceDir = path.resolve(process.cwd(), "landing-frames");
  const targetDir = path.resolve(process.cwd(), "public/landing/frames");

  await fs.mkdir(targetDir, { recursive: true });

  const files = await fs.readdir(sourceDir);
  const frameFiles = files
    .filter((f) => f.startsWith("ezgif-frame-") && f.endsWith(".png"))
    .sort();

  console.log(`Found ${frameFiles.length} frames to convert.`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (let i = 0; i < frameFiles.length; i++) {
    const filename = frameFiles[i]!;
    const srcPath = path.join(sourceDir, filename);
    const frameIndex = String(i + 1).padStart(3, "0");
    const destPath = path.join(targetDir, `frame-${frameIndex}.webp`);

    const stat = await fs.stat(srcPath);
    totalOriginal += stat.size;

    await sharp(srcPath)
      .webp({ quality: 80, effort: 4 })
      .toFile(destPath);

    const outStat = await fs.stat(destPath);
    totalOptimized += outStat.size;

    if ((i + 1) % 25 === 0 || i + 1 === frameFiles.length) {
      console.log(`Converted ${i + 1}/${frameFiles.length} frames...`);
    }
  }

  const origMB = (totalOriginal / (1024 * 1024)).toFixed(2);
  const optMB = (totalOptimized / (1024 * 1024)).toFixed(2);
  const savings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);

  console.log(`\nCompleted!`);
  console.log(`Original: ${origMB} MB`);
  console.log(`Optimized: ${optMB} MB`);
  console.log(`Saved: ${savings}% bandwidth`);
}

main().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
