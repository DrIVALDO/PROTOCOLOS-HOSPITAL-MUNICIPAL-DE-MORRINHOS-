
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportProtocolsToWord() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Cover Page
          new Paragraph({
            text: "HOSPITAL MUNICIPAL DE MORRINHOS",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: "MANUAL DE PROTOCOLOS ASSISTENCIAIS",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Versão 2026.1",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 1200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Diretor Técnico: Dr. Ivaldo Inácio Silva Júnior",
                italics: true,
                size: 20,
              }),
            ],
          }),

          // Page Break / New Section
          new Paragraph({ text: "", pageBreakBefore: true }),

          // PROTOCOLO AVC
          new Paragraph({
            text: "1. PROTOCOLO DE AVC (ACIDENTE VASCULAR CEREBRAL)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "O Protocolo de AVC do Hospital Municipal de Morrinhos visa a identificação precoce e o tratamento ágil do AVC isquêmico e hemorrágico, seguindo as diretrizes do Ministério da Saúde.",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "1.1 Manejo Inicial (ABCDE)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• A: Via aérea pérvea", break: 1 }),
              new TextRun({ text: "• B: Respiração adequada (Oximetria ≥ 94%)", break: 1 }),
              new TextRun({ text: "• C: Circulação (Monitorização, Acesso venoso)", break: 1 }),
              new TextRun({ text: "• D: Déficit neurológico (Escala NIHSS)", break: 1 }),
              new TextRun({ text: "• E: Exposição (Temperatura, Glicemia)", break: 1 }),
            ],
          }),

          new Paragraph({
            text: "1.2 AVC Isquêmico Agudo",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Trombólise Intravenosa (< 4,5h): Alteplase 0,9 mg/kg (máx 90mg).", break: 1 }),
              new TextRun({ text: "• Trombectomia Mecânica (6-24h): Oclusão de grande vaso solicitada via regulação.", break: 1 }),
              new TextRun({ text: "• Manejo de PA: Pré-trombólise < 185/110 mmHg.", break: 1 }),
            ],
          }),

          new Paragraph({
            text: "1.3 AVC Hemorrágico",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Manejo de PA: Manter PAS < 140 mmHg nas primeiras 24h.", break: 1 }),
              new TextRun({ text: "• Reversão de Anticoagulação: Complexo Protrombínico + Vitamina K.", break: 1 }),
            ],
          }),

          // TEP PROTOCOL
          new Paragraph({ text: "", pageBreakBefore: true }),
          new Paragraph({
            text: "2. PROTOCOLO DE TEP (TROMBOEMBOLISMO PULMONAR)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Baseado nas diretrizes da European Society of Cardiology (ESC 2019).",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "2.1 Estratificação de Risco",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• ALTO RISCO: Instabilidade Hemodinâmica (Choque, Hipotensão, PCR). Conduta: Fibrinólise.", break: 1 }),
              new TextRun({ text: "• RISCO INTERMEDIÁRIO: Sem instabilidade, mas com Troponina ou Disfunção de VD elevada.", break: 1 }),
              new TextRun({ text: "• BAIXO RISCO: sPESI = 0, Troponinas normais. Considerar alta precoce.", break: 1 }),
            ],
          }),

          new Paragraph({
            text: "2.2 Tratamento Farmacológico",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
             text: "A) Anticoagulantes Orais (Baixo Risco):",
             heading: HeadingLevel.HEADING_3,
             spacing: { before: 100, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Rivaroxabana (Xarelto): 15mg 12/12h por 21 dias. Manutenção: 20mg/dia.", break: 1 }),
              new TextRun({ text: "• Apixabana (Eliquis): 10mg 12/12h por 7 dias. Manutenção: 5mg 12/12h.", break: 1 }),
              new TextRun({ text: "• Dabigatrana (Pradaxa): Iniciar após 5 dias de Heparina. 150mg 12/12h.", break: 1 }),
              new TextRun({ text: "• Edoxabana (Lixiana): Após 5 dias de Heparina. 60mg/dia (ou 30mg se < 60kg).", break: 1 }),
              new TextRun({ text: "• Varfarina (Marevan): Dose inicial 5mg/dia. Alvo INR 2.0-3.0. Fazer Bridge Therapy.", break: 1 }),
            ],
          }),

          new Paragraph({
            text: "B) Anticoagulação Parenteral (Intermediário):",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 100, after: 100 },
         }),
         new Paragraph({
           children: [
             new TextRun({ text: "• Enoxaparina (HBPM): 1mg/kg SC 12/12h. Se ClCr < 30: 1mg/kg 24/24h.", break: 1 }),
             new TextRun({ text: "• Heparina (HNF): Bolus 80 UI/kg, seguido de infusão 18 UI/kg/hora. Ajuste por TTPa.", break: 1 }),
           ],
         }),

         new Paragraph({
           text: "C) Fibrinólise / Trombólise (Alto Risco):",
           heading: HeadingLevel.HEADING_3,
           spacing: { before: 100, after: 100 },
         }),
         new Paragraph({
           children: [
             new TextRun({ text: "• rtPA (Alteplase): 100mg EV em 2 horas. Se < 65kg, considerar 0.6mg/kg.", break: 1 }),
             new TextRun({ text: "• TNK (Tenecteplase): Dose única em Bolus EV ajustada por peso.", break: 1 }),
           ],
         }),

          new Paragraph({
            text: "2.3 Escore de Wells (Avaliação de Probabilidade)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Sinais de TVP (Edema, Dor): 3 pts", break: 1 }),
              new TextRun({ text: "• Outro diagnóstico menos provável: 3 pts", break: 1 }),
              new TextRun({ text: "• FC > 100 bpm: 1.5 pts", break: 1 }),
              new TextRun({ text: "• Imobilização/Cirurgia Recente: 1.5 pts", break: 1 }),
              new TextRun({ text: "• TEP/TVP Prévio: 1.5 pts", break: 1 }),
              new TextRun({ text: "• Hemoptise: 1.0 pt", break: 1 }),
              new TextRun({ text: "• Câncer: 1.0 pt", break: 1 }),
              new TextRun({ text: "Interpretação: > 6 (Alta), 2-6 (Moderada), 0-1 (Baixa).", break: 1, bold: true }),
            ],
          }),

          new Paragraph({
            text: "2.4 Escore sPESI (Risco de Mortalidade)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Idade > 80 anos: 1 pt", break: 1 }),
              new TextRun({ text: "• Doença Neoplásica: 1 pt", break: 1 }),
              new TextRun({ text: "• Doença Cardiopulmonar Crônica: 1 pt", break: 1 }),
              new TextRun({ text: "• FC ≥ 110 bpm: 1 pt", break: 1 }),
              new TextRun({ text: "• PAS < 100 mmHg: 1 pt", break: 1 }),
              new TextRun({ text: "• SatO2 < 90%: 1 pt", break: 1 }),
              new TextRun({ text: "Interpretação: 0 pts (Baixo Risco - 1% mortalidade), ≥ 1 pt (Alto Risco - 10% mortalidade).", break: 1, bold: true }),
            ],
          }),

          new Paragraph({
            text: "2.5 Critérios PERC (Exclusão em Baixa Probabilidade)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Utilizar se Wells = 0 ou 1. Se todos negativos, TEP descartado sem exames.", break: 1 }),
              new TextRun({ text: "Critérios: Idade < 50 anos, FC < 100, SatO2 > 94%, Sem hemoptise, Sem uso de estrôgenios, Sem TVP/TEP prévio, Sem edema unilateral, Sem cirurgia recente.", break: 1 }),
            ],
          }),

          new Paragraph({
            text: "2.6 Fibrinólise - Contraindicações Absolutas",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "- AVCh Prévio ou AVC desconhecido", break: 1 }),
              new TextRun({ text: "- AVCi nos últimos 6 meses", break: 1 }),
              new TextRun({ text: "- Neoplasia de SNC", break: 1 }),
              new TextRun({ text: "- Trauma grave recente (< 3 semanas)", break: 1 }),
            ],
          }),

          // Footer info
          new Paragraph({ text: "", pageBreakBefore: true }),
          new Paragraph({
            text: "Este documento é uma compilação dos protocolos digitais do Hospital Municipal de Morrinhos.",
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000 },
          }),
          new Paragraph({
            text: "Gerado automaticamente pelo Sistema de Gestão Estratégica.",
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Protocolos_Hospital_Morrinhos_2026.docx");
}
