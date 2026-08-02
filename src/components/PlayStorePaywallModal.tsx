import React, { useState } from 'react';
import { Sparkles, Check, ShieldCheck, CreditCard, RefreshCw, Smartphone, Code, Lock, X, Star } from 'lucide-react';

interface PlayStorePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: () => void;
  theme: 'dark' | 'light';
  currentPlan: 'free' | 'pro';
}

export default function PlayStorePaywallModal({
  isOpen,
  onClose,
  onConfirmPurchase,
  theme,
  currentPlan
}: PlayStorePaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'checkout' | 'dev_docs'>('checkout');

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSimulatePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPurchase();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
        isLight ? 'bg-white border-stone-200 text-stone-900' : 'bg-stone-900 border-stone-800 text-stone-100'
      }`}>
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-stone-950/20 text-stone-950 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-display tracking-tight text-stone-950">
                  Luthier de Bolso PRO
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-stone-950 text-amber-400 font-mono text-[10px] font-bold">
                  Google Play Billing
                </span>
              </div>
              <p className="text-xs font-medium text-stone-900/80">
                Desbloqueie cadastro ilimitado de instrumentos e alertas personalizados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-950/20 hover:bg-stone-950/40 text-stone-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Sub-Header */}
        <div className={`flex border-b text-xs font-mono font-bold shrink-0 ${
          isLight ? 'border-stone-200 bg-stone-50' : 'border-stone-800 bg-stone-950'
        }`}>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'checkout'
                ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Assinatura & Checkout</span>
          </button>

          <button
            onClick={() => setActiveTab('dev_docs')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'dev_docs'
                ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Guia do Desenvolvedor (PlayStore)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'checkout' ? (
            <div className="space-y-5">
              
              {/* Features List */}
              <div className="space-y-2.5">
                <span className="text-xxs font-mono uppercase tracking-wider text-amber-500 font-bold">
                  Recursos Exclusivos da Versão PRO:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Cadastro ilimitado de Baixos, Guitarras e Violões',
                    'Lembretes com prazos customizados (1, 3, 6, 12 meses)',
                    'Alertas personificados ("Oi, sou seu Baixo!")',
                    'Remoção do lembrete genérico semestral',
                    'Histórico individual de manutenções',
                    'Sincronização em nuvem e backup local'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="p-0.5 rounded bg-amber-500/20 text-amber-500 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className={`leading-tight ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* Yearly Plan */}
                <div 
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                      : isLight ? 'border-stone-200 bg-stone-50' : 'border-stone-800 bg-stone-950/60'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black font-mono shadow">
                    ECONOMIZE 58%
                  </span>
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="radio" 
                      name="plan_type" 
                      checked={selectedPlan === 'yearly'}
                      onChange={() => setSelectedPlan('yearly')}
                      className="accent-amber-500"
                    />
                    <span className="font-extrabold text-sm">Plano Anual</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black font-mono text-amber-500">R$ 4,15</span>
                    <span className="text-xs text-stone-400 font-mono"> /mês</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">Cobrado R$ 49,90/ano (com 7 dias grátis)</p>
                </div>

                {/* Monthly Plan */}
                <div 
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                      : isLight ? 'border-stone-200 bg-stone-50' : 'border-stone-800 bg-stone-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input 
                      type="radio" 
                      name="plan_type" 
                      checked={selectedPlan === 'monthly'}
                      onChange={() => setSelectedPlan('monthly')}
                      className="accent-amber-500"
                    />
                    <span className="font-extrabold text-sm">Plano Mensal</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-black font-mono text-amber-500">R$ 9,90</span>
                    <span className="text-xs text-stone-400 font-mono"> /mês</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">Cobrado mensalmente, cancele quando quiser</p>
                </div>

              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSimulatePurchase}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Conectando com Google Play Billing...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      <span>Assinar com Google Play (Simulação)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400 font-mono">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Pagamento seguro pelo Google Play
                  </span>
                  <span>•</span>
                  <span>Cancele a qualquer momento</span>
                </div>
              </div>

            </div>
          ) : (
            
            /* Developer Guide Tab */
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-200 space-y-1">
                <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Como Automatizar Vendas no Google Play Console?</span>
                </h4>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Para que as cobranças do Plano PRO ocorram automaticamente via loja do Android (Google Play Billing System), siga estes 3 passos na arquitetura de produção:
                </p>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-800'}`}>
                  <span className="text-amber-500 font-bold block mb-1">1. Google Play Console:</span>
                  <p className="text-stone-400 leading-relaxed">
                    Cadastre os Produtos In-App (Subscriptions) com os IDs:<br />
                    • <code className="text-amber-400">luthier_pro_monthly</code> (R$ 9,90)<br />
                    • <code className="text-amber-400">luthier_pro_yearly</code> (R$ 49,90)
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-800'}`}>
                  <span className="text-amber-500 font-bold block mb-1">2. Plugin no App (Capacitor / React Native):</span>
                  <p className="text-stone-400 leading-relaxed">
                    Utilize a biblioteca <strong>RevenueCat</strong> (recomendada) ou <strong>@capacitor-community/in-app-purchase</strong>:<br />
                    <code className="text-stone-300 block bg-stone-900 p-1.5 rounded mt-1 text-[10px] overflow-x-auto">
                      npm install @revenuecat/purchases-capacitor
                    </code>
                  </p>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-stone-50 border-stone-200' : 'bg-stone-950 border-stone-800'}`}>
                  <span className="text-amber-500 font-bold block mb-1">3. Código de Disparo em React:</span>
                  <pre className="text-stone-300 bg-stone-900 p-2 rounded text-[10px] overflow-x-auto">
{`import { Purchases } from '@revenuecat/purchases-capacitor';

const makePurchase = async (packageId) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageId);
    if (customerInfo.entitlements.active['pro']) {
      setPlan('pro'); // Ativa plano no app!
    }
  } catch (e) {
    console.error('Erro na compra', e);
  }
};`}
                  </pre>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-right shrink-0 ${
          isLight ? 'border-stone-200 bg-stone-50' : 'border-stone-800 bg-stone-950'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-700 text-stone-400 text-xs font-mono hover:bg-stone-800"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
