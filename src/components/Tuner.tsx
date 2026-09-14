/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Mic, MicOff, Volume2, Settings2, Info, Infinity as InfinityIcon, Clock } from 'lucide-react';
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
  
  // Som Contínuo: Ligado (infinito até clicar em Parar) / Desligado (5 segundos no mesmo volume)
  const [isContinuousSound, setIsContinuousSound] = useState<boolean>(() => {
    const saved = localStorage.getItem('luthier_continuous_sound');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('luthier_continuous_sound', String(isContinuousSound));
  }, [isContinuousSound]);

  const isLight = theme === 'light';
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterBusRef = useRef<GainNode | null>(null);
  const masterLimiterRef = useRef<DynamicsCompressorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const currentVoiceRef = useRef<{
    osc: OscillatorNode;
    gain: GainNode;
    filter?: BiquadFilterNode;
    timeoutId?: any;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  const instrument: InstrumentDefinition = INSTRUMENTS[selectedType];
  const activeTuning = instrument.tunings.find(t => t.id === selectedTuningId) || instrument.tunings[0];
  const activeStrings = activeTuning ? activeTuning.strings : instrument.strings;

  // Inicializador / Gerenciador do motor de áudio persistente com Limiter Anti-Clipping
  const getOrCreateAudioEngine = async (): Promise<{ ctx: AudioContext; bus: GainNode }> => {
    let ctx = audioContextRef.current;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContextClass({ latencyHint: 'interactive' });
      audioContextRef.current = ctx;

      // Limiter master de pico transparente com release suave:
      // Evita o efeito de "chatter" / chiado em notas graves (B0, E1, A1) causado por modulação de ciclo de onda
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-1.5, ctx.currentTime);
      limiter.knee.setValueAtTime(6, ctx.currentTime);
      limiter.ratio.setValueAtTime(10, ctx.currentTime);
      limiter.attack.setValueAtTime(0.005, ctx.currentTime);
      limiter.release.setValueAtTime(0.15, ctx.currentTime);
      limiter.connect(ctx.destination);
      masterLimiterRef.current = limiter;

      const bus = ctx.createGain();
      bus.gain.value = 0.90;
      bus.connect(limiter);
      masterBusRef.current = bus;
    }
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (!masterBusRef.current || !masterLimiterRef.current) {
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-1.5, ctx.currentTime);
      limiter.knee.setValueAtTime(6, ctx.currentTime);
      limiter.ratio.setValueAtTime(10, ctx.currentTime);
      limiter.attack.setValueAtTime(0.005, ctx.currentTime);
      limiter.release.setValueAtTime(0.15, ctx.currentTime);
      limiter.connect(ctx.destination);
      masterLimiterRef.current = limiter;

      const bus = ctx.createGain();
      bus.gain.value = 0.90;
      bus.connect(limiter);
      masterBusRef.current = bus;
    }
    return { ctx, bus: masterBusRef.current };
  };

  // Interrompe a voz ativa garantindo silêncio absoluto antes que qualquer nova voz comece
  const stopSynthesizer = (smooth = true) => {
    const voice = currentVoiceRef.current;
    if (voice?.timeoutId) {
      clearTimeout(voice.timeoutId);
    }

    if (voice && audioContextRef.current && audioContextRef.current.state === 'running') {
      try {
        const ctx = audioContextRef.current;
        const now = ctx.currentTime;
        const { osc, gain, filter } = voice;

        // Cancela toda automação pendente e captura o valor atual do gain
        gain.gain.cancelScheduledValues(now);
        const currentGain = Math.max(0.00001, gain.gain.value);
        gain.gain.setValueAtTime(currentGain, now);

        if (smooth) {
          // Fade linear rápido até zero em 15ms — imperceptível ao ouvido mas garante silêncio total
          gain.gain.linearRampToValueAtTime(0, now + 0.015);
          osc.stop(now + 0.018);
        } else {
          gain.gain.setValueAtTime(0, now);
          osc.stop(now + 0.003);
        }

        // Desconecta os nós do grafo apenas após o oscilador ter parado completamente
        setTimeout(() => {
          try { osc.disconnect(); } catch (e) {}
          try { filter?.disconnect(); } catch (e) {}
          try { gain.disconnect(); } catch (e) {}
        }, 40);

      } catch (e) {
        try { voice.osc.stop(); } catch (err) {}
      }
    } else if (voice) {
      try { voice.osc.stop(); } catch (e) {}
    }

    currentVoiceRef.current = null;
    setPlayingStringIndex(null);
  };

  // Alterna o modo de som contínuo
  const toggleContinuousSound = () => {
    setIsContinuousSound(prev => {
      const next = !prev;
      const voice = currentVoiceRef.current;
      if (next) {
        if (voice?.timeoutId) {
          clearTimeout(voice.timeoutId);
          voice.timeoutId = null;
        }
      } else {
        if (playingStringIndex !== null) {
          if (voice?.timeoutId) clearTimeout(voice.timeoutId);
          stopSynthesizer(true);
        }
      }
      return next;
    });
  };

  // Reproduz notas de referência com síntese acústica dedicada para Piano e Diapasão sem nenhum clique
  const playReferenceTone = async (frequency: number, index: number, overrideTimbre?: 'piano' | 'diapasao') => {
    // Se clicar na mesma corda que já está tocando, silencia
    if (playingStringIndex === index && !overrideTimbre) {
      stopSynthesizer(true);
      return;
    }

    // Interrompe qualquer nota anterior de forma limpa antes de soar a nova
    stopSynthesizer(true);
    setPlayingStringIndex(index);

    const activeTimbre = overrideTimbre || soundTimbre;

    try {
      const { ctx, bus } = await getOrCreateAudioEngine();
      const now = ctx.currentTime;
      // 50ms de lookahead: voz anterior para em T+18ms, nova começa em T+50ms
      // Garante 32ms de silêncio absoluto entre as duas vozes → sem interferência tonal
      const startTime = now + 0.050;

      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();

      // Volume balanceado: para graves profundos (< 65 Hz: B0, E1, A1), evitamos saturar a excursão mecânica do falante do celular
      const bassBoost = frequency < 65 ? 0.90 : (frequency < 135 ? 1.04 : 1.0);
      const targetVol = 0.30 * bassBoost;
      const isContinuous = isContinuousSound;
      let filter: BiquadFilterNode | undefined = undefined;
      let timeoutId: any = null;

      if (activeTimbre === 'diapasao') {
        // DIAPASÃO: Onda senoidal pura de altíssima fidelidade acústica
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);

        // Conexão DIRETA: Oscilador -> Ganho da Voz -> Barramento Mestre (com Limiter)
        // Sem filtro biquad no caminho do diapasão para evitar ruídos de coeficientes ou rotação de fase
        voiceGain.gain.value = 0;
        osc.connect(voiceGain);
        voiceGain.connect(bus);

        // Ataque linear contínuo a partir de ZERO absoluto em 60ms
        // Elimina 100% o estouro transitório (pop) característico do exponentialRamp em ondas senoidais puras
        voiceGain.gain.setValueAtTime(0, startTime);
        voiceGain.gain.linearRampToValueAtTime(targetVol * 0.78, startTime + 0.060);

        // Inicia oscilador precisamente em startTime
        osc.start(startTime);

        if (!isContinuous) {
          // Decaimento natural e sedoso de diapasão de aço afinador
          voiceGain.gain.exponentialRampToValueAtTime(targetVol * 0.40, startTime + 2.0);
          voiceGain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.8);
          voiceGain.gain.linearRampToValueAtTime(0, startTime + 3.95);
          osc.stop(startTime + 4.0);

          timeoutId = setTimeout(() => {
            setPlayingStringIndex(prev => prev === index ? null : prev);
          }, 4050);
        }
      } else {
        // TIMBRE ENCORPADO DE INSTRUMENTO ACÚSTICO / VIOLÃO / GUITARRA (PIANO):
        // Síntese harmônica fidedigna da vibração da corda de aço/nylon + ressonância dinâmica de tampo de madeira
        // Número de harmônicas ajustado dinamicamente para evitar aliasing acima de Nyquist (48 kHz → 24 kHz)
        const maxHarmonics = Math.min(16, Math.floor(24000 / frequency));
        const real = new Float32Array(maxHarmonics + 1);
        const imag = new Float32Array(maxHarmonics + 1);

        if (frequency < 70) {
          // Para notas subgraves (B0 ≈ 31Hz, E1 ≈ 41Hz, A1 ≈ 55Hz), alto-falantes de celular
          // distorcem fisicamente se a fundamental tiver amplitude excessiva.
          // Aplicamos o princípio psicoacústico da "fundamental ausente":
          // atenuamos a fundamental mecânica e enfatizamos os harmônicos superiores (oitava e quinta),
          // resultando em um som encorpado, nítido e 100% livre de chiado ou raspagem:
          if (maxHarmonics >= 1) imag[1] = 0.55;  // Fundamental controlada contra saturação
          if (maxHarmonics >= 2) imag[2] = 0.85;  // 1ª Oitava encorpada e nítida no alto-falante
          if (maxHarmonics >= 3) imag[3] = 0.50;  // 5ª Justa (definição e calor tonal)
          if (maxHarmonics >= 4) imag[4] = 0.25;  // 2ª Oitava
          if (maxHarmonics >= 5) imag[5] = 0.10;  // 3ª Maior
          if (maxHarmonics >= 6) imag[6] = 0.04;  // Harmônicos superiores suaves
          if (maxHarmonics >= 7) imag[7] = 0.015;
          if (maxHarmonics >= 8) imag[8] = 0.005;
        } else {
          // Preenchimento padrão para notas médias e agudas
          if (maxHarmonics >= 1) imag[1] = 1.0;   // Fundamental
          if (maxHarmonics >= 2) imag[2] = 0.52;  // 1ª Oitava
          if (maxHarmonics >= 3) imag[3] = 0.28;  // 5ª Justa
          if (maxHarmonics >= 4) imag[4] = 0.14;  // 2ª Oitava
          if (maxHarmonics >= 5) imag[5] = 0.07;  // 3ª Maior
          if (maxHarmonics >= 6) imag[6] = 0.035; // Ressonância da madeira
          if (maxHarmonics >= 7) imag[7] = 0.018; // Ataque suave
          if (maxHarmonics >= 8) imag[8] = 0.008; // Ar e ambiência
        }

        const customWave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
        osc.setPeriodicWave(customWave);
        osc.frequency.setValueAtTime(frequency, startTime);

        filter = ctx.createBiquadFilter();
        // Cadeia acústica: Oscilador -> Filtro Dinâmico -> Ganho da Voz -> Barramento
        osc.connect(filter);
        filter.connect(voiceGain);
        voiceGain.connect(bus);

        // Filtro acústico com Q musical suave (0.75): sem picos de ressonância agressivos que chiem no celular
        filter.type = 'lowpass';
        filter.Q.value = 0.75;
        const initialCutoff = Math.min(3600, Math.max(700, frequency * 5.0));
        const warmCutoff = Math.min(1600, Math.max(350, frequency * 2.0));

        filter.frequency.setValueAtTime(initialCutoff, startTime);
        filter.frequency.exponentialRampToValueAtTime(warmCutoff, startTime + 0.35);

        // Ataque orgânico exponencial de 40ms (livre de descontinuidade)
        voiceGain.gain.value = 0.00001;
        voiceGain.gain.setValueAtTime(0.00001, startTime);
        voiceGain.gain.exponentialRampToValueAtTime(targetVol, startTime + 0.040);

        // Inicia oscilador no relógio DSP
        osc.start(startTime);

        if (!isContinuous) {
          // Sustentação acústica natural com leve decaimento como numa corda real
          voiceGain.gain.exponentialRampToValueAtTime(targetVol * 0.72, startTime + 1.8);
          // Fade musical progressivo até o limiar de silêncio
          voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.8);
          // Rampa linear contínua para zero absoluto antes do corte do oscilador
          voiceGain.gain.linearRampToValueAtTime(0, startTime + 3.9);
          osc.stop(startTime + 3.95);

          timeoutId = setTimeout(() => {
            setPlayingStringIndex(prev => prev === index ? null : prev);
          }, 4020);
        }
      }

      currentVoiceRef.current = {
        osc,
        gain: voiceGain,
        filter,
        timeoutId,
      };
    } catch (e) {
      console.error("Erro ao reproduzir áudio de referência:", e);
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
      if (micSourceRef.current) {
        try { micSourceRef.current.disconnect(); } catch (e) {}
        micSourceRef.current = null;
      }
      if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch (e) {}
        analyserRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
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
        
        const { ctx } = await getOrCreateAudioEngine();

        const source = ctx.createMediaStreamSource(stream);
        micSourceRef.current = source;
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

  // Monitora o ciclo de vida do app (segundo plano / retorno) para estabilizar o pipeline de áudio no Android
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // App foi para segundo plano (ou tela bloqueada): silencia síntese e suspende AudioContext
        stopSynthesizer(false);
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          try {
            await audioContextRef.current.suspend();
          } catch (e) {}
        }
      } else if (document.visibilityState === 'visible') {
        // App retornou para primeiro plano: acorda o relógio DSP sem instabilidade
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          try {
            await audioContextRef.current.resume();
          } catch (e) {}
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup áudio completo ao desmontar o componente
  useEffect(() => {
    return () => {
      stopSynthesizer(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (micSourceRef.current) {
        try { micSourceRef.current.disconnect(); } catch (e) {}
        micSourceRef.current = null;
      }
      if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch (e) {}
        analyserRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
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
            <Volume2 className="w-3.5 h-3.5 text-amber-500" /> Notas de Referência ({activeTuning?.name || instrument.name})
          </span>
        </div>

        {/* Controles de Reprodução: Som Contínuo & Timbre */}
        <div className={`mb-3 p-2 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 max-w-md mx-auto ${
          isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-800/80'
        }`}>
          {/* Chave de Som Contínuo Ligado / Desligado */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider pl-1 ${
              isLight ? 'text-stone-600' : 'text-stone-400'
            }`}>
              Som Contínuo:
            </span>
            <button
              onClick={toggleContinuousSound}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
                isContinuousSound
                  ? isLight 
                    ? 'bg-amber-600 border-amber-600 text-white shadow-amber-600/10' 
                    : 'bg-amber-500 border-amber-500 text-stone-950 shadow-amber-500/20'
                  : isLight 
                    ? 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100' 
                    : 'bg-stone-900 border-stone-750 text-stone-300 hover:text-white hover:bg-stone-850'
              }`}
              title={
                isContinuousSound 
                  ? "Som contínuo LIGADO: a nota toca sem parar até você clicar em Parar na corda" 
                  : "Som contínuo DESLIGADO: a nota toca 3 segundos no mesmo volume + 1 segundo de fade out"
              }
            >
              {isContinuousSound ? (
                <>
                  <InfinityIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ligado</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Desligado (3s + 1s)</span>
                </>
              )}
            </button>
          </div>

          {/* Seletor de Timbre */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-stone-200/80 dark:border-stone-800/80">
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider pl-1 sm:hidden ${
              isLight ? 'text-stone-600' : 'text-stone-400'
            }`}>
              Timbre:
            </span>
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
        </div>

        {/* Fretboard/Peg visual representation */}
        <div className="flex flex-col gap-2 max-w-md mx-auto">
          {activeStrings.map((str, idx) => {
            const isClosest = isMicMode && activeStringIndex === idx;
            const isPlaying = playingStringIndex === idx;
            
            return (
              <button
                key={`${str.number}-${idx}-${str.note}`}
                onClick={() => playReferenceTone(str.frequency, idx)}
                className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between transition-all duration-200 relative overflow-hidden group ${
                  isPlaying 
                    ? isLight ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-1 ring-amber-500/50' : 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40' 
                    : isClosest 
                      ? isLight ? 'bg-stone-100 border-amber-400 text-amber-800' : 'bg-stone-800 border-amber-500/40 text-amber-500' 
                      : isLight ? 'bg-white border-stone-200 text-stone-800 hover:border-amber-300 hover:bg-stone-50 shadow-sm' : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-750 hover:bg-stone-850'
                }`}
                title={isPlaying ? "Clique para parar o som" : `Tocar ${str.note}${str.octave} (${str.frequency} Hz)`}
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
                  <div className={`px-2 py-1 rounded-lg flex items-center gap-1 font-bold transition-all ${
                    isPlaying 
                      ? isLight 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-red-500 text-stone-950 shadow-sm' 
                      : isLight 
                        ? 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800' 
                        : 'bg-stone-800 text-stone-400 group-hover:bg-stone-750'
                  }`}>
                    {isPlaying ? (
                      <>
                        <Square className="w-2.5 h-2.5 fill-current" />
                        <span>Parar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Tocar</span>
                      </>
                    )}
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
