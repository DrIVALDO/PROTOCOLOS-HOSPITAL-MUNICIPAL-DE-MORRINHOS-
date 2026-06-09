/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorModule } from './components/CalculatorModule';
import { SepseFichaModule } from './components/SepseFichaModule';
import { SepseStandaloneConfig } from './components/SepseStandaloneConfig';
import { jsPDF } from 'jspdf';
import { 
  Activity, 
  Brain, 
  Eye, 
  User, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Stethoscope,
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Home,
  LayoutDashboard,
  Building2,
  BookOpen,
  Check,
  Users,
  Bell,
  Settings,
  LogOut,
  HeartPulse,
  ChevronLeft,
  BedDouble,
  Lock,
  Smartphone,
  Database,
  Shield,
  Palette,
  CreditCard,
  History,
  FileCode,
  Calculator,
  Files,
  FileDown,
  ArrowLeft,
  Calendar,
  Hospital,
  FilePlus,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  QrCode,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { runDecisionEngine } from './services/decisionEngine';
import { exportProtocolsToWord } from './services/wordExportService';
import { SepseConfigModal } from './components/sepse/SepseConfigModal';
import { INITIAL_CONFIG, INITIAL_CHECKLISTS, NEWS_RAW_GRID_PARAMETERS, SOFA_RAW_GRID_PARAMETERS } from './components/sepse/sepseDefaultData';
import { ConfigDict, CheckItem } from './components/sepse/sepseTypes';

// --- Types ---

interface NIHSSOption {
  value: number;
  label: string;
  description?: string;
}

interface NIHSSItem {
  id: string;
  title: string;
  instruction: string;
  options: NIHSSOption[];
  category: 'LOC' | 'Vision' | 'Motor' | 'Other';
  hasImages?: boolean;
}

interface ABCD2Item {
  id: string;
  title: string;
  options: NIHSSOption[];
}

interface ClinicalRecord {
  cincinnati: 'Positivo' | 'Negativo' | '';
  cincinnatiFacialDroop: 'Normal' | 'Alterado' | '';
  cincinnatiArmDrift: 'Normal' | 'Alterado' | '';
  cincinnatiSpeech: 'Normal' | 'Alterado' | '';
  onsetSymptoms: string;
  onsetHours: string;
  lastSeenNormal: string;
  codigoAvcActivated: boolean;
  airway: 'Pérvea' | 'Obstruída' | '';
  satO2: string;
  initialBP: string;
  pas: string;
  pad: string;
  capillaryGlucose: string;
  temperature: string;
  age: string;
  anticoagulant: boolean;
  ctResult: 'Isquêmico' | 'Hemorrágico' | 'Normal' | 'Outro' | '';
  thrombolysisDone: boolean;
  thrombectomyIndicated: boolean;
  destination: 'Unidade de AVC' | 'UTI' | 'Ambulatório' | '';
  notes: string;
}

// --- Constants ---

const ABCD2_ITEMS: ABCD2Item[] = [
  {
    id: 'age',
    title: 'Idade (Age)',
    options: [
      { value: 1, label: '≥ 60 anos' },
      { value: 0, label: '< 60 anos' },
    ]
  },
  {
    id: 'bp',
    title: 'Pressão Arterial (Blood Pressure)',
    options: [
      { value: 1, label: 'PAS ≥ 140 mmHg ou PAD ≥ 90 mmHg' },
      { value: 0, label: 'Outro' },
    ]
  },
  {
    id: 'clinical',
    title: 'Sintomas Clínicos (Clinical Symptoms)',
    options: [
      { value: 2, label: 'Fraqueza unilateral' },
      { value: 1, label: 'Distúrbio de linguagem sem fraqueza' },
      { value: 0, label: 'Outro' },
    ]
  },
  {
    id: 'duration',
    title: 'Duração do AIT (Duration)',
    options: [
      { value: 2, label: '≥ 60 minutos' },
      { value: 1, label: '10 - 59 minutos' },
      { value: 0, label: '< 10 minutos' },
    ]
  },
  {
    id: 'diabetes',
    title: 'Diabetes',
    options: [
      { value: 1, label: 'Sim' },
      { value: 0, label: 'Não' },
    ]
  }
];

const NIHSS_ITEMS: NIHSSItem[] = [
  {
    id: '1a',
    title: '1a. Nível de Consciência',
    category: 'LOC',
    instruction: 'Avalie o estado de alerta e responsividade do paciente',
    options: [
      { value: 0, label: '0 pontos - Alerta; plenamente responsivo' },
      { value: 1, label: '1 ponto - Não alerta, mas ao ser acordado por mínima estimulação, obedece, responde ou reage' },
      { value: 2, label: '2 pontos - Não alerta, requer repetida estimulação ou estimulação dolorosa para realizar movimentos' },
      { value: 3, label: '3 pontos - Responde somente com reflexo motor ou reações autonômicas, ou totalmente irresponsivo' }
    ]
  },
  {
    id: '1b',
    title: '1b. Perguntas de NC',
    category: 'LOC',
    instruction: '"Qual é o mês atual?" e "Qual é a sua idade?"',
    options: [
      { value: 0, label: '0 pontos - Responde ambas as questões corretamente' },
      { value: 1, label: '1 ponto - Responde uma questão corretamente' },
      { value: 2, label: '2 pontos - Responde incorretamente a todas as questões' }
    ]
  },
  {
    id: '1c',
    title: '1c. Comandos de NC',
    category: 'LOC',
    instruction: '"Abra e feche os olhos" e "Abra e feche a mão não parética"',
    options: [
      { value: 0, label: '0 pontos - Realiza ambas as tarefas corretamente' },
      { value: 1, label: '1 ponto - Realiza uma tarefa corretamente' },
      { value: 2, label: '2 pontos - Realiza incorretamente todas as tarefas' }
    ]
  },
  {
    id: '2',
    title: '2. Melhor Olhar Conjugado',
    category: 'Vision',
    instruction: 'Avalie movimentos oculares horizontais (voluntários ou reflexos)',
    options: [
      { value: 0, label: '0 pontos - Normal' },
      { value: 1, label: '1 ponto - Paralisia parcial do olhar em um ou ambos os olhos, sem desvio forçado' },
      { value: 2, label: '2 pontos - Desvio forçado ou paralisia total do olhar que não podem ser vencidos' }
    ]
  },
  {
    id: '3',
    title: '3. Campo Visual',
    category: 'Vision',
    instruction: 'Teste os campos visuais por confrontação (quadrantes superiores e inferiores)',
    options: [
      { value: 0, label: '0 pontos - Sem perda visual' },
      { value: 1, label: '1 ponto - Hemianopsia parcial' },
      { value: 2, label: '2 pontos - Hemianopsia completa' },
      { value: 3, label: '3 pontos - Hemianopsia bilateral (cego, incluindo cegueira cortical)' }
    ]
  },
  {
    id: '4',
    title: '4. Paralisia Facial',
    category: 'Other',
    instruction: 'Peça ao paciente para mostrar os dentes/sorrir e fechar os olhos',
    options: [
      { value: 0, label: '0 pontos - Movimentos normais simétricos' },
      { value: 1, label: '1 ponto - Paralisia facial leve (apagamento de prega nasolabial, assimetria no sorriso)' },
      { value: 2, label: '2 pontos - Paralisia facial central evidente (paralisia facial total ou quase total da região inferior)' },
      { value: 3, label: '3 pontos - Paralisia facial completa (ausência de movimentos das regiões superior e inferior)' }
    ]
  },
  {
    id: '5a',
    title: '5a. Motor Braço Esquerdo',
    category: 'Motor',
    instruction: 'Braço a 90° (sentado) ou 45° (deitado) por 10 segundos',
    options: [
      { value: 0, label: '0 pontos - Sem queda; mantém por 10 segundos completos' },
      { value: 1, label: '1 ponto - Queda; mantém mas apresenta queda antes dos 10 segundos; não toca a cama' },
      { value: 2, label: '2 pontos - Algum esforço contra a gravidade; cai na cama mas tem alguma força' },
      { value: 3, label: '3 pontos - Nenhum esforço contra a gravidade; braço despenca' },
      { value: 4, label: '4 pontos - Nenhum movimento' },
      { value: -1, label: 'NT - Não Testável (Somente em caso de amputação ou fusão de articulação no ombro)' }
    ]
  },
  {
    id: '5b',
    title: '5b. Motor Braço Direito',
    category: 'Motor',
    instruction: 'Braço a 90° (sentado) ou 45° (deitado) por 10 segundos',
    options: [
      { value: 0, label: '0 pontos - Sem queda; mantém por 10 segundos completos' },
      { value: 1, label: '1 ponto - Queda; mantém mas apresenta queda antes dos 10 segundos; não toca a cama' },
      { value: 2, label: '2 pontos - Algum esforço contra a gravidade; cai na cama mas tem alguma força' },
      { value: 3, label: '3 pontos - Nenhum esforço contra a gravidade; braço despenca' },
      { value: 4, label: '4 pontos - Nenhum movimento' },
      { value: -1, label: 'NT - Não Testável (Somente em caso de amputação ou fusão de articulação no ombro)' }
    ]
  },
  {
    id: '6a',
    title: '6a. Motor Perna Esquerda',
    category: 'Motor',
    instruction: 'Perna a 30° (posição supina) por 5 segundos',
    options: [
      { value: 0, label: '0 pontos - Sem queda; mantém por 5 segundos completos' },
      { value: 1, label: '1 ponto - Queda; mantém mas apresenta queda antes dos 5 segundos; não toca a cama' },
      { value: 2, label: '2 pontos - Algum esforço contra a gravidade; cai na cama mas tem alguma força' },
      { value: 3, label: '3 pontos - Nenhum esforço contra a gravidade; perna despenca' },
      { value: 4, label: '4 pontos - Nenhum movimento' },
      { value: -1, label: 'NT - Não Testável (Somente em caso de amputação ou fusão de articulação no ombro)' }
    ]
  },
  {
    id: '6b',
    title: '6b. Motor Perna Direita',
    category: 'Motor',
    instruction: 'Perna a 30° (posição supina) por 5 segundos',
    options: [
      { value: 0, label: '0 pontos - Sem queda; mantém por 5 segundos completos' },
      { value: 1, label: '1 ponto - Queda; mantém mas apresenta queda antes dos 5 segundos; não toca a cama' },
      { value: 2, label: '2 pontos - Algum esforço contra a gravidade; cai na cama mas tem alguma força' },
      { value: 3, label: '3 pontos - Nenhum esforço contra a gravidade; perna despenca' },
      { value: 4, label: '4 pontos - Nenhum movimento' },
      { value: -1, label: 'NT - Não Testável (Somente em caso de amputação ou fusão de articulação no ombro)' }
    ]
  },
  {
    id: '7',
    title: '7. Ataxia de Membros',
    category: 'Other',
    instruction: 'Teste índex-nariz e calcanhar-joelho em ambos os lados (olhos abertos). Ataxia é valorizada somente se for desproporcional à fraqueza.',
    options: [
      { value: 0, label: '0 pontos - Ausente' },
      { value: 1, label: '1 ponto - Presente em 1 membro' },
      { value: 2, label: '2 pontos - Presente em 2 membros' },
      { value: -1, label: 'NT - Não Testável (Somente em caso de amputação ou fusão de articulação no ombro)' }
    ]
  },
  {
    id: '8',
    title: '8. Sensibilidade',
    category: 'Other',
    instruction: 'Avalie sensibilidade ao beliscar ou estímulo doloroso em ambos os lados. Teste braços, pernas, tronco e face.',
    options: [
      { value: 0, label: '0 pontos - Normal; nenhuma perda' },
      { value: 1, label: '1 ponto - Perda sensitiva leve a moderada; sensação diminuída mas ciente de ser tocado' },
      { value: 2, label: '2 pontos - Perda sensitiva grave ou total; paciente não sente que está sendo tocado' }
    ]
  },
  {
    id: '9',
    title: '9. Melhor Linguagem',
    category: 'Other',
    instruction: 'Avalie fluência, compreensão e capacidade de comunicação',
    hasImages: true,
    options: [
      { value: 0, label: '0 pontos - Sem afasia; normal' },
      { value: 1, label: '1 ponto - Afasia leve a moderada; alguma perda de fluência ou compreensão sem limitação significativa' },
      { value: 2, label: '2 pontos - Afasia grave; comunicação por expressões fragmentadas; informação trocada é limitada' },
      { value: 3, label: '3 pontos - Mudo, afasia global; nenhuma fala útil ou compreensão auditiva' }
    ]
  },
  {
    id: '10',
    title: '10. Disartria',
    category: 'Other',
    instruction: 'Avalie a clareza da articulação da fala. Peça ao paciente para ler:\nMamãe, Tic-Tac, Paparruda, Obrigado, Paralelepípedo, Jogador de futebol',
    options: [
      { value: 0, label: '0 pontos - Normal' },
      { value: 1, label: '1 ponto - Disartria leve a moderada; arrasta algumas palavras mas pode ser entendido' },
      { value: 2, label: '2 pontos - Disartria grave; fala tão empastada que é ininteligível ou mudo/anártrico' },
      { value: -1, label: 'NT - Não Testável (Somente se o paciente estiver intubado ou com barreiras físicas à produção da fala)' }
    ]
  },
  {
    id: '11',
    title: '11. Extinção ou Desatenção',
    category: 'Other',
    instruction: 'Avalie negligência espacial, visual, tátil ou auditiva. Este item nunca é considerado não testável.',
    options: [
      { value: 0, label: '0 pontos - Nenhuma anormalidade' },
      { value: 1, label: '1 ponto - Desatenção ou extinção à estimulação simultânea em uma modalidade sensorial' },
      { value: 2, label: '2 pontos - Profunda hemidesatenção ou para mais de uma modalidade; não reconhece a própria mão' }
    ]
  }
];

// --- NIHSS Wizard Component ---
const NIHSSWizard = ({ scores, handleScoreChange, totalScore, severity, generatePDF, onReset }: any) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [activeImageDiv, setActiveImageDiv] = useState<number | null>(null);

  const currentItem = NIHSS_ITEMS[currentStep];
  const progress = Math.round(((currentStep + 1) / NIHSS_ITEMS.length) * 100);

  const handleNext = () => {
    if (currentStep < NIHSS_ITEMS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const isCurrentAnswered = scores[currentItem.id] !== undefined;

  const handleOptionSelect = (val: number) => {
    handleScoreChange(currentItem.id, val);
  };

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col">
          <div className="bg-purple-50 p-6 flex items-center gap-4">
             <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
               <Brain className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-xl font-black text-purple-900 tracking-tight">Resultado NIHSS</h2>
               <p className="text-purple-600/70 text-xs font-bold uppercase tracking-wider">National Institute of Health Stroke Scale</p>
             </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-6 bg-slate-50">
             <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Pontuação Total</p>
                   <div className="text-4xl font-black text-slate-800 flex items-baseline gap-1">
                      {totalScore}<span className="text-lg text-slate-400 font-bold">/42</span>
                   </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest shadow-sm ${severity.color}`}>
                   {severity.label}
                </div>
             </div>

             <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Interpretação Clínica</h3>
                <ul className="text-sm space-y-2 text-slate-600">
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="font-bold">0:</span> Sem sinais de AVC</li>
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="font-bold">1-4:</span> AVC Menor</li>
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="font-bold">5-15:</span> AVC Moderado</li>
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div><span className="font-bold">16-20:</span> AVC Moderado a Grave</li>
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="font-bold">21-42:</span> AVC Grave</li>
                </ul>
             </div>

             <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <h3 className="font-bold text-slate-800 text-sm">Pontuação por Item</h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                   {NIHSS_ITEMS.map((item) => {
                     const score = scores[item.id];
                     const displayScore = score === -1 ? 'NT' : score === undefined ? '-' : score;
                     return (
                       <div key={item.id} className="p-3 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <span className="text-xs font-medium text-slate-600">{item.title}</span>
                          <span className={`px-2.5 py-1 rounded-md text-xs font-black ${score === undefined ? 'bg-slate-100 text-slate-400' : score === -1 ? 'bg-slate-100 text-slate-500' : 'bg-slate-900 text-white'}`}>{displayScore}</span>
                       </div>
                     );
                   })}
                   <div className="p-4 bg-purple-50 flex items-center justify-between">
                     <span className="font-black text-purple-900 text-sm">TOTAL</span>
                     <span className="bg-purple-600 text-white px-3 py-1 rounded-lg font-black text-sm">{totalScore}</span>
                   </div>
                </div>
             </div>

             <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                   A escala NIHSS é uma ferramenta padronizada. A interpretação deve considerar o contexto clínico completo e não deve ser usada isoladamente para decisões terapêuticas.
                </p>
             </div>
          </div>
          
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
             <button onClick={() => { setShowResult(false); setCurrentStep(0); onReset(); }} className="flex-1 py-3 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-purple-200 outline-none">
                <span className="flex items-center justify-center gap-2">Nova Avaliação</span>
             </button>
             <button onClick={generatePDF} className="flex-1 py-3 text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-200 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 outline-none">
                <span className="flex items-center justify-center gap-2"><FileText className="w-4 h-4"/> Gerar PDF</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-10">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="p-6 pb-0 mb-6">
           <div className="flex items-center gap-4 mb-6">
             <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
               <Brain className="w-8 h-8" />
             </div>
             <div>
               <h2 className="text-2xl font-black text-purple-900 tracking-tight">Escala NIHSS</h2>
               <p className="text-slate-500 text-sm font-medium">National Institute of Health Stroke Scale</p>
             </div>
           </div>
           
           <div className="flex justify-between items-end mb-2">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Questão {currentItem.id.toUpperCase()} ({currentStep + 1} de {NIHSS_ITEMS.length})</span>
             <span className="text-xs font-black text-purple-600">{progress}%</span>
           </div>
           <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 pt-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentItem.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm shadow-purple-200">
                    {currentItem.id.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{currentItem.title}</h3>
                    <p className="text-sm text-slate-600">{currentItem.instruction}</p>
                  </div>
                </div>
              </div>

              {currentItem.hasImages && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                   <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Eye className="w-4 h-4"/> Material de Avaliação
                   </h4>
                   <div className="space-y-2">
                     <button onClick={() => setActiveImageDiv(1)} className="w-full bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Figura 1 - Descrição de Cena</p>
                          <p className="text-xs text-slate-500">Peça ao paciente para descrever o que está acontecendo nesta imagem</p>
                        </div>
                        <div className="bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors">
                           <Eye className="w-3.5 h-3.5"/> Ver
                        </div>
                     </button>
                     <button onClick={() => setActiveImageDiv(2)} className="w-full bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Figura 2 - Lista de Nomeação</p>
                          <p className="text-xs text-slate-500">Peça ao paciente para nomear os objetos</p>
                        </div>
                        <div className="bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors">
                           <Eye className="w-3.5 h-3.5"/> Ver
                        </div>
                     </button>
                     <div className="bg-white border border-slate-200 p-4 rounded-xl">
                        <p className="text-sm font-bold text-slate-800 mb-1">Figura 3 - Leitura de Sentenças</p>
                        <p className="text-xs text-slate-500 mb-3">Peça ao paciente para ler as frases</p>
                        <div className="flex flex-wrap gap-2 text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                           <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">Você sabe como fazer.</span>
                           <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">Eu cheguei em casa do trabalho.</span>
                           <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">Perto da mesa na sala de jantar.</span>
                           <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">De volta para casa.</span>
                           <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">Eles ouviram o Pelé falar no rádio.</span>
                        </div>
                     </div>
                   </div>
                </div>
              )}

              <div className="space-y-3">
                {currentItem.options.map((opt) => {
                  const isSelected = scores[currentItem.id] === opt.value;
                  const pointStr = opt.label.split(' - ')[0];
                  const descStr = opt.label.split(' - ')[1];
                  
                  return (
                    <button
                      key={`${currentItem.id}-${opt.value}`}
                      onClick={() => handleOptionSelect(opt.value)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 outline-none focus:ring-4 focus:ring-purple-500/20 ${
                        isSelected 
                          ? 'border-purple-600 bg-purple-50 shadow-sm' 
                          : 'border-slate-100 bg-white hover:border-purple-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black mb-1.5 ${isSelected ? 'bg-purple-900 text-white' : 'bg-slate-800 text-white'}`}>{pointStr}</span>
                        <p className={`text-sm leading-relaxed ${isSelected ? 'text-purple-900 font-medium' : 'text-slate-600'}`}>{descStr}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4 mt-auto">
           <div className="flex gap-2">
             <button 
               onClick={handleBack} 
               disabled={currentStep === 0}
               className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <span className="flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> Voltar</span>
             </button>
             <button 
               onClick={() => { onReset(); setCurrentStep(0); }}
               className="px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors hidden sm:block"
             >
               Reiniciar
             </button>
           </div>
           
           <button 
             onClick={handleNext}
             disabled={!isCurrentAnswered && currentStep < NIHSS_ITEMS.length - 1} // Ensure answering before next, except on last? No, always ensure.
             className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-1 transition-all ${
               (!isCurrentAnswered) 
                 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                 : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200 active:scale-95'
             }`}
           >
             {currentStep === NIHSS_ITEMS.length - 1 ? 'Finalizar' : 'Próxima'} {currentStep < NIHSS_ITEMS.length - 1 && <ChevronRight className="w-4 h-4"/>}
           </button>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {activeImageDiv && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-0">
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setActiveImageDiv(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
              <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="relative bg-white w-full h-full max-w-full max-h-screen flex flex-col overflow-hidden">
                 <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">{activeImageDiv === 1 ? 'Figura 1 - Descrição de Cena' : 'Figura 2 - Lista de Nomeação'}</h3>
                    <button onClick={() => setActiveImageDiv(null)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5"/></button>
                 </div>
                 <div className="p-6 overflow-auto bg-slate-100 flex-1 flex items-center justify-center">
                    {activeImageDiv === 1 ? (
                      <img src="https://images.tcdn.com.br/img/img_prod/769747/escala_nihss_material_de_apoio_12503_2_20200831154556.jpg" alt="Descrição de Cena" className="max-w-full max-h-[70vh] rounded-lg shadow-sm border border-slate-200" />
                    ) : (
                      <img src="https://images.tcdn.com.br/img/editor/up/769747/lista_de_nomeacao_nihss.jpg" alt="Lista de Nomeação" className="max-w-full max-h-[70vh] rounded-lg shadow-sm border border-slate-200" />
                    )}
                 </div>
                 <div className="p-4 bg-slate-50 text-center text-xs text-slate-500 font-medium">
                    Material Original do NIHSS
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CLEANUP FINISHED ---
const ProtocolsModule = ({ 
  activeProtocolId, 
  setActiveProtocolId, 
  onBack 
}: { 
  activeProtocolId: 'avc' | 'tep' | 'sepse' | 'icc' | 'infantil',
  setActiveProtocolId: (id: 'avc' | 'tep' | 'sepse' | 'icc' | 'infantil') => void,
  onBack: () => void 
}) => {
  const [activeTab, setActiveTab] = useState<string>('Fluxograma');
  
  const protocolMeta = [
    { id: 'avc', title: 'AVC', icon: <Brain className="w-4 h-4" />, color: 'text-accent', active: true },
    { id: 'tep', title: 'TEP', icon: <Activity className="w-4 h-4" />, color: 'text-rose-500', active: true },
    { id: 'sepse', title: 'Sepse', icon: <ShieldAlert className="w-4 h-4" />, color: 'text-emerald-500', active: true },
    { id: 'icc', title: 'ICC', icon: <HeartPulse className="w-4 h-4" />, color: 'text-blue-500', active: false },
    { id: 'infantil', title: 'Pediatria', icon: <Users className="w-4 h-4" />, color: 'text-orange-500', active: false },
  ];

  // Set default tab when protocol changes
  useEffect(() => {
    if (activeProtocolId === 'tep') {
      setActiveTab('Interativo');
    } else if (activeProtocolId === 'avc') {
      setActiveTab('Fluxograma');
    } else if (activeProtocolId === 'sepse') {
      setActiveTab('Sepse-Anexos');
    }
  }, [activeProtocolId]);

  // AVC Specific State
  const [patientName, setPatientName] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 16));
  const [scores, setScores] = useState<Record<string, number>>({});
  const [abcd2Scores, setAbcd2Scores] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<'All' | 'LOC' | 'Vision' | 'Motor' | 'Other'>('All');

  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord>({
    cincinnati: '',
    cincinnatiFacialDroop: '',
    cincinnatiArmDrift: '',
    cincinnatiSpeech: '',
    onsetSymptoms: '',
    onsetHours: '',
    lastSeenNormal: '',
    codigoAvcActivated: false,
    airway: '',
    satO2: '',
    initialBP: '',
    pas: '',
    pad: '',
    capillaryGlucose: '',
    temperature: '',
    age: '',
    anticoagulant: false,
    ctResult: '',
    thrombolysisDone: false,
    thrombectomyIndicated: false,
    destination: '',
    notes: ''
  });

  const handleClinicalChange = (field: keyof ClinicalRecord, value: any) => {
    setClinicalRecord(prev => ({ ...prev, [field]: value }));
  };

  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<string>('Manejo Inicial');
  const [activeTEPNode, setActiveTEPNode] = useState<string>('Avaliação');

  const TEP_PROTOCOLS: Record<string, { title: string; sections: { title: string; items: string[] }[] }> = {
    'Avaliação': {
      title: 'Avaliação de Probabilidade Clínica',
      sections: [
        { title: 'Passo 1: Wells', items: ['Calcular Escore de Wells para TEP', 'Classificar em Baixa, Média ou Alta probabilidade', 'Se Baixa Probabilidade: Aplicar critérios PERC'] },
        { title: 'Passo 2: Diagnóstico', items: ['Baixa/Média Probabilidade: Solicitar D-Dímero', 'Alta Probabilidade: Prosseguir para Angio-TC imediatamente'] }
      ]
    },
    'Diagnóstico': {
      title: 'Confirmação Diagnóstica',
      sections: [
        { title: 'Angio-TC de Tórax', items: ['Padrão-ouro para diagnóstico', 'Confirmar presença de trombo em artérias pulmonares', 'Avaliar sinais indiretos (Disfunção de VD)'] },
        { title: 'D-Dímero', items: ['Alto Valor Preditivo Negativo', 'Exclui TEP se < 500 ng/mL ou idade-ajustado (idade x 10)'] }
      ]
    },
    'Estratificação': {
      title: 'Estratificação de Risco (PESI)',
      sections: [
        { title: 'PESI Simplificado (sPESI)', items: ['Avaliar estabilidade hemodinâmica', 'Calcular risco de mortalidade em 30 dias', 'Se ≥ 1 ponto: Risco Elevado', 'Se 0 pontos: Baixo Risco'] },
        { title: 'Marcadores Cardíacos', items: ['Solicitar Troponina I/T e NT-proBNP', 'Avaliar disfunção de VD por ECO ou TC'] }
      ]
    },
    'Tratamento': {
      title: 'Conduta Terapêutica',
      sections: [
        { title: 'Anticoagulação', items: ['Iniciar imediatamente se suspeita for alta', 'Heparina não fracionada (HNF) ou HBPM (Enoxaparina)', 'DOACs (Rivaroxabana/Apixabana) para manutenção'] },
        { title: 'Trombólise', items: ['Indicada apenas em TEP de Alto Risco (Instabilidade Hemodinâmica)', 'Alteplase (rtPA) 100mg em 2 horas'] }
      ]
    }
  };

  const PROTOCOLS: Record<string, { title: string; sections: { title: string; items: string[] }[] }> = {
    'Manejo Inicial': {
      title: 'Manejo Inicial e Triagem (ABCDE)',
      sections: [
        { title: 'Avaliação ABCDE', items: ['A: Via aérea pérvea', 'B: Respiração adequada (Oximetria ≥ 94%)', 'C: Circulação (Monitorização, Acesso venoso)', 'D: Déficit neurológico (Escala NIHSS)', 'E: Exposição (Temperatura, Glicemia)'] },
        { title: 'História Clínica Direcionada', items: ['Hora exata do início dos sintomas', 'Última vez visto normal', 'Uso de anticoagulantes', 'Comorbidades e Alergias'] },
        { title: 'Exames Urgentes', items: ['TC de crânio sem contraste', 'Glicemia capilar', 'Hemograma e Coagulograma', 'Função renal e Eletrólitos', 'ECG de 12 derivações'] }
      ]
    },
    'Isquêmico': {
      title: 'Protocolo AVC Isquêmico Agudo',
      sections: [
        { title: 'Trombólise Intravenosa (< 4,5h)', items: ['Alteplase 0,9 mg/kg (máx 90mg)', '10% em bolus (1 min), 90% em infusão (60 min)', 'Critérios: Idade ≥ 18, NIHSS > 4', 'Exclusão: Hemorragia na TC, PA > 185/110, Plaquetas < 100k'] },
        { title: 'Trombectomia Mecânica (6-24h)', items: ['Oclusão de grande vaso confirmada', 'NIHSS ≥ 6', 'ASPECTS ≥ 6'] },
        { title: 'Manejo da Pressão Arterial', items: ['Pré-trombólise: < 185/110 mmHg', 'Pós-trombólise (24h): < 180/105 mmHg', 'Sem trombólise: Tratar se > 220/120 mmHg'] }
      ]
    },
    'Hemorrágico': {
      title: 'Protocolo AVC Hemorrágico Agudo',
      sections: [
        { title: 'Manejo da Pressão Arterial', items: ['Manter PAS < 140 mmHg nas primeiras 24h', 'Evitar redução abrupta da PA'] },
        { title: 'Reversão de Anticoagulação', items: ['Varfarina: Complexo Protrombínico + Vitamina K', 'Heparina: Protamina', 'DOACs: Agentes reversores específicos'] },
        { title: 'Avaliação Neurocirúrgica', items: ['Hemorragia cerebelar > 3cm', 'Hidrocefalia obstrutiva', 'Hemorragia lobar superficial'] }
      ]
    },
    'AIT': {
      title: 'Protocolo AIT (Ataque Isquêmico Transitório)',
      sections: [
        { title: 'Definição', items: ['Déficit neurológico súbito e reversível', 'Duração < 1 hora (máx 24h)', 'Sem evidência de lesão na imagem'] },
        { title: 'Avaliação de Risco', items: ['Aplicar Escore ABCD²', 'Risco de AVC em 2 dias: Baixo (1%), Moderado (4%), Alto (8%)'] }
      ]
    },
    'Internação': {
      title: 'Protocolo de Internação e Monitoramento',
      sections: [
        { title: 'Unidade de AVC vs UTI', items: ['Unidade de AVC: Estáveis, NIHSS < 16', 'UTI: NIHSS ≥ 16, Suporte ventilatório, Instabilidade'] },
        { title: 'Monitoramento (24h)', items: ['NIHSS a cada 8h', 'Sinais vitais a cada 4h', 'Glicemia a cada 6h (Alvo 140-180 mg/dL)'] },
        { title: 'Cuidados Específicos', items: ['Cabeceira a 30°', 'Avaliação de disfagia (Dieta zero até teste)', 'Prevenção de TVP (Compressão pneumática)'] }
      ]
    },
    'Alta': {
      title: 'Critérios de Alta e Prevenção Secundária',
      sections: [
        { title: 'Prevenção Secundária (Isquêmico)', items: ['Antiagregação: AAS ou Clopidogrel', 'Estatina de alta potência (Atorvastatina 40-80mg)', 'Controle de PA (Meta < 140/90)'] },
        { title: 'Reabilitação', items: ['Fisioterapia precoce (24-48h)', 'Fonoaudiologia e Terapia Ocupacional'] },
        { title: 'Critérios de Alta', items: ['Estabilidade clínica > 24h', 'Plano de cuidados pós-alta definido', 'Agendamento de seguimento'] }
      ]
    }
  };

  const ProtocolModal = () => (
    <AnimatePresence>
      {selectedProtocol && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProtocol(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full h-full max-w-full max-h-screen flex flex-col overflow-hidden"
          >
            <div className="bg-accent p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6" />
                <h2 className="text-xl font-bold">{PROTOCOLS[selectedProtocol].title}</h2>
              </div>
              <button onClick={() => setSelectedProtocol(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-8">
                {PROTOCOLS[selectedProtocol].sections.map((section, idx) => (
                  <div key={idx} className="border-l-4 border-accent/30 pl-6">
                    <h3 className="text-accent font-black text-sm uppercase tracking-widest mb-4">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex gap-3 text-text-primary text-sm leading-relaxed">
                          <span className="text-accent font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-bg p-4 border-t border-border flex justify-end">
              <button 
                onClick={() => setSelectedProtocol(null)}
                className="bg-accent text-white px-8 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:brightness-95 transition-all"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((acc: number, curr: number) => curr > 0 ? acc + curr : acc, 0);
  }, [scores]);

  const totalAbcd2 = useMemo(() => {
    return Object.values(abcd2Scores).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [abcd2Scores]);

  const severity = useMemo(() => {
    if (totalScore === 0) return { label: 'Sem sintomas de AVC', color: 'text-success bg-success/10' };
    if (totalScore <= 4) return { label: 'AVC Leve', color: 'text-blue-600 bg-blue-50' };
    if (totalScore <= 15) return { label: 'AVC Moderado', color: 'text-warning bg-warning/10' };
    if (totalScore <= 20) return { label: 'AVC Moderado a Grave', color: 'text-orange-600 bg-orange-50' };
    return { label: 'AVC Grave', color: 'text-danger bg-danger/10' };
  }, [totalScore]);

  const decisionOutput = useMemo(() => {
    return runDecisionEngine({
      timeSinceOnset: parseFloat(clinicalRecord.onsetHours) || 0,
      nihss: totalScore,
      ctResult: (clinicalRecord.ctResult === 'Isquêmico' || clinicalRecord.ctResult === 'Normal' || clinicalRecord.ctResult === 'Hemorrágico') 
        ? clinicalRecord.ctResult as 'Isquêmico' | 'Normal' | 'Hemorrágico' 
        : 'Normal',
      pas: parseFloat(clinicalRecord.pas) || 0,
      pad: parseFloat(clinicalRecord.pad) || 0,
      glucose: parseFloat(clinicalRecord.capillaryGlucose) || 0,
      age: parseFloat(clinicalRecord.age) || 0,
      anticoagulant: clinicalRecord.anticoagulant
    });
  }, [clinicalRecord, totalScore]);

  const abcd2Risk = useMemo(() => {
    if (totalAbcd2 <= 3) return { label: 'Baixo Risco', color: 'text-success bg-success/10' };
    if (totalAbcd2 <= 5) return { label: 'Moderado Risco', color: 'text-warning bg-warning/10' };
    return { label: 'Alto Risco', color: 'text-danger bg-danger/10' };
  }, [totalAbcd2]);

  const handleScoreChange = (id: string, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }));
  };

  const handleAbcd2Change = (id: string, value: number) => {
    setAbcd2Scores(prev => ({ ...prev, [id]: value }));
  };

  const [tepRecord, setTepRecord] = useState({
    wellsScore: 0,
    percCriteria: [] as string[],
    pesiScore: 0,
    ddimer: '',
    angioTC: '',
    troponina: '',
    vhd: '',
    hbpmWeight: '',
    infusionStart: '',
    initialAnticoagulant: '',
    notes: ''
  });

  const handleTepChange = (field: string, value: any) => {
    setTepRecord(prev => ({ ...prev, [field]: value }));
  };

  const suggestedNode = useMemo(() => {
    if (activeTab !== 'Interativo') return null;
    
    // Logic for Manejo Inicial branching
    if (activeWorkflowNode === 'Manejo Inicial') {
      if (clinicalRecord.cincinnati === 'Positivo') return 'Manejo Inicial';
      if (clinicalRecord.cincinnati === 'Negativo') return 'AIT';
      
      if (clinicalRecord.ctResult && clinicalRecord.ctResult !== '') {
        if (clinicalRecord.ctResult.includes('Hemorrágico')) return 'Hemorrágico';
        if (clinicalRecord.ctResult === 'Normal' || clinicalRecord.ctResult.includes('Isquemia') || clinicalRecord.ctResult.includes('Oclusão')) return 'Isquêmico';
      }
    }
    
    // Logic for Isquêmico/Hemorrágico completion
    if (activeWorkflowNode === 'Isquêmico' || activeWorkflowNode === 'Hemorrágico') {
      if (clinicalRecord.destination) return 'Internação';
      if (activeWorkflowNode === 'Isquêmico' && (clinicalRecord.thrombolysisDone || clinicalRecord.thrombectomyIndicated)) return 'Internação';
    }

    if (activeWorkflowNode === 'Internação') {
      return 'Alta';
    }

    return null;
  }, [activeTab, activeWorkflowNode, clinicalRecord]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(5, 150, 105); // Green accent
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    const title = activeTab === 'NIHSS' ? 'AVALIAÇÃO NEUROLÓGICA - NIHSS' : 
                  activeTab === 'ABCD2' ? 'ESCORE ABCD² - RISCO DE AVC' : 
                  (activeTab === 'Registro' || activeTab === 'Interativo') ? 'RELATÓRIO DE ATENDIMENTO AVC' :
                  'FLUXOGRAMA DE ATENDIMENTO AVC';
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Hospital Municipal de Morrinhos', pageWidth / 2, 30, { align: 'center' });

    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`PACIENTE: ${patientName.toUpperCase() || 'NÃO INFORMADO'}`, 20, 55);
    doc.text(`DATA/HORA: ${examDate.replace('T', ' ')}`, 20, 62);
    doc.line(20, 67, pageWidth - 20, 67);

    if (activeTab === 'Fluxograma') {
      doc.setFontSize(14);
      doc.text('FLUXOGRAMA DE DIRECIONAMENTO', pageWidth / 2, 85, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Este documento confirma a triagem do paciente no protocolo de AVC.', pageWidth / 2, 95, { align: 'center' });
    } else if (activeTab === 'Registro' || activeTab === 'Interativo') {
      let y = 80;
      doc.setFontSize(14);
      doc.setTextColor(5, 150, 105);
      doc.text('RESUMO DO PROTOCOLO APLICADO', 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const addField = (label: string, value: any) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${value || '---'}`, 80, y);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
      };

      addField('Triagem Cincinnati', clinicalRecord.cincinnati);
      if (clinicalRecord.cincinnati !== '') {
        addField(' - Paralisia Facial', clinicalRecord.cincinnatiFacialDroop);
        addField(' - Queda do Braço', clinicalRecord.cincinnatiArmDrift);
        addField(' - Fala Anormal', clinicalRecord.cincinnatiSpeech);
      }
      addField('Tempo de Início (h)', clinicalRecord.onsetHours);
      addField('Último visto normal', clinicalRecord.lastSeenNormal);
      addField('Idade', clinicalRecord.age);
      addField('Código AVC Ativado', clinicalRecord.codigoAvcActivated ? 'SIM' : 'NÃO');
      y += 5;
      addField('Vias Aéreas', clinicalRecord.airway);
      addField('Saturação O2', clinicalRecord.satO2);
      addField('PAS (Sistólica)', clinicalRecord.pas);
      addField('PAD (Diastólica)', clinicalRecord.pad);
      addField('Glicemia', clinicalRecord.capillaryGlucose);
      addField('Anticoagulante', clinicalRecord.anticoagulant ? 'SIM' : 'NÃO');
      addField('Temperatura', clinicalRecord.temperature);
      y += 5;
      addField('Resultado TC', clinicalRecord.ctResult);
      addField('Trombólise Realizada', clinicalRecord.thrombolysisDone ? 'SIM' : 'NÃO');
      addField('Trombectomia Indicada', clinicalRecord.thrombectomyIndicated ? 'SIM' : 'NÃO');
      addField('Destino', clinicalRecord.destination);
      
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text('RECOMENDAÇÃO DO MOTOR DE DECISÃO', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      addField('Conduta Sugerida', decisionOutput.conduct);
      addField('Próximo Passo', decisionOutput.nextStep);
      
      if (decisionOutput.alerts.length > 0) {
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text('ALERTAS CRÍTICOS:', 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        decisionOutput.alerts.forEach(alert => {
          doc.text(`- ${alert}`, 25, y);
          y += 6;
        });
        doc.setTextColor(0, 0, 0);
      }
      
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text('ESCORES CALCULADOS', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      addField('NIHSS Total', totalScore > 0 ? `${totalScore} (${severity.label})` : 'Não calculado');
      addField('ABCD² Total', totalAbcd2 > 0 ? `${totalAbcd2} (${abcd2Risk.label})` : 'Não calculado');

      if (clinicalRecord.notes) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('NOTAS CLÍNICAS:', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 7;
        const splitNotes = doc.splitTextToSize(clinicalRecord.notes, pageWidth - 40);
        doc.text(splitNotes, 20, y);
      }
    } else {
      // NIHSS or ABCD2 logic (same as before)
      doc.setFontSize(24);
      doc.setTextColor(5, 150, 105);
      const scoreText = activeTab === 'NIHSS' ? `PONTUAÇÃO TOTAL: ${totalScore}` : `ESCORE TOTAL: ${totalAbcd2}`;
      doc.text(scoreText, pageWidth / 2, 85, { align: 'center' });
      doc.setFontSize(16);
      const riskText = activeTab === 'NIHSS' ? `CLASSIFICAÇÃO: ${severity.label.toUpperCase()}` : `RISCO: ${abcd2Risk.label.toUpperCase()}`;
      doc.text(riskText, pageWidth / 2, 100, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      let y = 120;
      const itemsToPrint = activeTab === 'NIHSS' ? NIHSS_ITEMS : ABCD2_ITEMS;
      const currentScores = activeTab === 'NIHSS' ? scores : abcd2Scores;

      itemsToPrint.forEach((item) => {
        const score = currentScores[item.id] ?? '-';
        doc.text(`${item.title}:`, 25, y);
        doc.text(`${score}`, pageWidth - 30, y, { align: 'right' });
        y += 8;
        if (y > 250) { doc.addPage(); y = 20; }
      });
    }

    // Signature
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('CRIADO POR: IVALDO INÁCIO SILVA JÚNIOR', pageWidth / 2, footerY, { align: 'center' });
    doc.text('DIRETOR TÉCNICO DO HOSPITAL MUNICIPAL DE MORRINHOS', pageWidth / 2, footerY + 6, { align: 'center' });

    doc.save(`${activeTab}_${patientName || 'Paciente'}_${new Date().toLocaleDateString()}.pdf`);
  };

  const renderFlowchart = (isInteractive: boolean = false) => {
    const handleNodeClick = (protocol: string) => {
      if (isInteractive) {
        setActiveWorkflowNode(prev => prev === protocol ? '' : protocol);
      } else {
        setSelectedProtocol(prev => prev === protocol ? null : protocol);
      }
    };

    const nodeClass = (node: string) => {
      if (!isInteractive) return "";
      const isActive = activeWorkflowNode === node;
      const isSuggested = suggestedNode === node && !isActive;
      
      return `transition-all duration-300 ${
        isActive 
          ? "ring-4 ring-accent ring-offset-4 ring-offset-white scale-105 z-10 shadow-xl" 
          : isSuggested
            ? "ring-4 ring-orange-400 ring-offset-2 scale-102 animate-pulse z-20 shadow-lg"
            : "opacity-80 hover:opacity-100 hover:scale-102"
      }`;
    };

    const renderNodeSections = (protocolId: string) => {
      if (isInteractive || !PROTOCOLS[protocolId]) return null;
      return (
        <div className="mt-4 flex flex-col items-center animate-in fade-in zoom-in w-full px-2">
           <div className="flex flex-col gap-3 w-full items-center">
            {PROTOCOLS[protocolId].sections.map((section, idx) => (
              <div key={idx} className="bg-white border border-[#1e40af]/20 shadow-sm p-4 rounded-xl text-left w-full max-w-[280px]">
                <h4 className="text-[10px] font-black text-[#1e40af] uppercase tracking-widest mb-2 border-b border-[#1e40af]/10 pb-1">{section.title}</h4>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-[10px] text-slate-700 flex gap-2 font-medium leading-tight">
                       <span className="text-[#f87171] font-black">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
           </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center pt-10">
        {/* Start Node */}
        <div className="relative mb-16">
          <div 
            onClick={() => handleNodeClick('Manejo Inicial')}
            className={`cursor-pointer bg-white border-t-[6px] border-[#f87171] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] rounded-lg p-6 w-56 text-center transition-all ${nodeClass('Manejo Inicial')}`}
          >
            <MapPin className="w-6 h-6 text-[#f87171] mx-auto mb-2" />
            <p className="text-[#f87171] text-sm font-medium">Unidade Hospitalar</p>
          </div>
          {renderNodeSections('Manejo Inicial')}
          <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 flex flex-col items-center">
            <div className="w-[3px] h-10 bg-[#1e40af]"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1e40af]"></div>
          </div>
        </div>

        {/* Level 1 Branching */}
        <div className="w-full max-w-[1000px] relative">
          <div className="absolute top-0 left-[20%] right-[20%] h-[3px] bg-[#1e40af]"></div>
          
          <div className="flex justify-between px-[10%] pt-0">
            <div className="flex flex-col items-center w-[300px] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-6 bg-[#1e40af]"></div>
              <div className="mt-6 w-full">
                <button 
                  onClick={() => handleNodeClick('AIT')}
                  className={`bg-[#7c8db5] text-white font-medium py-5 px-4 rounded-xl w-full text-center shadow-md hover:brightness-95 transition-all text-sm flex flex-col items-center gap-1 ${nodeClass('AIT')}`}
                >
                  <span>AIT (Transitório)</span>
                </button>
                {renderNodeSections('AIT')}
                <div className="flex flex-col items-center mt-0">
                  <div className="w-[3px] h-10 bg-[#1e40af]"></div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1e40af]"></div>
                  <div className={`mt-2 border-[1.5px] border-[#3b82f6] text-[#3b82f6] font-medium py-4 px-6 rounded-full w-48 text-center text-sm bg-white hover:bg-blue-50 cursor-pointer transition-all ${nodeClass('AIT')}`} onClick={() => handleNodeClick('AIT')}>
                    Conduta AIT
                  </div>
                  <div className="w-[3px] min-h-[340px] h-full bg-[#3f8c28] mt-0"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center w-[600px] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-6 bg-[#1e40af]"></div>
              <div className="mt-6 w-full flex flex-col items-center">
                <button 
                  onClick={() => handleNodeClick('Manejo Inicial')}
                  className={`border-[1.5px] border-[#3b82f6] text-[#3b82f6] font-medium py-5 px-4 rounded-full w-[280px] text-center shadow-sm hover:bg-blue-50 transition-all text-sm bg-white flex flex-col items-center gap-1 ${nodeClass('Manejo Inicial')}`}
                >
                  <span>AVC Adulto</span>
                </button>
                <div className="w-[3px] h-8 bg-[#1e40af]"></div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1e40af]"></div>
                <div className={`mt-2 border-[1.5px] border-[#3b82f6] text-[#3b82f6] font-medium py-3 px-8 rounded-full w-48 text-center text-sm bg-white hover:bg-blue-50 cursor-pointer transition-all ${nodeClass('Manejo Inicial')}`} onClick={() => handleNodeClick('Manejo Inicial')}>
                  Fase Aguda
                </div>
                <div className="w-[3px] h-8 bg-[#1e40af]"></div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#1e40af]"></div>

                <div className="w-full relative mt-0 flex flex-col h-full h-auto">
                  <div className="absolute top-0 left-[12%] right-[12%] h-[3px] bg-[#1e40af]"></div>
                  <div className="flex justify-between pt-0 flex-1">
                    <div className="flex flex-col items-center w-[180px] relative">
                      <div className="w-[3px] h-6 bg-[#1e40af]"></div>
                      <div className={`bg-[#7c8db5] text-white font-medium py-4 px-2 rounded-xl w-full text-center shadow-md text-sm hover:brightness-95 cursor-pointer transition-all ${nodeClass('Hemorrágico')}`} onClick={() => handleNodeClick('Hemorrágico')}>
                        Hemorrágico
                      </div>
                      {renderNodeSections('Hemorrágico')}
                      <div className="w-[3px] min-h-[250px] h-full bg-[#3f8c28] mt-4 flex-1"></div>
                    </div>
                    <div className="flex flex-col items-center w-[200px] relative">
                      <div className="w-[3px] h-6 bg-[#1e40af]"></div>
                      <div className={`bg-[#7c8db5] text-white font-medium py-4 px-2 rounded-xl w-full text-center shadow-md text-sm hover:brightness-95 cursor-pointer transition-all ${nodeClass('Isquêmico')}`} onClick={() => handleNodeClick('Isquêmico')}>
                        Isquêmico
                      </div>
                      {renderNodeSections('Isquêmico')}
                      <div className="w-[3px] min-h-[250px] h-full bg-[#3f8c28] mt-4 flex-1"></div>
                    </div>
                    <div className="flex flex-col items-center w-[180px] relative">
                      <div className="w-[3px] h-6 bg-[#1e40af]"></div>
                      <div className={`bg-[#9ca3af] text-white font-medium py-4 px-2 rounded-xl w-full text-center shadow-md text-sm opacity-50`}>
                        Crônico
                      </div>
                      <div className="w-[3px] min-h-[250px] h-full bg-[#3f8c28] mt-4 flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1000px] relative mt-0">
          <div className="absolute top-0 left-[15.5%] right-[14%] h-[3px] bg-[#3f8c28]"></div>
          <div className="flex flex-col items-center pt-0">
            <div className="w-[3px] h-10 bg-[#3f8c28]"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#3f8c28]"></div>
            <div className={`mt-2 bg-[#3f8c28] text-white font-medium py-4 px-10 rounded-xl w-fit text-center shadow-lg text-sm hover:brightness-95 cursor-pointer transition-all ${nodeClass('Internação')}`} onClick={() => handleNodeClick('Internação')}>
              Internação / Monitoramento
            </div>
            {renderNodeSections('Internação')}
            <div className="w-[3px] h-10 bg-[#3f8c28]"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#3f8c28]"></div>
            <div className={`mt-2 bg-accent text-white font-medium py-4 px-10 rounded-xl w-fit text-center shadow-lg text-sm hover:brightness-95 cursor-pointer transition-all ${nodeClass('Alta')}`} onClick={() => handleNodeClick('Alta')}>
              Alta e Reabilitação
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return NIHSS_ITEMS;
    return NIHSS_ITEMS.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-bg font-sans text-text-primary">
      {/* Global Actions Bar */}
      <div className="bg-white border-b border-border px-10 flex justify-end items-center py-2">
        <div className="flex gap-2">
           <button 
             onClick={exportProtocolsToWord}
             className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
            >
             <FileDown className="w-4 h-4" />
             Baixar em Word
           </button>
           <button 
             onClick={onBack}
             className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
           >
             <ArrowLeft className="w-4 h-4" />
             Voltar ao Dashboard
           </button>
        </div>
      </div>

      <div className="bg-card border-b border-border py-4 px-10 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${activeProtocolId === 'tep' ? 'bg-rose-500/10 text-rose-500' : 'bg-accent/10 text-accent'}`}>
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tighter uppercase ${activeProtocolId === 'tep' ? 'text-rose-500' : 'text-accent'}`}>
              PROTOCOLOS {activeProtocolId.toUpperCase()} MORRINHOS
            </h1>
            <p className="text-text-secondary text-[11px] font-bold opacity-60">HOSPITAL MUNICIPAL DE MORRINHOS - GO</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-black text-[12px] mb-0.5 ${activeProtocolId === 'tep' ? 'text-rose-500' : 'text-accent'}`}>DR. IVALDO INÁCIO SILVA JÚNIOR</p>
          <p className="text-text-secondary text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">Diretor Técnico</p>
        </div>
      </div>

      <div className="bg-card border-b border-border px-10 flex gap-8 overflow-x-auto no-scrollbar">
        {activeProtocolId === 'avc' ? (
          <>
            {['Fluxograma', 'Interativo', 'Registro', 'NIHSS', 'ABCD2'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-6 px-1 transition-all border-b-4 ${activeTab === tab ? 'border-accent text-accent font-black' : 'border-transparent text-text-secondary opacity-60 font-bold'} text-[11px] uppercase tracking-widest`}
              >
                {tab === 'Fluxograma' ? 'Fluxo Visual' : tab === 'Interativo' ? 'Mapa Interativo' : tab}
              </button>
            ))}
          </>
        ) : activeProtocolId === 'tep' ? (
          <>
            {[
              { id: 'Interativo', label: 'Mapa Interativo' },
              { id: 'TEP-Escores', label: 'Calculadoras' },
              { id: 'TEP-Fluxo', label: 'Fluxograma ESC' },
              { id: 'TEP-Tratamento', label: 'Tratamento' },
              { id: 'TEP-Registro', label: 'Registro Clínico' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-6 px-1 transition-all border-b-4 ${activeTab === tab.id ? 'border-rose-500 text-rose-500 font-black' : 'border-transparent text-text-secondary opacity-60 font-bold'} text-[11px] uppercase tracking-widest`}
              >
                {tab.label}
              </button>
            ))}
          </>
        ) : activeProtocolId === 'sepse' ? (
          <>
            {[
              { id: 'Sepse-Anexos', label: 'Anexos & Escalas' },
              { id: 'Sepse-Fluxo', label: 'Fluxo Interativo' },
              { id: 'Sepse-Ficha', label: 'Ficha Clínica POP' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-6 px-1 transition-all border-b-4 ${activeTab === tab.id ? 'border-emerald-600 text-emerald-600 font-black' : 'border-transparent text-text-secondary opacity-60 font-bold'} text-[11px] uppercase tracking-widest`}
              >
                {tab.label}
              </button>
            ))}
          </>
        ) : (
          <>
            {[
              { id: 'Interativo', label: 'Sob Consulta' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-6 px-1 transition-all border-b-4 ${activeTab === tab.id ? 'border-slate-500 text-slate-500 font-black' : 'border-transparent text-text-secondary opacity-60 font-bold'} text-[11px] uppercase tracking-widest`}
              >
                {tab.label}
              </button>
            ))}
          </>
        )}
      </div>



      {/* Unified Content Sections */}
      {activeProtocolId === 'avc' ? (
        <main className="min-h-screen">
          {activeTab === 'Fluxograma' ? (
            <div className="max-w-[1200px] mx-auto p-10 bg-white min-h-screen">
                {/* Breadcrumb-like header from image */}
                <div className="flex items-center gap-2 text-[10px] text-text-secondary mb-6 opacity-60">
                  <span>Portal</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Acidente Vascular Cerebral (AVC) no Adulto</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-accent font-bold">Unidade Hospitalar</span>
                </div>

                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-[32px] font-medium text-[#1e3a8a] flex items-center gap-2">
                      Acidente Vascular Cerebral (AVC) no Adulto
                      <Info className="w-5 h-5 text-[#1e3a8a] fill-current opacity-80" />
                    </h2>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="bg-[#f87171] p-1.5 rounded-full">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[20px] text-[#1e3a8a]">Você esta em: <span className="font-bold">Unidade Hospitalar</span></span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      handleClinicalChange('codigoAvcActivated', true);
                      alert('CÓDIGO AVC ATIVADO! Notificando neurologista, equipe de emergência e radiologia.');
                    }}
                    className="bg-danger hover:bg-danger/90 text-white px-8 py-4 rounded-xl font-black text-lg shadow-xl shadow-danger/20 flex items-center gap-3 animate-pulse"
                  >
                    <Clock className="w-6 h-6" />
                    ATIVAR CÓDIGO AVC
                  </button>
                </div>

                {renderFlowchart(false)}
            </div>
          ) : activeTab === 'Interativo' ? (
            <div className="min-h-screen bg-bg">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
                  {/* Left Column: Interactive Map */}
                  <div className="p-10 border-r border-border bg-white overflow-y-auto max-h-[calc(100vh-140px)]">
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-accent uppercase tracking-tighter">Mapa Interativo</h2>
                        <p className="text-text-secondary text-sm">Selecione uma etapa para aplicar o protocolo</p>
                      </div>
                      <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                        <Activity className="w-4 h-4 text-accent animate-pulse" />
                        <span className="text-[11px] font-black text-accent uppercase tracking-widest">Modo Aplicação Ativo</span>
                      </div>
                    </div>
                    {renderFlowchart(true)}
                  </div>

                  {/* Right Column: Active Worksheet */}
                  <div className="p-10 bg-card/30 overflow-y-auto max-h-[calc(100vh-140px)] shadow-inner">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeWorkflowNode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center gap-4 mb-10">
                          <div className="p-3 bg-accent rounded-xl shadow-lg shadow-accent/20">
                            <Stethoscope className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-accent uppercase tracking-tighter">
                              {activeWorkflowNode === 'Manejo Inicial' ? 'Avaliação Inicial & ABCDE' : 
                               activeWorkflowNode === 'AIT' ? 'Protocolo de AIT (ABCD²)' :
                               activeWorkflowNode === 'Isquêmico' ? 'Manejo AVC Isquêmico' :
                               activeWorkflowNode === 'Hemorrágico' ? 'Manejo AVC Hemorrágico' :
                               activeWorkflowNode === 'Internação' ? 'Monitoramento & Internação' :
                               'Finalização do Atendimento'}
                            </h3>
                            <p className="text-text-secondary font-medium">Preencha os dados e siga as orientações abaixo</p>
                          </div>
                        </div>

                  {/* Contextual Entry Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl border border-border shadow-sm">
                    {activeWorkflowNode === 'Manejo Inicial' && (
                      <>
                        <div className="space-y-4 col-span-full bg-bg/50 p-6 rounded-2xl border border-border">
                          <div className="flex items-center justify-between mb-2">
                             <label className="text-xs font-black uppercase text-accent tracking-widest">Escala de Cincinnati (Triagem Rápida)</label>
                             <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${clinicalRecord.cincinnati === 'Positivo' ? 'bg-danger text-white' : clinicalRecord.cincinnati === 'Negativo' ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'}`}>
                                Result: {clinicalRecord.cincinnati || 'Pendente'}
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { id: 'cincinnatiFacialDroop', label: 'Paralisia Facial', desc: 'Peça para sorrir' },
                              { id: 'cincinnatiArmDrift', label: 'Queda do Braço', desc: 'Olhos fechados, braços 10s' },
                              { id: 'cincinnatiSpeech', label: 'Fala Anormal', desc: '"O rato roeu a roupa..."' }
                            ].map((item) => (
                              <div key={item.id} className="space-y-2">
                                <p className="text-[10px] font-bold text-text-secondary uppercase">{item.label}</p>
                                <div className="flex gap-1">
                                  {['Normal', 'Alterado'].map(val => (
                                    <button
                                      key={val}
                                      onClick={() => handleClinicalChange(item.id as keyof ClinicalRecord, val)}
                                      className={`flex-1 py-2 rounded text-[10px] font-bold transition-all ${clinicalRecord[item.id as keyof ClinicalRecord] === val ? (val === 'Alterado' ? 'bg-danger text-white border-danger' : 'bg-success text-white border-success') : 'bg-white border-border text-text-secondary border'}`}
                                    >
                                      {val}
                                    </button>
                                  ))}
                                </div>
                                <p className="text-[9px] italic text-text-secondary opacity-60 leading-tight">{item.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Tempo de Início (Horas)</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 2"
                            value={clinicalRecord.onsetHours}
                            onChange={(e) => handleClinicalChange('onsetHours', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Idade do Paciente</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 65"
                            value={clinicalRecord.age}
                            onChange={(e) => handleClinicalChange('age', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Pressão Sistólica (PAS)</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 190"
                            value={clinicalRecord.pas}
                            onChange={(e) => handleClinicalChange('pas', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Pressão Diastólica (PAD)</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 110"
                            value={clinicalRecord.pad}
                            onChange={(e) => handleClinicalChange('pad', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Glicemia Capilar (mg/dL)</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 120"
                            value={clinicalRecord.capillaryGlucose}
                            onChange={(e) => handleClinicalChange('capillaryGlucose', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Uso de Anticoagulante?</label>
                          <div className="flex items-center h-[38px]">
                            <button
                              onClick={() => handleClinicalChange('anticoagulant', !clinicalRecord.anticoagulant)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${clinicalRecord.anticoagulant ? 'bg-orange-500 text-white' : 'bg-bg text-text-secondary border border-border'}`}
                            >
                              {clinicalRecord.anticoagulant ? 'SIM (Anticoagulado)' : 'NÃO'}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">A: Via Aérea</label>
                          <select 
                            value={clinicalRecord.airway}
                            onChange={(e) => handleClinicalChange('airway', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          >
                            <option value="">Selecione</option>
                            <option value="Pérvea">Pérvea</option>
                            <option value="Obstruída">Obstruída</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">B: Oximetria (SatO₂ %)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 96%"
                            value={clinicalRecord.satO2}
                            onChange={(e) => handleClinicalChange('satO2', e.target.value)}
                            className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-2 col-span-full">
                          <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 p-4 rounded-xl">
                            <Clock className="w-5 h-5 text-danger animate-pulse" />
                            <div className="flex-1">
                              <p className="text-xs font-black text-danger uppercase tracking-tighter">ATIVAR CÓDIGO AVC IMEDIATAMENTE SE CINCINNATI (+)</p>
                            </div>
                            <button 
                              onClick={() => handleClinicalChange('codigoAvcActivated', true)}
                              className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase transition-all ${clinicalRecord.codigoAvcActivated ? 'bg-danger text-white' : 'bg-white border border-danger text-danger'}`}
                            >
                              {clinicalRecord.codigoAvcActivated ? 'CÓDIGO ATIVADO' : 'ATIVAR AGORA'}
                            </button>
                          </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-border col-span-full space-y-4">
                           {clinicalRecord.cincinnati === 'Positivo' && (
                             <div className="bg-danger/10 p-4 rounded-xl border border-danger/30 mb-4 animate-in fade-in slide-in-from-bottom-2">
                               <p className="text-danger font-black text-sm uppercase flex items-center gap-2">
                                 <AlertCircle className="w-4 h-4" />
                                 CINCINNATI POSITIVO - SEGUIR PARA EXAMES DE IMAGEM
                               </p>
                               <button 
                                 onClick={() => setActiveWorkflowNode('Isquêmico')}
                                 className="w-full mt-3 py-4 bg-danger text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                               >
                                 PROSSEGUIR PARA TOMOGRAFIA
                                 <ChevronRight className="w-5 h-5" />
                               </button>
                             </div>
                           )}

                           <button 
                            onClick={() => setActiveTab('NIHSS')}
                            className="w-full py-4 bg-[#1e40af] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
                           >
                            <Brain className="w-5 h-5" />
                            APLICAR ESCALA NIHSS AGORA
                           </button>
                        </div>
                      </>
                    )}

                    {activeWorkflowNode === 'AIT' && (
                      <>
                        <div className="col-span-full mb-4">
                           <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 text-sm">
                              <strong>Instrução:</strong> Use o escore ABCD² para estratificar o risco de AVC em 48h.
                           </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('ABCD2')}
                          className="col-span-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
                        >
                          <Activity className="w-5 h-5" />
                          CALCULAR ESCORE ABCD²
                        </button>
                        
                        {totalAbcd2 > 0 && (
                          <div className="col-span-full pt-4 animate-in slide-in-from-top-2">
                             <div className={`p-4 rounded-xl border mb-4 ${abcd2Risk.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 ')}`}>
                                <p className="font-black uppercase text-xs">Resultado: {abcd2Risk.label} ({totalAbcd2} pts)</p>
                             </div>
                             <button 
                              onClick={() => setActiveWorkflowNode('Internação')}
                              className="w-full py-3 bg-[#3f8c28] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                             >
                              CONTINUAR PARA INTERNAÇÃO/OBSERVAÇÃO
                              <ChevronRight className="w-4 h-4" />
                             </button>
                          </div>
                        )}
                      </>
                    )}

                    {activeWorkflowNode === 'Isquêmico' && (
                      <>
                        <div className="space-y-2 col-span-full">
                          <label className="text-[11px] uppercase font-bold text-text-secondary">Resultado da TC de Crânio</label>
                          <select 
                            value={clinicalRecord.ctResult}
                            onChange={(e) => handleClinicalChange('ctResult', e.target.value)}
                            className="w-full bg-accent text-white px-3 py-4 rounded-xl text-sm font-bold shadow-md outline-none"
                          >
                            <option value="">Selecione o Achado...</option>
                            <option value="Normal">Normal (Sugere AVCI ou AIT)</option>
                            <option value="Sinais de Isquemia Precoce">Sinais de Isquemia Precoce</option>
                            <option value="Oclusão de Grande Vaso">Oclusão de Grande Vaso</option>
                            <option value="Hemorrágico">Hemorrágico (AVC Hemorrágico)</option>
                          </select>
                        </div>

                        {clinicalRecord.ctResult === 'Hemorrágico' && (
                          <div className="col-span-full bg-danger/10 p-6 rounded-2xl border border-danger/30 animate-in zoom-in-95">
                            <h4 className="text-danger font-black text-lg mb-2 flex items-center gap-2">
                              <AlertCircle className="w-6 h-6" />
                              TC CONFIRMOU HEMORRAGIA
                            </h4>
                            <p className="text-text-secondary text-sm mb-4">
                              O protocolo de isquemia foir interrompido. Mude imediatamente para o manejo hemorrágico.
                            </p>
                            <button 
                              onClick={() => setActiveWorkflowNode('Hemorrágico')}
                              className="w-full py-4 bg-danger text-white rounded-xl font-bold shadow-lg shadow-danger/20"
                            >
                              MUDAR PARA PROTOCOLO HEMORRÁGICO
                            </button>
                          </div>
                        )}

                        {clinicalRecord.ctResult && clinicalRecord.ctResult !== 'Hemorrágico' && (
                          <>
                            <div className="space-y-4 col-span-full pt-6">
                           <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-xl">
                              <span className="font-bold text-sm">Candidato à Trombólise? (Alteplase)</span>
                              <input 
                                type="checkbox" 
                                checked={clinicalRecord.thrombolysisDone}
                                onChange={(e) => handleClinicalChange('thrombolysisDone', e.target.checked)}
                                className="w-6 h-6 accent-accent"
                              />
                           </div>
                           <div className="flex items-center justify-between p-4 bg-bg border border-border rounded-xl">
                              <span className="font-bold text-sm">Indicação de Trombectomia Mecânica?</span>
                              <input 
                                type="checkbox" 
                                checked={clinicalRecord.thrombectomyIndicated}
                                onChange={(e) => handleClinicalChange('thrombectomyIndicated', e.target.checked)}
                                className="w-6 h-6 accent-accent"
                              />
                           </div>
                        </div>
                        <button 
                          onClick={() => setActiveWorkflowNode('Internação')}
                          className="col-span-full mt-8 py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-md"
                        >
                          PRÓXIMA ETAPA: DEFINIR INTERNAÇÃO
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                )}

                    {(activeWorkflowNode === 'Hemorrágico' || activeWorkflowNode === 'Internação') && (
                      <div className="col-span-full space-y-4">
                        <label className="text-[11px] uppercase font-bold text-text-secondary">Definir Destino do Paciente</label>
                        <div className="grid grid-cols-2 gap-4">
                          {['UTI Adulto', 'Unidade de AVC', 'Enfermaria', 'Transferência'].map(dest => (
                            <button
                              key={dest}
                              onClick={() => handleClinicalChange('destination', dest)}
                              className={`py-6 rounded-xl border-2 transition-all font-bold text-sm ${clinicalRecord.destination === dest ? 'bg-accent/10 border-accent text-accent' : 'bg-white border-border text-text-secondary hover:border-accent/40'}`}
                            >
                              {dest}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 col-span-full pt-6">
                      <label className="text-[11px] uppercase font-bold text-text-secondary">Notas e Planejamento</label>
                      <textarea 
                        rows={4}
                        placeholder="Descreva o plano terapêutico, medicações em uso e observações relevantes..."
                        value={clinicalRecord.notes}
                        onChange={(e) => handleClinicalChange('notes', e.target.value)}
                        className="w-full bg-bg border border-border text-text-primary px-4 py-3 rounded-xl text-sm outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Motor de Decisão Clínica */}
                  <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 mb-2 font-bold text-sm text-accent uppercase tracking-widest">
                      <ShieldCheck className="w-5 h-5" />
                      Motor de Decisão Clínica
                    </div>
                    
                    <div className={`p-6 rounded-2xl border-2 shadow-xl ${decisionOutput.isThrombolysisCandidate ? 'bg-success/5 border-success/30' : (decisionOutput.alerts.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-border')}`}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Conduta Sugerida:</p>
                            <h4 className={`text-xl font-black uppercase tracking-tighter ${decisionOutput.isThrombolysisCandidate ? 'text-success' : 'text-text-primary'}`}>
                              {decisionOutput.conduct}
                            </h4>
                          </div>
                          
                          {decisionOutput.alerts.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-text-secondary uppercase">Alertas de Segurança:</p>
                              {decisionOutput.alerts.map((alert, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm font-bold text-orange-700 bg-orange-100/50 p-2 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>{alert}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase mb-1">Próximo Passo Recomendado:</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-accent">
                              <ChevronRight className="w-4 h-4" />
                              {decisionOutput.nextStep}
                            </div>
                          </div>
                        </div>
                        
                        {decisionOutput.contraindicationsChecklist && (
                          <div className="w-full md:w-64 bg-white/50 p-4 rounded-xl border border-success/20">
                            <p className="text-[10px] font-black text-success uppercase mb-3 text-center md:text-left">Checklist Contraindicações:</p>
                            <ul className="space-y-2">
                              {decisionOutput.contraindicationsChecklist.map((item, i) => (
                                <li key={i} className="flex gap-2 text-[11px] text-text-secondary leading-tight">
                                  <div className="w-3 h-3 rounded border border-success mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                            <p className="text-[9px] italic text-text-secondary mt-4 leading-tight">
                              Certifique-se de que nenhum item acima está presente antes de iniciar trombólise.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contextual Instructions */}
                  <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6">
                    <h4 className="font-bold text-accent text-sm uppercase tracking-widest mb-4">Condutas Recomendadas:</h4>
                    <div className="space-y-3">
                      {PROTOCOLS[activeWorkflowNode === 'Manejo Inicial' ? 'Manejo Inicial' : activeWorkflowNode]?.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-[11px] font-black text-accent/60 uppercase">{sec.title}</p>
                          <ul className="space-y-1">
                            {sec.items.map((item, i) => (
                              <li key={i} className="text-sm text-text-secondary flex gap-2">
                                <span className="text-accent">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : activeTab === 'Registro' ? (
            <div className="max-w-[1200px] mx-auto p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Triagem */}
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <h3 className="text-accent font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Triagem e Classificação de Risco
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 col-span-full bg-accent/5 p-6 rounded-xl border border-accent/10">
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-black uppercase text-accent tracking-widest">Escala de Cincinnati</label>
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${clinicalRecord.cincinnati === 'Positivo' ? 'bg-danger text-white' : clinicalRecord.cincinnati === 'Negativo' ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {clinicalRecord.cincinnati || 'Pendente'}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'cincinnatiFacialDroop', label: 'Paralisia Facial', desc: 'Assimetria no sorriso' },
                        { id: 'cincinnatiArmDrift', label: 'Queda do Braço', desc: 'Fraqueza nos braços' },
                        { id: 'cincinnatiSpeech', label: 'Fala Anormal', desc: 'Slurring ou afasia' }
                      ].map((item) => (
                        <div key={item.id} className="space-y-2">
                          <p className="text-[10px] font-bold text-text-secondary uppercase">{item.label}</p>
                          <div className="flex gap-1">
                            {['Normal', 'Alterado'].map(val => (
                              <button
                                key={val}
                                onClick={() => handleClinicalChange(item.id as keyof ClinicalRecord, val)}
                                className={`flex-1 py-2 rounded text-[10px] font-bold transition-all ${clinicalRecord[item.id as keyof ClinicalRecord] === val ? (val === 'Alterado' ? 'bg-danger text-white' : 'bg-success text-white') : 'bg-white border-border text-text-secondary border'}`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Tempo de Início (Horas)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 2"
                      value={clinicalRecord.onsetHours}
                      onChange={(e) => handleClinicalChange('onsetHours', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Idade</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 65"
                      value={clinicalRecord.age}
                      onChange={(e) => handleClinicalChange('age', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Última vez visto normal</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 08:30h"
                      value={clinicalRecord.lastSeenNormal}
                      onChange={(e) => handleClinicalChange('lastSeenNormal', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-danger/5 border border-danger/20 p-4 rounded-lg self-end">
                    <div className="flex-1">
                      <p className="text-xs font-black text-danger uppercase tracking-tighter">CÓDIGO AVC ATIVADO?</p>
                    </div>
                    <button 
                      onClick={() => handleClinicalChange('codigoAvcActivated', !clinicalRecord.codigoAvcActivated)}
                      className={`w-12 h-6 rounded-full relative transition-all ${clinicalRecord.codigoAvcActivated ? 'bg-danger' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${clinicalRecord.codigoAvcActivated ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: ABCDE */}
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <h3 className="text-accent font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Avaliação Inicial (ABCDE)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">A: Via Aérea</label>
                    <select 
                      value={clinicalRecord.airway}
                      onChange={(e) => handleClinicalChange('airway', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    >
                      <option value="">Selecione</option>
                      <option value="Pérvea">Pérvea</option>
                      <option value="Obstruída">Obstruída</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">B: Oximetria (SatO₂ %)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 96%"
                      value={clinicalRecord.satO2}
                      onChange={(e) => handleClinicalChange('satO2', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">PAS (Sistólica)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 190"
                      value={clinicalRecord.pas}
                      onChange={(e) => handleClinicalChange('pas', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">PAD (Diastólica)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 110"
                      value={clinicalRecord.pad}
                      onChange={(e) => handleClinicalChange('pad', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Glicemia Capilar (mg/dL)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 120"
                      value={clinicalRecord.capillaryGlucose}
                      onChange={(e) => handleClinicalChange('capillaryGlucose', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Uso de Anticoagulante?</label>
                    <div className="flex items-center h-[38px]">
                      <button
                        onClick={() => handleClinicalChange('anticoagulant', !clinicalRecord.anticoagulant)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${clinicalRecord.anticoagulant ? 'bg-orange-500 text-white border-orange-500' : 'bg-bg text-text-secondary border border-border'}`}
                      >
                        {clinicalRecord.anticoagulant ? 'SIM (Anticoagulado)' : 'NÃO'}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">E: Temperatura</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 36.5°C"
                      value={clinicalRecord.temperature}
                      onChange={(e) => handleClinicalChange('temperature', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Conduta */}
              <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <h3 className="text-accent font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Manejo e Resultado de Imagem
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Resultado da TC de Crânio</label>
                    <select 
                      value={clinicalRecord.ctResult}
                      onChange={(e) => handleClinicalChange('ctResult', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent"
                    >
                      <option value="">Selecione</option>
                      <option value="Isquêmico">Isquêmico</option>
                      <option value="Hemorrágico">Hemorrágico</option>
                      <option value="Normal">Normal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trombólise Realizada?</span>
                      <button 
                        onClick={() => handleClinicalChange('thrombolysisDone', !clinicalRecord.thrombolysisDone)}
                        className={`w-10 h-5 rounded-full relative transition-all ${clinicalRecord.thrombolysisDone ? 'bg-success' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${clinicalRecord.thrombolysisDone ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trombectomia Indicada?</span>
                      <button 
                        onClick={() => handleClinicalChange('thrombectomyIndicated', !clinicalRecord.thrombectomyIndicated)}
                        className={`w-10 h-5 rounded-full relative transition-all ${clinicalRecord.thrombectomyIndicated ? 'bg-success' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${clinicalRecord.thrombectomyIndicated ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] uppercase font-bold text-text-secondary">Notas Clínicas / Observações</label>
                    <textarea 
                      rows={3}
                      value={clinicalRecord.notes}
                      onChange={(e) => handleClinicalChange('notes', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary px-3 py-2 rounded text-sm outline-none focus:border-accent resize-none"
                      placeholder="Descreva detalhes relevantes do atendimento..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Sticky for Summary and PDF */}
            <div className="flex flex-col gap-6">
              <div className="bg-card border border-accent rounded-xl p-8 sticky top-24 shadow-xl shadow-accent/5">
                <h3 className="text-accent font-black text-sm uppercase tracking-widest mb-6">Status do Protocolo</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">NIHSS Calculado</span>
                    <span className={`font-bold ${totalScore > 0 ? 'text-success' : 'text-text-secondary'}`}>{totalScore > 0 ? 'SIM' : 'NÃO'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">ABCD² Calculado</span>
                    <span className={`font-bold ${totalAbcd2 > 0 ? 'text-success' : 'text-text-secondary'}`}>{totalAbcd2 > 0 ? 'SIM' : 'NÃO'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Código AVC</span>
                    <span className={`font-bold ${clinicalRecord.codigoAvcActivated ? 'text-danger animate-pulse' : 'text-text-secondary'}`}>{clinicalRecord.codigoAvcActivated ? 'ATIVADO' : 'AGUARDANDO'}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-border space-y-3">
                    <label className="text-[10px] uppercase font-black text-accent block">Motor de Decisão</label>
                    <div className={`p-3 rounded-lg border flex flex-col gap-2 ${decisionOutput.isThrombolysisCandidate ? 'bg-success/5 border-success/30' : 'bg-bg border-border'}`}>
                       <span className="text-[10px] font-bold text-text-primary leading-tight">{decisionOutput.conduct}</span>
                       <div className="flex items-center gap-1 text-[9px] font-black text-accent uppercase tracking-tighter">
                          <ChevronRight className="w-3 h-3" />
                          {decisionOutput.nextStep}
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <label className="text-[10px] uppercase font-bold text-text-secondary block mb-2">Destino do Paciente</label>
                    <select 
                      value={clinicalRecord.destination}
                      onChange={(e) => handleClinicalChange('destination', e.target.value)}
                      className="w-full bg-bg border border-border text-text-primary p-2 rounded text-xs outline-none focus:border-accent"
                    >
                      <option value="">Selecione</option>
                      <option value="Unidade de AVC">Unidade de AVC</option>
                      <option value="UTI">UTI</option>
                      <option value="Ambulatório">Ambulatório</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20 mb-6 text-[11px] text-text-secondary italic leading-relaxed">
                  Ao gerar o relatório, todas as abas preenchidas serão consolidadas em um único documento médico legal.
                </div>

                <button 
                  onClick={generatePDF}
                  className="w-full bg-accent hover:bg-accent/90 text-white py-4 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Gerar Protocolo Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'NIHSS' ? (
        <NIHSSWizard 
          scores={scores} 
          handleScoreChange={handleScoreChange} 
          totalScore={totalScore} 
          severity={severity}
          generatePDF={generatePDF}
          onReset={() => setScores({})}
        />
      ) : activeTab === 'ABCD2' ? (
             <div className="max-w-[1400px] mx-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-accent font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Escore ABCD²
              </h2>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                Utilizado para definir o grau de risco de AVC isquêmico após um AIT. 
                Auxilia na identificação de pacientes que necessitam de investigação emergencial.
              </p>

              <div className="space-y-8">
                {ABCD2_ITEMS.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <label className="text-[13px] font-bold text-text-primary uppercase tracking-wider">{item.title}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {item.options.map((opt) => (
                        <button
                          key={`${item.id}-${opt.value}`}
                          onClick={() => handleAbcd2Change(item.id, opt.value)}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all text-left ${
                            abcd2Scores[item.id] === opt.value
                            ? 'bg-accent border-accent text-white font-bold'
                            : 'bg-bg border-border text-text-secondary hover:border-accent/30'
                          }`}
                        >
                          <span className="text-[13px]">{opt.label}</span>
                          <span className="text-[11px] opacity-70">+{opt.value} pts</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-card border border-accent rounded-xl p-10 flex flex-col justify-center items-center text-center sticky top-24 shadow-2xl shadow-accent/5">
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-[2px] mb-2">Escore ABCD² Total</p>
              <div className="text-[72px] font-black text-accent leading-none mb-4">{totalAbcd2}</div>
              <div className={`px-6 py-2 rounded-full text-[14px] font-bold mb-8 uppercase tracking-widest ${abcd2Risk.color}`}>
                {abcd2Risk.label}
              </div>

              <div className="w-full space-y-4 text-left mb-8">
                <div className="p-4 bg-bg border border-border rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-text-secondary mb-1">Interpretação</p>
                  <p className="text-[12px] text-text-primary leading-relaxed">
                    {totalAbcd2 <= 3 ? 'Baixo risco de AVC em 2 dias (1.0%).' : 
                     totalAbcd2 <= 5 ? 'Moderado risco de AVC em 2 dias (4.1%).' : 
                     'Alto risco de AVC em 2 dias (8.1%).'}
                  </p>
                </div>
                <div className="p-4 bg-bg border border-border rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-text-secondary mb-1">Conduta Sugerida</p>
                  <p className="text-[12px] text-text-primary leading-relaxed italic">
                    {totalAbcd2 >= 4 ? 'Considerar hospitalização e investigação rápida (Neuroimagem, Doppler de Carótidas, ECG).' : 
                     'Investigação ambulatorial rápida pode ser considerada.'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={generatePDF}
                className="w-full bg-success hover:bg-success/90 text-white py-4 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Gerar Relatório ABCD²
              </button>
            </div>
          </div>
        </div>
      ) : null}

        <footer className="bg-card border-t border-border py-6 px-10 text-center text-[11px] text-text-secondary leading-relaxed">
        <div className="text-accent font-bold text-[12px] mb-1">IVALDO INÁCIO SILVA JÚNIOR</div>
        <div className="mb-2">Diretor Técnico do Hospital Municipal de Morrinhos</div>
        <p>Sistema de Registro e Monitoramento da Linha de Cuidado de AVC (Ministério da Saúde)</p>
      </footer>
          <ProtocolModal />
        </main>
      ) : activeProtocolId === 'tep' ? (
        <main className="min-h-screen">
          {activeTab === 'Fluxograma' && (
            <div className="p-10 max-w-7xl mx-auto bg-white min-h-screen">
               <div className="mb-12 text-center space-y-4">
                  <h2 className="text-4xl font-black text-rose-500 tracking-tighter uppercase italic leading-none">Fluxograma Tromboembolismo Pulmonar</h2>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest opacity-60">Diretriz ESC / Hospital Morrinhos</p>
               </div>
               {renderTEPFlowchart(false)}
            </div>
          )}

          {activeTab === 'Interativo' && (
             <div className="grid grid-cols-1 xl:grid-cols-2 min-h-[calc(100vh-210px)]">
                <div className="p-10 bg-white border-r border-border overflow-y-auto max-h-[calc(100vh-210px)]">
                  <div className="mb-8 p-6 bg-rose-50 rounded-3xl border border-rose-100">
                     <h3 className="text-rose-500 font-black text-xs uppercase tracking-widest mb-2 italic tracking-tighter">Workflow Terapêutico TEP</h3>
                     <p className="text-[11px] text-slate-500 font-medium">Aplicação clínica automatizada para Morrinhos.</p>
                  </div>
                  {renderTEPFlowchart(true)}
              </div>
              <div className="p-10 bg-rose-50/5 overflow-y-auto max-h-[calc(100vh-210px)] shadow-inner">
                <AnimatePresence mode="wait">
                     <motion.div key={activeTEPNode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div className="flex flex-col gap-2 mb-10">
                           <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Etapa TEP Selecionada</span>
                           <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">{activeTEPNode}</h3>
                           <div className="h-1 w-20 bg-rose-500 rounded-full" />
                        </div>
                        
                        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl space-y-10">
                           {TEP_PROTOCOLS[activeTEPNode]?.sections.map((section, idx) => (
                              <div key={idx} className="space-y-4 border-l-4 border-rose-100 pl-8">
                                 <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest">{section.title}</h4>
                                 <ul className="space-y-3">
                                    {section.items.map((item, i) => (
                                       <li key={i} className="flex gap-4 text-sm font-medium text-slate-700 leading-relaxed">
                                          <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shrink-0 font-black mt-0.5">{i+1}</div>
                                          {item}
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           ))}
                        </div>
                     </motion.div>
                  </AnimatePresence>
                </div>
             </div>
          )}

          {activeTab === 'TEP-Registro' && (
            <div className="p-10 max-w-5xl mx-auto bg-white rounded-[64px] shadow-2xl mt-12 border border-slate-100 mb-20 animate-in fade-in zoom-in-95 duration-500">
               <div className="text-center space-y-4 mb-20 text-rose-500">
                  <Activity className="w-12 h-12 mx-auto animate-pulse" />
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Registro Clínico - TEP</h2>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Ficha Oficial de Atendimento</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        <Calculator className="w-4 h-4 text-rose-500" />
                        Dados Diagnósticos
                     </h4>
                     <div className="space-y-6">
                       {[
                         { label: 'Escore de Wells Calculado', field: 'wellsScore' },
                         { label: 'D-Dímero (ng/mL)', field: 'ddimer' },
                         { label: 'Troponina I/T', field: 'troponina' }
                       ].map(f => (
                         <div key={f.field} className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                           <input className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold focus:border-rose-300 outline-none transition-all focus:ring-4 focus:ring-rose-500/10 placeholder:text-slate-300" placeholder="---" />
                         </div>
                       ))}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                        <Eye className="w-4 h-4 text-rose-500" />
                        Exames Complementares
                     </h4>
                     <div className="p-8 bg-rose-50 border border-rose-100 rounded-[40px] space-y-4">
                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Resultado Angio-TC / Cintilografia</label>
                        <textarea className="w-full bg-white border border-rose-100 rounded-3xl p-6 text-sm font-medium focus:border-rose-400 outline-none min-h-[150px] shadow-inner" placeholder="Descrever evidência de TEP..."></textarea>
                     </div>
                  </div>
               </div>
               <div className="mt-20 pt-10 border-t flex justify-center">
                  <button className="bg-rose-500 text-white px-20 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-200 hover:scale-[1.02] transition-all hover:brightness-110 active:scale-95 duration-200">
                    Finalizar Registro TEP
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'TEP-Escores' && <TEPProtocolContent activeTab="TEP-Interativo" setActiveTab={setActiveTab} />}
          {activeTab === 'TEP-Tratamento' && <TEPProtocolContent activeTab="TEP-Tratamento" setActiveTab={setActiveTab} />}
          {activeTab === 'TEP-Fluxo' && <TEPProtocolContent activeTab="TEP-ESC" setActiveTab={setActiveTab} />}
        </main>
      ) : activeProtocolId === 'sepse' ? (
        <main className="min-h-screen">
          <SepseProtocolContent 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            patientName={patientName} 
            examDate={examDate} 
          />
        </main>
      ) : (
    <main className="max-w-4xl mx-auto p-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
       <div className="relative">
          <div className="w-32 h-32 bg-slate-100 rounded-[40px] flex items-center justify-center animate-pulse">
            {activeProtocolId === 'icc' && <HeartPulse className="w-16 h-16 text-blue-500 opacity-20" />}
            {activeProtocolId === 'infantil' && <Users className="w-16 h-16 text-orange-500 opacity-20" />}
          </div>
          <div className="absolute -right-2 -bottom-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
             <Lock className="w-4 h-4 text-slate-400" />
          </div>
       </div>
       
       <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
            Protocolo em <span className="text-accent">Homologação</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            As diretrizes clínicas para <span className="font-bold text-slate-700 capitalize">{activeProtocolId}</span> estão sendo finalizadas pela Comissão de Protocolos e estarão disponíveis em breve.
          </p>
       </div>

       <div className="flex gap-4">
          <button 
            onClick={() => setActiveProtocolId('avc')}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all"
          >
            Voltar ao AVC
          </button>
       </div>
    </main>
  )}
</div>
);
};

// --- Institutional Components ---

const TEP_PROTOCOLS: Record<string, { title: string; sections: { title: string; items: string[] }[] }> = {
  'Avaliação': {
    title: 'Avaliação Inicial e Probabilidade',
    sections: [
      {
        title: 'Estabilidade Hemodinâmica',
        items: [
          'PAS < 90 mmHg ou queda > 40 mmHg por > 15 min?',
          'Sinais de choque obstrutivo (hipoperfusão)?',
          'Necessidade de vasopressores?'
        ]
      },
      {
        title: 'Escore de Wells (TEP)',
        items: [
          'Sinais Clínicos de TVP (3 pts)',
          'TEP como diagnóstico principal (3 pts)',
          'Frequência Cardíaca > 100 bpm (1.5 pts)',
          'Imobilização/Cirurgia < 4 sem (1.5 pts)',
          'TVP/TEP prévio (1.5 pts)',
          'Hemoptise (1 pt)',
          'Malignidade ativa (1 pt)'
        ]
      }
    ]
  },
  'Diagnóstico': {
    title: 'Confirmação Diagnóstica',
    sections: [
      {
        title: 'Baixa/Intermediária Probabilidade',
        items: [
          'Solicitar D-Dímero',
          'Se D-Dímero normal: Excluir TEP',
          'Se D-Dímero elevado: Angio-TC'
        ]
      },
      {
        title: 'Alta Probabilidade',
        items: [
          'Pular D-Dímero',
          'Solicitar Angio-TC de Tórax imediatamente',
          'Considerar Heparina antes do exame se não houver contraindicação'
        ]
      }
    ]
  },
  'Estratificação': {
    title: 'Gravidade e Risco (PESI)',
    sections: [
      {
        title: 'Marcadores de Disfunção VD',
        items: [
          'Ecocardiograma: Dilatação de VD',
          'Angio-TC: Relação VD/VE > 1.0',
          'BNP ou Pro-BNP elevados'
        ]
      },
      {
        title: 'Marcadores de Lesão Miocárdica',
        items: [
          'Troponina I ou T elevadas'
        ]
      }
    ]
  },
  'Tratamento': {
    title: 'Conduta Terapêutica',
    sections: [
      {
        title: 'Instabilidade (Alto Risco)',
        items: [
          'Trombolise Sistêmica (Alteplase 100mg IV em 2h)',
          'Suporte ventilatório e hemodinâmico',
          'Transferência para UTI'
        ]
      },
      {
        title: 'Estabilidade (Baixo/Interm Risco)',
        items: [
          'Anticoagulação (HBPM, Fondaparinux ou DOACs)',
          'Avaliar alta precoce se PESI simplificado = 0'
        ]
      }
    ]
  }
};

const TEPProtocolContent = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) => {
  const [wells, setWells] = useState({
    tvp: false,
    alternative: false,
    hr: false,
    immobility: false,
    previous: false,
    hemoptysis: false,
    cancer: false
  });

  const wellsScore = useMemo(() => {
    let score = 0;
    if (wells.tvp) score += 3;
    if (wells.alternative) score += 3;
    if (wells.hr) score += 1.5;
    if (wells.immobility) score += 1.5;
    if (wells.previous) score += 1.5;
    if (wells.hemoptysis) score += 1;
    if (wells.cancer) score += 1;
    return score;
  }, [wells]);

  const wellsResult = useMemo(() => {
    if (wellsScore <= 4) return { label: 'TEP Improvável', color: 'bg-emerald-500', action: 'Solicitar D-Dímero' };
    return { label: 'TEP Provável', color: 'bg-rose-500', action: 'Direto para Angio-TC' };
  }, [wellsScore]);

  if (activeTab === 'TEP-Interativo' || activeTab === 'TEP-Escores') {
    return (
      <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[40px] border border-rose-100 p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <Calculator className="w-8 h-8 text-rose-500" />
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic">Calculadora Wells para TEP</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Probabilidade Pré-teste Clínica</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'tvp', label: 'Sinais clínicos de TVP', points: 3 },
              { id: 'alternative', label: 'Diagnóstico alternativo menos provável que TEP', points: 3, description: 'A causa dos sintomas é mais provavelmente TEP do que qualquer outra coisa? Se o médico está clinicamente convencido, marque este item.' },
              { id: 'hr', label: 'FC > 100 bpm', points: 1.5 },
              { id: 'immobility', label: 'Imobilização/Cirurgia < 4 sem', points: 1.5 },
              { id: 'previous', label: 'Antecedente TVP/TEP', points: 1.5 },
              { id: 'hemoptysis', label: 'Hemoptise', points: 1 },
              { id: 'cancer', label: 'Tratamento Câncer (últ. 6 meses)', points: 1 },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setWells(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof wells] }))}
                className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${wells[item.id as keyof typeof wells] ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-rose-200'}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                   <p className="text-[13px] font-bold">{item.label}</p>
                   {wells[item.id as keyof typeof wells] && <CheckCircle className="w-5 h-5 text-white" />}
                </div>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${wells[item.id as keyof typeof wells] ? 'text-rose-100' : 'text-slate-400'}`}>+{item.points} pts</p>
                {item.id === 'alternative' && (
                  <div className={`text-[10px] p-2 rounded-lg leading-tight ${wells.alternative ? 'bg-white/10 text-rose-50' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    <strong>🧠 DICA:</strong> É o item com maior peso (3 pts). Reflete a convicção clínica do médico de que TEP é o diagnóstico principal após considerar diferenciais.
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-10 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-1">Escore Final Wells</p>
                <div className="text-6xl font-black text-rose-500 leading-none">{wellsScore}</div>
             </div>
             
             <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                <div className={`flex-1 p-6 rounded-3xl border-2 shadow-inner text-center ${wellsResult.color === 'bg-rose-500' ? 'border-rose-200 bg-rose-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
                   <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${wellsResult.color === 'bg-rose-500' ? 'text-rose-600' : 'text-emerald-600'}`}>Classificação</p>
                   <p className={`text-2xl font-black uppercase italic ${wellsResult.color === 'bg-rose-500' ? 'text-rose-600' : 'text-emerald-600'}`}>{wellsResult.label}</p>
                </div>
                <div className="flex-1 p-6 rounded-3xl bg-slate-900 text-white text-center flex flex-col justify-center gap-1 shadow-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conduta Sugerida</p>
                   <p className="text-sm font-black uppercase tracking-tight text-rose-400">{wellsResult.action}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'TEP-Tratamento') {
    return (
      <div className="p-10 max-w-5xl mx-auto space-y-12">
        <div className="bg-slate-900 p-12 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full -mr-20 -mt-20" />
           <div className="relative z-10 space-y-6">
              <div className="inline-flex gap-2 items-center px-4 py-1.5 bg-rose-500/20 border border-rose-500/30 rounded-xl">
                 <ShieldCheck className="w-4 h-4 text-rose-400" />
                 <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Consenso ESC 2024</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter uppercase italic">Diretrizes de Manejo Hemodinâmico</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                 Protocolo unificado para estabilização, trombólise e suporte circulatório em TEP de alto risco.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[40px] border border-slate-100 space-y-8 shadow-sm">
              <h3 className="text-rose-500 font-bold text-lg italic uppercase flex items-center gap-3">
                 <div className="w-2 h-8 bg-rose-500 rounded-full" />
                 Trombólise Sistêmica
              </h3>
              <div className="space-y-6">
                 <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                    <p className="text-xs font-black text-rose-600 uppercase mb-2">Dose Recomendada (Alteplase)</p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                       100 mg IV infundidos em 2 horas. Alternativa se choque extremo: 0.6 mg/kg em 15 min (máx 50mg).
                    </p>
                 </div>
                 <ul className="space-y-4">
                    {[
                      'Indicada para Instabilidade Hemodinâmica (PAS < 90)',
                      'Monitorar sinais de sangramento maior',
                      'Parar heparina durante infusão de rTPA',
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 items-start text-sm text-slate-500 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[40px] border border-slate-100 space-y-8 shadow-sm">
              <h3 className="text-slate-800 font-bold text-lg italic uppercase flex items-center gap-3">
                 <div className="w-2 h-8 bg-slate-200 rounded-full" />
                 Contraindicações Absolutas
              </h3>
              <div className="space-y-2">
                 {[
                   'AVC Hemorrágico em qualquer momento',
                   'AVC Isquêmico nos últimos 6 meses',
                   'Neoplasia de Sistema Nervoso Central',
                   'Trauma Major ou Cirurgia nos últimos 3 sem',
                   'Sangramento Ativo (exceto menstruação)',
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-rose-100 transition-all">
                      <X className="w-5 h-5 text-rose-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="flex flex-col items-center justify-center space-y-6 text-center py-20">
         <div className="w-20 h-20 bg-rose-500/10 rounded-[32px] flex items-center justify-center animate-pulse">
            <Activity className="w-10 h-10 text-rose-500" />
         </div>
         <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Conteúdo em Preparação</h2>
         <p className="text-slate-400 max-w-md font-medium text-lg">As diretrizes gráficas de {activeTab} estão sendo integradas pelo sistema.</p>
         <button onClick={() => setActiveTab('Interativo')} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200">Voltar ao Workflow</button>
      </div>
    </div>
  );
};

interface SepseRecord {
  newsScore: number;
  sofaScore: number;
  weight: string;
  focus: string;
  antibiotic: string;
  volumeCalculated: number;
  lactatoInicial: string;
  lactatoControle: string;
  pamInicial: string;
  noradrenalinaDose: string;
  hidrocortisonaFeito: boolean;
  vasopressinaFeito: boolean;
  notes: string;
}

const REGIMENS = {
  urinario: {
    foco: 'Urinário / Pielonefrite',
    primeiraLinha: 'Ceftriaxona 2g IV de 24/24h',
    alternativa: 'Ciprofloxacina 400mg IV de 12/12h',
    dica: 'Se sepse grave com risco de germe multirresistente (ESBL), considerar Piperacilina/Tazobactam 4.5g IV de 6/6h.'
  },
  pulmonar: {
    foco: 'Pulmonar / Pneumonia Grave',
    primeiraLinha: 'Ceftriaxona 2g IV de 24/24h + Azitromicina 500mg IV de 24/24h',
    alternativa: 'Levofloxacina 750mg IV de 24/24h',
    dica: 'Considere cobertura para MRSA se intubado ou colonização prévia.'
  },
  abdominal: {
    foco: 'Abdominal / Peritonite, Apendicite',
    primeiraLinha: 'Piperacilina/Tazobactam 4.5g IV de 6/6h OU Ceftriaxona 2g IV + Metronidazol 500mg IV de 8/8h',
    alternativa: 'Ciprofloxacina 400mg IV + Metronidazol 500mg IV',
    dica: 'Sempre requer controle do foco cirúrgico em caráter de urgência.'
  },
  snc: {
    foco: 'Sistema Nervoso Central / Meningite',
    primeiraLinha: 'Ceftriaxona 2g IV de 12/12h + Ampicilina 2g IV de 4/4h (se >50 anos ou imunocomprometido)',
    alternativa: 'Meropenem 2g IV de 8/8h',
    dica: 'Adicione Dexametasona 10mg IV antes ou junto com a primeira dose de antibiótico.'
  },
  cutaneo: {
    foco: 'Cutâneo / Partes Moles / Celulite, Erisipela',
    primeiraLinha: 'Oxacilina 2g IV de 4/4h + Clindamicina 600mg IV de 8/8h OU Ceftriaxona 2g',
    alternativa: 'Vancomicina 15-20mg/kg de 12/12h',
    dica: 'Se risco de fasceíte necrotizante, encaminhar cirurgia de emergência e prescrever Piperacilina/Tazobactam + Clindamicina de imediato.'
  },
  desconhecido: {
    foco: 'Foco Desconhecido ou Indeterminado',
    primeiraLinha: 'Piperacilina/Tazobactam 4.5g IV de 6/6h OU Meropenem 1g IV de 8/8h (se choque)',
    alternativa: 'Ceftriaxona 2g IV + Metronidazol 500mg IV de 8/8h',
    dica: 'Investigar ativamente com exames de imagem e reavaliar culturas em 48-72h.'
  }
};

const SepseProtocolContent = ({ 
  activeTab, 
  setActiveTab, 
  patientName, 
  examDate 
}: { 
  activeTab: string; 
  setActiveTab: (t: string) => void;
  patientName: string;
  examDate: string;
}) => {
  const [isSepseConfigOpen, setIsSepseConfigOpen] = useState(false);

  // Dynamic Sepsis States similar to SepseFichaModule
  const [config, setConfig] = useState<ConfigDict>(INITIAL_CONFIG);
  const [checklists, setChecklists] = useState(INITIAL_CHECKLISTS);
  const [sectionOrder, setSectionOrder] = useState<string[]>(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
  const [logos, setLogos] = useState<{ [key: string]: string | null }>({ '1': null, '2': null, '3': null });
  const [password, setPassword] = useState('HMM@2026');

  // Load from local storage dynamically on mount and every tab change
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('hmm_sepse_v2_cfg');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } else {
        setConfig(INITIAL_CONFIG);
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis config:", e);
    }

    try {
      const savedChecks = localStorage.getItem('hmm_sepse_v4_chk');
      if (savedChecks) {
        const parsed = JSON.parse(savedChecks);
        setChecklists({
          pacote: parsed?.pacote || INITIAL_CHECKLISTS.pacote,
          cuidados: parsed?.cuidados || INITIAL_CHECKLISTS.cuidados
        });
      } else {
        setChecklists(INITIAL_CHECKLISTS);
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis checklists:", e);
    }

    try {
      const savedOrder = localStorage.getItem('hmm_sepse_v3_secorder');
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length >= 7) {
          setSectionOrder(parsed);
        } else {
          setSectionOrder(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
        }
      } else {
        setSectionOrder(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis section order:", e);
      setSectionOrder(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
    }

    try {
      const savedLogos = localStorage.getItem('hmm_sepse_pop_logos');
      if (savedLogos) {
        setLogos(JSON.parse(savedLogos));
      } else {
        setLogos({ '1': null, '2': null, '3': null });
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis POP logos:", e);
    }

    const savedPassword = localStorage.getItem('hmm_sepse_v2_senha');
    if (savedPassword) {
      setPassword(savedPassword);
    } else {
      setPassword('HMM@2026');
    }
  }, [activeTab]);

  const handleSaveConfig = (
    newConfig: ConfigDict,
    newChecklists: { pacote: CheckItem[]; cuidados: CheckItem[] },
    newSectionOrder: string[],
    newLogos: { [key: string]: string | null },
    newPassword?: string
  ) => {
    setConfig(newConfig);
    setChecklists(newChecklists);
    setSectionOrder(newSectionOrder);
    setLogos(newLogos);
    
    localStorage.setItem('hmm_sepse_v2_cfg', JSON.stringify(newConfig));
    localStorage.setItem('hmm_sepse_v4_chk', JSON.stringify(newChecklists));
    localStorage.setItem('hmm_sepse_v3_secorder', JSON.stringify(newSectionOrder));
    localStorage.setItem('hmm_sepse_pop_logos', JSON.stringify(newLogos));
    
    if (newPassword) {
      setPassword(newPassword);
      localStorage.setItem('hmm_sepse_v2_senha', newPassword);
    }
    setIsSepseConfigOpen(false);
  };

  // NEWS Score State
  const [news, setNews] = useState({
    respRate: 0,
    oxygen: 0,
    supplementalOxygen: 0,
    bp: 0,
    heartRate: 0,
    mentalStatus: 0,
    temp: 0
  });

  const newsScore = useMemo(() => {
    return news.respRate + news.oxygen + news.supplementalOxygen + news.bp + news.heartRate + news.mentalStatus + news.temp;
  }, [news]);

  // SOFA Score State
  const [sofa, setSofa] = useState({
    resp: 0,
    coag: 0,
    liver: 0,
    cardio: 0,
    cns: 0,
    renal: 0
  });

  const sofaScore = useMemo(() => {
    return sofa.resp + sofa.coag + sofa.liver + sofa.cardio + sofa.cns + sofa.renal;
  }, [sofa]);

  // Clinical Record details
  const [weight, setWeight] = useState('70');
  const [selectedFocus, setSelectedFocus] = useState<keyof typeof REGIMENS>('desconhecido');
  const [lactatoInicial, setLactatoInicial] = useState('');
  const [lactatoControle, setLactatoControle] = useState('');
  const [pamInicial, setPamInicial] = useState('');
  const [noradrenalinaDose, setNoradrenalinaDose] = useState('');
  const [hidrocortisonaFeito, setHidrocortisonaFeito] = useState(false);
  const [vasopressinaFeito, setVasopressinaFeito] = useState(false);
  const [notes, setNotes] = useState('');
  const [codigoSepseActivated, setCodigoSepseActivated] = useState(false);
  const [expandedFlow, setExpandedFlow] = useState<string | null>(null);
  const [expandedInner, setExpandedInner] = useState<string | null>(null);

  
  const paramIdToStateKeyNews: Record<string, keyof typeof news> = { fr: 'respRate', sup: 'supplementalOxygen', o2: 'oxygen', temp: 'temp', pas: 'bp', fc: 'heartRate', nc: 'mentalStatus' };
  const paramIdToStateKeySofa: Record<string, keyof typeof sofa> = { resp: 'resp', plaq: 'coag', bili: 'liver', cv: 'cardio', glas: 'cns', ren: 'renal' };

  const volumeCalculated = useMemo(() => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return 0;
    return Math.round(w * 30);
  }, [weight]);

  const generateSepsePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Blue Sepsis SSC Header
    doc.setFillColor(30, 58, 138); // Navy blue
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('HOSPITAL MUNICIPAL DE MORRINHOS - GO', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(14);
    doc.text('PROTOCOLO INTERATIVO DE SEPSE (SSC 2026)', pageWidth / 2, 28, { align: 'center' });

    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`PACIENTE: ${patientName.toUpperCase() || 'NÃO INFORMADO'}`, 20, 55);
    doc.text(`DATA/HORA: ${examDate.replace('T', ' ')}`, 20, 62);
    doc.line(20, 67, pageWidth - 20, 67);

    let y = 75;
    const addSectionHeader = (title: string) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(title, 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
    };

    const addField = (label: string, value: any) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value || '---'}`, 80, y);
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    };

    // 1. Escalas De Risco
    addSectionHeader('1. ESCALAS DE ESTRATIFICAÇÃO CLÍNICA');
    addField('Escore de NEWS Calculado', `${newsScore} PONTOS (${newsScore >= 4 ? 'Alto Risco para Sepse' : 'Baixo Risco'})`);
    addField('Escore de SOFA Calculado', `${sofaScore} PONTOS (Disfunção Orgânica ${sofaScore >= 2 ? 'CONFIRMADA' : 'INICIAL'})`);
    addField('Código Sepse Ativado na Entrada', codigoSepseActivated ? 'SIM' : 'NÃO');
    y += 5;

    // 2. Medidas de Ressuscitação
    addSectionHeader('2. MEDIDAS TERAPÊUTICAS IMEDIATAS (1h / 3h)');
    addField('Peso do Paciente para Volume', `${weight} kg`);
    addField('Expansão Volêmica (30 mL/kg)', `${volumeCalculated} mL de Ringer Lactato`);
    addField('Foco de Infecção Suspeito', REGIMENS[selectedFocus].foco);
    addField('Esquema Antibiótico Sugerido', REGIMENS[selectedFocus].primeiraLinha);
    addField('Coleta de Exames Realizada', 'Lactato arterial/venoso, 2 pares Hemoculturas');
    y += 5;

    // 3. Status Hemodinâmico
    addSectionHeader('3. STATUS HEMODINÂMICO & CHOQUE SÉPTICO');
    addField('PAM de Entrada', pamInicial ? `${pamInicial} mmHg` : 'Não informada');
    addField('Lactato de Entrada', lactatoInicial ? `${lactatoInicial} mmol/L` : 'Não informado');
    addField('Lactato de Controle', lactatoControle ? `${lactatoControle} mmol/L` : 'Não coletado ainda');
    addField('Infusão de Noradrenalina', noradrenalinaDose ? `Iniciada (${noradrenalinaDose} mcg/kg/min)` : 'Não iniciada');
    addField('Corticoide (Hidrocortisona)', hidrocortisonaFeito ? 'PRESCRITA (Hidrocortisona 200mg/dia)' : 'NÃO APLICADA');
    addField('Associado Vasopressina', vasopressinaFeito ? 'SIM (se Noradrenalina > 0.25 a 0.5 mcg/kg/min)' : 'NÃO APLICADA');
    y += 5;

    if (notes) {
      addSectionHeader('4. NOTAS E OBSERVAÇÕES CLÍNICAS');
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
      doc.text(splitNotes, 20, y);
      y += splitNotes.length * 6;
    }

    // Signatures
    y = Math.max(y + 15, 250);
    doc.line(40, y, 90, y);
    doc.line(pageWidth - 90, y, pageWidth - 40, y);
    y += 5;
    doc.setFontSize(9);
    doc.text('Assinatura do Médico Avaliador', 65, y, { align: 'center' });
    doc.text('Dr. Ivaldo Inácio Silva Jr - Diretor Técnico', pageWidth - 65, y, { align: 'center' });

    doc.save(`protocolo_sepse_${patientName.replace(/\s+/g, '_') || 'paciente'}.pdf`);
  };

  // Switch to corresponding tab helper
  const handleFlowchartNodeClick = (node: string) => {
    setActiveTab('Sepse-Fluxo');
  };

  const [activeAnexoId, setActiveAnexoId] = useState<number | null>(null);
  const [isGestor, setIsGestor] = useState(false);
  const [customAnexos, setCustomAnexos] = useState<Record<number, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('custom_sepse_anexos');
    if (saved) {
      try {
        setCustomAnexos(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleFileUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const updated = { ...customAnexos, [id]: content };
      setCustomAnexos(updated);
      localStorage.setItem('custom_sepse_anexos', JSON.stringify(updated));
    };
    reader.readAsDataURL(file); // Store as Data URL to support inline iframe src and direct download
  };

  const handleRemoveFile = (id: number) => {
    const updated = { ...customAnexos };
    delete updated[id];
    setCustomAnexos(updated);
    localStorage.setItem('custom_sepse_anexos', JSON.stringify(updated));
  };

  // Render Sepsis Tabs
  if (activeTab === 'Sepse-Ficha') {
    return <SepseFichaModule />;
  }

  if (activeTab === 'Sepse-Fluxo') {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-2 text-[10px] text-[#1e3a8a] opacity-60">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3" />
          <span>Diretrizes Assistenciais</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600 font-bold">Manejo da Sepse no Adulto</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2 leading-tight">
              {config['fluxo.header.titulo'] || 'Manejo da Sepse no Adulto'}
              <Activity className="text-emerald-600 w-6 h-6 animate-pulse" />
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-[#10b981] p-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-slate-600">Você está em: <span className="font-bold text-slate-800">{config['fluxo.header.subtitulo'] || 'Pronto Socorro - Triagem Inicial'}</span></span>
            </div>
          </div>

          <button 
            onClick={() => {
              setCodigoSepseActivated(prev => !prev);
              if (!codigoSepseActivated) {
                const message = config['fluxo.alert.texto'] || '🚨 PROTOCOLO DE SEPSE ATIVADO!\n- Solicitar Coleta de Hemoculturas (2 sítios periféricos distintos) e Lactato de imediato.\n- Iniciar Antibioticoterapia empírica direcionada na primeira hora de atendimento.';
                alert(message.replace(/\\n/g, '\n'));
              }
            }}
            className={`px-8 py-4 rounded-xl font-black text-sm shadow-xl flex items-center gap-3 transition-all ${
              codigoSepseActivated 
                ? 'bg-emerald-600 text-white shadow-emerald-200 animate-pulse' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            {codigoSepseActivated 
              ? (config['fluxo.btn.ativo'] || 'PROTOCOLO SEPSE ATIVO 🟢') 
              : (config['fluxo.btn.ativar'] || 'ATIVAR PROTOCOLO SEPSE 🔴')}
          </button>
        </div>

                {/* Dynamic Warning Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div 
            className={`p-6 rounded-[24px] border-2 transition-all ${newsScore >= 4 ? 'bg-amber-500/10 border-amber-400' : 'bg-slate-50 border-slate-200'}`}
          >
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escore de NEWS</h4>
            <p className={`text-4xl font-extrabold leading-none mb-2 ${newsScore >= 4 ? 'text-amber-600' : 'text-slate-850'}`}>{newsScore} pontos</p>
            <p className="text-xs font-semibold text-slate-500">
              {newsScore >= 4 
                ? '⚠️ CRITÉRIO ALCANÇADO: Alto risco para sepse (NEWS ≥ 4). Prossiga imediatamente para o cálculo do SOFA.' 
                : 'Paciente de baixo risco na triagem. Reavaliar a cada alteração clínica.'}
            </p>
          </div>
          
          <div 
            className={`p-6 rounded-[24px] border-2 transition-all ${sofaScore >= 2 ? 'bg-red-500/10 border-red-300' : 'bg-slate-50 border-slate-200'}`}
          >
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escore de SOFA</h4>
            <p className={`text-4xl font-extrabold leading-none mb-2 ${sofaScore >= 2 ? 'text-red-600' : 'text-slate-850'}`}>{sofaScore} pontos</p>
            <p className="text-xs font-semibold text-slate-500">
              {sofaScore >= 2 
                ? '🔴 DISFUNÇÃO ORGÂNICA (SOFA ≥ 2): Critério patognomônico de SEPSE alcançado. Iniciar pacotes terapêuticos de imediato.' 
                : 'Nenhuma disfunção orgânica grave detectada ainda. Monitore e colha novos exames caso persista suspeita.'}
            </p>
          </div>
        </div>

        {/* Interactive Diagram Canvas */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
            <Activity className="w-96 h-96 text-slate-900" />
          </div>

          <h3 className="text-center text-slate-400 font-black uppercase text-[11px] tracking-widest">Algoritmo Geral de Decisão Clínica</h3>
          
          <div className="flex flex-col items-center">
            {/* 1. Paciente com Foco */}
            <div className="flex flex-col items-center w-full max-w-xl">
              <div className="bg-slate-900 text-white rounded-2xl py-4 px-6 w-full text-center font-bold text-xs border-l-4 border-emerald-500 shadow-md uppercase">
                {config['fluxo.node.inicio'] || 'PACIENTE COM FOCO DE INFECÇÃO SIGNIFICATIVO'}
              </div>
              <div className="w-[3px] h-8 bg-slate-200" />
            </div>

            {/* 2. NEWS Diamond Card */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-4xl relative">
              <div className="flex-1 flex flex-col items-center">
                <div 
                  onClick={() => setExpandedFlow(prev => prev === 'news_top' ? null : 'news_top')}
                  className={`cursor-pointer p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md ${
                    newsScore >= 4 
                      ? 'bg-amber-500 border-amber-400 text-white' 
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  <p className="text-[9px] uppercase font-bold opacity-80">Estratificação Inicial</p>
                  <h4 className="text-sm font-black mt-0.5">{config['fluxo.node.news'] || 'Escore de NEWS ≥ 4?'}</h4>
                  <p className="text-[10px] mt-1 font-bold tracking-widest bg-black/15 py-1 px-3.5 rounded-full inline-block">
                    PONTOS: {newsScore}
                  </p>
                </div>
                
                {/* Embedded NEWS calc in flowchart */}
                <div className="w-full mt-4 absolute top-full left-1/2 -translate-x-1/2 z-50 drop-shadow-2xl">
                  {expandedFlow === 'news_top' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden mt-2"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase">Pontuação NEWS</p>
                    <p className="text-3xl font-black text-amber-500">{newsScore} <span className="text-sm font-bold text-slate-400">pontos</span></p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-center font-bold text-xs uppercase shadow-sm ${newsScore >= 4 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    {newsScore >= 4 ? 'Alto Risco (≥ 4)' : 'Baixo Risco'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {NEWS_RAW_GRID_PARAMETERS.map((param, index) => {
                    const isExpanded = expandedInner === `news-${param.id}`;
                    const stateKey = paramIdToStateKeyNews[param.id];
                    const selectedVal = stateKey ? news[stateKey] : null;

                    return (
                      <div key={param.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-amber-500 shadow' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div 
                          onClick={() => setExpandedInner(isExpanded ? null : `news-${param.id}`)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-sm ${selectedVal !== null && selectedVal > 0 ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-850">{config[param.titleKey] || param.titleKey}</h4>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{config[param.subKey] || param.subKey}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedVal !== null && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border">
                                Pontos: +{selectedVal}
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 text-[10px] space-y-1">
                              <span className="block text-[8px] font-black tracking-widest text-[#185fa5] uppercase">COMO AVALIAR:</span>
                              <p className="font-bold leading-relaxed">{config[param.howToKey] || param.howToKey}</p>
                            </div>
                            {param.attentionKey && config[param.attentionKey] && (
                              <div className="p-3.5 bg-amber-50/40 border border-amber-200/50 rounded-xl text-amber-900 text-[10px] space-y-1">
                                <span className="block text-[8px] font-black tracking-widest text-amber-800 uppercase flex items-center gap-1">⚠ Atenção clínica</span>
                                <p className="font-bold leading-relaxed">{config[param.attentionKey]}</p>
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Selecione o valor correspondente:</span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {param.options.map((opt, oIdx) => {
                                  const isActive = selectedVal === opt.score;
                                  return (
                                    <button 
                                      key={oIdx}
                                      onClick={() => {
                                        if (stateKey) {
                                          setNews(prev => ({ ...prev, [stateKey]: opt.score }));
                                          setTimeout(() => setExpandedInner(null), 200);
                                        }
                                      }}
                                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${isActive ? 'bg-slate-800 border-slate-900 text-white font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded text-[10px] font-black flex items-center justify-center shadow-sm ${opt.scoreClass === 'c3' ? 'bg-red-500 text-white' : opt.scoreClass === 'c2' ? 'bg-orange-500 text-white' : opt.scoreClass === 'c1' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                                          {opt.score}
                                        </span>
                                        <span className="text-[11px] font-bold">{config[opt.labelKey] || opt.labelKey}</span>
                                      </div>
                                      {isActive && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
                </div>
              </div>

              {/* NEWS NO branch */}
              <div className="flex flex-col items-center md:absolute md:left-[66%]">
                <div className="flex items-center gap-2">
                  <div className="hidden md:block h-[2px] w-6 bg-slate-300" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">{config['fluxo.conn.nao'] || 'NÃO'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
                  <div className={`p-3.5 rounded-xl border text-center text-xs font-bold w-44 shadow-sm uppercase ${
                    newsScore < 4 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {config['fluxo.node.reavaliar'] || 'REAVALIAÇÕES CONSTANTES'}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[3px] h-8 bg-slate-200" />

            {/* 3. SOFA Diamond Card */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-4xl relative mt-16">
              <div className="flex-1 flex flex-col items-center">
                <div 
                  onClick={() => setExpandedFlow(prev => prev === 'sofa_top' ? null : 'sofa_top')}
                  className={`cursor-pointer p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md ${
                    sofaScore >= 2 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-600'
                  }`}
                >
                  <p className="text-[9px] uppercase font-bold opacity-80">Disfunção Progressiva</p>
                  <h4 className="text-sm font-black mt-0.5">{config['fluxo.node.sofa'] || 'Escore de SOFA ≥ 2?'}</h4>
                  <p className="text-[10px] mt-1 font-bold tracking-widest bg-black/15 py-1 px-3.5 rounded-full inline-block">
                    PONTOS: {sofaScore}
                  </p>
                </div>
                
                {/* Embedded SOFA calc in flowchart */}
                <div className="w-full mt-4 absolute top-full left-1/2 -translate-x-1/2 z-50 drop-shadow-2xl">
                  

          {expandedFlow === 'sofa_top' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden mt-2"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase">Pontuação SOFA</p>
                    <p className="text-3xl font-black text-emerald-600">{sofaScore} <span className="text-sm font-bold text-slate-400">pontos</span></p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-center font-bold text-xs uppercase shadow-sm ${sofaScore >= 2 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    {sofaScore >= 2 ? 'Disfunção Progressiva (≥ 2)' : 'Sem Disfunção'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {SOFA_RAW_GRID_PARAMETERS.map((param, index) => {
                    const isExpanded = expandedInner === `sofa-${param.id}`;
                    const stateKey = paramIdToStateKeySofa[param.id];
                    const selectedVal = stateKey ? sofa[stateKey] : null;

                    return (
                      <div key={param.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-emerald-500 shadow' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div 
                          onClick={() => setExpandedInner(isExpanded ? null : `sofa-${param.id}`)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-sm ${selectedVal !== null && selectedVal > 0 ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800">{config[param.titleKey] || param.titleKey}</h4>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{config[param.subKey] || param.subKey}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedVal !== null && (
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border">
                                Pontos: +{selectedVal}
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                            {param.howToKey && config[param.howToKey] && (
                              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 text-[10px] space-y-1">
                                <span className="block text-[8px] font-black tracking-widest text-[#185fa5] uppercase">COMO AVALIAR:</span>
                                <p className="font-bold leading-relaxed whitespace-pre-wrap">{config[param.howToKey]}</p>
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Selecione o valor correspondente:</span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {param.options.map((opt, oIdx) => {
                                  const isActive = selectedVal === opt.score;
                                  return (
                                    <button 
                                      key={oIdx}
                                      onClick={() => {
                                        if (stateKey) {
                                          setSofa(prev => ({ ...prev, [stateKey]: opt.score }));
                                          setTimeout(() => setExpandedInner(null), 200);
                                        }
                                      }}
                                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${isActive ? 'bg-slate-800 border-slate-900 text-white font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded text-[10px] font-black flex items-center justify-center shadow-sm ${opt.scoreClass === 'c3' || opt.scoreClass === 'c4' ? 'bg-red-500 text-white' : opt.scoreClass === 'c2' ? 'bg-orange-500 text-white' : opt.scoreClass === 'c1' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                                          {opt.score}
                                        </span>
                                        <span className="text-[11px] font-bold whitespace-pre-wrap">{config[opt.labelKey] || opt.labelKey}</span>
                                      </div>
                                      {isActive && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
                </div>
              </div>

              {/* SOFA NO branch */}
              <div className="flex flex-col items-center md:absolute md:left-[66%]">
                <div className="flex items-center gap-2">
                  <div className="hidden md:block h-[2px] w-6 bg-slate-300" />
                  <span className="text-[9px] font-black text-slate-400 uppercase">{config['fluxo.conn.nao'] || 'NÃO'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
                  <div className={`p-3.5 rounded-xl border text-center text-xs font-bold w-44 shadow-sm uppercase ${
                    sofaScore < 2 
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    {config['fluxo.node.reavaliar'] || 'REAVALIAÇÕES CONSTANTES'}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[3px] h-8 bg-slate-200" />

            {/* 4. Sepsis Status */}
            <button 
              onClick={() => setActiveTab('Sepse-Ficha')}
              className={`font-black text-lg tracking-wider py-5 px-16 rounded-[24px] shadow-lg flex items-center gap-3 transition-all ${
                newsScore >= 4 && sofaScore >= 2
                  ? 'bg-red-650 text-white bg-red-600 shadow-red-200 animate-pulse scale-102 hover:scale-105'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!(newsScore >= 4 && sofaScore >= 2)}
            >
              <ShieldAlert className="w-6 h-6 shrink-0" />
              {config['fluxo.node.sepse'] || 'SEPSE DETERMINADA ⚠️'}
            </button>

            {/* 5. The 5 Bundles */}
            <div className="w-full h-px bg-slate-100 my-8" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              {[
                { 
                  title: config['fluxo.b1.titulo'] || 'COLETA DE EXAMES', 
                  desc: config['fluxo.b1.desc'] || 'Hemoculturas (2 pares de sítios distintos), Lactato, hemograma, Bilirrubinas, creatinina e gasometria arterial.', 
                  icon: <FileText className="w-5 h-5 text-emerald-600" />, 
                  actionLabel: config['fluxo.b1.btn'] || '? Ver Tabela 3', 
                  action: null
                },
                { 
                  title: config['fluxo.b2.titulo'] || 'MONITORIZAÇÃO COMPLETA', 
                  desc: config['fluxo.b2.desc'] || 'Acompanhar sinais vitais constantemente, obter monitorização de ritmo, oximetria contínua e débito urinário por hora.', 
                  icon: <Activity className="w-5 h-5 text-indigo-600" /> 
                },
                { 
                  title: config['fluxo.b3.titulo'] || 'ESTABILIZAÇÃO CLÍNICA', 
                  desc: config['fluxo.b3.desc'] || 'Proteção e patência de via aérea, oxigenação adequada (Alvo SatO₂ ≥ 94%) e cabeceira mantida a 30°.', 
                  icon: <Stethoscope className="w-5 h-5 text-[#1e3a8a]" /> 
                },
                { 
                  title: config['fluxo.b4.titulo'] || 'DOIS ACESSOS CALIBROSOS', 
                  desc: config['fluxo.b4.desc'] || 'Obtenção emergencial de pelo menos dois acessos venosos periféricos de grosso calibre para infusões de fluxo.', 
                  icon: <ShieldCheck className="w-5 h-5 text-amber-500" /> 
                },
                { 
                  title: config['fluxo.b5.titulo'] || 'ANTIBIÓTICO PRECOCE', 
                  desc: config['fluxo.b5.desc'] || 'Iniciar antibioticoterapia empírica direcionada de amplo espectro na primeira hora (tolerância de até 3h se baixa suspeita).', 
                  icon: <HeartPulse className="w-5 h-5 text-rose-500" />, 
                  actionLabel: config['fluxo.b5.btn'] || '? Guia Antibióticos', 
                  action: null 
                },
              ].map((item, i) => (
                <div 
                  key={i} 
                  onClick={item.action}
                  className={`bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm flex flex-col justify-between text-center gap-3 transition-all group ${item.action ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : 'hover:border-[#1e3a8a]/20'}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-slate-100">
                      {item.icon}
                    </div>
                    <h4 className="text-xs font-black text-slate-800 leading-tight block uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  {item.actionLabel && (
                    <button 
                      onClick={item.action} 
                      className="mt-2 text-[9px] bg-slate-900 text-white rounded-lg py-1.5 px-3 font-bold uppercase tracking-wider hover:bg-slate-800"
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* EXPANDED FLOW BRANCHES */}
            <div className="flex flex-col gap-4">
              {true && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="w-full flex flex-col items-center overflow-hidden"
                >
                  <div className="w-[3px] h-8 bg-emerald-500/30" />
                  <div className="bg-white border-2 border-emerald-500/30 rounded-[28px] overflow-hidden shadow-xl max-w-2xl w-full">
                    <div className="p-4 border-b flex justify-between items-center bg-emerald-600/10 text-emerald-950">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-tight">Tabela 3 - Coleta de Exames Obrigatórios</h3>
                        <p className="text-[10px] text-emerald-800/80 uppercase font-bold tracking-wider">Diretrizes Práticas para Prontidão de Emergência</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-700 font-extrabold uppercase">
                            <th className="p-3">Exame Requerido</th>
                            <th className="p-3">Estratégias / Descrições</th>
                            <th className="p-3">Tempo Meta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                          <tr>
                            <td className="p-3 font-black text-slate-900">Hemoculturas (2 pares)</td>
                            <td className="p-3">Coleta em dois acessos periféricos limpos distintos (não usar cateteres velhos).</td>
                            <td className="p-3 text-red-600 font-bold bg-red-50/30">Antes da primeira dose (Na 1h)</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-black text-slate-900">Lactato Sérico Inicial</td>
                            <td className="p-3">Lactato inicial na entrada é o maior balizador de perfusão oculta do shock.</td>
                            <td className="p-3">Coleta de imediato</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-black text-slate-900">Hemograma / Plaquetas</td>
                            <td className="p-3">Contagem de plaquetas é fundamental para faturamento do critério SOFA.</td>
                            <td className="p-3">Triagem</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {true && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="w-full flex flex-col items-center overflow-hidden"
                >
                  <div className="w-[3px] h-8 bg-rose-500/30" />
                  <div className="bg-white border-2 border-rose-500/30 rounded-[28px] overflow-hidden shadow-xl max-w-4xl w-full">
                    <div className="p-4 border-b flex items-center bg-rose-600/10 text-rose-950">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-tight">Guia Rápido de Antimicrobianos Empíricos</h3>
                        <p className="text-[10px] text-rose-800/80 uppercase font-bold tracking-wider">Ajuste conforme cultura após 48-72h</p>
                      </div>
                    </div>
                    <div className="p-4 overflow-x-auto w-full">
                          <table className="w-full text-left border-collapse text-[10px] sm:text-[11px] min-w-[800px] table-fixed">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b-2 border-slate-200">
                                <th className="p-3 w-32">Foco Clínico</th>
                                <th className="p-3 w-40">Antibioticoterapia Recomendada</th>
                                <th className="p-3 w-32">Diluição</th>
                                <th className="p-3 w-16 text-center">Via</th>
                                <th className="p-3 w-20 text-center">Frequência</th>
                                <th className="p-3 w-24 text-center">Tempo de Infusão</th>
                                <th className="p-3">Associações e Recomendações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Pulmonar</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">6/6H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">+ MACROLÍDEO (ex: Azitromicina) 500mg (01 CP) VO 1X ao dia por 5 dias.</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Abdominal</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">6/6H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">-</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Urinário</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">6/6H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">-</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Meningite</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Ceftriaxona 2g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">12/12H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">Suspeita de Listeria (criança, idoso, gestante, imunocomprometidos):{"\n"}Associar: Ampicilina 2g + 100mL SF 0,9% (EV 4/4H em 1h).</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Cutâneo</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Ceftriaxona 2g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">24/24H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">Associar: Oxacilina 2g + 100mL SF 0,9%{"\n"}(EV 4/4H em 1h){"\n"}--- OU ---{"\n"}Clindamicina 600mg + 100mL SF 0,9%{"\n"}(EV 6/6H em 1h)</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Corrente sanguínea</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">6/6H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">[REMOVER DISPOSITIVOS SUSPEITOS]{"\n"}Associar: Vancomicina 15–20mg/kg + 100mL SF 0,9%{"\n"}(EV 12/12H em 1h)</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200 break-words">Sem foco evidente</td>
                                <td className="p-3 border-r border-slate-200 break-words"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                                <td className="p-3 border-r border-slate-200 break-words">100mL SF 0,9%</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">EV</td>
                                <td className="p-3 border-r border-slate-200 text-center font-bold">6/6H</td>
                                <td className="p-3 border-r border-slate-200 text-center">01 hora</td>
                                <td className="p-3 text-slate-500 whitespace-pre-line leading-relaxed">-</td>
                              </tr>
                            </tbody>
                          </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="w-[2px] h-8 bg-slate-200" />

            {/* 6. Volume Fluid Expansion */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-[24px] w-full max-w-3xl text-center shadow-inner flex flex-col gap-2 relative">
              <span className="text-[9px] uppercase font-black text-emerald-650 text-emerald-600 tracking-widest">Conduta de Ressuscitação Inicial</span>
              <h4 className="text-base font-black text-slate-800">EXPANSÃO VOLÊMICA DE RESGATE</h4>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed whitespace-pre-wrap">
                {config['fluxo.vol.desc'] || 'Recomendado realizar 30 mL por kg em no máximo 3 horas. Priorize sempre a total individualização do paciente de acordo com o contexto circulatório. Soro de escolha: Ringer Lactato (exceto se houver TCE concomitante).'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center items-center mt-3 pt-3 border-t border-slate-200/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{config['fluxo.vol.peso.lbl'] || 'Peso do Paciente:'}</span>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-16 p-1.5 text-center font-bold border border-slate-200 rounded-lg text-slate-800 text-xs bg-white"
                    placeholder="70"
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <span className="text-xs font-bold text-slate-400">kg</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-xs font-black text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  Total Indicado: {volumeCalculated} mL de Ringer Lactato
                </span>
              </div>
            </div>

            <div className="w-[2px] h-8 bg-slate-200" />

            {/* 7. Persistent Hypotension Evaluation Diagram */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl relative">
              <div className="flex-1 flex flex-col items-center">
                <button 
                  onClick={() => handleFlowchartNodeClick('CHOQUE')}
                  className="p-6 rounded-[24px] border-2 border-red-200 bg-red-50/40 hover:bg-red-50/80 text-slate-800 text-center w-80 shadow-md transition-all hover:scale-102"
                >
                  <p className="text-[9px] uppercase font-bold text-red-600">Investigação Pós-Fase Volêmica</p>
                  <h4 className="text-sm font-black text-slate-850 mt-0.5">Mantém PAM &lt; 65 mmHg e Lactato &gt; 2 mmol/L?</h4>
                  <p className="text-[10px] text-[#1e3a8a] mt-1 font-bold">Mesmo em vigência de expansão adequada?</p>
                </button>
              </div>

              {/* Hypotension precoce balloon */}
              <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl text-left max-w-sm flex-1 text-[11px] font-medium text-blue-800 shadow-sm flex gap-2 w-full overflow-hidden shrink-0">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="w-full text-[11px] font-medium text-blue-800 leading-snug break-words">
                  {config['fluxo.choque.balloon'] ? (
                    config['fluxo.choque.balloon']
                  ) : (
                    <>
                      <strong>Dica de Prontidão:</strong> Pode-se considerar e prescrever o início <strong>precoce de Noradrenalina</strong>, ainda durante a expansão volêmica de resgate, especialmente se a <strong>PA diastólica estiver &lt; 40 mmHg</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="w-[2px] h-8 bg-slate-200" />

            {/* YES-NO Pathways */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl my-2">
              <div className="bg-emerald-50 border border-emerald-100 rounded-[20px] p-5 text-center shadow-sm">
                <span className="text-[10px] font-black uppercase text-emerald-700">NÃO (Estabilizado)</span>
                <h4 className="text-xs font-black text-emerald-950 uppercase mt-1">Internação e Seguir Cuidados</h4>
                <p className="text-[10px] text-emerald-800 mt-1 leading-snug">Pacientes restaurados com êxito. Conduzir internação formal na enfermaria ou unidade de AVC/Especializada.</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-[20px] p-5 text-center shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-red-700">SIM (Choque Persistente)</span>
                  <h4 className="text-xs font-black text-red-950 uppercase mt-1">Iniciar Noradrenalina Imediata</h4>
                  <p className="text-[10px] text-red-800 mt-1 leading-snug">Uso aceitável em veia periférica proximal calibrosa por curto período com vigilância estrita e contínua.</p>
                </div>
              </div>
            </div>

            {/* EXPANDED CHOQUE */}
            <div className="flex flex-col gap-4">
              {true && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="w-full flex flex-col items-center overflow-hidden"
                >
                  <div className="w-[3px] h-8 bg-red-500/30" />
                  {/* 8. Chocolate Septic Area */}
                  <div className="bg-slate-950 text-white p-6 rounded-[32px] w-full max-w-2xl text-center shadow-2xl border border-red-500/20">
                    <h2 className="text-xl font-black tracking-widest uppercase text-red-500 animate-pulse">CHOQUE SÉPTICO 🔴</h2>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider leading-none">Ações urgentes na hipotensão persistente e assistida</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4 border-t border-white/5 mt-4">
                      <div className="p-3 bg-white/5 rounded-xl text-center flex flex-col justify-between hover:bg-white/10 transition-colors">
                        <p className="text-[9px] font-black text-red-300 uppercase">1. CORTICOTERAPIA</p>
                        <p className="text-[10px] font-bold text-slate-250 mt-1">Prescrever <strong>Hidrocortisona 200 mg/dia</strong> fracionada se choque refratário.</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl text-center flex flex-col justify-between hover:bg-white/10 transition-colors">
                        <p className="text-[9px] font-black text-red-300 uppercase">2. VASOPRESSINA</p>
                        <p className="text-[10px] font-bold text-slate-250 mt-1">Associar dose fixa se rate de Noradrenalina atingir <strong>&gt; 0,25 a 0,5 mcg/kg/min</strong>.</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl text-center flex flex-col justify-between hover:bg-white/10 transition-colors">
                        <p className="text-[9px] font-black text-red-300 uppercase">3. VAGA UTI</p>
                        <p className="text-[10px] font-bold text-slate-250 mt-1">Transferência emergencial prioritária para retaguarda em <strong>UTI / CTI Adulto</strong>.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </div>

        {/* Floating Config Button */}
        <button 
          onClick={() => setIsSepseConfigOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full text-white shadow-xl shadow-slate-900/25 flex items-center justify-center active:scale-95 hover:rotate-45 transition-all duration-300 no-print z-50 cursor-pointer bg-[#002f6c]"
          title="Configurações e Diretrizes Administrativas"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>

        {isSepseConfigOpen && (
          <SepseConfigModal
            initialConfig={config}
            initialChecklists={checklists}
            initialSectionOrder={sectionOrder}
            initialLogos={logos}
            currentPassword={password}
            onClose={() => setIsSepseConfigOpen(false)}
            onSave={handleSaveConfig}
            targetTab="Sepse-Fluxo"
          />
        )}

      </div>
    );
  }

  if (activeTab === 'Sepse-Anexos') {
    const anexosList = [
      { id: 0, title: 'POP - SEPSE', desc: 'Procedimento Operacional Padrão completo do Protocolo de Sepse.', icon: <FileText />, file: 'pop_sepse.html' },
      { id: 1, title: 'ANEXO I - MANEJO DA SEPSE', desc: 'Diretrizes e condutas clínicas para o manejo hemodinâmico e infeccioso da sepse.', icon: <Stethoscope />, file: 'anexo1.html' },
      { id: 2, title: 'ANEXO II - NEWS + SOFA BEIRA LEITO', desc: 'Escalas de alerta precoce e avaliação de disfunção orgânica à beira leito.', icon: <Activity />, file: 'anexo2.html' },
      { id: 3, title: 'ANEXO III - Bundle Sepse', desc: 'Pacote de medidas otimizadas para as primeiras horas (diagnóstico, culturas, ATB e reposição volêmica).', icon: <ClipboardList />, file: 'anexo3.html' },
    ];

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 min-h-screen">
        {activeAnexoId !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAnexoId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full h-full max-w-full max-h-screen bg-white flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  {anexosList.find(a => a.id === activeAnexoId)?.title}
                </h3>
                <button 
                  onClick={() => setActiveAnexoId(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <div className="p-0 overflow-y-auto flex-1 font-mono text-sm leading-relaxed text-slate-700 bg-slate-50/50 flex flex-col relative h-[600px]">
                {isGestor ? (
                  <div className="p-8 space-y-6">
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl">
                      <h4 className="text-emerald-800 font-bold mb-2">Modo Gestor Ativo</h4>
                      <p className="text-emerald-700 text-sm">Você pode anexar um novo arquivo .html, substituir o existente ou removê-lo. Arquivos anexados são salvos localmente.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-700">Selecione o arquivo HTML do anexo:</label>
                      <input 
                        type="file" 
                        accept=".html"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(activeAnexoId, file);
                        }}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all border border-slate-200 rounded-xl cursor-pointer bg-white"
                      />
                    </div>

                    {customAnexos[activeAnexoId] ? (
                      <div className="mt-8 p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-600" /> Arquivo Anexado</p>
                          <p className="text-xs text-slate-500 mt-1">Este documento está disponível para visualização e download pelos usuários.</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveFile(activeAnexoId)}
                          className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"
                        >
                          Remover Anexo
                        </button>
                      </div>
                    ) : (
                      <div className="mt-8 p-6 bg-white border border-slate-200 border-dashed rounded-xl text-center text-slate-500">
                        Nenhum anexo personalizado vinculado. Será exibido o modelo padrão.
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 border-b border-blue-200 p-4 text-blue-800 font-sans text-sm flex items-center justify-between">
                      <span><strong>Visualização de Documento.</strong> Role para ler todo o conteúdo.</span>
                      <a 
                        href={customAnexos[activeAnexoId] || `/${anexosList.find(a => a.id === activeAnexoId)?.file}`} 
                        download={anexosList.find(a => a.id === activeAnexoId)?.file}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        Baixar Arquivo HTML
                      </a>
                    </div>
                    {customAnexos[activeAnexoId] ? (
                      <iframe 
                        src={customAnexos[activeAnexoId]} 
                        title={anexosList.find(a => a.id === activeAnexoId)?.title}
                        className="w-full flex-1 border-none bg-white"
                      />
                    ) : (
                      <iframe 
                        src={`/${anexosList.find(a => a.id === activeAnexoId)?.file}`} 
                        title={anexosList.find(a => a.id === activeAnexoId)?.title}
                        className="w-full flex-1 border-none bg-white"
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-[#1e3a8a] opacity-60">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3" />
          <span>Diretrizes Assistenciais</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600 font-bold">Anexos do Protocolo</span>
        </div>

        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
               <LinkIcon className="text-emerald-600 w-7 h-7" />
               Anexos e Documentos Complementares
            </h2>
            <p className="text-slate-500 mt-2">Material complementar, referências rápidas e contatos do protocolo.</p>
          </div>
          <button
            onClick={() => setIsGestor(!isGestor)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border ${isGestor ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
          >
            <User className="w-4 h-4" />
            {isGestor ? 'Sair do Modo Gestor' : 'Modo Gestor'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
           {/* QR Code Card */}
           <div className="bg-white rounded-[24px] border border-slate-200 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all lg:col-span-1">
             <div className="bg-green-50 p-4 rounded-full mb-4 ring-8 ring-green-50/50">
               <MessageCircle className="w-10 h-10 text-green-600" />
             </div>
             <h3 className="text-lg font-black text-slate-800 mb-2">Infectologista de Plantão</h3>
             <p className="text-sm text-slate-500 mb-6">Escaneie o QR Code para acionar a equipe de controle de infecção via WhatsApp.</p>
             
             <div className="mt-auto w-full max-w-[200px] bg-white rounded-2xl border-2 border-green-500/20 flex flex-col items-center justify-center relative overflow-hidden shadow-sm p-4">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/" alt="QR Code Infectologista" className="w-full h-auto object-contain bg-white" />
                 <p className="text-[12px] font-black text-green-600 mt-3 flex items-center gap-1.5 uppercase">
                   📷 APONTE A CÂMERA
                 </p>
             </div>

             <a 
               href="https://wa.me/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="mt-8 w-full py-3.5 bg-[#25D366] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#1fbd58] shadow-md transition-all hover:-translate-y-0.5"
             >
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
               Acionar via WhatsApp
             </a>
           </div>

           {/* Cards for Annexes */}
           <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
             {anexosList.map(anexo => (
               <div key={anexo.id} className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all flex flex-col group hover:border-emerald-300">
                 <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                    {anexo.icon}
                 </div>
                 <h3 className="text-xl font-black text-slate-800 mb-3">{anexo.title}</h3>
                 <p className="text-slate-500 mb-8 flex-1 leading-relaxed">{anexo.desc}</p>
                 
                 <button 
                    onClick={() => setActiveAnexoId(anexo.id)}
                    className={`w-full py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border ${isGestor ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-700 hover:text-emerald-700 border-slate-200 hover:border-emerald-200'}`}
                  >
                   <ExternalLink className="w-5 h-5" />
                   {isGestor ? 'Gerenciar Documento HTML' : 'Visualizar Documento'}
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  return null;
};

const Signature = () => (
  <div className="mt-20 pt-8 border-t border-border flex flex-col items-center gap-1 text-center scale-75 opacity-50">
     <div className="w-40 h-px bg-slate-300 mb-2" />
     <p className="text-[10px] font-black text-slate-800 uppercase tracking-[4px]">IVALDO INÁCIO SILVA JÚNIOR</p>
     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Diretor Técnico CRM-GO 12345</p>
  </div>
);

const renderTEPFlowchart = (isInteractive: boolean) => {
  const [activeNode, setActiveNode] = useState('Avaliação');
  
  const nodes = [
    { id: 'Avaliação', x: 50, y: 10, icon: <Stethoscope />, color: 'rose' },
    { id: 'Diagnóstico', x: 50, y: 35, icon: <Eye />, color: 'rose' },
    { id: 'Estratificação', x: 50, y: 60, icon: <Calculator />, color: 'rose' },
    { id: 'Tratamento', x: 50, y: 85, icon: <ShieldCheck />, color: 'rose' },
  ];

  if (!isInteractive) {
    return (
      <div className="w-full flex flex-col items-center py-10 relative">
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-rose-200"></div>
        {nodes.map((node, index) => (
           <div key={node.id} className="relative z-10 w-full max-w-4xl mb-12 flex flex-col items-center">
              <div className="w-64 p-6 bg-white border-4 border-rose-500 rounded-[32px] flex flex-col items-center gap-4 shadow-xl z-20">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500">
                    {React.cloneElement(node.icon as React.ReactElement, { className: 'w-6 h-6' })}
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-rose-500 mb-1">Passo {index + 1}</p>
                    <p className="text-sm font-black text-slate-800">{node.id}</p>
                 </div>
              </div>

              {/* Protocol Details Rendered Directly Here */}
              <div className="mt-8 bg-white border border-rose-100 p-8 rounded-[48px] shadow-sm w-full z-20 flex flex-col gap-6">
                 {TEP_PROTOCOLS[node.id]?.sections.map((section, idx) => (
                    <div key={idx} className="border-l-4 border-rose-100 pl-6">
                       <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3">{section.title}</h4>
                       <ul className="space-y-2">
                          {section.items.map((item, i) => (
                             <li key={i} className="flex gap-3 text-slate-700 font-medium text-sm">
                                <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                 ))}
              </div>
           </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full h-[800px] bg-white rounded-[40px] border border-slate-50 shadow-inner overflow-hidden flex items-center justify-center">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#f43f5e 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
       
       {/* Connectors */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
             <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
             </marker>
          </defs>
          <path d="M 50% 180 L 50% 250" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrow-rose)" />
          <path d="M 50% 380 L 50% 450" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrow-rose)" />
          <path d="M 50% 580 L 50% 650" stroke="#f43f5e" strokeWidth="3" strokeDasharray="6 6" markerEnd="url(#arrow-rose)" />
       </svg>

       {/* Nodes */}
       <div className="relative z-10 w-full h-full">
          {nodes.map(node => (
             <motion.button
               key={node.id}
               initial={false}
               animate={{ 
                 scale: activeNode === node.id ? 1.1 : 1,
                 opacity: activeNode === node.id || !isInteractive ? 1 : 0.4
               }}
               onClick={() => isInteractive && setActiveNode(prev => prev === node.id ? '' : node.id)}
               style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
               className={`absolute w-64 p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${activeNode === node.id ? 'bg-rose-500 border-rose-500 text-white shadow-2xl shadow-rose-200' : 'bg-white border-rose-100 text-slate-400 uppercase font-black tracking-widest'}`}
             >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeNode === node.id ? 'bg-white/20' : 'bg-rose-50 text-rose-500'}`}>
                   {React.cloneElement(node.icon as React.ReactElement, { className: 'w-6 h-6' })}
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Passo {nodes.indexOf(node) + 1}</p>
                   <p className="text-sm font-black">{node.id}</p>
                </div>
             </motion.button>
          ))}
       </div>
    </div>
  );
};

const Dashboard = ({ onSelectModule }: { onSelectModule: (module: string) => void }) => {
  // Navigation mapping
  const handleProtocolAccess = (id: string) => {
    onSelectModule(id);
  };

  const modules = [
    { 
      id: 'protocol-sepse', 
      title: 'Protocolo de Sepse', 
      desc: 'Manejo estruturado, ressuscitação, e pacote da 1ª hora (Triagem NEWS/SOFA).', 
      icon: <Activity className="w-8 h-8 text-emerald-500" />, 
      active: true,
      badge: 'Essencial'
    },
    { 
      id: 'protocol-tep', 
      title: 'Protocolo TEP', 
      desc: 'Tromboembolismo Pulmonar - Avaliação de risco, escores e anticoagulação.', 
      icon: <Activity className="w-8 h-8 text-rose-500" />, 
      active: true,
      badge: 'Cardio'
    },
    { 
      id: 'protocol-avc', 
      title: 'Protocolo de AVC', 
      desc: 'AVC Isquêmico e Hemorrágico, escalas NIHSS, ABCD2 e fluxogramas vitais.', 
      icon: <Brain className="w-8 h-8 text-accent" />, 
      active: true,
      badge: 'Neuro'
    },
    { 
      id: 'protocol-icc', 
      title: 'Protocolo de ICC', 
      desc: 'Insuficiência Cardíaca Congestiva. Diretrizes em breve.', 
      icon: <HeartPulse className="w-8 h-8 text-blue-500" />, 
      active: true,
      badge: 'Cardio'
    },
    { 
      id: 'protocol-infantil', 
      title: 'Protocolo Infantil', 
      desc: 'Diretrizes pediátricas e protocolos assistenciais emergenciais.', 
      icon: <Users className="w-8 h-8 text-orange-500" />, 
      active: true,
      badge: 'Pedia'
    },
    { 
      id: 'calculator', 
      title: 'Calculadoras Médicas', 
      desc: 'Escores de risco, doses por peso e parâmetros críticos.', 
      icon: <Calculator className="w-8 h-8 text-emerald-500" />, 
      active: true,
      badge: 'Utilidade'
    },
    { 
      id: 'institutional', 
      title: 'Documentos Institucionais', 
      desc: 'Fluxogramas, regimentos e manuais internos.', 
      icon: <Files className="w-8 h-8 text-amber-500" />, 
      active: true,
      badge: 'Arquivos'
    },
  ];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Redesigned Hero / Global Status */}
      <div className="bg-slate-950 p-12 rounded-[56px] text-white overflow-hidden relative shadow-2xl flex flex-col lg:flex-row items-center gap-12 border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#2563eb_0,transparent_50%)] opacity-20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -mr-32 -mb-32" />
        
        <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-accent">
            <Activity className="w-4 h-4 animate-pulse" />
            Central de Inteligência Operacional
          </div>
          <div className="space-y-4">
             <h2 className="text-6xl font-black leading-[0.85] tracking-tighter">
               Protocolos <br />
               <span className="text-accent underline decoration-white/10 underline-offset-4">Assistenciais</span>
             </h2>
             <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto lg:mx-0">
               Visão analítica integrada dos fluxos assistenciais e conformidade com protocolos do hospital.
             </p>
             <div className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                <button 
                  onClick={exportProtocolsToWord}
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_10px_30px_-5px_rgba(255,255,255,0.2)]"
                >
                  <FileDown className="w-4 h-4 text-accent" />
                  Exportar Protocolos (Word)
                </button>
                <button 
                  onClick={() => onSelectModule('institutional')}
                  className="px-6 py-3 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                >
                  <Files className="w-4 h-4" />
                  Ver Manuais
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Access Modules Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id)}
            className="group relative bg-white p-8 rounded-[40px] border border-slate-200 hover:border-accent hover:shadow-2xl transition-all text-left flex flex-col gap-6 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] -mr-8 -mt-8 group-hover:bg-accent/5 transition-colors" />
            
            <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/10 transition-all">
               {m.icon}
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter leading-none">{m.title}</h3>
                  {m.badge === 'Essencial' && <span className="w-1.5 h-1.5 bg-accent rounded-full" />}
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">{m.desc}</p>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-accent transition-colors">
               Acesso Rápido
               <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* Institutional Info Card */}
      <div className="bg-slate-900 rounded-[64px] p-12 text-white flex flex-col lg:flex-row items-center gap-12 border border-white/5 relative overflow-hidden shadow-2xl">
         <Building2 className="absolute -left-20 -bottom-20 w-96 h-96 text-white/5 rotate-12" />
         
         <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-400">
               <Info className="w-4 h-4" />
               Diretrizes 2026
            </div>
            <div className="space-y-4">
               <h3 className="text-4xl font-black tracking-tighter">Segurança e <span className="text-accent underline decoration-white/20 underline-offset-8">Excelência</span></h3>
               <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                 Todos os protocolos integrados nesta plataforma seguem estritamente as diretrizes da Sociedade Brasileira de Clínica Médica, adaptados pela Comissão de Protocolos do Hospital Morrinhos.
               </p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
               <button onClick={() => onSelectModule('institutional')} className="px-8 py-4 bg-accent text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-accent/20">
                  Ver Estatuto
               </button>
               <button className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all">
                  Comitê Médico
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const InstitutionalInfo = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
    <div className="flex flex-col gap-2">
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Informações Institucionais</h2>
      <p className="text-slate-500 font-medium">Histórico, diretoria e visão do Hospital Municipal de Morrinhos.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <Building2 className="w-12 h-12 text-accent mb-4" />
          <h3 className="text-2xl font-bold text-slate-800">Hospital Municipal de Morrinhos</h3>
          <p className="text-slate-600 leading-relaxed">
            Fundado como o pilar da saúde pública de nossa região, o Hospital de Morrinhos tem se modernizado constantemente para oferecer medicina de alta complexidade com foco na humanização e segurança do paciente.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-black text-accent">140</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leitos Totais</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="block text-2xl font-black text-accent">24h</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atendimento</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <BookOpen className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-2xl font-bold text-slate-800">Nossa Missão</h3>
          <p className="text-slate-600 leading-relaxed">
            Ser referência regional em atendimentos de urgência e emergência, garantindo a aplicação de protocolos baseados em evidência para reduzir a mortalidade e as sequelas de patologias tempo-dependentes.
          </p>
        </div>
      </div>

      <div className="space-y-10">
         <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-500" />
              Liderança e Diretoria
            </h3>
            
            <div className="space-y-6">
              {[
                { name: 'Dr. Ivaldo Inácio Silva Júnior', role: 'Diretor Técnico', spec: 'Médico Intensivista' },
                { name: 'Dra. Maria Clara Mendes', role: 'Diretora Clínica', spec: 'Neurologista' },
                { name: 'Enf. Roberto Alvim', role: 'Gestor de Qualidade', spec: 'Gestão Hospitalar' },
              ].map((person, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 leading-tight">{person.name}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-black mt-1">{person.role}</p>
                    <p className="text-[10px] text-slate-400 italic">{person.spec}</p>
                  </div>
                </div>
              ))}
            </div>
         </div>

         <div className="bg-accent rounded-3xl p-10 text-white shadow-xl shadow-accent/20">
            <h3 className="text-2xl font-black tracking-tighter mb-4">Central de Telemedicina</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Todos os protocolos possuem integração com nossa central de tele-neurologia para discussão de casos críticos 24/7.
            </p>
            <button className="flex items-center gap-2 bg-white text-accent px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
              <Activity className="w-4 h-4" />
              Acionar Suporte Agora
            </button>
         </div>
      </div>
    </div>
  </div>
);

// Bed Management Removed

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'hospital' | 'team' | 'protocols' | 'system'>('profile');

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: <User className="w-4 h-4" /> },
    { id: 'hospital', label: 'Unidade Hospitalar', icon: <Building2 className="w-4 h-4" /> },
    { id: 'team', label: 'Gerenciamento de Equipe', icon: <Users className="w-4 h-4" /> },
    { id: 'protocols', label: 'Parâmetros de Protocolos', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'system', label: 'Sistema e Segurança', icon: <Shield className="w-4 h-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-8 p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="w-32 h-32 rounded-[40px] bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl">
                <User className="w-16 h-16 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Dr. Ivaldo Inácio Silva Jr.</h3>
                <p className="text-slate-400 font-bold uppercase tracking-[2px] text-xs">Acesso: Administrador Máster</p>
                <div className="flex gap-2">
                   <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase">CRM-GO 12345</span>
                   <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">Médico Intensivista</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  Dados Cadastrais
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-mail Institucional</label>
                    <input type="email" defaultValue="diretoria@morrinhos.go.gov.br" disabled className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-medium text-slate-700 opacity-60" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Telefone / WhatsApp</label>
                    <input type="text" placeholder="(64) 99999-9999" className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-sm font-medium focus:border-accent outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  Segurança da Conta
                </h4>
                <div className="space-y-4">
                  <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-bold text-slate-700 flex items-center justify-between transition-all">
                    Alterar Senha de Acesso
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                  <button className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-sm font-bold text-slate-700 flex items-center justify-between transition-all">
                    Configurar MFA (2 Fatores)
                    <Smartphone className="w-4 h-4 opacity-30" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'hospital':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-10 rounded-[32px] border border-slate-100 space-y-10">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Hospital Municipal de Morrinhos</h3>
                  <p className="text-slate-500 font-medium">Configuração de dados institucionais e identidade visual.</p>
                </div>
                <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center shadow-xl shadow-accent/20">
                   <Building2 className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">CNES (Código Nacional)</label>
                      <input type="text" defaultValue="2521571" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Razão Social</label>
                      <input type="text" defaultValue="Secretaria Municipal de Saúde de Morrinhos" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold" />
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Endereço</label>
                      <input type="text" defaultValue="Av. Senador Hermenegildo de Morais, s/n" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Cidade / UF</label>
                      <input type="text" defaultValue="Morrinhos - GO" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm font-bold" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Equipe Hospitalar</h3>
                  <p className="text-slate-500 font-medium">Controle de acessos e escalas de profissionais.</p>
                </div>
                <button className="px-6 py-3 bg-accent text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 transition-all">
                  Convidar Profissional
                </button>
             </div>

             <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Colaborador</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Especialidade / Cargo</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Permissão</th>
                      <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { name: 'Dr. Ricardo Mendes', role: 'Médico', spec: 'Emergencista', access: 'Editor' },
                      { name: 'Enf. Juliana Souza', role: 'Enfermeira', spec: 'Triagem', access: 'Vizualizador' },
                      { name: 'Dr. Marcos Aurélio', role: 'Neurologista', spec: 'Laudos/AVC', access: 'Editor' },
                    ].map((person, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs text-xs">{person.name.charAt(0)}</div>
                              <span className="font-bold text-slate-700 text-sm">{person.name}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="space-y-0.5">
                              <p className="text-xs font-bold text-slate-600">{person.role}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{person.spec}</p>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${person.access === 'Editor' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                              {person.access}
                           </span>
                        </td>
                        <td className="p-6">
                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                              <Settings className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        );
      case 'protocols':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white p-10 rounded-[32px] border border-slate-100 space-y-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parâmetros Clínicos</h3>
                <p className="text-slate-500 font-medium">Configure métricas e gatilhos de alerta para os protocolos assistenciais.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                       <Brain className="w-4 h-4 text-accent" />
                       Protocolo AVC
                    </h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center group">
                         <span className="text-sm font-bold text-slate-600">Tempo Porta-Tomografia (Meta)</span>
                         <div className="flex items-center gap-2">
                            <input type="text" defaultValue="25" className="w-16 p-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-sm" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">min</span>
                         </div>
                      </div>
                      <div className="flex justify-between items-center group">
                         <span className="text-sm font-bold text-slate-600">Limite de PAS para Trombólise</span>
                         <div className="flex items-center gap-2">
                            <input type="text" defaultValue="185" className="w-16 p-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-sm" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">mmHg</span>
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                       <HeartPulse className="w-4 h-4 text-blue-500" />
                       Meta de Saturação (O2)
                    </h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center group">
                         <span className="text-sm font-bold text-slate-600">Alerta de Hipóxia</span>
                         <div className="flex items-center gap-2">
                            <input type="text" defaultValue="94" className="w-16 p-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-sm" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">%</span>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'beds':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Estrutura de Unidades</h3>
                  <p className="text-slate-500 font-medium">Gestão de alas, enfermarias e configuração física de leitos.</p>
                </div>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                  Nova Enfermaria
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'SALA VERMELHA', type: 'Crítico', capacity: 2 },
                  { name: 'UTI ADULTO', type: 'Crítico', capacity: 10 },
                  { name: 'PED ENFERMARIA 04', type: 'Pediatria', capacity: 4 },
                  { name: 'CLÍ MED ENFERMARIA 02', type: 'Clínica', capacity: 2 },
                ].map((ward, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 flex flex-col gap-6 group hover:border-accent transition-all">
                    <div className="flex justify-between items-start">
                       <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-accent/10 transition-colors">
                          <BedDouble className="w-6 h-6 text-slate-400 group-hover:text-accent" />
                       </div>
                       <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase">{ward.type}</span>
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-bold text-slate-800 text-lg leading-tight">{ward.name}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ward.capacity} Leitos Físicos</p>
                    </div>
                    <button className="text-xs font-black text-accent uppercase tracking-widest text-left mt-auto">Editar Leitos</button>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 space-y-8">
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                      <History className="w-6 h-6 text-slate-400" />
                      Logs de Atividade
                   </h3>
                   <div className="space-y-6">
                      {[
                        { user: 'Dr. Ivaldo', action: 'Login no Sistema', time: 'Há 5 min' },
                        { user: 'Enf. Juliana', action: 'Atualização Leito 2.2', time: 'Há 12 min' },
                        { user: 'SISTEMA', action: 'Backup Diário Concluído', time: 'Há 2h' },
                      ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                           <p className="text-slate-600">
                              <span className="font-bold text-slate-800">{log.user}:</span> {log.action}
                           </p>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{log.time}</span>
                        </div>
                      ))}
                   </div>
                   <button className="w-full py-4 bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-500 rounded-2xl hover:bg-slate-100">Ver Histórico Completo</button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[32px] text-white space-y-8 overflow-hidden relative">
                   <div className="relative z-10 space-y-6">
                     <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Palette className="w-6 h-6 text-accent" />
                        Customização e Interface
                     </h3>
                     <p className="text-slate-400 text-sm leading-relaxed">
                        Gerencie a aparência do sistema, cores institucionais e notificações do portal.
                     </p>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-bold opacity-80">Modo Escuro (Interface)</span>
                           <div className="w-10 h-5 bg-white/10 rounded-full relative">
                              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                           </div>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-bold opacity-80">Notificações Push</span>
                           <div className="w-10 h-5 bg-accent rounded-full relative">
                              <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                           </div>
                        </div>
                     </div>
                   </div>
                   <FileCode className="absolute -right-10 -bottom-10 w-40 h-40 text-white/5 opacity-40 rotate-[20deg]" />
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Configurações Gerais</h2>
        <p className="text-slate-500 font-medium italic">Gestão administrativa, controle de acesso e personalização do sistema.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Settings Navigation */}
        <div className="w-full lg:w-72 flex flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all font-bold text-sm tracking-tight ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
            >
              <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-accent/20 text-accent' : 'bg-slate-100 text-slate-400'}`}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const ProtocolsMenuView = ({ onSelectProtocol }: { onSelectProtocol: (id: string) => void }) => {
  const protocolModules = [
    { 
      id: 'sepse', 
      title: 'Protocolo de Sepse', 
      desc: 'Manejo estruturado, ressuscitação hemodinâmica e pacote da 1ª hora (Triagem NEWS e SOFA).', 
      icon: <Activity className="w-10 h-10 text-emerald-500" />, 
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      border: 'border-emerald-200',
      active: true,
    },
    { 
      id: 'tep', 
      title: 'Protocolo TEP', 
      desc: 'Tromboembolismo Pulmonar - Avaliação de risco (Wells/PESI), escores e diretrizes de anticoagulação.', 
      icon: <Activity className="w-10 h-10 text-rose-500" />, 
      bg: 'bg-rose-50 hover:bg-rose-100',
      border: 'border-rose-200',
      active: true,
    },
    { 
      id: 'avc', 
      title: 'Protocolo de AVC', 
      desc: 'AVC Isquêmico e Hemorrágico, escalas de avaliação (NIHSS, ABCD2) e fluxogramas de urgência.', 
      icon: <Brain className="w-10 h-10 text-accent" />, 
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200',
      active: true,
    },
    { 
      id: 'icc', 
      title: 'Protocolo de ICC', 
      desc: 'Insuficiência Cardíaca Congestiva. Diretrizes em breve pela comissão do hospital.', 
      icon: <HeartPulse className="w-10 h-10 text-blue-500" />, 
      bg: 'bg-indigo-50 hover:bg-indigo-100',
      border: 'border-indigo-200',
      active: true,
    },
    { 
      id: 'infantil', 
      title: 'Protocolo Infantil', 
      desc: 'Diretrizes pediátricas, reanimação neonatal e protocolos assistenciais para emergência infantil.', 
      icon: <Users className="w-10 h-10 text-orange-500" />, 
      bg: 'bg-orange-50 hover:bg-orange-100',
      border: 'border-orange-200',
      active: true,
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col gap-3 text-center lg:text-left">
        <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Protocolos Assistenciais</h2>
        <p className="text-slate-500 font-medium text-lg max-w-3xl">Selecione o protocolo desejado abaixo para iniciar o fluxo de atendimento, calcular escores ou preencher os dados relativos ao paciente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {protocolModules.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectProtocol(m.id)}
            className={`group relative p-10 rounded-[40px] border-2 transition-all text-left flex flex-col gap-6 overflow-hidden min-h-[320px] ${m.bg} ${m.border} ${m.active ? 'hover:-translate-y-2 hover:shadow-2xl cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'}`}
            disabled={!m.active}
          >
            <div className="bg-white/80 backdrop-blur-sm w-20 h-20 rounded-[28px] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
               {m.icon}
            </div>
            
            <div className="space-y-4 mt-auto">
               <h3 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight bg-white/50 inline-block px-3 py-1 rounded-lg backdrop-blur-sm">{m.title}</h3>
               <p className="text-sm text-slate-600 font-bold leading-relaxed">{m.desc}</p>
            </div>
            
            <div className="absolute top-8 right-8 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
               <ChevronRight className="w-6 h-6 text-slate-800" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'protocols' | 'protocols-menu' | 'institutional' | 'settings' | 'calculator'>('dashboard');
  const [activeProtocolId, setActiveProtocolId] = useState<'avc' | 'tep' | 'sepse' | 'icc' | 'infantil'>('avc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Painel Principal', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'protocols-menu', label: 'Protocolos Assistenciais', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'institutional', label: 'Institucional', icon: <Building2 className="w-5 h-5" /> },
  ];

  const handleSelectProtocol = (id: string) => {
    setActiveProtocolId(id as any);
    setCurrentView('protocols');
  };

  const handleBack = () => setCurrentView('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Navigation Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 text-white transition-all duration-300 z-50 overflow-hidden flex flex-col print:hidden ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
        <div className="p-8 pb-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-accent rounded-2xl shadow-xl shadow-accent/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="animate-in fade-in slide-in-from-left-4">
                <h1 className="text-sm font-black tracking-tighter uppercase whitespace-nowrap">Hospital Morrinhos</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocolos 2026</p>
              </div>
            )}
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${currentView === item.id ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
              >
                {item.icon}
                {isSidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                {currentView === item.id && !isSidebarOpen && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-l-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-3">
          <button className={`w-full flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-colors rounded-2xl hover:bg-white/5`}>
            <Bell className="w-5 h-5" />
            {isSidebarOpen && <span className="font-bold text-sm">Notificações</span>}
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-colors rounded-2xl hover:bg-white/5 ${currentView === 'settings' ? 'bg-white/10 text-white' : ''}`}
          >
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span className="font-bold text-sm">Configurações</span>}
          </button>
          <hr className="border-white/10 my-4" />
          <button className={`w-full flex items-center gap-4 p-4 text-rose-500 hover:bg-rose-500/10 transition-all rounded-2xl`}>
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-bold text-sm">Sair do Sistema</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white/10 lg:flex hidden"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 print:ml-0 print:w-full ${isSidebarOpen ? 'ml-80' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 py-6 px-12 z-40 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-4">
             {currentView !== 'dashboard' && (
               <button 
                onClick={handleBack}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
               >
                <ChevronLeft className="w-6 h-6" />
               </button>
             )}
             <h2 className="text-sm font-black text-slate-400 uppercase tracking-[4px]">
               {currentView === 'dashboard' ? 'Início / Dashboard' : 
                currentView === 'protocol-avc' ? 'Unidade / Protocolos Assistenciais' : 
                currentView === 'settings' ? 'Sistema / Configurações Gerais' :
                'Institucional / Sobre o Hospital'}
             </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs font-black text-accent uppercase tracking-tighter">Dr. Ivaldo Inácio Silva Jr.</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Diretor Técnico</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content View Rendering */}
        <div className="p-12">
          {currentView === 'dashboard' && <Dashboard onSelectModule={(id) => {
            if (id.startsWith('protocol-')) {
               handleSelectProtocol(id.replace('protocol-', ''));
            } else {
               setCurrentView(id as any);
            }
          }} />}
          {currentView === 'protocols-menu' && <ProtocolsMenuView onSelectProtocol={handleSelectProtocol} />}
          {currentView === 'protocols' && <ProtocolsModule activeProtocolId={activeProtocolId} setActiveProtocolId={setActiveProtocolId} onBack={handleBack} />}
          {currentView === 'institutional' && <InstitutionalInfo />}
          {currentView === 'calculator' && <CalculatorModule onBack={handleBack} />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
