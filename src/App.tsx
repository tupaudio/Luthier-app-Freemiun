/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Wrench, Compass, Sparkles, Activity, ShieldAlert, Sun, Moon, BookOpen, X, ExternalLink, Guitar } from 'lucide-react';
import Tuner from './components/Tuner';
import DiagnosticWizard from './components/DiagnosticWizard';
import MaintenanceGuide from './components/MaintenanceGuide';
import TechnicalSpecs from './components/TechnicalSpecs';
import MyInstruments from './components/MyInstruments';
import PlayStorePaywallModal from './components/PlayStorePaywallModal';

export default function App() {
  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('luthier_app_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // User Plan State: 'free' | 'pro'
  const [plan, setPlan] = useState<'free' | 'pro'>(() => {
    const saved = localStorage.getItem('luthier_user_plan');
    return (saved === 'pro' || saved === 'free') ? saved : 'free';
  });

  // Paywall Modal State
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);

  // Initial App Loading Splash State
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const [splashFading, setSplashFading] = useState<boolean>(false);

  useEffect(() => {
    // 950ms display + 350ms fade-out = ~1.3s total sleek native-feeling splash
    const fadeTimer = setTimeout(() => {
      setSplashFading(true);
    }, 950);

    const endTimer = setTimeout(() => {
      setAppLoading(false);
    }, 1300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('luthier_app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('luthier_user_plan', plan);
  }, [plan]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const togglePlan = () => {
    if (plan === 'free') {
      setShowPaywallModal(true);
    } else {
      // Toggle back to free for quick testing or downgrade
      setPlan('free');
    }
  };

  const handleConfirmPurchase = () => {
    setPlan('pro');
  };

  // Mobile/Desktop bottom nav state
  const [appTab, setAppTab] = useState<'diagnostico' | 'afinador' | 'guias' | 'instrumentos'>('diagnostico');
  
  // Suggested maintenance section to pre-select
  const [activeGuideSection, setActiveGuideSection] = useState<'tensor' | 'acao' | 'oitavas' | 'captadores'>('tensor');

  // State for optional Specs Modal
  const [showSpecsModal, setShowSpecsModal] = useState<boolean>(false);

  const handleRedirectToSection = (sectionId: 'tensor' | 'acao' | 'oitavas' | 'captadores') => {
    setActiveGuideSection(sectionId);
    setAppTab('guias');
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-200 ${
      theme === 'dark' ? 'bg-stone-950 text-stone-100' : 'bg-[#FAF8F5] text-stone-900'
    }`}>
      
      {/* App Main Top Header */}
      <header className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-3 z-30 shadow-sm transition-colors ${
        theme === 'dark' ? 'bg-stone-900/90 border-stone-800' : 'bg-white/90 border-stone-200/90'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shadow-md ${
            theme === 'dark' 
              ? 'bg-amber-500 text-stone-950 shadow-amber-500/10' 
              : 'bg-amber-600 text-white shadow-amber-600/10'
          }`}>
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-extrabold tracking-tight font-display ${
                theme === 'dark' ? 'text-stone-100' : 'text-stone-900'
              }`}>
                Luthier de Bolso
              </h1>
              <a
                href="https://www.tupaaudio.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                <span>por Tupã Áudio</span>
              </a>
            </div>
            <p className={`text-xs font-medium hidden xs:block ${
              theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Bancada Digital de Regulagem de Guitarras e Baixos
            </p>
          </div>
        </div>

        {/* Header Right Actions: Plan Toggle, Theme Toggle & Specs */}
        <div className="flex items-center gap-2">
          
          {/* Plan Badge & Toggle Button */}
          <button
            onClick={togglePlan}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              plan === 'pro'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                : theme === 'dark'
                  ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
            }`}
            title="Alternar entre Versão Gratuita e Versão Paga (PRO)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${plan === 'pro' ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
            <span>{plan === 'pro' ? 'Plano PRO' : 'Gratuito'}</span>
            <span className="text-[9px] px-1 rounded bg-stone-800/80 text-stone-300 font-sans font-normal border border-stone-700/60 hidden sm:inline">
              Mudar
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              theme === 'dark'
                ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-750'
                : 'bg-amber-50 border-amber-200 text-stone-800 hover:bg-amber-100'
            }`}
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Modo Escuro</span>
              </>
            )}
          </button>

          {/* Specs / About Modal Toggle */}
          <button
            onClick={() => setShowSpecsModal(true)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
            title="Ver especificações e documentação"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden md:inline">Docs/Specs</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Application View */}
      <main className="flex-1 max-w-4xl w-full mx-auto flex flex-col overflow-hidden pb-16">
        {appTab === 'diagnostico' && (
          <DiagnosticWizard 
            onRedirectToSection={handleRedirectToSection} 
            theme={theme}
            plan={plan}
            onTogglePlan={togglePlan}
          />
        )}

        {appTab === 'afinador' && (
          <Tuner theme={theme} />
        )}

        {appTab === 'guias' && (
          <MaintenanceGuide 
            selectedSection={activeGuideSection} 
            onSectionChange={setActiveGuideSection}
            theme={theme}
          />
        )}

        {appTab === 'instrumentos' && (
          <MyInstruments 
            theme={theme} 
            plan={plan}
            onTogglePlan={togglePlan}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-2 sm:px-4 z-40 shadow-lg transition-colors ${
        theme === 'dark' 
          ? 'bg-stone-900/95 border-stone-800 backdrop-blur-md' 
          : 'bg-white/95 border-stone-200 backdrop-blur-md'
      }`}>
        <div className="max-w-lg w-full mx-auto flex items-center justify-around">
          {[
            { id: 'diagnostico', label: 'Diagnóstico', icon: ShieldAlert },
            { id: 'afinador', label: 'Afinador', icon: Activity },
            { id: 'guias', label: 'Ajustes', icon: Compass },
            { id: 'instrumentos', label: 'Meus Instrumentos', icon: Guitar }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = appTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAppTab(tab.id as any)}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive 
                    ? theme === 'dark' ? 'text-amber-400 scale-105 font-bold' : 'text-amber-600 scale-105 font-bold'
                    : theme === 'dark' ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive 
                    ? theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-100'
                    : ''
                }`}>
                  <Icon className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="text-[11px] font-medium tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Engineering Specs Modal (Optional View) */}
      {showSpecsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
            theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === 'dark' ? 'border-stone-800 bg-stone-950' : 'border-stone-200 bg-stone-50'
            }`}>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold font-display">Documentação de Engenharia e Especificações</h2>
              </div>
              <button
                onClick={() => setShowSpecsModal(false)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  theme === 'dark' ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-stone-200 border-stone-300 text-stone-700 hover:bg-stone-300'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <TechnicalSpecs theme={theme} />
            </div>
          </div>
        </div>
      )}

      {/* Google Play Billing Paywall Modal */}
      <PlayStorePaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onConfirmPurchase={handleConfirmPurchase}
        theme={theme}
        currentPlan={plan}
      />

      {/* Animated App Loading Splash Screen */}
      {appLoading && (
        <div 
          onClick={() => setAppLoading(false)}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 cursor-pointer select-none ${
            splashFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } ${
            theme === 'dark' ? 'bg-[#0c0a09] text-stone-100' : 'bg-[#FAF8F5] text-stone-900'
          }`}
          title="Toque para pular"
        >
          <div className="flex flex-col items-center max-w-xs text-center px-6">
            {/* Animated Logo Icon with Golden Glow */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-amber-500/25 rounded-3xl blur-2xl animate-pulse" />
              <img 
                src="/icon.png" 
                alt="Luthier de Bolso" 
                className="w-24 h-24 rounded-3xl shadow-2xl relative z-10 border border-amber-500/30 animate-bounce-subtle object-cover"
              />
            </div>

            {/* App Title & Tupã Audio Badge */}
            <h1 className="text-2xl font-black font-display tracking-tight mb-1.5">
              Luthier de Bolso
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>por Tupã Áudio</span>
            </div>

            {/* Animated Loading Bar */}
            <div className="w-48 h-1.5 bg-stone-800/80 rounded-full overflow-hidden relative shadow-inner mb-3">
              <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 rounded-full w-full animate-loading-bar" />
            </div>

            <p className="text-[11px] text-stone-400 font-mono tracking-tight">
              Calibrando bancada digital...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

