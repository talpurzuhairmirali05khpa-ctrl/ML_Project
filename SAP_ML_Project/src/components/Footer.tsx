import React from 'react';
import { Shield, BookOpen, ExternalLink, Heart } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-10 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Platform Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base">
              <div className="w-6 h-6 rounded-md overflow-hidden border border-emerald-500/30 bg-slate-950 shrink-0 shadow-xs">
                <img src="/assets/snakeguard_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span>Snake Antivenom Predictor & Decision Support (Pakistan)</span>
            </div>
            <p className="text-slate-600 leading-relaxed pr-6 text-xs font-medium">
              Open-access clinical decision support and computer vision research platform designed to assist healthcare workers in Basic Health Units (BHUs), Rural Health Centers (RHCs), and tertiary hospital emergency wards across Pakistan.
            </p>
          </div>

          {/* Col 2: Authoritative Guidelines */}
          <div className="space-y-2">
            <div className="text-slate-900 font-black uppercase tracking-wider text-[11px]">
              Authoritative Guidelines
            </div>
            <ul className="space-y-2 text-slate-600 font-medium">
              <li>
                <span className="text-slate-900 font-bold">NIH Islamabad (2021)</span>
                <div className="text-[11px] text-slate-500">National Snakebite Guidelines</div>
              </li>
              <li>
                <span className="text-slate-900 font-bold">WHO SEARO (2nd Edition, 2016)</span>
                <div className="text-[11px] text-slate-500">South-East Asia Snakebite Protocol</div>
              </li>
              <li>
                <span className="text-slate-900 font-bold">PLOS Neglected Tropical Diseases</span>
                <div className="text-[11px] text-slate-500">Regional Venom Proteomic Variation</div>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Contacts */}
          <div className="space-y-2">
            <div className="text-slate-900 font-black uppercase tracking-wider text-[11px]">
              National Hotlines (Pakistan)
            </div>
            <div className="space-y-1.5 text-slate-600 font-medium">
              <div>
                <strong className="text-slate-900">Rescue 1122:</strong> 24/7 Ambulance Dispatch
              </div>
              <div>
                <strong className="text-slate-900">NPCC Karachi:</strong> +92-21-99215740
              </div>
              <div>
                <strong className="text-slate-900">NIH Islamabad:</strong> +92-51-9255110
              </div>
              <div className="text-xs text-emerald-700 font-bold pt-1">
                Free ASV available at Government DHQ/Teaching Hospitals.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Clinical Invariant Legal Disclaimer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            © 2026 Snake Antivenom Predictor (Pakistan & South Asia). Academic & Humanitarian Research Platform.
          </div>
          <div className="text-center sm:text-right text-slate-600">
            <strong className="text-slate-800">Clinical Safety Invariant:</strong> This software is a decision-support aid. Antivenom must be prescribed only by a qualified medical practitioner.
          </div>
        </div>

      </div>
    </footer>
  );
};
