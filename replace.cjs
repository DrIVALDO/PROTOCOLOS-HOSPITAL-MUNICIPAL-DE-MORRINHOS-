const fs = require('fs');
let file = fs.readFileSync('src/components/sepse/EditablePop.tsx', 'utf8');

// Replace {config['key'] || 'default'} with {T('key', 'default')}
file = file.replace(/\{config\['([^']+)'\]\s*\|\|\s*'([^']+)'\}/g, "{T('$1', '$2', 'text-center')}");

fs.writeFileSync('src/components/sepse/EditablePop.tsx', file);
