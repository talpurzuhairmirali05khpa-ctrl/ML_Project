import React, { useState } from 'react';
import { 
  Activity, Clock, Syringe, AlertTriangle, CheckCircle2, AlertCircle, 
  HeartPulse, ShieldAlert, Droplets, User, FileText, ChevronRight, RefreshCw, Send
} from 'lucide-react';
import { ClinicalSymptoms, PatientProfile, ClinicalTriageEvaluation, SnakeSpecies, Language } from '../types';
import { evaluateClinicalTriage } from '../clinical/clinicalEngine';
import { TRANSLATIONS } from '../i18n/translations';

interface ClinicalAssessmentSectionProps {
  lang: Language;
  suspectedSpecies?: SnakeSpecies | null;
}

export const ClinicalAssessmentSection: React.FC<ClinicalAssessmentSectionProps> = ({
  lang,
  suspectedSpecies
}) => {
  const t = TRANSLATIONS[lang];

  // Symptoms State
  const [twentyMinWBCT, setTwentyMinWBCT] = useState<ClinicalSymptoms['twentyMinWBCTClotted']>('pending');
  const [systemicBleeding, setSystemicBleeding] = useState<boolean>(false);
  const [localSwelling, setLocalSwelling] = useState<ClinicalSymptoms['localSwelling']>('mild_confined');
  const [blisteringNecrosis, setBlisteringNecrosis] = useState<boolean>(false);
  
  // Neurotoxic signs
  const [bilateralPtosis, setBilateralPtosis] = useState<boolean>(false);
  const [ophthalmoplegia, setOphthalmoplegia] = useState<boolean>(false);
  const [bulbarPalsy, setBulbarPalsy] = useState<boolean>(false);
  const [respiratoryDistress, setRespiratoryDistress] = useState<boolean>(false);

  // Vitals & Organ status
  const [clinicalShock, setClinicalShock] = useState<boolean>(false);
  const [oliguriaAnuria, setOliguriaAnuria] = useState<boolean>(false);
  const [inrValue, setInrValue] = useState<string>('');
  const [plateletsValue, setPlateletsValue] = useState<string>('');
  const [plateletUnit, setPlateletUnit] = useState<'per_uL' | 'x10e3_per_uL' | 'lakh_per_uL'>('per_uL');
  const plateletFactor = plateletUnit === 'per_uL' ? 1 : plateletUnit === 'x10e3_per_uL' ? 1000 : 100000;
  const plateletsPerUl = plateletsValue !== '' && Number.isFinite(parseFloat(plateletsValue)) ? Math.round(parseFloat(plateletsValue) * plateletFactor) : undefined;
  const [creatinineValue, setCreatinineValue] = useState<string>('');

  // Patient Profile State
  const [age, setAge] = useState<number>(32);
  const [weightKg, setWeightKg] = useState<number>(65);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [priorAsvReaction, setPriorAsvReaction] = useState<boolean>(false);
  const [timeSinceBite, setTimeSinceBite] = useState<number>(3);
  const [biteLocation, setBiteLocation] = useState<PatientProfile['biteLocation']>('foot_ankle');
  const [circumstance, setCircumstance] = useState<PatientProfile['circumstance']>('daytime_agriculture');

  // Interactive 20WBCT Timer state
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(1200);

  // Compute evaluation
  const symptomsPayload: Partial<ClinicalSymptoms> = {
    twentyMinWBCTClotted: twentyMinWBCT,
    systemicBleeding,
    localSwelling,
    blisteringNecrosis,
    bilateralPtosis,
    ophthalmoplegia,
    bulbarPalsy,
    respiratoryDistress,
    clinicalShock,
    oliguriaAnuria,
    inr: inrValue ? parseFloat(inrValue) : undefined,
    plateletCount: plateletsPerUl,
    creatinineMgDl: creatinineValue ? parseFloat(creatinineValue) : undefined
  };

  const profilePayload: Partial<PatientProfile> = {
    ageYears: age,
    weightKg,
    isPregnant,
    priorAntivenomReaction: priorAsvReaction,
    timeSinceBiteHours: timeSinceBite,
    biteLocation,
    circumstance
  };

  const evaluation: ClinicalTriageEvaluation = evaluateClinicalTriage(symptomsPayload, profilePayload);

  // Visual style per triage tier (RED / ORANGE / YELLOW / GREEN)
  const TIER_STYLE: Record<ClinicalTriageEvaluation['urgencyLevel'], { box: string; icon: string; badge: string }> = {
    CRITICAL_IMMEDIATE: { box: 'bg-red-50 border-red-300 text-red-950', icon: 'bg-red-600', badge: 'bg-red-200 text-red-900' },
    HIGH_URGENT: { box: 'bg-orange-50 border-orange-300 text-orange-950', icon: 'bg-orange-500', badge: 'bg-orange-200 text-orange-900' },
    MONITOR_INPATIENT: { box: 'bg-amber-50 border-amber-300 text-amber-950', icon: 'bg-amber-500', badge: 'bg-amber-200 text-amber-900' },
    SAFE_OBSERVE_24H: { box: 'bg-emerald-50 border-emerald-300 text-emerald-950', icon: 'bg-emerald-600', badge: 'bg-emerald-200 text-emerald-900' }
  };
  const tier = TIER_STYLE[evaluation.urgencyLevel];

  // Timer effect
  React.useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeftSec > 0) {
      interval = setInterval(() => {
        setTimeLeftSec(prev => prev - 1);
      }, 1000);
    } else if (timeLeftSec === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeftSec]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner - High Contrast Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                WHO SEARO & Pakistan NIH Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                Bedside Algorithmic Triage
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.clinicalTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl font-medium">
              {t.clinicalSubtitle} Antivenom indication is determined strictly by objective systemic envenoming: non-clotting 20WBCT, cranial nerve ptosis, spontaneous bleeding, or shock.
            </p>
          </div>

          {suspectedSpecies && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shrink-0">
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Suspected from Visual Scan:</div>
              <div className="text-sm font-black text-emerald-700">{suspectedSpecies.scientificName}</div>
              <div className="text-xs text-slate-600 font-bold">{suspectedSpecies.commonName.en}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Clinical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Clinical Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card 1: 20WBCT Clotting Test */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 border border-red-200 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {t.twentyMinTestTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Diagnostic gold standard for consumptive coagulopathy (Viperidae)
                  </p>
                </div>
              </div>

              {/* 20 Min Timer Widget */}
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="font-mono text-xs font-black text-slate-900">
                  {formatTimer(timeLeftSec)}
                </span>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    timerRunning ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {timerRunning ? 'Pause' : 'Start 20m'}
                </button>
                <button
                  onClick={() => { setTimerRunning(false); setTimeLeftSec(1200); }}
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 3-State Radio Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  twentyMinWBCT === 'clotted'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="20wbct"
                    checked={twentyMinWBCT === 'clotted'}
                    onChange={() => setTwentyMinWBCT('clotted')}
                    className="accent-emerald-600"
                  />
                  <span className="text-xs font-black">{t.clottedStatus}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 pl-5 font-medium">
                  Firm clot forms in glass tube. No coagulopathy.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  twentyMinWBCT === 'unclotted'
                    ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="20wbct"
                    checked={twentyMinWBCT === 'unclotted'}
                    onChange={() => setTwentyMinWBCT('unclotted')}
                    className="accent-red-600"
                  />
                  <span className="text-xs font-black text-red-700">{t.unclottedStatus}</span>
                </div>
                <span className="text-[11px] text-red-700 mt-1 pl-5 font-bold">
                  ⚠️ Liquid blood tips out. Mandatory Antivenom!
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  twentyMinWBCT === 'pending'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="20wbct"
                    checked={twentyMinWBCT === 'pending'}
                    onChange={() => setTwentyMinWBCT('pending')}
                    className="accent-amber-600"
                  />
                  <span className="text-xs font-black">{t.pendingStatus}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 pl-5 font-medium">
                  Test currently waiting for 20m incubation.
                </span>
              </label>
            </div>
          </div>

          {/* Card 2: Neurotoxic Syndrome */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">
                {t.neuroSigns}
              </h3>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                Elapidae Signs
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 font-medium">
              Descending paralysis from Cobras & Kraits. Any single sign confirms systemic neurotoxicity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bilateralPtosis}
                  onChange={(e) => setBilateralPtosis(e.target.checked)}
                  className="mt-0.5 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900">Bilateral Ptosis (Drooping Eyelids)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Earliest and most reliable clinical neuro sign.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ophthalmoplegia}
                  onChange={(e) => setOphthalmoplegia(e.target.checked)}
                  className="mt-0.5 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900">External Ophthalmoplegia</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Inability to move eyes; diplopia.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulbarPalsy}
                  onChange={(e) => setBulbarPalsy(e.target.checked)}
                  className="mt-0.5 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900">Bulbar Palsy (Dysphagia/Speech)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pooling of saliva, nasal regurgitation.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={respiratoryDistress}
                  onChange={(e) => setRespiratoryDistress(e.target.checked)}
                  className="mt-0.5 rounded accent-red-600"
                />
                <div>
                  <span className="font-black text-red-900">Respiratory Paralysis / Distress</span>
                  <p className="text-[11px] text-red-700 mt-0.5 font-bold">Intercostal muscle failure; intubation required!</p>
                </div>
              </label>
            </div>
          </div>

          {/* Card 3: Hemorrhagic & Coagulation Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-2">
              {t.hemoSigns}
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemicBleeding}
                  onChange={(e) => setSystemicBleeding(e.target.checked)}
                  className="mt-0.5 rounded accent-red-600"
                />
                <div>
                  <span className="font-bold text-slate-900">Spontaneous Systemic Bleeding</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Gingival bleeding, hematuria, epistaxis, or hematemesis.</p>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    INR (International Normalized Ratio):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.8 (≥ 1.5 triggers ASV)"
                    value={inrValue}
                    onChange={(e) => setInrValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-hidden focus:bg-white focus:border-emerald-600 font-bold"
                  />
                  {parseFloat(inrValue) >= 1.5 && (
                    <span className="text-[11px] text-red-700 font-bold block mt-1">
                      ⚠️ INR ≥ 1.5: Severe coagulopathy confirmed!
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platelet Count:
                  </label>
                  <select
                    value={plateletUnit}
                    onChange={(e) => setPlateletUnit(e.target.value as typeof plateletUnit)}
                    className="w-full mb-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 text-xs font-bold"
                  >
                    <option value="per_uL">cells/µL (e.g. 150000)</option>
                    <option value="x10e3_per_uL">×10³/µL (e.g. 150)</option>
                    <option value="lakh_per_uL">lakh/µL (e.g. 1.5)</option>
                  </select>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Enter value in the unit chosen above"
                    value={plateletsValue}
                    onChange={(e) => setPlateletsValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-hidden focus:bg-white focus:border-emerald-600 font-bold"
                  />
                  {plateletsPerUl !== undefined && plateletsPerUl <= 100000 && (
                    <span className="text-[11px] text-red-700 font-bold block mt-1">
                      ⚠️ Platelets ≤ 100,000: Thrombocytopenia!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Local Swelling & Blistering */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-2">
              Local Tissue Envenoming & Progression
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Limb Edema Extent:</label>
                <select
                  value={localSwelling}
                  onChange={(e) => setLocalSwelling(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-hidden focus:bg-white"
                >
                  <option value="none">No swelling / Fang marks only</option>
                  <option value="mild_confined">Mild local edema confined to bite site (&lt; half limb)</option>
                  <option value="moderate_limb">Moderate edema spreading rapidly along limb (&gt; half limb)</option>
                  <option value="severe_cross_joint">Severe massive edema crossing wrist/ankle to trunk</option>
                </select>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blisteringNecrosis}
                  onChange={(e) => setBlisteringNecrosis(e.target.checked)}
                  className="mt-0.5 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900">Local Blistering / Blackish Necrotic Skin</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Classified as Severe Local Envenoming requiring admission & monitoring (NOT dry bite).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Card 5: Vitals, Shock & Kidney Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-2">
              {t.vitalSigns}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clinicalShock}
                  onChange={(e) => setClinicalShock(e.target.checked)}
                  className="mt-0.5 rounded accent-red-600"
                />
                <div>
                  <span className="font-black text-red-900">Clinical Shock / Hypotension</span>
                  <p className="text-[11px] text-red-700 mt-0.5 font-bold">Systolic BP &lt; 90 mmHg, cold extremities, thready pulse.</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oliguriaAnuria}
                  onChange={(e) => setOliguriaAnuria(e.target.checked)}
                  className="mt-0.5 rounded accent-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-900">Oliguria / Anuria (Dark Urine)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Urine output &lt; 400 mL/day or tea-colored hematuria.</p>
                </div>
              </label>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Serum Creatinine (mg/dL):</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 2.1 (> 1.4 suggests AKI in Russell's Viper)"
                value={creatinineValue}
                onChange={(e) => setCreatinineValue(e.target.value)}
                className="w-full sm:w-1/2 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs font-bold focus:outline-hidden focus:bg-white"
              />
            </div>
          </div>

          {/* Card 6: Patient Demographics & Circumstances */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-2">
              {t.patientProfile}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years):</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg):</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs font-bold"
                />
                {weightKg < 20 && (
                  <span className="text-[11px] text-amber-800 block mt-0.5 font-bold">
                    Pediatric (Full adult vial count!)
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Elapsed (Hours):</label>
                <input
                  type="number"
                  value={timeSinceBite}
                  onChange={(e) => setTimeSinceBite(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                <span className="text-slate-800 font-bold">Pregnant Patient (ASV Safe & Indicated)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={priorAsvReaction}
                  onChange={(e) => setPriorAsvReaction(e.target.checked)}
                  className="rounded accent-red-600"
                />
                <span className="text-slate-800 font-bold">Prior Antivenom Allergy / Reaction</span>
              </label>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Bite Circumstance (Contextual Clue):</label>
              <select
                value={circumstance}
                onChange={(e) => setCircumstance(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-semibold focus:outline-hidden"
              >
                <option value="daytime_agriculture">Daytime Agricultural Field (Correlates Cobra / Viper)</option>
                <option value="nocturnal_sleeping">Nocturnal Sleeping on Floor / Mat (Correlates Common/Sindh Krait)</option>
                <option value="handling_clearing">Handling Wood / Brick clearing (Correlates Saw-scaled Viper)</option>
                <option value="other">Other / Unobserved</option>
              </select>
            </div>

          </div>

        </div>

        {/* Right: Triage Outcome & Antivenom Protocol (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Decision Banner - High Contrast Light Theme */}
          <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all ${
            tier.box
          }`}>
            
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${
                tier.icon + ' text-white shadow-md'
              }`}>
                {evaluation.antivenomIndicated ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <span className={`text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded ${
                  tier.badge
                }`}>
                  {evaluation.triageLabel}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {evaluation.antivenomIndicated ? t.antivenomIndicated : t.antivenomNotIndicated}
                </h3>
              </div>
            </div>

            <div className="text-sm font-bold text-slate-800 mt-2">
              Syndrome: <span className="text-slate-900 font-black">{evaluation.syndromeTitle}</span>
            </div>

            {/* Syndrome-specific "do first" list */}
            {evaluation.priorityActions.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-white/80 border border-slate-300 text-xs">
                <div className="font-black text-slate-900 mb-1 uppercase tracking-wider">Do first</div>
                <ol className="list-decimal ml-4 space-y-1 font-semibold text-slate-800">
                  {evaluation.priorityActions.map((a, i) => <li key={i}>{a}</li>)}
                </ol>
              </div>
            )}

            {/* Initial Vial Dosage */}
            {evaluation.antivenomIndicated && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-red-200 text-xs shadow-xs">
                <div className="flex items-center justify-between text-slate-600 mb-1 font-bold">
                  <span>{t.dosageRecommendation}:</span>
                  <span className="font-mono text-emerald-700 font-black text-xs">NIH Pakistan Polyvalent</span>
                </div>
                <div className="text-3xl font-mono font-black text-slate-900 flex items-baseline gap-2">
                  <span>{evaluation.recommendedAntivenom.initialDoseVials} Vials</span>
                  <span className="text-sm font-normal text-slate-500">
                    ({evaluation.recommendedAntivenom.initialVolumeMl} mL total)
                  </span>
                </div>
                <p className="text-slate-700 mt-2 leading-relaxed font-medium">
                  {evaluation.recommendedAntivenom.infusionProtocol}
                </p>
                <div className="mt-2 text-xs text-amber-800 font-mono font-bold">
                  {evaluation.recommendedAntivenom.monitoringSchedule}
                </div>
              </div>
            )}

            {/* Mandatory Adrenaline 0.5 mg Banner */}
            {evaluation.adrenalinePrecautionMandatory && (
              <div className="mt-4 p-4 rounded-xl bg-red-100 border border-red-300 text-xs shadow-xs">
                <div className="flex items-center gap-2 text-red-900 font-black mb-1 text-sm">
                  <Syringe className="w-4 h-4 text-red-700" />
                  <span>{t.adrenalineChecklist}</span>
                </div>
                <p className="text-red-900 leading-relaxed font-bold">
                  {evaluation.adrenalineDoseProtocol}
                </p>
              </div>
            )}

          </div>

          {/* Primary Indications List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-2">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">
              Clinical Indications Detected:
            </h4>
            <ul className="space-y-1.5">
              {evaluation.primaryIndications.map((ind, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 font-semibold">
                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Warnings & Special Situations */}
          {evaluation.contraindicationsWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs text-xs space-y-2">
              <h4 className="font-black text-amber-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Special Clinical Warnings:</span>
              </h4>
              <ul className="space-y-1.5">
                {evaluation.contraindicationsWarnings.map((warn, i) => (
                  <li key={i} className="text-amber-900 leading-relaxed font-medium">
                    {warn}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Supportive Care Plan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-2">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-blue-600" />
              <span>Supportive Care & Nursing Orders:</span>
            </h4>
            <ul className="space-y-1.5">
              {evaluation.supportiveCareActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
