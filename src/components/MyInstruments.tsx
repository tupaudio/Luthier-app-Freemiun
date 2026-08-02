import React, { useState, useEffect } from 'react';
import { 
  Guitar, 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Sliders, 
  Clock, 
  ChevronRight, 
  Check, 
  MessageSquareHeart,
  Volume2,
  ShieldCheck,
  Edit2
} from 'lucide-react';

export type InstrumentType = 'baixo' | 'guitarra' | 'violao';
export type MaintenanceTaskType = 'limpeza' | 'eletrica' | 'cordas' | 'regulagem';

export interface MaintenanceReminder {
  task: MaintenanceTaskType;
  enabled: boolean;
  intervalMonths: number; // 1, 3, 6, 12
  lastDoneDate: string; // YYYY-MM-DD
}

export interface InstrumentItem {
  id: string;
  name: string;
  type: InstrumentType;
  brandModel: string;
  reminders: MaintenanceReminder[];
}

interface MyInstrumentsProps {
  theme: 'dark' | 'light';
  plan?: 'free' | 'pro';
  onTogglePlan?: () => void;
}

const DEFAULT_REMINDERS: MaintenanceReminder[] = [
  { task: 'limpeza', enabled: true, intervalMonths: 3, lastDoneDate: new Date(Date.now() - 75 * 86400000).toISOString().split('T')[0] },
  { task: 'eletrica', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 120 * 86400000).toISOString().split('T')[0] },
  { task: 'cordas', enabled: true, intervalMonths: 1, lastDoneDate: new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0] },
  { task: 'regulagem', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 150 * 86400000).toISOString().split('T')[0] },
];

const INITIAL_INSTRUMENTS: InstrumentItem[] = [
  {
    id: 'inst-1',
    name: 'Meu Baixo Principal',
    type: 'baixo',
    brandModel: 'Fender Jazz Bass 4-Cordas',
    reminders: [
      { task: 'limpeza', enabled: true, intervalMonths: 3, lastDoneDate: new Date(Date.now() - 100 * 86400000).toISOString().split('T')[0] },
      { task: 'eletrica', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 190 * 86400000).toISOString().split('T')[0] },
      { task: 'cordas', enabled: true, intervalMonths: 3, lastDoneDate: new Date(Date.now() - 80 * 86400000).toISOString().split('T')[0] },
      { task: 'regulagem', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 160 * 86400000).toISOString().split('T')[0] },
    ]
  },
  {
    id: 'inst-2',
    name: 'Guitarra Solo',
    type: 'guitarra',
    brandModel: 'Tagima TG-530 Stratocaster',
    reminders: [
      { task: 'limpeza', enabled: true, intervalMonths: 3, lastDoneDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0] },
      { task: 'eletrica', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0] },
      { task: 'cordas', enabled: true, intervalMonths: 1, lastDoneDate: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0] },
      { task: 'regulagem', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0] },
    ]
  },
  {
    id: 'inst-3',
    name: 'Violão Aço',
    type: 'violao',
    brandModel: 'Giannini Performance Folk',
    reminders: [
      { task: 'limpeza', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 120 * 86400000).toISOString().split('T')[0] },
      { task: 'eletrica', enabled: false, intervalMonths: 6, lastDoneDate: new Date().toISOString().split('T')[0] },
      { task: 'cordas', enabled: true, intervalMonths: 3, lastDoneDate: new Date(Date.now() - 85 * 86400000).toISOString().split('T')[0] },
      { task: 'regulagem', enabled: true, intervalMonths: 6, lastDoneDate: new Date(Date.now() - 140 * 86400000).toISOString().split('T')[0] },
    ]
  }
];

export const TASK_LABELS: Record<MaintenanceTaskType, { title: string; desc: string; icon: string }> = {
  limpeza: { title: 'Limpeza & Hidratação', desc: 'Limpeza do corpo e hidratação da escala com óleo de limão', icon: '✨' },
  eletrica: { title: 'Limpeza Elétrica', desc: 'Descarbonização de pots, chave seletora e lubrificação do jack', icon: '⚡' },
  cordas: { title: 'Troca de Cordas', desc: 'Substituição do jogo de cordas e esticamento inicial', icon: '🎸' },
  regulagem: { title: 'Regulagem Geral', desc: 'Checkup completo de tensor, altura de cordas e oitavas', icon: '🔧' }
};

export const TASK_FRIENDLY_QUOTES: Record<InstrumentType, Record<MaintenanceTaskType, string>> = {
  baixo: {
    limpeza: 'Oi! Sou seu Baixo 🎸 e a minha escala está precisando de uma boa limpeza e hidratação!',
    eletrica: 'Ei, sou seu Baixo ⚡! Meus potenciômetros estão chiando, que tal uma limpeza nos contatos elétricos?',
    cordas: 'Olá! Sou seu Baixo 🎵 e minhas cordas estão perdendo o brilho do grave. Hora de trocar!',
    regulagem: 'Oi! Sou seu Baixo 🔧! Já faz um tempo... Que tal ajustar meu tensor e a ação das minhas cordas?'
  },
  guitarra: {
    limpeza: 'Oi! Sou sua Guitarra ✨ e estou precisando de um trato no corpo e na escala!',
    eletrica: 'Ei! Sou sua Guitarra ⚡ e meus potenciômetros e chave seletora pedem uma limpeza elétrica!',
    cordas: 'Olá! Sou sua Guitarra 🎸 e minhas cordas já estão gastas. Que tal pôr um jogo novo?',
    regulagem: 'Oi! Sou sua Guitarra 🔧! Minhas oitavas e altura de cordas precisam de uma conferida na bancada.'
  },
  violao: {
    limpeza: 'Oi! Sou seu Violão 🪵 e meu tampo e escala precisam de uma limpeza delicada!',
    eletrica: 'Ei! Sou seu Violão ⚡! Vamos checar o captador/preamp e trocar a bateria de 9V?',
    cordas: 'Olá! Sou seu Violão 🪕 e minhas cordas perderam o timbre acústico cristalino!',
    regulagem: 'Oi! Sou seu Violão 🔧! A ação das minhas cordas está alta, vamos checar o rastilho e tensor?'
  }
};

export default function MyInstruments({ theme, plan = 'free', onTogglePlan }: MyInstrumentsProps) {
  const isLight = theme === 'light';

  // Instruments list state with LocalStorage persistence
  const [instruments, setInstruments] = useState<InstrumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('luthier_my_instruments');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load instruments', e);
    }
    return INITIAL_INSTRUMENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('luthier_my_instruments', JSON.stringify(instruments));
    } catch (e) {
      console.error('Failed to save instruments', e);
    }
  }, [instruments]);

  // Quick stats count
  const countBaixos = instruments.filter(i => i.type === 'baixo').length;
  const countGuitarras = instruments.filter(i => i.type === 'guitarra').length;
  const countVioloes = instruments.filter(i => i.type === 'violao').length;

  // New/Edit Instrument Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingInstId, setEditingInstId] = useState<string | null>(null);
  const [instFormName, setInstFormName] = useState('');
  const [instFormType, setInstFormType] = useState<InstrumentType>('guitarra');
  const [instFormBrand, setInstFormBrand] = useState('');

  // Delete Confirmation Modal State
  const [deletingInstId, setDeletingInstId] = useState<string | null>(null);

  // Selected Notification Preview Toast
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Open modal for NEW instrument
  const handleOpenAddModal = (type?: InstrumentType) => {
    if (plan === 'free' && onTogglePlan) {
      onTogglePlan();
      setActiveToast('✨ Plano PRO ativado para cadastrar e personalizar seus instrumentos!');
      setTimeout(() => setActiveToast(null), 4000);
    }
    setEditingInstId(null);
    setInstFormType(type || 'guitarra');
    setInstFormName('');
    setInstFormBrand('');
    setShowFormModal(true);
  };

  // Open modal for EDITING instrument
  const handleOpenEditModal = (inst: InstrumentItem) => {
    setEditingInstId(inst.id);
    setInstFormType(inst.type);
    setInstFormName(inst.name);
    setInstFormBrand(inst.brandModel);
    setShowFormModal(true);
  };

  // Save instrument (Create or Edit)
  const handleSaveInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instFormName.trim()) return;

    if (editingInstId) {
      // Edit existing
      setInstruments(prev => prev.map(inst => {
        if (inst.id !== editingInstId) return inst;
        return {
          ...inst,
          name: instFormName.trim(),
          type: instFormType,
          brandModel: instFormBrand.trim() || `${instFormType === 'baixo' ? 'Baixo' : instFormType === 'guitarra' ? 'Guitarra' : 'Violão'} Custom`
        };
      }));
      setActiveToast(`✏️ Instrumento "${instFormName.trim()}" atualizado com sucesso!`);
    } else {
      // Add new
      const newItem: InstrumentItem = {
        id: 'inst-' + Date.now(),
        name: instFormName.trim(),
        type: instFormType,
        brandModel: instFormBrand.trim() || `${instFormType === 'baixo' ? 'Baixo' : instFormType === 'guitarra' ? 'Guitarra' : 'Violão'} Custom`,
        reminders: DEFAULT_REMINDERS.map(r => ({ ...r, lastDoneDate: new Date().toISOString().split('T')[0] }))
      };
      setInstruments(prev => [...prev, newItem]);
      setActiveToast(`🎉 Instrumento "${newItem.name}" adicionado com sucesso!`);
    }

    setTimeout(() => setActiveToast(null), 4000);
    setInstFormName('');
    setInstFormBrand('');
    setEditingInstId(null);
    setShowFormModal(false);
  };

  // Helper to remove instrument
  const handleConfirmRemoveInstrument = (id: string) => {
    const inst = instruments.find(i => i.id === id);
    setInstruments(prev => prev.filter(i => i.id !== id));
    setDeletingInstId(null);
    if (inst) {
      setActiveToast(`🗑️ Instrumento "${inst.name}" foi removido com sucesso.`);
      setTimeout(() => setActiveToast(null), 4000);
    }
  };

  // Quick add count shortcut
  const handleQuickAdd = (type: InstrumentType) => {
    const typeNames = { baixo: 'Novo Baixo', guitarra: 'Nova Guitarra', violao: 'Novo Violão' };
    const newItem: InstrumentItem = {
      id: 'inst-' + Date.now(),
      name: `${typeNames[type]} ${instruments.filter(i => i.type === type).length + 1}`,
      type,
      brandModel: type === 'baixo' ? 'Baixo 4/5 Cordas' : type === 'guitarra' ? 'Guitarra Elétrica' : 'Violão Acústico',
      reminders: DEFAULT_REMINDERS.map(r => ({ ...r, lastDoneDate: new Date().toISOString().split('T')[0] }))
    };
    setInstruments(prev => [...prev, newItem]);
  };

  // Toggle reminder enabled
  const handleToggleReminder = (instrumentId: string, task: MaintenanceTaskType) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.id !== instrumentId) return inst;
      return {
        ...inst,
        reminders: inst.reminders.map(rem => {
          if (rem.task !== task) return rem;
          return { ...rem, enabled: !rem.enabled };
        })
      };
    }));
  };

  // Update interval months
  const handleChangeInterval = (instrumentId: string, task: MaintenanceTaskType, intervalMonths: number) => {
    setInstruments(prev => prev.map(inst => {
      if (inst.id !== instrumentId) return inst;
      return {
        ...inst,
        reminders: inst.reminders.map(rem => {
          if (rem.task !== task) return rem;
          return { ...rem, intervalMonths };
        })
      };
    }));
  };

  // Mark task as done today
  const handleMarkDoneToday = (instrumentId: string, task: MaintenanceTaskType) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setInstruments(prev => prev.map(inst => {
      if (inst.id !== instrumentId) return inst;
      return {
        ...inst,
        reminders: inst.reminders.map(rem => {
          if (rem.task !== task) return rem;
          return { ...rem, lastDoneDate: todayStr };
        })
      };
    }));

    // Find instrument name and task title for notification confirmation
    const inst = instruments.find(i => i.id === instrumentId);
    if (inst) {
      setActiveToast(`🎉 Manutenção de "${TASK_LABELS[task].title}" registrada hoje para ${inst.name}!`);
      setTimeout(() => setActiveToast(null), 4000);
    }
  };

  // Calculate days overdue or remaining
  const getReminderStatus = (lastDoneDateStr: string, intervalMonths: number) => {
    const lastDate = new Date(lastDoneDateStr);
    const dueDate = new Date(lastDate);
    dueDate.setMonth(dueDate.getMonth() + intervalMonths);

    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      dueDateStr: dueDate.toLocaleDateString('pt-BR'),
      daysRemaining: diffDays,
      isOverdue: diffDays <= 0,
      isDueSoon: diffDays > 0 && diffDays <= 15
    };
  };

  // Collect all urgent reminders across all instruments
  const urgentReminders = instruments.flatMap(inst => {
    return inst.reminders
      .filter(r => r.enabled)
      .map(r => {
        const status = getReminderStatus(r.lastDoneDate, r.intervalMonths);
        return {
          instrument: inst,
          reminder: r,
          status,
          quote: TASK_FRIENDLY_QUOTES[inst.type][r.task].replace('Sou seu', `Sou seu ${inst.name} (`).replace('Sou sua', `Sou sua ${inst.name} (`) + ')'
        };
      })
      .filter(item => item.status.isOverdue || item.status.isDueSoon);
  });

  // Simulate pushing a browser or web notification
  const handleSimulateNotification = (message: string) => {
    setActiveToast(message);
    
    // Web Notification API fallback
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Luthier de Bolso 🎸', { body: message });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Luthier de Bolso 🎸', { body: message });
          }
        });
      }
    }
    setTimeout(() => setActiveToast(null), 6000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn pb-24">
      
      {/* Friendly Notification Toast Banner if active */}
      {activeToast && (
        <div className={`fixed top-16 left-4 right-4 max-w-lg mx-auto z-50 p-4 rounded-2xl border shadow-2xl flex items-start gap-3 animate-slideDown transition-all ${
          isLight 
            ? 'bg-amber-50 border-amber-300 text-stone-900 shadow-amber-900/10' 
            : 'bg-stone-900 border-amber-500/50 text-stone-100 shadow-black/80'
        }`}>
          <div className="p-2 rounded-xl bg-amber-500 text-stone-950 shrink-0 mt-0.5">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold text-amber-500 block mb-0.5">Notificação do Instrumento:</span>
            <p className="font-medium leading-relaxed">{activeToast}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)}
            className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1 rounded bg-stone-800/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* Free Plan Upgrade Banner (if on Free plan) */}
      {plan === 'free' && (
        <div className={`p-5 rounded-2xl border shadow-lg relative overflow-hidden space-y-4 ${
          isLight ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white border-amber-300' : 'bg-gradient-to-r from-amber-500/20 via-amber-950/30 to-stone-900 border-amber-500/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 mt-0.5">
                <Sparkles className="w-6 h-6 stroke-[2.5] animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-stone-950 uppercase">
                    Exclusivo Versão Paga (PRO)
                  </span>
                </div>
                <h3 className={`text-lg font-extrabold font-display ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                  Cadastro Personalizado de Coleção
                </h3>
                <p className={`text-xs max-w-xl leading-relaxed ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                  Na <strong>Versão Gratuita</strong>, você utiliza o lembrete semestral único na aba Diagnóstico. Na <strong>Versão Paga (PRO)</strong>, você cadastra quantos Baixos, Guitarras e Violões desejar, configura periodicidade de 1, 3, 6 ou 12 meses para Limpeza, Elétrica, Cordas e Regulagem, e recebe avisos personificados!
                </p>
              </div>
            </div>

            {onTogglePlan && (
              <button
                onClick={onTogglePlan}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ativar Versão PRO (Simular VIP)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border shadow-sm transition-colors ${
        isLight ? 'bg-white border-stone-200' : 'bg-stone-900 border-stone-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Guitar className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className={`text-xl font-black font-display tracking-tight ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                Meus Instrumentos & Lembretes
              </h2>
              <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Gerencie suas guitarras, baixos e violões com notificações personalizadas de manutenção regular.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar Instrumento</span>
          </button>
        </div>

        {/* Inventory Quick Summary Bar */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-stone-200/50 dark:border-stone-800">
          <div className={`p-3 rounded-xl border text-center transition-colors ${
            isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-850'
          }`}>
            <span className="text-xs text-stone-500 block font-mono">Baixos</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-500 font-mono">{countBaixos}</span>
              <button 
                onClick={() => handleOpenAddModal('baixo')}
                title="Adicionar Baixo"
                className="text-stone-400 hover:text-amber-500 p-0.5 rounded hover:bg-stone-800/40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-center transition-colors ${
            isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-850'
          }`}>
            <span className="text-xs text-stone-500 block font-mono">Guitarras</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-500 font-mono">{countGuitarras}</span>
              <button 
                onClick={() => handleOpenAddModal('guitarra')}
                title="Adicionar Guitarra"
                className="text-stone-400 hover:text-amber-500 p-0.5 rounded hover:bg-stone-800/40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-center transition-colors ${
            isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-850'
          }`}>
            <span className="text-xs text-stone-500 block font-mono">Violões</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xl font-extrabold text-amber-500 font-mono">{countVioloes}</span>
              <button 
                onClick={() => handleOpenAddModal('violao')}
                title="Adicionar Violão"
                className="text-stone-400 hover:text-amber-500 p-0.5 rounded hover:bg-stone-800/40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Reminders / Personified Message Bubble Section */}
      {urgentReminders.length > 0 && (
        <div className={`p-4 rounded-2xl border transition-colors ${
          isLight ? 'bg-amber-500/10 border-amber-300' : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-500">
              <Bell className="w-4 h-4 animate-bounce" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider">
                Lembretes em Aberto ({urgentReminders.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-stone-400">Notificações Amigáveis</span>
          </div>

          <div className="space-y-2.5">
            {urgentReminders.map(({ instrument, reminder, status, quote }, idx) => (
              <div 
                key={`${instrument.id}-${reminder.task}-${idx}`}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLight ? 'bg-white border-amber-200' : 'bg-stone-900 border-stone-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg leading-none mt-0.5">💬</span>
                  <div className="space-y-0.5">
                    <p className={`text-xs font-medium italic ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
                      "{quote}"
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span>{instrument.name}</span>
                      <span>•</span>
                      <span className={status.isOverdue ? 'text-red-400 font-bold' : 'text-amber-400'}>
                        {status.isOverdue ? `Venceu há ${Math.abs(status.daysRemaining)} dias` : `Vence em ${status.daysRemaining} dias`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleSimulateNotification(quote)}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xxs font-mono flex items-center gap-1 border border-stone-700"
                    title="Testar envio de notificação"
                  >
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Testar Notificação</span>
                  </button>
                  <button
                    onClick={() => handleMarkDoneToday(instrument.id, reminder.task)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xxs font-bold font-mono flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3 h-3" />
                    <span>Concluir Hoje</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruments List */}
      <div className="space-y-4">
        <h3 className={`text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-2 ${
          isLight ? 'text-stone-700' : 'text-stone-300'
        }`}>
          <span>Sua Coleção de Instrumentos ({instruments.length})</span>
        </h3>

        {instruments.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${
            isLight ? 'bg-white border-stone-200' : 'bg-stone-900 border-stone-800'
          }`}>
            <Guitar className="w-10 h-10 text-stone-500 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-stone-400">Nenhum instrumento cadastrado.</p>
            <button
              onClick={() => handleOpenAddModal()}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Instrumento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {instruments.map((inst) => (
              <div 
                key={inst.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLight ? 'bg-white border-stone-200 shadow-sm' : 'bg-stone-900 border-stone-800'
                }`}
              >
                {/* Instrument Card Header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl text-lg ${
                      inst.type === 'baixo' ? 'bg-amber-500/10 text-amber-500' :
                      inst.type === 'guitarra' ? 'bg-sky-500/10 text-sky-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {inst.type === 'baixo' ? '🎸 Baixo' : inst.type === 'guitarra' ? '🎸 Guitarra' : '🪕 Violão'}
                    </div>
                    <div>
                      <h4 className={`text-base font-extrabold font-display ${isLight ? 'text-stone-900' : 'text-stone-100'}`}>
                        {inst.name}
                      </h4>
                      <p className="text-xs text-stone-400 font-mono">{inst.brandModel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(inst)}
                      className="p-2 rounded-xl text-stone-400 hover:text-amber-400 hover:bg-stone-800/50 transition-colors"
                      title="Editar detalhes do instrumento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSimulateNotification(TASK_FRIENDLY_QUOTES[inst.type].limpeza.replace('Sou seu', `Sou seu ${inst.name} (`).replace('Sou sua', `Sou sua ${inst.name} (`) + ')') }
                      className="p-2 rounded-xl text-stone-400 hover:text-amber-400 hover:bg-stone-800/50 transition-colors"
                      title="Testar notificação amigável"
                    >
                      <MessageSquareHeart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingInstId(inst.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-800/50 transition-colors"
                      title="Excluir instrumento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Maintenance Reminders List */}
                <div className="mt-4 space-y-3">
                  <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Configuração de Notificações de Manutenção</span>
                    <span className="text-[10px] text-amber-500">Período Selecionável</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inst.reminders.map((rem) => {
                      const taskInfo = TASK_LABELS[rem.task];
                      const status = getReminderStatus(rem.lastDoneDate, rem.intervalMonths);
                      const friendlyQuote = TASK_FRIENDLY_QUOTES[inst.type][rem.task];

                      return (
                        <div 
                          key={rem.task}
                          className={`p-3 rounded-xl border transition-all ${
                            rem.enabled 
                              ? isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-850'
                              : isLight ? 'bg-stone-100/50 border-stone-200 opacity-60' : 'bg-stone-900/40 border-stone-850/40 opacity-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={rem.enabled}
                                onChange={() => handleToggleReminder(inst.id, rem.task)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                              />
                              <span className="text-sm font-bold flex items-center gap-1.5">
                                <span>{taskInfo.icon}</span>
                                <span>{taskInfo.title}</span>
                              </span>
                            </div>

                            {/* Interval Select */}
                            <select
                              disabled={!rem.enabled}
                              value={rem.intervalMonths}
                              onChange={(e) => handleChangeInterval(inst.id, rem.task, Number(e.target.value))}
                              className={`text-xs font-mono py-1 px-2 rounded-lg border bg-stone-900 text-stone-200 border-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer ${
                                isLight ? 'bg-white text-stone-800 border-stone-300' : ''
                              }`}
                            >
                              <option value={1}>Mensal (30d)</option>
                              <option value={3}>3 Meses (90d)</option>
                              <option value={6}>6 Meses (180d)</option>
                              <option value={12}>1 Anual (365d)</option>
                            </select>
                          </div>

                          <p className="text-[11px] text-stone-400 mt-1 pl-6 leading-relaxed">
                            {taskInfo.desc}
                          </p>

                          {rem.enabled && (
                            <div className="mt-3 pl-6 pt-2 border-t border-stone-800/40 dark:border-stone-850 flex items-center justify-between text-xs font-mono gap-2">
                              <div>
                                <span className="text-stone-500 text-[10px] block">Próxima em:</span>
                                <span className={status.isOverdue ? 'text-red-400 font-bold' : status.isDueSoon ? 'text-amber-400 font-bold' : 'text-stone-300'}>
                                  {status.dueDateStr}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleSimulateNotification(friendlyQuote)}
                                  className="p-1 px-2 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] flex items-center gap-1 border border-stone-700"
                                  title="Testar Notificação Amigável"
                                >
                                  <Bell className="w-3 h-3 text-amber-400" />
                                  <span>Testar</span>
                                </button>
                                <button
                                  onClick={() => handleMarkDoneToday(inst.id, rem.task)}
                                  className="p-1 px-2 rounded bg-emerald-600/90 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1"
                                  title="Registrar que foi feito hoje"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Feito</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Instrument Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-stone-900 border-stone-800 text-stone-100'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-stone-200 dark:border-stone-800">
              <h3 className="text-lg font-bold font-display flex items-center gap-2">
                <Guitar className="w-5 h-5 text-amber-500" />
                <span>{editingInstId ? 'Editar Instrumento' : 'Novo Instrumento'}</span>
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInstrument} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">Nome do Instrumento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fender Jazz Bass, Les Paul Sunburst..."
                  value={instFormName}
                  onChange={(e) => setInstFormName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-stone-950 border-stone-700 text-stone-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">Tipo de Instrumento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'baixo', label: 'Baixo 🎸' },
                    { type: 'guitarra', label: 'Guitarra 🎸' },
                    { type: 'violao', label: 'Violão 🪕' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => setInstFormType(item.type as InstrumentType)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all ${
                        instFormType === item.type
                          ? 'bg-amber-500 border-amber-400 text-stone-950'
                          : isLight ? 'bg-stone-100 border-stone-200 text-stone-700' : 'bg-stone-800 border-stone-700 text-stone-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">Marca / Modelo / Detalhes (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Tagima TG-530 2021"
                  value={instFormBrand}
                  onChange={(e) => setInstFormBrand(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-stone-50 border-stone-300 text-stone-900' : 'bg-stone-950 border-stone-700 text-stone-100'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-400 text-xs font-mono hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-md"
                >
                  {editingInstId ? 'Salvar Alterações' : 'Salvar Instrumento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingInstId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl space-y-4 text-center ${
            isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-stone-900 border-stone-800 text-stone-100'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold font-display">Remover Instrumento?</h3>
              <p className="text-xs text-stone-400">
                Tem certeza que deseja excluir "{instruments.find(i => i.id === deletingInstId)?.name}" da sua coleção? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingInstId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 text-stone-300 text-xs font-mono hover:bg-stone-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmRemoveInstrument(deletingInstId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
