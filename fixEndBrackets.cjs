const fs = require('fs');
const file = 'src/components/sepse/SepseConfigModal.tsx';
let txt = fs.readFileSync(file, 'utf8');

const lastFluxoPreview = txt.indexOf('               )}', txt.indexOf('{/* 3. FLUXOGRAMA INTERATIVO CLINICA */}'));

if (lastFluxoPreview > -1) {
  // Crop everything after the closing of previewMode === 'fluxo'
  txt = txt.substring(0, lastFluxoPreview + 17) + `
        </div>
      </div>
    </div>
  );
};
`;
}

// ALso we need to use 'targetTab' instead of 'previewMode' tabs.
// Actually 'previewMode' uses 'targetTab' for default state, so we can just replace 'previewMode ===' with 'targetTab.includes' or something.
// We'll replace {previewMode === 'ficha' ... with {targetTab === 'Sepse-Ficha'
txt = txt.replace(/previewMode === 'ficha'/g, "targetTab === 'Sepse-Ficha'");
txt = txt.replace(/previewMode === 'pop'/g, "targetTab === 'Sepse-POP'");
txt = txt.replace(/previewMode === 'fluxo'/g, "targetTab === 'Sepse-Fluxo'");

fs.writeFileSync(file, txt);
