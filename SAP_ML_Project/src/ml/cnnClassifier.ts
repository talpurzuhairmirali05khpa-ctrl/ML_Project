/**
 * Trained snake classifier (EfficientNet-B0 backbone + logistic head, exported to ONNX).
 * Runs fully client-side through onnxruntime-web (WASM). Input: 224x224 RGB, center-cropped square.
 * Normalisation, head, flip-TTA and temperature scaling are baked INTO the ONNX graph;
 * this module only does resizing-independent steps: RGBA -> CHW float [0,1], softmax, and the safety/abstention policy.
 */
import * as ort from 'onnxruntime-web';
import meta from './snakeModel.json';
import { getSpeciesById, SPECIES_DATABASE } from '../data/speciesData';
import { ClassificationResult, ExtractedFeatures, TriageUrgency } from '../types';

export const MODEL_INPUT = 224;
export const MODEL_URL: string = meta.modelFile;
export const MODEL_CLASSES: string[] = meta.classes;
const IS_VENOMOUS: boolean[] = meta.isVenomous;
const TAU: number = meta.tau;                 // minimum calibrated top probability
const SNAKE_MASS_MIN: number = meta.snakeMassThreshold; // ImageNet-head 'snake class' probability; below this the photo is treated as not-a-snake
const VENOM_MASS_MAX: number = meta.venomMassMax; // a "harmless" label is refused if venomous classes hold more mass than this

export function softmax(logits: ArrayLike<number>): number[] {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) if (logits[i] > max) max = logits[i];
  const e = Array.from({ length: logits.length }, (_, i) => Math.exp(logits[i] - max));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map(v => v / sum);
}

/** RGBA (size*size*4) -> Float32 CHW in [0,1]. ImageNet normalisation happens inside the model graph. */
export function rgbaToChw(data: ArrayLike<number>, size = MODEL_INPUT): Float32Array {
  const plane = size * size;
  const out = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    out[i] = data[i * 4] / 255;
    out[plane + i] = data[i * 4 + 1] / 255;
    out[2 * plane + i] = data[i * 4 + 2] / 255;
  }
  return out;
}

export function lumaStd(data: ArrayLike<number>): number {
  const n = data.length / 4; let s = 0, s2 = 0;
  for (let i = 0; i < n; i++) { const y = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]; s += y; s2 += y * y; }
  const m = s / n; return Math.sqrt(Math.max(0, s2 / n - m * m));
}

export interface Decision { topIdx: number; topProb: number; venomousMass: number; accepted: boolean; reason?: string }

/** Abstention + asymmetric safety policy (calibrated on out-of-fold predictions of the training set). */
export function decide(probs: number[]): Decision {
  let topIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[topIdx]) topIdx = i;
  const topProb = probs[topIdx];
  const venomousMass = probs.reduce((a, p, i) => a + (IS_VENOMOUS[i] ? p : 0), 0);
  if (topProb < TAU) return { topIdx, topProb, venomousMass, accepted: false, reason: `Top-class confidence ${(topProb * 100).toFixed(1)}% is below the decision threshold.` };
  if (!IS_VENOMOUS[topIdx] && venomousMass > VENOM_MASS_MAX)
    return { topIdx, topProb, venomousMass, accepted: false, reason: `Best match is a harmless species, but ${(venomousMass * 100).toFixed(1)}% of the probability falls on venomous species; a venomous snake cannot be excluded.` };
  return { topIdx, topProb, venomousMass, accepted: true };
}

const DISCLAIMER_VEN = (fam: string) => `Visual classifier suggests venomous ${fam}. Prepare 20WBCT test immediately. Antivenom is dictated solely by objective coagulopathy or neurotoxic signs.`;
const DISCLAIMER_HARMLESS = (name: string) => `Visual classifier suggests morphologically harmless species (${name}). WARNING: Visual appearance NEVER excludes envenomation from an unseen co-occurring venomous bite or dry bite mimicking envenoming. Minimum 24-hour hospital observation mandatory.`;

export function buildResult(probs: number[], features: ExtractedFeatures, forcedAbstainReason?: string, showProbabilities = true): ClassificationResult {
  const d = decide(probs);
  const species = getSpeciesById(MODEL_CLASSES[d.topIdx]) ?? SPECIES_DATABASE[0];
  const abstained = !!forcedAbstainReason || !d.accepted;
  const probabilities = MODEL_CLASSES.map((id, i) => ({ speciesId: id, name: getSpeciesById(id)?.scientificName ?? id, probability: Number(probs[i].toFixed(4)) }))
    .sort((a, b) => b.probability - a.probability);
  let triageCategory: ClassificationResult['triageCategory'];
  let urgencyLevel: TriageUrgency;
  if (abstained) { triageCategory = 'Uncertain / Abstain'; urgencyLevel = 'OBSERVATION_HIGH'; }
  else if (species.family === 'Viperidae') { triageCategory = 'Viperidae (Hemotoxic)'; urgencyLevel = 'EMERGENCY_VIPERID'; }
  else if (species.family === 'Elapidae') { triageCategory = 'Elapidae (Neurotoxic)'; urgencyLevel = 'EMERGENCY_ELAPID'; }
  else { triageCategory = 'Non-venomous / Colubrid'; urgencyLevel = 'OBSERVATION_LOW'; }
  return {
    topSpecies: species,
    predictedClass: abstained ? 'Uncertain / Abstain' : species.scientificName,
    confidence: Number(d.topProb.toFixed(3)),
    isAbstained: abstained,
    abstentionReason: abstained ? (forcedAbstainReason ?? d.reason) : undefined,
    probabilities: showProbabilities ? probabilities : [], triageCategory, urgencyLevel,
    clinicalSafetyDisclaimer: abstained
      ? 'Photo could not be classified reliably. Treat the patient strictly on bite marks, symptoms and the 20WBCT bedside clotting test.'
      : (species.isVenomous ? DISCLAIMER_VEN(species.family) : DISCLAIMER_HARMLESS(species.commonName.en)),
    features
  };
}

/** Result shown when no image could be analysed (never a fabricated prediction). */
export function abstainResult(reason: string, features: ExtractedFeatures): ClassificationResult {
  const uniform = new Array(MODEL_CLASSES.length).fill(1 / MODEL_CLASSES.length);
  return buildResult(uniform, features, reason, false);   // no probabilities: nothing was actually predicted
}

let sessionPromise: Promise<ort.InferenceSession> | null = null;
export function loadSnakeModel(source: string | Uint8Array = MODEL_URL): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(source as any, { executionProviders: ['wasm'] }).catch(err => { sessionPromise = null; throw err; });
  }
  return sessionPromise;
}

export interface Prediction { probs: number[]; snakeMass: number }

export async function predict(rgba224: ArrayLike<number>, session?: ort.InferenceSession): Promise<Prediction> {
  const s = session ?? await loadSnakeModel();
  const input = new ort.Tensor('float32', rgbaToChw(rgba224), [1, 3, MODEL_INPUT, MODEL_INPUT]);
  const out = await s.run({ image: input });
  return { probs: softmax((out.logits as ort.Tensor).data as Float32Array), snakeMass: (out.snake_mass as ort.Tensor).data[0] as number };
}
export async function predictProbs(rgba224: ArrayLike<number>, session?: ort.InferenceSession): Promise<number[]> {
  return (await predict(rgba224, session)).probs;
}

export async function classifyRgba224(rgba224: ArrayLike<number>, features: ExtractedFeatures, session?: ort.InferenceSession): Promise<ClassificationResult> {
  if (lumaStd(rgba224) < 4) return abstainResult('Image is nearly uniform (no visible subject).', features);
  const { probs, snakeMass } = await predict(rgba224, session);
  if (snakeMass < SNAKE_MASS_MIN) return buildResult(probs, features, `This does not look like a snake photo (snake-likeness ${(snakeMass * 100).toFixed(1)}% is below the ${(SNAKE_MASS_MIN * 100).toFixed(1)}% minimum). No species was assigned.`, false);
  return buildResult(probs, features);
}
