import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface MedRow {
  id: string;
  name: string;
  ap: number; // mg/mL
  vol: number; // mL
  amp: number;
  dil: string;
  finalVol: number; // mL
  vazao: string;
  dose: string;
  lastEdited: 'vazao' | 'dose';
}

const INITIAL_MEDS: MedRow[] = [
  {
    id: 'nora',
    name: 'Noradrenalina',
    ap: 1,
    vol: 4,
    amp: 4,
    dil: 'SF 0,9% ou SG 5%',
    finalVol: 250,
    vazao: '',
    dose: '',
    lastEdited: 'vazao',
  },
  {
    id: 'dobu',
    name: 'Dobutamina',
    ap: 12.5,
    vol: 20,
    amp: 2,
    dil: 'SF 0,9% ou SG 5%',
    finalVol: 250,
    vazao: '',
    dose: '',
    lastEdited: 'vazao',
  },
  {
    id: 'dopa',
    name: 'Dopamina',
    ap: 5,
    vol: 10,
    amp: 5,
    dil: 'SF 0,9% ou SG 5%',
    finalVol: 250,
    vazao: '',
    dose: '',
    lastEdited: 'vazao',
  }
];

export const VasopressorCalculator = ({ externalWeight, onWeightChange }: { externalWeight?: string, onWeightChange?: (w: string) => void }) => {
  const [localWeight, setLocalWeight] = useState<string>('70');
  
  const weight = externalWeight !== undefined ? externalWeight : localWeight;
  
  const handleSetWeight = (w: string) => {
    setLocalWeight(w);
    if (onWeightChange) onWeightChange(w);
  };
  
  const [meds, setMeds] = useState<MedRow[]>(INITIAL_MEDS);

  const calculateVariables = (med: MedRow, w: number, trigger: 'vazao' | 'dose', vValue?: string, dValue?: string): MedRow => {
    const totalMg = med.amp * med.vol * med.ap;
    const totalMcg = totalMg * 1000;
    const conc = totalMcg / med.finalVol;

    let newVazao = vValue !== undefined ? vValue : med.vazao;
    let newDose = dValue !== undefined ? dValue : med.dose;

    if (w <= 0 || conc <= 0) return { ...med, vazao: newVazao, dose: newDose, lastEdited: trigger };

    if (trigger === 'vazao') {
      const v = parseFloat(newVazao.replace(',', '.'));
      if (!isNaN(v)) {
        const d = (conc * v) / (w * 60);
        newDose = d.toFixed(3);
      } else {
        newDose = '';
      }
    } else if (trigger === 'dose') {
      const d = parseFloat(newDose.replace(',', '.'));
      if (!isNaN(d)) {
        const v = (d * w * 60) / conc;
        newVazao = v.toFixed(1);
      } else {
        newVazao = '';
      }
    }

    return { ...med, vazao: newVazao, dose: newDose, lastEdited: trigger };
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeightStr = e.target.value;
    handleSetWeight(newWeightStr);
    const w = parseFloat(newWeightStr);
    if (!isNaN(w) && w > 0) {
      setMeds(meds.map(med => calculateVariables(med, w, med.lastEdited)));
    }
  };

  // Recalculate when external component weight changes
  React.useEffect(() => {
    if (externalWeight !== undefined) {
      const w = parseFloat(externalWeight);
      if (!isNaN(w) && w > 0) {
        setMeds(prev => prev.map(med => calculateVariables(med, w, med.lastEdited)));
      }
    }
  }, [externalWeight]);

  const handleMedChange = (id: string, field: 'amp' | 'vazao' | 'dose', value: string) => {
    const w = parseFloat(weight) || 70;
    
    setMeds(prev => prev.map(med => {
      if (med.id !== id) return med;
      
      if (field === 'amp') {
        const ampVal = parseFloat(value) || 0;
        const tempMed = { ...med, amp: ampVal };
        return calculateVariables(tempMed, w, med.lastEdited);
      }
      
      if (field === 'vazao') {
        if (/^[0-9.,]*$/.test(value)) {
            return calculateVariables(med, w, 'vazao', value, med.dose);
        }
        return med;
      }
      
      if (field === 'dose') {
        if (/^[0-9.,]*$/.test(value)) {
            return calculateVariables(med, w, 'dose', med.vazao, value);
        }
        return med;
      }
      
      return med;
    }));
  };

  return (
    <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden no-print">
      <div className="p-3.5 bg-blue-100/50 border-b border-blue-100 flex items-center justify-between flex-wrap gap-3">
        <h5 className="text-[11px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          VASOPRESSORES — CÁLCULO AUTOMATIZADO
        </h5>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <label className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">Peso (kg):</label>
          <input 
            type="number" 
            value={weight} 
            onChange={handleWeightChange}
            className="w-16 text-xs font-black text-blue-700 bg-transparent outline-none text-right"
            min="0"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead className="bg-slate-100 text-slate-500 uppercase font-black text-[9px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Medicação</th>
              <th className="px-3 py-3 text-center">Apresentação</th>
              <th className="px-3 py-3 text-center">Vol. Ampola</th>
              <th className="px-3 py-3 text-center">Nº Ampolas</th>
              <th className="px-3 py-3 text-center">Diluição</th>
              <th className="px-3 py-3 text-center">Vol. Final<br/><span className="text-[8px] font-medium opacity-70">(mL)</span></th>
              <th className="px-3 py-3 bg-blue-50/50 text-blue-800 text-center border-l border-blue-100">Vazão BIC<br/><span className="text-[8px] font-medium opacity-70">(mL/h)</span></th>
              <th className="px-4 py-3 bg-blue-50/50 text-blue-800 text-center border-l border-r border-blue-100">Dose<br/><span className="text-[8px] font-medium opacity-70">(mcg/kg/min)</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meds.map(med => (
              <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3 font-bold text-slate-800">{med.name}</td>
                <td className="px-3 py-3 text-center text-slate-600 font-medium">{med.ap} mg/mL</td>
                <td className="px-3 py-3 text-center text-slate-600 font-medium">{med.vol} mL</td>
                <td className="px-3 py-3 text-center">
                  <input 
                    type="number" 
                    value={med.amp === 0 ? '' : med.amp} 
                    onChange={e => handleMedChange(med.id, 'amp', e.target.value)}
                    className="w-12 text-center border border-slate-200 bg-white rounded p-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    min="0"
                  />
                </td>
                <td className="px-3 py-3 text-center text-slate-600 font-medium">{med.dil}</td>
                <td className="px-3 py-3 text-center text-slate-600 font-medium">{med.finalVol}</td>
                <td className="px-3 py-2 bg-blue-50/30 border-l border-blue-100 text-center">
                  <input 
                    type="text" 
                    value={med.vazao} 
                    onChange={e => handleMedChange(med.id, 'vazao', e.target.value)}
                    placeholder="0.0"
                    className="w-16 text-center border border-blue-200 bg-white rounded p-1.5 text-xs font-black text-blue-800 placeholder:text-blue-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                  />
                </td>
                <td className="px-4 py-2 bg-blue-50/30 border-l border-r border-blue-100 text-center">
                  <input 
                    type="text" 
                    value={med.dose} 
                    onChange={e => handleMedChange(med.id, 'dose', e.target.value)}
                    placeholder="0.000"
                    className="w-20 text-center border border-blue-200 bg-white rounded p-1.5 text-xs font-black text-blue-800 placeholder:text-blue-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
