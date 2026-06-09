const fs = require('fs');

let f = fs.readFileSync('src/components/sepse/EditableFicha.tsx', 'utf8');

// Replace localChecklists.pacote with (localChecklists?.pacote || [])
f = f.replace(/localChecklists\.pacote/g, "(localChecklists?.pacote || [])");
// Replace localChecklists.cuidados with (localChecklists?.cuidados || [])
f = f.replace(/localChecklists\.cuidados/g, "(localChecklists?.cuidados || [])");

fs.writeFileSync('src/components/sepse/EditableFicha.tsx', f);
