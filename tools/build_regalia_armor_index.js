#!/usr/bin/env node
/*
Builds a JSON index of mundane Regalia armors (<= 500 gp) from `regalia maker.html`.

Output: `src/regalia_armor_index.json`
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'regalia maker.html');
const OUTPUT = path.join(ROOT, 'src', 'regalia_armor_index.json');

function findRegaliaTypesArraySource(html) {
  const marker = 'const regaliaTypes';
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error('Could not find `const regaliaTypes`');

  const startBracket = html.indexOf('[', idx);
  if (startBracket < 0) throw new Error('Could not find `[` after regaliaTypes');

  // Scan to matching closing bracket.
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

  throw new Error('Could not find end of regaliaTypes array');
}

function isProbablyArmor(entry) {
  const name = String(entry?.name || '').trim();
  const notes = String(entry?.notes || '').trim();
  const ac = Number(entry?.ac);

  const nameMatch = /(shield|armor|mail|plate|breastplate|leather|studded|scale|splint|ring\s+mail|hide|chain\s+shirt|chain\s+mail|onesie|training\s+pants|footie\s+pajamas|jumpsuit|coveralls|bloomers|pettipants)/i;
  if (nameMatch.test(name)) return true;

  // Heuristic: AC >= 11 tends to be armor-like in this dataset.
  if (Number.isFinite(ac) && ac >= 11) return true;

  // Notes sometimes include armor hints.
  if (/(light armor|medium armor|heavy armor|stealth disadvantage|str\s*\d+\s*req)/i.test(notes)) return true;

  return false;
}

function main() {
  const html = fs.readFileSync(INPUT, 'utf8');
  const arrSrc = findRegaliaTypesArraySource(html);

  const sandbox = { regaliaTypes: undefined };
  vm.createContext(sandbox);

  // Evaluate only the array assignment.
  const code = `const regaliaTypes = ${arrSrc}; regaliaTypes;`;
  const regaliaTypes = vm.runInContext(code, sandbox, { timeout: 1000 });

  if (!Array.isArray(regaliaTypes)) throw new Error('Parsed regaliaTypes is not an array');

  const armors = regaliaTypes
    .filter(e => e && typeof e === 'object')
    .filter(e => Number(e.value) <= 500)
    .filter(isProbablyArmor)
    .map(e => ({
      name: String(e.name || '').trim(),
      ac: Number(e.ac),
      notes: String(e.notes || '').trim(),
      gp: Number(e.value),
      source: 'Regalia'
    }))
    .filter(e => e.name);

  // De-dupe by name (keep first).
  const seen = new Set();
  const deduped = [];
  for (const a of armors) {
    const key = a.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(a);
  }

  deduped.sort((a, b) => a.name.localeCompare(b.name));

  const out = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'regalia maker.html',
    count: deduped.length,
    armors: deduped
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${deduped.length} regalia armors -> ${path.relative(ROOT, OUTPUT)}`);
}

main();
