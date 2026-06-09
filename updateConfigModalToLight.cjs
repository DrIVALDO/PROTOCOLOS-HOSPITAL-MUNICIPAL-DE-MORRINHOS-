const fs = require('fs');
const file = 'src/components/sepse/SepseConfigModal.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Remove the dark theme wrapper and update header
// Find lines 371 to 481, which contains the heavy dark mode layout
// and replace it with a light, simple layout matching the prototype
const startIdx = txt.indexOf('return (');
const mockFrameIdx = txt.indexOf('{/* 1. FICHA CLINICA PREVIEW MOCK */}');

if (startIdx > -1 && mockFrameIdx > -1) {
  const newHeader = `return (
    <div 
      id="cfg-overlay" 
      className="fixed inset-0 bg-slate-100/95 backdrop-blur-md z-[999] flex flex-col overflow-hidden"
    >
      {/* Header Branco Limpo */}
      <div className="h-16 shrink-0 bg-white border-b border-slate-300 flex items-center justify-between px-6 shadow-sm z-10 w-full relative">
        <div className="flex items-center gap-3">
           <div>
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-slate-800">
                Modo de Edição <span className="text-[10px] py-0.5 px-2 bg-emerald-100 text-emerald-700 rounded-full font-mono uppercase tracking-widest font-black">ADMINISTRADOR</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Altere qualquer texto e estrutura diretamente na página exata.</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(localConfig, localChecklists, localSectionOrder, localLogos, senhaNova, localPatientFields)}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black text-xs text-white uppercase tracking-widest shadow-lg transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Aplicar e Salvar Alterações
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2.5 hover:bg-rose-50 rounded-xl transition-colors text-slate-400 hover:text-rose-500 flex items-center justify-center border border-slate-200 bg-white shadow-sm"
            title="Fechar Sem Salvar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar pt-8 pb-16">
        <div className="max-w-[860px] mx-auto bg-white p-8 space-y-6 shadow-2xl border border-slate-200 rounded-lg relative min-h-[1056px] text-slate-800">
`;
  
  txt = txt.substring(0, startIdx) + newHeader + txt.substring(mockFrameIdx);
}

// 2. We need to close the tags at the bottom.
// Look for " Modal Footer actions"
const footerIdx = txt.indexOf('{/* Modal Footer actions */}');
if (footerIdx > -1) {
  const newFooter = `
        </div>
      </div>
    </div>
  );
};
`;
  // Let's find exactly the end of the return statement
  const closeReturn = txt.lastIndexOf(');', txt.lastIndexOf('};'));
  txt = txt.substring(0, footerIdx) + newFooter;
}

fs.writeFileSync(file, txt);
console.log('Done transforming to light theme');
