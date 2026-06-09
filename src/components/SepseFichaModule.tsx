import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, Sliders, Settings, Check, 
  Trash2, ChevronDown, ChevronUp, Printer, 
  RotateCcw, ShieldAlert, AlertTriangle, CheckSquare, Square,
  Download, ArrowUp, ArrowDown, ClipboardList
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { CheckItem, ConfigDict, PatientField } from './sepse/sepseTypes';
import { 
  INITIAL_CONFIG, 
  INITIAL_CHECKLISTS, 
  NEWS_RAW_GRID_PARAMETERS, 
  SOFA_RAW_GRID_PARAMETERS 
} from './sepse/sepseDefaultData';
import { SepseConfigModal } from './sepse/SepseConfigModal';

import { VasopressorCalculator } from './sepse/VasopressorCalculator';

export const SepseFichaModule = () => {
  // --- Persistent Configurations & Checklist states ---
  const [config, setConfig] = useState<ConfigDict>(INITIAL_CONFIG);
  const [checklists, setChecklists] = useState<{ pacote: CheckItem[]; cuidados: CheckItem[] }>(INITIAL_CHECKLISTS);
  const [sectionOrder, setSectionOrder] = useState<string[]>(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
  const [logos, setLogos] = useState<{ [key: string]: string | null }>({ '1': null, '2': null, '3': null });
  const [password, setPassword] = useState('HMM@2026');

  // Load from local storage dynamically on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('hmm_sepse_v2_cfg');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis configuration:", e);
    }

    try {
      const savedChecklists = localStorage.getItem('hmm_sepse_v4_chk');
      if (savedChecklists) {
        const parsed = JSON.parse(savedChecklists);
        setChecklists({
          pacote: parsed?.pacote || INITIAL_CHECKLISTS.pacote,
          cuidados: parsed?.cuidados || INITIAL_CHECKLISTS.cuidados
        });
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis checklists:", e);
    }

    try {
      const savedSecOrder = localStorage.getItem('hmm_sepse_v3_secorder');
      if (savedSecOrder) {
        const parsed = JSON.parse(savedSecOrder);
        if (Array.isArray(parsed) && parsed.length >= 7) {
          setSectionOrder(parsed);
        } else {
          setSectionOrder(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
        }
      } else {
        setSectionOrder(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis section orders:", e);
      setSectionOrder(['s3', 's1', 's2', 's4', 's5', 's6', 's7']);
    }

    try {
      const savedLogos = localStorage.getItem('hmm_sepse_pop_logos');
      if (savedLogos) {
        setLogos(JSON.parse(savedLogos));
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis POP logos:", e);
    }

    const savedPassword = localStorage.getItem('hmm_sepse_v2_senha');
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // --- Patient Metadata State (Dados do Atendimento) ---
  const [patientFields, setPatientFields] = useState<PatientField[]>(() => {
    try {
      const saved = localStorage.getItem('hmm_sepse_patient_fields');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed parsing patient fields:", e);
    }
    return [
      { id: 'nome', label: 'Nome do Paciente', placeholder: 'Nome Completo', type: 'text', visible: true },
      { id: 'mae', label: 'Nome da Mãe do Paciente', placeholder: 'Ex: Nome da Mãe', type: 'text', visible: true },
      { id: 'peso', label: 'Peso Estimado (kg)', placeholder: 'Ex: 70', type: 'number', visible: true },
      { id: 'nascimento', label: 'Data de Nascimento', placeholder: 'DD/MM/AAAA', type: 'text', mask: 'date', visible: true },
      { id: 'leito', label: 'Leito', placeholder: 'Ex: BOX 01', type: 'text', visible: true },
      { id: 'setor', label: 'Setor', placeholder: 'Ex: EMERGÊNCIA', type: 'text', visible: true },
      { id: 'cid', label: 'CID / Hipótese Diagnóstica', placeholder: 'Ex: A41.9', type: 'text', visible: true },
      { id: 'medico', label: 'Médico Responsável', placeholder: 'Ex: Nome do médico', type: 'text', visible: true },
      { id: 'crm', label: 'CRM - Médico Responsável', placeholder: 'Ex: 12345/GO', type: 'text', visible: true },
      { id: 'data', label: 'Data', placeholder: 'DD/MM/AAAA', type: 'text', mask: 'date', visible: true },
      { id: 'hora', label: 'Hora', placeholder: 'HH:MM', type: 'text', mask: 'time', visible: true }
    ];
  });

  const [patientResponses, setPatientResponses] = useState<{ [key: string]: string }>(() => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
    const defaultTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    return {
      data: defaultDate,
      hora: defaultTime
    };
  });

  const patientName = patientResponses['nome'] || '';
  const patientWeight = patientResponses['peso'] || '';
  const dob = patientResponses['nascimento'] || '';
  const bed = patientResponses['leito'] || '';
  const sector = patientResponses['setor'] || '';
  const cid = patientResponses['cid'] || '';
  const doctor = patientResponses['medico'] || '';
  const doctorCrm = patientResponses['crm'] || '';
  const currentDate = patientResponses['data'] || '';
  const currentTime = patientResponses['hora'] || '';

  const setPatientWeight = (val: string) => {
    setPatientResponses(prev => ({ ...prev, peso: val }));
  };

  // --- Dynamic Parameter values ---
  const [newsAnswers, setNewsAnswers] = useState<{ [key: string]: number | null }>({
    fr: null,
    sat: null,
    o2: null,
    temp: null,
    pas: null,
    fc: null,
    nc: null,
  });

  const [sofaAnswers, setSofaAnswers] = useState<{ [key: string]: number | null }>({
    resp: null,
    plaq: null,
    bili: null,
    cv: null,
    glas: null,
    ren: null,
  });

  // Checklist Checked items
  const [checkedPacote, setCheckedPacote] = useState<boolean[]>([]);
  const [checkedCuidados, setCheckedCuidados] = useState<boolean[]>([]);

  // On list changes, synchronize the checked checks arrays to match length
  useEffect(() => {
    if (checklists.pacote) {
      setCheckedPacote(prev => {
        const arr = [...prev];
        while (arr.length < checklists.pacote.length) arr.push(false);
        return arr.slice(0, checklists.pacote.length);
      });
    }
  }, [checklists.pacote]);

  useEffect(() => {
    if (checklists.cuidados) {
      setCheckedCuidados(prev => {
        const arr = [...prev];
        while (arr.length < checklists.cuidados.length) arr.push(false);
        return arr.slice(0, checklists.cuidados.length);
      });
    }
  }, [checklists.cuidados]);

  // --- Extended guideline card items ---
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSelectNews = (paramId: string, value: number) => {
    setNewsAnswers(prev => ({ ...prev, [paramId]: value }));
    // Auto collapse after select for clean flow
    setTimeout(() => {
      setExpandedItems(prev => ({ ...prev, [`news-${paramId}`]: false }));
    }, 200);
  };

  const handleSelectSofa = (paramId: string, value: number) => {
    setSofaAnswers(prev => ({ ...prev, [paramId]: value }));
    setTimeout(() => {
      setExpandedItems(prev => ({ ...prev, [`sofa-${paramId}`]: false }));
    }, 200);
  };

  const handleClearNewsItem = (paramId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewsAnswers(prev => ({ ...prev, [paramId]: null }));
  };

  const handleClearSofaItem = (paramId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSofaAnswers(prev => ({ ...prev, [paramId]: null }));
  };

  const handleResetScores = () => {
    if (confirm('Deseja realmente limpar todas as marcações de triagem estimadas?')) {
      setNewsAnswers({ fr: null, sat: null, o2: null, temp: null, pas: null, fc: null, nc: null });
      setSofaAnswers({ resp: null, plaq: null, bili: null, cv: null, glas: null, ren: null });
      setCheckedPacote(new Array(checklists.pacote.length).fill(false));
      setCheckedCuidados(new Array(checklists.cuidados.length).fill(false));
      
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const defaultDate = `${pad(today.getDate())}/${pad(today.getMonth() + 1)}/${today.getFullYear()}`;
      const defaultTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
      setPatientResponses({
        data: defaultDate,
        hora: defaultTime
      });
    }
  };

  // --- Calculated Score totals ---
  const newsScoreResult = useMemo(() => {
    let sum = 0;
    let answeredCount = 0;
    Object.keys(newsAnswers).forEach(k => {
      if (newsAnswers[k] !== null) {
        sum += newsAnswers[k]!;
        answeredCount++;
      }
    });
    return { score: sum, answered: answeredCount };
  }, [newsAnswers]);

  const sofaScoreResult = useMemo(() => {
    let sum = 0;
    let answeredCount = 0;
    Object.keys(sofaAnswers).forEach(k => {
      if (sofaAnswers[k] !== null) {
        sum += sofaAnswers[k]!;
        answeredCount++;
      }
    });
    return { score: sum, answered: answeredCount };
  }, [sofaAnswers]);

  // Combined real-time diagnosis severity categories logic
  const derivedRiskCategory = useMemo(() => {
    if (newsScoreResult.answered === 0 && sofaScoreResult.answered === 0) {
      return 'PENDING';
    }
    const hasHighNews = newsScoreResult.score >= 4;
    const hasHighSofa = sofaScoreResult.score >= 2;

    if (hasHighNews && hasHighSofa) {
      return 'DEFINIDA'; // High risk Sepse Definida
    } else if (hasHighNews || hasHighSofa) {
      return 'PROVAVEL'; // High NEWS or High SOFA -> Probable
    } else if (newsScoreResult.score > 0 || sofaScoreResult.score > 0) {
      return 'POSSIVEL';
    } else {
      return 'IMPROVAVEL';
    }
  }, [newsScoreResult, sofaScoreResult]);

  // --- Configuration Overlay state controls ---
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleSaveConfigModal = (
    newConfig: ConfigDict,
    newChecklists: { pacote: CheckItem[]; cuidados: CheckItem[] },
    newSectionOrder: string[],
    newLogos: { [key: string]: string | null },
    newPassword?: string,
    newPatientFields?: PatientField[]
  ) => {
    // Commit to state
    setConfig(newConfig);
    setChecklists(newChecklists);
    setSectionOrder(newSectionOrder);
    setLogos(newLogos);
    if (newPatientFields) {
      setPatientFields(newPatientFields);
      localStorage.setItem('hmm_sepse_patient_fields', JSON.stringify(newPatientFields));
    }
    
    // Commit to localStorage
    localStorage.setItem('hmm_sepse_v2_cfg', JSON.stringify(newConfig));
    localStorage.setItem('hmm_sepse_v4_chk', JSON.stringify(newChecklists));
    localStorage.setItem('hmm_sepse_v3_secorder', JSON.stringify(newSectionOrder));
    localStorage.setItem('hmm_sepse_pop_logos', JSON.stringify(newLogos));
    
    if (newPassword) {
      setPassword(newPassword);
      localStorage.setItem('hmm_sepse_v2_senha', newPassword);
    }

    setIsConfigOpen(false);
  };

  // Theme color variable
  const themeColor = config['_cor'] || '#185fa5';

  const dateMaskBR = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    if (raw.length > 4) return `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    if (raw.length > 2) return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    return raw;
  };

  const timeMaskBR = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) return `${raw.slice(0, 2)}:${raw.slice(2)}`;
    return raw;
  };

  const [selectedAtb, setSelectedAtb] = useState<Record<string, boolean>>({});

  const toggleAtb = (foco: string) => {
    setSelectedAtb(prev => ({ ...prev, [foco]: !prev[foco] }));
  };

  const [selectedCorti, setSelectedCorti] = useState<Record<string, boolean>>({});
  const [selectedCortiDoses, setSelectedCortiDoses] = useState<Record<string, string>>({
    choque_hidro: '200mg/dia IV (50mg IV 6/6H)',
    choque_fludro: '50 µg/dia VO',
    sdra_dexa: '20 mg/dia IV (5d) → 10 mg/dia IV (5d)',
    sdra_metil: '1–2 mg/kg/dia IV (redução gradual)',
    pac_hidro: '200 mg IV bolus + infusão 10 mg/h (7d)',
    pac_metil: '0,5 mg/kg IV 12/12h (5–7d)'
  });

  const toggleCorti = (item: string) => {
    setSelectedCorti(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const updateCortiDose = (item: string, dose: string) => {
    setSelectedCortiDoses(prev => ({ ...prev, [item]: dose }));
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Triggering the print event
  const handlePrintTrigger = async () => {
    setIsGeneratingPdf(true);

    const originalGetComputedStyle = window.getComputedStyle;
    const styleElements = Array.from(document.querySelectorAll('style'));
    const originalStyleContentsByElement = new Map<HTMLStyleElement, string>();
    const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    const originalLinkDisabledStates = new Map<HTMLLinkElement, boolean>();
    const temporaryStyleElements: HTMLStyleElement[] = [];

    // Helper: Convert parsed oklch string to rgb/rgba
    const convertOklchToRgb = (oklchStr: string): string => {
      try {
        const matches = oklchStr.match(/oklch\s*\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/i) 
          || oklchStr.match(/oklch\s*\(\s*([\d.]+%?)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+%?))?\s*\)/i);
          
        if (!matches) {
          return 'rgb(71, 85, 105)';
        }

        const L_val = matches[1];
        const C_val = parseFloat(matches[2]);
        const H_val = parseFloat(matches[3]);
        const A_val = matches[4];

        let L = 0;
        if (L_val.endsWith('%')) {
          L = parseFloat(L_val) / 100;
        } else {
          L = parseFloat(L_val);
          if (L > 1) L = L / 100;
        }

        const C = C_val;
        const h = H_val;

        let alpha = 1;
        if (A_val) {
          if (A_val.endsWith('%')) {
            alpha = parseFloat(A_val) / 100;
          } else {
            alpha = parseFloat(A_val);
          }
        }

        const rad = (h * Math.PI) / 180;
        const a = C * Math.cos(rad);
        const b = C * Math.sin(rad);

        const l = L + 0.3963377774 * a + 0.2158037573 * b;
        const m = L - 0.1055613458 * a - 0.0638541728 * b;
        const s = L - 0.0894841775 * a - 1.2914855480 * b;

        const l3 = l * l * l;
        const m3 = m * m * m;
        const s3 = s * s * s;

        const R = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const G = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const B = -0.0041960863 * l3 - 0.7034186145 * m3 + 1.7076147010 * s3;

        const f_gamma = (c: number) => {
          c = Math.max(0, Math.min(1, c));
          return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
        };

        const r = Math.round(f_gamma(R) * 255);
        const g = Math.round(f_gamma(G) * 255);
        const b_color = Math.round(f_gamma(B) * 255);

        if (alpha < 1) {
          return `rgba(${r}, ${g}, ${b_color}, ${alpha})`;
        }
        return `rgb(${r}, ${g}, ${b_color})`;
      } catch (err) {
        return 'rgb(71, 85, 105)';
      }
    };

    // Helper: Translate all oklch values found in a block of CSS/text
    const translateAllOklchInString = (str: string): string => {
      if (!str || typeof str !== 'string' || !str.includes('oklch')) {
        return str;
      }
      return str.replace(/oklch\s*\([^)]+\)/gi, (match) => {
        return convertOklchToRgb(match);
      });
    };

    try {
      const element = document.getElementById('printable-ficha-content');
      if (!element) {
        window.print();
        return;
      }

      // 1. Intercept window.getComputedStyle so that html2canvas reads standard colors
      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop, receiver) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                if (typeof val === 'string' && val.includes('oklch')) {
                  return translateAllOklchInString(val);
                }
                return val;
              };
            }
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'string' && value.includes('oklch')) {
              return translateAllOklchInString(value);
            }
            return value;
          }
        });
      } as any;

      // 2. Sanitize existing <style> blocks
      styleElements.forEach(styleEl => {
        const text = styleEl.textContent || '';
        if (text.includes('oklch')) {
          originalStyleContentsByElement.set(styleEl, text);
          styleEl.textContent = translateAllOklchInString(text);
        }
      });

      // 3. Process and sanitize external <link rel="stylesheet"> blocks
      for (const linkEl of linkElements) {
        originalLinkDisabledStates.set(linkEl, linkEl.disabled);
        try {
          const response = await fetch(linkEl.href);
          if (response.ok) {
            let cssText = await response.text();
            cssText = translateAllOklchInString(cssText);
            
            const tempStyle = document.createElement('style');
            tempStyle.textContent = cssText;
            tempStyle.setAttribute('data-temp-sanitized', 'true');
            document.head.appendChild(tempStyle);
            temporaryStyleElements.push(tempStyle);

            linkEl.disabled = true;
          }
        } catch (err) {
          console.warn("Could not inline sheet:", linkEl.href, err);
        }
      }

      // Add print class
      element.classList.add('html2pdf-export');

      // Configuration for html2pdf (works beautifully in nested iframes)
      const opt = {
        margin: [8, 8, 8, 8], // top, left, bottom, right in mm
        filename: `Ficha_Atendimento_Sepse_${(patientName || 'Paciente').replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'legacy'] }
      } as any;

      // Generate the PDF
      await html2pdf().set(opt).from(element).save();

      // Clean up the style class
      element.classList.remove('html2pdf-export');
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      // Fallback to standard window print in case something fails
      window.print();
    } finally {
      // Restore window.getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;

      // Restore original <style> content
      originalStyleContentsByElement.forEach((originalText, styleEl) => {
        styleEl.textContent = originalText;
      });

      // Restore original <link> sheets
      originalLinkDisabledStates.forEach((disabledState, linkEl) => {
        linkEl.disabled = disabledState;
      });

      // Remove temporary style tags
      temporaryStyleElements.forEach(tempEl => {
        if (tempEl.parentNode) {
          tempEl.parentNode.removeChild(tempEl);
        }
      });

      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-slate-150 min-h-screen text-slate-800 pb-24 relative sepse-print-context">
      
      {/* Dynamic style values for --blue theme coloring */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --blue: ${themeColor} !important;
          --blue-light: ${themeColor}1a !important;
          --blue-border: ${themeColor}4d !important;
          --blue-text: ${themeColor} !important;
        }

        .print-only {
          display: none;
        }

        .html2pdf-export {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            font-size: 11px !important;
        }
        .html2pdf-export .no-print {
            display: none !important;
        }
        .html2pdf-export .print-only {
            display: block !important;
        }
        .html2pdf-export .item-body {
            display: block !important;
            height: auto !important;
            opacity: 1 !important;
            border-top: 1px solid #e2e8f0 !important;
        }
        .html2pdf-export .chevron {
            display: none !important;
        }
        .html2pdf-export .item-card {
            border: 1px solid #cbd5e1 !important;
            break-inside: avoid !important;
            margin-bottom: 8px !important;
        }
        .html2pdf-export .prot-section {
            break-inside: avoid !important;
        }

        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            font-size: 11px !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .item-body {
            display: block !important;
            height: auto !important;
            opacity: 1 !important;
            border-top: 1px solid #e2e8f0 !important;
          }
          .chevron {
            display: none !important;
          }
          .item-card {
            border: 1px solid #cbd5e1 !important;
            break-inside: avoid !important;
            margin-bottom: 8px !important;
          }
          .prot-section {
            break-inside: avoid !important;
          }
        }
      `}} />

      <div id="printable-ficha-content" className="max-w-[860px] mx-auto px-4 pt-6 space-y-5">
        
        {/* ============================================== */}
        {/* CABEÇALHO POP (MUNICIPAL INSTITUTIONAL HEADER) */}
        {/* ============================================== */}
        <div id="pop-header" className="bg-white rounded-2xl border-2 border-emerald-800 overflow-hidden shadow-md font-sans">
          
          {/* Logo Rows */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center p-4 gap-4 border-b-2 border-emerald-800 bg-white min-h-[90px]">
            
            {/* Slot 1: Prefeitura */}
            <div className="flex items-center justify-center min-h-[70px]" id="pop-logo-slot-1">
              {logos['1'] ? (
                <img src={logos['1']!} alt="Logo Prefeitura" className="max-h-[76px] object-contain" />
              ) : (
                <div className="flex flex-col items-start leading-[1.0] text-emerald-800 select-none">
                  <span className="text-[11px] font-black tracking-widest uppercase">PREFEITURA DE</span>
                  <span className="text-2xl font-black italic tracking-tighter text-emerald-600 block border-b-2 border-red-500 pb-0.5">MORRINHOS</span>
                </div>
              )}
            </div>

            {/* Slot 2: Sec Saúde */}
            <div className="flex items-center justify-center min-h-[70px]" id="pop-logo-slot-2">
              {logos['2'] ? (
                <img src={logos['2']!} alt="Logo Secretaria de Saúde" className="max-h-[64px] object-contain" />
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                  <div className="flex flex-col gap-1">
                    <span className="w-1.5 h-6 bg-emerald-700 rounded-full" />
                    <span className="w-1.5 h-6 bg-red-650 rounded-full" />
                  </div>
                  <div className="leading-none text-slate-700 font-sans select-none">
                    <span className="text-[10px] block font-light tracking-[0.18em]">SECRETARIA DE</span>
                    <span className="text-base font-black tracking-tight block text-slate-900">SAÚDE</span>
                  </div>
                </div>
              )}
            </div>

            {/* Slot 3: SUS */}
            <div className="flex items-center justify-center md:justify-end min-h-[70px]" id="pop-logo-slot-3">
              {logos['3'] ? (
                <img src={logos['3']!} alt="Logo SUS" className="max-h-[50px] object-contain" />
              ) : (
                <div className="flex items-center gap-2 select-none">
                  <span className="text-3xl font-black text-blue-600 tracking-tighter border-b-4 border-blue-800 pb-0.5">SUS</span>
                  <span className="text-[8px] font-bold text-blue-800 tracking-wider uppercase leading-snug">Sistema Único<br />de Saúde</span>
                </div>
              )}
            </div>

          </div>

          {/* Banner Titles */}
          <div className="bg-emerald-800 text-white text-center py-2 text-xs font-black tracking-widest">
            {config['pop.titulo'] || 'PROCEDIMENTO OPERACIONAL PADRÃO - POP'}
          </div>
          <div className="bg-emerald-700 text-white text-center py-3 text-sm font-black tracking-wider border-t border-emerald-900">
            {config['pop.subtitulo'] || 'TÍTULO: PROTOCOLO DE SEPSE'}
          </div>

          {/* Code, Version, Page columns */}
          <div className="grid grid-cols-3 divide-x divide-emerald-800 border-t border-emerald-800 bg-emerald-600 text-white text-center text-[10px] font-black uppercase">
            <div className="py-2">{config['pop.codigo'] || 'Código: POP-HMM-001'}</div>
            <div className="py-2">{config['pop.versao'] || 'VERSÃO: 01'}</div>
            <div className="py-2">{config['pop.pagina'] || 'PÁGINA 1'}</div>
          </div>

          {/* Dates columns */}
          <div className="grid grid-cols-3 divide-x divide-emerald-100 bg-white border-t border-emerald-800 text-[10px] text-center uppercase font-bold text-slate-500">
            <div className="py-2">
              <span className="text-[8px] block text-slate-400">Data de Elaboração</span>
              <span className="text-slate-800 font-extrabold">{config['pop.data_elab'] || '25/05/2026'}</span>
            </div>
            <div className="py-2">
              <span className="text-[8px] block text-slate-400">Data de Aprovação</span>
              <span className="text-slate-800 font-extrabold">{config['pop.data_aprov'] || '26/05/2026'}</span>
            </div>
            <div className="py-2">
              <span className="text-[8px] block text-slate-400">Próxima Revisão</span>
              <span className="text-slate-800 font-extrabold">{config['pop.data_rev'] || '26/05/2027'}</span>
            </div>
          </div>

        </div>

        {/* Informative Header (Doutor & Instituição info) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm select-none">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{config['header.titulo'] || 'Sepse'}</h1>
              <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider">{config['header.badge'] || 'SSC 2026'}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-bold mt-1">{config['header.sub'] || 'Baseado nas diretrizes Surviving Sepsis Campaign (SSC) 2026'}</p>
          </div>
          <div className="md:text-right">
            <span className="inline-block text-[9px] font-black tracking-widest text-[#185fa5] bg-blue-50/50 border border-blue-200/50 rounded-full px-3 py-1 mb-1 bg-opacity-70">
              {config['header.hospital'] || 'Hospital Municipal de Morrinhos'}
            </span>
            <p className="text-xs font-black text-slate-700">{config['header.autor'] || 'Dr. Ivaldo Inácio Silva Júnior'}</p>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide mt-0.5">{config['header.cargo'] || 'Diretor Técnico do Hospital Municipal de Morrinhos'}</p>
          </div>
        </div>

        {/* ============================================== */}
        {/* PATIENT CARD FORM - METADATA INPUTS */}
        {/* ============================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm no-print">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">DADOS DO ATENDIMENTO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {patientFields.filter(f => f.visible).map(field => {
              const val = patientResponses[field.id] || '';
              const updateValue = (v: string) => {
                let cleanVal = v;
                if (field.mask === 'date') cleanVal = dateMaskBR(v);
                if (field.mask === 'time') cleanVal = timeMaskBR(v);
                setPatientResponses(prev => ({ ...prev, [field.id]: cleanVal }));
              };

              return (
                <div key={field.id} className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase text-slate-400">{field.label}</label>
                  <input
                    type={field.type}
                    value={val}
                    onChange={e => updateValue(e.target.value)}
                    className="border text-xs font-black rounded-lg p-2 bg-slate-50 uppercase focus:bg-white outline-none"
                    placeholder={field.placeholder}
                    maxLength={field.mask === 'date' ? 10 : field.mask === 'time' ? 5 : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* PRINT BANNER - HIDDEN ON SCREEN, REPLACES FORM CARD */}
        <div className="bg-white rounded-lg border border-slate-300 p-4 space-y-3 text-xs font-sans print-only">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">DADOS DO ATENDIMENTO</h2>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-6 text-slate-800">
            {patientFields.filter(f => f.visible).map(field => {
              const val = patientResponses[field.id] || '';
              return (
                <div key={field.id}>
                  <span className="font-extrabold text-slate-500 uppercase text-[9px] mr-2">{field.label}:</span>
                  {val || '—'}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================== */}
        {/* TOP SCORES BAR WIDGETS                         */}
        {/* ============================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none">
          
          {/* Triagem NEWS bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-16 h-16 rounded-full border-4 flex flex-col justify-center items-center shadow-inner transition-all flex-shrink-0 ${newsScoreResult.answered > 0 ? (newsScoreResult.score >= 4 ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-emerald-500 bg-emerald-50 text-emerald-800') : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
              <span className="text-xl font-black leading-none">{newsScoreResult.answered > 0 ? newsScoreResult.score : '0'}</span>
              <span className="text-[8px] font-black tracking-widest mt-0.5">NEWS</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-black text-slate-800 truncate">
                {newsScoreResult.answered === 0 
                  ? 'Preencha os parâmetros' 
                  : (newsScoreResult.score >= 7 
                     ? 'NEWS ≥ 7 — Alto Risco (Ativar Protocolo!)' 
                     : (newsScoreResult.score >= 4 
                        ? 'NEWS 4-6 — Risco Médio (Rastrear Sepse)' 
                        : 'NEWS 0-3 — Baixo Risco'))}
              </h4>
              <div className="bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 border">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${newsScoreResult.score >= 4 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(100, (newsScoreResult.answered / 7) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">
                {config['scores.news.detail'] || 'Pontuação de triagem para sepse · NOTÍCIAS ≥ 4 = alta acurácia'}
              </p>
            </div>
          </div>

          {/* Triagem SOFA disfunção bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-16 h-16 rounded-full border-4 flex flex-col justify-center items-center shadow-inner transition-all flex-shrink-0 ${sofaScoreResult.answered > 0 ? (sofaScoreResult.score >= 2 ? 'border-rose-500 bg-rose-50 text-rose-800 animate-pulse' : 'border-emerald-500 bg-emerald-50 text-emerald-800') : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
              <span className="text-xl font-black leading-none">{sofaScoreResult.answered > 0 ? sofaScoreResult.score : '0'}</span>
              <span className="text-[8px] font-black tracking-widest mt-0.5">SOFA</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-black text-slate-800 truncate">
                {sofaScoreResult.answered === 0 
                  ? 'Preencha os parâmetros' 
                  : (sofaScoreResult.score >= 10 
                     ? 'SOFA ≥ 10 — Falência Múltipla' 
                     : (sofaScoreResult.score >= 6 
                        ? 'SOFA 6-9 — Disfunção Grave (UTI)' 
                        : (sofaScoreResult.score >= 2 
                           ? 'SOFA ≥ 2 + Infecção = SEPSE!' 
                           : 'SOFA < 2 — Sem disfunção')))}
              </h4>
              <div className="bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 border">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${sofaScoreResult.score >= 2 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(100, (sofaScoreResult.answered / 6) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">
                {config['scores.sofa.detail'] || 'Disfunção orgânica · SOFA ≥ 2 + infecção = Sepse'}
              </p>
            </div>
          </div>

        </div>

        {/* Dynamic score summary badges under scores */}
        <div className="flex flex-wrap gap-1.5">
          {newsScoreResult.answered > 0 && newsScoreResult.score >= 4 && (
            <span className="bg-amber-100/80 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200/50 uppercase">
              NEWS ≥ 4 — Potencial Sepse
            </span>
          )}
          {sofaScoreResult.answered > 0 && sofaScoreResult.score >= 2 && (
            <span className="bg-rose-100/80 text-rose-900 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200/50 uppercase">
              SOFA ≥ 2 — Disfunção Orgânica Crítica
            </span>
          )}
          {newsScoreResult.answered > 0 && sofaScoreResult.answered > 0 && newsScoreResult.score >= 4 && sofaScoreResult.score >= 2 && (
            <span className="bg-rose-650 text-white text-[10px] font-black px-4.5 py-1 rounded-full border border-transparent shadow shadow-rose-250 uppercase animate-pulse">
              ⚠ ALERTA DE SEPSE — Ativar Diretriz de Amplo Espectro
            </span>
          )}
        </div>

        {/* ============================================== */}
        {/* SECTIONS RENDER LOOP (BY ORDER STATE KEY)     */}
        {/* ============================================== */}
        {sectionOrder.map(sectionId => {
          
          // SECTION 3: CLASSIFICAÇÃO CARDS
          if (sectionId === 's3') {
            return (
              <div key="s3" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s3.label']}</div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  
                  {/* Header click */}
                  <div 
                    onClick={() => toggleItemExpansion('classification')}
                    className="p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">■</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{config['s3.titulo']}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{config['s3.sub'] || 'Categorização de condutas imediatas baseadas na suspeita'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{config['s3.range'] || 'SSC 2026'}</span>
                      {expandedItems['classification'] ? <ChevronUp className="w-4 h-4 text-slate-450" /> : <ChevronDown className="w-4 h-4 text-slate-450" />}
                    </div>
                  </div>

                  {/* Body expanded */}
                  {(!expandedItems['classification']) && (
                    <div className="p-5 border-t border-slate-100 bg-white space-y-5">
                      
                      {/* Clinical definition block advice */}
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed no-print border-l-3 border-slate-300 pl-4 py-0.5 whitespace-pre-wrap">
                        {config['s3.blk1.texto']}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        
                        {/* Box 1: Improvavel */}
                        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${derivedRiskCategory === 'IMPROVAVEL' ? 'bg-emerald-50 border-emerald-500 scale-[1.01] shadow' : 'bg-slate-50 border-slate-200/50 opacity-60'}`}>
                          <div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border uppercase">Improvável</span>
                            <h5 className="text-xs font-black text-slate-800 mt-2">{config['s3.c1.titulo'] || 'SEPSE IMPROVÁVEL'}</h5>
                            <p className="text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed mt-1.5">{config['s3.c1.desc']}</p>
                          </div>
                        </div>

                        {/* Box 2: Possível */}
                        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${derivedRiskCategory === 'POSSIVEL' ? 'bg-amber-50 border-amber-500 scale-[1.01] shadow' : 'bg-slate-50 border-slate-200/50 opacity-60'}`}>
                          <div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800 border uppercase">Possível</span>
                            <h5 className="text-xs font-black text-slate-800 mt-2">{config['s3.c2.titulo'] || 'SEPSE POSSÍVEL'}</h5>
                            <p className="text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed mt-1.5">{config['s3.c2.desc']}</p>
                          </div>
                        </div>

                        {/* Box 3: Provável */}
                        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${derivedRiskCategory === 'PROVAVEL' ? 'bg-orange-50 border-orange-500 scale-[1.01] shadow' : 'bg-slate-50 border-slate-200/50 opacity-60'}`}>
                          <div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-orange-100 text-orange-850 border uppercase">Provável</span>
                            <h5 className="text-xs font-black text-slate-800 mt-2">{config['s3.c3.titulo'] || 'SEPSE PROVÁVEL'}</h5>
                            <p className="text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed mt-1.5">{config['s3.c3.desc']}</p>
                          </div>
                        </div>

                        {/* Box 4: Definida */}
                        <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${derivedRiskCategory === 'DEFINIDA' ? 'bg-rose-50 border-rose-500 scale-[1.01] shadow' : 'bg-slate-50 border-slate-200/50 opacity-60'}`}>
                          <div>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded bg-rose-100 text-rose-800 border uppercase">Definida</span>
                            <h5 className="text-xs font-black text-slate-850 mt-2">{config['s3.c4.titulo'] || 'SEPSE DEFINIDA'}</h5>
                            <p className="text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed mt-1.5">{config['s3.c4.desc']}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          }

          // SECTION 1: TRIAGEM NEWS PARAMS
          if (sectionId === 's1') {
            return (
              <div key="s1" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s1.label']}</div>
                <div className="space-y-2">
                  {NEWS_RAW_GRID_PARAMETERS.map((param, index) => {
                    const isExpanded = expandedItems[`news-${param.id}`] || false;
                    const selectedVal = newsAnswers[param.id];

                    return (
                      <div key={param.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-blue-500 shadow' : 'border-slate-200 hover:border-slate-300'}`}>
                        {/* Header click */}
                        <div 
                          onClick={() => toggleItemExpansion(`news-${param.id}`)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-sm ${selectedVal !== null ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                              {selectedVal !== null ? selectedVal : index + 1}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-850">{config[param.titleKey]}</h4>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{config[param.subKey]}</p>
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

                        {/* Body expanded options */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                            
                            {/* Guideline Box "Como avaliar" in blue */}
                            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 text-[10px] space-y-1">
                              <span className="block text-[8px] font-black tracking-widest text-[#185fa5] uppercase">COMO AVALIAR:</span>
                              <p className="font-bold leading-relaxed">{config[param.howToKey]}</p>
                            </div>

                            {/* Attention Box in orange */}
                            {param.attentionKey && config[param.attentionKey] && (
                              <div className="p-3.5 bg-amber-50/40 border border-amber-200/50 rounded-xl text-amber-900 text-[10px] space-y-1">
                                <span className="block text-[8px] font-black tracking-widest text-amber-800 uppercase flex items-center gap-1">⚠ Atenção clínica</span>
                                <p className="font-bold leading-relaxed">{config[param.attentionKey]}</p>
                              </div>
                            )}

                            {/* Option inputs selecting list */}
                            <div className="space-y-1.5">
                              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Selecione o valor correspondente:</span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {param.options.map((opt, oIdx) => {
                                  const isActive = selectedVal === opt.score;
                                  return (
                                    <button 
                                      key={oIdx}
                                      onClick={() => handleSelectNews(param.id, opt.score)}
                                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${isActive ? 'bg-slate-800 border-slate-900 text-white font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded text-[10px] font-black flex items-center justify-center shadow-sm ${opt.scoreClass === 'c3' ? 'bg-red-500 text-white' : opt.scoreClass === 'c2' ? 'bg-orange-500 text-white' : opt.scoreClass === 'c1' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                                          {opt.score}
                                        </span>
                                        <span className="text-[11px] font-bold">{config[opt.labelKey]}</span>
                                      </div>
                                      {isActive && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Reset item buttons */}
                            {selectedVal !== null && (
                              <div className="flex justify-end pt-1 no-print">
                                <button onClick={(e) => handleClearNewsItem(param.id, e)} className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1 uppercase tracking-wider">
                                  <Trash2 className="w-3.5 h-3.5" /> limpar este item
                                </button>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // SECTION 2: TRIAGEM SOFA PARAMS
          if (sectionId === 's2') {
            return (
              <div key="s2" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s2.label']}</div>
                <div className="space-y-2">
                  {SOFA_RAW_GRID_PARAMETERS.map((param, index) => {
                    const isExpanded = expandedItems[`sofa-${param.id}`] || false;
                    const selectedVal = sofaAnswers[param.id];

                    return (
                      <div key={param.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-red-500 shadow' : 'border-slate-200 hover:border-slate-300'}`}>
                        {/* Header click */}
                        <div 
                          onClick={() => toggleItemExpansion(`sofa-${param.id}`)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-sm ${selectedVal !== null ? 'bg-red-500 border-red-650 text-white' : 'bg-slate-50 text-slate-400'}`}>
                              {selectedVal !== null ? selectedVal : index + 1}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800">{config[param.titleKey]}</h4>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{config[param.subKey]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedVal !== null && (
                              <span className="bg-red-100 text-red-800 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase border">
                                Pontos: +{selectedVal}
                              </span>
                            )}
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Body expanded options */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                            
                            {param.id === 'cv' && (
                              <VasopressorCalculator externalWeight={patientWeight} onWeightChange={setPatientWeight} />
                            )}

                            {/* Guideline Box "Como avaliar" in blue */}
                            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 text-[10px] space-y-1">
                              <span className="block text-[8px] font-black tracking-widest text-[#185fa5] uppercase">COMO AVALIAR:</span>
                              {param.id === 'cv' && typeof config[param.howToKey] === 'string' && config[param.howToKey].includes('🔴 NORADRENALINA') ? (() => {
                                const text = config[param.howToKey];
                                const parts = text.split(/🔴\s*(NORADRENALINA|DOBUTAMINA|DOPAMINA)/);
                                if (parts.length >= 7) {
                                  return (
                                    <div className="mt-2 text-[9.5px] font-medium leading-relaxed">
                                      <div className="mb-3 whitespace-pre-wrap font-bold">{parts[0].trim()}</div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                                          <span className="block font-black text-rose-600 mb-1.5 flex items-center gap-1"><span className="text-[10px]">🔴</span> {parts[1]}</span>
                                          <span className="whitespace-pre-wrap">{parts[2].trim()}</span>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                                          <span className="block font-black text-rose-600 mb-1.5 flex items-center gap-1"><span className="text-[10px]">🔴</span> {parts[3]}</span>
                                          <span className="whitespace-pre-wrap">{parts[4].trim()}</span>
                                        </div>
                                        <div className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                                          <span className="block font-black text-rose-600 mb-1.5 flex items-center gap-1"><span className="text-[10px]">🔴</span> {parts[5]}</span>
                                          <span className="whitespace-pre-wrap">{parts[6].trim()}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return <p className="font-bold leading-relaxed whitespace-pre-wrap">{config[param.howToKey]}</p>;
                              })() : (
                                <p className="font-bold leading-relaxed whitespace-pre-wrap">{config[param.howToKey]}</p>
                              )}
                            </div>

                            {/* Option inputs selecting list */}
                            <div className="space-y-1.5">
                              <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Selecione o valor correspondente:</span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {param.options.map((opt, oIdx) => {
                                  const isActive = selectedVal === opt.score;
                                  return (
                                    <button 
                                      key={oIdx}
                                      onClick={() => handleSelectSofa(param.id, opt.score)}
                                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${isActive ? 'bg-slate-850 border-slate-900 text-white font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded text-[10px] font-black flex items-center justify-center shadow-sm ${opt.scoreClass === 'c4' ? 'bg-red-700 text-white' : opt.scoreClass === 'c3' ? 'bg-rose-500 text-white' : opt.scoreClass === 'c2' ? 'bg-orange-500 text-white' : opt.scoreClass === 'c1' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}`}>
                                          {opt.score}
                                        </span>
                                        <span className="text-[11px] font-bold whitespace-pre-wrap">{config[opt.labelKey]}</span>
                                      </div>
                                      {isActive && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Reset item buttons */}
                            {selectedVal !== null && (
                              <div className="flex justify-end pt-1 no-print">
                                <button onClick={(e) => handleClearSofaItem(param.id, e)} className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1 uppercase tracking-wider">
                                  <Trash2 className="w-3.5 h-3.5" /> limpar este item
                                </button>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // SECTION 4: PACOTE 1ª HORA CHECKLISTS
          if (sectionId === 's4') {
            return (
              <div key="s4" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s4.label']}</div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  
                  {/* Header */}
                  <div 
                    onClick={() => toggleItemExpansion('pacote-checklist')}
                    className="p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-750 font-bold text-xs flex items-center justify-center">✓</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{config['s4.titulo']}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{config['s4.sub']}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{config['s4.range']}</span>
                      {expandedItems['pacote-checklist'] ? <ChevronUp className="w-4 h-4 text-slate-455" /> : <ChevronDown className="w-4 h-4 text-slate-455" />}
                    </div>
                  </div>

                  {/* Body expanded */}
                  {(!expandedItems['pacote-checklist']) && (
                    <div className="p-4.5 border-t border-slate-100 bg-white space-y-4">
                      
                      <div className="p-3.5 bg-rose-50/50 border border-thin rounded-xl text-rose-900 text-[11px] font-bold no-print">
                        <span className="block text-[8px] font-black tracking-widest text-rose-800 uppercase flex items-center gap-1">⏰ Atenção crítica</span>
                        <p className="leading-relaxed mt-0.5 whitespace-pre-wrap">{config['s4.blk1.texto']}</p>
                      </div>

                      {/* Checklist nodes */}
                      <div className="space-y-1.5 font-sans">
                        {checklists.pacote.map((item, idx) => {
                          const isChecked = !!checkedPacote[idx];
                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                setCheckedPacote(prev => {
                                  const updated = [...prev];
                                  updated[idx] = !updated[idx];
                                  return updated;
                                });
                              }}
                              className={`p-3 rounded-lg border flex items-start gap-3 select-none cursor-pointer transition-all ${isChecked ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : (item.urgent ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50')}`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
                                ) : (
                                  <Square className="w-4.5 h-4.5 text-slate-400" />
                                )}
                              </div>
                              <div style={{wordBreak: "break-word"}} className="text-[11px] font-medium leading-relaxed" dangerouslySetInnerHTML={{ 
                                __html: patientWeight && !isNaN(parseFloat(patientWeight)) 
                                  ? item.html.replace('30 mL/kg', `30 mL/kg (<span class="text-blue-600 font-extrabold bg-blue-100 px-1 rounded mx-0.5">${(30 * parseFloat(patientWeight)).toLocaleString('pt-BR')} mL Total</span>)`)
                                  : item.html 
                              }} />
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          }

          // SECTION 5: HEMODINÂMICO & VASOPRESSORES
          if (sectionId === 's5') {
            return (
              <div key="s5" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s5.label']}</div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  
                  {/* Header click */}
                  <div 
                    onClick={() => toggleItemExpansion('vasopressores')}
                    className="p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-750 font-bold text-xs flex items-center justify-center">Rx</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{config['s5.titulo']}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{config['s5.sub']}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{config['s5.range']}</span>
                      {expandedItems['vasopressores'] ? <ChevronUp className="w-4 h-4 text-slate-455" /> : <ChevronDown className="w-4 h-4 text-slate-455" />}
                    </div>
                  </div>

                  {/* Body expanded */}
                  {(!expandedItems['vasopressores']) && (
                    <div className="p-4.5 border-t border-slate-100 bg-white space-y-4">
                      
                      <VasopressorCalculator externalWeight={patientWeight} onWeightChange={setPatientWeight} />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1 no-print">
                        <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-900 text-[10px] space-y-1">
                          <span className="block text-[8px] font-black tracking-widest uppercase">META HEMODINÂMICA:</span>
                          <p className="font-bold leading-relaxed whitespace-pre-wrap">{config['s5.blk1.texto']}</p>
                        </div>
                        <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-900 text-[10px] space-y-1">
                          <span className="block text-[8px] font-black tracking-widest uppercase flex items-center gap-1">✓ Preservar início imediato</span>
                          <p className="font-bold leading-relaxed whitespace-pre-wrap">{config['s5.blk2.texto']}</p>
                        </div>
                      </div>

                      {/* Noradrenalina prescribing details */}
                      <div className="bg-slate-50/80 border p-4 rounded-xl space-y-2">
                        <span className="block text-[9px] font-black text-[#185fa5] uppercase tracking-wider">{config['s5.nora.label']}</span>
                        <p className="text-[11px] font-bold text-slate-600">{config['s5.nora.indicacao']}</p>
                        <p className="text-[11px] font-bold text-slate-600 border-b pb-2">{config['s5.nora.meta']}</p>
                        <div className="pt-1.5">
                          <span className="block text-[8px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">{config['s5.nora.rx.label'] || 'Prescrição Prática:'}</span>
                          <div className="p-2.5 bg-white border rounded font-mono text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap overflow-x-auto shadow-inner">
                            {config['s5.nora.rx.texto']}
                          </div>
                        </div>
                      </div>

                      {/* Vasopressina prescribed details */}
                      <div className="bg-slate-50/80 border p-4 rounded-xl space-y-2">
                        <span className="block text-[9px] font-black text-[#185fa5] uppercase tracking-wider">{config['s5.vaso.label']}</span>
                        <p className="text-[11px] font-bold text-slate-600">{config['s5.vaso.indicacao']}</p>
                        <div className="pt-1.5">
                          <span className="block text-[8px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">{config['s5.vaso.rx.label'] || 'Prescrição Prática:'}</span>
                          <div className="p-2.5 bg-white border rounded font-mono text-[10px] leading-relaxed text-slate-700 whitespace-pre-wrap overflow-x-auto shadow-inner">
                            {config['s5.vaso.rx.texto']}
                          </div>
                        </div>
                      </div>

                      {/* Corticoides details */}
                      <div className="bg-slate-50/80 border p-4 rounded-xl space-y-2">
                        <span className="block text-[9px] font-black text-[#185fa5] uppercase tracking-wider">{config['s5.corti.label']}</span>
                        <p className="text-[11px] font-bold text-slate-600">{config['s5.corti.indicacao']}</p>
                        <div className="pt-1.5">
                          <span className="block text-[8px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">{config['s5.corti.rx.label'] || 'Informações Práticas:'}</span>
                          <div className="bg-white border rounded overflow-x-auto shadow-inner">
                            <table className="w-full text-left border-collapse text-[10px] sm:text-[11px]">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-200">
                                  <th className="p-2 font-bold text-slate-800 border-r border-slate-200">Aspecto</th>
                                  <th className="p-2 font-bold text-slate-800 border-r border-slate-200">Choque Séptico</th>
                                  <th className="p-2 font-bold text-slate-800 border-r border-slate-200">SDRA</th>
                                  <th className="p-2 font-bold text-slate-800">PAC Grave</th>
                                </tr>
                              </thead>
                              <tbody className="text-slate-700 align-top">
                                <tr className="border-b border-slate-200">
                                  <td className="p-2 font-bold border-r border-slate-200">Corticoides<br/>recomendados</td>
                                  <td className="p-2 border-r border-slate-200">
                                    <div className="flex flex-col gap-1.5">
                                      <div className={`p-1.5 rounded border transition-all ${selectedCorti['choque_hidro'] ? 'bg-blue-50/50 border-blue-200' : 'border-transparent'}`}>
                                        <div onClick={() => toggleCorti('choque_hidro')} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded select-none">
                                          {selectedCorti['choque_hidro'] ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                                          <span className="font-bold text-slate-800">Hidrocortisona</span>
                                        </div>
                                        {selectedCorti['choque_hidro'] && (
                                          <div className="mt-1 pl-5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Definir Dose:</label>
                                            <input 
                                              type="text" 
                                              value={selectedCortiDoses['choque_hidro']} 
                                              onChange={(e) => updateCortiDose('choque_hidro', e.target.value)}
                                              className="w-full text-[10px] border rounded px-1.5 py-0.5 bg-white font-sans text-slate-850 font-bold focus:ring-1 focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className={`p-1.5 rounded border transition-all ${selectedCorti['choque_fludro'] ? 'bg-blue-50/50 border-blue-200' : 'border-transparent'}`}>
                                        <div onClick={() => toggleCorti('choque_fludro')} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded select-none">
                                          {selectedCorti['choque_fludro'] ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                                          <span className="font-bold text-slate-800">Fludrocortisona (opcional)</span>
                                        </div>
                                        {selectedCorti['choque_fludro'] && (
                                          <div className="mt-1 pl-5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Definir Dose:</label>
                                            <input 
                                              type="text" 
                                              value={selectedCortiDoses['choque_fludro']} 
                                              onChange={(e) => updateCortiDose('choque_fludro', e.target.value)}
                                              className="w-full text-[10px] border rounded px-1.5 py-0.5 bg-white font-sans text-slate-850 font-bold focus:ring-1 focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-2 border-r border-slate-200">
                                    <div className="flex flex-col gap-1.5">
                                      <div className={`p-1.5 rounded border transition-all ${selectedCorti['sdra_dexa'] ? 'bg-blue-50/50 border-blue-200' : 'border-transparent'}`}>
                                        <div onClick={() => toggleCorti('sdra_dexa')} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded select-none">
                                          {selectedCorti['sdra_dexa'] ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                                          <span className="font-bold text-slate-800">Dexametasona</span>
                                        </div>
                                        {selectedCorti['sdra_dexa'] && (
                                          <div className="mt-1 pl-5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Definir Dose:</label>
                                            <input 
                                              type="text" 
                                              value={selectedCortiDoses['sdra_dexa']} 
                                              onChange={(e) => updateCortiDose('sdra_dexa', e.target.value)}
                                              className="w-full text-[10px] border rounded px-1.5 py-0.5 bg-white font-sans text-slate-850 font-bold focus:ring-1 focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className={`p-1.5 rounded border transition-all ${selectedCorti['sdra_metil'] ? 'bg-blue-50/50 border-blue-200' : 'border-transparent'}`}>
                                        <div onClick={() => toggleCorti('sdra_metil')} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded select-none">
                                          {selectedCorti['sdra_metil'] ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                                          <span className="font-bold text-slate-800">Metilprednisolona (alternativa)</span>
                                        </div>
                                        {selectedCorti['sdra_metil'] && (
                                          <div className="mt-1 pl-5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Definir Dose:</label>
                                            <input 
                                              type="text" 
                                              value={selectedCortiDoses['sdra_metil']} 
                                              onChange={(e) => updateCortiDose('sdra_metil', e.target.value)}
                                              className="w-full text-[10px] border rounded px-1.5 py-0.5 bg-white font-sans text-slate-850 font-bold focus:ring-1 focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex flex-col gap-1.5">
                                      <div className={`p-1.5 rounded border transition-all ${selectedCorti['pac_hidro'] ? 'bg-blue-50/50 border-blue-200' : 'border-transparent'}`}>
                                        <div onClick={() => toggleCorti('pac_hidro')} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded select-none">
                                          {selectedCorti['pac_hidro'] ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                                          <span className="font-bold text-slate-800">Hidrocortisona</span>
                                        </div>
                                        {selectedCorti['pac_hidro'] && (
                                          <div className="mt-1 pl-5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Definir Dose:</label>
                                            <input 
                                              type="text" 
                                              value={selectedCortiDoses['pac_hidro']} 
                                              onChange={(e) => updateCortiDose('pac_hidro', e.target.value)}
                                              className="w-full text-[10px] border rounded px-1.5 py-0.5 bg-white font-sans text-slate-855 font-bold focus:ring-1 focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className={`p-1.5 rounded border transition-all ${selectedCorti['pac_metil'] ? 'bg-blue-50/50 border-blue-200' : 'border-transparent'}`}>
                                        <div onClick={() => toggleCorti('pac_metil')} className="flex items-start gap-1.5 cursor-pointer hover:bg-slate-50 p-0.5 rounded select-none">
                                          {selectedCorti['pac_metil'] ? <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                                          <span className="font-bold text-slate-800">Metilprednisolona</span>
                                        </div>
                                        {selectedCorti['pac_metil'] && (
                                          <div className="mt-1 pl-5">
                                            <label className="text-[8px] font-black uppercase text-slate-400 block tracking-wider">Definir Dose:</label>
                                            <input 
                                              type="text" 
                                              value={selectedCortiDoses['pac_metil']} 
                                              onChange={(e) => updateCortiDose('pac_metil', e.target.value)}
                                              className="w-full text-[10px] border rounded px-1.5 py-0.5 bg-white font-sans text-slate-855 font-bold focus:ring-1 focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 font-bold border-r border-slate-200">Duração</td>
                                  <td className="p-2 border-r border-slate-200">
                                    <strong>5–7 dias</strong> ou até retirada de vasopressores
                                  </td>
                                  <td className="p-2 border-r border-slate-200">
                                    Até <strong>extubação</strong> (5–28 dias)
                                  </td>
                                  <td className="p-2">
                                    <strong>5–7 dias</strong>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          }

          // SECTION 6: ANTIBIOTICOTERAPIA TABELA 01
          if (sectionId === 's6') {
            return (
              <div key="s6" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s6.label']}</div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  
                  {/* Header click */}
                  <div 
                    onClick={() => toggleItemExpansion('antibioticos')}
                    className="p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-750 font-bold text-xs flex items-center justify-center">Ab</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{config['s6.titulo']}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{config['s6.sub']}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{config['s6.range']}</span>
                      {expandedItems['antibioticos'] ? <ChevronUp className="w-4 h-4 text-slate-455" /> : <ChevronDown className="w-4 h-4 text-slate-455" />}
                    </div>
                  </div>

                  {/* Body expanded */}
                  {(!expandedItems['antibioticos']) && (
                    <div className="p-4 border-t border-slate-100 bg-white space-y-4">
                      
                      <div className="p-3.5 bg-rose-50/50 border border-thin rounded-xl text-rose-900 text-[11px] font-bold no-print">
                        <span className="block text-[8px] font-black tracking-widest text-rose-800 uppercase">⚠ discussão infectologia</span>
                        <p className="leading-relaxed mt-0.5 whitespace-pre-wrap">{config['s6.blk1.texto']}</p>
                      </div>

                      {/* SUGGESTED DRUGS TABLE 01 */}
                      <div className="overflow-x-auto shadow-inner rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left border-collapse text-[11px] sm:text-[12px]">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-widest text-[9px] shadow-sm">
                              <th className="p-3 border-r border-slate-200 text-center w-10">Sel.</th>
                              <th className="p-3 border-r border-slate-200">Foco Clínico</th>
                              <th className="p-3 border-r border-slate-200">Antibioticoterapia Recomendada</th>
                              <th className="p-3 border-r border-slate-200">Diluição</th>
                              <th className="p-3 border-r border-slate-200">Via de Administração</th>
                              <th className="p-3 border-r border-slate-200">Frequência</th>
                              <th className="p-3 border-r border-slate-200">Tempo de Infusão</th>
                              <th className="p-3">Associações e Recomendações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-700 leading-relaxed font-medium align-top">
                            {/* Pulmonar */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('pulm')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['pulm'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                               <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.pulm.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">6/6H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                <strong>+ MACROLÍDEO (ex: Azitromicina)</strong><br />
                                500mg (01 CP) VO 1X ao dia por 5 dias.
                              </td>
                            </tr>
                            {/* Abdominal */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('abd')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['abd'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                              <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.abd.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">6/6H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                -
                              </td>
                            </tr>
                            {/* Urinário */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('urin')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['urin'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                              <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.urin.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">6/6H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                -
                              </td>
                            </tr>
                            {/* Meningite */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('mening')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['mening'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                              <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.mening.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Ceftriaxona 2g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">12/12H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                <span className="font-bold text-rose-700">Suspeita de Listeria</span> (criança, idoso, gestante, imunocomprometidos):<br/>
                                <strong>Associar: Ampicilina 2g + 100mL SF 0,9%</strong> (EV 4/4H em 1h).
                              </td>
                            </tr>
                            {/* Cutâneo */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('cut')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['cut'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                              <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.cut.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Ceftriaxona 2g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">24/24H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                <div className="space-y-1">
                                  <div>
                                    <strong>Associar: Oxacilina 2g + 100mL SF 0,9%</strong><br/>
                                    (EV 4/4H em 1h)
                                  </div>
                                  <div className="font-bold text-slate-400">--- OU ---</div>
                                  <div>
                                    <strong>Clindamicina 600mg + 100mL SF 0,9%</strong><br/>
                                    (EV 6/6H em 1h)
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {/* Corrente sanguínea */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('sangue')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['sangue'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                              <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.sangue.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">6/6H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                <div className="space-y-1">
                                  <div className="font-bold text-rose-700 uppercase tracking-widest text-[9px] mb-1">
                                    [Remover Dispositivos Suspeitos]
                                  </div>
                                  <div>
                                    <strong>Associar: Vancomicina 15–20mg/kg + 100mL SF 0,9%</strong><br/>
                                    (EV 12/12H em 1h)
                                  </div>
                                  {patientWeight && (
                                    <div className="mt-1 bg-blue-50 text-blue-800 p-1.5 rounded border border-blue-100 font-mono">
                                      Dose baseada no peso: <strong>{(15 * parseFloat(patientWeight)).toFixed(0)} a {(20 * parseFloat(patientWeight)).toFixed(0)} mg</strong>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {/* Sem foco */}
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td 
                                className="p-3 border-r border-slate-200 text-center align-middle cursor-pointer hover:bg-slate-200"
                                onClick={() => toggleAtb('sfoco')}
                              >
                                <div className="flex items-center justify-center">
                                  {selectedAtb['sfoco'] ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                                </div>
                              </td>
                              <td className="p-3 bg-slate-50/50 font-black text-slate-900 border-r border-slate-200">{config['s6.t.sfoco.foco']}</td>
                              <td className="p-3 border-r border-slate-200"><span className="font-bold text-slate-900">Piperacilina-Tazobactam 4,5g</span></td>
                              <td className="p-3 border-r border-slate-200">100mL SF 0,9%</td>
                              <td className="p-3 border-r border-slate-200 font-extrabold text-blue-700">EV</td>
                              <td className="p-3 border-r border-slate-200">6/6H</td>
                              <td className="p-3 border-r border-slate-200">01 hora</td>
                              <td className="p-3 text-[10px]">
                                -
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          }

          // SECTION 7: CUIDADOS GERAIS E PROFILAXIAS
          if (sectionId === 's7') {
            return (
              <div key="s7" className="prot-section space-y-3 pt-2">
                <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{config['s7.label']}</div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  
                  {/* Header click */}
                  <div 
                    onClick={() => toggleItemExpansion('cuidados-checklist')}
                    className="p-4.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-750 font-bold text-xs flex items-center justify-center">☰</div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{config['s7.titulo']}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{config['s7.sub'] || 'VM · TEV · LAMG · Glicemia · Monitorização'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{config['s7.range'] || 'Internação'}</span>
                      {expandedItems['cuidados-checklist'] ? <ChevronUp className="w-4 h-4 text-slate-455" /> : <ChevronDown className="w-4 h-4 text-slate-455" />}
                    </div>
                  </div>

                  {/* Body expanded */}
                  {(!expandedItems['cuidados-checklist']) && (
                    <div className="p-4.5 border-t border-slate-100 bg-white space-y-4">
                      
                      <div className="space-y-1.5 font-sans">
                        {checklists.cuidados.map((item, idx) => {
                          const isChecked = !!checkedCuidados[idx];
                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                setCheckedCuidados(prev => {
                                  const updated = [...prev];
                                  updated[idx] = !updated[idx];
                                  return updated;
                                });
                              }}
                              className={`p-3 rounded-lg border flex items-start gap-3 select-none cursor-pointer transition-all ${isChecked ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'}`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
                                ) : (
                                  <Square className="w-4.5 h-4.5 text-slate-400" />
                                )}
                              </div>
                              <div style={{wordBreak: "break-word"}} className="text-[11px] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: item.html }} />
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>
              </div>
            );
          }

          return null;
        })}

        {/* ============================================== */}
        {/* BOTTOM ACTION BUTTONS AND SIGNATURE NOTE       */}
        {/* ============================================== */}
        <div className="pt-6 flex flex-col md:flex-row gap-3 no-print select-none">
          <button 
            type="button"
            onClick={handlePrintTrigger}
            disabled={isGeneratingPdf}
            className="flex-1 py-4 bg-[#185fa5] hover:bg-opacity-90 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: themeColor }}
          >
            <Printer className={`w-4 h-4 ${isGeneratingPdf ? 'animate-pulse' : ''}`} /> {isGeneratingPdf ? 'Gerando...' : '📄 Gerar PDF do Atendimento'}
          </button>
          
          <button 
            type="button"
            onClick={handleResetScores}
            className="py-4 px-6 border bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> Limpar Tudo
          </button>
        </div>

        {/* Printable/Screen institutional footer signature banner */}
        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
          <div className="text-[10px] text-slate-400 font-bold max-w-sm leading-relaxed">
            {config['footer.fonte'] || 'Baseado nas diretrizes Surviving Sepsis Campaign (SSC) 2026'}
          </div>
          <div className="text-left md:text-right">
            <h5 className="text-xs font-black text-slate-700">{config['footer.autor'] || 'Dr. Ivaldo Inácio Silva Júnior'}</h5>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wide">{config['footer.cargo'] || 'Diretor Técnico do Hospital Municipal de Morrinhos'}</p>
          </div>
        </div>

      </div>

      {/* Floating Gear configurations button for restricted editing (restricted with Password) */}
      <button 
        type="button"
        onClick={() => setIsConfigOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full text-white shadow-xl shadow-slate-900/25 flex items-center justify-center active:scale-95 hover:rotate-45 transition-all duration-300 no-print z-50 cursor-pointer"
        style={{ backgroundColor: themeColor }}
        title="Configurações e Diretrizes Administrativas"
      >
        <Settings className="w-5 h-5 text-white" />
      </button>

      {/* RENDER CONFIGURATION MODAL IN PORTAL STATE FOR MAXIMUM STABILITY */}
      {isConfigOpen && (
        <SepseConfigModal
          initialConfig={config}
          initialChecklists={checklists}
          initialSectionOrder={sectionOrder}
          initialLogos={logos}
          currentPassword={password}
          onClose={() => setIsConfigOpen(false)}
          onSave={handleSaveConfigModal}
          targetTab="Sepse-Ficha"
          initialPatientFields={patientFields}
        />
      )}

    </div>
  );
};
