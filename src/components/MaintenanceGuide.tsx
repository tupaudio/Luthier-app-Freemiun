/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Scale, Activity, ArrowRight, CheckCircle2, RotateCcw, Info, Settings2, HelpCircle } from 'lucide-react';

interface MaintenanceGuideProps {
  selectedSection: 'tensor' | 'acao' | 'oitavas' | 'captadores';
  onSectionChange: (sectionId: 'tensor' | 'acao' | 'oitavas' | 'captadores') => void;
  theme?: 'dark' | 'light';
}

export default function MaintenanceGuide({ selectedSection, onSectionChange, theme = 'dark' }: MaintenanceGuideProps) {
  // 1. Tensor Simulation State
  // Values: -10 (convex/backbow) to +10 (concave/underbow). 0 is perfect.
  const [trussRodTension, setTrussRodTension] = useState<number>(6); 

  // 2. Action Height Simulation State
  // Values in mm: 0.8mm to 4.5mm. 2.0mm is ideal.
  const [actionHeight, setActionHeight] = useState<number>(3.2);

  // 3. Intonation State
  // Values in cents deviation of fretted note vs harmonic: -30 (flat) to +30 (sharp). Start sharp.
  const [intonationCents, setIntonationCents] = useState<number>(24);

  // 4. Pickup Height State
  // Distance in mm: 1.0mm to 6.5mm.
  const [pickupHeight, setPickupHeight] = useState<number>(1.2);

  const isLight = theme === 'light';

  // Sync state if redirected to help user see perfect initial setup or current problem
  useEffect(() => {
    if (selectedSection === 'tensor') {
      // Default to slightly curved so they can fix it
      setTrussRodTension(6);
    } else if (selectedSection === 'acao') {
      setActionHeight(3.5);
    } else if (selectedSection === 'oitavas') {
      setIntonationCents(24);
    } else if (selectedSection === 'captadores') {
      setPickupHeight(1.2); // too close, Stratitis
    }
  }, [selectedSection]);

  return (
    <div className={`flex flex-col h-full font-sans select-none overflow-y-auto transition-colors ${
      isLight ? 'bg-[#FAF8F5] text-stone-900' : 'bg-stone-950 text-stone-100'
    }`}>
      {/* Module Selector */}
      <div className={`border-b sticky top-0 z-20 transition-colors ${
        isLight ? 'border-stone-200 bg-white/95 backdrop-blur-sm shadow-sm' : 'border-stone-850 bg-stone-900/60'
      }`}>
        <div className="grid grid-cols-4 gap-1 p-2">
          {[
            { id: 'tensor', label: 'Tensor', icon: Compass },
            { id: 'acao', label: 'Ação', icon: Scale },
            { id: 'oitavas', label: 'Oitavas', icon: Activity },
            { id: 'captadores', label: 'Captadores', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSectionChange(tab.id as any)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? isLight 
                      ? 'bg-amber-600 text-white font-bold shadow-sm' 
                      : 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10'
                    : isLight 
                      ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100' 
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Content Area */}
      <div className="flex-1 p-4 space-y-6">
        
        {/* SECTION 1: TENSOR (ALÍVIO DO BRAÇO) */}
        {selectedSection === 'tensor' && (
          <div className="space-y-6">
            {/* Header Description */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wider">Módulo 1</span>
                <h3 className="text-lg font-bold font-display text-stone-100">Alívio do Braço (Tensor)</h3>
              </div>
              <p className="text-xs text-stone-400">Regular o tensor corrige a curvatura do braço do instrumento sob a tensão das cordas.</p>
            </div>

            {/* Step-by-Step Checklist */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500">Procedimento Técnico (Passo a Passo)</span>
              <div className="space-y-2">
                {[
                  {
                    step: '1',
                    title: 'Medição Física (Teste de Alívio)',
                    desc: 'Prenda a corda na casa 1 (com capotraste ou mão esquerda) e na última casa do instrumento simultaneamente.'
                  },
                  {
                    step: '2',
                    title: 'Verificar a folga na casa 8 ou 9',
                    desc: 'Olhe a distância entre o topo do traste 8 e a corda. O ideal é ter a espessura de um cartão de visitas (~0.3mm). Se encostar, o braço está muito reto. Se a folga for enorme, o braço está muito côncavo.'
                  },
                  {
                    step: '3',
                    title: 'Lógica de Ajuste',
                    desc: 'Sentido Horário (apertar) remove curvatura e desce as cordas. Sentido Anti-Horário (soltar) aumenta a curvatura e sobe as cordas.'
                  },
                  {
                    step: '4',
                    title: 'Regra do Quarto de Volta',
                    desc: 'Nunca gire mais de 1/4 de volta por vez. Espere 15-30 minutos para a madeira assentar antes de medir novamente.'
                  }
                ].map((item) => (
                  <div key={item.step} className="p-3 bg-stone-900 border border-stone-850 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-amber-950 text-amber-500 flex items-center justify-center font-mono text-xxs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-200">{item.title}</h4>
                      <p className="text-xxs text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Physical Simulator */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500 flex justify-between items-center">
                <span>Simulador Físico do Braço</span>
                <button 
                  onClick={() => setTrussRodTension(0)}
                  className="text-stone-500 hover:text-amber-500 flex items-center gap-0.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reiniciar
                </button>
              </span>
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-4">
                
                {/* SVG Visualizing bent neck with high realistic detail & Headstock */}
                <div className={`h-36 rounded-xl border p-2 flex flex-col justify-between overflow-hidden relative transition-colors ${
                  isLight ? 'bg-stone-900 border-stone-300' : 'bg-stone-950 border-stone-850'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 absolute top-2 left-3 z-10">
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block"></span>
                      Diagrama Técnico do Braço e Tensor
                    </span>
                  </div>
                  
                  {/* Interactive High-Detail Vector Diagram */}
                  <svg viewBox="0 0 410 110" className="w-full h-full mt-3">
                    <defs>
                      {/* Realistic Wood Gradient for Mahogany Neck Body & Headstock */}
                      <linearGradient id="woodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#874722" />
                        <stop offset="35%" stopColor="#5c2e14" />
                        <stop offset="70%" stopColor="#3d1d0a" />
                        <stop offset="100%" stopColor="#241005" />
                      </linearGradient>

                      {/* Headstock Wood Texture */}
                      <linearGradient id="headstockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4a230d" />
                        <stop offset="50%" stopColor="#2e1406" />
                        <stop offset="100%" stopColor="#170902" />
                      </linearGradient>

                      {/* Rosewood / Ebony Fretboard Gradient */}
                      <linearGradient id="fretboardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2e211b" />
                        <stop offset="50%" stopColor="#1a120e" />
                        <stop offset="100%" stopColor="#0d0907" />
                      </linearGradient>

                      {/* Steel Truss Rod Metallic Gradient */}
                      <linearGradient id="steelRodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e7e5e4" />
                        <stop offset="50%" stopColor="#918d8a" />
                        <stop offset="100%" stopColor="#44403c" />
                      </linearGradient>

                      {/* Nickel Fret Metallic Gradient */}
                      <linearGradient id="fretMetallic" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#d6d3d1" />
                        <stop offset="50%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#78716c" />
                      </linearGradient>
                    </defs>

                    {/* Background grid line references */}
                    <line x1="45" y1="52" x2="385" y2="52" stroke="#44403c" strokeWidth="0.5" strokeDasharray="3,3" />

                    {(() => {
                      const centerOffset = trussRodTension * 1.8; // Dynamic curvature
                      
                      // Curve formulas
                      const topFretboardY = 70;
                      const neckThickness = 18;
                      const startX = 45;
                      const endX = 385;
                      
                      // Paths
                      const fretboardPath = `M ${startX} ${topFretboardY} Q 215 ${topFretboardY + centerOffset} ${endX} ${topFretboardY}`;
                      
                      return (
                        <>
                          {/* HEADSTOCK (Mão do Instrumento) on the far left */}
                          <g id="headstock">
                            {/* Angled Headstock Body */}
                            <path 
                              d={`M 0 88 L 42 70 L 45 70 L 45 88 L 0 98 Z`} 
                              fill="url(#headstockGradient)" 
                              stroke="#0d0703" 
                              strokeWidth="1"
                            />
                            {/* Tuning Posts & Peg Buttons */}
                            <rect x="12" y="60" width="3" height="15" fill="#d6d3d1" rx="0.5" />
                            <circle cx="13.5" cy="58" r="3" fill="#a8a29e" stroke="#292524" strokeWidth="0.5" />
                            <rect x="25" y="62" width="3" height="13" fill="#d6d3d1" rx="0.5" />
                            <circle cx="26.5" cy="60" r="3" fill="#a8a29e" stroke="#292524" strokeWidth="0.5" />
                            
                            {/* Headstock Label / Brand Overlay */}
                            <text x="18" y="85" fill="#d97706" fontSize="6" fontFamily="serif" fontStyle="italic" opacity="0.8">Headstock</text>

                            {/* Truss Rod Access Hole & Hex Nut */}
                            <path d="M 36 71 Q 40 73 44 71 L 44 75 L 36 75 Z" fill="#1c1917" />
                            <rect x="38" y={71 + centerOffset * 0.1} width="5" height="5" fill="#a8a29e" stroke="#292524" rx="0.5" />
                          </g>

                          {/* Inner Wooden Neck Shaft (Mahogany) */}
                          <path 
                            d={`${fretboardPath} L ${endX} ${topFretboardY + neckThickness} Q 215 ${topFretboardY + neckThickness + centerOffset} ${startX} ${topFretboardY + neckThickness} Z`} 
                            fill="url(#woodGradient)" 
                            stroke="#1c1917" 
                            strokeWidth="1"
                          />

                          {/* Rosewood Fretboard Layer */}
                          <path 
                            d={`${fretboardPath} L ${endX} ${topFretboardY + 5} Q 215 ${topFretboardY + 5 + centerOffset} ${startX} ${topFretboardY + 5} Z`} 
                            fill="url(#fretboardGradient)" 
                            stroke="#000" 
                            strokeWidth="0.5"
                          />

                          {/* Steel Dual-Action Truss Rod core inside wood */}
                          <path 
                            d={`M 48 ${topFretboardY + 11} Q 215 ${topFretboardY + 11 + centerOffset * 0.75} 370 ${topFretboardY + 11}`} 
                            fill="none" 
                            stroke="url(#steelRodGradient)" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />

                          {/* Nickel Crown Frets along curved fretboard */}
                          {[65, 100, 135, 170, 205, 240, 275, 310, 345].map((x) => {
                            const t = (x - startX) / (endX - startX);
                            const yCurve = Math.pow(1 - t, 2) * topFretboardY + 2 * (1 - t) * t * (topFretboardY + centerOffset) + Math.pow(t, 2) * topFretboardY;
                            return (
                              <g key={x}>
                                {/* Fret Crown */}
                                <line 
                                  x1={x} 
                                  y1={yCurve} 
                                  x2={x} 
                                  y2={yCurve - 4} 
                                  stroke="url(#fretMetallic)" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round"
                                />
                                {/* Fretboard Inlay Dot on 3, 5, 7, 9, 12 */}
                                {[135, 205, 275, 345].includes(x) && (
                                  <circle 
                                    cx={x} 
                                    cy={yCurve + 2.5} 
                                    r="1.2" 
                                    fill="#f5f5f4" 
                                    opacity="0.9" 
                                  />
                                )}
                              </g>
                            );
                          })}

                          {/* Bone Nut (Headstock end) */}
                          <rect x="42" y={topFretboardY - 8} width="6" height="13" fill="#fef3c7" stroke="#d97706" strokeWidth="0.5" rx="1" />
                          
                          {/* Bridge Saddle (Body end) */}
                          <rect x="385" y={topFretboardY - 6} width="8" height="12" fill="#d6d3d1" stroke="#44403c" strokeWidth="0.5" rx="1" />

                          {/* Steel vibrating String on top (fixed straight line from Nut to Saddle) */}
                          <line x1="14" y1="60" x2="45" y2="52" stroke="#0284c7" strokeWidth="1.5" />
                          <line x1="45" y1="52" x2="388" y2="52" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" />
                          
                          {/* Center measurement indicator line at 8th/9th fret */}
                          {(() => {
                            const midT = (215 - startX) / (endX - startX);
                            const yMidCurve = Math.pow(1 - midT, 2) * topFretboardY + 2 * (1 - midT) * midT * (topFretboardY + centerOffset) + Math.pow(midT, 2) * topFretboardY;
                            const isOptimal = Math.abs(trussRodTension) <= 2;
                            return (
                              <g>
                                <line 
                                  x1="215" 
                                  y1="52" 
                                  x2="215" 
                                  y2={yMidCurve - 4} 
                                  stroke={isOptimal ? "#34d399" : trussRodTension > 2 ? "#fbbf24" : "#f87171"} 
                                  strokeWidth="1.5" 
                                  strokeDasharray="2,2" 
                                />
                                <circle cx="215" cy={(52 + yMidCurve - 4) / 2} r="2.5" fill={isOptimal ? "#34d399" : "#fbbf24"} />
                              </g>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Status Indicator Bar */}
                  <div className="flex justify-between items-center border-t border-stone-850 pt-1">
                    <span className="text-[10px] font-mono text-stone-400">
                      Estado: {trussRodTension > 2 ? 'Côncavo (Curvado)' : trussRodTension < -2 ? 'Convexo (Reto/Invertido)' : 'Alívio Ideal'}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      Math.abs(trussRodTension) <= 2 
                        ? 'bg-emerald-950 text-emerald-400' 
                        : trussRodTension < -2 
                          ? 'bg-red-950 text-red-400' 
                          : 'bg-amber-950 text-amber-400'
                    }`}>
                      {trussRodTension > 2 
                        ? 'Ação alta no meio' 
                        : trussRodTension < -2 
                          ? 'Trastejamento nas casas 1-4' 
                          : 'Alívio Perfeito (~0.3mm)'}
                    </span>
                  </div>
                </div>

                {/* Adjust Tension Slider Controls */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-300">
                    <span className="font-medium">Tensão do Tensor</span>
                    <span className="font-mono text-amber-500 font-bold">{trussRodTension === 0 ? 'Braço Reto' : trussRodTension > 0 ? `Solto (+${trussRodTension})` : `Apertado (${trussRodTension})`}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      onClick={() => setTrussRodTension(prev => Math.max(-10, prev - 2))}
                      className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 rounded-xl text-xs font-mono flex items-center justify-between sm:justify-center gap-1.5 border border-stone-700 transition-colors"
                    >
                      <span className="font-semibold text-stone-200">← Sentido Horário</span>
                      <span className="text-stone-400 font-normal text-[10px] bg-stone-900/70 px-1.5 py-0.5 rounded border border-stone-700/60 shrink-0">(Apertar)</span>
                    </button>
                    <button 
                      onClick={() => setTrussRodTension(prev => Math.min(10, prev + 2))}
                      className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 rounded-xl text-xs font-mono flex items-center justify-between sm:justify-center gap-1.5 border border-stone-700 transition-colors"
                    >
                      <span className="font-semibold text-stone-200">Sentido Anti-Horário →</span>
                      <span className="text-stone-400 font-normal text-[10px] bg-stone-900/70 px-1.5 py-0.5 rounded border border-stone-700/60 shrink-0">(Soltar)</span>
                    </button>
                  </div>
                </div>

                {/* Feedback Panel */}
                <div className="p-3 rounded-xl bg-stone-950 text-xxs leading-relaxed border border-stone-850">
                  {trussRodTension > 2 ? (
                    <p className="text-stone-300"><strong className="text-amber-500">Diagnóstico:</strong> O braço está cedendo demais à tensão das cordas (côncavo). <strong className="text-stone-200">Como corrigir:</strong> Insira a chave Allen e gire no <strong>sentido horário</strong> (1/4 de volta por vez) para tensionar o tensor e puxar o braço de volta.</p>
                  ) : trussRodTension < -2 ? (
                    <p className="text-stone-300"><strong className="text-red-400">Diagnóstico:</strong> O tensor está apertado demais, puxando o braço para trás (convexo). Isso anula a folga das cordas e causará trastejamento horrível nas primeiras 4 casas. <strong className="text-stone-200">Como corrigir:</strong> Gire no <strong>sentido anti-horário</strong> para relaxar a madeira e restabelecer o alívio saudável.</p>
                  ) : (
                    <p className="text-stone-300"><strong className="text-emerald-400">Excelente:</strong> O braço possui a curvatura perfeita para acomodar a vibração elíptica natural das cordas. Não requer alteração no tensor.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: AÇÃO (ALTURA DAS CORDAS) */}
        {selectedSection === 'acao' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wider">Módulo 2</span>
                <h3 className="text-lg font-bold font-display text-stone-100">Altura das Cordas (Ação)</h3>
              </div>
              <p className="text-xs text-stone-400">Regular a altura das cordas garante maciez e velocidade ao tocar, eliminando trastejamentos pontuais.</p>
            </div>

            {/* Step-by-Step Checklist */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500">Procedimento Técnico (Passo a Passo)</span>
              <div className="space-y-2">
                {[
                  {
                    step: '1',
                    title: 'Medição no Traste 12',
                    desc: 'Utilize uma régua de luthieria (ou paquímetro) para medir a distância entre a base da corda e o topo de metal do 12º traste.'
                  },
                  {
                    step: '2',
                    title: 'Parâmetros de Referência',
                    desc: 'Guitarra: ~1.5mm nas cordas finas e ~2.0mm nas cordas grossas. Baixo: ~2.0mm nas finas e ~2.5mm a 3.0mm nas grossas.'
                  },
                  {
                    step: '3',
                    title: 'Ajuste dos Carrinhos (Saddles)',
                    desc: 'Na ponte, use a chave Allen correspondente para girar os pequenos parafusos do carrinho da corda específica para subir ou descer.'
                  },
                  {
                    step: '4',
                    title: 'Seguir o raio da escala',
                    desc: 'Os carrinhos devem acompanhar a curvatura (raio) da escala para que o instrumento soe uniforme e confortável em todas as cordas.'
                  }
                ].map((item) => (
                  <div key={item.step} className="p-3 bg-stone-900 border border-stone-850 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-amber-950 text-amber-500 flex items-center justify-center font-mono text-xxs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-200">{item.title}</h4>
                      <p className="text-xxs text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Simulator */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500 flex justify-between items-center">
                <span>Simulador de Altura (Ação)</span>
                <button 
                  onClick={() => setActionHeight(3.5)}
                  className="text-stone-500 hover:text-amber-500 flex items-center gap-0.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reiniciar
                </button>
              </span>
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-4">
                
                {/* Visual Fret Close-Up with photorealistic textures */}
                <div className={`h-36 rounded-xl border p-2 flex flex-col justify-between overflow-hidden relative transition-colors ${
                  isLight ? 'bg-stone-900 border-stone-300' : 'bg-stone-950 border-stone-850'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 absolute top-2 left-3 z-10">
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block"></span>
                      Medição da Folga no Traste 12
                    </span>
                  </div>

                  {/* SVG Fret & String with Headstock and parallel string at ideal action */}
                  <svg viewBox="0 0 230 95" className="w-full h-full mt-2">
                    <defs>
                      <linearGradient id="rosewoodWood" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b251a" />
                        <stop offset="60%" stopColor="#24140c" />
                        <stop offset="100%" stopColor="#140b06" />
                      </linearGradient>

                      <linearGradient id="headstockWoodMini" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4a230d" />
                        <stop offset="100%" stopColor="#170902" />
                      </linearGradient>

                      <linearGradient id="metalFretCrown" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f5f5f4" />
                        <stop offset="30%" stopColor="#e7e5e4" />
                        <stop offset="70%" stopColor="#a8a29e" />
                        <stop offset="100%" stopColor="#57534e" />
                      </linearGradient>

                      <linearGradient id="saddleChrome" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#78716c" />
                        <stop offset="40%" stopColor="#e7e5e4" />
                        <stop offset="80%" stopColor="#a8a29e" />
                        <stop offset="100%" stopColor="#44403c" />
                      </linearGradient>
                    </defs>

                    {/* HEADSTOCK (Mão do Instrumento) on the far left */}
                    <g id="mini-headstock">
                      {/* Angled Headstock Body */}
                      <path d="M 0 82 L 30 68 L 33 68 L 33 88 L 0 92 Z" fill="url(#headstockWoodMini)" stroke="#0d0703" strokeWidth="1" />
                      {/* Tuning Peg Post */}
                      <rect x="12" y="55" width="3" height="15" fill="#d6d3d1" rx="0.5" />
                      <circle cx="13.5" cy="53" r="3" fill="#a8a29e" stroke="#292524" strokeWidth="0.5" />
                      <text x="5" y="86" fill="#d97706" fontSize="5.5" fontFamily="sans-serif" fontStyle="italic" opacity="0.8">Headstock</text>
                    </g>

                    {/* Rosewood Fretboard slab from Nut (X=33) to Bridge (X=195) */}
                    <rect x="33" y="68" width="162" height="25" fill="url(#rosewoodWood)" stroke="#1c1917" strokeWidth="1" />
                    
                    {/* Bone Nut at X=33 */}
                    <rect x="30" y="52" width="6" height="18" fill="#fef3c7" stroke="#d97706" strokeWidth="0.5" rx="1" />

                    {/* Fret Tang inside wood at Fret 12 (X=115) */}
                    <rect x="113" y="76" width="4" height="15" fill="#44403c" />

                    {/* Crown Nickel-Silver Fret 12 */}
                    <path d="M 103 68 Q 115 52 127 68 Z" fill="url(#metalFretCrown)" stroke="#292524" strokeWidth="0.5" />
                    <line x1="103" y1="68" x2="127" y2="68" stroke="#1c1917" strokeWidth="1" />
                    <text x="115" y="85" textAnchor="middle" fill="#a8a29e" fontSize="7" fontFamily="monospace" fontWeight="bold">Traste 12</text>

                    {/* Adjustable Bridge Saddle on right (X=195) */}
                    {(() => {
                      // Ideal setup (2.0mm): String is 100% parallel to fretboard!
                      // String nut slot at (33, 44). Fret 12 crown top at (115, 52). Gap = 8px (2.0mm).
                      // When actionHeight = 2.0mm, saddle string height is Y = 44 (perfectly parallel horizontal line).
                      const saddleY = 44 - (actionHeight - 2.0) * 6;
                      const stringYAtFret = 44 + (saddleY - 44) * ((115 - 33) / (195 - 33));
                      
                      return (
                        <>
                          {/* Saddle Base Block */}
                          <rect x="190" y={saddleY} width="22" height="35" rx="2" fill="url(#saddleChrome)" stroke="#1c1917" strokeWidth="1" />
                          {/* Saddle Screw Thread */}
                          <line x1="201" y1={saddleY - 12} x2="201" y2={saddleY + 30} stroke="#a8a29e" strokeWidth="2" strokeDasharray="1,1" />

                          {/* String from Tuning Peg to Nut */}
                          <line x1="13.5" y1="55" x2="33" y2="44" stroke="#0284c7" strokeWidth="1.5" />

                          {/* Main String from Nut (X=33, Y=44) to Saddle (X=195, Y=saddleY) */}
                          <line x1="33" y1="44" x2="195" y2={saddleY} stroke="#38bdf8" strokeWidth="2.8" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.6))" />
                          <line x1="33" y1="44" x2="195" y2={saddleY} stroke="#e0f2fe" strokeWidth="1" strokeDasharray="2,1" opacity="0.6" />

                          {/* Precision Ruler Measurement Indicator at Fret 12 Crown (X=115) */}
                          <line x1="115" y1="52" x2="115" y2={stringYAtFret} stroke={actionHeight < 1.4 ? "#f87171" : actionHeight > 2.8 ? "#fbbf24" : "#34d399"} strokeWidth="2" />
                          <circle cx="115" cy="52" r="2" fill="#34d399" />
                          <circle cx="115" cy={stringYAtFret} r="2" fill="#38bdf8" />

                          {/* Distance callout text badge */}
                          <rect x="123" y={(52 + stringYAtFret)/2 - 8} width="52" height="16" rx="4" fill="#0c0a09" opacity="0.9" stroke="#44403c" strokeWidth="0.5" />
                          <text x="149" y={(52 + stringYAtFret)/2 + 3} textAnchor="middle" fill={actionHeight < 1.4 ? "#f87171" : actionHeight > 2.8 ? "#fbbf24" : "#34d399"} fontSize="9" fontFamily="monospace" fontWeight="bold">
                            {actionHeight.toFixed(1)} mm
                          </text>
                        </>
                      );
                    })()}
                  </svg>

                  <div className="flex justify-between items-center border-t border-stone-850 pt-1">
                    <span className="text-[10px] font-mono text-stone-400">Fga. no Traste 12</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      actionHeight < 1.4 
                        ? 'bg-red-950 text-red-400' 
                        : actionHeight > 2.8 
                          ? 'bg-amber-950 text-amber-400' 
                          : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {actionHeight.toFixed(1)} mm - {actionHeight < 1.4 ? 'Trastejando!' : actionHeight > 2.8 ? 'Corda Dura' : 'Ideal'}
                    </span>
                  </div>
                </div>

                {/* Saddle adjust slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-300">
                    <span className="font-medium">Regular Altura do Carrinho</span>
                    <span className="font-mono text-amber-500 font-bold">{actionHeight.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="4.5"
                    step="0.2"
                    value={actionHeight}
                    onChange={(e) => setActionHeight(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xxs font-mono text-stone-500">
                    <span>Baixa (Trasteja)</span>
                    <span>Ideal (2.0mm)</span>
                    <span>Alta (Dura)</span>
                  </div>
                </div>

                {/* Interactive Feedback */}
                <div className="p-3 rounded-xl bg-stone-950 text-xxs leading-relaxed border border-stone-850">
                  {actionHeight < 1.4 ? (
                    <p className="text-stone-300"><strong className="text-red-400">Diagnóstico:</strong> A ação de {actionHeight.toFixed(1)}mm está baixa demais para o instrumento. A corda baterá violentamente nos trastes adjacentes ao vibrar, ceifando o som (trastejamento). <strong className="text-stone-200">Como corrigir:</strong> Use a chave Allen no saddle para girar os parafusos no <strong>sentido anti-horário</strong> para levantar a corda até pelo menos 1.8mm.</p>
                  ) : actionHeight > 2.8 ? (
                    <p className="text-stone-300"><strong className="text-amber-500">Diagnóstico:</strong> Com {actionHeight.toFixed(1)}mm o instrumento está excessivamente "pesado" e desconfortável para tocar rápidos acordes ou solos, além de puxar a nota fora do tom ao apertá-la. <strong className="text-stone-200">Como corrigir:</strong> Gire os parafusos do carrinho no <strong>sentido horário</strong> para rebaixar uniformemente as cordas.</p>
                  ) : (
                    <p className="text-stone-300"><strong className="text-emerald-400">Perfeito:</strong> Altura equilibrada de {actionHeight.toFixed(1)}mm. Excelente balanço entre conforto de digitação e ausência de ruídos nos trastes.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: INTONAÇÃO / OITAVAS */}
        {selectedSection === 'oitavas' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wider">Módulo 3</span>
                <h3 className="text-lg font-bold font-display text-stone-100">Entonação e Oitavas</h3>
              </div>
              <p className="text-xs text-stone-400">Ajustar as oitavas garante que o instrumento soe perfeitamente afinado em toda a extensão do braço.</p>
            </div>

            {/* Step-by-Step Checklist */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500">Procedimento Técnico (Passo a Passo)</span>
              <div className="space-y-2">
                {[
                  {
                    step: '1',
                    title: 'Afinar a Corda Solta',
                    desc: 'Afine a corda perfeitamente na nota padrão de referência usando o afinador digital.'
                  },
                  {
                    step: '2',
                    title: 'Medição do Harmônico na Casa 12',
                    desc: 'Toque o harmônico natural exatamente acima do traste 12 e verifique se está no tom.'
                  },
                  {
                    step: '3',
                    title: 'Comparar com a Nota Presa na Casa 12',
                    desc: 'Pressione a corda na casa 12 com força normal e toque. Se a nota presa for mais AGUDA que o harmônico, a corda está "curta". Se for mais GRAVE, a corda está "longa".'
                  },
                  {
                    step: '4',
                    title: 'Lógica de Regulagem dos Carrinhos',
                    desc: 'Nota presa AGUDA (Sharp): afaste o carrinho (saddle) para trás, girando o parafuso traseiro no sentido horário. Nota presa GRAVE (Flat): mova o carrinho para a frente, girando no sentido anti-horário.'
                  }
                ].map((item) => (
                  <div key={item.step} className="p-3 bg-stone-900 border border-stone-850 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-amber-950 text-amber-500 flex items-center justify-center font-mono text-xxs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-200">{item.title}</h4>
                      <p className="text-xxs text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intonation Simulator */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500 flex justify-between items-center">
                <span>Simulador de Ajuste de Oitavas</span>
                <button 
                  onClick={() => setIntonationCents(24)}
                  className="text-stone-500 hover:text-amber-500 flex items-center gap-0.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reiniciar
                </button>
              </span>
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-4">
                
                {/* Simulated Tuner comparator */}
                <div className="bg-stone-950 rounded-xl border border-stone-850 p-3 space-y-2 relative">
                  <div className="text-[9px] font-mono text-stone-500">Comparativo da Casa 12 (Harmônico vs Nota Presa)</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center pt-2">
                    <div className="p-2 bg-stone-900/60 rounded-lg border border-stone-850">
                      <div className="text-xxs text-stone-400 font-mono">Harmônico C12</div>
                      <div className="text-xl font-bold font-display text-emerald-400">E4 (0¢)</div>
                      <div className="text-[9px] font-mono text-stone-500">Afinado</div>
                    </div>

                    <div className={`p-2 rounded-lg border transition-colors ${
                      Math.abs(intonationCents) <= 2 
                        ? 'bg-emerald-950/20 border-emerald-500/30' 
                        : 'bg-stone-900/60 border-stone-850'
                    }`}>
                      <div className="text-xxs text-stone-400 font-mono">Presa C12</div>
                      <div className={`text-xl font-bold font-display ${
                        Math.abs(intonationCents) <= 2 
                          ? 'text-emerald-400' 
                          : intonationCents > 0 
                            ? 'text-amber-400' 
                            : 'text-amber-500'
                      }`}>
                        E4 ({intonationCents > 0 ? `+${intonationCents}` : intonationCents}¢)
                      </div>
                      <div className="text-[9px] font-mono text-stone-500">
                        {Math.abs(intonationCents) <= 2 ? 'Perfeito' : intonationCents > 0 ? 'Agudo (Curto)' : 'Grave (Longo)'}
                      </div>
                    </div>
                  </div>

                  {/* Cents meter needle */}
                  <div className="relative h-4 bg-stone-900 rounded-full overflow-hidden mt-1">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-700 -translate-x-1/2" />
                    <div 
                      className={`absolute top-0 bottom-0 w-1 transition-all duration-150 ${
                        Math.abs(intonationCents) <= 2 ? 'bg-emerald-400 w-1.5' : 'bg-amber-500'
                      }`}
                      style={{ left: `${50 + (intonationCents / 30) * 50}%`, transform: 'translateX(-50%)' }}
                    />
                  </div>
                </div>

                {/* Adjust buttons */}
                <div className="space-y-2">
                  <div className="text-xxs font-mono uppercase tracking-wider text-stone-400 text-center">Ajustar Parafuso do Carrinho (Saddle)</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      onClick={() => setIntonationCents(prev => Math.max(-30, prev - 6))}
                      className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 rounded-xl text-xs font-mono flex items-center justify-between sm:justify-center gap-1.5 border border-stone-700 transition-colors"
                    >
                      <span className="font-semibold text-stone-200">← Girar Horário</span>
                      <span className="text-stone-400 font-normal text-[10px] bg-stone-900/70 px-1.5 py-0.5 rounded border border-stone-700/60 shrink-0">(P/ trás)</span>
                    </button>
                    <button 
                      onClick={() => setIntonationCents(prev => Math.min(30, prev + 6))}
                      className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-100 rounded-xl text-xs font-mono flex items-center justify-between sm:justify-center gap-1.5 border border-stone-700 transition-colors"
                    >
                      <span className="font-semibold text-stone-200">Girar Anti-Horário →</span>
                      <span className="text-stone-400 font-normal text-[10px] bg-stone-900/70 px-1.5 py-0.5 rounded border border-stone-700/60 shrink-0">(P/ frente)</span>
                    </button>
                  </div>
                </div>

                {/* Explanatory text */}
                <div className="p-3 rounded-xl bg-stone-950 text-xxs leading-relaxed border border-stone-850">
                  {intonationCents > 2 ? (
                    <p className="text-stone-300"><strong className="text-amber-500">Oitava Aguda (+{intonationCents}¢):</strong> A nota presa está mais alta que o harmônico natural. Isso significa que a corda útil está muito curta. <strong className="text-stone-200">Como corrigir:</strong> Afaste o carrinho para trás (sentido contrário ao braço) girando o parafuso no <strong>sentido horário</strong>. Desafine a corda antes de ajustar para preservar a rosca do parafuso!</p>
                  ) : intonationCents < -2 ? (
                    <p className="text-stone-300"><strong className="text-amber-500">Oitava Grave ({intonationCents}¢):</strong> A nota presa está abaixo do tom de referência do harmônico. A corda útil está muito longa. <strong className="text-stone-200">Como corrigir:</strong> Mova o carrinho para a frente (direção ao braço) girando o parafuso no <strong>sentido anti-horário</strong>.</p>
                  ) : (
                    <p className="text-stone-300"><strong className="text-emerald-400">Parabéns, Entonado!</strong> A oitava bate perfeitamente com o harmônico. O instrumento está calibrado e soará afinado em qualquer região do braço.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CAPTADORES */}
        {selectedSection === 'captadores' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase tracking-wider">Módulo 4</span>
                <h3 className="text-lg font-bold font-display text-stone-100">Altura dos Captadores</h3>
              </div>
              <p className="text-xs text-stone-400">Regular os captadores equilibra a saída de som de cada corda e evita que o campo magnético atrapalhe o sustain.</p>
            </div>

            {/* Step-by-Step Checklist */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500">Procedimento Técnico (Passo a Passo)</span>
              <div className="space-y-2">
                {[
                  {
                    step: '1',
                    title: 'Pressionar a última casa',
                    desc: 'Prenda as cordas Mi grave (E) e Mi aguda (e) no último traste do braço simultaneamente.'
                  },
                  {
                    step: '2',
                    title: 'Medir a folga física',
                    desc: 'Com uma régua de precisão, meça a folga entre o topo do polo magnético do captador e a base da corda correspondente.'
                  },
                  {
                    step: '3',
                    title: 'Distâncias de Referência',
                    desc: 'Corda Mi Grave: ~3.5mm a 4.0mm (lado esquerdo). Corda Mi Aguda: ~2.0mm a 2.5mm (lado direito, mais perto por vibrar com menos amplitude).'
                  },
                  {
                    step: '4',
                    title: 'Cuidado com a "Stratitis"',
                    desc: 'Captadores muito próximos criam atração magnética excessiva sobre as cordas de aço. Isso causa perda drástica de sustain, som "bizarro" ou trastejado artificial, e desafinação espúria.'
                  }
                ].map((item) => (
                  <div key={item.step} className="p-3 bg-stone-900 border border-stone-850 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 rounded bg-amber-950 text-amber-500 flex items-center justify-center font-mono text-xxs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-stone-200">{item.title}</h4>
                      <p className="text-xxs text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Simulator */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500 flex justify-between items-center">
                <span>Simulador de Distância e "Stratitis"</span>
                <button 
                  onClick={() => setPickupHeight(1.2)}
                  className="text-stone-500 hover:text-amber-500 flex items-center gap-0.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reiniciar
                </button>
              </span>
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-4">
                
                {/* Graphical visualization of magnetic lines */}
                <div className="h-32 bg-stone-950 rounded-xl border border-stone-850 p-2 flex flex-col justify-between overflow-hidden relative">
                  <div className="text-[10px] font-mono text-stone-500 absolute top-2 left-2">Campo Magnético e Vibração</div>

                  <svg viewBox="0 0 200 90" className="w-full h-full mt-2">
                    {/* Guitar String vibrating */}
                    {/* The closer the pickup, the more distorted the wave represents */}
                    {(() => {
                      const amp = pickupHeight < 2.0 ? 1 : pickupHeight > 4.5 ? 4 : 3;
                      const waveColor = pickupHeight < 2.0 ? "#f87171" : pickupHeight > 4.5 ? "#60a5fa" : "#34d399";
                      const magnetY = 60 + (pickupHeight - 3.0) * 8;
                      
                      return (
                        <>
                          {/* Pulsing Magnetic Fields */}
                          {pickupHeight < 2.0 ? (
                            // Extreme chaotic fields (Stratitis)
                            <>
                              <path d={`M 100 ${magnetY} Q 60 ${magnetY - 20} 100 25`} fill="none" stroke="#f87171" strokeWidth="2.5" strokeDasharray="3,3" className="animate-pulse" />
                              <path d={`M 100 ${magnetY} Q 140 ${magnetY - 20} 100 25`} fill="none" stroke="#f87171" strokeWidth="2.5" strokeDasharray="3,3" className="animate-pulse" />
                              <text x="10" y="25" fill="#f87171" fontSize="6" fontFamily="monospace" className="animate-pulse">MAGNETIC PULL!</text>
                            </>
                          ) : pickupHeight > 4.5 ? (
                            // Weak fields
                            <path d={`M 100 ${magnetY} Q 75 ${magnetY - 15} 100 25`} fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="5,5" />
                          ) : (
                            // Perfect balanced fields
                            <>
                              <path d={`M 100 ${magnetY} Q 70 ${magnetY - 18} 100 25`} fill="none" stroke="#34d399" strokeWidth="1.2" strokeDasharray="4,4" />
                              <path d={`M 100 ${magnetY} Q 130 ${magnetY - 18} 100 25`} fill="none" stroke="#34d399" strokeWidth="1.2" strokeDasharray="4,4" />
                            </>
                          )}

                          {/* Vibrating string */}
                          <path 
                            d={`M 10 25 Q 100 ${25 + (pickupHeight < 2.0 ? 0.8 : Math.sin(Date.now() / 100) * amp)} 190 25`} 
                            fill="none" 
                            stroke={waveColor} 
                            strokeWidth="2.5" 
                          />

                          {/* Pickup Body */}
                          <rect x="70" y={magnetY} width="60" height="25" fill="#1c1917" rx="3" stroke="#44403c" strokeWidth="1" />
                          {/* Pole piece magnet */}
                          <circle cx="100" cy={magnetY + 6} r="4.5" fill="#a8a29e" />
                          <circle cx="85" cy={magnetY + 6} r="4.5" fill="#a8a29e" />
                          <circle cx="115" cy={magnetY + 6} r="4.5" fill="#a8a29e" />
                        </>
                      );
                    })()}
                  </svg>

                  <div className="flex justify-between items-center border-t border-stone-850 pt-1">
                    <span className="text-[10px] font-mono text-stone-400">Altura Regulada</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      pickupHeight < 2.0 
                        ? 'bg-red-950 text-red-400' 
                        : pickupHeight > 4.5 
                          ? 'bg-blue-950 text-blue-400' 
                          : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {pickupHeight.toFixed(1)} mm - {pickupHeight < 2.0 ? 'Efeito Stratitis!' : pickupHeight > 4.5 ? 'Som Fraco' : 'Ideal'}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-300">
                    <span className="font-medium">Distância para a Corda</span>
                    <span className="font-mono text-amber-500 font-bold">{pickupHeight.toFixed(1)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.5"
                    step="0.1"
                    value={pickupHeight}
                    onChange={(e) => setPickupHeight(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xxs font-mono text-stone-500">
                    <span>Próximo (Puxa ímã)</span>
                    <span>Ideal (2.5 - 3.5mm)</span>
                    <span>Longe (Sem brilho)</span>
                  </div>
                </div>

                {/* Feedback Panel */}
                <div className="p-3 rounded-xl bg-stone-950 text-xxs leading-relaxed border border-stone-850">
                  {pickupHeight < 2.0 ? (
                    <p className="text-stone-300"><strong className="text-red-400">Aviso Crítico (Stratitis):</strong> A distância de {pickupHeight.toFixed(1)}mm está curta demais. O ímã de Alnico/Cerâmico atrai demais a corda de aço, deformando sua vibração e causando distorções harmônicas e perda súbita de sustain. <strong className="text-stone-200">Como corrigir:</strong> Gire os parafusos laterais do captador para rebaixá-lo.</p>
                  ) : pickupHeight > 4.5 ? (
                    <p className="text-stone-300"><strong className="text-blue-400">Aviso (Sinal Fraco):</strong> Com {pickupHeight.toFixed(1)}mm de distância, o captador fica muito fora da zona do campo magnético útil, resultando em um som anêmico, volume muito baixo e agudos sem brilho dinâmico. <strong className="text-stone-200">Como corrigir:</strong> Gire os parafusos laterais para erguer o captador.</p>
                  ) : (
                    <p className="text-stone-300"><strong className="text-emerald-400">Timbre Sensacional:</strong> Altura ideal de {pickupHeight.toFixed(1)}mm. O campo magnético está em perfeita harmonia com a amplitude da corda, garantindo ótimo sustain e nível de saída limpo.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
