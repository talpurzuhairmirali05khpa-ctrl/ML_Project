import React, { useState } from 'react';
import { MapPin, Phone, Hospital, AlertTriangle, ShieldCheck, CheckCircle2, Search } from 'lucide-react';
import { PAKISTAN_REFERRAL_CENTERS, REGIONAL_EPIDEMIOLOGY_STATS } from '../data/regionalData';
import { Language } from '../types';

interface RegionalDashboardSectionProps {
  lang: Language;
}

export const RegionalDashboardSection: React.FC<RegionalDashboardSectionProps> = ({ lang }) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHospitals = PAKISTAN_REFERRAL_CENTERS.filter(h => {
    const matchesProvince = selectedProvince === 'all' || h.province.toLowerCase().includes(selectedProvince.toLowerCase());
    const matchesSearch = 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.province.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvince && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner - High Contrast Light Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Emergency Health Grid
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
            24/7 Tertiary Centers
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Pakistan Referral Hospitals & Regional Epidemiology
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl font-medium">
          Directory of designated tertiary hospitals with dedicated toxicology wards, direct NIH Islamabad antivenom stocking, hemodialysis units, and mechanical ventilator support.
        </p>
      </div>

      {/* Epidemiology Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-mono font-bold">Estimated Annual Envenomings:</div>
          <div className="text-2xl font-black text-slate-900 mt-1">40,000 - 50,000</div>
          <div className="text-xs text-emerald-700 mt-1 font-bold">High incidence across rural belts</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-mono font-bold">Annual Preventable Deaths:</div>
          <div className="text-2xl font-black text-red-600 mt-1">1,900 - 2,500</div>
          <div className="text-xs text-slate-600 mt-1 font-medium">Driven by delayed transport & dry bites</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-mono font-bold">Dominant Envenoming Species:</div>
          <div className="text-lg font-black text-slate-900 mt-1">Saw-scaled Viper (42%)</div>
          <div className="text-xs text-amber-800 mt-1 font-bold">Followed by Russell's Viper (28%)</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-mono font-bold">Peak Envenoming Period:</div>
          <div className="text-lg font-black text-slate-900 mt-1">Post-Monsoon (Aug - Nov)</div>
          <div className="text-xs text-slate-600 mt-1 font-medium">Floods & agricultural harvest surge</div>
        </div>
      </div>

      {/* Hospital Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by hospital, city, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:outline-hidden focus:bg-white focus:border-emerald-600"
          />
        </div>

        {/* Province Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'Sindh', 'Punjab', 'KPK', 'Balochistan', 'ICT'].map(prov => (
            <button
              key={prov}
              onClick={() => setSelectedProvince(prov)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedProvince === prov
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {prov === 'all' ? 'All Provinces' : prov}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHospitals.map(h => (
          <div
            key={h.name}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {h.province}
                </span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{h.asvStockStatus}</span>
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 leading-snug">
                {h.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{h.city}, {h.province}</span>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Ventilators:</span>
                  <span className="font-black text-slate-900">{h.icuVentilatorAvailable ? 'Available' : 'Limited'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">ASV Supply:</span>
                  <span className="font-black text-emerald-700">Direct Stock</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 mt-3 font-medium flex flex-wrap gap-1">
                {h.facilities.map((fac, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700">{h.phone}</span>
              <a
                href={`tel:${h.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Center</span>
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
