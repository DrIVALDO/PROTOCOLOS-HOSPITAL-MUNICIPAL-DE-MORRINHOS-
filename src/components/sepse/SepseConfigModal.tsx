import React, { useState, useEffect } from 'react';
import { X, Check, Save, RotateCcw, AlertCircle, RefreshCw, LayoutTemplate } from 'lucide-react';
import { ConfigDict, CheckItem, PatientField } from './sepseTypes';
import { EditableFicha } from './EditableFicha';
import { EditablePop } from './EditablePop';
import { EditableFluxo } from './EditableFluxo';

interface SepseConfigModalProps {
  initialConfig: ConfigDict;
  initialChecklists: { pacote: CheckItem[]; cuidados: CheckItem[] };
  initialSectionOrder: string[];
  initialLogos: { [key: string]: string | null };
  currentPassword: string;
  onClose: () => void;
  onSave: (
    newConfig: ConfigDict,
    newChecklists: { pacote: CheckItem[]; cuidados: CheckItem[] },
    newSectionOrder: string[],
    newLogos: { [key: string]: string | null },
    newPassword?: string,
    newPatientFields?: PatientField[]
  ) => void;
  targetTab?: 'Sepse-POP' | 'Sepse-Ficha' | 'Sepse-Fluxo';
  initialPatientFields?: PatientField[];
}

export const SepseConfigModal = ({
  initialConfig,
  initialChecklists,
  initialSectionOrder,
  initialLogos,
  onClose,
  onSave,
  targetTab = 'Sepse-Ficha',
  initialPatientFields = []
}: SepseConfigModalProps) => {

  const [localConfig, setLocalConfig] = useState<ConfigDict>({ ...initialConfig });
  const [localChecklists, setLocalChecklists] = useState({
    pacote: initialChecklists?.pacote || [],
    cuidados: initialChecklists?.cuidados || []
  });
  const [localPatientFields, setLocalPatientFields] = useState<PatientField[]>([...initialPatientFields]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(true); // Forcing true whenever any of these states change for the UI requirement
  }, [localConfig, localChecklists, localPatientFields]);

  const handleFieldChange = (key: string, val: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const activeThemeColor = localConfig['_cor'] || '#185fa5';

  return (
    <div id="cfg-overlay" className="fixed inset-0 bg-slate-100 z-[999] flex flex-col overflow-hidden">
      
      {/* HEADER PRINCIPAL */}
      <div className="h-14 shrink-0 bg-[#0f172a] text-white flex items-center justify-between px-6 shadow border-b border-slate-800 z-20 w-full relative">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/30 p-1.5 rounded-lg border border-blue-500/50">
            <LayoutTemplate className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-100">
              Builder Visual / Admin <span className="text-[9px] py-0.5 px-2 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30 font-mono">Modo Raiz</span>
            </h2>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono select-none">
          Espelho Atual: <strong className="text-white ml-2">{targetTab}</strong>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative bg-slate-50">
         <div className="absolute top-4 right-4 bg-white/80 backdrop-blur text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-slate-500 z-50 flex items-center gap-2 pointer-events-none">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           Live Edit Mode
         </div>
         
         <div className="w-full min-h-full">
            {targetTab === 'Sepse-Ficha' && (
              <EditableFicha 
                localConfig={localConfig} 
                handleFieldChange={handleFieldChange} 
                localLogos={initialLogos} 
                activeThemeColor={activeThemeColor} 
                localPatientFields={localPatientFields} 
                setLocalPatientFields={setLocalPatientFields} 
                localChecklists={localChecklists}
                setLocalChecklists={setLocalChecklists}
              />
            )}
            {targetTab === 'Sepse-POP' && (
              <EditablePop 
                localConfig={localConfig} 
                handleFieldChange={handleFieldChange} 
                localChecklists={localChecklists} 
                setLocalChecklists={setLocalChecklists} 
                localLogos={initialLogos}
              />
            )}
            {targetTab === 'Sepse-Fluxo' && (
              <EditableFluxo 
                localConfig={localConfig} 
                handleFieldChange={handleFieldChange} 
                activeThemeColor={activeThemeColor} 
              />
            )}
         </div>
      </div>

      {/* RODAPÉ DE ALTERAÇÕES - FIXED BOTTOM BAR */}
      <div className="h-16 shrink-0 bg-white border-t border-slate-200 px-6 flex items-center justify-between shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-20">
        <div className="flex items-center gap-3">
          {hasChanges ? (
             <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
               <AlertCircle className="w-4 h-4 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">Alterações Pendentes</span>
             </div>
          ) : (
             <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
               <Check className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sincronizado</span>
             </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 text-xs font-black uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={() => {
              setLocalConfig({ ...initialConfig });
              setHasChanges(false);
            }} 
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors text-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>
          <button
            onClick={() => {
              onSave(localConfig, localChecklists, initialSectionOrder, initialLogos, undefined, localPatientFields);
              setHasChanges(false);
            }}
            disabled={!hasChanges}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center gap-2 ${hasChanges ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
      
    </div>
  );
};

