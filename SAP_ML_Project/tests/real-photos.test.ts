// Independent real-world check: the 8 reference photos bundled in public/snakes (NOT part of the training set).
// Run with: npm run qa:photos   (informational; asserts safety invariants only)
import fs from 'node:fs';
import path from 'node:path';
import jpeg from 'jpeg-js';
import { SPECIES_DATABASE } from '../src/data/speciesData.ts';
import { loadSnakeModel, classifyRgba224, MODEL_CLASSES } from '../src/ml/cnnClassifier.ts';

const session = await loadSnakeModel(new Uint8Array(fs.readFileSync(path.resolve('public/models/snake_effb0.onnx'))));
const dir = path.resolve('public/snakes');
function toSquare224(img: { width: number; height: number; data: Uint8Array }) {   // center-crop + bilinear resize (browser-canvas-like)
  const side = Math.min(img.width, img.height), sx = (img.width - side) / 2, sy = (img.height - side) / 2, out = new Uint8ClampedArray(224 * 224 * 4);
  const px = (x: number, y: number, c: number) => img.data[(y * img.width + x) * 4 + c];
  for (let y = 0; y < 224; y++) for (let x = 0; x < 224; x++) {
    const fx = sx + ((x + 0.5) * side) / 224 - 0.5, fy = sy + ((y + 0.5) * side) / 224 - 0.5;
    const x0 = Math.max(0, Math.floor(fx)), y0 = Math.max(0, Math.floor(fy)), x1 = Math.min(img.width - 1, x0 + 1), y1 = Math.min(img.height - 1, y0 + 1);
    const ax = fx - x0, ay = fy - y0;
    for (let c = 0; c < 4; c++) out[(y * 224 + x) * 4 + c] = (1 - ay) * ((1 - ax) * px(x0, y0, c) + ax * px(x1, y0, c)) + ay * ((1 - ax) * px(x0, y1, c) + ax * px(x1, y1, c));
  }
  return out;
}
let correct = 0, inModel = 0, unsafe = 0, n = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).sort()) {
  const id = f.replace('.jpg', ''); const sp = SPECIES_DATABASE.find(s => s.id === id)!;
  const img = jpeg.decode(fs.readFileSync(path.join(dir, f)), { useTArray: true, maxMemoryUsageInMB: 1024 });
  const r = await classifyRgba224(toSquare224(img), { vector: [], isSnake: true, oodScore: 0 } as any, session);
  const trained = MODEL_CLASSES.includes(id); n++; if (trained) inModel++;
  const ok = !r.isAbstained && r.topSpecies.id === id; if (ok) correct++;
  if (sp.isVenomous && !r.isAbstained && !r.topSpecies.isVenomous) unsafe++;
  console.log(`${id.padEnd(26)} ${trained ? '[in model]    ' : '[NOT trained]'} -> ${r.isAbstained ? 'ABSTAIN' : r.topSpecies.id.padEnd(22)} conf=${r.confidence} ${ok ? 'OK' : '--'}`);
}
console.log(`\nCorrect: ${correct}/${n} (of which ${inModel} photos are of species the model was trained on)`);
console.log(`Venomous snake labelled harmless: ${unsafe}`);
if (unsafe > 0) { console.error('SAFETY FAILURE'); process.exit(1); }
