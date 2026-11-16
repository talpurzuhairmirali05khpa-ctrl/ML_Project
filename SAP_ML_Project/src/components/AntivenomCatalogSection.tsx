import React, { useState } from 'react';
import { BookOpen, Shield, Thermometer, AlertCircle, ExternalLink, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { ANTIVENOM_DATABASE } from '../data/antivenomDatabase';
import { AntivenomProduct, Language } from '../types';

interface AntivenomCatalogSectionProps {
  lang: Language;
}

export const AntivenomCatalogSection: React.FC<AntivenomCatalogSectionProps> = ({ lang }) => {
  const [selectedProduct, setSelectedProduct] = useState<AntivenomProduct>(ANTIVENOM_DATABASE[0]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner - High Contrast Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            DRAP & NIH Islamabad Verified
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
            Peer-Reviewed Citations
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          South Asian Sovereign Antivenom Intelligence Catalog
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl font-medium">
          Detailed product specifications, certified neutralization titers, cold chain storage limits, and regional proteomic efficacy gaps (e.g. *Echis carinatus sochureki* variation and *Bungarus sindanus* coverage) across Pakistan and South Asia.
        </p>
      </div>

      {/* Product Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ANTIVENOM_DATABASE.map(product => {
          const isSelected = selectedProduct.id === product.id;
          return (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`text-left p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {product.countryOfOrigin}
                </span>
                <span className="text-xs text-emerald-700 font-black">
                  {product.type}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 leading-snug">
                {product.tradeName}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">
                {product.manufacturer}
              </p>

              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Form: <strong className="text-slate-900">{product.form}</strong></span>
                <span className="text-emerald-700 font-bold">View Specs →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Product In-Depth Spec Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-slate-800">
        
        {/* Title & Manufacturer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {selectedProduct.type} Antiserum
              </span>
              <span className="text-xs font-semibold text-slate-500">Origin: {selectedProduct.countryOfOrigin}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {selectedProduct.tradeName}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Manufacturer: <strong className="text-slate-900">{selectedProduct.manufacturer}</strong>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs shrink-0">
            <div className="text-slate-500 uppercase font-mono text-[10px] font-bold">Procurement Cost & Availability:</div>
            <div className="text-slate-900 font-black text-sm mt-0.5">{selectedProduct.approximatePricePkr}</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">Free at public DHQ/THQ emergency wards in Pakistan</div>
          </div>
        </div>

        {/* 4 Titers Grid */}
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
            Certified Neutralization Titers (per 1 mL Antiserum):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-600 font-bold text-xs">Daboia russelii (Russell's Viper):</div>
              <div className="text-base font-black font-mono text-emerald-700 mt-1">
                {selectedProduct.neutralizationTiters.daboiaRusselii}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Viperidae / Hemotoxic</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-600 font-bold text-xs">Echis carinatus (Saw-scaled Viper):</div>
              <div className="text-base font-black font-mono text-emerald-700 mt-1">
                {selectedProduct.neutralizationTiters.echisCarinatus}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Viperidae / Coagulopathic</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-600 font-bold text-xs">Naja naja (Spectacled Cobra):</div>
              <div className="text-base font-black font-mono text-emerald-700 mt-1">
                {selectedProduct.neutralizationTiters.najaNaja}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Elapidae / Postsynaptic Neuro</div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-600 font-bold text-xs">Bungarus caeruleus (Common Krait):</div>
              <div className="text-base font-black font-mono text-emerald-700 mt-1">
                {selectedProduct.neutralizationTiters.bungarusCaeruleus}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Elapidae / Presynaptic Neuro</div>
            </div>
          </div>
        </div>

        {/* Cold Chain & Shelf-Life */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <Thermometer className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-slate-900 mb-0.5">Cold Chain Storage Protocol:</div>
              <p className="text-slate-600 leading-relaxed font-medium">{selectedProduct.storageRequirements}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
            <Layers className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-slate-900 mb-0.5">Shelf-Life & Stability:</div>
              <p className="text-slate-600 leading-relaxed font-medium">{selectedProduct.shelfLife}</p>
            </div>
          </div>
        </div>

        {/* Documented Efficacy Gaps Alert */}
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2 font-black text-amber-950 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>Documented Regional Efficacy Gaps & Clinical Limitations:</span>
          </div>
          <ul className="space-y-1.5 text-amber-900 leading-relaxed list-disc list-inside font-medium">
            {selectedProduct.knownEfficacyGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>

        {/* Primary Scientific Citations */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2 font-black text-slate-900 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Primary Sources & Regulatory Citations:</span>
          </div>
          <div className="space-y-2.5">
            {selectedProduct.primaryCitations.map((cite, i) => (
              <div key={i} className="text-slate-700 border-l-3 border-emerald-600 pl-3 py-0.5">
                <div className="font-bold text-slate-900">{cite.title}</div>
                <div className="text-[11px] text-slate-500 font-medium">{cite.source}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
