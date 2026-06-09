const fs = require('fs');
let txt = fs.readFileSync('pop_block.txt', 'utf8');

// Strip out the wrapper "if (activeTab === 'Sepse-POP') { return ("
txt = txt.replace(/if\s*\(activeTab\s*===\s*'Sepse-POP'\)\s*{\s*return\s*\(/g, '');
txt = txt.replace(/<div className="p-8 max-w-\[1000px\] mx-auto/g, '<div className="p-8 max-w-7xl mx-auto');

// Strip out the bottom Floating Config Button
txt = txt.substring(0, txt.indexOf('{/* Floating Config Button */}'));

// Create the wrapping component
let finalComponent = `import React from 'react';
import { ChevronRight, Filter, Download, ListChecks, ArrowRight, Printer, Check, Info } from 'lucide-react';
import { ConfigDict, CheckItem } from './sepseTypes';

export const EditablePop = ({ localConfig, handleFieldChange, localChecklists, setLocalChecklists }: any) => {
  const newsScore = 4;
  const sofaScore = 2;

  // Helper macro for inputs
  const T = (key: string, _default: string, additionalClasses?: string) => (
    <input 
      type="text" 
      value={localConfig[key] || _default} 
      onChange={(e) => handleFieldChange(key, e.target.value)}
      className={\`bg-transparent outline-none w-full border-b border-dashed border-transparent hover:border-slate-350 focus:border-slate-500 focus:bg-white transition-all \${additionalClasses || ''}\`}
    />
  );
  
  return (
    <div className="max-w-[1280px] mx-auto bg-slate-50 pt-2 pb-10 space-y-5 px-6 text-[10px] font-sans text-slate-800">
       <div className="text-center space-y-2 mb-4 bg-sky-50 p-4 border border-sky-200 shadow-sm rounded-xl">
         <h2 className="text-sm font-black text-sky-700 text-center uppercase tracking-widest">Edição do Procedimento POP</h2>
         <p className="text-xs text-sky-600 font-bold">Modo Espelho: Altere os textos clicando nos títulos abaixo.</p>
       </div>
       <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-4 text-center text-xs font-bold text-slate-500">
         [Espaço Reservado para o Layout POP] - Você pode adicionar campos dinamicamente conforme necessário.
       </div>
       \n` + txt + `
    </div>
  );
};
`;

// Clean up mismatched closing div (since we cut the 'return' wrapper)
// Wait, I'll just write it manually later.
// Actually, let's just create EditablePop from scratch using a simple script.

fs.writeFileSync('g_pop.tsx', finalComponent);
