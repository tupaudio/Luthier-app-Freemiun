# Luthier de Bolso — Roadmap Versão 2.0 🚀

Este documento serve para documentar a especificação técnica e o planejamento de arquitetura para a **Versão 2.0** do aplicativo, focado na **Agenda de Manutenção Preventiva** e no **Cadastro de Instrumentos/Amplificadores**.

---

## 1. Visão Geral (Escopo v2.0)
Expandir o aplicativo de um utilitário de bancada ("on-demand") para um **gerenciador de ciclo de vida do equipamento**. O usuário poderá cadastrar seus instrumentos e amplificadores, receber alertas de manutenção preventiva periódicos (como troca de cordas, limpeza de trastes, lubrificação de pestana e inspeção de potenciômetros) e acompanhar o histórico de regulagens realizadas.

---

## 2. Modelagem de Dados (Entidades)

Para suportar essa funcionalidade de maneira robusta (seja usando SQLite local com `drift` no Flutter ou `watermelondb` no React Native, ou sincronizado na nuvem com **Firestore**), propõe-se a seguinte estrutura relacional:

### `Instrument` / `Amplifier` (Cadastro de Equipamento)
```typescript
interface Instrument {
  id: string; // UUID
  name: string; // Ex: "Fender Stratocaster Am. Standard"
  type: 'guitar' | 'bass' | 'acoustic';
  stringsCount: number; // 4, 5, 6, 7, 8
  tuning: string; // Ex: "Standard E", "Drop D"
  scaleLength: number; // Ex: 25.5, 34 (polegadas)
  gauge: string; // Ex: "0.10 - 0.46", "0.45 - 1.05"
  lastMaintenanceDate: string; // ISO DateTime
  photoUrl?: string;
  notes?: string;
}

interface Amplifier {
  id: string;
  name: string; // Ex: "Marshall DSL40CR"
  type: 'valve' | 'solid_state' | 'hybrid';
  lastTubeChangeDate?: string; // Relevante para valvulados
  notes?: string;
}
```

### `MaintenanceTask` (Listas de Tarefas Pré-Prontas & Customizadas)
```typescript
interface MaintenanceTask {
  id: string;
  instrumentId: string; // FK
  title: string; // Ex: "Troca de cordas e hidratação de escala"
  frequencyDays: number; // Ex: 90 dias (3 meses)
  lastCompletedDate: string; // ISO DateTime
  nextDueDate: string; // ISO DateTime
  isTemplate: boolean; // Indica se veio do preset do app ou criada pelo usuário
  checklistItems: { text: string; done: boolean }[];
}
```

---

## 3. Templates de Tarefas Pré-Prontas (Presets do Sistema)

Para agregar valor imediato ao usuário, o app disponibilizará planos de manutenção prontos baseados no perfil do equipamento:

1. **Plano de Troca de Cordas e Limpeza Rápida (Sugerido a cada 60-90 dias)**
   * Retirar cordas antigas.
   * Limpar escala com óleo de limão (se for escala de Rosewood/Ebony) ou pano levemente úmido (se for Maple selado).
   * Polimento suave dos trastes com lã de aço superfina #0000.
   * Colocação das novas cordas e alongamento mecânico delas para estabilização térmica.

2. **Revisão Completa de Oitavas e Altura (Sugerido a cada 180 dias ou na mudança de gauge de cordas)**
   * Medir alívio do braço (tensor).
   * Ajustar a altura (ação) nas especificações padrão.
   * Conferir entonação no traste 12 (com afinador fino).
   * Regular a altura dos captadores para eliminar Stratitis.

3. **Checklist de Conservação Elétrica (Sugerido a cada 12 meses ou sob demanda)**
   * Aplicar limpa-contatos de secagem rápida (como WD-40 Specialist Contact Cleaner ou análogo) nos potenciômetros de volume/tom.
   * Apertar as porcas de fixação dos potenciômetros e do Jack fêmea.
   * Verificar soldas frias ou fios soltos no compartimento elétrico traseiro.

---

## 4. Estratégia de Notificações e Lembretes Back-end/Local

Para garantir que o usuário não perca os prazos mesmo sem internet ativa, utilizaremos agendamento de **notificações locais**:

### No Flutter
* **Biblioteca Principal:** `flutter_local_notifications` para disparar os alertas visuais diretos no sistema operacional.
* **Tarefas de Background:** `workmanager` para executar tarefas periódicas de checagem do banco de dados a cada 24 horas e reagendar alarmes caso o usuário mude o status das tarefas.
* **Exemplo de fluxo:**
  1. O app calcula `nextDueDate`.
  2. Agenda uma notificação local persistente no canal de baixa latência do sistema.
  3. No dia estipulado, o sistema operacional dispara o pop-up: *"Ei! Já faz 3 meses que a escala do seu Contrabaixo 5 Cordas não é limpa. Que tal dar uma geral hoje?"*

### No React Native
* **Biblioteca Principal:** `expo-notifications` (se estiver usando Expo) ou `@notifee/react-native` (em bare-workflow para maior customização).
* **Execuções Periódicas:** `expo-background-fetch` e `expo-task-manager`.

---

## 5. Próximos Passos recomendados para o Lançamento V1
1. **Validar o Afinador Fino:** Teste em diferentes aparelhos (graças à sua portabilidade Web Audio no navegador do celular/PC).
2. **Coletar Feedbacks do Guia de Ajustes:** Verifique se as explicações de sentido horário/anti-horário estão intuitivas para quem nunca usou uma chave Allen.
3. **Publicação Básica:** Uma vez estável a V1, crie os cadastros nas lojas usando o Flutter para garantir o DSP nativo performático.
