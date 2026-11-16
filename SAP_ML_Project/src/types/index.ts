export type Language = 'en' | 'ur' | 'sd';

export type SnakeFamily = 'Viperidae' | 'Elapidae' | 'Colubridae' | 'Boidae' | 'Pythonidae';

export type VenomCategory = 'Hemotoxic' | 'Neurotoxic' | 'Cytotoxic' | 'Non-venomous' | 'Mildly venomous';

export type TriageUrgency = 
  | 'EMERGENCY_VIPERID' 
  | 'EMERGENCY_ELAPID' 
  | 'OBSERVATION_HIGH' 
  | 'OBSERVATION_LOW';

export interface SnakeSpecies {
  id: string;
  scientificName: string;
  commonName: {
    en: string;
    ur: string;
    sd: string;
  };
  localNames: {
    en: string;
    ur: string;
    sd: string;
  };
  family: SnakeFamily;
  venomCategory: VenomCategory;
  isVenomous: boolean;
  medicalSignificance: 'High' | 'Moderate' | 'Non-significant';
  description: {
    en: string;
    ur: string;
    sd: string;
  };
  keyFeatures: {
    scales: string;
    head: string;
    bodyPattern: string;
    pupil: string;
  };
  habitat: string[];
  pakistanDistribution: {
    provinces: string[];
    districts: string[];
    riskSeason: string;
  };
  titerRequirements: {
    nihTiter: string;
    antivenomAvailable: boolean;
  };
  prototypeVector?: number[]; // LEGACY 28-D hand-set prototype (untrained baseline only; not used by the CNN classifier)
  trainedInModel?: boolean; // true if the CNN was trained on real images of this species
  sampleImageUrl?: string;
}

export interface ExtractedFeatures {
  vector: number[];
  colorHistH: number[]; // 8 bins
  colorHistS: number[]; // 4 bins
  colorHistV: number[]; // 4 bins
  colorMoments: { meanR: number; meanG: number; meanB: number; stdLum: number }; // 4 values
  hogTexture: number[]; // 8 bins
  patternEntropy: number; // 0.0 - 1.0
  scaleRoughness: number; // 0.0 - 1.0
  isSnake: boolean;
  oodScore: number;
  rejectionReason?: string;
}

export interface ClassificationResult {
  topSpecies: SnakeSpecies;
  predictedClass: string;
  confidence: number; // calibrated 0.0 - 1.0
  isAbstained: boolean;
  abstentionReason?: string;
  probabilities: { speciesId: string; name: string; probability: number }[];
  triageCategory: 'Viperidae (Hemotoxic)' | 'Elapidae (Neurotoxic)' | 'Non-venomous / Colubrid' | 'Uncertain / Abstain';
  urgencyLevel: TriageUrgency;
  clinicalSafetyDisclaimer: string;
  features: ExtractedFeatures;
}

export interface PatientProfile {
  ageYears: number;
  weightKg: number;
  isPregnant: boolean;
  priorAntivenomReaction: boolean;
  timeSinceBiteHours: number;
  biteLocation: 'foot_ankle' | 'hand_wrist' | 'leg' | 'arm' | 'trunk_head';
  circumstance: 'nocturnal_sleeping' | 'daytime_agriculture' | 'handling_clearing' | 'other';
}

export interface ClinicalSymptoms {
  twentyMinWBCTClotted: 'clotted' | 'unclotted' | 'pending'; // 20WBCT test
  systemicBleeding: boolean; // gingival, epistaxis, hematemesis, hematuria, ecchymosis
  localSwelling: 'none' | 'mild_confined' | 'moderate_limb' | 'severe_cross_joint';
  blisteringNecrosis: boolean;
  bilateralPtosis: boolean;
  ophthalmoplegia: boolean;
  bulbarPalsy: boolean; // swallowing difficulty, dysarthria
  respiratoryDistress: boolean;
  clinicalShock: boolean; // SBP < 90 mmHg or cold peripheries
  oliguriaAnuria: boolean; // urine output < 400 mL/day or tea-colored urine
  inr?: number;
  plateletCount?: number;
  creatinineMgDl?: number;
}

export interface ClinicalTriageEvaluation {
  antivenomIndicated: boolean; // Strict boolean invariant
  syndromeTitle: string;
  syndromeCategory: 'Neurotoxic' | 'Hemotoxic' | 'Severe Systemic' | 'Severe Local' | 'Observation';
  urgencyLevel: 'CRITICAL_IMMEDIATE' | 'HIGH_URGENT' | 'MONITOR_INPATIENT' | 'SAFE_OBSERVE_24H';
  triageLabel: string;       // human-readable tier, e.g. "RED — Resuscitate & give antivenom NOW"
  priorityActions: string[]; // syndrome-specific "do first" list (max 5)
  primaryIndications: string[];
  contraindicationsWarnings: string[];
  recommendedAntivenom: {
    productName: string;
    manufacturer: string;
    initialDoseVials: number;
    initialVolumeMl: number;
    infusionProtocol: string;
    monitoringSchedule: string;
  };
  adrenalinePrecautionMandatory: boolean;
  adrenalineDoseProtocol: string;
  supportiveCareActions: string[];
  referralRecommendation?: string;
  citationNotes: string[];
}

export interface AntivenomProduct {
  id: string;
  tradeName: string;
  manufacturer: string;
  countryOfOrigin: string;
  type: 'Polyvalent' | 'Monovalent';
  form: 'Liquid' | 'Lyophilized' | 'Liquid & Lyophilized' | 'Liquid & Lyophilized (Freeze-dried)';
  neutralizationTiters: {
    daboiaRusselii: string; // mg/mL
    echisCarinatus: string;
    najaNaja: string;
    bungarusCaeruleus: string;
  };
  storageRequirements: string;
  shelfLife: string;
  primaryCitations: { title: string; source: string; url?: string }[];
  knownEfficacyGaps: string[];
  approximatePricePkr: string;
  adverseReactionRateObserved: string;
}
