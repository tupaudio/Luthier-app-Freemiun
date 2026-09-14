/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, RotateCcw, Wrench, ShieldAlert, CheckCircle2, HelpCircle, Bell, Calendar, Sparkles, Check, Clock } from 'lucide-react';
import { DiagnosticAnswers, DiagnosticResult } from '../types';

interface DiagnosticWizardProps {
  onRedirectToSection: (sectionId: 'tensor' | 'acao' | 'oitavas' | 'captadores') => void;
  theme?: 'dark' | 'light';
  plan?: 'free' | 'pro';
  onTogglePlan?: () => void;
}

export default function DiagnosticWizard({ onRedirectToSection, theme = 'dark', plan = 'free', onTogglePlan }: DiagnosticWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<DiagnosticAnswers>({});

  // Free Version Maintenance State
  const [lastFreeMaintDate, setLastFreeMaintDate] = useState<string>(() => {
    return localStorage.getItem('luthier_free_maint_date') || new Date().toISOString().split('T')[0];
  });
  const [freeToastMsg, setFreeToastMsg] = useState<string | null>(null);

  const isLight = theme === 'light';

  // Calculate next maintenance date (6 months from last maintenance)
  const getNextMaintDateFormatted = () => {
    try {
      const date = new Date(lastFreeMaintDate);
      date.setMonth(date.getMonth() + 6);
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'Em 6 meses';
    }
  };

  const handleRegisterFreeMaintenance = () => {
    const today = new Date().toISOString().split('T')[0];
    setLastFreeMaintDate(today);
    localStorage.setItem('luthier_free_maint_date', today);
    triggerFreeNotification('🎉 Manutenção registrada! Próxima revisão agendada para daqui a 6 meses.');
  };

  const triggerFreeNotification = (customMsg?: string) => {
    const msg = customMsg || '🔔 "Oi, sou seu equipamento e estou precisando de uma limpeza e ajuste!"';
    setFreeToastMsg(msg);
    setTimeout(() => {
      setFreeToastMsg(null);
    }, 5000);
  };

  const resetWizard = () => {
    setAnswers({});
    setStep(1);
  };

  const setAnswer = (key: keyof DiagnosticAnswers, value: any) => {
    const updated = { ...answers, [key]: value };
    
    // Auto-branching logic
    if (key === 'instrument') {
      // Clean up stringsCount if switching between guitar and bass
      updated.stringsCount = value === 'guitar' ? 6 : 4;
      setAnswers(updated);
      setStep(2);
    } else if (key === 'stringsCount') {
      setAnswers(updated);
      setStep(3);
    } else if (key === 'bridgeType') {
      setAnswers(updated);
      setStep(4);
    } else if (key === 'mainProblem') {
      setAnswers(updated);
      setStep(5); // Show results!
    }
  };

  // Diagnostic logical mapping
  const getDiagnosticResult = (): DiagnosticResult => {
    const { instrument, bridgeType, mainProblem } = answers;
    const isBass = instrument === 'bass';

    if (mainProblem === 'fret_buzz') {
      return {
        title: 'Trastejamento (Fret Buzz) Identificado',
        severity: 'medium',
        explanation: `As suas cordas estão vibrando e chocando-se contra os trastes de metal. No caso de uma ponte tipo "${bridgeType || 'padrão'}", a causa geralmente reside em um braço excessivamente plano/convexa (falta de curvatura saudável no tensor) ou saddles baixos demais.`,
        probableCauses: [
          'Alívio do braço inadequado (tensor muito apertado, braço convexo)',
          'Altura das cordas (ação) baixa demais na ponte',
          'Trastes desnivelados ou soltos (pode necessitar de retífica em casos severos)',
          'Ajuste inadequado das molas (se for ponte flutuante)'
        ],
        recommendedSteps: [
          {
            title: '1. Verificar e regular o Tensor (Alívio do Braço)',
            sectionId: 'tensor',
            description: 'Daremos ao braço uma sutil curvatura côncava para que as cordas tenham espaço para vibrar livremente nas primeiras casas.'
          },
          {
            title: '2. Ajustar os Carrinhos na Ponte (Ação)',
            sectionId: 'acao',
            description: 'Se após o ajuste do tensor o estalo persistir nas casas mais altas (do traste 12 em diante), eleve ligeiramente a altura das cordas na ponte.'
          }
        ]
      };
    }

    if (mainProblem === 'high_action') {
      return {
        title: 'Corda Alta e Dura (Ação Excessiva)',
        severity: 'medium',
        explanation: 'As cordas estão muito distantes da escala, exigindo força excessiva dos dedos. Isso tensiona demais a musculatura, prejudica a velocidade e deforma a afinação quando as notas são pressionadas.',
        probableCauses: [
          'Tensor frouxo demais (braço com muita folga côncava, parecendo um arco)',
          'Carrinhos (saddles) da ponte regulados altos demais',
          'Canais do capotraste (pestana/nut) rasos demais'
        ],
        recommendedSteps: [
          {
            title: '1. Avaliar Alívio do Braço (Tensor)',
            sectionId: 'tensor',
            description: 'Apertaremos ligeiramente o tensor (sentido horário) para endireitar o braço e aproximar as cordas no meio da escala (casas 5 a 9).'
          },
          {
            title: '2. Regular a Altura das Cordas (Ação)',
            sectionId: 'acao',
            description: 'Após regular o braço, utilizaremos chaves Allen ou de fenda para descer os saddles da ponte até a altura de referência (1.5mm a 2.5mm).'
          }
        ]
      };
    }

    if (mainProblem === 'bad_intonation') {
      return {
        title: 'Desafinação de Oitavas (Problema de Entonação)',
        severity: 'high',
        explanation: 'O seu instrumento afina solto, mas as notas soam desafinadas à medida que você sobe no braço (casas mais altas). A escala física do instrumento não está batendo com a escala matemática da vibração das cordas.',
        probableCauses: [
          'Carrinhos da ponte (saddles) posicionados muito para frente ou muito para trás',
          'Cordas muito velhas, gastas ou deformadas (perdem a densidade uniforme)',
          'Altura das cordas excessivamente alta, esticando a corda demais ao pressioná-la'
        ],
        recommendedSteps: [
          {
            title: '1. Ajustar os Carrinhos de Entonação',
            sectionId: 'oitavas',
            description: 'Faremos o teste do traste 12 (compara harmônico vs fretted) e moveremos os carrinhos para trás (se agudo) ou para frente (se grave).'
          },
          {
            title: '2. Validar Altura Geral das Cordas',
            sectionId: 'acao',
            description: 'Garanta que as cordas não estejam excessivamente altas, pois a força de empurrar a corda até o traste afeta negativamente a intonação.'
          }
        ]
      };
    }

    if (mainProblem === 'pickup_issue') {
      return {
        title: 'Interferência Magnética ou Som Apagado',
        severity: 'medium',
        explanation: `Você relata problemas com sustain curto, som estranhamente distorcido ou modulações de afinação bizarras nas casas mais altas. Em instrumentos ${isBass ? 'de baixo' : 'de guitarra'}, isso se chama clássica "Stratitis": os captadores estão puxando as cordas magneticamente.`,
        probableCauses: [
          'Captadores excessivamente altos (campo magnético sufoca a vibração natural)',
          'Volume desbalanceado entre graves e agudos por inclinação incorreta do captador'
        ],
        recommendedSteps: [
          {
            title: '1. Regular Altura dos Captadores',
            sectionId: 'captadores',
            description: 'Pressionaremos as cordas na última casa e mediremos a folga ideal (3-4mm na bobina grave e 2-3mm na aguda) para liberar o sustain de volta.'
          }
        ]
      };
    }

    // Default/Tuning stability fallback
    return {
      title: 'Inabilidade de Manter Afinação Geral',
      severity: 'low',
      explanation: 'Seu instrumento perde a afinação muito rápido ao tocar, fazer bends ou variações térmicas. Isso raramente está ligado à ponte ou captadores, e sim ao atrito físico.',
      probableCauses: [
        'Corda prendendo nas fendas do nut/pestana (provoca estalos ao afinar)',
        'Cordas novas que não foram pré-esticadas',
        'Parafusos das tarraxas frouxos ou voltas de corda soltas no poste'
      ],
      recommendedSteps: [
        {
          title: '1. Verificar Pontos de Atrito',
          sectionId: 'tensor',
          description: 'Acesse o nosso guia. Lubrifique as fendas da pestana com grafite em pó para eliminar o travamento.'
        }
      ]
    };
  };

  const result = step === 5 ? getDiagnosticResult() : null;

  return (
    <div className={`flex flex-col h-full font-sans select-none overflow-y-auto transition-colors relative ${
      isLight ? 'bg-[#FAF8F5] text-stone-900' : 'bg-stone-950 text-stone-100'
    }`}>
      {/* Toast Notification Alert */}
      {freeToastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 p-4 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl shadow-amber-500/30 border border-amber-400 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <span className="leading-snug">{freeToastMsg}</span>
          </div>
          <button 
            onClick={() => setFreeToastMsg(null)}
            className="p-1 rounded-lg bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 font-black text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Wizard Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isLight ? 'border-stone-200 bg-white' : 'border-stone-850 bg-stone-950'
      }`}>
        <div className="flex items-center gap-2">
          {step > 1 && step < 5 && (
            <button 
              onClick={() => setStep(step - 1)}
              className={`p-1.5 rounded-xl border transition-colors ${
                isLight ? 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200' : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className={`text-xl font-bold tracking-tight font-display ${
              isLight ? 'text-amber-700' : 'text-amber-500'
            }`}>
              Diagnóstico Inteligente
            </h2>
            <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
              Encontre o problema e saiba onde agir
            </p>
          </div>
        </div>
        {step > 1 && (
          <button 
            onClick={resetWizard}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono ${
              isLight ? 'text-stone-600 hover:text-amber-700 hover:bg-amber-50' : 'text-stone-400 hover:text-amber-500 hover:bg-stone-900'
            }`}
            title="Reiniciar diagnóstico"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Steps Visual Progress */}
      {step < 5 && (
        <div className="px-4 pt-3 flex gap-1">
          {[1, 2, 3, 4].map((num) => (
            <div 
              key={num} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                num <= step 
                  ? isLight ? 'bg-amber-600' : 'bg-amber-500' 
                  : isLight ? 'bg-stone-200' : 'bg-stone-850'
              }`}
            />
          ))}
        </div>
      )}

      {/* Questionnaire Body */}
      <div className="flex-1 p-4 flex flex-col justify-center space-y-6">
        
        {/* Free Maintenance Reminder Banner (Only visible in Free Plan) */}
        {step === 1 && plan === 'free' && (
          <div className={`p-4.5 rounded-2xl border shadow-md space-y-3 max-w-md mx-auto w-full transition-all ${
            isLight ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-amber-200' : 'bg-gradient-to-br from-amber-500/15 via-amber-950/20 to-stone-900 border-amber-500/30'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/20">
                  <Bell className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className={`text-xs font-extrabold uppercase font-mono tracking-wider ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                    Lembrete de Manutenção Semestral
                  </h3>
                  <p className={`text-xxs font-medium ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    {plan === 'free' ? 'Versão Gratuita • Ciclo de 6 meses' : 'Lembrete Rápido • Versão PRO Ativa'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                A cada 6 meses
              </span>
            </div>

            {/* Single Free Maintenance Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleRegisterFreeMaintenance}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Limpar e ajustar meus equipamentos</span>
              </button>

              <div className="flex items-center justify-between px-1 text-xxs font-mono text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Próxima: <strong className={isLight ? 'text-stone-700' : 'text-stone-200'}>{getNextMaintDateFormatted()}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => triggerFreeNotification()}
                  className={`underline hover:text-amber-400 transition-colors ${isLight ? 'text-stone-600' : 'text-stone-400'}`}
                  title="Simular disparo de lembrete"
                >
                  Testar Notificação
                </button>
              </div>
            </div>

            {plan === 'free' && onTogglePlan && (
              <div className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xxs ${
                isLight ? 'bg-white/80 border-amber-200 text-stone-700' : 'bg-stone-950/80 border-amber-500/20 text-stone-300'
              }`}>
                <span className="line-clamp-2">
                  ✨ Quer cadastrar vários instrumentos separadamente e alterar a periodicidade?
                </span>
                <button
                  type="button"
                  onClick={onTogglePlan}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-extrabold font-mono flex-shrink-0 transition-colors border border-amber-500/30"
                >
                  Ativar PRO
                </button>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 max-w-md mx-auto w-full">
            <div className="text-center mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                isLight ? 'bg-amber-100 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <Wrench className={`w-5 h-5 ${isLight ? 'text-amber-700' : 'text-amber-500'}`} />
              </div>
              <h3 className={`text-base font-semibold font-display ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Ou inicie um Diagnóstico de Regulagem:
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Selecione a categoria para alinhar as medidas
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setAnswer('instrument', 'guitar')}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${
                  answers.instrument === 'guitar' 
                    ? isLight ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-amber-500/10 border-amber-500 text-amber-400' 
                    : isLight ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-stone-50 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                }`}
              >
                <div>
                  <div className={`font-semibold text-sm ${isLight ? 'group-hover:text-amber-700' : 'group-hover:text-amber-400'}`}>
                    Guitarra ou Violão
                  </div>
                  <div className={`text-xs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>
                    Instrumentos de 6, 7 ou 8 cordas, de aço ou nylon.
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-colors ${
                  isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'
                }`} />
              </button>

              <button
                onClick={() => setAnswer('instrument', 'bass')}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${
                  answers.instrument === 'bass' 
                    ? isLight ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-amber-500/10 border-amber-500 text-amber-400' 
                    : isLight ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-stone-50 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                }`}
              >
                <div>
                  <div className={`font-semibold text-sm ${isLight ? 'group-hover:text-amber-700' : 'group-hover:text-amber-400'}`}>
                    Contrabaixo Elétrico
                  </div>
                  <div className={`text-xs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>
                    Baixos de 4, 5 ou 6 cordas de grande escala.
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-colors ${
                  isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'
                }`} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className={`text-base font-semibold font-display ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Quantas cordas possui?
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Necessário para mapear as frequências corretas de teste
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {answers.instrument === 'guitar' ? (
                <>
                  {[6, 7, 8].map((count) => (
                    <button
                      key={count}
                      onClick={() => setAnswer('stringsCount', count)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                        isLight
                          ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm'
                          : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                      }`}
                    >
                      <span className="font-medium text-sm">{count} Cordas {count === 6 ? '(Afinação Padrão Mi/E)' : ''}</span>
                      <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[4, 5, 6].map((count) => (
                    <button
                      key={count}
                      onClick={() => setAnswer('stringsCount', count)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                        isLight
                          ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm'
                          : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                      }`}
                    >
                      <span className="font-medium text-sm">{count} Cordas {count === 4 ? '(Padrão E-A-D-G)' : ''}</span>
                      <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className={`text-base font-semibold font-display ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Qual o tipo de ponte?
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                A ponte determina a lógica de ajuste de oitavas e ação
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {answers.instrument === 'guitar' ? (
                <>
                  <button
                    onClick={() => setAnswer('bridgeType', 'Fixa (Hardtail)')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isLight 
                        ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm' 
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm">Ponte Fixa / Hardtail</div>
                      <div className={`text-xxs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>Cordas fixas que passam pelo corpo ou ponte parafusada.</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                  </button>

                  <button
                    onClick={() => setAnswer('bridgeType', 'Flutuante / Floyd Rose')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isLight 
                        ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm' 
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm">Ponte Flutuante / Floyd Rose / Tremolo</div>
                      <div className={`text-xxs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>Ponte móvel com molas traseiras e alavanca.</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                  </button>

                  <button
                    onClick={() => setAnswer('bridgeType', 'Tune-o-matic')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isLight 
                        ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm' 
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm">Tune-O-Matic (Estilo Gibson)</div>
                      <div className={`text-xxs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>Ponte dividida em duas peças (saddle bar + tailpiece).</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAnswer('bridgeType', 'Ponte Standard de Baixo')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isLight 
                        ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm' 
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm">Ponte Padrão (L-Plate)</div>
                      <div className={`text-xxs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>Ponte clássica em chapa de metal em L, saddles cilíndricos.</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                  </button>

                  <button
                    onClick={() => setAnswer('bridgeType', 'Monorail Individual')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isLight 
                        ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50 shadow-sm' 
                        : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-sm">Pontes Monorail / Individuais</div>
                      <div className={`text-xxs mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-500'}`}>Cada corda possui uma ponte fisicamente separada.</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isLight ? 'text-stone-400 group-hover:text-amber-600' : 'text-stone-500 group-hover:text-amber-500'}`} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 max-w-md mx-auto w-full">
            <div className="text-center mb-6">
              <h3 className={`text-base font-semibold font-display font-bold ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Qual o problema principal?
              </h3>
              <p className={`text-xs mt-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Selecione o sintoma que mais incomoda ao tocar
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { id: 'fret_buzz', num: '1', title: 'Trastejamento (Fret Buzz)', desc: 'Cordas batem nos trastes de metal produzindo estalos e ruídos.' },
                { id: 'high_action', num: '2', title: 'Corda Muito Alta e Dura', desc: 'Falta de maciez, as cordas estão muito distantes da escala.' },
                { id: 'bad_intonation', num: '3', title: 'Desafina no meio do braço', desc: 'As oitavas estão desafinadas (nota solta bate afinada, mas presa desafina).' },
                { id: 'pickup_issue', num: '4', title: 'Som estranho/sem sustain', desc: 'Sustain curto, som distorcido ou vibração instável (Stratitis).' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAnswer('mainProblem', item.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all group flex items-start gap-3 ${
                    isLight 
                      ? 'bg-white border-stone-200 hover:border-amber-500 hover:bg-amber-50/50 shadow-sm' 
                      : 'border-stone-800 bg-stone-900 hover:border-amber-500/50 hover:bg-amber-950/10'
                  }`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5 ${
                    isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {item.num}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${
                      isLight ? 'text-stone-900 group-hover:text-amber-700' : 'text-stone-100 group-hover:text-amber-400'
                    }`}>
                      {item.title}
                    </div>
                    <div className={`text-xxs mt-0.5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Results Screen */}
        {step === 5 && result && (
          <div className="space-y-4 max-w-lg mx-auto w-full py-2">
            {/* Severity and Title */}
            <div className={`p-4.5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-stone-200' : 'bg-stone-900 border-stone-800'
            }`}>
              {/* Gravity badge in separate block above title */}
              <div className="mb-3">
                {result.severity === 'high' ? (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono uppercase font-bold tracking-wider ${
                    isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/80 text-red-400 border-red-900/60'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Gravidade Alta
                  </span>
                ) : result.severity === 'medium' ? (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono uppercase font-bold tracking-wider ${
                    isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-950/80 text-amber-400 border-amber-900/60'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Gravidade Média
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono uppercase font-bold tracking-wider ${
                    isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/80 text-blue-400 border-blue-900/60'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Gravidade Baixa
                  </span>
                )}
              </div>
              
              <div className="flex items-start gap-2 mb-2">
                <ShieldAlert className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  result.severity === 'high' ? 'text-red-500' : isLight ? 'text-amber-600' : 'text-amber-400'
                }`} />
                <h3 className={`text-base font-bold font-display ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                  {result.title}
                </h3>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                {result.explanation}
              </p>
            </div>

            {/* Probable Causes */}
            <div className="space-y-1.5">
              <span className={`text-xxs font-mono uppercase tracking-wider font-bold ${
                isLight ? 'text-stone-500' : 'text-stone-500'
              }`}>Causas Prováveis</span>
              <div className={`rounded-xl border p-3.5 space-y-2 ${
                isLight ? 'bg-stone-50/80 border-stone-200' : 'bg-stone-900/40 border-stone-850'
              }`}>
                {result.probableCauses.map((cause, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      isLight ? 'text-amber-600' : 'text-amber-500/70'
                    }`} />
                    <span>{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Steps with Redirection */}
            <div className="space-y-2">
              <span className={`text-xxs font-mono uppercase tracking-wider font-bold ${
                isLight ? 'text-stone-500' : 'text-stone-500'
              }`}>Procedimento Técnico Recomendado</span>
              <div className="flex flex-col gap-2">
                {result.recommendedSteps.map((recStep, i) => (
                  <div 
                    key={i} 
                    className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 group transition-all ${
                      isLight 
                        ? 'bg-white border-stone-200 hover:border-amber-400 shadow-sm' 
                        : 'bg-stone-900 border-stone-800 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className={`text-xs font-semibold transition-colors ${
                        isLight ? 'text-stone-900 group-hover:text-amber-700' : 'text-stone-100 group-hover:text-amber-400'
                      }`}>{recStep.title}</h4>
                      <p className={`text-xxs mt-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>{recStep.description}</p>
                    </div>
                    <button
                      onClick={() => onRedirectToSection(recStep.sectionId)}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold text-[11px] flex items-center gap-1 flex-shrink-0 transition-colors shadow-sm ${
                        isLight
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>AJUSTAR</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={resetWizard}
                className={`flex-1 py-2.5 rounded-xl border font-medium text-xs transition-colors shadow-sm ${
                  isLight 
                    ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100' 
                    : 'border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-850'
                }`}
              >
                Fazer Outro Diagnóstico
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

