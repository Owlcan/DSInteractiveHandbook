#!/usr/bin/env node
/*
Builds a lightweight JSON index of the custom handbook spells defined inline in `spellbook.html`.

Output: `src/handbook_spells_index.json`
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'spellbook.html');
const OUTPUT = path.join(ROOT, 'src', 'handbook_spells_index.json');

function extractSpellsDataArraySource(html) {
  const marker = 'const spellsData';
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error('Could not find `const spellsData`');

  const startBracket = html.indexOf('[', idx);
  if (startBracket < 0) throw new Error('Could not find `[` after spellsData');

  let depth = 0;
  let inStr = false;
  let strQuote = '';
  let escape = false;

  for (let i = startBracket; i < html.length; i++) {
    const ch = html[i];

    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === strQuote) {
        inStr = false;
        strQuote = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inStr = true;
      strQuote = ch;
      continue;
    }

    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        return html.slice(startBracket, i + 1);
      }
    }
  }

  throw new Error('Could not find end of spellsData array');
}

function normalizeName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function main() {
  const html = fs.readFileSync(INPUT, 'utf8');
  const arrSrc = extractSpellsDataArraySource(html);

  const sandbox = {};
  vm.createContext(sandbox);
  const code = `const spellsData = ${arrSrc}; spellsData;`;

  const spellsData = vm.runInContext(code, sandbox, { timeout: 1000 });
  if (!Array.isArray(spellsData)) throw new Error('Parsed spellsData is not an array');

  const spells = spellsData
    .filter(s => s && typeof s === 'object')
    .map(s => ({
      name: String(s.name || '').trim(),
      level: Number.isFinite(Number(s.level)) ? Number(s.level) : null,
      school: s.school ? String(s.school).trim() : '',
      castingTime: s.castingTime ? String(s.castingTime).trim() : '',
      range: s.range ? String(s.range).trim() : '',
      components: s.components ? String(s.components).trim() : '',
      duration: s.duration ? String(s.duration).trim() : '',
      description: s.description ? String(s.description).trim() : ''
    }))
    .filter(s => s.name);

  // De-dupe by normalized name.
  const seen = new Set();
  const deduped = [];
  for (const s of spells) {
    const key = normalizeName(s.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(s);
  }

  deduped.sort((a, b) => a.name.localeCompare(b.name));

  const out = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'spellbook.html (spellsData)',
    count: deduped.length,
    spells: deduped
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${deduped.length} handbook spells -> ${path.relative(ROOT, OUTPUT)}`);
}

main();
