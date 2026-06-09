const fs = require('fs');

// Fix EditablePop
let txt = fs.readFileSync('src/components/sepse/EditablePop.tsx', 'utf8');
txt = txt.replace(/logos/g, "localLogos");
txt = txt.replace(/{patientName}/g, "{localConfig['patientName'] || ''}");
txt = txt.replace(/<AlertTriangle.*?\/>/g, ""); // strip AlertTriangle if missing
txt = txt.replace(/AlertTriangle,/g, ""); 
// Add missing state for news and sofa in EditablePop
txt = txt.replace(
  /export const EditablePop = \({.*?\) => {/,
  (match) => match + "\n  const [news, setNews] = React.useState<any>({});\n  const [sofa, setSofa] = React.useState<any>({});\n"
);
fs.writeFileSync('src/components/sepse/EditablePop.tsx', txt);

// Fix EditableFicha
let f = fs.readFileSync('src/components/sepse/EditableFicha.tsx', 'utf8');
f = f.replace(/\.\/sepse\//g, "./"); // fix imports
f = f.replace(/setConfig\(/g, "// setConfig(");
f = f.replace(/setChecklists\(/g, "// setChecklists(");
f = f.replace(/setPatientFields\(/g, "// setPatientFields(");
f = f.replace(/patientFields/g, "localPatientFields");
fs.writeFileSync('src/components/sepse/EditableFicha.tsx', f);
