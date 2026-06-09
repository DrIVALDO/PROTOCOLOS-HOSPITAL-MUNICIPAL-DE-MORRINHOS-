const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const sIdx = app.indexOf("if (activeTab === 'Sepse-POP') {");
const eIdx = app.indexOf("if (activeTab === 'Sepse-Ficha') {");

if (sIdx > -1 && eIdx > -1) {
  let block = app.substring(sIdx, eIdx);
  fs.writeFileSync('pop_block.txt', block);
  console.log("Extracted!");
}
