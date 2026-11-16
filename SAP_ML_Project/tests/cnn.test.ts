// Tests for the TRAINED model path: ONNX model + TypeScript pre/post-processing (onnxruntime-web, WASM backend in Node).
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { loadSnakeModel, predict, classifyRgba224, decide, buildResult, MODEL_CLASSES, softmax } from '../src/ml/cnnClassifier.ts';
import { EVALUATION_METRICS, CONFUSION_MATRIX, OPERATING_POINT } from '../src/ml/benchmarkData.ts';

let pass = 0, total = 0;
async function t(name: string, fn: () => void | Promise<void>) {
  total++;
  try { await fn(); pass++; console.log(`✓ [PASS] ${name}`); } catch (e) { console.error(`✗ [FAIL] ${name}`); throw e; }
}
const fx = path.resolve('tests/fixtures');
const readJpg = (p: string) => PNG.sync.read(fs.readFileSync(p));   // lossless fixtures => bit-exact input vs the Python reference
const dummyFeatures: any = { vector: new Array(28).fill(0.5), isSnake: true, oodScore: 0 };

console.log('=== TRAINED CNN TESTS ===');
const session = await loadSnakeModel(new Uint8Array(fs.readFileSync(path.resolve('public/models/snake_effb0.onnx'))));
const expected: { file: string; species: string; probs: number[] }[] = JSON.parse(fs.readFileSync(`${fx}/expected.json`, 'utf8'));

await t('Model loads and exposes logits + snake_mass outputs', () => {
  assert.deepStrictEqual([...session.outputNames].sort(), ['logits', 'snake_mass']);
  assert.strictEqual(MODEL_CLASSES.length, 13);
});

await t('Parity: TypeScript/onnxruntime-web probabilities match the Python reference on 26 real test photos (max diff < 0.005)', async () => {
  let worst = 0;
  for (const e of expected) {
    const img = readJpg(`${fx}/${e.file}`);
    const { probs } = await predict(img.data, session);
    assert.ok(Math.abs(probs.reduce((a, b) => a + b, 0) - 1) < 1e-4);
    probs.forEach((p, i) => { worst = Math.max(worst, Math.abs(p - e.probs[i])); });
  }
  console.log(`   max |p_ts - p_python| = ${worst.toFixed(5)}`);
  assert.ok(worst < 0.005, `worst diff ${worst}`);
});

await t('Fixture photos: TS predictions agree with the Python reference model on every photo (same top-1 class); accuracy is reported', async () => {
  let ok = 0, agree = 0;
  for (const e of expected) {
    const { probs } = await predict(readJpg(`${fx}/${e.file}`).data, session);
    const top = probs.indexOf(Math.max(...probs));
    if (MODEL_CLASSES[top] === e.species) ok++;
    if (top === e.probs.indexOf(Math.max(...e.probs))) agree++;
  }
  console.log(`   fixture top-1 accuracy: ${ok}/${expected.length} (small sample; full held-out test accuracy is ${(EVALUATION_METRICS.speciesAccuracy * 100).toFixed(1)}%)`);
  assert.strictEqual(agree, expected.length);
  assert.ok(ok / expected.length >= 0.5);   // sanity floor only (random guessing = 8%)
});

await t('Safety (known residual risk): on the fixture set at most 1 venomous photo is accepted as harmless (full test set: see benchmark)', async () => {
  let bad = 0;
  for (const e of expected) {
    const r = await classifyRgba224(readJpg(`${fx}/${e.file}`).data, dummyFeatures, session);
    const truthVen = ['bungarus-caeruleus', 'ophiophagus-hannah', 'naja-kaouthia', 'daboia-russelii', 'echis-carinatus', 'naja-naja'].includes(e.species);
    if (truthVen && !r.isAbstained && !r.topSpecies.isVenomous) { bad++; console.log(`   !! venomous ${e.species} accepted as harmless ${r.topSpecies.id} (${e.file})`); }
  }
  console.log(`   venomous accepted as harmless: ${bad}`);
  assert.ok(bad <= 1);
});

await t('Non-snake photos (astronaut, coffee, cat, gravel, grass, horse, temple, flower) are rejected as not-a-snake', async () => {
  const dir = `${fx}/nonsnake`; let rejected = 0; const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const r = await classifyRgba224(readJpg(`${dir}/${f}`).data, dummyFeatures, session);
    if (r.isAbstained) rejected++; else console.log(`   ACCEPTED non-snake: ${f} -> ${r.predictedClass}`);
  }
  console.log(`   rejected ${rejected}/${files.length}`);
  assert.strictEqual(rejected, files.length);
});

await t('Uniform (solid colour) image abstains', async () => {
  const d = new Uint8ClampedArray(224 * 224 * 4).fill(120);
  const r = await classifyRgba224(d, dummyFeatures, session);
  assert.strictEqual(r.isAbstained, true);
});

await t('decide(): uniform probabilities abstain; confident venomous accepted', () => {
  assert.strictEqual(decide(new Array(13).fill(1 / 13)).accepted, false);
  const p = new Array(13).fill(0.001); p[MODEL_CLASSES.indexOf('daboia-russelii')] = 0.988;
  assert.strictEqual(decide(softmax(p.map(Math.log))).accepted, true);
});

await t('decide(): harmless top class with notable venomous probability mass is refused', () => {
  const p = new Array(13).fill(0.0); p[MODEL_CLASSES.indexOf('ptyas-mucosa')] = 0.6; p[MODEL_CLASSES.indexOf('naja-naja')] = 0.3; p[MODEL_CLASSES.indexOf('fowlea-piscator')] = 0.1;
  const d = decide(p); assert.strictEqual(d.accepted, false); assert.ok(d.reason!.includes('venomous'));
});

await t('buildResult(): triage categories follow family', () => {
  const mk = (id: string) => { const p = new Array(13).fill(0.001); p[MODEL_CLASSES.indexOf(id)] = 0.988; return buildResult(p, dummyFeatures); };
  assert.strictEqual(mk('daboia-russelii').triageCategory, 'Viperidae (Hemotoxic)');
  assert.strictEqual(mk('naja-naja').triageCategory, 'Elapidae (Neurotoxic)');
  assert.strictEqual(mk('ptyas-mucosa').triageCategory, 'Non-venomous / Colubrid');
});

await t('Reported benchmark is consistent: matrix diagonal == reported accuracy; sums to N test photos', () => {
  const n = CONFUSION_MATRIX.flat().reduce((a, b) => a + b, 0);
  assert.strictEqual(n, EVALUATION_METRICS.totalSamples);
  assert.strictEqual(CONFUSION_MATRIX.reduce((a, r, i) => a + r[i], 0), EVALUATION_METRICS.speciesCorrect);
  assert.ok(EVALUATION_METRICS.speciesAccuracy > 0.7 && EVALUATION_METRICS.speciesAccuracy < 0.95);   // plausibility: not inflated
  assert.strictEqual(EVALUATION_METRICS.isSimulatedSynthetic, false);
  assert.ok(OPERATING_POINT.venomousAcceptedAsHarmless / OPERATING_POINT.venomousTotal < 0.02);
});

console.log(`ALL ${pass}/${total} CNN TESTS PASSED`);
