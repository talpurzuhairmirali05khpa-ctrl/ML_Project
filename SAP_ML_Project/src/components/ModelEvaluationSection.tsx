import React, { useState } from 'react';
import { BarChart3, AlertCircle, CheckCircle2, Sliders, ShieldCheck, Database, Award, Info } from 'lucide-react';
import { 
  EVALUATION_METRICS, 
  CONFUSION_MATRIX_8X8, 
  TRIAGE_CONFUSION_MATRIX, 
  SPECIES_CLASSES, 
  TRIAGE_CLASSES, 
  REJECTION_CURVE, 
  DATASET_ROADMAP 
} from '../ml/benchmarkData';
import { Language } from '../types';

interface ModelEvaluationSectionProps {
  lang: Language;
}

export const ModelEvaluationSection: React.FC<ModelEvaluationSectionProps> = ({ lang }) => {
  const [activeMatrixTab, setActiveMatrixTab] = useState<'species' | 'triage'>('triage');
  const [selectedThresholdIdx, setSelectedThresholdIdx] = useState<number>(2);

  const activeCurvePoint = REJECTION_CURVE[selectedThresholdIdx];

  return (
    <div className="space-y-6">
      
      {/* Header Banner - High Contrast Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Held-Out Real-Photo Test Evaluation
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
            N = {EVALUATION_METRICS.totalSamples} held-out test photos
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Machine Learning Evaluation, Matrices & Research Disclosure
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl font-medium">
          Transparent evaluation of fine-grained {SPECIES_CLASSES.length}-species classification, 3-class medical urgency triage ({(EVALUATION_METRICS.triageAccuracy * 100).toFixed(2)}% accuracy on real held-out photos), Wilson 95% confidence intervals, and selective classification with uncertainty abstention.
        </p>
      </div>

      {/* CLINICAL & SCIENTIFIC METHODOLOGY DISCLOSURE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 shadow-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-black text-slate-900 text-sm">
              Clinical & Scientific Methodology Disclosure
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              {EVALUATION_METRICS.disclosureStatement}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-800 font-mono font-bold">
              <span>• Evaluated Cohort: N = {EVALUATION_METRICS.totalSamples} real held-out photos (macro-F1 {EVALUATION_METRICS.macroF1})</span>
              <span>• Mathematical Method: Wilson Score 95% Confidence Intervals (Exact)</span>
              <span>• Safety metric: venomous predicted as harmless (see triage matrix, row 1-2, column 3)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 2 Primary Target KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KPI 1: 3-Class Medical Urgency Triage */}
        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-6 relative overflow-hidden shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black">
              Primary Medical Objective
            </span>
            <span className="text-xs text-emerald-700 font-mono font-bold">
              Target &gt; 90% Met
            </span>
          </div>

          <div className="text-4xl font-mono font-black text-slate-900 mt-1">
            {(EVALUATION_METRICS.triageAccuracy * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-600 font-bold mt-1">
            3-Class Medical Urgency Triage (Viperidae vs Elapidae vs Non-venomous)
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600 font-bold">
            <span>Correct: {EVALUATION_METRICS.triageCorrect} / {EVALUATION_METRICS.totalSamples}</span>
            <span className="text-emerald-700">
              95% Wilson CI: [{(EVALUATION_METRICS.triageWilsonCI.lower * 100).toFixed(1)}%, {(EVALUATION_METRICS.triageWilsonCI.upper * 100).toFixed(1)}%]
            </span>
          </div>
        </div>

        {/* KPI 2: Fine-Grained 8-Class Species Classification */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
              Fine-Grained Classification
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">
              8 Ecoregion Classes
            </span>
          </div>

          <div className="text-4xl font-mono font-black text-slate-900 mt-1">
            {(EVALUATION_METRICS.speciesAccuracy * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-600 font-bold mt-1">
            Exact Species Disambiguation (Biological Subspace Metric)
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-600 font-bold">
            <span>Correct: {EVALUATION_METRICS.speciesCorrect} / {EVALUATION_METRICS.totalSamples}</span>
            <span className="text-emerald-700">
              95% Wilson CI: [{(EVALUATION_METRICS.speciesWilsonCI.lower * 100).toFixed(1)}%, {(EVALUATION_METRICS.speciesWilsonCI.upper * 100).toFixed(1)}%]
            </span>
          </div>
        </div>

      </div>

      {/* Confusion Matrices View */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Empirical Confusion Matrices & Sensitivity Breakdowns
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Computed from the trained CNN's predictions on N = {EVALUATION_METRICS.totalSamples} held-out real photographs. Small classes have very few test images, so per-class numbers are uncertain.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveMatrixTab('triage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMatrixTab === 'triage'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3-Class Urgency Triage (92.2%)
            </button>
            <button
              onClick={() => setActiveMatrixTab('species')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMatrixTab === 'species'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {SPECIES_CLASSES.length}-Species Detailed Matrix ({(EVALUATION_METRICS.speciesAccuracy * 100).toFixed(1)}%)
            </button>
          </div>
        </div>

        {activeMatrixTab === 'triage' ? (
          /* 3-Class Triage Matrix View */
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-center">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="text-left py-3 px-3 font-bold">Actual Clinical Category</th>
                  <th className="py-3 px-3 font-bold text-red-700">Pred: Viperidae (Hemotoxic)</th>
                  <th className="py-3 px-3 font-bold text-blue-700">Pred: Elapidae (Neurotoxic)</th>
                  <th className="py-3 px-3 font-bold text-emerald-800">Pred: Non-venomous</th>
                  <th className="py-3 px-3 text-slate-600 font-bold">Total</th>
                  <th className="py-3 px-3 text-emerald-700 font-bold">Sensitivity</th>
                </tr>
              </thead>
              <tbody>
                {TRIAGE_CONFUSION_MATRIX.map((row, rIdx) => {
                  const rowSum = row.reduce((a, b) => a + b, 0);
                  const sensitivity = ((row[rIdx] / rowSum) * 100).toFixed(1);
                  return (
                    <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="text-left py-3 px-3 font-extrabold text-slate-900">
                        {TRIAGE_CLASSES[rIdx]}
                      </td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className={`py-3 px-3 font-black text-sm ${
                              isDiagonal
                                ? 'bg-emerald-100 text-emerald-950 font-black'
                                : val > 0 ? 'text-amber-800 font-bold' : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-slate-600 font-bold">{rowSum}</td>
                      <td className="py-3 px-3 font-black text-emerald-700">{sensitivity}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3.5 text-xs text-slate-600 flex flex-wrap items-center justify-between font-bold">
              <span>Diagonal Sum: {TRIAGE_CONFUSION_MATRIX.map((r, i) => r[i]).join(' + ')} = {EVALUATION_METRICS.triageCorrect} / {EVALUATION_METRICS.totalSamples} ({(EVALUATION_METRICS.triageAccuracy * 100).toFixed(2)}%)</span>
              <span className="text-emerald-700 font-mono">Viperid Sensitivity: {(100 * TRIAGE_CONFUSION_MATRIX[0][0] / TRIAGE_CONFUSION_MATRIX[0].reduce((a, b) => a + b, 0)).toFixed(1)}% | Elapid Sensitivity: {(100 * TRIAGE_CONFUSION_MATRIX[1][1] / TRIAGE_CONFUSION_MATRIX[1].reduce((a, b) => a + b, 0)).toFixed(1)}%</span>
            </div>
          </div>
        ) : (
          /* Species Matrix View */
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-center">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="text-left py-2.5 px-2 font-bold">Actual Species</th>
                  {SPECIES_CLASSES.map((cls, i) => (
                    <th key={i} className="py-2.5 px-2 font-bold text-slate-800 truncate max-w-[80px]">
                      {cls.split(' ')[0][0]}. {cls.split(' ')[1]}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 text-slate-600 font-bold">Total</th>
                  <th className="py-2.5 px-2 text-emerald-700 font-bold">Acc</th>
                </tr>
              </thead>
              <tbody>
                {CONFUSION_MATRIX_8X8.map((row, rIdx) => {
                  const rowSum = row.reduce((a, b) => a + b, 0);
                  const acc = ((row[rIdx] / rowSum) * 100).toFixed(1);
                  return (
                    <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="text-left py-2 px-2 font-bold text-slate-900 whitespace-nowrap">
                        {SPECIES_CLASSES[rIdx]}
                      </td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        return (
                          <td
                            key={cIdx}
                            className={`py-2 px-2 font-bold ${
                              isDiagonal
                                ? 'bg-emerald-100 text-emerald-950 font-black'
                                : val > 0 ? 'text-amber-800' : 'text-slate-400'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-slate-600 font-bold">{rowSum}</td>
                      <td className="py-2 px-2 font-black text-emerald-700">{acc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-3 text-xs text-slate-600 flex items-center justify-between font-bold">
              <span>Diagonal Correct: {CONFUSION_MATRIX_8X8.map((r, i) => r[i]).join('+')} = {EVALUATION_METRICS.speciesCorrect} / {EVALUATION_METRICS.totalSamples} ({(EVALUATION_METRICS.speciesAccuracy * 100).toFixed(2)}%)</span>
              <span className="text-slate-500 font-mono">Row totals = test photos per species (unequal)</span>
            </div>
          </div>
        )}

      </div>

      {/* Selective Classification Abstention Trade-off Curve */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Selective Classification with Uncertainty Abstention
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              By rejecting ambiguous cases below confidence threshold τ, accuracy on accepted cases rises as the threshold increases, while coverage drops (see the computed values below).
            </p>
          </div>

          <div className="text-right text-xs font-mono font-bold">
            <span className="text-slate-500">Current Threshold: </span>
            <span className="text-emerald-700">τ = {activeCurvePoint.threshold.toFixed(2)}</span>
          </div>
        </div>

        {/* Interactive Threshold Slider */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Adjust Confidence Threshold (τ):</span>
            <span className="text-slate-900 font-mono">
              Accept Cases with P_max &gt;= {activeCurvePoint.threshold.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {REJECTION_CURVE.map((pt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedThresholdIdx(idx)}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  selectedThresholdIdx === idx
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                τ = {pt.threshold.toFixed(2)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <div className="text-slate-500 text-[10px] font-bold">Operational Coverage</div>
              <div className="text-emerald-700 text-lg font-black mt-0.5">{activeCurvePoint.coveragePct}%</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <div className="text-slate-500 text-[10px] font-bold">Accepted Accuracy</div>
              <div className="text-slate-900 text-lg font-black mt-0.5">{activeCurvePoint.accuracyPct}%</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <div className="text-slate-500 text-[10px] font-bold">Accepted Cases</div>
              <div className="text-emerald-700 text-lg font-black mt-0.5">{activeCurvePoint.acceptedSamples} / 320</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <div className="text-slate-500 text-[10px] font-bold">Abstained (Referred)</div>
              <div className="text-amber-800 text-lg font-black mt-0.5">{activeCurvePoint.rejectedSamples} cases</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset & Real Pipeline Roadmap */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-black text-slate-900">
            Future Research & Dataset Integration Roadmap
          </h3>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
          To transition from prototype parameter simulation to unconstrained field computer vision, the platform integrates with verified international repositories filtered for Pakistan and South Asian ecoregions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {DATASET_ROADMAP.targetDatasets.map((ds, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="font-black text-emerald-700 text-xs">{ds.name}</div>
              <div className="text-slate-500 text-[11px] font-bold">{ds.coverage}</div>
              <p className="text-slate-700 text-xs pt-1 leading-relaxed font-medium">{ds.utility}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
