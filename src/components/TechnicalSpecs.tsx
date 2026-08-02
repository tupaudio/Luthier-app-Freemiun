/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, HelpCircle, Cpu, Code2, Layers, Check, ArrowRight } from 'lucide-react';

export default function TechnicalSpecs({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [activeSpecTab, setActiveSpecTab] = useState<'conteudo' | 'diagnostico' | 'stack' | 'codigo'>('conteudo');
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col h-full font-sans select-text overflow-y-auto transition-colors ${
      isLight ? 'bg-[#FAF8F5] text-stone-900' : 'bg-stone-900 text-stone-100'
    }`}>
      {/* Specs Header */}
      <div className={`p-5 border-b ${
        isLight ? 'border-stone-200 bg-white' : 'border-stone-800 bg-stone-950'
      }`}>
        <span className={`text-xxs font-mono uppercase tracking-wider font-bold ${
          isLight ? 'text-amber-700' : 'text-amber-500'
        }`}>Documentação de Engenharia</span>
        <h2 className={`text-2xl font-bold font-display tracking-tight mt-1 ${
          isLight ? 'text-stone-900' : 'text-stone-100'
        }`}>Luthier de Bolso — Especificação Técnica</h2>
        <p className={`text-xs mt-1 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>Análise de UX, Engenharia de Áudio, Algoritmos e Arquitetura Multiplataforma.</p>
      </div>

      {/* Spec Sub-tabs */}
      <div className={`flex border-b sticky top-0 z-10 px-2 overflow-x-auto gap-1 ${
        isLight ? 'border-stone-200 bg-stone-100/90 backdrop-blur-sm' : 'border-stone-800 bg-stone-950/80'
      }`}>
        {[
          { id: 'conteudo', label: '1. Conteúdo', icon: Layers },
          { id: 'diagnostico', label: '2. Diagnóstico', icon: HelpCircle },
          { id: 'stack', label: '3. Flutter vs RN', icon: Cpu },
          { id: 'codigo', label: '4. Exemplos de Código', icon: Code2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSpecTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSpecTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-mono font-medium flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? isLight ? 'border-amber-600 text-amber-800 font-bold bg-white' : 'border-amber-500 text-amber-400 font-bold bg-stone-900/50'
                  : isLight ? 'border-transparent text-stone-600 hover:text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6 space-y-6 max-w-4xl mx-auto w-full pb-12 leading-relaxed text-sm text-stone-300">
        
        {/* TAB 1: ARQUITETURA DE CONTEÚDO */}
        {activeSpecTab === 'conteudo' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display text-amber-500 mb-2">1. Organização do Conteúdo e Arquitetura de Informação</h3>
              <p className="text-xs text-stone-400">
                A estrutura do 'Luthier de Bolso' foi projetada para resolver a dor do músico que está com o instrumento trastejando ou desafinado e precisa de uma instrução imediata em um ambiente de manutenção caseira (bancada de improviso).
              </p>
            </div>

            {/* Content Tree visualization */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-xs text-stone-300 space-y-1.5 overflow-x-auto">
              <div className="text-amber-500 font-bold">Luthier de Bolso (Estrutura do App)</div>
              <div>├── [Afinador Fino (Tuner)] — <span className="text-stone-500">Módulo de medição rápida</span></div>
              <div>│   ├── Modo Manual (Notas de ouvido sintéticas)</div>
              <div>│   └── Modo Automático (Realtime Mic DSP Pitch Detection)</div>
              <div>│</div>
              <div>├── [Diagnóstico Inteligente (Checklist)] — <span className="text-stone-500">Mapeamento dinâmico de sintomas</span></div>
              <div>│   └── Seleção de Categoria → Filtro de Ponte → Identificação de Dor → Redirecionamento</div>
              <div>│</div>
              <div>└── [Guia Técnico de Manutenção] — <span className="text-stone-500">4 Submódulos Atômicos de Ajuste</span></div>
              <div>    ├── Seção 1: Alívio do Braço (Tensor)</div>
              <div>    ├── Seção 2: Altura das Cordas (Ação)</div>
              <div>    ├── Seção 3: Entonação e Oitavas (Ponte)</div>
              <div>    └── Seção 4: Altura dos Captadores (Timbre & Sustain)</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-stone-950/40 border border-stone-850 rounded-xl">
                <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold mb-2">A Filosofia do Conteúdo Atômico</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Diferente de tutoriais longos do YouTube, o app adota <strong>passos curtos, acionáveis e quantificáveis</strong>. Cada procedimento lida com uma variável física isolada (Ex: Alívio em mm, Ação em mm, Oitavas em Cents). Isso evita que o usuário faça múltiplos ajustes concorrentes e piore o estado do instrumento.
                </p>
              </div>

              <div className="p-4 bg-stone-950/40 border border-stone-850 rounded-xl">
                <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold mb-2">Prevenção contra Dano Colateral</h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  O conteúdo técnico é projetado defensivamente. O módulo do <strong>Tensor</strong> inclui a regra rígida do quarto de volta para evitar estresse na madeira ou quebra da barra de tensor. O módulo de <strong>Oitavas</strong> avisa para desafinar a corda antes de ajustar o saddle, evitando roscas espanadas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALGORITMO DE DIAGNÓSTICO */}
        {activeSpecTab === 'diagnostico' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display text-amber-500 mb-2">2. Algoritmo de Diagnóstico e Árvore de Decisão</h3>
              <p className="text-xs text-stone-400">
                A árvore lógica de decisão traduz sintomas subjetivos descritos pelo músico (Ex: "estalos metálicos ao tocar") em diagnósticos mecânicos específicos recomendando as ferramentas ideais.
              </p>
            </div>

            {/* Decision Matrix Table */}
            <div className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden">
              <div className="p-3 bg-stone-850 text-xxs font-mono text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800">
                Matriz de Mapeamento do Algoritmo
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400">
                    <th className="p-3">Sintoma Informado</th>
                    <th className="p-3">Provável Causa Física</th>
                    <th className="p-3">Ação Mecânica Indicada</th>
                    <th className="p-3 text-right">Direcionamento do Guia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850">
                  <tr>
                    <td className="p-3 font-medium text-stone-200">Trastejamento (primeiras casas)</td>
                    <td className="p-3 text-stone-400">Alívio insuficiente / tensor tenso</td>
                    <td className="p-3 text-amber-500">Soltar Tensor (Anti-horário)</td>
                    <td className="p-3 text-right text-stone-400">Guia de Tensor (Módulo 1)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-stone-200">Ação muito dura / cordas distantes</td>
                    <td className="p-3 text-stone-400">Curvatura excessiva ou saddles altos</td>
                    <td className="p-3 text-amber-500">Apertar Tensor e descer Saddles</td>
                    <td className="p-3 text-right text-stone-400">Módulos 1 (Tensor) e 2 (Ação)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-stone-200">Acorde afinado solto, mas desafina na casa 12</td>
                    <td className="p-3 text-stone-400">Escala desalinhada (saddle curto/longo)</td>
                    <td className="p-3 text-amber-500">Mover Saddle no parafuso traseiro</td>
                    <td className="p-3 text-right text-stone-400">Guia de Oitavas (Módulo 3)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-stone-200">Sustain curto / oscilação de afinação estranha</td>
                    <td className="p-3 text-stone-400">Efeito "Stratitis" (Ímã captador puxa corda)</td>
                    <td className="p-3 text-amber-500">Descer Altura dos Captadores</td>
                    <td className="p-3 text-right text-stone-400">Altura dos Captadores (Módulo 4)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-stone-500">Lógica Interna do Sistema (Representação de Estado)</span>
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-850 font-mono text-xs space-y-2">
                <p className="text-stone-400">// O Diagnóstico cruza o sintoma principal com as restrições da ponte</p>
                <p className="text-stone-100">
                  <span className="text-amber-500">const</span> diagnoseInstrument = (answers) =&gt; &#123;
                </p>
                <p className="text-stone-300 pl-4">
                  <span className="text-amber-500">if</span> (answers.mainProblem === <span className="text-emerald-400">'fret_buzz'</span>) &#123;
                </p>
                <p className="text-stone-400 pl-8">
                  return &#123; <br />
                  &nbsp;&nbsp;primarySection: <span className="text-emerald-400">'tensor'</span>,<br />
                  &nbsp;&nbsp;secondarySection: <span className="text-emerald-400">'acao'</span>,<br />
                  &nbsp;&nbsp;tools: answers.bridgeType.includes(<span className="text-emerald-400">'Floyd'</span>) ? <span className="text-emerald-400">'Chave Allen 3mm + 1.5mm'</span> : <span className="text-emerald-400">'Chave de fenda precision'</span><br />
                  &#125;;
                </p>
                <p className="text-stone-300 pl-4">&#125;</p>
                <p className="text-stone-100">&#125;</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANÁLISE DE STACK MULTIPLATAFORMA */}
        {activeSpecTab === 'stack' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display text-amber-500 mb-2">3. Comparativo de Stack Mobile: Flutter vs React Native</h3>
              <p className="text-xs text-stone-400">
                Uma análise técnica profunda focando em processamento de sinais de áudio em tempo real (FFT para afinadores) e fluidez de animações UI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Flutter column */}
              <div className="p-5 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-400 font-display">Flutter (Dart)</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/50">VENCEDOR DSP</span>
                </div>
                <p className="text-xs text-stone-300">
                  Flutter compila para código de máquina nativo e executa em uma thread única de alto desempenho integrada à engine gráfica Impeller/Skia.
                </p>
                <div className="space-y-1.5 text-xxs font-mono text-stone-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3 h-3" /> <span>FFT em Isolates de CPU nativos sem travar a UI</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3 h-3" /> <span>Latência de áudio ultra-baixa usando bibliotecas C++ (Oboe/AAudio)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3 h-3" /> <span>Excelente biblioteca Dart pitch_detector (autocorrelação)</span>
                  </div>
                </div>
                <div className="pt-2 text-xxs text-stone-500">
                  <strong>Recomendado para:</strong> Afinadores de alta fidelidade e instrumentos de baixíssima frequência (como contrabaixos de 5 e 6 cordas na casa dos 30Hz), onde o ruído de buffer e latência são críticos.
                </div>
              </div>

              {/* React Native column */}
              <div className="p-5 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-500 font-display">React Native (Expo)</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">RAPIDEZ PROTÓTIPO</span>
                </div>
                <p className="text-xs text-stone-300">
                  React Native executa o Javascript em threads separadas, comunicando-se com a UI nativa através do novo mecanismo de JSI (TurboModules).
                </p>
                <div className="space-y-1.5 text-xxs font-mono text-stone-400">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Check className="w-3 h-3" /> <span>Excelente ecossistema NPM e facilidade de layouts CSS/Tailwind</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Check className="w-3 h-3" /> <span>Animações fáceis via Reanimated 3</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400">
                    <span>⚠️ Javascript puro pode engasgar na FFT; exige escrever módulos nativos (C++ JSI)</span>
                  </div>
                </div>
                <div className="pt-2 text-xxs text-stone-500">
                  <strong>Recomendado para:</strong> Projetos com prazos agressivos de desenvolvimento web/mobile híbrido e afinadores simples que não exijam decodificação de frequências graves complexas fora da thread nativa.
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-950/10 border border-amber-500/20 rounded-xl text-xs">
              <strong className="text-amber-500 font-display">Veredito do Engenheiro Sênior:</strong> Se o seu principal requisito técnico é o <strong>processamento de áudio em tempo real com afinador preciso para baixo e guitarra de 8 cordas</strong>, escolha <strong>Flutter</strong>. A facilidade de despachar cálculos de transformada de Fourier e correlação cruzada em threads de Isolate em Dart nativo evita lag na renderização das animações do afinador, entregando a melhor experiência de usuário.
            </div>
          </div>
        )}

        {/* TAB 4: EXEMPLOS DE CÓDIGO */}
        {activeSpecTab === 'codigo' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display text-amber-500 mb-2">4. Protótipos de Código de Produção</h3>
              <p className="text-xs text-stone-400">
                Abaixo estão representações robustas de código mostrando como renderizar a seção de Alívio de Braço em ambas as plataformas.
              </p>
            </div>

            {/* Flutter Example */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-amber-400 font-bold">Exemplo em FLUTTER / DART</span>
              <pre className="p-4 bg-stone-950 rounded-xl border border-stone-850 text-xxs font-mono text-stone-300 overflow-x-auto max-h-80">
{`import 'package:flutter/material.dart';

class TrussRodGuideScreen extends StatefulWidget {
  @override
  _TrussRodGuideScreenState createState() => _TrussRodGuideScreenState();
}

class _TrussRodGuideScreenState extends State<TrussRodGuideScreen> {
  double _neckTension = 6.0; // Slider value: -10 to +10

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF0C0A09),
      appBar: AppBar(
        title: Text("Alívio do Braço (Tensor)", style: TextStyle(fontFamily: "SpaceGrotesk")),
        backgroundColor: Color(0xFF1C1917),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Informações técnicas
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Color(0xFF1C1917),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Color(0xFF292524)),
              ),
              child: Text(
                "Passo 1: Segure a casa 1 e a última. \\nPasso 2: Verifique a folga de ~0.3mm na casa 8.",
                style: TextStyle(color: Colors.stone[300], fontSize: 12),
              ),
            ),
            SizedBox(height: 20),
            
            // Visualizador Gráfico do Braço Curvado (CustomPainter)
            Container(
              height: 120,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(16),
              ),
              child: CustomPaint(
                painter: NeckCurvePainter(tension: _neckTension),
              ),
            ),
            
            Spacer(),
            
            // Controle deslizante interativo
            Slider(
              value: _neckTension,
              min: -10.0,
              max: 10.0,
              activeColor: Colors.amber,
              onChanged: (val) {
                setState(() {
                  _neckTension = val;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}`}
              </pre>
            </div>

            {/* React Native Example */}
            <div className="space-y-2">
              <span className="text-xxs font-mono uppercase tracking-wider text-amber-500 font-bold">Exemplo em REACT NATIVE (TSX + Tailwind CSS / NativeWind)</span>
              <pre className="p-4 bg-stone-950 rounded-xl border border-stone-850 text-xxs font-mono text-stone-300 overflow-x-auto max-h-80">
{`import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function TrussRodGuideScreen() {
  const [tension, setTension] = useState(6.0); // De -10 a 10

  return (
    <View className="flex-1 bg-stone-950 p-4">
      {/* Cabeçalho */}
      <Text className="text-stone-100 font-bold text-lg font-sans mb-1">
        Alívio do Braço (Tensor)
      </Text>
      <Text className="text-stone-400 text-xs mb-4">
        Lógica: Sentido horário aperta (reduz folga); anti-horário solta (aumenta curvatura).
      </Text>

      {/* Box Técnico */}
      <View className="bg-stone-900 border border-stone-800 p-4 rounded-xl mb-6">
        <Text className="text-stone-300 text-xs leading-relaxed">
          💡 <Text className="font-bold">Regra do Quarto de Volta:</Text> Ajuste devagar, faça movimentos pequenos de 90° e deixe a madeira respirar.
        </Text>
      </View>

      {/* Slider Interativo */}
      <View className="space-y-2 mt-auto">
        <View className="flex-row justify-between">
          <Text className="text-stone-300 text-xs">Curvatura Atual</Text>
          <Text className="text-amber-500 font-bold text-xs">{tension.toFixed(0)}</Text>
        </View>
        <Slider
          minimumValue={-10}
          maximumValue={10}
          step={1}
          value={tension}
          onValueChange={setTension}
          minimumTrackTintColor="#f59e0b"
          maximumTrackTintColor="#292524"
        />
      </View>
    </View>
  );
}`}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
