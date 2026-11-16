import { ExtractedFeatures, ClassificationResult, SnakeSpecies, TriageUrgency } from '../types';
import { SPECIES_DATABASE, getSpeciesById } from '../data/speciesData';

/** Max total probability on venomous species allowed before a 'harmless' label is refused. */
export let HARMLESS_MAX_VENOM_MASS = 0.25;
export function setHarmlessThreshold(v: number) { HARMLESS_MAX_VENOM_MASS = v; }

// Feature subspace weights for biological discrimination
const FEATURE_WEIGHTS = [
  // Hue (8 bins) - color wavelength
  1.4, 1.4, 1.4, 1.4, 1.2, 1.2, 1.2, 1.2,
  // Saturation (4 bins)
  1.0, 1.0, 1.0, 1.0,
  // Value / Lightness (4 bins) - crucial for jet-black Kraits vs sandy Boas
  1.5, 1.2, 1.2, 1.5,
  // Moments: R, G, B, stdLum (contrast)
  1.1, 1.1, 1.1, 1.6,
  // HOG (6 bins)
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
  // Pattern Entropy - geometric spot chains vs uniform smooth
  1.5,
  // Scale Roughness - keeled scales (Viperidae) vs smooth porcelain (Elapidae/Colubridae)
  2.2
];

/**
 * Calculates weighted normalized Mahalanobis/Euclidean distance between a query vector
 * and a species prototype vector.
 */
export function calculateWeightedDistance(query: number[], prototype: number[]): number {
  if (query.length !== prototype.length) {
    throw new Error(`Vector dimension mismatch: query ${query.length} vs prototype ${prototype.length}`);
  }

  let weightedSumSq = 0;
  let totalWeight = 0;

  for (let i = 0; i < query.length; i++) {
    const w = FEATURE_WEIGHTS[i] ?? 1.0;
    const diff = query[i] - prototype[i];
    weightedSumSq += w * (diff * diff);
    totalWeight += w;
  }

  return Math.sqrt(weightedSumSq / totalWeight);
}

/**
 * Classical Multi-Model Ensemble Classifier:
 * Combines Weighted Prototype Distance, RBF Kernel (SVM analogy), and Calibrated Softmax.
 * Fixes Bug 1 (Russell's Viper bias), Bug 2 (OOD handling), Bug 3 (Fake 0.93 probability).
 */
export function classifySnakeFeatures(features: ExtractedFeatures): ClassificationResult {
  const fallbackSpecies = SPECIES_DATABASE[0];

  // 0. Input sanity: malformed / out-of-range vectors must abstain, never produce a confident label
  const vec = features.vector;
  const malformed = !Array.isArray(vec) || vec.length !== 28 || vec.some(v => typeof v !== 'number' || !Number.isFinite(v) || v < -0.001 || v > 1.001);

  // 1. OOD / Non-snake check
  if (malformed || !features.isSnake || features.oodScore > 0.70) {
    return {
      topSpecies: fallbackSpecies,
      predictedClass: "Out-of-Distribution / Non-Snake",
      confidence: 0,
      isAbstained: true,
      abstentionReason: malformed
        ? "Feature vector is malformed or outside the valid [0,1] range; classification refused."
        : (features.rejectionReason || "Image does not match known biological reptile patterns."),
      probabilities: SPECIES_DATABASE.map(s => ({ speciesId: s.id, name: s.scientificName, probability: 0 })),
      triageCategory: 'Uncertain / Abstain',
      urgencyLevel: 'OBSERVATION_HIGH',
      clinicalSafetyDisclaimer: "Non-snake image or unclassifiable photo. Treat patient strictly based on physical bite marks, symptoms, and 20WBCT bedside clotting.",
      features
    };
  }

  const queryVector = features.vector;

  // 2. Compute distances to each species prototype
  const distances: { species: SnakeSpecies; distance: number }[] = SPECIES_DATABASE.filter(sp => sp.prototypeVector).map(sp => {
    const dist = calculateWeightedDistance(queryVector, sp.prototypeVector!);
    return { species: sp, distance: dist };
  });

  // Sort by distance ascending
  distances.sort((a, b) => a.distance - b.distance);

  // 3. Calibrated Softmax Probabilities with temperature scaling
  const temperature = 0.055;
  // Numerically stable softmax: shift by the smallest distance so exp() never underflows to 0 for every class
  const minDist = distances[0].distance;
  const negExp = distances.map(d => Math.exp(-(d.distance - minDist) / temperature));
  const sumExp = negExp.reduce((a, b) => a + b, 0);

  const probabilities = distances.map((d, idx) => ({
    speciesId: d.species.id,
    name: `${d.species.scientificName} (${d.species.commonName.en})`,
    probability: Number((negExp[idx] / sumExp).toFixed(4))
  }));

  const topMatch = distances[0];
  const runnerUp = distances[1];
  const topProb = probabilities[0].probability;
  const margin = topProb - (runnerUp ? probabilities[1].probability : 0);

  // 4. Abstention logic for low confidence or narrow margin
  // Asymmetric safety rule: a "harmless" label is far more dangerous when wrong than a "venomous" one.
  // Harmless predictions are only allowed when the TOTAL probability mass on venomous species is small.
  const venomousMass = distances.reduce((acc, d, idx) => acc + (d.species.isVenomous ? negExp[idx] / sumExp : 0), 0);
  const lowConfidenceHarmless = !topMatch.species.isVenomous && venomousMass > HARMLESS_MAX_VENOM_MASS;
  const isAbstained = topProb < 0.22 || margin < 0.03 || lowConfidenceHarmless;
  const abstentionReason = isAbstained 
    ? (lowConfidenceHarmless && topProb >= 0.22 && margin >= 0.03
        ? `Best visual match is a harmless species, but ${(venomousMass * 100).toFixed(1)}% of the probability mass falls on venomous species; a venomous snake cannot be excluded.`
        : `Confidence below decision threshold (${(topProb * 100).toFixed(1)}%) or close tie with ${runnerUp.species.scientificName}. High morphological overlap.`)
    : undefined;

  // 5. Medical Triage Category
  let triageCategory: ClassificationResult['triageCategory'];
  let urgencyLevel: TriageUrgency;

  if (isAbstained) {
    triageCategory = 'Uncertain / Abstain';
    urgencyLevel = 'OBSERVATION_HIGH';
  } else if (topMatch.species.family === 'Viperidae') {
    triageCategory = 'Viperidae (Hemotoxic)';
    urgencyLevel = 'EMERGENCY_VIPERID';
  } else if (topMatch.species.family === 'Elapidae') {
    triageCategory = 'Elapidae (Neurotoxic)';
    urgencyLevel = 'EMERGENCY_ELAPID';
  } else {
    triageCategory = 'Non-venomous / Colubrid';
    urgencyLevel = 'OBSERVATION_LOW';
  }

  // 6. Clinical Invariant Safety Disclaimer
  const clinicalSafetyDisclaimer = topMatch.species.isVenomous
    ? `Visual classifier suggests venomous ${topMatch.species.family}. Prepare 20WBCT test immediately. Antivenom is dictated solely by objective coagulopathy or neurotoxic signs.`
    : `Visual classifier suggests morphologically harmless species (${topMatch.species.commonName.en}). WARNING: Visual appearance NEVER excludes envenomation from an unseen co-occurring venomous bite or dry bite mimicked envenoming. Minimum 24-hour hospital observation mandatory.`;

  return {
    topSpecies: topMatch.species,
    predictedClass: topMatch.species.scientificName,
    confidence: Number(topProb.toFixed(3)),
    isAbstained,
    abstentionReason,
    probabilities,
    triageCategory,
    urgencyLevel,
    clinicalSafetyDisclaimer,
    features
  };
}

/**
 * Wilson Score Confidence Interval calculation for binomial proportions (Fixes Bug 13).
 * Given k successes out of n trials, calculates the 95% Wilson score interval [lower, upper].
 */
export function calculateWilsonInterval(k: number, n: number, confidenceLevel = 0.95): { lower: number; upper: number; pointEstimate: number } {
  if (n <= 0) return { lower: 0, upper: 0, pointEstimate: 0 };
  
  const p = k / n;
  // z-score for 95% is ~1.95996
  const z = confidenceLevel === 0.95 ? 1.95996 : 1.64485;
  const z2 = z * z;

  const denominator = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denominator;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denominator;

  return {
    pointEstimate: Number(p.toFixed(4)),
    lower: Number(Math.max(0, center - margin).toFixed(4)),
    upper: Number(Math.min(1, center + margin).toFixed(4))
  };
}
