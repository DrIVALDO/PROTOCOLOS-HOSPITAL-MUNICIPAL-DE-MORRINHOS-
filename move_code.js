const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newsPattern = /<div className="flex flex-col gap-4">\s*\{true && \(\s*<motion\.div\s*initial=\{\{ opacity: 0, height: 0 \}\}\s*animate=\{\{ opacity: 1, height: 'auto' \}\}\s*exit=\{\{ opacity: 0, height: 0 \}\}\s*className="w-full overflow-hidden mt-2"\s*>\s*<div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">[\s\S]*?<\/motion\.div>\s*\)\}/;

const matchNews = code.match(newsPattern);
if (!matchNews) {
    console.error("News block not found");
    process.exit(1);
}

let newsBlockStr = matchNews[0].replace('<div className="flex flex-col gap-4">\n          ', '');
newsBlockStr = newsBlockStr.replace(/\{true && \(/, "{expandedFlow === 'news_top' && (");

// Remove News block from original
code = code.replace(matchNews[0], '<div className="flex flex-col gap-4">');

const sofaPattern = /\{true && \(\s*<motion\.div\s*initial=\{\{ opacity: 0, height: 0 \}\}\s*animate=\{\{ opacity: 1, height: 'auto' \}\}\s*exit=\{\{ opacity: 0, height: 0 \}\}\s*className="w-full overflow-hidden mt-2"\s*>\s*<div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">\s*<div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">\s*<div>\s*<p className="text-xs font-black text-slate-500 uppercase">Pontuação SOFA<\/p>[\s\S]*?<\/motion\.div>\s*\)\}/;

const matchSofa = code.match(sofaPattern);
if (!matchSofa) {
    console.error("Sofa block not found");
    process.exit(1);
}

let sofaBlockStr = matchSofa[0].replace(/\{true && \(/, "{expandedFlow === 'sofa_top' && (");
// Remove Sofa block from original
code = code.replace(matchSofa[0], '');

// Create small components at the top of App.tsx
// But it's easier to just inject them directly in the target locations.

let newsTarget = `<div 
                  className={\`p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md \${
                    newsScore >= 4 
                      ? 'bg-amber-500 border-amber-400 text-white' 
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                  }\`}
                >`;

let newsTargetReplacement = `<div 
                  onClick={() => setExpandedFlow(prev => prev === 'news_top' ? null : 'news_top')}
                  className={\`cursor-pointer p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md \${
                    newsScore >= 4 
                      ? 'bg-amber-500 border-amber-400 text-white' 
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400'
                  }\`}
                >`;

code = code.replace(newsTarget, newsTargetReplacement);

// Find end of News Card
const newsCardEnd = `</p>
                </div>
              </div>

              {/* NEWS NO branch */}`;

code = code.replace(newsCardEnd, `</p>
                </div>
                ${newsBlockStr}
              </div>

              {/* NEWS NO branch */}`);

// Do the same for SOFA 
let sofaTarget = `<div 
                  className={\`p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md \${
                    sofaScore >= 2 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-600'
                  }\`}
                >`;

let sofaTargetReplacement = `<div 
                  onClick={() => setExpandedFlow(prev => prev === 'sofa_top' ? null : 'sofa_top')}
                  className={\`cursor-pointer p-6 rounded-[24px] border-2 text-center transition-all w-80 shadow-md \${
                    sofaScore >= 2 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-600'
                  }\`}
                >`;

code = code.replace(sofaTarget, sofaTargetReplacement);

const sofaCardEnd = `</p>
                </div>
              </div>

              {/* SOFA NO branch */}`;

code = code.replace(sofaCardEnd, `</p>
                </div>
                ${sofaBlockStr}
              </div>

              {/* SOFA NO branch */}`);

fs.writeFileSync('src/App.tsx', code);
console.log("Successfully moved NEWS and SOFA calculation widgets!");
