import assert from 'node:assert';
import { SPECIES_DATABASE } from '../src/data/speciesData.ts';
import { classifySnakeFeatures } from '../src/ml/classicalModels.ts';
import { evaluateClinicalTriage } from '../src/clinical/clinicalEngine.ts';
import { EVALUATION_METRICS, CONFUSION_MATRIX_8X8 } from '../src/ml/benchmarkData.ts';

// Legacy untrained prototype classifier tests only apply to species that have a hand-set prototype
const PROTOS = SPECIES_DATABASE.filter(sp => sp.prototypeVector);

let pass = 0, total = 0;
function t(name: string, fn: () => void) {
  total++;
  try { fn(); pass++; console.log(`✓ [PASS] ${name}`); }
  catch (e) { console.error(`✗ [FAIL] ${name}`); throw e; }
}
const feat = (vector: number[]) => ({ vector, isSnake: true, oodScore: 0 }) as any;

console.log('=== REGRESSION TESTS (bugs found in QA review) ===');

// ---- Classifier ----
t('Out-of-range vector (999) abstains instead of NaN / confident label', () => {
  const r = classifySnakeFeatures(feat(Array(28).fill(999)));
  assert.strictEqual(r.isAbstained, true);
  assert.ok(Number.isFinite(r.confidence));
  assert.strictEqual(r.triageCategory, 'Uncertain / Abstain');
});
t('Wrong-length / NaN vector abstains', () => {
  assert.strictEqual(classifySnakeFeatures(feat([0.1, 0.2])).isAbstained, true);
  assert.strictEqual(classifySnakeFeatures(feat(Array(28).fill(NaN))).isAbstained, true);
});
t('Probabilities are finite and sum to ~1 for every prototype', () => {
  for (const sp of PROTOS) {
    const r = classifySnakeFeatures(feat([...sp.prototypeVector!]));
    assert.ok(r.probabilities.every(p => Number.isFinite(p.probability)));
    assert.ok(Math.abs(r.probabilities.reduce((a, p) => a + p.probability, 0) - 1) < 0.01);
  }
});
t('Every venomous prototype is classified as its own species (never harmless)', () => {
  for (const sp of PROTOS.filter(s => s.isVenomous)) {
    const r = classifySnakeFeatures(feat([...sp.prototypeVector!]));
    assert.strictEqual(r.topSpecies.id, sp.id);
    assert.strictEqual(r.isAbstained, false);
  }
});
t('Safety: with seeded noise, no venomous snake is ever labelled harmless without abstaining', () => {
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const g = () => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
  let dangerous = 0;
  for (const sp of PROTOS.filter(s => s.isVenomous))
    for (let i = 0; i < 500; i++) {
      const v = sp.prototypeVector!.map(x => Math.min(1, Math.max(0, x + g() * 0.06)));
      const r = classifySnakeFeatures(feat(v));
      if (!r.isAbstained && !r.topSpecies.isVenomous) dangerous++;
    }
  assert.strictEqual(dangerous, 0);
});
t('Benchmark metrics come from the real held-out test matrix and carry an honest disclosure', () => {
  assert.strictEqual(EVALUATION_METRICS.speciesCorrect, CONFUSION_MATRIX_8X8.reduce((a, r, i) => a + r[i], 0));
  assert.ok(/HELD-OUT/.test(EVALUATION_METRICS.disclosureStatement));
  assert.ok(/Not validated prospectively/.test(EVALUATION_METRICS.disclosureStatement));
});

// ---- Clinical ----
t('Platelets 150 (x10^3/uL, normal) do NOT trigger antivenom; unit warning shown', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted', plateletCount: 150 });
  assert.strictEqual(r.antivenomIndicated, false);
  assert.ok(r.contraindicationsWarnings.some(w => w.includes('Unit check')));
});
t('Platelets 150000 /uL (normal) do not trigger; 80000 /uL does', () => {
  assert.strictEqual(evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted', plateletCount: 150000 }).antivenomIndicated, false);
  assert.strictEqual(evaluateClinicalTriage({ plateletCount: 80000 }).antivenomIndicated, true);
});
t('Negative / impossible INR, platelets, creatinine are ignored with a warning', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted', inr: -3, plateletCount: -5, creatinineMgDl: -1 });
  assert.strictEqual(r.antivenomIndicated, false);
  assert.ok(r.contraindicationsWarnings.filter(w => w.startsWith('Input check')).length === 3);
});
t('Creatinine boundary is consistent (>= 1.4 triggers)', () => {
  assert.strictEqual(evaluateClinicalTriage({ creatinineMgDl: 1.4 }).antivenomIndicated, true);
  assert.strictEqual(evaluateClinicalTriage({ creatinineMgDl: 1.3 }).antivenomIndicated, false);
});
t('Moderate limb swelling is NOT labelled safe: urgent observation + progression marking', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted', localSwelling: 'moderate_limb' });
  assert.notStrictEqual(r.urgencyLevel, 'SAFE_OBSERVE_24H');
  assert.ok(r.supportiveCareActions.some(a => a.includes('Mark the proximal edge')));
});
t('Child 12 kg: carrier fluid is weight-based (60-120 mL), not 250-500 mL', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' }, { weightKg: 12, ageYears: 4 });
  assert.ok(r.recommendedAntivenom.infusionProtocol.includes('60-120 mL'), r.recommendedAntivenom.infusionProtocol);
  assert.ok(!r.recommendedAntivenom.infusionProtocol.includes('250-500'));
  assert.strictEqual(r.recommendedAntivenom.initialDoseVials, 3); // vial count NOT reduced for children
});
t('Child 12 kg: adrenaline is 0.01 mg/kg (0.12 mg), not the adult 0.5 mg', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' }, { weightKg: 12, ageYears: 4 });
  assert.ok(r.adrenalineDoseProtocol.includes('0.12 mg'), r.adrenalineDoseProtocol);
  assert.ok(!r.adrenalineDoseProtocol.includes('Draw 0.5 mg'));
});
t('Adult adrenaline stays 0.5 mg', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' }, { weightKg: 70, ageYears: 35 });
  assert.ok(r.adrenalineDoseProtocol.includes('0.5 mg'));
});
t('Child neurotoxic: atropine/neostigmine are weight-based', () => {
  const r = evaluateClinicalTriage({ bilateralPtosis: true }, { weightKg: 12, ageYears: 4 });
  const line = r.supportiveCareActions.find(a => a.startsWith('Atropine-Neostigmine'))!;
  assert.ok(line.includes('0.24 mg') && line.includes('0.48 mg'), line);
});
t('Early (<6h) negative 20WBCT carries a repeat-test warning', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted' }, { timeSinceBiteHours: 1 });
  assert.ok(r.contraindicationsWarnings.some(w => w.includes('Early-presentation')));
});
t('Antivenom-indicated output always asks for dose verification', () => {
  const r = evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' });
  assert.ok(r.contraindicationsWarnings.some(w => w.includes('Dose verification')));
});

t('No-sign patient seen <6 h after bite, or after a nocturnal (krait-setting) bite, is NOT labelled safe', () => {
  const early = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted' }, { timeSinceBiteHours: 0.2 });
  assert.notStrictEqual(early.urgencyLevel, 'SAFE_OBSERVE_24H');
  assert.ok(early.syndromeTitle.includes('NOT Excluded'));
  const night = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted' }, { timeSinceBiteHours: 12, circumstance: 'nocturnal_sleeping' });
  assert.notStrictEqual(night.urgencyLevel, 'SAFE_OBSERVE_24H');
  const late = evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted' }, { timeSinceBiteHours: 24, circumstance: 'daytime_agriculture' });
  assert.strictEqual(late.urgencyLevel, 'SAFE_OBSERVE_24H');
});

t('Triage is graded, not one-size-fits-all: different symptoms give different tiers, labels, actions and monitoring', () => {
  const cases: Record<string, any> = {
    pending: evaluateClinicalTriage({ twentyMinWBCTClotted: 'pending' }, { timeSinceBiteHours: 10, circumstance: 'other' }),
    clottedLate: evaluateClinicalTriage({ twentyMinWBCTClotted: 'clotted' }, { timeSinceBiteHours: 24, circumstance: 'other' }),
    unclottedOnly: evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted' }),
    bleeding: evaluateClinicalTriage({ twentyMinWBCTClotted: 'unclotted', systemicBleeding: true }),
    ptosis: evaluateClinicalTriage({ bilateralPtosis: true }),
    resp: evaluateClinicalTriage({ respiratoryDistress: true }),
    shock: evaluateClinicalTriage({ clinicalShock: true }),
    renal: evaluateClinicalTriage({ oliguriaAnuria: true }),
    local: evaluateClinicalTriage({ localSwelling: 'severe_cross_joint' })
  };
  assert.strictEqual(cases.clottedLate.urgencyLevel, 'SAFE_OBSERVE_24H');
  assert.strictEqual(cases.pending.urgencyLevel, 'MONITOR_INPATIENT');
  assert.strictEqual(cases.unclottedOnly.urgencyLevel, 'HIGH_URGENT');
  assert.strictEqual(cases.renal.urgencyLevel, 'HIGH_URGENT');
  assert.strictEqual(cases.local.urgencyLevel, 'HIGH_URGENT');
  for (const k of ['bleeding', 'ptosis', 'resp', 'shock']) assert.strictEqual(cases[k].urgencyLevel, 'CRITICAL_IMMEDIATE', k);
  const tiers = new Set(Object.values(cases).map((c: any) => c.urgencyLevel));
  assert.ok(tiers.size >= 4, `expected all 4 tiers to be reachable, got ${[...tiers]}`);
  // monitoring schedule and "do first" differ by syndrome
  assert.notStrictEqual(cases.ptosis.recommendedAntivenom.monitoringSchedule, cases.unclottedOnly.recommendedAntivenom.monitoringSchedule);
  assert.ok(cases.ptosis.priorityActions.some((a: string) => /airway/i.test(a)));
  assert.ok(cases.unclottedOnly.priorityActions.some((a: string) => /intramuscular/i.test(a)));
  assert.ok(cases.shock.priorityActions[0].startsWith('Treat shock'));
  assert.ok(!cases.unclottedOnly.priorityActions.some((a: string) => /airway/i.test(a)));
  const labels = new Set(Object.values(cases).map((c: any) => c.triageLabel)); assert.ok(labels.size >= 4);
});

console.log(`ALL ${pass}/${total} REGRESSION TESTS PASSED`);
