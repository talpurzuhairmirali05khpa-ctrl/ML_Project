import React from 'react';
import { Shield, Activity, Eye, BookOpen, MapPin, BarChart3, PhoneCall } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-emerald-600/20 border border-emerald-500/30 bg-slate-950 shrink-0">
              <img src="/assets/snakeguard_logo.jpg" alt="SnakeGuard AI Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  SnakeGuard <span className="text-emerald-600 font-black">AI</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Clinical DSS
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 hidden sm:block">
                Snakebite Antivenom & Species Identification Platform
              </p>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentTab('classifier')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'classifier'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t.navTabs.classifier}</span>
            </button>

            <button
              onClick={() => setCurrentTab('clinical')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'clinical'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t.navTabs.clinical}</span>
            </button>

            <button
              onClick={() => setCurrentTab('antivenom')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'antivenom'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{t.navTabs.antivenom}</span>
            </button>

            <button
              onClick={() => setCurrentTab('regional')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'regional'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.navTabs.regional}</span>
            </button>

            <button
              onClick={() => setCurrentTab('benchmark')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'benchmark'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.navTabs.benchmark}</span>
            </button>
          </nav>

          {/* Right: Emergency Hotline */}
          <div className="flex items-center gap-3">
            <a
              href="tel:1122"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 animate-pulse" />
              <span>Rescue 1122</span>
            </a>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-200 scrollbar-none">
          <button
            onClick={() => setCurrentTab('classifier')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              currentTab === 'classifier' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.navTabs.classifier}
          </button>
          <button
            onClick={() => setCurrentTab('clinical')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              currentTab === 'clinical' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.navTabs.clinical}
          </button>
          <button
            onClick={() => setCurrentTab('antivenom')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              currentTab === 'antivenom' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.navTabs.antivenom}
          </button>
          <button
            onClick={() => setCurrentTab('regional')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              currentTab === 'regional' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.navTabs.regional}
          </button>
          <button
            onClick={() => setCurrentTab('benchmark')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              currentTab === 'benchmark' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {t.navTabs.benchmark}
          </button>
        </div>

      </div>
    </header>
  );
};
