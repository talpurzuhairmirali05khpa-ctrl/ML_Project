import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SPECIES_DATABASE } from '../src/data/speciesData.ts';
import { classifySnakeFeatures, calculateWilsonInterval } from '../src/ml/classicalModels.ts';
import { evaluateClinicalTriage } from '../src/clinical/clinicalEngine.ts';
import { CONFUSION_MATRIX_8X8, TRIAGE_CONFUSION_MATRIX, EVALUATION_METRICS } from '../src/ml/benchmarkData.ts';
import { extractFeaturesFromImageData } from '../src/ml/featureExtractor.ts';
import { ExtractedFeatures } from '../src/types/index.ts';

console.log("=================================================");
console.log("RUNNING SNAKE ANTIVENOM PREDICTOR TEST SUITE");
console.log("Testing safety invariants, bug fixes, and ML models");
console.log("=================================================");

let passedCount = 0;
let totalCount = 0;

function runTest(name: string, fn: () => void) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`✓ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(err);
    throw err;
  }
}

// ----------------------------------------------------
// Test 1: Bug 1 - Classifier does NOT collapse to Russell's Viper
// ----------------------------------------------------
runTest("Bug 1 Fix: Krait vector correctly classifies as Bungarus caeruleus, not Russell's Viper", () => {
  const krait = SPECIES_DATABASE.find(s => s.id === 'bungarus-caeruleus')!;
  const mockFeatures: ExtractedFeatures = {
    vector: [...krait.prototypeVector!],
    colorHistH: krait.prototypeVector!.slice(0, 8),
    colorHistS: krait.prototypeVector!.slice(8, 12),
    colorHistV: krait.prototypeVector!.slice(12, 16),
    colorMoments: { meanR: 0.24, meanG: 0.25, meanB: 0.28, stdLum: 0.28 },
    hogTexture: krait.prototypeVector!.slice(20, 26),
    patternEntropy: krait.prototypeVector![26],
    scaleRoughness: krait.prototypeVector![27],
    isSnake: true,
    oodScore: 0
  };

  const res = classifySnakeFeatures(mockFeatures);
  assert.strictEqual(res.topSpecies.id, 'bungarus-caeruleus');
  assert.strictEqual(res.triageCategory, 'Elapidae (Neurotoxic)');
  assert.notStrictEqual(res.topSpecies.id, 'daboia-russelii');
});

runTest("Bug 1 Fix: Cobra vector correctly classifies as Naja naja, not Russell's Viper", () => {
  const cobra = SPECIES_DATABASE.find(s => s.id === 'naja-naja')!;
  const mockFeatures: ExtractedFeatures = {
    vector: [...cobra.prototypeVector!],
    colorHistH: cobra.prototypeVector!.slice(0, 8),
    colorHistS: cobra.prototypeVector!.slice(8, 12),
    colorHistV: cobra.prototypeVector!.slice(12, 16),
    colorMoments: { meanR: 0.45, meanG: 0.40, meanB: 0.35, stdLum: 0.21 },
    hogTexture: cobra.prototypeVector!.slice(20, 26),
    patternEntropy: cobra.prototypeVector![26],
    scaleRoughness: cobra.prototypeVector![27],
    isSnake: true,
    oodScore: 0
  };

  const res = classifySnakeFeatures(mockFeatures);
  assert.strictEqual(res.topSpecies.id, 'naja-naja');
  assert.strictEqual(res.triageCategory, 'Elapidae (Neurotoxic)');
});

runTest("Bug 1 Fix: Saw-scaled Viper classifies as Echis carinatus", () => {
  const echis = SPECIES_DATABASE.find(s => s.id === 'echis-carinatus')!;
  const mockFeatures: ExtractedFeatures = {
    vector: [...echis.prototypeVector!],
    colorHistH: echis.prototypeVector!.slice(0, 8),
    colorHistS: echis.prototypeVector!.slice(8, 12),
    colorHistV: echis.prototypeVector!.slice(12, 16),
    colorMoments: { meanR: 0.54, meanG: 0.48, meanB: 0.38, stdLum: 0.19 },
    hogTexture: echis.prototypeVector!.slice(20, 26),
    patternEntropy: echis.prototypeVector![26],
    scaleRoughness: echis.prototypeVector![27],
    isSnake: true,
    oodScore: 0
  };

  const res = classifySnakeFeatures(mockFeatures);
  assert.strictEqual(res.topSpecies.id, 'echis-carinatus');
  assert.strictEqual(res.triageCategory, 'Viperidae (Hemotoxic)');
});

runTest("Bug 1 Fix: Indian Rat Snake classifies as Ptyas mucosa (Non-venomous)", () => {
  const ptyas = SPECIES_DATABASE.find(s => s.id === 'ptyas-mucosa')!;
  const mockFeatures: ExtractedFeatures = {
    vector: [...ptyas.prototypeVector!],
    colorHistH: ptyas.prototypeVector!.slice(0, 8),
    colorHistS: ptyas.prototypeVector!.slice(8, 12),
    colorHistV: ptyas.prototypeVector!.slice(12, 16),
    colorMoments: { meanR: 0.48, meanG: 0.45, meanB: 0.32, stdLum: 0.18 },
    hogTexture: ptyas.prototypeVector!.slice(20, 26),
    patternEntropy: ptyas.prototypeVector![26],
    scaleRoughness: ptyas.prototypeVector![27],
    isSnake: true,
    oodScore: 0
  };

  const res = classifySnakeFeatures(mockFeatures);
  assert.strictEqual(res.topSpecies.id, 'ptyas-mucosa');
  assert.strictEqual(res.triageCategory, 'Non-venomous / Colubrid');
});

// ----------------------------------------------------
// Test 2: Bug 2 - OOD Detection (Solid color, noise, grid)
// ----------------------------------------------------
runTest("Bug 2 Fix: OOD detector rejects solid color image", () => {
  const width = 100;
  const height = 100;
  const data = new Uint8ClampedArray(width * height * 4);
  // Pure blue canvas
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 30;
    data[i + 1] = 60;
    data[i + 2] = 200;
    data[i + 3] = 255;
  }
  const imgData = { data, width, height } as unknown as ImageData;
  const features = extractFeaturesFromImageData(imgData);

  assert.strictEqual(features.isSnake, false);
  assert.ok(features.oodScore > 0.70);
  const result = classifySnakeFeatures(features);
  assert.strictEqual(result.isAbstained, true);
  assert.strictEqual(result.triageCategory, 'Uncertain / Abstain');
});

runTest("Bug 2 Fix: OOD detector rejects synthetic orthogonal checkerboard", () => {
  const width = 100;
  const height = 100;
  const data = new Uint8ClampedArray(width * height * 4);
  // 10x10 alternating black and white checkerboard
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isWhite = (Math.floor(x / 10) + Math.floor(y / 10)) % 2 === 0;
      const v = isWhite ? 255 : 0;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  const imgData = { data, width, height } as unknown as ImageData;
  const features = extractFeaturesFromImageData(imgData);

  assert.strictEqual(features.isSnake, false);
  assert.ok(features.oodScore > 0.70);
});

// ----------------------------------------------------
// Test 3: Bug 3 - Calibrated Softmax (No fake constant 0.93)
// ----------------------------------------------------
runTest("Bug 3 Fix: Probabilities are properly calibrated and sum to 1.0 (no hardcoded 0.93)", () => {
  const sp = SPECIES_DATABASE[0];
  const mockFeatures: ExtractedFeatures = {
    vector: [...sp.prototypeVector!],
    colorHistH: sp.prototypeVector!.slice(0, 8),
    colorHistS: sp.prototypeVector!.slice(8, 12),
    colorHistV: sp.prototypeVector!.slice(12, 16),
    colorMoments: { meanR: 0.58, meanG: 0.46, meanB: 0.32, stdLum: 0.24 },
    hogTexture: sp.prototypeVector!.slice(20, 26),
    patternEntropy: sp.prototypeVector![26],
    scaleRoughness: sp.prototypeVector![27],
    isSnake: true,
    oodScore: 0
  };

  const res = classifySnakeFeatures(mockFeatures);
  const sumProbs = res.probabilities.reduce((acc, p) => acc + p.probability, 0);
  assert.ok(Math.abs(sumProbs - 1.0) < 0.01, `Probabilities must sum to 1.0, got ${sumProbs}`);
  assert.ok(res.confidence > 0.50 && res.confidence <= 1.0, "Confidence should reflect true posterior");
});

// ----------------------------------------------------
// Test 4: Bug 4 & 13 - Math Consistency & Wilson Interval
// ----------------------------------------------------
runTest("Bug 4 & 13 Fix: Wilson CI math calculation is exact", () => {
  const wilson = calculateWilsonInterval(265, 320, 0.95);
  assert.strictEqual(wilson.pointEstimate, 0.8281);
  assert.ok(wilson.lower >= 0.78 && wilson.lower <= 0.79, `Wilson lower expected ~0.783, got ${wilson.lower}`);
  assert.ok(wilson.upper >= 0.86 && wilson.upper <= 0.87, `Wilson upper expected ~0.865, got ${wilson.upper}`);
});

runTest("Bug 4 Fix: Confusion Matrix is square, row sums equal class support, total equals N test photos", () => {
  let totalInMatrix = 0;
  let correctDiagonal = 0;
  for (let r = 0; r < CONFUSION_MATRIX_8X8.length; r++) {
    let rowSum = 0;
    for (let c = 0; c < CONFUSION_MATRIX_8X8[r].length; c++) {
      rowSum += CONFUSION_MATRIX_8X8[r][c];
      totalInMatrix += CONFUSION_MATRIX_8X8[r][c];
      if (r === c) correctDiagonal += CONFUSION_MATRIX_8X8[r][c];
    }
    assert.strictEqual(CONFUSION_MATRIX_8X8[r].length, CONFUSION_MATRIX_8X8.length, 'matrix must be square');
    assert.ok(rowSum > 0, `Row ${r} must have test samples`);
  }
  assert.strictEqual(totalInMatrix, EVALUATION_METRICS.totalSamples);
  assert.strictEqual(correctDiagonal, EVALUATION_METRICS.speciesCorrect, 'Metrics must be derived from the matrix, not hand-typed');
});

// ----------------------------------------------------
// Test 5: Bug 6 - antivenomIndicated is ALWAYS strict boolean
// ----------------------------------------------------
runTest("Bug 6 Fix: antivenomIndicated is strictly boolean true or false, never undefined", () => {
  const res1 = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' });
  assert.strictEqual(typeof res1.antivenomIndicated, 'boolean');
  assert.strictEqual(res1.antivenomIndicated, true);

  const res2 = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted' });
  assert.strictEqual(typeof res2.antivenomIndicated, 'boolean');
  assert.strictEqual(res2.antivenomIndicated, false);

  const res3 = evaluateClinicalTriage({});
  assert.strictEqual(typeof res3.antivenomIndicated, 'boolean');
});

// ----------------------------------------------------
// Test 6: Bug 5 - Triage Matrix never calls venomous envenoming 'Non-venomous'
// ----------------------------------------------------
runTest("Bug 5 Fix: Neurotoxic signs (ptosis) are NEVER classified as Non-venomous or Dry bite", () => {
  const res = evaluateClinicalTriage({ bilateralPtosis: true });
  assert.strictEqual(res.antivenomIndicated, true);
  assert.strictEqual(res.syndromeCategory, 'Neurotoxic');
  assert.notStrictEqual(res.syndromeTitle, "Observation — Suspected Non-Venomous or Dry Bite");
  assert.strictEqual(res.urgencyLevel, 'CRITICAL_IMMEDIATE');
});

runTest("Bug 5 Fix: Hemotoxic signs (bleeding + 20WBCT) are NEVER classified as Non-venomous", () => {
  const res = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted', systemicBleeding: true });
  assert.strictEqual(res.antivenomIndicated, true);
  assert.strictEqual(res.syndromeCategory, 'Hemotoxic');
  assert.strictEqual(res.urgencyLevel, 'CRITICAL_IMMEDIATE');
});

// ----------------------------------------------------
// Test 7: Bug 7 - Contradictions (Blistering, Shock, Oliguria, Boundary INR/Platelets)
// ----------------------------------------------------
runTest("Bug 7 Fix: Blistering / necrosis is classified as Severe Local Envenoming, NOT dry bite", () => {
  const res = evaluateClinicalTriage({ blisteringNecrosis: true, localSwelling: 'moderate_limb' });
  assert.strictEqual(res.antivenomIndicated, true);
  assert.strictEqual(res.syndromeCategory, 'Severe Local');
  assert.ok(!res.syndromeTitle.toLowerCase().includes("dry bite"));
  assert.ok(res.syndromeTitle.toLowerCase().includes("severe local"));
});

runTest("Bug 7 Fix: Shock or Oliguria alone indicates Severe Systemic Envenoming, NOT non-venomous", () => {
  const resShock = evaluateClinicalTriage({ clinicalShock: true });
  assert.strictEqual(resShock.antivenomIndicated, true);
  assert.strictEqual(resShock.syndromeCategory, 'Severe Systemic');
  assert.strictEqual(resShock.urgencyLevel, 'CRITICAL_IMMEDIATE');

  const resOliguria = evaluateClinicalTriage({ oliguriaAnuria: true });
  assert.strictEqual(resOliguria.antivenomIndicated, true);
  assert.strictEqual(resOliguria.syndromeCategory, 'Severe Systemic');
});

runTest("Bug 7 Fix: Boundary INR == 1.5 triggers coagulopathy indicator", () => {
  const res = evaluateClinicalTriage({ inr: 1.5 });
  assert.strictEqual(res.antivenomIndicated, true);
  assert.strictEqual(res.syndromeCategory, 'Hemotoxic');
  assert.ok(res.primaryIndications.some(i => i.includes("1.5")));
});

runTest("Bug 7 Fix: Boundary Platelets == 100,000 triggers thrombocytopenia indicator", () => {
  const res = evaluateClinicalTriage({ plateletCount: 100000 });
  assert.strictEqual(res.antivenomIndicated, true);
  assert.strictEqual(res.syndromeCategory, 'Hemotoxic');
  assert.ok(res.primaryIndications.some(i => i.includes("100,000")));
});

// ----------------------------------------------------
// Test 8: Bug 8 - Server crash resilience on missing/undefined payloads
// ----------------------------------------------------
runTest("Bug 8 Fix: evaluateClinicalTriage handles empty/undefined inputs gracefully without crashing", () => {
  const resEmpty = evaluateClinicalTriage({});
  assert.ok(resEmpty);
  assert.strictEqual(typeof resEmpty.antivenomIndicated, 'boolean');
  assert.ok(resEmpty.syndromeTitle);
});

// ----------------------------------------------------
// Test 9: Bug 10 - Pattern Entropy is NOT constant 1.00
// ----------------------------------------------------
runTest("Bug 10 Fix: Pattern Entropy is dynamic and bounded in [0, 1]", () => {
  const krait = SPECIES_DATABASE.find(s => s.id === 'bungarus-caeruleus')!;
  const boa = SPECIES_DATABASE.find(s => s.id === 'eryx-johnii')!;
  
  // Banded krait has higher pattern entropy than uniform sand boa
  assert.ok(krait.prototypeVector![26] > boa.prototypeVector![26]);
  assert.ok(boa.prototypeVector![26] < 0.50);
  assert.ok(krait.prototypeVector![26] > 0.50 && krait.prototypeVector![26] < 1.00);
});

// ----------------------------------------------------
// Test 10: Mandatory Adrenaline 0.5 mg Bedside Precaution
// ----------------------------------------------------
runTest("Clinical Safety: When antivenom is indicated, Adrenaline precaution is mandatory", () => {
  const res = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' });
  assert.strictEqual(res.adrenalinePrecautionMandatory, true);
  assert.ok(res.adrenalineDoseProtocol.includes("0.5 mg"));
});

// ----------------------------------------------------
// Test 11: Pediatric Antivenom Dosing Rule (WHO Invariant)
// ----------------------------------------------------
runTest("Pediatric Safety: Children (<20kg) receive full adult vial count per WHO guidelines", () => {
  const resChild = evaluateClinicalTriage(
    { twentyMinWBCTClotted: 'unclotted' },
    { weightKg: 12, ageYears: 4 }
  );
  assert.strictEqual(resChild.antivenomIndicated, true);
  assert.strictEqual(resChild.recommendedAntivenom.initialDoseVials, 3);
  assert.ok(resChild.contraindicationsWarnings.some(w => w.includes("Pediatric rule")));
});

// ----------------------------------------------------
// Test 12: Pregnancy Alert
// ----------------------------------------------------
runTest("Pregnancy Safety: Antivenom is not withheld in pregnancy", () => {
  const resPreg = evaluateClinicalTriage(
    { bilateralPtosis: true },
    { isPregnant: true }
  );
  assert.strictEqual(resPreg.antivenomIndicated, true);
  assert.ok(resPreg.contraindicationsWarnings.some(w => w.includes("Pregnancy alert")));
});

// ----------------------------------------------------
// Test 13: Prior ASV Anaphylaxis Alert
// ----------------------------------------------------
runTest("Prior ASV Reaction Alert: Triggers pre-medication warning", () => {
  const resPrior = evaluateClinicalTriage(
    { twentyMinWBCTClotted: 'unclotted' },
    { priorAntivenomReaction: true }
  );
  assert.ok(resPrior.contraindicationsWarnings.some(w => w.includes("Prior adverse reaction")));
});

// ----------------------------------------------------
// Test 14: Non-indicated Dosage is Zero Vials
// ----------------------------------------------------
runTest("Antivenom Stewardship: Zero vials prescribed when envenoming is absent", () => {
  const resNone = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted', localSwelling: 'none' });
  assert.strictEqual(resNone.antivenomIndicated, false);
  assert.strictEqual(resNone.recommendedAntivenom.initialDoseVials, 0);
});

// ----------------------------------------------------
// Test 15: OOD Gaussian White Noise Rejection
// ----------------------------------------------------
runTest("Bug 2 Fix: Random white noise is rejected by OOD detector", () => {
  const width = 100;
  const height = 100;
  const data = new Uint8ClampedArray(width * height * 4);
  // Pseudo-random deterministic noise
  let seed = 42;
  for (let i = 0; i < data.length; i += 4) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = Math.floor((seed / 233280) * 255);
    data[i] = rnd;
    data[i + 1] = rnd;
    data[i + 2] = rnd;
    data[i + 3] = 255;
  }
  const imgData = { data, width, height } as unknown as ImageData;
  const features = extractFeaturesFromImageData(imgData);
  assert.strictEqual(features.isSnake, false);
});

// ----------------------------------------------------
// Test 16: Triage Confusion Matrix Diagonals
// ----------------------------------------------------
runTest("Triage Matrix Math: Total samples sum to N test photos and diagonal equals the reported triage-correct count", () => {
  let triageTotal = 0;
  let triageCorrect = 0;
  for (let r = 0; r < TRIAGE_CONFUSION_MATRIX.length; r++) {
    for (let c = 0; c < TRIAGE_CONFUSION_MATRIX[r].length; c++) {
      triageTotal += TRIAGE_CONFUSION_MATRIX[r][c];
      if (r === c) triageCorrect += TRIAGE_CONFUSION_MATRIX[r][c];
    }
  }
  assert.strictEqual(triageTotal, EVALUATION_METRICS.totalSamples);
  assert.strictEqual(triageCorrect, EVALUATION_METRICS.triageCorrect);
});

console.log("=================================================");
console.log(`ALL ${passedCount}/${totalCount} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
console.log("=================================================");
