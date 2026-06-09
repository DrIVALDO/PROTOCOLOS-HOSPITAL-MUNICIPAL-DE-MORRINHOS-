import React from 'react';
import { ConfigDict } from './sepseTypes';
import { ChevronRight, Activity, MapPin, Info, Clock, ShieldAlert, FileText, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react';
import { AutoResizeTextarea } from './AutoResizeTextarea';

export const EditableFluxo = ({ localConfig, handleFieldChange, activeThemeColor }: any) => {
  const newsScore = 4;
  const sofaScore = 2;
  const weight = '70';
  const volumeCalculated = (30 * 70).toString();

  // Helper macro for inputs
  const T = (key: string, _default: string, additionalClasses?: string) => (
    <AutoResizeTextarea
      value={localConfig[key] || _default} 
      onChange={(e) => handleFieldChange(key, e.target.value)}
      className={`bg-transparent outline-none w-full text-center border-b border-dashed border-transparent hover:border-slate-350 focus:border-slate-500 focus:bg-white transition-all block resize-none overflow-hidden ${additionalClasses || ''}`}
      rows={1}
    />
  );

  const TA = (key: string, _default: string, additionalClasses?: string, rows: number = 2) => (
    <AutoResizeTextarea
      value={localConfig[key] || _default} 
      onChange={(e) => handleFieldChange(key, e.target.value)}
      rows={rows}
      className={`bg-transparent outline-none w-full text-center border border-dashed border-transparent hover:border-slate-350 focus:border-slate-500 focus:bg-white transition-all resize-none overflow-hidden block ${additionalClasses || ''}`}
    />
  );

  const T_left = (key: string, _default: string, additionalClasses?: string) => (
    <AutoResizeTextarea
      value={localConfig[key] || _default} 
      onChange={(e) => handleFieldChange(key, e.target.value)}
      className={`bg-transparent outline-none w-full text-left border-b border-dashed border-transparent hover:border-slate-350 focus:border-slate-500 focus:bg-white transition-all block resize-none overflow-hidden ${additionalClasses || ''}`}
      rows={1}
    />
  );

  return (
    <div className="max-w-[1280px] mx-auto bg-slate-50 pt-2 pb-10 space-y-5 px-6 text-[10px] font-sans">
      
       <div className="text-center space-y-2 mb-8 bg-sky-50 p-4 border border-sky-200 shadow-sm rounded-xl">
         <h2 className="text-sm font-black text-sky-700 text-center uppercase tracking-widest">Edição do Fluxograma</h2>
         <p className="text-xs text-sky-600 font-bold">Modo Espelho: Altere os textos clicando diretamente nos títulos descritos no fluxograma. Eles serão salvos.</p>
       </div>

       {/* Here begins the exact mirror of App.tsx Sepsis Flowchart */}
       <div className="p-8 bg-white border border-slate-200 rounded-3xl max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 shadow-xl">
        {/* Breadcrumb & Title */}
        <div className="flex items-center gap-2 text-[10px] text-[#1e3a8a] opacity-60">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3" />
          <span>Diretrizes Assistenciais</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-600 font-bold">Oculto</span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 leading-tight">
              {T_left('fluxo.header.titulo', 'Manejo da Sepse no Adulto', 'text-2xl font-black text-slate-800')}
              <Activity className="text-emerald-600 w-6 h-6 animate-pulse" />
            </h2>
            <div className="flex items-center gap-2 mt-2 w-full max-w-md">
              <div className="bg-[#10b981] p-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-slate-600 w-full flex items-center gap-2">
                Você está em: 
                <span className="font-bold text-slate-800 flex-1">
                   {T_left('fluxo.header.subtitulo', 'Pronto Socorro - Triagem Inicial', 'font-bold text-slate-800 w-full')}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
             <button className="px-8 py-4 rounded-xl font-black text-sm shadow-xl flex items-center gap-3 transition-all bg-red-600 hover:bg-red-700 text-white shadow-red-200 select-none">
              <Clock className="w-5 h-5 pointer-events-none" />
              {T('fluxo.btn.ativar', 'ATIVAR PROTOCOLO SEPSE 🔴', 'text-white pointer-events-auto')}
            </button>
            <button className="px-8 py-4 rounded-xl font-black text-sm shadow-xl flex items-center gap-3 transition-all bg-emerald-600 text-white shadow-emerald-200 select-none">
              <Clock className="w-5 h-5 pointer-events-none" />
              {T('fluxo.btn.ativo', 'PROTOCOLO SEPSE ATIVO 🟢', 'text-white pointer-events-auto')}
            </button>
          </div>
        </div>

        {/* Dynamic Warning Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 grayscale cursor-not-allowed">
          <div className="p-6 rounded-[24px] border-2 bg-amber-500/10 border-amber-400">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escore de NEWS</h4>
            <p className="text-4xl font-extrabold leading-none mb-2 text-amber-600">{newsScore} pontos</p>
            <p className="text-xs font-semibold text-slate-500">Exemplo bloqueado na visualização</p>
          </div>
          
          <div className="p-6 rounded-[24px] border-2 bg-red-500/10 border-red-300">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escore de SOFA</h4>
            <p className="text-4xl font-extrabold leading-none mb-2 text-red-600">{sofaScore} pontos</p>
            <p className="text-xs font-semibold text-slate-500">Exemplo bloqueado na visualização</p>
          </div>
        </div>

        {/* Interactive Diagram Canvas */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-inner space-y-8 relative overflow-hidden bg-slate-50/50">
          <h3 className="text-center text-slate-400 font-black uppercase text-[11px] tracking-widest">Estrutura de Decisão</h3>
          
          <div className="flex flex-col items-center">
            {/* 1. Paciente com Foco */}
            <div className="flex flex-col items-center w-full max-w-xl">
              <div className="bg-slate-900 text-white rounded-2xl py-4 px-6 w-full text-center font-bold text-xs border-l-4 border-emerald-500 shadow-md uppercase">
                {T('fluxo.node.inicio', 'PACIENTE COM FOCO DE INFECÇÃO SIGNIFICATIVO', 'text-white')}
              </div>
              <div className="w-[3px] h-8 bg-slate-200" />
            </div>

            {/* 2. NEWS Diamond Card */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-4xl relative">
              <div className="flex-1 flex flex-col items-center">
                <div className="p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md bg-amber-500 border-amber-400 text-white">
                  <p className="text-[9px] uppercase font-bold opacity-80 pointer-events-none">Estratificação Inicial</p>
                  <h4 className="text-sm font-black mt-0.5">
                     {T('fluxo.node.news', 'Escore de NEWS ≥ 4?', 'text-white text-sm font-black')}
                  </h4>
                </div>
              </div>

              {/* NEWS NO branch */}
              <div className="flex flex-col items-center md:absolute md:left-[66%]">
                <div className="flex items-center gap-2">
                  <div className="hidden md:block h-[2px] w-6 bg-slate-300" />
                  <span className="text-[9px] font-black text-slate-400 uppercase w-12">
                     {T('fluxo.conn.nao', 'NÃO', 'text-slate-400')}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
                  <div className="p-3.5 rounded-xl border text-center text-xs font-bold w-44 shadow-sm uppercase bg-emerald-50 border-emerald-250 text-emerald-800">
                    {T('fluxo.node.reavaliar', 'REAVALIAÇÕES CONSTANTES', 'text-emerald-800')}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[3px] h-8 bg-slate-200" />

            {/* 3. SOFA Diamond Card */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-4xl relative">
              <div className="flex-1 flex flex-col items-center">
                <div className="p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md bg-emerald-600 border-emerald-500 text-white">
                  <p className="text-[9px] uppercase font-bold opacity-80 pointer-events-none">Disfunção Progressiva</p>
                  <h4 className="text-sm font-black mt-0.5">
                     {T('fluxo.node.sofa', 'Escore de SOFA ≥ 2?', 'text-white')}
                  </h4>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:absolute md:left-[66%] opacity-50">
                <div className="flex items-center gap-2">
                  <div className="hidden md:block h-[2px] w-6 bg-slate-300" />
                  <span className="text-[9px] font-black text-slate-400 uppercase w-12 text-center">NÃO</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
                  <div className="p-3.5 rounded-xl border text-center text-xs font-bold w-44 shadow-sm uppercase bg-slate-50 border-slate-200 text-slate-400 pointer-events-none">
                     Ligado ao Mesmo Bloco Acima
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[3px] h-8 bg-slate-200" />

            {/* 4. Sepsis Status */}
            <div className="font-black text-lg tracking-wider py-5 px-16 rounded-[24px] shadow-lg flex items-center gap-3 transition-all bg-red-650 text-white bg-red-600 shadow-red-200">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              {T('fluxo.node.sepse', 'SEPSE DETERMINADA ⚠️', 'text-white')}
            </div>

            {/* 5. The 5 Bundles */}
            <div className="w-full h-px bg-slate-200 my-8 shadow-sm" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              {[
                { 
                  n: 'b1', 
                  defaultTitle: 'COLETA DE EXAMES', 
                  defaultDesc: 'Hemoculturas (2 pares de sítios distintos), Lactato, hemograma, Bilirrubinas, creatinina e gasometria arterial.', 
                  icon: <FileText className="w-5 h-5 text-emerald-600 pointer-events-none" />,
                  defaultActionLabel: '? Ver Tabela 3'
                },
                { 
                  n: 'b2', 
                  defaultTitle: 'MONITORIZAÇÃO COMPLETA', 
                  defaultDesc: 'Acompanhar sinais vitais constantemente, obter monitorização de ritmo, oximetria contínua e débito urinário por hora.', 
                  icon: <Activity className="w-5 h-5 text-indigo-600 pointer-events-none" /> 
                },
                { 
                  n: 'b3', 
                  defaultTitle: 'ESTABILIZAÇÃO CLÍNICA', 
                  defaultDesc: 'Proteção e patência de via aérea, oxigenação adequada (Alvo SatO₂ ≥ 94%) e cabeceira mantida a 30°.', 
                  icon: <Stethoscope className="w-5 h-5 text-[#1e3a8a] pointer-events-none" /> 
                },
                { 
                  n: 'b4', 
                  defaultTitle: 'DOIS ACESSOS CALIBROSOS', 
                  defaultDesc: 'Obtenção emergencial de pelo menos dois acessos venosos periféricos de grosso calibre para infusões de fluxo.', 
                  icon: <ShieldCheck className="w-5 h-5 text-amber-500 pointer-events-none" /> 
                },
                { 
                  n: 'b5', 
                  defaultTitle: 'ANTIBIÓTICO PRECOCE', 
                  defaultDesc: 'Iniciar antibioticoterapia empírica direcionada de amplo espectro na primeira hora (tolerância de até 3h se baixa suspeita).', 
                  icon: <HeartPulse className="w-5 h-5 text-rose-500 pointer-events-none" />,
                  defaultActionLabel: '? Guia Antibióticos'
                }
              ].map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-lg flex flex-col justify-between text-center gap-3 hover:border-[#1e3a8a]/50 transition-all group relative mt-4">
                  <div className="absolute -top-3 -right-3 bg-slate-100 text-slate-400 font-bold border border-slate-200 px-2 py-0.5 rounded-xl text-[9px]">Card {i+1}</div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-xl bg-slate-100 flex items-center justify-center pointer-events-none">
                      {item.icon}
                    </div>
                    {TA(`fluxo.${item.n}.titulo`, item.defaultTitle, 'text-xs font-black text-slate-800 leading-tight uppercase tracking-wider', 2)}
                    <div className="w-full">
                      <AutoResizeTextarea
                        value={localConfig[`fluxo.${item.n}.desc`] || item.defaultDesc}
                        onChange={(e) => handleFieldChange(`fluxo.${item.n}.desc`, e.target.value)}
                        className="text-[10px] text-slate-500 leading-relaxed text-center outline-none border border-transparent hover:border-slate-300 w-full resize-none p-1 rounded-sm bg-transparent focus:bg-slate-50 transition-all font-sans block"
                        placeholder="Descrição detalhada..."
                      />
                    </div>
                  </div>
                  {item.defaultActionLabel && (
                    <div className="w-full mt-2">
                       <AutoResizeTextarea
                          value={localConfig[`fluxo.${item.n}.btn`] || item.defaultActionLabel}
                          onChange={(e) => handleFieldChange(`fluxo.${item.n}.btn`, e.target.value)}
                          className="text-[9px] bg-slate-900 text-white rounded-lg py-1.5 px-3 font-bold uppercase tracking-wider hover:bg-slate-800 text-center w-full outline-none resize-none block"
                          rows={1}
                       />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="w-[3px] h-12 bg-slate-200 my-4" />

            {/* 6. Volume Fluid Expansion */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-[24px] w-full max-w-3xl text-center shadow-inner hover:bg-slate-100/80 transition-all flex flex-col gap-2 relative">
              {T('fluxo.vol.sup', 'Conduta de Ressuscitação Inicial', 'text-[9px] uppercase font-black text-emerald-600 tracking-widest block text-center')}
              {T('fluxo.vol.tit', 'EXPANSÃO VOLÊMICA DE RESGATE', 'text-base font-black text-slate-800 block text-center')}
              <div className="max-w-xl mx-auto w-full">
                <AutoResizeTextarea
                  value={localConfig['fluxo.vol.desc'] || 'Recomendado realizar 30 mL por kg em no máximo 3 horas. Priorize sempre a total individualização do paciente de acordo com o contexto circulatório. Soro de escolha: Ringer Lactato (exceto se houver TCE concomitante).'}
                  onChange={(e) => handleFieldChange('fluxo.vol.desc', e.target.value)}
                  className="w-full text-xs text-slate-600 text-center bg-transparent border border-dashed border-transparent hover:border-slate-350 focus:border-slate-500 focus:bg-white transition-all resize-none outline-none leading-relaxed block overflow-hidden"
                  rows={4}
                />
              </div>
              <div className="flex flex-wrap gap-4 justify-center items-center mt-3 pt-3 border-t border-slate-200/50">
                <div className="flex items-center gap-2">
                  <AutoResizeTextarea
                    value={localConfig['fluxo.vol.peso.lbl'] || "Peso do Paciente:"}
                    onChange={(e) => handleFieldChange('fluxo.vol.peso.lbl', e.target.value)}
                    className="w-32 text-xs font-bold text-slate-500 bg-transparent text-right outline-none border-b border-dashed border-transparent hover:border-slate-300 resize-none block overflow-hidden"
                    rows={1}
                  />
                  <input 
                    type="number" 
                    value="70" 
                    disabled
                    className="w-16 p-1.5 text-center font-bold border border-slate-200 rounded-lg text-slate-800 text-xs bg-white/50 cursor-not-allowed"
                  />
                  <span className="text-xs font-bold text-slate-400">kg</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-xs font-black text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  {T('fluxo.vol.calc', 'Total Indicado: 2100 mL de Ringer Lactato', 'bg-transparent border-none w-64 text-[#1e3a8a] block text-center')}
                </span>
              </div>
            </div>

            <div className="w-[2px] h-8 bg-slate-200" />

            {/* 7. Persistent Hypotension Evaluation Diagram */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl relative">
              <div className="flex-1 flex flex-col items-center">
                <div className="p-6 rounded-[24px] border-2 border-red-200 bg-red-50/40 hover:bg-red-50/80 text-slate-800 text-center w-80 shadow-md transition-all">
                  {T('fluxo.choque.sup', 'Investigação Pós-Fase Volêmica', 'text-[9px] uppercase font-bold text-red-600 w-full block text-center')}
                  {T('fluxo.choque.tit', 'Mantém PAM < 65 mmHg e Lactato > 2 mmol/L?', 'text-sm font-black text-slate-850 mt-0.5 w-full block text-center')}
                  {T('fluxo.choque.sub', 'Mesmo em vigência de expansão adequada?', 'text-[10px] text-[#1e3a8a] mt-1 font-bold w-full block text-center')}
                </div>
              </div>

              {/* Hypotension precoce balloon */}
              <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl text-left max-w-sm text-[11px] font-medium text-blue-800 shadow-sm flex gap-2 overflow-hidden flex-1 shrink-0">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 pointer-events-none" />
                <div className="w-full">
                  <AutoResizeTextarea
                    value={localConfig['fluxo.choque.balloon'] || 'Dica de Prontidão: Pode-se considerar e prescrever o início precoce de Noradrenalina, ainda durante a expansão volêmica de resgate, especialmente se a PA diastólica estiver < 40 mmHg.'}
                    onChange={(e) => handleFieldChange('fluxo.choque.balloon', e.target.value)}
                    className="w-full bg-transparent outline-none border border-dashed border-transparent hover:border-blue-300 focus:border-blue-400 focus:bg-white/50 transition-all resize-none text-[11px] font-medium text-blue-800 leading-snug break-words block"
                  />
                </div>
              </div>
            </div>

            <div className="w-[2px] h-8 bg-slate-200" />

            {/* YES-NO Pathways */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl my-2">
              <div className="bg-emerald-50 border border-emerald-100 rounded-[20px] p-5 text-center shadow-sm">
                {T('fluxo.choque.no.sup', 'NÃO (Estabilizado)', 'text-[10px] font-black uppercase text-emerald-700 block text-center')}
                {T('fluxo.choque.no.tit', 'Internação e Seguir Cuidados', 'text-xs font-black text-emerald-950 uppercase mt-1 block text-center')}
                <div className="w-full mt-1">
                  <AutoResizeTextarea
                    value={localConfig['fluxo.choque.no.desc'] || 'Pacientes restaurados com êxito. Conduzir internação formal na enfermaria ou unidade de AVC/Especializada.'}
                    onChange={(e) => handleFieldChange('fluxo.choque.no.desc', e.target.value)}
                    className="w-full text-[10px] text-emerald-800 text-center bg-transparent border-b border-dashed border-transparent hover:border-emerald-300 focus:border-emerald-500 focus:bg-white transition-all resize-none outline-none leading-snug block overflow-hidden"
                    rows={2}
                  />
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-[20px] p-5 text-center shadow-sm flex flex-col justify-between">
                <div>
                  {T('fluxo.choque.yes.sup', 'SIM (Choque Persistente)', 'text-[10px] font-black uppercase text-red-700 block text-center')}
                  {T('fluxo.choque.yes.tit', 'Iniciar Noradrenalina Imediata', 'text-xs font-black text-red-950 uppercase mt-1 block text-center')}
                  <div className="w-full mt-1">
                    <AutoResizeTextarea
                      value={localConfig['fluxo.choque.yes.desc'] || 'Uso aceitável em veia periférica proximal calibrosa por curto período com vigilância estrita e contínua.'}
                      onChange={(e) => handleFieldChange('fluxo.choque.yes.desc', e.target.value)}
                      className="w-full text-[10px] text-red-800 text-center bg-transparent border-b border-dashed border-transparent hover:border-red-300 focus:border-red-500 focus:bg-white transition-all resize-none outline-none leading-snug block overflow-hidden"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="mt-3 py-2 bg-red-650 text-white bg-red-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                  {T('fluxo.choque.yes.btn', 'Conduzir Choque Séptico →', 'bg-transparent text-white w-full text-center outline-none placeholder:text-white')}
                </div>
              </div>
            </div>

            <div className="w-[2px] h-8 bg-slate-200" />

            {/* 8. Chocolate Septic Area */}
            <div className="bg-slate-950 text-white p-6 rounded-[32px] w-full max-w-2xl text-center shadow-2xl border border-red-500/20">
              {T('fluxo.chq.tit', 'CHOQUE SÉPTICO 🔴', 'text-xl font-black tracking-widest uppercase text-red-500 block text-center w-full bg-transparent')}
              {T('fluxo.chq.sub', 'Ações urgentes na hipotensão persistente e assistida', 'text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-wider block text-center w-full bg-transparent')}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4 border-t border-white/5 mt-4">
                <div className="p-3 bg-white/5 rounded-xl text-center flex flex-col justify-start">
                  {T('fluxo.chq.c1.t', '1. CORTICOTERAPIA', 'text-[9px] font-black text-red-300 uppercase block text-center w-full bg-transparent')}
                  <AutoResizeTextarea
                    value={localConfig['fluxo.chq.c1.d'] || 'Prescrever Hidrocortisona 200 mg/dia fracionada se choque refratário.'}
                    onChange={(e) => handleFieldChange('fluxo.chq.c1.d', e.target.value)}
                    className="w-full text-[10px] text-slate-250 text-center bg-transparent border-b border-dashed border-transparent hover:border-slate-600 focus:border-slate-500 focus:bg-white/10 outline-none resize-none mt-1 transition-all block overflow-hidden"
                    rows={4}
                  />
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-center flex flex-col justify-start">
                  {T('fluxo.chq.c2.t', '2. VASOPRESSINA', 'text-[9px] font-black text-red-300 uppercase block text-center w-full bg-transparent')}
                  <AutoResizeTextarea
                    value={localConfig['fluxo.chq.c2.d'] || 'Associar dose fixa se rate de Noradrenalina atingir > 0,25 a 0,5 mcg/kg/min.'}
                    onChange={(e) => handleFieldChange('fluxo.chq.c2.d', e.target.value)}
                    className="w-full text-[10px] text-slate-250 text-center bg-transparent border-b border-dashed border-transparent hover:border-slate-600 focus:border-slate-500 focus:bg-white/10 outline-none resize-none mt-1 transition-all block overflow-hidden"
                    rows={3}
                  />
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-center flex flex-col justify-start">
                  {T('fluxo.chq.c3.t', '3. VAGA UTI', 'text-[9px] font-black text-red-300 uppercase block text-center w-full bg-transparent')}
                  <AutoResizeTextarea
                    value={localConfig['fluxo.chq.c3.d'] || 'Transferência emergencial prioritária para retaguarda em UTI / CTI Adulto.'}
                    onChange={(e) => handleFieldChange('fluxo.chq.c3.d', e.target.value)}
                    className="w-full text-[10px] text-slate-250 text-center bg-transparent border-b border-dashed border-transparent hover:border-slate-600 focus:border-slate-500 focus:bg-white/10 outline-none resize-none mt-1 transition-all block overflow-hidden"
                    rows={3}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
        
       </div>
    </div>
  );
};
