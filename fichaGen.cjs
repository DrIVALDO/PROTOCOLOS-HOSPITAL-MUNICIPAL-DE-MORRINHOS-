const fs = require('fs');
let code = fs.readFileSync('src/components/SepseFichaModule.tsx', 'utf8');

// 1. Rename component
code = code.replace(/export const SepseFichaModule = \(\) => \{/, `export const EditableFicha = ({ localConfig, handleFieldChange, localChecklists, setLocalChecklists, localLogos, setLocalPatientFields, localPatientFields }: any) => {

  const T_bold = (key: string, _def: string, extraClasses: string = '') => (
    <input
      type="text"
      value={localConfig[key] || _def}
      onChange={(e) => handleFieldChange(key, e.target.value)}
      onClick={e => e.stopPropagation()}
      className={\`bg-transparent border-b border-dashed border-transparent hover:border-slate-350 focus:border-slate-500 focus:bg-white transition-all text-ellipsis w-full outline-none \${extraClasses}\`}
    />
  );
`);

// 2. Remove the config and checklist useState definitions
code = code.replace(/const \[config, setConfig\] = useState<ConfigDict>\(INITIAL_CONFIG\);/g, '');
code = code.replace(/const \[checklists, setChecklists\].*;/g, '');
code = code.replace(/const \[patientFields, setPatientFields\].*?\];\n  \}\);\n/gs, '');

// 3. Replace all `config[` with `localConfig[`
code = code.replace(/\bconfig\[/g, 'localConfig[');

// 4. Replace `checklists.` with `localChecklists.`
code = code.replace(/\bchecklists\./g, 'localChecklists.');

// 5. Replace simple {localConfig['key']} renders with {T_bold('key', '')}
// Specifically handling `{localConfig['header.titulo'] || '...'}`, etc
code = code.replace(/\{localConfig\['([^']+)'\](?: \|\| '([^']+)')?\}/g, (match, key, def) => {
  if (!def) def = '';
  return `{T_bold('${key}', '${def}')}`;
});

// Remove the floating settings button
code = code.substring(0, code.indexOf('{/* Floating Gear configurations button'));
code += `
    </div>
  );
};
`;

fs.writeFileSync('src/components/sepse/EditableFicha.tsx', code);
