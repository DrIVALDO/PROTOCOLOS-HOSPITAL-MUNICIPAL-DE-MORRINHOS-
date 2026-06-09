const fs = require('fs');
const file = 'src/components/sepse/SepseConfigModal.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Add idx to map
txt = txt.replace(/\{localSectionOrder\.map\(\(sectionId\) => \{/, '{localSectionOrder.map((sectionId, idx) => {');

// 2. Add group class and renderAdminControls string to all sections. 
// A section starts with: <div key="sX" className="space-y-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-slate-800">
// Oh wait, s1 doesn't have overflow-hidden. Let's just find `key="s`
// Actually, let's just insert it after `<div key="s...`
const regex = /(<div key="(s[1-7])" className=")([^"]+)(">\s*)(?=[\s\S])/g;

txt = txt.replace(regex, (match, prefix, id, cls, suffix) => {
  if (!cls.includes('group')) cls += ' group';
  return `${prefix}${cls}${suffix}\n{renderAdminControls('${id}', idx)}`;
});

fs.writeFileSync(file, txt);
console.log('Done mapping sections');
