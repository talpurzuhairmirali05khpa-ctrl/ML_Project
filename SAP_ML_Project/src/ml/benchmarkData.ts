import { calculateWilsonInterval } from './classicalModels';
import evalData from './trainedEval.json';
import { getSpeciesById } from '../data/speciesData';

export interface BenchmarkMetrics {
  totalSamples: number;
  speciesCorrect: number;
  speciesAccuracy: number;
  speciesWilsonCI: { lower: number; upper: number; pointEstimate: number };
  triageCorrect: number;
  triageAccuracy: number;
  triageWilsonCI: { lower: number; upper: number; pointEstimate: number };
  macroF1: number;
  isSimulatedSynthetic: boolean;
  disclosureStatement: string;
}

// ---------------------------------------------------------------------------
// REAL held-out evaluation of the trained CNN (src/ml/trainedEval.json, produced by tools/train).
// The test split (20%, duplicate-grouped, never used for training, calibration or threshold selection)
// comes from arjun921/Indian-Snakes-Dataset. These are photographs, not simulations.
// ---------------------------------------------------------------------------
const T = evalData.test;
export const CONFUSION_MATRIX: number[][] = T.confusion;
export const CONFUSION_MATRIX_8X8 = CONFUSION_MATRIX; // legacy export name (now NxN, N = number of trained species)
export const TRIAGE_CONFUSION_MATRIX: number[][] = T.triageConfusion;

const speciesCorrect = CONFUSION_MATRIX.reduce((a, row, i) => a + row[i], 0);
const triageCorrect = TRIAGE_CONFUSION_MATRIX.reduce((a, row, i) => a + row[i], 0);

export const EVALUATION_METRICS: BenchmarkMetrics = {
  totalSamples: T.n,
  speciesCorrect,
  speciesAccuracy: Number((speciesCorrect / T.n).toFixed(4)),
  speciesWilsonCI: calculateWilsonInterval(speciesCorrect, T.n, 0.95),
  triageCorrect,
  triageAccuracy: Number((triageCorrect / T.n).toFixed(4)),
  triageWilsonCI: calculateWilsonInterval(triageCorrect, T.n, 0.95),
  macroF1: Number(T.macroF1.toFixed(4)),
  isSimulatedSynthetic: false,
  disclosureStatement:
    `HELD-OUT TEST RESULTS on ${T.n} real photographs (${evalData.classes.length} species) never seen in training, calibration or threshold selection. ` +
    `Training used ${evalData.trainN} images. Limitations: images were scraped from the web (not clinical field photos), duplicates were grouped to avoid leakage but ` +
    `near-duplicates may remain, only ${evalData.classes.length} species are covered, and rare species have very few test images (wide uncertainty). ` +
    `With the safety policy, ${T.venomousAsHarmless} of ${T.venomousTotal} venomous test photos were still accepted as a harmless species. ` +
    `Not validated prospectively. Clinical antivenom decisions must rely on bedside 20WBCT and physical examination, never on this classifier.`
};

export const SPECIES_CLASSES = evalData.classes.map(id => getSpeciesById(id)?.scientificName ?? id);

export const TRIAGE_CLASSES = [
  "Viperidae (Hemotoxic)",
  "Elapidae (Neurotoxic)",
  "Colubridae / Non-venomous"
];

export const PER_CLASS_METRICS = evalData.classes.map((id, i) => ({
  speciesId: id,
  name: getSpeciesById(id)?.scientificName ?? id,
  precision: T.precision[i], recall: T.recall[i], support: T.support[i]
}));

export const OPERATING_POINT = {
  coverage: T.coverage,
  accuracyOnAccepted: T.accOnAccepted,
  venomousAcceptedAsHarmless: T.venomousAsHarmless,
  venomousTotal: T.venomousTotal
};

// Coverage vs accuracy on the held-out test set: keep only predictions whose top probability >= threshold
export const REJECTION_CURVE = T.rejectionCurve;

export const DATASET_ROADMAP = {
  currentStage: "Phase 2: transfer-learning CNN trained on a public Indian snake image dataset (13 species)",
  targetDatasets: [
    {
      name: "SnakeCLEF / LifeCLEF (AIcrowd / Kaggle)",
      coverage: "1,600+ snake species with geospatial and country metadata",
      utility: "Much larger, geo-filtered training set; would add Pakistani species missing here (e.g. Eryx johnii, Platyceps ventromaculatus, Telescopus rhinopoma)"
    },
    {
      name: "iNaturalist Research-Grade Observations (via GBIF)",
      coverage: "Over 8,000 geotagged observations across South Asia",
      utility: "Validating wild natural lighting, sub-adult morphology, and seasonal polymorphism with field-quality photos"
    },
    {
      name: "WHO Venomous Snakes Database & Reptile Database",
      coverage: "Definitive taxonomy, regional venom proteomes, and antivenom cross-reactivity mapping",
      utility: "Authoritative ground truth for medical significance classification"
    }
  ]
};
