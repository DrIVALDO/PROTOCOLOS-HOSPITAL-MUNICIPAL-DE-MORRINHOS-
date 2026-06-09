import { CheckItem, ConfigDict, SepsisParameter } from './sepseTypes';

export const INITIAL_CONFIG: ConfigDict = {
  "_cor": "#185fa5",
  "pg.titulo": "Protocolo de Sepse — Hospital Municipal de Morrinhos",
  "header.titulo": "Sepse",
  "header.sub": "Baseado nas diretrizes Surviving Sepsis Campaign (SSC) 2026",
  "header.badge": "SSC 2026",
  "header.hospital": "Hospital Municipal de Morrinhos",
  "header.autor": "Dr. Ivaldo Inácio Silva Júnior",
  "header.cargo": "Diretor Técnico do Hospital Municipal de Morrinhos",
  "footer.fonte": "Baseado nas diretrizes Surviving Sepsis Campaign (SSC) 2026",
  "footer.autor": "Dr. Ivaldo Inácio Silva Júnior",
  "footer.cargo": "Diretor Técnico do Hospital Municipal de Morrinhos",
  "scores.news.detail": "Pontuação de triagem para sepse · NOTÍCIAS ≥ 4 = alta acurácia",
  "scores.sofa.detail": "Disfunção orgânica · SOFA ≥ 2 + infecção = Sepse",
  "pop.titulo": "PROCEDIMENTO OPERACIONAL PADRÃO - POP",
  "pop.subtitulo": "TÍTULO: PROTOCOLO DE SEPSE",
  "pop.codigo": "Código: POP-HMM-001",
  "pop.versao": "VERSÃO: 01",
  "pop.pagina": "PÁGINA 1",
  "pop.data_elab": "25/05/2026",
  "pop.data_aprov": "26/05/2026",
  "pop.data_rev": "26/05/2027",
  
  // Seções labels
  "s1.label": "2 — TRIAGEM COM ESCORE NEWS",
  "s2.label": "3 — ESCOR SOFA",
  "s3.label": "1 — NOVA CLASSIFICAÇÃO DA SEPSE (SSC 2026)",
  "s4.label": "4 — PACOTE DA 1ª HORA (SSC 2026)",
  "s5.label": "5 — SUPORTE HEMODINÂMICO E VASOPRESSORES",
  "s6.label": "6 — ANTIBIOTICOTERAPIA EMPÍRICA POR FOCO SUSPEITO DE INFECÇÃO",
  "s7.label": "7 — CUIDADOS GERAIS E PROFILAXIAS",

  // NEWS FR
  "s1.fr.titulo": "Frequência Respiratória",
  "s1.fr.sub": "Incursões respiratórias por minuto - IRPM",
  "s1.fr.range": "0–3 pontos",
  "s1.fr.blk1.titulo": "COMO AVALIAR",
  "s1.fr.blk1.texto": "Contar os movimentos respiratórios por um minuto completo.",
  "s1.fr.blk2.titulo": "Atenção",
  "s1.fr.blk2.texto": "Pacientes sépticos frequentemente apresentam taquipneia precoce como primeiro sinal de alerta.",
  "s1.fr.opts.label": "Selecione o valor",
  "s1.fr.opt.3": "≤ 8 irpm",
  "s1.fr.opt.2a": "9 a 11 irpm",
  "s1.fr.opt.1": "12 a 20 irpm",
  "s1.fr.opt.0": "21 a 24 irpm",
  "s1.fr.opt.2b": "≥ 25 irpm",

  // NEWS SpO2
  "s1.sat.titulo": "Saturação periférica de oxigênio (SpO₂)",
  "s1.sat.sub": "Oximetria",
  "s1.sat.range": "0–3 pts",
  "s1.sat.opts.label": "Selecione o valor",
  "s1.sat.blk1.texto": "Saturação periférica de oxigênio (SpO₂) através do oxímetro.",
  "s1.sat.opt.3": "≤ 91%",
  "s1.sat.opt.2": "92 a 93%",
  "s1.sat.opt.1": "94 a 95%",
  "s1.sat.opt.0": "> 96%",

  // NEWS O2 Supp
  "s1.o2.titulo": "O2 Suplementar",
  "s1.o2.sub": "Uso de oxigenoterapia no momento da avaliação clínica",
  "s1.o2.range": "0 ou 2 pts",
  "s1.o2.opts.label": "Selecione",
  "s1.o2.opt.0": "Não —> Paciente em ar ambiente",
  "s1.o2.opt.2": "Sim —> Paciente em uso de O₂ suplementar",

  // NEWS Temp
  "s1.temp.titulo": "Temperatura",
  "s1.temp.sub": "Temperatura em °C",
  "s1.temp.range": "0–3 pts",
  "s1.temp.opts.label": "Selecione o valor",
  "s1.temp.blk1.titulo": "Atenção clínica",
  "s1.temp.blk1.texto": "Idosos e imunodeficientes podem não apresentar febre e cursar com hipotermia como sinal de sepse.",
  "s1.temp.opt.3": "≤ 35,0°C",
  "s1.temp.opt.1a": "35,1 a 36,0°C",
  "s1.temp.opt.0": "36,1 a 38,0°C",
  "s1.temp.opt.1b": "38,1 a 39,0°C",
  "s1.temp.opt.2": "≥ 39,1°C",

  // NEWS PAS
  "s1.pas.titulo": "Pressão Arterial Sistólica",
  "s1.pas.sub": "Valor em mmHg",
  "s1.pas.range": "0–3 pts",
  "s1.pas.opts.label": "Selecione o valor",
  "s1.pas.blk1.titulo": "Alerta crítico",
  "s1.pas.blk1.texto": "PAS ≤ 90 mmHg em contexto de infecção sugere choque séptico. Iniciar vasopressor sem demora.",
  "s1.pas.opt.3a": "≤ 90 mmHg",
  "s1.pas.opt.2": "91 a 100 mmHg",
  "s1.pas.opt.1": "101 a 110 mmHg",
  "s1.pas.opt.0": "111 a 219 mmHg",
  "s1.pas.opt.3b": "≥ 220 mmHg",

  // NEWS FC
  "s1.fc.titulo": "Frequência Cardíaca",
  "s1.fc.sub": "Batimentos por minuto · bpm",
  "s1.fc.range": "0–3 pts",
  "s1.fc.opts.label": "Selecione o valor",
  "s1.fc.opt.3a": "≤ 40 bpm",
  "s1.fc.opt.1a": "41 a 50 bpm",
  "s1.fc.opt.0": "51 a 90 bpm",
  "s1.fc.opt.1b": "91 a 110 bpm",
  "s1.fc.opt.2": "111 a 130 bpm",
  "s1.fc.opt.3b": "≥ 131 bpm",

  // NEWS NC
  "s1.nc.titulo": "Nível de Consciência",
  "s1.nc.sub": "Escala AVPU — Alerta, Voz, Dor, Irresponsivo",
  "s1.nc.range": "0 ou 3 pts",
  "s1.nc.opts.label": "Selecione",
  "s1.nc.blk1.titulo": "COMO AVALIAR",
  "s1.nc.blk1.texto": "Classificar o nível de consciência conforme escala AVPU:\n• Alerta (A) — Paciente acordado e responsivo\n• Resposta à voz (V) — Responde a estímulo verbal\n• Resposta à dor (D) — Responde apenas a estímulo doloroso\n• Irresponsivo (I) — Ausência de resposta a qualquer estímulo",
  "s1.nc.opt.0": "Alerta — Paciente consciente, orientado e responsivo",
  "s1.nc.opt.3": "Confusão aguda ou rebaixamento do nível de consciência (V, D ou I na escala AVPU)",

  // SOFA Resp
  "s2.resp.titulo": "Respiração",
  "s2.resp.sub": "Relação PaO₂/FiO₂ (P/F)",
  "s2.resp.range": "0–4 pts",
  "s2.resp.opts.label": "Selecione o valor P/F",
  "s2.resp.blk1.texto": "Calcular a relação PaO₂/FiO₂ utilizando:\n• PaO₂ (mmHg) obtida na gasometria arterial\n• FiO₂ (fração inspirada de oxigênio) estimada conforme o dispositivo de oxigenoterapia\n\nA FiO₂ deve ser considerada conforme o dispositivo de oxigenoterapia utilizado.\nEm pacientes em uso de cateter nasal, a FiO₂ pode ser estimada de forma aproximada conforme o fluxo de oxigênio administrado, devendo ser interpretada como valor não absoluto.\n\nAr ambiente → FiO₂ ≈ 0,21\n\nCateter nasal:\n → 1 L/min → FiO₂ ≈ 0,24\n → 2 L/min → FiO₂ ≈ 0,28\n → 3 L/min → FiO₂ ≈ 0,32\n → 4 L/min → FiO₂ ≈ 0,36\n → 5 L/min → FiO₂ ≈ 0,40",
  "s2.resp.opt.0": "≥ 400",
  "s2.resp.opt.1": "< 400",
  "s2.resp.opt.2": "< 300",
  "s2.resp.opt.3": "< 200 (Com suporte ventilatório)",
  "s2.resp.opt.4": "< 100 (Com suporte ventilatório)",

  // SOFA Plaq
  "s2.plaq.titulo": "Plaquetas",
  "s2.plaq.sub": "Contagem em ×10³/µL",
  "s2.plaq.range": "0–4 pts",
  "s2.plaq.opts.label": "Selecione o valor",
  "s2.plaq.opt.0": "≥ 150.000",
  "s2.plaq.opt.1": "< 150.000",
  "s2.plaq.opt.2": "< 100.000",
  "s2.plaq.opt.3": "< 50.000",
  "s2.plaq.opt.4": "< 20.000",

  // SOFA Bili
  "s2.bili.titulo": "Bilirrubinas",
  "s2.bili.sub": "Bilirrubinas totais em mg/dL",
  "s2.bili.range": "0–4 pts",
  "s2.bili.opts.label": "Selecione o valor",
  "s2.bili.opt.0": "< 1,2 mg/dL",
  "s2.bili.opt.1": "1,2 a 1,9 mg/dL",
  "s2.bili.opt.2": "2,0 a 5,9 mg/dL",
  "s2.bili.opt.3": "6,0 a 11,9 mg/dL",
  "s2.bili.opt.4": "> 12 mg/dL",

  // SOFA CV
  "s2.cv.titulo": "Cardiovascular (PAM / Vasopressores)",
  "s2.cv.sub": "Pressão arterial média e drogas vasoativas",
  "s2.cv.range": "0–4 pts",
  "s2.cv.opts.label": "Selecione",
  "s2.cv.blk1.titulo": "Referência de doses",
  "s2.cv.blk1.texto": "VASOPRESSORES — EXEMPLO PRÁTICO\nPaciente: 70 kg\nVazão da BIC: 12 mL/h\n\n🔴 NORADRENALINA\nPreparo padrão:\n4 ampolas de noradrenalina\nCada ampola: 4 mL, concentração 1 mg/mL\nTotal: 16 mg\n\nDiluir em SF 0,9% ou SG 5%\nVolume final da solução 250 mL\n\n16.000 mcg ÷ 250ml = Concentração final 64 mcg/mL\n\nFórmula: mcg/kg/min = (concentração em mcg/mL × vazão em mL/h) ÷ (peso × 60)\n\nCálculo:\nmcg/kg/min = (64 × 12) ÷ (70 × 60)\nmcg/kg/min = 768 ÷ 4200\nmcg/kg/min = 0,18\n\n🔴 DOBUTAMINA\nPreparo padrão:\n2 ampolas de dobutamina\nCada ampola: 20 mL, concentração 12,5 mg/mL\nTotal: 500 mg\n\nDiluir em SF 0,9% ou SG 5%\nVolume final da solução 250 mL\n\n500 mg × 1.000mcg = 500.000 mcg ÷ 250ml = Concentração final 2.000 mcg/mL\n\nFórmula: mcg/kg/min = (concentração em mcg/mL × vazão em mL/h) ÷ (peso × 60)\n\nCálculo:\nmcg/kg/min = (2000 × 12) ÷ (70 × 60)\nmcg/kg/min = 24000 ÷ 4200\nmcg/kg/min = 5,71\n\n🔴 DOPAMINA\nPreparo padrão:\n5 ampolas de dopamina\nCada ampola: 10 mL, concentração 5 mg/mL\nTotal: 250 mg\n\nDiluir em SF 0,9% ou SG 5%\nVolume final da solução 250 mL\n\n250 mg × 1.000 mcg = 250.000 mcg ÷ 250ml = Concentração final 1.000 mcg/mL\n\nFórmula: mcg/kg/min = (concentração em mcg/mL × vazão em mL/h) ÷ (peso × 60)\n\nCálculo:\nmcg/kg/min = (1000 × 12) ÷ (70 × 60)\nmcg/kg/min = 12000 ÷ 4200\nmcg/kg/min = 2,86",
  "s2.cv.opt.0": "PAM ≥ 70 mmHg",
  "s2.cv.opt.1": "PAM < 70 mmHg",
  "s2.cv.opt.2": "Dopamina ≤ 5 mcg/kg/min \n         ou \nDobutamina (qualquer dose)",
  "s2.cv.opt.3": "Dopamina 5,1–15 mcg/kg/min \n         ou\nNora ≤ 0,1 mcg/kg/min",
  "s2.cv.opt.4": "Dopamina > 15 mcg/kg/min\n         ou\nNora > 0,1 mcg/kg/min",

  // SOFA Glas
  "s2.glas.titulo": "Neurológico — Escala de Glasgow",
  "s2.glas.sub": "Pontuação total da Escala de Coma de Glasgow",
  "s2.glas.range": "0–4 pts",
  "s2.glas.opts.label": "Selecione o Glasgow",
  "s2.glas.opt.0": "15",
  "s2.glas.opt.1": "13 a 14",
  "s2.glas.opt.2": "10 a 12",
  "s2.glas.opt.3": "6 a 9",
  "s2.glas.opt.4": "< 6",

  // SOFA Ren
  "s2.ren.titulo": "Renal (Creatinina / Débito Urinário)",
  "s2.ren.sub": "Creatinina sérica mg/dL ou DU mL/dia",
  "s2.ren.range": "0–4 pts",
  "s2.ren.opts.label": "Selecione o pior valor",
  "s2.ren.opt.0": "< 1,2 mg/dL",
  "s2.ren.opt.1": "1,2 a 1,9 mg/dL",
  "s2.ren.opt.2": "2,0 a 3,4 mg/dL",
  "s2.ren.opt.3": "3,5 a 4,9 mg/dL ou DU < 500 mL/dia",
  "s2.ren.opt.4": "5,0 mg/dL ou DU < 200 mL/dia",

  // Classificação
  "s3.titulo": "Sepse e Choque Séptico",
  "s3.sub": "",
  "s3.range": "SSC 2026",
  "s3.blk1.texto": "A sepse é definida como uma disfunção orgânica aguda, decorrente de uma resposta desregulada do organismo a um processo infeccioso. Trata-se de uma condição de elevada morbimortalidade, cujo reconhecimento precoce e início imediato do tratamento são determinantes para o desfecho clínico.\n\n\nNo contexto assistencial, a identificação da sepse deve basear-se na: \n• Presença de infecção (suspeita ou confirmada);\n• Associada a disfunção orgânica significativa, caracterizada por aumento de 2 ou mais pontos no escore SOFA (Sequential Organ Failure Assessment) em relação ao estado basal do paciente.\n\nO choque séptico é definido por: \n- Hipotensão persistente, com necessidade de uso de vasopressores para manter PAM ≥ 65 mmHg;\n- Lactato sérico ≥ 2 mmol/L(> 18 mg/dL), mesmo após adequada ressuscitação volêmica.",
  "s3.c1.titulo": "SEPSE IMPROVÁVEL",
  "s3.c1.desc": "Baixa probabilidade de sepse; \nA disfunção orgânica neste caso é mais bem explicada por causa não infecciosa; \nSendo mais provável um diagnóstico alternativo. \n\n# APLICAÇÃO CLÍNICA:\nHá suspeita de infecção?\n→ Não\n\nHá disfunção orgânica?\n→ Sim\n\nHá causa não infecciosa que explique o quadro?\n→ Sim\n\n# CONDUTAS: \n• Não iniciar ATB empiricamente; \n• Investigar as causas alternativas;",
  "s3.c2.titulo": "SEPSE POSSÍVEL",
  "s3.c2.desc": "Há disfunção orgânica e suspeita de infecção. Porém, o diagnóstico ainda não é claro.\n\n# APLICAÇÃO CLÍNICA:\nHá suspeita de infecção?\n→ Possível\n\nHá disfunção orgânica associada?\n→ Presente\n\nHá confirmação diagnóstica no momento?\n→ Não\n\n# CONDUTAS: \n• Investigação rápida + ATB em até 3 horas se infecção persistir (Recomendação CONDICIONAL)",
  "s3.c3.titulo": "SEPSE PROVÁVEL",
  "s3.c3.desc": "Infecção suspeita com alta probabilidade, associada a disfunção orgânica (SOFA ≥ 2). \nMesmo sem confirmação diagnóstica. \n\n# APLICAÇÃO CLÍNICA:\nHá alta suspeita de infecção? \n→ Sim\n\nHá disfunção orgânica (SOFA ≥ 2)? \n→ Sim\n\nHá confirmação diagnóstica? \n→ Não\n\n# CONDUTAS: \n• Conduzir como sepse;\n• ATB imediatamente (Meta < 1 hora)",
  "s3.c4.titulo": "SEPSE DEFINIDA",
  "s3.c4.desc": "Infecção confirmada associada à disfunção orgânica (SOFA ≥ 2), com diagnóstico estabelecido com base em critérios clínicos e/ou laboratoriais. Sendo improvável outra etiologia para o quadro.\n\n# APLICAÇÃO CLÍNICA\nHá confirmação de infecção?\n→ Sim\n\nHá disfunção orgânica (SOFA ≥ 2)?\n→ Sim\n\nHá outro diagnóstico que explique melhor o quadro?\n→ Não\n\n# CONDUTAS\n• Iniciar protocolo de SEPSE, com ATB imediatamente (Meta < 1 hora)\n• Ajustar antibioticoterapia conforme foco e resultados microbiológicos",

  // 1ª Hora
  "s4.titulo": "Checklist de Ações Imediatas",
  "s4.sub": "Marque cada item conforme execução",
  "s4.range": "1ª hora",
  "s4.blk1.texto": "Na sepse definida/provável, o ATB deve ser iniciado em até 1 hora do reconhecimento. Não aguarde resultados de exames.",

  // Vasopressores
  "s5.titulo": "Noradrenalina / Vasopressina / Corticoide",
  "s5.sub": "Doses, indicações e prescrições práticas",
  "s5.range": "Choque séptico",
  "s5.blk1.texto": "PAM ≥ 65 mmHg em adultos\nPAM 60 a 65 mmHg em idosos \nLactato < 2 mmol/L (<18mg/dL) \nDiurese > 0,5 mL/kg/h",
  "s5.blk2.texto": "A noradrenalina pode ser iniciada em acesso venoso periférico proximal calibroso, sem necessidade de aguardar acesso venoso central. ",
  "s5.nora.label": "Noradrenalina — 1ª escolha no choque séptico",
  "s5.nora.indicacao": "Indicação: PAM < 65 mmHg persistente após expansão volêmica adequada",
  "s5.nora.meta": "Meta: PAM > 65 mmHg (adultos) PAM 60–65 mmHg (idosos)",
  "s5.nora.rx.label": "Prescrição prática (paciente 70 kg)",
  "s5.nora.rx.texto": "Noradrenalina (1 mg/mL) 4 amp + 234 mL SG 5% ou SF 0,9%  \nEV em BIC \nConcentração 64mcg/mL\nIniciar a 5 mL/h e titular conforme resposta hemodinâmica\n\nFórmula: \nmcg/kg/min = (concentração em mcg/mL × vazão em mL/h) ÷ (peso × 60)\n\nCálculo: \nmcg/kg/min = (64 × 5) ÷ (70 × 60)mcg/kg/min \n 320÷ 4200  \n0,076 mcg/kg/min ",
  "s5.vaso.label": "Vasopressina — 2ª escolha",
  "s5.vaso.indicacao": "Indicação: Nora > 0,25 a 0,50 mcg/kg/min",
  "s5.vaso.rx.label": "Prescrição prática",
  "s5.vaso.rx.texto": "Vasopressina (1 amp = 20 U) \nVasopressina 02 amp (40U)  + 98 mL SF 0,9%   \nEV   em BIC \n- Iniciar 1 mL/h \n- Até 6 mL/h",
  "s5.corti.label": "CORTICOSTEROIDES",
  "s5.corti.indicacao": "Indicações, Doses e Atualização – 2024 Focused Update",
  "s5.corti.rx.label": "APLICAÇÃO PRÁTICA ",
  "s5.corti.rx.texto": "Avaliar Indicação Clínica:\n- Choque Séptico\n- SDRA (Síndrome do Desconforto Respiratório Agudo)\n - Pneumonia Adquirida na Comunidade (PAC Grave)\n\nSDRA – SÍNDROME DO DESCONFORTO RESPIRATÓRIO AGUDO\n │── Quando usar:\n │     • SDRA moderada a grave (PaO₂/FiO₂ ≤ 200)\n │\n │      Doses:\n │     • Dexametasona: 20 mg/dia IV (5d) → 10 mg/dia IV (5d)\n │      \n │     • Metilprednisolona: 1–2 mg/kg/dia IV (com redução gradual)\n │\n │       Duração:\n │     • Até extubação (5–28 dias)\n\n──────────────────────────────────────────────\nCHOQUE SÉPTICO\n │── Doses:\n │     • Hidrocortisona 200–300 mg/dia IV (dividida ou infusão contínua)\n │     • Fludrocortisona 50 µg/dia VO (opcional, reforço mineralocorticoide)\n │\n │── Duração:\n │     • 5–7 dias OU até retirada dos vasopressores\n                     \n──────────────────────────────────────────────\n\nSDRA – SÍNDROME DO DESCONFORTO RESPIRATÓRIO AGUDO\n │──  Quando usar:\n │     • SDRA moderada a grave (PaO₂/FiO₂ ≤ 200)\n │\n │      Doses:\n │     • Dexametasona: 20 mg/dia IV (5d) → 10 mg/dia IV (5d)\n │      \n │     • Metilprednisolona: 1–2 mg/kg/dia IV (com redução gradual)\n │\n │       Duração:\n │     • Até extubação (5–28 dias)\n │      \n │── SDRA – Nova Definição 2023\n │     • Lesão pulmonar inflamatória aguda e difusa → causando: hipoxemia grave.\n │     • Desencadeada por: pneumonia, sepse, trauma, transfusão, queimadura, aspiração, choque\n │\n │\n │      Classificação de gravidade (oxigenação):\n \n     👉 Se o paciente estiver INTUBADO\nGravidade\t        PaO₂/FiO₂ \t        SpO₂/FiO₂ \nGrave\t                   ≤100\t                  < 148\nModerada\t        101–200\t                 148–235\nLeve\t                 201–300\t                 235–315\n\n👉 Se o paciente NÃO estiver INTUBADO \n            SpO₂/FiO₂ <315 com:\n \nCNAF ≥ 30 L/min ou VNI ≥ 5 cmH₂O \n\n\n👉 Se o hospital for de RECURSOS LIMITADOS \n            SpO₂/FiO₂ <315, mesmo sem PEEP mínima \n\n\nPrincipais ATUALIZAÇÕES em 2023:\n* Inclusão = Cateter nasal de alto fluxo (CNAF ≥ 30 L/min)\n* Ultrassonografia pulmonar pode confirmar infiltrados bilaterais \n* Se não há gasometria → Usar relação →  SpO₂/FiO₂ ≤ 315 →  substitui PaO₂/FiO₂\n* Critérios adaptados para países com recursos limitados\n\n──────────────────────────────────────────────\nPNEUMONIA ADQUIRIDA NA COMUNIDADE (PAC GRAVE)\n │──  Doses:\n │     • Hidrocortisona: 200 mg IV bolus + 10 mg/h infusão contínua (7d)\n │     • Metilprednisolona: 0,5 mg/kg IV a cada 12h (5–7d)\n │\n │       Quando usar:\n │     • Hospitalizados;\n │     • PSI IV–V\n │     • Em Ventilação Mecânica \n │     • Em uso de Vasopressor\n │── SCORES → CURB-65; ATS/IDSA; PSI; PORT; \n │  \n │          # CURB-65\n │         – Confusão mental\n │         – Ureia > 50 mg/dL\n │         – Respiração > 30 irpm\n │         – PAS < 90 ou PAD < 60 mmHg\n │         – Idade ≥ 65 anos\n │         \n │         – **Interpretação:**\n │         – 0–1 → ambulatorial\n │         –  2 → considerar internação\n │         –  ≥3 → internação hospitalar\n │         – 4–5 → avaliar UTI\n │         \n │        \n │          # ATS/IDSA → Segundo a American Thoracic Society/Infectious Diseases Society of America \n │\n │     • 1 critério maior:\n │         – VM invasiva OU choque séptico com vasopressor\n │\n │          OU \n │\n │          ≥3 critérios menores:\n │         – FR ≥ 30\n │         – PaO₂/FiO₂ ≤ 250\n │         – Multilobaridade\n │         – Confusão/desorientação\n │         – Uremia (BUN ≥ 20 mg/dL)\n │         – Leucopenia < 4.000/mm³\n │         – Plaquetas < 100.000/mm³\n │         – Hipotermia < 36 °C\n │         – Hipotensão com reposição agressiva\n │\n │\n │          # PSI (Pneumonia Severity Index) – Escore PORT\n │       \n │         – PORT =  O escore de pontos (a conta ). \n │                           É a lista de variáveis que somam pontos para estimar risco.\n │  \n │ \n │         – PSI  =  a classificação em classes I–V  (o resultado). \n │                       Você usa a soma do PORT para cair numa  classe de risco e decidir conduta.\n │        \n\n │     👉 Em outras palavras: \n │         – PORT (soma de pontos) → Define a classe \n │                         \n │         – PSI (I a V) → orienta a conduta (ambulatorial, enfermaria, UTI). │        \n \n[Paciente com PAC confirmada/suspeita]\n                     │\n                    ▼\n1) TRIAGEM PARA CLASSE I (regra “rápida”)\n   • Idade < 50\n   • Estado mental normal\n   • FC < 125\n   • FR < 30\n   • PAS > 90\n   • Temp 35–40°C\n   • Sem: câncer ativo, ICC, doença cerebrovascular, renal ou hepática\n   │\n   │── Se TUDO OK → PSI Classe I (risco muito baixo) → ambulatorial\n   │\n   │── Se QUALQUER item falhar → vá para 2\n   │\n  ▼\n2) CALCULAR O ESCORE PORT (soma de pontos)\n    2.1) Fórmula-base\n\n* Homem: PSI parcial = idade (anos) + pontos das características\n\n* Mulher: PSI parcial = idade (anos) − 10 + pontos das característica\n\n2.2) Características que somam pontos\nMAPEAR PONTOS → CLASSE PSI\n   Classe II: < 70\n   Classe III: 71–90\n   Classe IV: 91–130\n   Classe V: > 130\n    \n     │\n    ▼\n3) CONDUTA\n   I–II → ambulatorial\n   III  → individualizar (observação curta vs. internação breve)\n   IV–V → internação; Classe V: considerar UTI\n\n\n PORT (Soma de pontos)\n\n2) Características que somam pontos\nCaracterística\tPontos\nReside em abrigo\t              +10\nNeoplasia maligna ativa\t      +30\nDoença hepática\t              +20\nInsuficiência cardíaca\t      +10\nDoença cerebrovascular.     +10\nDoença renal\t\t              +10\nConfusão mental\t\t      +20\nFR > 30 irpm\t\t              +20\nPAS < 90 mmHg.                  +20\n\nTemperatura \n< 35°C ou > 40°C\t               +15\n\nFC ≥ 125 bpm\t                                         +10\npH < 7,35                                                 +30\nUreia > 65 mg/dL (BUN ≥ 43 mg/dL)\t+20\nSódio < 130 mEq/L\t                                 +20\nGlicose > 250 mg/dL\t                         +10\nHematócrito < 30%\t                         +10\nPaO₂ < 60 mmHg ou SaO₂ < 90%. \t+10\nDerrame pleural\t                                  +10\n\n\n⚠️ Se o paciente passou na triagem rápida da Classe I (todos os itens ok), não precisa calcular PORT: ele já é Classe I.",

  // Antibióticos foco
  "s6.titulo": "Antibioticoterapia empírica por foco suspeito de infecção",
  "s6.sub": "TABELA 01 (FOCO SUSPEITO DE INFECÇÃO / ANTIBIOTICOTERAPIA SUGERIDA) ",
  "s6.range": "Amplo espectro",
  "s6.blk1.texto": "Recomenda-se que a prescrição empírica seja guiada conforme as orientações da TABELA 01, associada à discussão com a Infectologia.\n\nDiscutir com Infectologista",
  "s6.t.pulm.foco": "Pulmonar",
  "s6.t.pulm.rx": "Piperacilina-Tazobactam 4,5g \n      + \n                                EV    6/6H      Administrar em 01 hora \n100mL SF 0,9% \n \ne\n\nAZITROMICINA 500MG       01 CP      1X AO DIA      POR 5 DIAS",
  "s6.t.abd.foco": "Abdominal",
  "s6.t.abd.rx": "Piperacilina-Tazobactam 4,5g \n      + \n                                EV    6/6H      Administrar em 01 hora \n100mL SF 0,9% ",
  "s6.t.urin.foco": "Urinário",
  "s6.t.urin.rx": "Piperacilina-Tazobactam 4,5g \n      + \n                                EV    6/6H      Administrar em 01 hora \n100mL SF 0,9% ",
  "s6.t.mening.foco": "Meningite",
  "s6.t.mening.rx": "Ceftriaxona 2g \n      + \n                                EV    12/12H   Administrar em 01 hora \n100mL SF 0,9%  \n\nEm suspeita de infecção por Listeria nos seguintes pacientes (criança, idoso, gestante, imunocomprometidos) Associar: \nAmpicilina 2g \n      + \n                                EV    4/4H   Administrar em 01 hora \n100mL SF 0,9%  ",
  "s6.t.cut.foco": "Cutâneo",
  "s6.t.cut.rx": "Ceftriaxona 2g \n      + \n                                EV    24/24H      Administrar em 01 hora \n100mL SF 0,9% \n \n\nAssociar:\nOxacilina 2g \n      + \n                                EV    4/4H      Administrar em 01 hora \n100mL SF 0,9% \n \n\nOU\n\nClindamicina 600mg \n      + \n                                EV    6/6H      Administrar em 01 hora \n100mL SF 0,9% ",
  "s6.t.sangue.foco": "Corrente sanguínea",
  "s6.t.sangue.rx": "Remover dispositivos\n\nPiperacilina-Tazobactam 4,5g \n      + \n                                EV    6/6H      Administrar em 01 hora \n100mL SF 0,9% \n\n              e\n\nVancomicina 15–20mg/kg \n      + \n                                EV    12/12H      Administrar em 01 hora \n100mL SF 0,9% ",
  "s6.t.sfoco.foco": "Sem foco evidente",
  "s6.t.sfoco.rx": "Piperacilina-Tazobactam 4,5g \n      + \n                                EV    6/6H      Administrar em 01 hora \n100mL SF 0,9% ",

  // Cuidados
  "s7.titulo": "Checklist de Cuidados e Profilaxias",
  "s7.sub": "VM · TEV · LAMG · Glicemia · Monitorização",
  "s7.range": "Internação"
};

export const INITIAL_CHECKLISTS: { pacote: CheckItem[]; cuidados: CheckItem[] } = {
  pacote: [
    {
      html: "<b>Monitorização de sinais vitais com suporte</b><br>   • PA, FC, FR, SPO₂ e Nível de consciência.",
      urgent: false
    },
    {
      html: "<b>Garantir acesso venoso periférico calibroso</b> (preferencialmente 2 acessos periféricos, sendo com 18G ou 20G)<br><br>⚠️ Considerar acesso central conforme necessidade",
      urgent: true
    },
    {
      html: "<b>Expansão volêmica com 30 mL/kg Ringer Lactato em até 3h</b><br><br> ⚠️ Individualizar conforme o paciente:<br>• Idosos / cardiopatas / nefropatas → considerar menor volume<br> • Pacientes jovens → podem tolerar maior volume",
      urgent: false
    },
    {
      html: "<b>Cabeceira elevada</b> 30 a 45°",
      urgent: false
    },
    {
      html: "<b>Dieta zero</b> até estabilização",
      urgent: false
    },
    {
      html: "<b>Lactato sérico</b> ",
      urgent: false
    },
    {
      html: "<b>Hemoculturas (2 pares ou seja 4 amostras em locais diferentes). Associar outras culturas conforme o foco suspeito (ex.: urocultura em suspeita de infecção urinária).</b><br><br>ATENÇÃO: A coleta deve preceder a antibioticoterapia sempre que possível, não devendo retardar seu início por mais de 45 minutos.",
      urgent: false
    },
    {
      html: "<b>Iniciar antibioticoterapia de amplo espectro precocemente (orientar pelo foco suspeito — ver tabela) Tempo para início:</b><br>• Até 1 hora: sepse provável, sepse definida ou choque séptico<br>• Até 3 horas: sepse possível (Realizar investigação inicial e iniciar antibioticoterapia conforme evolução)<br><br> ⚠️ Priorizar coleta de culturas, sem retardar o ATB por mais de 45 min",
      urgent: true
    },
    {
      html: "<b>Gasometria arterial</b>",
      urgent: false
    },
    {
      html: "<b>Hemograma</b>",
      urgent: false
    },
    {
      html: "<b>Bilirrubinas<b>",
      urgent: false
    },
    {
      html: "<b>Ureia</b> ",
      urgent: false
    },
    {
      html: "<b>Creatinina</b>",
      urgent: false
    },
    {
      html: "<b>PCR (Proteína C Reativa)</b> e outros marcadores inflamatórios",
      urgent: false
    }
  ],
  cuidados: [
    {
      html: "<b>VM protetora</b> (se intubado): VC 6–8 mL/kg peso ideal · Pressão platô < 30 cmH₂O",
      urgent: false
    },
    {
      html: "<b>Profilaxia TEV</b>: Enoxaparina 40mg SC 1x/dia ou HNF 5.000U SC 3x/dia",
      urgent: false
    },
    {
      html: "<b>Profilaxia LAMG</b>: Pantoprazol ou Omeprazol 40mg EV 24/24h",
      urgent: false
    },
    {
      html: "<b>Controle glicêmico</b>: Alvo 140–180 mg/dL",
      urgent: false
    },
    {
      html: "<b>Sonda vesical de demora</b> + balanço hídrico rigoroso",
      urgent: false
    },
    {
      html: "<b>Monitorização contínua</b>: ECG, SpO₂, PA, FC, Diurese",
      urgent: false
    },
    {
      html: "<b>Acesso Venoso Central</b> providenciar se manter vasopressor",
      urgent: false
    }
  ]
};

export const NEWS_RAW_GRID_PARAMETERS: SepsisParameter[] = [
  {
    id: "fr",
    titleKey: "s1.fr.titulo",
    subKey: "s1.fr.sub",
    howToKey: "s1.fr.blk1.texto",
    attentionKey: "s1.fr.blk2.texto",
    options: [
      { score: 3, labelKey: "s1.fr.opt.3", scoreClass: "c3" },
      { score: 2, labelKey: "s1.fr.opt.2a", scoreClass: "c2" },
      { score: 1, labelKey: "s1.fr.opt.1", scoreClass: "c1" },
      { score: 0, labelKey: "s1.fr.opt.0", scoreClass: "c0" },
      { score: 2, labelKey: "s1.fr.opt.2b", scoreClass: "c2" },
    ]
  },
  {
    id: "o2",
    titleKey: "s1.o2.titulo",
    subKey: "s1.o2.sub",
    howToKey: "s1.o2.sub",
    options: [
      { score: 0, labelKey: "s1.o2.opt.0", scoreClass: "c0" },
      { score: 2, labelKey: "s1.o2.opt.2", scoreClass: "c2" },
    ]
  },
  {
    id: "sat",
    titleKey: "s1.sat.titulo",
    subKey: "s1.sat.sub",
    howToKey: "s1.sat.blk1.texto",
    options: [
      { score: 3, labelKey: "s1.sat.opt.3", scoreClass: "c3" },
      { score: 2, labelKey: "s1.sat.opt.2", scoreClass: "c2" },
      { score: 1, labelKey: "s1.sat.opt.1", scoreClass: "c1" },
      { score: 0, labelKey: "s1.sat.opt.0", scoreClass: "c0" },
    ]
  },
  {
    id: "temp",
    titleKey: "s1.temp.titulo",
    subKey: "s1.temp.sub",
    howToKey: "s1.temp.blk1.texto",
    options: [
      { score: 3, labelKey: "s1.temp.opt.3", scoreClass: "c3" },
      { score: 1, labelKey: "s1.temp.opt.1a", scoreClass: "c1" },
      { score: 0, labelKey: "s1.temp.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s1.temp.opt.1b", scoreClass: "c1" },
      { score: 2, labelKey: "s1.temp.opt.2", scoreClass: "c2" },
    ]
  },
  {
    id: "pas",
    titleKey: "s1.pas.titulo",
    subKey: "s1.pas.sub",
    howToKey: "s1.pas.blk1.texto",
    options: [
      { score: 3, labelKey: "s1.pas.opt.3a", scoreClass: "c3" },
      { score: 2, labelKey: "s1.pas.opt.2", scoreClass: "c2" },
      { score: 1, labelKey: "s1.pas.opt.1", scoreClass: "c1" },
      { score: 0, labelKey: "s1.pas.opt.0", scoreClass: "c0" },
      { score: 3, labelKey: "s1.pas.opt.3b", scoreClass: "c3" },
    ]
  },
  {
    id: "fc",
    titleKey: "s1.fc.titulo",
    subKey: "s1.fc.sub",
    howToKey: "s1.fc.sub",
    options: [
      { score: 3, labelKey: "s1.fc.opt.3a", scoreClass: "c3" },
      { score: 1, labelKey: "s1.fc.opt.1a", scoreClass: "c1" },
      { score: 0, labelKey: "s1.fc.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s1.fc.opt.1b", scoreClass: "c1" },
      { score: 2, labelKey: "s1.fc.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s1.fc.opt.3b", scoreClass: "c3" },
    ]
  },
  {
    id: "nc",
    titleKey: "s1.nc.titulo",
    subKey: "s1.nc.sub",
    howToKey: "s1.nc.blk1.texto",
    options: [
      { score: 0, labelKey: "s1.nc.opt.0", scoreClass: "c0" },
      { score: 3, labelKey: "s1.nc.opt.3", scoreClass: "c3" },
    ]
  }
];

export const SOFA_RAW_GRID_PARAMETERS: SepsisParameter[] = [
  {
    id: "resp",
    titleKey: "s2.resp.titulo",
    subKey: "s2.resp.sub",
    howToKey: "s2.resp.blk1.texto",
    options: [
      { score: 0, labelKey: "s2.resp.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s2.resp.opt.1", scoreClass: "c1" },
      { score: 2, labelKey: "s2.resp.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s2.resp.opt.3", scoreClass: "c3" },
      { score: 4, labelKey: "s2.resp.opt.4", scoreClass: "c4" },
    ]
  },
  {
    id: "plaq",
    titleKey: "s2.plaq.titulo",
    subKey: "s2.plaq.sub",
    howToKey: "s2.plaq.sub",
    options: [
      { score: 0, labelKey: "s2.plaq.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s2.plaq.opt.1", scoreClass: "c1" },
      { score: 2, labelKey: "s2.plaq.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s2.plaq.opt.3", scoreClass: "c3" },
      { score: 4, labelKey: "s2.plaq.opt.4", scoreClass: "c4" },
    ]
  },
  {
    id: "bili",
    titleKey: "s2.bili.titulo",
    subKey: "s2.bili.sub",
    howToKey: "s2.bili.sub",
    options: [
      { score: 0, labelKey: "s2.bili.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s2.bili.opt.1", scoreClass: "c1" },
      { score: 2, labelKey: "s2.bili.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s2.bili.opt.3", scoreClass: "c3" },
      { score: 4, labelKey: "s2.bili.opt.4", scoreClass: "c4" },
    ]
  },
  {
    id: "cv",
    titleKey: "s2.cv.titulo",
    subKey: "s2.cv.sub",
    howToKey: "s2.cv.blk1.texto",
    options: [
      { score: 0, labelKey: "s2.cv.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s2.cv.opt.1", scoreClass: "c1" },
      { score: 2, labelKey: "s2.cv.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s2.cv.opt.3", scoreClass: "c3" },
      { score: 4, labelKey: "s2.cv.opt.4", scoreClass: "c4" },
    ]
  },
  {
    id: "glas",
    titleKey: "s2.glas.titulo",
    subKey: "s2.glas.sub",
    howToKey: "s2.glas.sub",
    options: [
      { score: 0, labelKey: "s2.glas.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s2.glas.opt.1", scoreClass: "c1" },
      { score: 2, labelKey: "s2.glas.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s2.glas.opt.3", scoreClass: "c3" },
      { score: 4, labelKey: "s2.glas.opt.4", scoreClass: "c4" },
    ]
  },
  {
    id: "ren",
    titleKey: "s2.ren.titulo",
    subKey: "s2.ren.sub",
    howToKey: "s2.ren.sub",
    options: [
      { score: 0, labelKey: "s2.ren.opt.0", scoreClass: "c0" },
      { score: 1, labelKey: "s2.ren.opt.1", scoreClass: "c1" },
      { score: 2, labelKey: "s2.ren.opt.2", scoreClass: "c2" },
      { score: 3, labelKey: "s2.ren.opt.3", scoreClass: "c3" },
      { score: 4, labelKey: "s2.ren.opt.4", scoreClass: "c4" },
    ]
  }
];
