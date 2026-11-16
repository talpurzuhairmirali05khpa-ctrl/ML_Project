import { ClinicalSymptoms, PatientProfile, ClinicalTriageEvaluation } from '../types';

/**
 * WHO SEARO & Pakistan NIH National Clinical Decision Support Engine.
 * 
 * Strict Invariants:
 * 1. antivenomIndicated is ALWAYS an explicit boolean (true | false), never undefined.
 * 2. Any presence of systemic coagulopathy, neurotoxicity, shock, or acute renal failure
 *    MUST NEVER be classified as 'Non-venomous' or 'Dry bite'.
 * 3. Severe local blistering/necrosis is recognized as Severe Local Envenoming, NOT dry bite.
 * 4. Boundary conditions: INR >= 1.5 triggers coagulopathy; Platelets <= 100,000 triggers thrombocytopenia.
 */

export function evaluateClinicalTriage(
  symptoms: Partial<ClinicalSymptoms>,
  profile?: Partial<PatientProfile>
): ClinicalTriageEvaluation {
  const inputWarnings: string[] = [];

  // Sanitise lab values: non-finite / physiologically impossible values are ignored (and flagged), never silently used.
  let inrVal: number | undefined = symptoms.inr;
  if (inrVal !== undefined && (!Number.isFinite(inrVal) || inrVal <= 0 || inrVal > 20)) {
    inputWarnings.push(`Input check: INR value (${inrVal}) is not physiologically plausible and was IGNORED. Re-enter the lab value.`);
    inrVal = undefined;
  }
  let plateletVal: number | undefined = symptoms.plateletCount;
  if (plateletVal !== undefined && (!Number.isFinite(plateletVal) || plateletVal < 0 || plateletVal > 2_000_000)) {
    inputWarnings.push(`Input check: platelet count (${plateletVal}) is not plausible and was IGNORED. Platelets must be entered in cells/µL (e.g. 150000).`);
    plateletVal = undefined;
  } else if (plateletVal !== undefined && plateletVal > 0 && plateletVal < 1000) {
    // Lab reports commonly use x10^3/uL (e.g. 150). Treat small numbers as x10^3/uL instead of a catastrophic count.
    inputWarnings.push(`Unit check: platelet value ${plateletVal} was interpreted as ×10³/µL (= ${(plateletVal * 1000).toLocaleString()} /µL). If you meant cells/µL or lakh/µL, re-enter in cells/µL.`);
    plateletVal = plateletVal * 1000;
  }
  let creatinineVal: number | undefined = symptoms.creatinineMgDl;
  if (creatinineVal !== undefined && (!Number.isFinite(creatinineVal) || creatinineVal < 0 || creatinineVal > 30)) {
    inputWarnings.push(`Input check: creatinine (${creatinineVal}) is not plausible and was IGNORED (mg/dL expected).`);
    creatinineVal = undefined;
  }

  const s: ClinicalSymptoms = {
    twentyMinWBCTClotted: symptoms.twentyMinWBCTClotted || 'pending',
    systemicBleeding: Boolean(symptoms.systemicBleeding),
    localSwelling: symptoms.localSwelling || 'none',
    blisteringNecrosis: Boolean(symptoms.blisteringNecrosis),
    bilateralPtosis: Boolean(symptoms.bilateralPtosis),
    ophthalmoplegia: Boolean(symptoms.ophthalmoplegia),
    bulbarPalsy: Boolean(symptoms.bulbarPalsy),
    respiratoryDistress: Boolean(symptoms.respiratoryDistress),
    clinicalShock: Boolean(symptoms.clinicalShock),
    oliguriaAnuria: Boolean(symptoms.oliguriaAnuria),
    inr: inrVal,
    plateletCount: plateletVal,
    creatinineMgDl: creatinineVal
  };

  const p: PatientProfile = {
    ageYears: profile?.ageYears ?? 30,
    weightKg: profile?.weightKg ?? 65,
    isPregnant: Boolean(profile?.isPregnant),
    priorAntivenomReaction: Boolean(profile?.priorAntivenomReaction),
    timeSinceBiteHours: profile?.timeSinceBiteHours ?? 2,
    biteLocation: profile?.biteLocation ?? 'foot_ankle',
    circumstance: profile?.circumstance ?? 'daytime_agriculture'
  };

  const indications: string[] = [];
  const warnings: string[] = [];
  const supportiveCare: string[] = [];
  const citations: string[] = [
    "National Clinical Guidelines for the Management of Snakebites in Pakistan (NIH Islamabad, 2021)",
    "WHO Guidelines for the Management of Snakebites in South-East Asia (2nd Edition, 2016)",
    "Warrell DA. Snake bite. Lancet 2010; 375: 77-88."
  ];

  // 1. Coagulopathy / Hemotoxicity Checks (Fix boundary conditions: INR >= 1.5, Platelets <= 100000)
  const is20WBCTUnclotted = s.twentyMinWBCTClotted === 'unclotted';
  const isElevatedINR = typeof s.inr === 'number' && s.inr >= 1.5;
  const isThrombocytopenic = typeof s.plateletCount === 'number' && s.plateletCount <= 100000;
  
  const hasHemotoxicSigns = is20WBCTUnclotted || s.systemicBleeding || isElevatedINR || isThrombocytopenic;

  if (is20WBCTUnclotted) {
    indications.push("20-Minute Whole Blood Clotting Test (20WBCT) unclotted: Confirms consumptive venom-induced coagulopathy (VICC).");
  }
  if (s.systemicBleeding) {
    indications.push("Spontaneous systemic hemorrhage detected (gingival, epistaxis, or hematuria).");
  }
  if (isElevatedINR) {
    indications.push(`Markedly elevated INR (${s.inr} >= 1.5 reference threshold): Severe prothrombin defect.`);
  }
  if (isThrombocytopenic) {
    indications.push(`Thrombocytopenia (${s.plateletCount?.toLocaleString()} /µL <= 100,000 threshold): Venom-induced platelet consumption.`);
  }

  // 2. Neurotoxicity Checks
  const hasNeurotoxicSigns = s.bilateralPtosis || s.ophthalmoplegia || s.bulbarPalsy || s.respiratoryDistress;

  if (s.bilateralPtosis) {
    indications.push("Bilateral ptosis (drooping eyelids): Earliest objective hallmark of elapid neurotoxicity.");
  }
  if (s.ophthalmoplegia) {
    indications.push("External ophthalmoplegia: Impaired extraocular muscle mobility.");
  }
  if (s.bulbarPalsy) {
    indications.push("Bulbar muscle involvement (difficulty swallowing secretions, dysphonia, tongue weakness).");
  }
  if (s.respiratoryDistress) {
    indications.push("CRITICAL: Paradoxical diaphragmatic breathing / impending respiratory muscle paralysis.");
  }

  // 3. Hemodynamic & Renal Checks (Fix Bug 7: Shock or Oliguria must be severe systemic)
  const hasShock = s.clinicalShock;
  const hasRenalFailure = s.oliguriaAnuria || (typeof s.creatinineMgDl === 'number' && s.creatinineMgDl >= 1.4);

  if (hasShock) {
    indications.push("Hemodynamic collapse / Clinical shock (hypotension, peripheral vasoconstriction, thready pulse).");
  }
  if (hasRenalFailure) {
    indications.push("Acute Kidney Injury (oliguria < 400 mL/day or elevated serum creatinine): Common in Russell's Viper envenoming.");
  }

  // 4. Local Envenoming Checks (Fix Bug 7: Blistering / necrosis is Severe Local Envenoming, NOT dry bite)
  const isSevereLocal = s.localSwelling === 'severe_cross_joint' || (s.localSwelling === 'moderate_limb' && s.blisteringNecrosis);
  const hasLocalNecrosis = s.blisteringNecrosis;
  const hasProgressingLocal = s.localSwelling === 'moderate_limb' && !isSevereLocal;

  if (hasLocalNecrosis) {
    indications.push("Marked blistering / tissue necrosis at bite site: Characteristic of cytotoxic/hemotoxic envenoming.");
  }
  if (s.localSwelling === 'severe_cross_joint') {
    indications.push("Rapidly progressive edema extending across wrist/ankle into limb (> 50% bitten limb).");
  }

  // Strict Boolean Antivenom Indication Logic (Fix Bug 6: Always explicit boolean, never undefined)
  const antivenomIndicated: boolean = Boolean(
    hasHemotoxicSigns || 
    hasNeurotoxicSigns || 
    hasShock || 
    hasRenalFailure || 
    isSevereLocal
  );

  // Determine Syndrome Title & Category (Fix Bug 5: No venomous envenoming ever called Non-venomous)
  let syndromeTitle = "Observation — Suspected Non-Venomous or Dry Bite";
  let syndromeCategory: ClinicalTriageEvaluation['syndromeCategory'] = 'Observation';
  let urgencyLevel: ClinicalTriageEvaluation['urgencyLevel'] = 'MONITOR_INPATIENT';

  if (hasNeurotoxicSigns && hasHemotoxicSigns) {
    syndromeTitle = "Mixed Envenomation Syndrome (Concurrent Neurotoxic + Consumptive Coagulopathy)";
    syndromeCategory = 'Severe Systemic';
    urgencyLevel = 'CRITICAL_IMMEDIATE';
  } else if (hasNeurotoxicSigns) {
    syndromeTitle = s.respiratoryDistress 
      ? "Impending Respiratory Arrest (Severe Elapid Neurotoxicity)"
      : "Flaccid Neuromuscular Paralysis (Elapid Neurotoxicity — Cobra or Krait)";
    syndromeCategory = 'Neurotoxic';
    urgencyLevel = 'CRITICAL_IMMEDIATE';
  } else if (hasHemotoxicSigns) {
    syndromeTitle = "Venom-Induced Consumptive Coagulopathy (VICC — Viperidae)";
    syndromeCategory = 'Hemotoxic';
    urgencyLevel = 'CRITICAL_IMMEDIATE';
  } else if (hasShock || hasRenalFailure) {
    // Fix Bug 7: Shock or oliguria is severe systemic envenoming
    syndromeTitle = hasShock && hasRenalFailure ? "Severe Systemic Envenoming with Hemodynamic Shock and Acute Kidney Injury"
      : hasShock ? "Severe Systemic Envenoming with Hemodynamic Shock"
      : "Severe Systemic Envenoming with Acute Kidney Injury (Oliguria / Raised Creatinine)";
    syndromeCategory = 'Severe Systemic';
    urgencyLevel = 'CRITICAL_IMMEDIATE';
  } else if (hasLocalNecrosis || isSevereLocal) {
    // Fix Bug 7: Blistering / necrosis is Severe Local Envenoming
    syndromeTitle = "Severe Local Envenoming with Tissue Necrosis Risk";
    syndromeCategory = 'Severe Local';
    urgencyLevel = 'HIGH_URGENT';
  } else if (hasProgressingLocal) {
    syndromeTitle = "Significant Local Swelling Without Systemic Signs — Observe for Progression (Not Safe to Discharge)";
    syndromeCategory = 'Observation';
    urgencyLevel = 'HIGH_URGENT';
  } else if (s.twentyMinWBCTClotted === 'pending') {
    syndromeTitle = "Equivocal — Pending 20-Minute Clotting Test Evaluation";
    syndromeCategory = 'Observation';
    urgencyLevel = 'MONITOR_INPATIENT';
  } else if (p.timeSinceBiteHours < 6 || p.circumstance === 'nocturnal_sleeping') {
    // Absence of signs this early (or after a nocturnal bite, the classic krait setting) does NOT mean safe.
    syndromeTitle = "No Signs of Envenoming YET — Envenoming NOT Excluded (Early Presentation / Possible Krait Bite)";
    syndromeCategory = 'Observation';
    urgencyLevel = 'MONITOR_INPATIENT';
  } else {
    syndromeTitle = "No Systemic or Severe Local Envenoming Detected (Possible Dry Bite or Non-Venomous)";
    syndromeCategory = 'Observation';
    urgencyLevel = 'SAFE_OBSERVE_24H';
  }

  // Dosage Calculation per Pakistan NIH National Guidelines
  // Initial standard dose: 20-50 mL (2 to 5 vials of NIH polyvalent). In severe shock/respiratory failure: 5-10 vials.
  let initialVials = 0;
  if (antivenomIndicated) {
    if (s.respiratoryDistress || hasShock || (hasHemotoxicSigns && hasNeurotoxicSigns)) {
      initialVials = 5; // 50 mL initial loading dose
    } else if (hasHemotoxicSigns || hasNeurotoxicSigns) {
      initialVials = 3; // 30 mL standard loading dose
    } else {
      initialVials = 2; // 20 mL local extension loading dose
    }
  }

  const initialVolumeMl = initialVials * 10;

  // ---- Graded triage tier (design rule, needs clinician review) ----
  // RED    = any neurotoxic sign (paralysis can progress to respiratory failure within hours), shock, or spontaneous
  //          systemic bleeding -> resuscitate AND give antivenom immediately
  // ORANGE = antivenom indicated without those threats (isolated coagulopathy on tests, renal injury, severe local swelling)
  //          -> antivenom now with close monitoring
  const airwayThreat = Boolean(s.respiratoryDistress || s.bulbarPalsy);
  const isCritical = Boolean(hasShock || hasNeurotoxicSigns || s.systemicBleeding);
  if (antivenomIndicated) urgencyLevel = isCritical ? 'CRITICAL_IMMEDIATE' : 'HIGH_URGENT';

  const triageLabel =
    urgencyLevel === 'CRITICAL_IMMEDIATE' ? 'RED — Resuscitate & give antivenom NOW'
    : urgencyLevel === 'HIGH_URGENT' ? (antivenomIndicated ? 'ORANGE — Antivenom needed now; close monitoring' : 'ORANGE — Urgent senior review; antivenom not yet indicated')
    : urgencyLevel === 'MONITOR_INPATIENT' ? 'YELLOW — Admit; observe & repeat tests'
    : 'GREEN — Low risk; 24 h observation';

  // ---- Syndrome-specific "do first" list and monitoring schedule ----
  const priorityActions: string[] = [];
  if (hasShock) priorityActions.push("Treat shock now: 2 large-bore IV lines, crystalloid resuscitation, continuous BP monitoring. Exclude anaphylaxis (adrenaline IM if suspected) and concealed haemorrhage.");
  if (airwayThreat) priorityActions.push("AIRWAY FIRST: call senior/anaesthetic help, prepare intubation and ventilation now; respiratory failure can be imminent.");
  else if (hasNeurotoxicSigns) priorityActions.push("Early neurotoxicity: keep airway kit and bag-valve-mask at the bedside; paralysis can progress within hours.");
  if (antivenomIndicated) priorityActions.push("Give polyvalent antivenom now (initial dose below) with adrenaline drawn up and ready.");
  if (hasNeurotoxicSigns) priorityActions.push("Atropine-neostigmine trial and hourly neuro/respiratory checks (see supportive care).");
  if (hasHemotoxicSigns) priorityActions.push("Bleeding precautions: NO intramuscular injections or arterial punctures; compress bleeding sites; blood products only for life-threatening bleeding.");
  if (hasRenalFailure) priorityActions.push("Protect the kidneys: Foley catheter, strict hourly urine output, avoid NSAIDs/aminoglycosides.");
  if (isSevereLocal || hasLocalNecrosis) priorityActions.push("Local envenoming: elevate limb, mark the swelling margin hourly, check limb pulses/compartments; surgery only for proven compartment syndrome.");
  if (!antivenomIndicated) priorityActions.push("No antivenom indication yet: admit, repeat 20WBCT serially and re-examine for ptosis, bleeding and swelling progression.");

  const monitoringParts: string[] = [];
  if (hasShock || hasRenalFailure) monitoringParts.push("BP, pulse and urine output hourly");
  if (hasNeurotoxicSigns) monitoringParts.push("neuro/respiratory check every 15-30 min for the first hour, then hourly (ptosis, single-breath count, neck flexion)");
  if (hasHemotoxicSigns && antivenomIndicated) monitoringParts.push("repeat 20WBCT 6 h after antivenom (re-dose if still unclotted)");
  if (isSevereLocal || hasLocalNecrosis) monitoringParts.push("mark swelling edge and check limb perfusion hourly");
  const monitoringSchedule = monitoringParts.length > 0
    ? "Monitoring: " + monitoringParts.join("; ") + "."
    : "Monitoring: serial 20WBCT every 3 h for the first 12 h, then 6-hourly to 24 h; repeat neuro and bleeding examination.";

  // Carrier fluid: 5-10 mL/kg, capped at the adult 250-500 mL range.
  const carrierLow = Math.max(10, Math.round(Math.min(250, 5 * p.weightKg) / 10) * 10);
  const carrierHigh = Math.max(carrierLow, Math.round(Math.min(500, 10 * p.weightKg) / 10) * 10);
  const isChild = p.ageYears < 12 || p.weightKg < 40;
  const adrenalineMg = isChild ? Math.min(0.5, Math.round(0.01 * p.weightKg * 100) / 100) : 0.5;
  const adrenalineDoseText = isChild
    ? `Draw ${adrenalineMg} mg (${adrenalineMg} mL of 1:1000) Adrenaline (0.01 mg/kg, max 0.5 mg) into a 1 mL syringe and place at bedside before initiating antivenom infusion. At the first sign of anaphylaxis (urticaria, wheeze, stridor, hypotension), inject ${adrenalineMg} mg Intramuscularly into the anterolateral thigh.`
    : `Draw 0.5 mg (0.5 mL of 1:1000) Adrenaline into a 1 mL syringe and place at bedside before initiating antivenom infusion. At the first sign of anaphylaxis (urticaria, wheeze, stridor, hypotension), inject 0.5 mg Intramuscularly into the anterolateral thigh.`;

  // Pediatric weight adjustment rule (WHO rule: Children receive SAME antivenom vial dose as adults)
  if (p.weightKg < 20) {
    warnings.push("Pediatric rule (WHO): Snakes inject the SAME quantity of venom regardless of victim weight. Do NOT reduce antivenom vial count for children! Adjust only the carrier fluid volume (5-10 mL/kg isotonic saline) to avoid volume overload.");
  }

  if (s.twentyMinWBCTClotted !== 'unclotted' && p.timeSinceBiteHours < 6 && !antivenomIndicated) {
    warnings.push("Early-presentation warning: a normal/pending 20WBCT less than 6 hours after the bite does NOT exclude envenoming. Repeat the 20WBCT at 6 h post-bite and re-examine for ptosis/bleeding.");
  }
  if (antivenomIndicated) {
    warnings.push("Dose verification required: the initial vial count shown is a conservative software estimate. Confirm the initial dose against the national protocol and the potency printed on the vial in use; severe/progressive cases may need more vials.");
  }
  inputWarnings.forEach(w => warnings.unshift(w));

  // Pregnancy consideration
  if (p.isPregnant) {
    warnings.push("Pregnancy alert: Snakebite envenoming causes maternal coagulopathy, placental abruption, and fetal death. Antivenom is NOT contraindicated in pregnancy; prompt administration saves both mother and fetus.");
  }

  // Prior ASV reaction
  if (p.priorAntivenomReaction) {
    warnings.push("Prior adverse reaction reported: Heightened risk of severe anaphylaxis. Pre-treat per local protocol (adults: 0.25 mg SC Adrenaline 1:1000; children: weight-adjusted dose; plus IV Hydrocortisone + H1 antihistamine) immediately before ASV infusion.");
  }

  // Supportive Care Guidance
  if (syndromeCategory === 'Neurotoxic') {
    supportiveCare.push("Airway & Ventilation: Keep endotracheal intubation tray and bag-valve-mask (Ambu bag) ready at bedside.");
    supportiveCare.push(isChild
      ? `Atropine-Neostigmine Trial (child, weight-based): Atropine ${(0.02 * p.weightKg).toFixed(2)} mg IV (0.02 mg/kg) followed by Neostigmine ${(0.04 * p.weightKg).toFixed(2)} mg IM (0.04 mg/kg). Verify against local protocol. If ptosis improves within 30 min, repeat every 30-60 min.`
      : "Atropine-Neostigmine Trial: For suspected Cobra envenomation (postsynaptic), administer Atropine 0.6 mg IV followed by Neostigmine 1.5 mg IV/IM. If ptosis improves within 30 min, repeat every 30-60 min.");
    supportiveCare.push("Monitor single-breath count and neck flexor strength hourly.");
  }

  if (syndromeCategory === 'Hemotoxic' || is20WBCTUnclotted) {
    supportiveCare.push("Repeat 20WBCT strictly at 6 hours post-antivenom. If blood remains unclotted at 6h, repeat antivenom dose.");
    supportiveCare.push("AVOID intramuscular injections (risk of massive hematoma). Use oral or gentle IV access only.");
    supportiveCare.push("Keep blood products (Fresh Frozen Plasma, Platelets) on standby ONLY for severe hemorrhage unresponsive to antivenom.");
  }

  if (hasRenalFailure || s.oliguriaAnuria) {
    supportiveCare.push("Insert Foley catheter to measure strict hourly urine output (target > 0.5 mL/kg/h).");
    supportiveCare.push("Avoid nephrotoxic agents (NSAIDs, aminoglycosides). If anuria persists > 24 hours, prepare for hemodialysis.");
  }

  if (hasLocalNecrosis) {
    supportiveCare.push("Elevate the bitten limb to heart level to facilitate venous and lymphatic drainage.");
    supportiveCare.push("Administer Tetanus Toxoid booster (if not updated in last 5 years).");
    supportiveCare.push("Do NOT perform early surgical debridement or fasciotomy unless true compartment syndrome is verified with intracompartmental pressure > 30 mmHg.");
  }

  if (hasProgressingLocal) {
    supportiveCare.push("Mark the proximal edge of swelling with a pen and time; re-measure hourly. Spread across a joint or beyond ~50% of the limb within 48 h is an indication for antivenom.");
  }

  if (syndromeCategory === 'Observation') {
    supportiveCare.push("Admit to emergency observation ward for a mandatory 24-hour observation period.");
    supportiveCare.push("Perform serial 20WBCT every 3 hours for the first 12 hours to catch delayed coagulopathy.");
    supportiveCare.push("Check for nocturnal Krait signs: examine patient at dawn for subtle ptosis or morning respiratory weakness.");
  }

  // Circumstance context (Fix Bug 9: Supportive context, not rigid rule)
  if (p.circumstance === 'nocturnal_sleeping') {
    warnings.push("Circumstantial hint: Nocturnal bite while sleeping on floor or mat strongly correlates with Common Krait (Bungarus caeruleus) or Sindh Krait (B. sindanus). Local signs are characteristically absent. Maintain high suspicion for morning respiratory arrest.");
  } else if (p.circumstance === 'daytime_agriculture') {
    warnings.push("Circumstantial hint: Daytime agricultural work in fields or burrows commonly encounters Cobras (Naja naja) or Saw-scaled Vipers (Echis carinatus). Correlate with local necrosis (Cobra) or bleeding (Echis).");
  }

  return {
    antivenomIndicated,
    syndromeTitle,
    syndromeCategory,
    urgencyLevel,
    triageLabel,
    priorityActions: priorityActions.slice(0, 5),
    primaryIndications: indications.length > 0 ? indications : ["No indication for antivenom administration at this stage."],
    contraindicationsWarnings: warnings,
    recommendedAntivenom: {
      productName: "NIH Polyvalent Anti-Snake Venom Serum (Liquid or Lyophilized)",
      manufacturer: "National Institutes of Health (NIH), Islamabad",
      initialDoseVials: initialVials,
      initialVolumeMl,
      infusionProtocol: initialVials > 0
        ? `Reconstitute and dilute ${initialVials} vials (${initialVolumeMl} mL) in ${carrierLow}-${carrierHigh} mL (5-10 mL/kg, max 500 mL) 0.9% Normal Saline or 5% Dextrose. ${isChild ? 'Infuse slowly over the first 10-15 minutes (rate scaled to the smaller carrier volume) while monitoring for anaphylaxis, then complete over 60 minutes.' : 'Infuse slowly at 2 mL/min for the first 10-15 minutes while monitoring for anaphylaxis, then complete over 60 minutes.'}`
        : "Withhold antivenom. Continue 20WBCT monitoring every 3 hours.",
      monitoringSchedule
    },
    adrenalinePrecautionMandatory: antivenomIndicated,
    adrenalineDoseProtocol: "MANDATORY SAFETY PROTOCOL: " + adrenalineDoseText,
    supportiveCareActions: supportiveCare,
    citationNotes: citations
  };
}
