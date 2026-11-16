// Runs the app's REAL feature extractor over the preprocessed dataset images (train/serve parity).
import fs from 'node:fs';
import { extractFeaturesFromImageData } from '../src/ml/featureExtractor.ts';
const [,, binPath, outPath] = process.argv;
const buf = fs.readFileSync(binPath);
const SZ = 200 * 200 * 4;
const n = buf.length / SZ;
const out: any[] = [];
for (let i = 0; i < n; i++) {
  const data = new Uint8ClampedArray(buf.buffer, buf.byteOffset + i * SZ, SZ);
  const f = extractFeaturesFromImageData({ data, width: 200, height: 200 } as any);
  out.push({ v: f.vector.map((x: number) => Number(x.toFixed(6))), isSnake: f.isSnake, ood: f.oodScore, reason: f.rejectionReason ?? null });
  if (i % 300 === 0) console.log(i, '/', n);
}
fs.writeFileSync(outPath, JSON.stringify(out));
console.log('wrote', out.length);
