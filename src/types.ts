/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InstrumentType = 
  | 'guitar_6' 
  | 'guitar_7' 
  | 'guitar_8' 
  | 'bass_4' 
  | 'bass_5' 
  | 'bass_6'
  | 'viola_caipira'
  | 'cavaquinho'
  | 'ukulele';

export interface InstrumentString {
  number: number;
  note: string;
  octave: number;
  frequency: number; // Standard frequency in Hz
  label?: string;    // E.g., '1º Par', 'Bordão', etc.
}

export interface TuningPreset {
  id: string;
  name: string;
  description?: string;
  strings: InstrumentString[];
}

export interface InstrumentDefinition {
  id: InstrumentType;
  name: string;
  category: 'guitar' | 'bass' | 'brazilian' | 'acoustic';
  type: 'guitar' | 'bass' | 'viola' | 'cavaquinho' | 'ukulele';
  stringsCount: number;
  defaultTuningId: string;
  tunings: TuningPreset[];
  strings: InstrumentString[]; // Active default strings
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    description?: string;
  }[];
}

export interface DiagnosticAnswers {
  instrument?: string;
  stringsCount?: number;
  bridgeType?: string;
  mainProblem?: string;
}

export interface DiagnosticResult {
  title: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  probableCauses: string[];
  recommendedSteps: {
    title: string;
    sectionId: 'tensor' | 'acao' | 'oitavas' | 'captadores';
    description: string;
  }[];
}

export const INSTRUMENTS: Record<InstrumentType, InstrumentDefinition> = {
  guitar_6: {
    id: 'guitar_6',
    name: 'Guitarra/Violão (6 Cordas)',
    category: 'guitar',
    type: 'guitar',
    stringsCount: 6,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (E A D G B E)',
        description: 'Afinação padrão universal para violão e guitarra.',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'E', octave: 2, frequency: 82.41 },
        ]
      },
      {
        id: 'drop_d',
        name: 'Drop D (D A D G B E)',
        description: 'Baixa a 6ª corda em 1 tom para facilitar powerchords com 1 dedo.',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'D', octave: 2, frequency: 73.42 },
        ]
      },
      {
        id: 'half_step_down',
        name: 'Meio Tom Abaixo (Eb Ab Db Gb Bb Eb)',
        description: 'Usado por Jimi Hendrix, SRV, Guns N\' Roses para facilitar os vocais.',
        strings: [
          { number: 1, note: 'D#', octave: 4, frequency: 311.13 },
          { number: 2, note: 'A#', octave: 3, frequency: 233.08 },
          { number: 3, note: 'F#', octave: 3, frequency: 185.00 },
          { number: 4, note: 'C#', octave: 3, frequency: 138.59 },
          { number: 5, note: 'G#', octave: 2, frequency: 103.83 },
          { number: 6, note: 'D#', octave: 2, frequency: 77.78 },
        ]
      },
      {
        id: 'full_step_down',
        name: 'Tom Inteiro Abaixo (D Standard)',
        description: 'Todas as cordas afinadas 1 tom abaixo.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'A', octave: 3, frequency: 220.00 },
          { number: 3, note: 'F', octave: 3, frequency: 174.61 },
          { number: 4, note: 'C', octave: 3, frequency: 130.81 },
          { number: 5, note: 'G', octave: 2, frequency: 98.00 },
          { number: 6, note: 'D', octave: 2, frequency: 73.42 },
        ]
      },
      {
        id: 'open_d',
        name: 'Open D (D A D F# A D)',
        description: 'Afinação aberta em Ré Maior, perfeita para slide/bottleneck.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'A', octave: 3, frequency: 220.00 },
          { number: 3, note: 'F#', octave: 3, frequency: 185.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'D', octave: 2, frequency: 73.42 },
        ]
      },
      {
        id: 'open_g',
        name: 'Open G (D G D G B D)',
        description: 'Afinação aberta em Sol Maior (famosa nos Rolling Stones e Blues).',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'G', octave: 2, frequency: 98.00 },
          { number: 6, note: 'D', octave: 2, frequency: 73.42 },
        ]
      },
      {
        id: 'dadgad',
        name: 'DADGAD (Céltica)',
        description: 'Afinação aberta modal DADGAD, muito usada em fingerstyle e música folclórica.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'A', octave: 3, frequency: 220.00 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'D', octave: 2, frequency: 73.42 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'E', octave: 4, frequency: 329.63 },
      { number: 2, note: 'B', octave: 3, frequency: 246.94 },
      { number: 3, note: 'G', octave: 3, frequency: 196.00 },
      { number: 4, note: 'D', octave: 3, frequency: 146.83 },
      { number: 5, note: 'A', octave: 2, frequency: 110.00 },
      { number: 6, note: 'E', octave: 2, frequency: 82.41 },
    ],
  },
  guitar_7: {
    id: 'guitar_7',
    name: 'Guitarra (7 Cordas)',
    category: 'guitar',
    type: 'guitar',
    stringsCount: 7,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (B E A D G B E)',
        description: 'Adiciona a 7ª corda em Si grave (B1).',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'E', octave: 2, frequency: 82.41 },
          { number: 7, note: 'B', octave: 1, frequency: 61.74 },
        ]
      },
      {
        id: 'drop_a',
        name: 'Drop A (A E A D G B E)',
        description: 'Baixa a 7ª corda para Lá (A1).',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'E', octave: 2, frequency: 82.41 },
          { number: 7, note: 'A', octave: 1, frequency: 55.00 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'E', octave: 4, frequency: 329.63 },
      { number: 2, note: 'B', octave: 3, frequency: 246.94 },
      { number: 3, note: 'G', octave: 3, frequency: 196.00 },
      { number: 4, note: 'D', octave: 3, frequency: 146.83 },
      { number: 5, note: 'A', octave: 2, frequency: 110.00 },
      { number: 6, note: 'E', octave: 2, frequency: 82.41 },
      { number: 7, note: 'B', octave: 1, frequency: 61.74 },
    ],
  },
  guitar_8: {
    id: 'guitar_8',
    name: 'Guitarra (8 Cordas)',
    category: 'guitar',
    type: 'guitar',
    stringsCount: 8,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (F# B E A D G B E)',
        description: 'Adiciona F#1 e B1 nas cordas mais graves.',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'E', octave: 2, frequency: 82.41 },
          { number: 7, note: 'B', octave: 1, frequency: 61.74 },
          { number: 8, note: 'F#', octave: 1, frequency: 46.25 },
        ]
      },
      {
        id: 'drop_e',
        name: 'Drop E (E B E A D G B E)',
        description: 'Baixa a 8ª corda para Mi (E1).',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
          { number: 5, note: 'A', octave: 2, frequency: 110.00 },
          { number: 6, note: 'E', octave: 2, frequency: 82.41 },
          { number: 7, note: 'B', octave: 1, frequency: 61.74 },
          { number: 8, note: 'E', octave: 1, frequency: 41.20 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'E', octave: 4, frequency: 329.63 },
      { number: 2, note: 'B', octave: 3, frequency: 246.94 },
      { number: 3, note: 'G', octave: 3, frequency: 196.00 },
      { number: 4, note: 'D', octave: 3, frequency: 146.83 },
      { number: 5, note: 'A', octave: 2, frequency: 110.00 },
      { number: 6, note: 'E', octave: 2, frequency: 82.41 },
      { number: 7, note: 'B', octave: 1, frequency: 61.74 },
      { number: 8, note: 'F#', octave: 1, frequency: 46.25 },
    ],
  },
  bass_4: {
    id: 'bass_4',
    name: 'Contrabaixo (4 Cordas)',
    category: 'bass',
    type: 'bass',
    stringsCount: 4,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (E A D G)',
        description: 'Afinação padrão de contrabaixo elétrico de 4 cordas.',
        strings: [
          { number: 1, note: 'G', octave: 2, frequency: 98.00 },
          { number: 2, note: 'D', octave: 2, frequency: 73.42 },
          { number: 3, note: 'A', octave: 1, frequency: 55.00 },
          { number: 4, note: 'E', octave: 1, frequency: 41.20 },
        ]
      },
      {
        id: 'drop_d',
        name: 'Drop D (D A D G)',
        description: 'Baixa a 4ª corda para Ré grave (D1 = 36.7Hz).',
        strings: [
          { number: 1, note: 'G', octave: 2, frequency: 98.00 },
          { number: 2, note: 'D', octave: 2, frequency: 73.42 },
          { number: 3, note: 'A', octave: 1, frequency: 55.00 },
          { number: 4, note: 'D', octave: 1, frequency: 36.71 },
        ]
      },
      {
        id: 'half_step_down',
        name: 'Meio Tom Abaixo (Eb Ab Db Gb)',
        description: 'Afinado meio tom abaixo para rock/blues.',
        strings: [
          { number: 1, note: 'F#', octave: 2, frequency: 92.50 },
          { number: 2, note: 'C#', octave: 2, frequency: 69.30 },
          { number: 3, note: 'G#', octave: 1, frequency: 51.91 },
          { number: 4, note: 'D#', octave: 1, frequency: 38.89 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'G', octave: 2, frequency: 98.00 },
      { number: 2, note: 'D', octave: 2, frequency: 73.42 },
      { number: 3, note: 'A', octave: 1, frequency: 55.00 },
      { number: 4, note: 'E', octave: 1, frequency: 41.20 },
    ],
  },
  bass_5: {
    id: 'bass_5',
    name: 'Contrabaixo (5 Cordas)',
    category: 'bass',
    type: 'bass',
    stringsCount: 5,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (B E A D G)',
        description: 'Possui a 5ª corda em Si sub-grave (B0 = 30.87Hz).',
        strings: [
          { number: 1, note: 'G', octave: 2, frequency: 98.00 },
          { number: 2, note: 'D', octave: 2, frequency: 73.42 },
          { number: 3, note: 'A', octave: 1, frequency: 55.00 },
          { number: 4, note: 'E', octave: 1, frequency: 41.20 },
          { number: 5, note: 'B', octave: 0, frequency: 30.87 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'G', octave: 2, frequency: 98.00 },
      { number: 2, note: 'D', octave: 2, frequency: 73.42 },
      { number: 3, note: 'A', octave: 1, frequency: 55.00 },
      { number: 4, note: 'E', octave: 1, frequency: 41.20 },
      { number: 5, note: 'B', octave: 0, frequency: 30.87 },
    ],
  },
  bass_6: {
    id: 'bass_6',
    name: 'Contrabaixo (6 Cordas)',
    category: 'bass',
    type: 'bass',
    stringsCount: 6,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (B E A D G C)',
        description: 'Soma B0 no grave e C3 no agudo.',
        strings: [
          { number: 1, note: 'C', octave: 3, frequency: 130.81 },
          { number: 2, note: 'G', octave: 2, frequency: 98.00 },
          { number: 3, note: 'D', octave: 2, frequency: 73.42 },
          { number: 4, note: 'A', octave: 1, frequency: 55.00 },
          { number: 5, note: 'E', octave: 1, frequency: 41.20 },
          { number: 6, note: 'B', octave: 0, frequency: 30.87 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'C', octave: 3, frequency: 130.81 },
      { number: 2, note: 'G', octave: 2, frequency: 98.00 },
      { number: 3, note: 'D', octave: 2, frequency: 73.42 },
      { number: 4, note: 'A', octave: 1, frequency: 55.00 },
      { number: 5, note: 'E', octave: 1, frequency: 41.20 },
      { number: 6, note: 'B', octave: 0, frequency: 30.87 },
    ],
  },
  viola_caipira: {
    id: 'viola_caipira',
    name: 'Viola Caipira (10 Cordas / 5 Pares)',
    category: 'brazilian',
    type: 'viola',
    stringsCount: 10,
    defaultTuningId: 'cebolao_mi',
    tunings: [
      {
        id: 'cebolao_mi',
        name: 'Cebolão em Mi (E)',
        description: 'A afinação mais popular da Viola Caipira (Acorde Aberto de Mi Maior).',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63, label: '1º Par (Fina)' },
          { number: 2, note: 'E', octave: 4, frequency: 329.63, label: '1º Par (Fina)' },
          { number: 3, note: 'B', octave: 3, frequency: 246.94, label: '2º Par (Fina)' },
          { number: 4, note: 'B', octave: 3, frequency: 246.94, label: '2º Par (Fina)' },
          { number: 5, note: 'G#', octave: 4, frequency: 415.30, label: '3º Par (Aguda)' },
          { number: 6, note: 'G#', octave: 3, frequency: 207.65, label: '3º Par (Bordão)' },
          { number: 7, note: 'E', octave: 4, frequency: 329.63, label: '4º Par (Aguda)' },
          { number: 8, note: 'E', octave: 3, frequency: 164.81, label: '4º Par (Bordão)' },
          { number: 9, note: 'B', octave: 3, frequency: 246.94, label: '5º Par (Aguda)' },
          { number: 10, note: 'B', octave: 2, frequency: 123.47, label: '5º Par (Bordão)' },
        ]
      },
      {
        id: 'cebolao_re',
        name: 'Cebolão em Ré (D)',
        description: 'Tonalidade mais grave e aveludada em Ré Maior, perfeita para voz mais grave.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66, label: '1º Par (Fina)' },
          { number: 2, note: 'D', octave: 4, frequency: 293.66, label: '1º Par (Fina)' },
          { number: 3, note: 'A', octave: 3, frequency: 220.00, label: '2º Par (Fina)' },
          { number: 4, note: 'A', octave: 3, frequency: 220.00, label: '2º Par (Fina)' },
          { number: 5, note: 'F#', octave: 4, frequency: 369.99, label: '3º Par (Aguda)' },
          { number: 6, note: 'F#', octave: 3, frequency: 185.00, label: '3º Par (Bordão)' },
          { number: 7, note: 'D', octave: 4, frequency: 293.66, label: '4º Par (Aguda)' },
          { number: 8, note: 'D', octave: 3, frequency: 146.83, label: '4º Par (Bordão)' },
          { number: 9, note: 'A', octave: 3, frequency: 220.00, label: '5º Par (Aguda)' },
          { number: 10, note: 'A', octave: 2, frequency: 110.00, label: '5º Par (Bordão)' },
        ]
      },
      {
        id: 'rio_abaixo',
        name: 'Rio Abaixo (Sol / G)',
        description: 'Afinação mística em Sol Maior, ressonante e muito usada em ponteios clássicos.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66, label: '1º Par (Fina)' },
          { number: 2, note: 'D', octave: 4, frequency: 293.66, label: '1º Par (Fina)' },
          { number: 3, note: 'B', octave: 3, frequency: 246.94, label: '2º Par (Fina)' },
          { number: 4, note: 'B', octave: 3, frequency: 246.94, label: '2º Par (Fina)' },
          { number: 5, note: 'G', octave: 4, frequency: 392.00, label: '3º Par (Aguda)' },
          { number: 6, note: 'G', octave: 3, frequency: 196.00, label: '3º Par (Bordão)' },
          { number: 7, note: 'D', octave: 4, frequency: 293.66, label: '4º Par (Aguda)' },
          { number: 8, note: 'D', octave: 3, frequency: 146.83, label: '4º Par (Bordão)' },
          { number: 9, note: 'G', octave: 3, frequency: 196.00, label: '5º Par (Aguda)' },
          { number: 10, note: 'G', octave: 2, frequency: 98.00, label: '5º Par (Bordão)' },
        ]
      },
      {
        id: 'boiadeira',
        name: 'Boiadeira (Lá / A)',
        description: 'Tradicional da música caipira de raiz e comitiva sertaneja.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66, label: '1º Par (Fina)' },
          { number: 2, note: 'D', octave: 4, frequency: 293.66, label: '1º Par (Fina)' },
          { number: 3, note: 'A', octave: 3, frequency: 220.00, label: '2º Par (Fina)' },
          { number: 4, note: 'A', octave: 3, frequency: 220.00, label: '2º Par (Fina)' },
          { number: 5, note: 'F#', octave: 4, frequency: 369.99, label: '3º Par (Aguda)' },
          { number: 6, note: 'F#', octave: 3, frequency: 185.00, label: '3º Par (Bordão)' },
          { number: 7, note: 'D', octave: 4, frequency: 293.66, label: '4º Par (Aguda)' },
          { number: 8, note: 'D', octave: 3, frequency: 146.83, label: '4º Par (Bordão)' },
          { number: 9, note: 'G', octave: 3, frequency: 196.00, label: '5º Par (Aguda)' },
          { number: 10, note: 'G', octave: 2, frequency: 98.00, label: '5º Par (Bordão)' },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'E', octave: 4, frequency: 329.63, label: '1º Par (Fina)' },
      { number: 2, note: 'E', octave: 4, frequency: 329.63, label: '1º Par (Fina)' },
      { number: 3, note: 'B', octave: 3, frequency: 246.94, label: '2º Par (Fina)' },
      { number: 4, note: 'B', octave: 3, frequency: 246.94, label: '2º Par (Fina)' },
      { number: 5, note: 'G#', octave: 4, frequency: 415.30, label: '3º Par (Aguda)' },
      { number: 6, note: 'G#', octave: 3, frequency: 207.65, label: '3º Par (Bordão)' },
      { number: 7, note: 'E', octave: 4, frequency: 329.63, label: '4º Par (Aguda)' },
      { number: 8, note: 'E', octave: 3, frequency: 164.81, label: '4º Par (Bordão)' },
      { number: 9, note: 'B', octave: 3, frequency: 246.94, label: '5º Par (Aguda)' },
      { number: 10, note: 'B', octave: 2, frequency: 123.47, label: '5º Par (Bordão)' },
    ]
  },
  cavaquinho: {
    id: 'cavaquinho',
    name: 'Cavaquinho / Banjo (4 Cordas)',
    category: 'brazilian',
    type: 'cavaquinho',
    stringsCount: 4,
    defaultTuningId: 'standard',
    tunings: [
      {
        id: 'standard',
        name: 'Padrão (Ré - Si - Sol - Ré / D B G D)',
        description: 'Afinação padrão universal do Samba, Pagode e Choro.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
        ]
      },
      {
        id: 're_menor',
        name: 'Ré Menor (D Bb G D)',
        description: 'Muito utilizada no Choro antigo, valsas e serenatas melancólicas.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'A#', octave: 3, frequency: 233.08 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
        ]
      },
      {
        id: 'banjo_cavaco',
        name: 'Cavaco-Bandolim / Banjo (D A D G)',
        description: 'Afinação de quinta/quarta, sonoridade aberta e volumosa.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'A', octave: 3, frequency: 220.00 },
          { number: 3, note: 'D', octave: 3, frequency: 146.83 },
          { number: 4, note: 'G', octave: 2, frequency: 98.00 },
        ]
      },
      {
        id: 'cinco_de_ouro',
        name: 'Cinco de Ouro / Portuguesa (D B G G)',
        description: 'Estilo tradicional do cavaquinho minhoto e regional.',
        strings: [
          { number: 1, note: 'D', octave: 4, frequency: 293.66 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'G', octave: 2, frequency: 98.00 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'D', octave: 4, frequency: 293.66 },
      { number: 2, note: 'B', octave: 3, frequency: 246.94 },
      { number: 3, note: 'G', octave: 3, frequency: 196.00 },
      { number: 4, note: 'D', octave: 3, frequency: 146.83 },
    ]
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele (4 Cordas)',
    category: 'acoustic',
    type: 'ukulele',
    stringsCount: 4,
    defaultTuningId: 'standard_high_g',
    tunings: [
      {
        id: 'standard_high_g',
        name: 'Padrão High-G (G4 C4 E4 A4)',
        description: 'Afinação clássica reentrante dos Ukuleles Soprano, Concert e Tenor.',
        strings: [
          { number: 1, note: 'A', octave: 4, frequency: 440.00 },
          { number: 2, note: 'E', octave: 4, frequency: 329.63 },
          { number: 3, note: 'C', octave: 4, frequency: 261.63 },
          { number: 4, note: 'G', octave: 4, frequency: 392.00 },
        ]
      },
      {
        id: 'low_g',
        name: 'Low-G Linear (G3 C4 E4 A4)',
        description: 'Substitui a 4ª corda por um Sol mais grave (G3), dando maior alcance e sustain.',
        strings: [
          { number: 1, note: 'A', octave: 4, frequency: 440.00 },
          { number: 2, note: 'E', octave: 4, frequency: 329.63 },
          { number: 3, note: 'C', octave: 4, frequency: 261.63 },
          { number: 4, note: 'G', octave: 3, frequency: 196.00 },
        ]
      },
      {
        id: 'baritone',
        name: 'Ukulele Barítono (D3 G3 B3 E4)',
        description: 'Afinado idêntico às 4 cordas mais agudas da guitarra/violão.',
        strings: [
          { number: 1, note: 'E', octave: 4, frequency: 329.63 },
          { number: 2, note: 'B', octave: 3, frequency: 246.94 },
          { number: 3, note: 'G', octave: 3, frequency: 196.00 },
          { number: 4, note: 'D', octave: 3, frequency: 146.83 },
        ]
      },
      {
        id: 'd_tuning',
        name: 'D-Tuning (A4 D4 F#4 B4)',
        description: 'Afinação havaiana tradicional 1 tom acima (Soprano tradicional).',
        strings: [
          { number: 1, note: 'B', octave: 4, frequency: 493.88 },
          { number: 2, note: 'F#', octave: 4, frequency: 369.99 },
          { number: 3, note: 'D', octave: 4, frequency: 293.66 },
          { number: 4, note: 'A', octave: 4, frequency: 440.00 },
        ]
      }
    ],
    strings: [
      { number: 1, note: 'A', octave: 4, frequency: 440.00 },
      { number: 2, note: 'E', octave: 4, frequency: 329.63 },
      { number: 3, note: 'C', octave: 4, frequency: 261.63 },
      { number: 4, note: 'G', octave: 4, frequency: 392.00 },
    ]
  }
};
