import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { SpeciesClassifierSection } from './components/SpeciesClassifierSection';
import { ClinicalAssessmentSection } from './components/ClinicalAssessmentSection';
import { AntivenomCatalogSection } from './components/AntivenomCatalogSection';
import { RegionalDashboardSection } from './components/RegionalDashboardSection';
import { ModelEvaluationSection } from './components/ModelEvaluationSection';
import { Footer } from './components/Footer';
import { Language, SnakeSpecies } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('classifier');
  const [lang, setLang] = useState<Language>('en');
  const [suspectedSpecies, setSuspectedSpecies] = useState<SnakeSpecies | null>(null);

  // Handle transfer from visual classifier to bedside triage
  const handleTransferToClinical = (species: SnakeSpecies | null) => {
    setSuspectedSpecies(species);
    setCurrentTab('clinical');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Top Emergency Safety Banner */}
      <EmergencyBanner lang={lang} />

      {/* 2. Top Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
      />

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentTab === 'classifier' && (
          <SpeciesClassifierSection
            lang={lang}
            onTransferToClinical={handleTransferToClinical}
          />
        )}

        {currentTab === 'clinical' && (
          <ClinicalAssessmentSection
            lang={lang}
            suspectedSpecies={suspectedSpecies}
          />
        )}

        {currentTab === 'antivenom' && (
          <AntivenomCatalogSection lang={lang} />
        )}

        {currentTab === 'regional' && (
          <RegionalDashboardSection lang={lang} />
        )}

        {currentTab === 'benchmark' && (
          <ModelEvaluationSection lang={lang} />
        )}

      </main>

      {/* 4. Footer with Guidelines & Disclaimers */}
      <Footer lang={lang} />

    </div>
  );
}
