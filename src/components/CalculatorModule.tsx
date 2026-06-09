import React, { useState } from 'react';
import { Calculator, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export const CalculatorModule = ({ onBack }: { onBack: () => void }) => {
  const [peso, setPeso] = useState<string>('70');
  
  const [medications, setMedications] = useState([
    {
      id: 'nora',
      nome: 'NORADRENALINA',
      apresentacaoMgMl: 1,
      volumeAmpola: 4,
      quantidadeAmpolas: 4,
      diluicao: 'SG 5%',
      volumeFinal: 250,
      vazaoBIC: 10,
    },
    {
      id: 'dobuta',
      nome: 'DOBUTAMINA',
      apresentacaoMgMl: 12.5,
      volumeAmpola: 20,
      quantidadeAmpolas: 1,
      diluicao: 'SF 0,9%',
      volumeFinal: 250,
      vazaoBIC: 10,
    },
    {
      id: 'dopamina',
      nome: 'DOPAMINA',
      apresentacaoMgMl: 5,
      volumeAmpola: 10,
      quantidadeAmpolas: 5,
      diluicao: 'SF 0,9%',
      volumeFinal: 250,
      vazaoBIC: 10,
    }
  ]);

  const addRow = () => {
    setMedications([...medications, {
      id: 'med-' + Date.now().toString(),
      nome: 'NOVA DROGA',
      apresentacaoMgMl: 1,
      volumeAmpola: 10,
      quantidadeAmpolas: 1,
      diluicao: 'SF 0,9%',
      volumeFinal: 100,
      vazaoBIC: 5,
    }]);
  };

  const updateMed = (id: string, field: string, value: any) => {
    setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  
  const removeMed = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const pesoNum = parseFloat(peso) || 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
         
         <div className="flex items-center justify-between mb-8">
           <div className="space-y-4">
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-inner">
                   <Calculator className="w-6 h-6 text-emerald-600" />
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                    VASOPRESSORES — CÁLCULO AUTOMATIZADO
                 </h2>
             </div>
             <p className="text-slate-500 font-medium">Ajuste os parâmetros de diluição, ampolas e vazão para obter a dose exata em tempo real.</p>
           </div>
         </div>

         {/* GLOBAL INPUTS */}
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-12 items-start md:items-center">
            <div className="flex flex-col gap-2 relative">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Peso do Paciente (kg)</label>
               <input 
                 type="number" 
                 value={peso} 
                 onChange={(e) => setPeso(e.target.value)}
                 className="w-48 text-5xl font-black text-emerald-600 border-b-4 border-emerald-200 focus:border-emerald-600 outline-none pb-2 transition-colors bg-transparent pt-2"
                 placeholder="0.0"
                 step="0.1"
               />
            </div>
            
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 flex-1 flex items-start gap-4">
               <div>
                 <p className="text-sm font-black uppercase tracking-widest mb-1">Importante</p>
                 <p className="text-xs font-bold opacity-80 leading-relaxed">Este módulo é uma ferramenta de apoio. Os resultados devem sempre ser validados pelo julgamento clínico do profissional responsável, observando as evidências de cada paciente e as diretrizes institucionais vigentes.</p>
               </div>
            </div>
         </div>

         {/* CALCULATOR TABLE */}
         <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
            <div className="w-full overflow-x-auto">
               <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                 <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-widest">
                   <tr>
                     <th className="p-4 px-6 min-w-[200px]">1. Nome da Medicação</th>
                     <th className="p-4">2. Apres. (mg/mL)</th>
                     <th className="p-4">3. Vol. Amp (mL)</th>
                     <th className="p-4 w-28 bg-emerald-50/50">4. Ampolas</th>
                     <th className="p-4 bg-emerald-50/50">5. Diluição</th>
                     <th className="p-4 w-28 bg-emerald-50/50">6. Vol. Final (mL)</th>
                     <th className="p-4 w-32 border-l border-slate-100">7. Conc. (mcg/mL)</th>
                     <th className="p-4 w-28 bg-emerald-50/50">8. Vazão (mL/h)</th>
                     <th className="p-4 w-40 bg-slate-900 text-emerald-400">9. Dose final</th>
                     <th className="p-4 bg-slate-900"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm">
                    {medications.map((med, idx) => {
                      const totalMg = med.quantidadeAmpolas * med.volumeAmpola * med.apresentacaoMgMl;
                      const totalMcg = totalMg * 1000;
                      
                      let concFinal = 0;
                      if (med.volumeFinal > 0) {
                        concFinal = totalMcg / med.volumeFinal;
                      }

                      let doseTotal = 0;
                      if (pesoNum > 0 && med.volumeFinal > 0 && med.quantidadeAmpolas > 0) {
                        doseTotal = (concFinal * med.vazaoBIC) / (pesoNum * 60);
                      }

                      return (
                        <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="p-4 px-6">
                              <input 
                                type="text"
                                value={med.nome}
                                onChange={(e) => updateMed(med.id, 'nome', e.target.value)}
                                className="font-black text-slate-800 uppercase tracking-tight bg-transparent focus:bg-white focus:ring-2 ring-slate-200 outline-none w-full px-3 py-1.5 rounded transition-all"
                              />
                           </td>
                           <td className="p-4">
                              <input 
                                type="number" 
                                step="any"
                                value={med.apresentacaoMgMl}
                                onChange={(e) => updateMed(med.id, 'apresentacaoMgMl', parseFloat(e.target.value) || 0)}
                                className="font-bold text-slate-600 bg-transparent focus:bg-white border border-transparent focus:border-slate-200 outline-none w-20 px-2 py-1.5 rounded transition-all text-center"
                              />
                           </td>
                           <td className="p-4">
                              <input 
                                type="number" 
                                step="any"
                                value={med.volumeAmpola}
                                onChange={(e) => updateMed(med.id, 'volumeAmpola', parseFloat(e.target.value) || 0)}
                                className="font-bold text-slate-600 bg-transparent focus:bg-white border border-transparent focus:border-slate-200 outline-none w-20 px-2 py-1.5 rounded transition-all text-center"
                              />
                           </td>
                           <td className="p-4 bg-emerald-50/20">
                             <input 
                                type="number" 
                                step="any"
                                value={med.quantidadeAmpolas}
                                onChange={(e) => updateMed(med.id, 'quantidadeAmpolas', parseFloat(e.target.value) || 0)}
                                className="w-16 p-2 bg-white border border-emerald-200 rounded-lg text-center font-black focus:border-emerald-500 focus:ring-1 ring-emerald-500 outline-none transition-all shadow-sm"
                             />
                           </td>
                           <td className="p-4 bg-emerald-50/20">
                             <select 
                               value={med.diluicao}
                               onChange={(e) => updateMed(med.id, 'diluicao', e.target.value)}
                               className="p-2 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-slate-700 outline-none min-w-[100px] focus:border-emerald-500 focus:ring-1 ring-emerald-500 shadow-sm"
                             >
                                <option value="SF 0,9%">SF 0,9%</option>
                                <option value="SG 5%">SG 5%</option>
                             </select>
                           </td>
                           <td className="p-4 bg-emerald-50/20">
                             <input 
                                type="number" 
                                step="any"
                                value={med.volumeFinal}
                                onChange={(e) => updateMed(med.id, 'volumeFinal', parseFloat(e.target.value) || 0)}
                                className="w-20 p-2 bg-white border border-emerald-200 rounded-lg text-center font-bold focus:border-emerald-500 focus:ring-1 ring-emerald-500 outline-none transition-all shadow-sm"
                             />
                           </td>
                           <td className="p-4 border-l border-slate-100 font-mono font-bold text-slate-500 bg-slate-50/50">
                             {med.quantidadeAmpolas > 0 ? concFinal.toFixed(1) : '0.0'}
                           </td>
                           <td className="p-4 bg-emerald-50/20">
                             <input 
                                type="number" 
                                step="any"
                                value={med.vazaoBIC}
                                onChange={(e) => updateMed(med.id, 'vazaoBIC', parseFloat(e.target.value) || 0)}
                                className="w-20 p-2 bg-emerald-100 border border-emerald-300 rounded-lg text-center font-black text-emerald-800 focus:border-emerald-600 focus:ring-1 ring-emerald-600 outline-none transition-all shadow-sm"
                             />
                           </td>
                           <td className="p-4 bg-slate-900 border-b border-slate-800">
                             <div className="bg-emerald-500 text-white px-3 py-2.5 rounded-xl text-center shadow-md">
                                <span className="font-black text-xl tracking-tight leading-none">{(med.quantidadeAmpolas > 0 && doseTotal > 0) ? doseTotal.toFixed(3) : '0.000'}</span>
                                <span className="block text-[9px] uppercase tracking-widest opacity-90 mt-1">mcg/kg/min</span>
                             </div>
                           </td>
                           <td className="p-4 bg-slate-900 border-b border-slate-800 text-right pr-6">
                              <button 
                                onClick={() => removeMed(med.id)}
                                className="p-2 bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-500 rounded-lg transition-colors border border-slate-700 hover:border-transparent opacity-0 group-hover:opacity-100"
                                title="Remover"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      );
                    })}
                 </tbody>
               </table>
            </div>
            
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end px-6">
               <button 
                 onClick={addRow}
                 className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-emerald-500 hover:text-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
               >
                 <Plus className="w-4 h-4" />
                 Adicionar Medicação
               </button>
            </div>
         </div>
          {/* BOLUS MEDICATIONS (INTUBATION/SEDATION) */}
          <div className="mt-12 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col">
             <div className="p-8 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                    Drogas em Bolus — Intubação / Sedação
                  </h3>
                  <p className="text-slate-500 font-medium">Valores calculados em bolus baseados no peso atual ({pesoNum || 0} kg).</p>
                </div>
             </div>
             
             <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {/* PRÉ-MEDICAÇÃO */}
                 <div>
                   <h4 className="text-sm font-black text-slate-400 border-b border-slate-200 pb-2 mb-4">1. PRÉ-MEDICAÇÃO</h4>
                   <div className="space-y-4">
                     {/* Lidocaína */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <div className="font-bold text-slate-800">Lidocaína 2%</div>
                           <div className="text-[10px] text-slate-500 uppercase">20 mg/mL • 1,5 mg/kg</div>
                           <div className="text-[10px] text-purple-600 mt-1">* Reduz a incidência de laringoespasmo</div>
                         </div>
                       </div>
                       <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                         <div className="text-xs font-bold text-slate-500">Dose Total: <span className="text-slate-800">{(pesoNum * 1.5).toFixed(1)} mg</span></div>
                         <div className="text-sm font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                           {pesoNum > 0 ? ((pesoNum * 1.5) / 20).toFixed(1) : '0.0'} mL
                         </div>
                       </div>
                     </div>
                     {/* Fentanil */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <div className="font-bold text-slate-800">Fentanil</div>
                           <div className="text-[10px] text-slate-500 uppercase">50 mcg/mL • 2 mcg/kg</div>
                         </div>
                       </div>
                       <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                         <div className="text-xs font-bold text-slate-500">Dose Total: <span className="text-slate-800">{(pesoNum * 2).toFixed(1)} mcg</span></div>
                         <div className="text-sm font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                           {pesoNum > 0 ? ((pesoNum * 2) / 50).toFixed(1) : '0.0'} mL
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* INDUÇÃO / SEDAÇÃO */}
                 <div>
                   <h4 className="text-sm font-black text-slate-400 border-b border-slate-200 pb-2 mb-4">2. INDUÇÃO / SEDAÇÃO</h4>
                   <div className="space-y-4">
                     {[
                       { name: 'Cetamina', conc: 50, dose: 2 },
                       { name: 'Etomidato', conc: 2, dose: 0.3 },
                       { name: 'Midazolam', conc: 5, dose: 0.15 },
                       { name: 'Propofol 1%', conc: 10, dose: 1.5 },
                       { name: 'Propofol 2%', conc: 20, dose: 1.5 },
                     ].map(med => (
                       <div key={med.name} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <div className="font-bold text-slate-800">{med.name}</div>
                             <div className="text-[10px] text-slate-500 uppercase">{med.conc} mg/mL • {med.dose.toString().replace('.', ',')} mg/kg</div>
                           </div>
                         </div>
                         <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                           <div className="text-xs font-bold text-slate-500">Dose Total: <span className="text-slate-800">{(pesoNum * med.dose).toFixed(1)} mg</span></div>
                           <div className="text-sm font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                             {pesoNum > 0 ? ((pesoNum * med.dose) / med.conc).toFixed(1) : '0.0'} mL
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* BLOQUEIO NEUROMUSCULAR */}
                 <div>
                   <h4 className="text-sm font-black text-slate-400 border-b border-slate-200 pb-2 mb-1">3. BLOQUEIO NEUROMUSCULAR</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">* Ordem de preferência</p>
                   <div className="space-y-4">
                     {[
                       { name: 'Succinilcolina', conc: 10, dose: 1, note: 'Liofilizado 100mg -> Diluir 1 FR + 10 mL AD' },
                       { name: 'Atracúrio', conc: 5, dose: 0.5, note: 'Ampola 50mg/5mL -> Diluir 5 mL + 5 mL AD' },
                       { name: 'Rocurônio', conc: 10, dose: 1.2 },
                       { name: 'Cisatracúrio', conc: 2, dose: 0.2 },
                       { name: 'Pancurônio', conc: 2, dose: 0.08 },
                     ].map(med => (
                       <div key={med.name} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <div className="flex justify-between items-start mb-2">
                           <div>
                             <div className="font-bold text-slate-800">{med.name}</div>
                             <div className="text-[10px] text-slate-500 uppercase">{med.conc} mg/mL • {med.dose.toString().replace('.', ',')} mg/kg</div>
                             {med.note && <div className="text-[10px] text-rose-600 mt-1 font-medium">{med.note}</div>}
                           </div>
                         </div>
                         <div className="mt-3 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                           <div className="text-xs font-bold text-slate-500">Dose Total: <span className="text-slate-800">{(pesoNum * med.dose).toFixed(1)} mg</span></div>
                           <div className="text-sm font-black text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                             {pesoNum > 0 ? ((pesoNum * med.dose) / med.conc).toFixed(1) : '0.0'} mL
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          </div>
    </div>
  );
};
