import fs from "node:fs/promises";
import path from "node:path";

function createWavHeader(sampleRate: number, numChannels: number, bitsPerSample: number, numSamples: number): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

// Generate typewriter mechanical click (50ms)
function generateTypewriterClick(): Buffer {
  const sampleRate = 22050;
  const duration = 0.05;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = createWavHeader(sampleRate, 1, 16, numSamples);
  let offset = 44;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Fast decay transient with noise burst + 2200Hz click
    const env = Math.exp(-t * 90);
    const click = Math.sin(2 * Math.PI * 2400 * t) * 0.4;
    const noise = (Math.random() * 2 - 1) * 0.6;
    const sample = (click + noise) * env;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 30000)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }
  return buffer;
}

// Generate paper rustle / flip (150ms)
function generatePaperFlip(): Buffer {
  const sampleRate = 22050;
  const duration = 0.18;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = createWavHeader(sampleRate, 1, 16, numSamples);
  let offset = 44;

  let filterState = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Swell then decay envelope
    const env = Math.sin((Math.PI * i) / numSamples) * Math.exp(-t * 8);
    const whiteNoise = Math.random() * 2 - 1;
    // Simple 1-pole lowpass for rustle texture
    filterState = filterState + 0.15 * (whiteNoise - filterState);
    const sample = filterState * env * 0.7;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 28000)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }
  return buffer;
}

// Generate rubber stamp impact (120ms)
function generateStampThud(): Buffer {
  const sampleRate = 22050;
  const duration = 0.14;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = createWavHeader(sampleRate, 1, 16, numSamples);
  let offset = 44;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 35);
    // Pitch drops from 180Hz down to 60Hz
    const freq = 180 * Math.exp(-t * 25);
    const sine = Math.sin(2 * Math.PI * freq * t);
    const noiseBurst = (Math.random() * 2 - 1) * Math.exp(-t * 120) * 0.4;
    const sample = (sine * 0.8 + noiseBurst) * env;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32000)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }
  return buffer;
}

// Generate looping ambient noir room tone with vinyl crackle (2.0s loop)
function generateAmbientNoir(): Buffer {
  const sampleRate = 22050;
  const duration = 2.0;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = createWavHeader(sampleRate, 1, 16, numSamples);
  let offset = 44;

  let brown = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Sub-bass 55Hz warm hum
    const hum = Math.sin(2 * Math.PI * 55 * t) * 0.08;
    // Brown noise for warm tape floor
    const white = Math.random() * 2 - 1;
    brown = (brown + 0.02 * white) / 1.02;
    // Occasional tiny crackle pops
    const isPop = Math.random() < 0.0006;
    const pop = isPop ? (Math.random() * 2 - 1) * 0.35 : 0;
    const sample = hum + brown * 0.25 + pop;
    const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 16000)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
  }
  return buffer;
}

async function main() {
  const audioDir = path.resolve(process.cwd(), "public/audio");
  await fs.mkdir(audioDir, { recursive: true });

  await fs.writeFile(path.join(audioDir, "typewriter.wav"), generateTypewriterClick());
  await fs.writeFile(path.join(audioDir, "paper-flip.wav"), generatePaperFlip());
  await fs.writeFile(path.join(audioDir, "stamp.wav"), generateStampThud());
  await fs.writeFile(path.join(audioDir, "ambient-noir.wav"), generateAmbientNoir());

  console.log("Generated noir audio assets in public/audio/");
}

main().catch(console.error);
