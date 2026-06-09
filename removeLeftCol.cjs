const fs = require('fs');

const path = 'src/components/sepse/SepseConfigModal.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const newLines = [
  ...lines.slice(0, 434),
  ...lines.slice(1318)
];

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log('Removed left column!');
