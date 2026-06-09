
export interface DecisionInput {
  timeSinceOnset: number; // em horas
  nihss: number;
  ctResult: 'Isquêmico' | 'Hemorrágico' | 'Normal';
  pas: number;
  pad: number;
  glucose: number;
  age: number;
  anticoagulant: boolean;
}

export interface DecisionOutput {
  conduct: string;
  alerts: string[];
  nextStep: string;
  isThrombolysisCandidate: boolean;
  contraindicationsChecklist?: string[];
}

export const runDecisionEngine = (input: DecisionInput): DecisionOutput => {
  const { timeSinceOnset, nihss, ctResult, pas, pad, glucose, age, anticoagulant } = input;
  const alerts: string[] = [];
  let conduct = '';
  let nextStep = '';
  let isThrombolysisCandidate = false;

  if (ctResult === 'Hemorrágico') {
    conduct = 'Manejo de AVC Hemorrágico';
    alerts.push('Interromper fluxo de AVC isquêmico imediatamente.');
    alerts.push('Controle rigoroso de PA (Alvo PAS 140-160 mmHg).');
    alerts.push('Avaliação urgente da Neurocirurgia.');
    nextStep = 'Internação imediata em UTI';
    return { conduct, alerts, nextStep, isThrombolysisCandidate };
  }

  // AVC Isquêmico ou Normal
  if (timeSinceOnset <= 4.5) {
    if (nihss >= 4) {
      const bpOk = pas < 185 && pad < 110;
      const glucoseOk = glucose >= 50 && glucose <= 400;

      if (bpOk && glucoseOk) {
        conduct = 'SUGERIR TROMBÓLISE (Alteplase/Tenecteplase)';
        isThrombolysisCandidate = true;
        nextStep = 'Iniciar Trombólise e monitorar NIHSS/PA a cada 15 min';
        
        if (anticoagulant) {
          alerts.push('ALERTA: Uso de anticoagulante identificado. Avaliar tempo de última dose e testes de coagulação.');
        }
      } else {
        conduct = 'Elegível por tempo/NIHSS, mas com contraindicações clínicas atuais.';
        if (!bpOk) {
          alerts.push('ALERTA: Necessário controle pressórico (PAS < 185 e PAD < 110) antes de trombólise.');
          nextStep = 'Administrar anti-hipertensivo (Esmolol/Labetalol) e reavaliar PA.';
        }
        if (!glucoseOk) {
          alerts.push('ALERTA: Corrigir glicemia (Alvo 50-400 mg/dL) antes de trombólise.');
          nextStep = 'Corrigir distúrbio glicêmico urgente.';
        }
      }
    } else {
      conduct = 'AVC Isquêmico Menor (NIHSS < 4)';
      alerts.push('Sintomas leves. Avaliar se há déficit incapacitante individual.');
      nextStep = 'Avaliação neurológica detalhada / Conduta conservadora';
    }
  } else {
    // tempo > 4.5h
    conduct = 'Fora da janela de Trombólise (> 4.5h)';
    alerts.push('Janela de trombólise venosa expirada.');
    
    if (timeSinceOnset <= 24) {
      alerts.push('Paciente em janela para Trombectomia Mecânica (até 24h).');
      nextStep = 'Avaliar critérios para trombectomia e sugerir transferência para centro de referência.';
    } else {
      nextStep = 'Internação para investigação etiológica e prevenção secundária.';
    }
  }

  return { 
    conduct, 
    alerts, 
    nextStep, 
    isThrombolysisCandidate,
    contraindicationsChecklist: isThrombolysisCandidate ? [
      'AVC isquêmico ou TCE grave nos últimos 3 meses',
      'Hemorragia intracraniana prévia',
      'Neoplasia intracraniana, malformação AV ou aneurisma',
      'Cirurgia intra-espinal ou intracraniana recente',
      'Plaquetas < 100.000',
      'INR > 1.7 ou TP > 15s',
      'Uso de DOACs nas últimas 48h'
    ] : undefined
  };
};
