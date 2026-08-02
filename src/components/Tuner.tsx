/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Mic, MicOff, Volume2, Settings2, Info } from 'lucide-react';
import { INSTRUMENTS, InstrumentType, InstrumentString, InstrumentDefinition } from '../types';

export default function Tuner({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const [selectedType, setSelectedType] = useState<InstrumentType>('guitar_6');
  const [selectedTuningId, setSelectedTuningId] = useState<string>('standard');
  const [isMicMode, setIsMicMode] = useState<boolean>(false);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [detectedNote, setDetectedNote] = useState<string>('--');
  const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
  const [centsDeviation, setCentsDeviation] = useState<number>(0);
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);
  const [playingStringIndex, setPlayingStringIndex] = useState<number | null>(null);
  const [soundTimbre, setSoundTimbre] = useState<'piano' | 'diapasao'>('piano');
  
  const isLight = theme === 'light';
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  const instrument: InstrumentDefinition = INSTRUMENTS[selectedType];
  const activeTuning = instrument.tunings.find(t => t.id === selectedTuningId) || instrument.tunings[0];
  const activeStrings = activeTuning ? activeTuning.strings : instrument.strings;

  // Stop any active synthesized sounds
  const stopSynthesizer = () => {
    activeOscillatorsRef.current.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    activeOscillatorsRef.current = [];
    setPlayingStringIndex(null);
  };

  // Play reference tones using the selected physical timbre emulation
  const playReferenceTone = (frequency: number, index: number, overrideTimbre?: 'piano' | 'diapasao') => {
    stopSynthesizer();
    setPlayingStringIndex(index);

    const activeTimbre = overrideTimbre || soundTimbre;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const osc4 = ctx.createOscillator();

      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      const gain3 = ctx.createGain();
      const gain4 = ctx.createGain();
      const masterGain = ctx.createGain();

      // Compensação Dinâmica de Graves (Curva Fletcher-Munson simplificada para equalização de fones/monitores)
      const isBass = frequency < 85; // Notas de Contra-baixo (ex: E1=41.2Hz, A1=55Hz, D2=73.4Hz)
      const isLowGuitar = frequency >= 85 && frequency < 150; // Notas graves de guitarra

      // Fator de boost para compensar perda natural de baixa frequência
      const bassBoostFactor = isBass ? 2.1 : (isLowGuitar ? 1.45 : 1.05);

      let type1: OscillatorType = 'sine';
      let type2: OscillatorType = 'sine';
      let type3: OscillatorType = 'sine';
      let type4: OscillatorType = 'sine';

      let freq1 = frequency;
      let freq2 = frequency * 2;
      let freq3 = frequency * 3;
      let freq4 = frequency * 4;

      let vol1 = 0.0;
      let vol2 = 0.0;
      let vol3 = 0.0;
      let vol4 = 0.0;

      const duration = 7.5; // Sustentação de 7.5 segundos
      const now = ctx.currentTime;

      if (activeTimbre === 'piano') {
        // TIMBRE DE PIANO: Síntese aditiva com leve desafinação natural e ataque percussivo de martelo de feltro
        type1 = 'sine';       // Fundamental (Corpo vibrante)
        type2 = 'sine';       // 2º Harmônico (Definição de pitch)
        type3 = 'sine';       // 3º Harmônico (Ressonância simpática)
        type4 = 'triangle';   // Transiente de ataque metálico/madeira do martelo

        // Leve desafinação harmônica inerente a pianos acústicos reais (chorus/unison natural)
        freq1 = frequency;
        freq2 = frequency * 2.0008;
        freq3 = frequency * 3.0015;
        freq4 = frequency * 4.0025;

        if (isBass) {
          vol1 = 0.55; 
          vol2 = 0.45; 
          vol3 = 0.20; 
          vol4 = 0.22; 
        } else if (isLowGuitar) {
          vol1 = 0.58;
          vol2 = 0.35;
          vol3 = 0.15;
          vol4 = 0.14;
        } else {
          vol1 = 0.65;
          vol2 = 0.25;
          vol3 = 0.08;
          vol4 = 0.08;
        }

        // --- Configuração dos Envelopes ADSR para Piano Natural ---
        // Fundamental: Rampa de ataque ultra rápida de 15ms (sem pop/clique digital) e sustentação longa
        osc1.type = type1;
        osc1.frequency.setValueAtTime(freq1, now);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        gain1.gain.setValueAtTime(0.0001, now);
        gain1.gain.exponentialRampToValueAtTime(vol1, now + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Oitava (2º Harmônico): Ataque de 12ms e decaimento um pouco mais rápido
        osc2.type = type2;
        osc2.frequency.setValueAtTime(freq2, now);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        gain2.gain.setValueAtTime(0.0001, now);
        gain2.gain.exponentialRampToValueAtTime(vol2, now + 0.012);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration - 1.5);

        // Quinta (3º Harmônico): Ataque de 18ms e decaimento médio
        osc3.type = type3;
        osc3.frequency.setValueAtTime(freq3, now);
        osc3.connect(gain3);
        gain3.connect(masterGain);
        gain3.gain.setValueAtTime(0.0001, now);
        gain3.gain.exponentialRampToValueAtTime(vol3, now + 0.018);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + duration - 3.2);

        // Martelada (Ataque transiente de alta frequência): Ataque imediato em 4ms e decaimento percussivo ultra rápido
        osc4.type = type4;
        osc4.frequency.setValueAtTime(freq4, now);
        osc4.connect(gain4);
        gain4.connect(masterGain);
        gain4.gain.setValueAtTime(0.0001, now);
        gain4.gain.exponentialRampToValueAtTime(vol4, now + 0.004);
        gain4.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      } 
      else {
        // TIMBRE DE DIAPASÃO: Onda senoidal pura de laboratório, com ataque super suave e linear (tipo sino)
        type1 = 'sine';
        freq1 = frequency;
        vol1 = 0.85;

        osc1.type = type1;
        osc1.frequency.setValueAtTime(freq1, now);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        gain1.gain.setValueAtTime(0.0001, now);
        gain1.gain.exponentialRampToValueAtTime(vol1, now + 0.08); // Ataque suave de 80ms
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Desliga os outros canais de forma limpa
        gain2.gain.setValueAtTime(0.0001, now);
        gain3.gain.setValueAtTime(0.0001, now);
        gain4.gain.setValueAtTime(0.0001, now);
      }

      // Master Gain aplicando o equalizador de compensação dinâmica de graves
      masterGain.gain.setValueAtTime(1.2 * bassBoostFactor, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      masterGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc4.start(now);

      osc1.stop(now + duration);
      osc2.stop(now + duration);
      osc3.stop(now + duration);
      osc4.stop(now + duration);

      activeOscillatorsRef.current = [osc1, osc2, osc3, osc4];

      // Reset do índice de execução ao término
      setTimeout(() => {
        if (playingStringIndex === index) {
          setPlayingStringIndex(null);
        }
      }, duration * 1000);
    } catch (e) {
      console.error("Erro ao iniciar áudio de referência:", e);
    }
  };

  // Pitch detection algorithm: Autocorrelation with noise filtering
  const performPitchDetection = () => {
    if (!analyserRef.current || !bufferRef.current) return;

    // Throttle frame processing to avoid high CPU usage and UI lag on lower-spec mobile devices
    const now = performance.now();
    if (now - lastProcessedTimeRef.current < 80) { // Limit calculation and state updates to ~12.5 updates per second
      animationFrameRef.current = requestAnimationFrame(performPitchDetection);
      return;
    }
    lastProcessedTimeRef.current = now;

    analyserRef.current.getFloatTimeDomainData(bufferRef.current);
    const buffer = bufferRef.current;
    const sampleRate = audioContextRef.current?.sampleRate || 44100;

    // 1. Calculate Signal RMS (Root Mean Square) for volume threshold
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    // If volume is too quiet, skip processing
    if (rms < 0.006) {
      setDetectedFreq(null);
      setDetectedNote('--');
      setCentsDeviation(0);
      setActiveStringIndex(null);
      animationFrameRef.current = requestAnimationFrame(performPitchDetection);
      return;
    }

    // 2. Autocorrelation Algorithm (Dynamic bounds based on selected instrument strings to dramatically reduce CPU footprint)
    const instrumentFrequencies = activeStrings.map(s => s.frequency);
    const lowestFreq = Math.min(...instrumentFrequencies);
    const highestFreq = Math.max(...instrumentFrequencies);

    // Give some padding below and above (e.g. 25% lower, 50% higher for harmonics)
    const minFreq = Math.max(25, lowestFreq * 0.75); // Ensure floor of 25Hz to handle low frequencies
    const maxFreq = Math.min(1200, highestFreq * 1.5); // Ceiling of 1200Hz

    const minOffset = Math.floor(sampleRate / maxFreq);
    const maxOffset = Math.ceil(sampleRate / minFreq);

    const correlations = new Float32Array(maxOffset + 1);

    for (let offset = minOffset; offset <= maxOffset; offset++) {
      let sum = 0;
      let weight = 0;
      for (let i = 0; i < buffer.length - offset; i++) {
        sum += buffer[i] * buffer[i + offset];
        weight += buffer[i] * buffer[i];
      }
      correlations[offset] = sum / (Math.sqrt(weight) || 1);
    }

    // Find the best correlation offset (excluding short offset/high frequency mirror loops)
    let maxCorr = -1;
    let bestOffset = -1;

    // Skip initial slopes
    let startIdx = minOffset;
    while (startIdx < maxOffset && correlations[startIdx] > correlations[startIdx + 1]) {
      startIdx++;
    }

    for (let i = startIdx; i <= maxOffset; i++) {
      if (correlations[i] > maxCorr && correlations[i] > correlations[i - 1] && correlations[i] > correlations[i + 1]) {
        maxCorr = correlations[i];
        bestOffset = i;
      }
    }

    // 3. Sub-pixel interpolation for precise cents tuning
    let frequency = -1;
    if (bestOffset !== -1 && bestOffset > minOffset && bestOffset < maxOffset) {
      const alpha = correlations[bestOffset - 1];
      const beta = correlations[bestOffset];
      const gamma = correlations[bestOffset + 1];
      const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma || 1);
      const refinedOffset = bestOffset + p;
      frequency = sampleRate / refinedOffset;
    } else if (bestOffset !== -1) {
      frequency = sampleRate / bestOffset;
    }

    // Valid frequency range check
    if (frequency > 25 && frequency < 1500) {
      setDetectedFreq(parseFloat(frequency.toFixed(1)));

      // Calculate matching note
      // f = 440 * 2^((n - 69) / 12)  =>  n = 12 * log2(f / 440) + 69
      const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const n = Math.round(12 * Math.log2(frequency / 440)) + 69;
      const noteName = noteNames[n % 12];
      const octave = Math.floor(n / 12) - 1;

      setDetectedNote(`${noteName}${octave}`);

      // Calculate deviation in cents to nearest target string of selected instrument
      // To provide targeted luthier tuning, we'll map to the closest string of the current instrument
      let closestStringIdx = 0;
      let minDiff = Infinity;

      activeStrings.forEach((str, idx) => {
        const diff = Math.abs(frequency - str.frequency);
        if (diff < minDiff) {
          minDiff = diff;
          closestStringIdx = idx;
        }
      });

      const targetString = activeStrings[closestStringIdx];
      setActiveStringIndex(closestStringIdx);

      // Cents = 1200 * log2( f_detected / f_target )
      const cents = Math.round(1200 * Math.log2(frequency / targetString.frequency));
      
      // Limit cents view to +/- 50 for gauge readability
      setCentsDeviation(Math.max(-50, Math.min(50, cents)));
    } else {
      setDetectedFreq(null);
      setDetectedNote('--');
      setCentsDeviation(0);
      setActiveStringIndex(null);
    }

    animationFrameRef.current = requestAnimationFrame(performPitchDetection);
  };

  // Toggle Microphone Stream
  const toggleMicMode = async () => {
    stopSynthesizer();

    if (isMicMode) {
      // Turn off microphone
      setIsMicMode(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setDetectedFreq(null);
      setDetectedNote('--');
      setCentsDeviation(0);
      setActiveStringIndex(null);
    } else {
      // Turn on microphone
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });
        } catch (initialErr) {
          console.warn("Attempting getUserMedia with simplified audio constraints:", initialErr);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true
          });
        }

        streamRef.current = stream;
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        // Set FFT size for high pitch resolution (1024 / 2048 / 4096)
        analyser.fftSize = 2048;
        source.connect(analyser);

        analyserRef.current = analyser;
        bufferRef.current = new Float32Array(analyser.fftSize);

        setMicGranted(true);
        setIsMicMode(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        setMicGranted(false);
        setIsMicMode(false);
      }
    }
  };

  // Run or stop animation frame on mic mode changes
  useEffect(() => {
    if (isMicMode) {
      performPitchDetection();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMicMode, selectedType, selectedTuningId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopSynthesizer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className={`flex flex-col h-full font-sans select-none overflow-y-auto transition-colors ${
      isLight ? 'bg-[#FAF8F5] text-stone-900' : 'bg-stone-950 text-stone-100'
    }`}>
      {/* Tuner Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isLight ? 'border-stone-200 bg-white' : 'border-stone-850 bg-stone-950'
      }`}>
        <div>
          <h2 className={`text-xl font-bold tracking-tight font-display ${
            isLight ? 'text-amber-700' : 'text-amber-500'
          }`}>Afinador Fino</h2>
          <p className={`text-xs ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>Manual (Ouvido) ou Automático (Mic)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMicMode}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center gap-2 text-xs font-medium shadow-sm ${
              isMicMode 
                ? isLight ? 'bg-amber-600 text-white shadow-amber-600/20' : 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' 
                : isLight ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
            }`}
            title="Ativar/Desativar Microfone"
          >
            {isMicMode ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMicMode ? 'Microfone Ativo' : 'Ativar Mic'}</span>
          </button>
        </div>
      </div>

      {/* Instrument Selection */}
      <div className="px-4 pt-4">
        <label className={`block text-xxs font-mono uppercase tracking-wider font-bold mb-1.5 ${
          isLight ? 'text-stone-500' : 'text-stone-400'
        }`}>Instrumento Selecionado</label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <div className={`text-[10px] font-mono mb-1 font-bold ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>GUITARRA / VIOLÃO</div>
            <div className="flex flex-col gap-1">
              {(['guitar_6', 'guitar_7', 'guitar_8'] as InstrumentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedTuningId(INSTRUMENTS[type].defaultTuningId);
                    stopSynthesizer();
                  }}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedType === type
                      ? isLight ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm font-semibold' : 'bg-amber-950/40 border-amber-500/60 text-amber-400 font-semibold'
                      : isLight ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                  }`}
                >
                  {INSTRUMENTS[type].name.split(' (')[0]} <span className="font-mono text-[10px] opacity-80">({INSTRUMENTS[type].stringsCount}C)</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className={`text-[10px] font-mono mb-1 font-bold ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>CONTRABAIXO</div>
            <div className="flex flex-col gap-1">
              {(['bass_4', 'bass_5', 'bass_6'] as InstrumentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedTuningId(INSTRUMENTS[type].defaultTuningId);
                    stopSynthesizer();
                  }}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedType === type
                      ? isLight ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm font-semibold' : 'bg-amber-950/40 border-amber-500/60 text-amber-400 font-semibold'
                      : isLight ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                  }`}
                >
                  {INSTRUMENTS[type].name.split(' (')[0]} <span className="font-mono text-[10px] opacity-80">({INSTRUMENTS[type].stringsCount}C)</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className={`text-[10px] font-mono mb-1 font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>REGIONAL & ACÚSTICO</div>
            <div className="flex flex-col gap-1">
              {(['viola_caipira', 'cavaquinho', 'ukulele'] as InstrumentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedTuningId(INSTRUMENTS[type].defaultTuningId);
                    stopSynthesizer();
                  }}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedType === type
                      ? isLight ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-sm font-semibold' : 'bg-amber-950/40 border-amber-500/60 text-amber-400 font-semibold'
                      : isLight ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                  }`}
                >
                  {INSTRUMENTS[type].name.split(' (')[0]} <span className="font-mono text-[10px] opacity-80">({INSTRUMENTS[type].stringsCount}C)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tuning Preset Selector */}
        {instrument.tunings && instrument.tunings.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-stone-200/60 dark:border-stone-850">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                Afinações Populares ({instrument.name.split(' (')[0]})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {instrument.tunings.map((tuning) => (
                <button
                  key={tuning.id}
                  onClick={() => {
                    setSelectedTuningId(tuning.id);
                    stopSynthesizer();
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedTuningId === tuning.id
                      ? isLight ? 'bg-amber-600 border-amber-600 text-white shadow-sm font-semibold' : 'bg-amber-500 border-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10'
                      : isLight ? 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100' : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
                  }`}
                >
                  {tuning.name}
                </button>
              ))}
            </div>
            {activeTuning && activeTuning.description && (
              <p className={`text-[11px] font-mono mt-1.5 italic ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                💡 {activeTuning.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tuner Gauge Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[200px]">
        {/* Dynamic Pitch Readout */}
        <div className="relative flex flex-col items-center mb-4">
          <div className={`font-mono text-xxs tracking-widest uppercase font-semibold ${
            isLight ? 'text-stone-500' : 'text-stone-500'
          }`}>NOTA DETECTADA</div>
          <div className={`text-7xl font-bold font-display tracking-tight flex items-baseline select-text ${
            isLight ? 'text-stone-900' : 'text-stone-50'
          }`}>
            {detectedNote !== '--' ? detectedNote.slice(0, -1) : '--'}
            {detectedNote !== '--' && (
              <span className={`text-2xl font-mono font-normal ml-1 ${
                isLight ? 'text-amber-700' : 'text-amber-500'
              }`}>
                {detectedNote.slice(-1)}
              </span>
            )}
          </div>
          
          <div className={`text-sm font-mono mt-1 h-5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
            {detectedFreq ? `${detectedFreq} Hz` : 'Silêncio...'}
          </div>

          {/* Cents Indicator Locking animation */}
          {isMicMode && detectedFreq && Math.abs(centsDeviation) <= 2 && (
            <div className={`absolute -top-7 px-2.5 py-0.5 rounded border text-[10px] font-mono tracking-widest animate-bounce ${
              isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold' : 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400'
            }`}>
              AFINADO!
            </div>
          )}
        </div>

        {/* Cents Gauge */}
        <div className="w-full max-w-xs px-2">
          {/* Cents Scale */}
          <div className={`flex justify-between text-[10px] font-mono mb-1 ${
            isLight ? 'text-stone-500' : 'text-stone-500'
          }`}>
            <span>-50 Cents</span>
            <span className={Math.abs(centsDeviation) <= 2 && detectedFreq ? "text-emerald-600 font-bold" : isLight ? "text-stone-700" : "text-stone-400"}>0</span>
            <span>+50 Cents</span>
          </div>

          {/* Scale gauge lines */}
          <div className={`relative h-6 rounded-full border flex items-center overflow-hidden ${
            isLight ? 'bg-stone-200/70 border-stone-300' : 'bg-stone-900 border-stone-800'
          }`}>
            {/* Center Lock Target */}
            <div className={`absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 z-10 ${
              isLight ? 'bg-stone-400' : 'bg-stone-700'
            }`} />
            <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-emerald-500/20 -translate-x-1/2 z-0" />

            {/* Scale points */}
            <div className={`absolute left-[25%] top-1/2 -translate-y-1/2 w-0.5 h-2 ${
              isLight ? 'bg-stone-300' : 'bg-stone-800'
            }`} />
            <div className={`absolute left-[75%] top-1/2 -translate-y-1/2 w-0.5 h-2 ${
              isLight ? 'bg-stone-300' : 'bg-stone-800'
            }`} />

            {/* Deviation pointer Needle */}
            {isMicMode && detectedFreq ? (
              <div
                className={`absolute top-0 bottom-0 w-1 transition-all duration-75 shadow-md ${
                  Math.abs(centsDeviation) <= 2 
                    ? 'bg-emerald-500 shadow-emerald-500/30 w-1.5' 
                    : centsDeviation < 0 
                      ? isLight ? 'bg-amber-600 shadow-amber-600/30' : 'bg-amber-500 shadow-amber-500/30' 
                      : isLight ? 'bg-amber-600 shadow-amber-600/30' : 'bg-amber-400 shadow-amber-400/30'
                }`}
                style={{ left: `${50 + centsDeviation}%`, transform: 'translateX(-50%)' }}
              />
            ) : null}
          </div>

          {/* Interactive Flat/Sharp text */}
          <div className="text-center text-[11px] font-mono mt-1.5 h-4">
            {isMicMode && detectedFreq ? (
              Math.abs(centsDeviation) <= 2 ? (
                <span className="text-emerald-600 font-bold">Nota perfeitamente afinada! (±2 cents)</span>
              ) : centsDeviation < 0 ? (
                <span className={isLight ? "text-amber-800 font-semibold" : "text-amber-500"}>Muito grave! Aperte um pouco a corda ({centsDeviation}¢)</span>
              ) : (
                <span className={isLight ? "text-amber-800 font-semibold" : "text-amber-400"}>Muito agudo! Solte um pouco a corda (+{centsDeviation}¢)</span>
              )
            ) : (
              <span className={isLight ? "text-stone-500" : "text-stone-500"}>Toque uma corda para analisar...</span>
            )}
          </div>
        </div>
      </div>

      {/* Manual String Pluck / Reference Tones */}
      <div className={`px-4 pb-6 border-t pt-4 ${
        isLight ? 'border-stone-200 bg-white' : 'border-stone-850 bg-stone-900/40'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xxs font-mono uppercase tracking-wider font-bold flex items-center gap-1 ${
            isLight ? 'text-stone-600' : 'text-stone-400'
          }`}>
            <Volume2 className="w-3.5 h-3.5" /> Notas de Referência ({activeTuning?.name || instrument.name})
          </span>
          {playingStringIndex !== null && (
            <button 
              onClick={stopSynthesizer}
              className={`text-xxs font-mono flex items-center gap-1 border rounded px-1.5 py-0.5 ${
                isLight ? 'text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100' : 'text-amber-500 border-amber-500/30 hover:text-amber-400'
              }`}
            >
              <Square className="w-2.5 h-2.5 fill-current" /> Parar Som
            </button>
          )}
        </div>

        {/* Chave Seletora de Timbre */}
        <div className={`mb-3 p-1.5 rounded-xl border flex items-center justify-between gap-2 max-w-sm mx-auto ${
          isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-800/80'
        }`}>
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider pl-1.5 ${
            isLight ? 'text-stone-600' : 'text-stone-400'
          }`}>Timbre:</span>
          <div className={`flex p-0.5 rounded-lg border ${
            isLight ? 'bg-white border-stone-200' : 'bg-stone-900 border-stone-850'
          }`}>
            {[
              { id: 'piano', label: 'Piano 🎹' },
              { id: 'diapasao', label: 'Diapasão 🔔' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSoundTimbre(option.id as any);
                  if (playingStringIndex !== null) {
                    const activeStr = activeStrings[playingStringIndex];
                    if (activeStr) {
                      playReferenceTone(activeStr.frequency, playingStringIndex, option.id as any);
                    }
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                  soundTimbre === option.id
                    ? isLight ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                    : isLight ? 'text-stone-600 hover:text-stone-900' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fretboard/Peg visual representation */}
        <div className="flex flex-col gap-2 max-w-sm mx-auto">
          {activeStrings.map((str, idx) => {
            const isClosest = isMicMode && activeStringIndex === idx;
            const isPlaying = playingStringIndex === idx;
            
            return (
              <button
                key={`${str.number}-${idx}-${str.note}`}
                onClick={() => playReferenceTone(str.frequency, idx)}
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between transition-all duration-200 relative overflow-hidden group ${
                  isPlaying 
                    ? isLight ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm' : 'bg-amber-500/10 border-amber-500/80 text-amber-400 shadow-md' 
                    : isClosest 
                      ? isLight ? 'bg-stone-100 border-amber-400 text-amber-800' : 'bg-stone-800 border-amber-500/40 text-amber-500' 
                      : isLight ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-300 hover:bg-stone-50 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                }`}
              >
                {/* Horizontal String Line under peg */}
                <div 
                  className={`absolute left-0 right-0 h-[1.5px] top-1/2 -translate-y-1/2 opacity-30 z-0 pointer-events-none ${
                    isPlaying ? isLight ? 'bg-amber-600 h-[3px] opacity-70' : 'bg-amber-500 h-[3px] opacity-60' : isLight ? 'bg-stone-300' : 'bg-stone-600'
                  }`}
                  style={{
                    height: `${0.8 + (activeStrings.length - str.number) * 0.3}px`
                  }}
                />

                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] shrink-0 ${
                    isPlaying 
                      ? isLight ? 'bg-amber-600 text-white font-bold' : 'bg-amber-500 text-stone-950 font-bold' 
                      : isLight ? 'bg-stone-200 text-stone-700' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {str.number}
                  </div>
                  <div className="text-left flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm font-display">{str.note}{str.octave}</span>
                    {str.label && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                        isLight ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      }`}>
                        {str.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10 font-mono text-xxs shrink-0">
                  <span className={isLight ? 'text-stone-500' : 'text-stone-400'}>{str.frequency} Hz</span>
                  <div className={`p-1.5 rounded-lg ${
                    isPlaying ? isLight ? 'bg-amber-600 text-white' : 'bg-amber-500 text-stone-950' : isLight ? 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800' : 'bg-stone-800 text-stone-400 group-hover:bg-stone-750'
                  }`}>
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mic permission helper state */}
      {micGranted === false && (
        <div className="p-3 bg-red-100 border-t border-red-300 text-red-800 text-xs font-mono text-center">
          Permissão de microfone negada. Acesse as configurações do seu navegador para habilitar a afinação em tempo real.
        </div>
      )}
    </div>
  );
}
