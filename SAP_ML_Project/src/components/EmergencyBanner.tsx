import React, { useState } from 'react';
import { AlertTriangle, Syringe, Phone, X, CheckCircle2, HeartPulse, Clock } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface EmergencyBannerProps {
  lang: Language;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ lang }) => {
  const [showModal, setShowModal] = useState(false);
  const t = TRANSLATIONS[lang];

  return (
    <>
      {/* Top Warning Ribbon - High Contrast for Projectors */}
      <div className="bg-red-600 text-white px-4 py-2 text-xs font-semibold shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            <span className="font-bold tracking-wide">
              {t.emergencyAlert}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg border border-white/40 transition-colors cursor-pointer text-xs font-bold"
            >
              <Syringe className="w-3.5 h-3.5" />
              <span>Adrenaline Protocol & Checklist</span>
            </button>

            <a
              href="tel:02199215740"
              className="flex items-center gap-1.5 text-white/90 hover:text-white font-mono font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>NPCC: 021-99215740</span>
            </a>
          </div>

        </div>
      </div>

      {/* Emergency Resuscitation Modal - High Contrast Light Theme */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-800">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 border border-red-200 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  WHO & NIH Pakistan Snakebite Resuscitation Checklist
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Critical lifesaving sequence before and during antivenom infusion
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Step 1: Pre-drawn Adrenaline */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-800 font-bold mb-1.5 text-sm">
                  <Syringe className="w-4 h-4 text-red-600" />
                  <span>1. Pre-Drawn Adrenaline (1:1000) at Bedside is MANDATORY</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Before administering even the first drop of polyvalent antivenom, draw <strong className="text-red-900">0.5 mg (0.5 mL of 1:1000 solution)</strong> into a 1 mL syringe.
                  Attach needle and place visibly on the emergency tray. If early anaphylaxis occurs (itching, urticaria, wheezing, tachycardia, blood pressure drop), immediately inject into anterolateral thigh.
                </p>
                <div className="mt-2.5 text-[11px] font-mono font-bold text-red-800 bg-red-100/80 p-2.5 rounded-lg border border-red-300">
                  Pediatric dose: 0.01 mg/kg (0.01 mL/kg of 1:1000) IM up to maximum 0.5 mg.
                </div>
              </div>

              {/* Step 2: Bedside 20WBCT */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1.5 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>2. Immediate 20-Minute Whole Blood Clotting Test (20WBCT)</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Draw 2 mL of venous blood into a <strong className="text-slate-900">clean, dry, new glass test tube</strong> (no anticoagulant or plastic tubes). Leave undisturbed at room temperature for 20 minutes.
                  Tip the tube gently. If blood is still liquid/unclotted, <strong className="text-emerald-700">antivenom is definitively indicated</strong> for consumptive coagulopathy (Viperidae).
                </p>
              </div>

              {/* Step 3: Airway and Breathing */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-900 font-bold mb-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>3. Airway & Respiratory Vigilance (Elapidae / Krait & Cobra)</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  Elapid neurotoxins cause flaccid paralysis of respiratory muscles. Keep Ambu bag, mask, oral airway, and endotracheal intubation set immediately at bedside.
                  Do not wait for complete apnea: if patient cannot count past 15 in a single breath or has bulbar pooling of secretions, provide assisted bag-valve ventilation.
                </p>
              </div>

              {/* Step 4: First Aid Don'ts */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="font-bold text-amber-900 text-sm mb-1.5">Harmful Traditional Practices to Strictly Forbid:</div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700 font-medium">
                  <li><span className="text-red-700 font-bold">NO arterial tourniquets</span> (causes ischemic gangrene and massive venom wash-in upon release).</li>
                  <li><span className="text-red-700 font-bold">NO incisions, cuts, or suction</span> (increases hemorrhage and secondary bacterial infection).</li>
                  <li><span className="text-red-700 font-bold">NO electric shock, chemicals, or black snake stones (Mohra)</span> (zero efficacy; fatal delay).</li>
                  <li>Immobilize the bitten limb using a splint and keep at heart level during calm hospital transport.</li>
                </ul>
              </div>

            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Understood & Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
