import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Add expandedInner state
content = content.replace(
  "const [expandedFlow, setExpandedFlow] = useState<string | null>(null);",
  "const [expandedFlow, setExpandedFlow] = useState<string | null>(null);\n  const [expandedInner, setExpandedInner] = useState<string | null>(null);"
);

// Map definitions
const mappingsBlock = `
  const paramIdToStateKeyNews: Record<string, keyof typeof news> = { fr: 'respRate', sup: 'supplementalOxygen', o2: 'oxygen', temp: 'temp', pas: 'bp', fc: 'heartRate', nc: 'mentalStatus' };
  const paramIdToStateKeySofa: Record<string, keyof typeof sofa> = { resp: 'resp', plaq: 'coag', bili: 'liver', cv: 'cardio', glas: 'cns', ren: 'renal' };
`;

content = content.replace(
  "const volumeCalculated = useMemo(() => {",
  mappingsBlock + "\n  const volumeCalculated = useMemo(() => {"
);

// Need ChevronDown, ChevronUp, Check imports
if (!content.includes('ChevronDown')) {
  content = content.replace("import { ", "import { ChevronDown, ChevronUp, Check, ");
}

const replacement = `        {/* Dynamic Warning Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className={\`p-6 rounded-[24px] border-2 transition-all \${newsScore >= 4 ? 'bg-amber-500/10 border-amber-400' : 'bg-slate-50 border-slate-200'}\`}>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escore de NEWS</h4>
            <p className={\`text-4xl font-extrabold leading-none mb-2 \${newsScore >= 4 ? 'text-amber-600' : 'text-slate-850'}\`}>{newsScore} pontos</p>
            <p className="text-xs font-semibold text-slate-500">
              {newsScore >= 4 
                ? '⚠️ CRITÉRIO ALCANÇADO: Alto risco para sepse (NEWS ≥ 4). Prossiga imediatamente para o cálculo do SOFA.' 
                : 'Paciente de baixo risco na triagem. Reavaliar a cada alteração clínica.'}
            </p>
            <button onClick={() => setExpandedFlow(prev => prev === 'news_top' ? null : 'news_top')} className="mt-3 text-xs text-[#1e3a8a] font-black hover:underline flex items-center gap-1 transition-all">
              Calcular Escore NEWS Completo {expandedFlow === 'news_top' ? '↑' : '↓'}
            </button>
          </div>
          
          <div className={\`p-6 rounded-[24px] border-2 transition-all \${sofaScore >= 2 ? 'bg-red-500/10 border-red-300' : 'bg-slate-50 border-slate-200'}\`}>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Escore de SOFA</h4>
            <p className={\`text-4xl font-extrabold leading-none mb-2 \${sofaScore >= 2 ? 'text-red-600' : 'text-slate-850'}\`}>{sofaScore} pontos</p>
            <p className="text-xs font-semibold text-slate-500">
              {sofaScore >= 2 
                ? '🔴 DISFUNÇÃO ORGÂNICA (SOFA ≥ 2): Critério patognomônico de SEPSE alcançado. Iniciar pacotes terapêuticos de imediato.' 
                : 'Nenhuma disfunção orgânica grave detectada ainda. Monitore e colha novos exames caso persista suspeita.'}
            </p>
            <button onClick={() => setExpandedFlow(prev => prev === 'sofa_top' ? null : 'sofa_top')} className="mt-3 text-xs text-[#1e3a8a] font-black hover:underline flex items-center gap-1 transition-all">
              Calcular Escore SOFA de Cuidado {expandedFlow === 'sofa_top' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* --- EXPANDED SECTIONS PLACED OUTSIDE THE GRID --- */}
        <AnimatePresence mode="wait">
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
                  <div className={\`px-4 py-2 rounded-xl text-center font-bold text-xs uppercase shadow-sm \${newsScore >= 4 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}\`}>
                    {newsScore >= 4 ? 'Alto Risco (≥ 4)' : 'Baixo Risco'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {NEWS_RAW_GRID_PARAMETERS.map((param, index) => {
                    const isExpanded = expandedInner === \`news-\${param.id}\`;
                    const stateKey = paramIdToStateKeyNews[param.id];
                    const selectedVal = stateKey ? news[stateKey] : null;

                    return (
                      <div key={param.id} className={\`bg-white rounded-xl border transition-all overflow-hidden \${isExpanded ? 'border-amber-500 shadow' : 'border-slate-200 hover:border-slate-300'}\`}>
                        <div 
                          onClick={() => setExpandedInner(isExpanded ? null : \`news-\${param.id}\`)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={\`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-sm \${selectedVal !== null && selectedVal > 0 ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-50 text-slate-400'}\`}>
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
                                      className={\`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all \${isActive ? 'bg-slate-800 border-slate-900 text-white font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'}\`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={\`w-6 h-6 rounded text-[10px] font-black flex items-center justify-center shadow-sm \${opt.scoreClass === 'c3' ? 'bg-red-500 text-white' : opt.scoreClass === 'c2' ? 'bg-orange-500 text-white' : opt.scoreClass === 'c1' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}\`}>
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
                  <div className={\`px-4 py-2 rounded-xl text-center font-bold text-xs uppercase shadow-sm \${sofaScore >= 2 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}\`}>
                    {sofaScore >= 2 ? 'Disfunção Progressiva (≥ 2)' : 'Sem Disfunção'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {SOFA_RAW_GRID_PARAMETERS.map((param, index) => {
                    const isExpanded = expandedInner === \`sofa-\${param.id}\`;
                    const stateKey = paramIdToStateKeySofa[param.id];
                    const selectedVal = stateKey ? sofa[stateKey] : null;

                    return (
                      <div key={param.id} className={\`bg-white rounded-xl border transition-all overflow-hidden \${isExpanded ? 'border-emerald-500 shadow' : 'border-slate-200 hover:border-slate-300'}\`}>
                        <div 
                          onClick={() => setExpandedInner(isExpanded ? null : \`sofa-\${param.id}\`)}
                          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className={\`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center border shadow-sm \${selectedVal !== null && selectedVal > 0 ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}\`}>
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
                                      className={\`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all \${isActive ? 'bg-slate-800 border-slate-900 text-white font-extrabold' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'}\`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={\`w-6 h-6 rounded text-[10px] font-black flex items-center justify-center shadow-sm \${opt.scoreClass === 'c3' || opt.scoreClass === 'c4' ? 'bg-red-500 text-white' : opt.scoreClass === 'c2' ? 'bg-orange-500 text-white' : opt.scoreClass === 'c1' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-500 text-white'}\`}>
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
        </AnimatePresence>`;

const startToken = "{/* Dynamic Warning Card */}";
const endToken = "{/* Interactive Diagram Canvas */}";
const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n\n        " + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Patch applied correctly.");
} else {
  console.log("Could not find replacement boundaries.");
}
