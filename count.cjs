const fs = require('fs');
const txt = fs.readFileSync('src/components/sepse/SepseConfigModal.tsx', 'utf8');
let open = 0, close = 0;
for(let i=0; i<txt.length; i++) {
  if(txt[i] === '{') open++;
  if(txt[i] === '}') close++;
}
let d1=0, d2=0;
for(let i=0; i<txt.length-4; i++) {
  if (txt.substring(i, i+4) === '<div') d1++;
  if (txt.substring(i, i+5) === '</div') d2++;
}
console.log('Brackets', open, close);
console.log('Divs', d1, d2);
