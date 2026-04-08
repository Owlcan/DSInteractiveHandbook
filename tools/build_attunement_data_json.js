/*
  Builds `attunement_data.json` for `attunement.html`.

  It extracts:
  - `const weaponsData = { ... }` from `src/legacyweapon.html`
  - `const regaliaTypes = [ ... ]`, `const clothingArmorCategories = [ ... ]`,
    and `const regaliaUpgrades = [ ... ]` from `regalia maker.html`

  Usage:
    node tools/build_attunement_data_json.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const LEGACY_WEAPON_HTML = path.join(ROOT, 'src', 'legacyweapon.html');
const REGALIA_HTML = path.join(ROOT, 'regalia maker.html');
const OUT_JSON = path.join(ROOT, 'attunement_data.json');

function normalizeNewlines(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function stripTrailingSemicolons(src) {
  let t = String(src || '').trim();
  while (t.endsWith(';')) t = t.slice(0, -1).trimEnd();
  return t;
}

function extractWeaponsDataObjectLiteral(html) {
  const text = normalizeNewlines(html);
  const startMatch = text.match(/\bconst\s+weaponsData\s*=\s*\{/);
  if (!startMatch || startMatch.index == null) {
    throw new Error('Could not find `const weaponsData = {` in src/legacyweapon.html');
  }

  const startIndex = startMatch.index + startMatch[0].lastIndexOf('{');

  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escaped = false;

  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
        stringQuote = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  throw new Error('Failed to find end of weaponsData object literal');
}

function extractConstArrayByTerminator(html, constName) {
  const text = normalizeNewlines(html);
  const re = new RegExp(`\\bconst\\s+${constName.replace(/[$]/g, '\\$&')}\\s*=\\s*\\[`, 'm');
  const m = text.match(re);
  if (!m || m.index == null) throw new Error(`Could not find \`const ${constName} = [\``);

  const startBracket = m.index + m[0].length - 1; // points at '['
  const rest = text.slice(startBracket);
  const endM = rest.match(/\n\s*\];/m);
  if (!endM || endM.index == null) throw new Error(`Could not find end terminator for ${constName} (expected a line containing \`];\`)`);

  const endIdx = startBracket + endM.index + endM[0].lastIndexOf(']') + 1;
  return text.slice(startBracket, endIdx);
}

function extractConstObjectLiteral(html, constName) {
  const text = normalizeNewlines(html);
  const startRe = new RegExp(`\\bconst\\s+${constName.replace(/[$]/g, '\\$&')}\\s*=\\s*\\{`);
  const startMatch = text.match(startRe);
  if (!startMatch || startMatch.index == null) {
    throw new Error(`Could not find \`const ${constName} = {\``);
  }

  const startIndex = startMatch.index + startMatch[0].lastIndexOf('{');

  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escaped = false;

  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
        stringQuote = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringQuote = ch;
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  throw new Error(`Failed to find end of ${constName} object literal`);
}

function evaluateExpression(exprSrc) {
  const sandbox = Object.create(null);
  vm.createContext(sandbox);
  const code = `(${stripTrailingSemicolons(exprSrc)})`;
  return vm.runInContext(code, sandbox, { timeout: 2000 });
}

function main() {
  const legacyHtml = fs.readFileSync(LEGACY_WEAPON_HTML, 'utf8');
  const regaliaHtml = fs.readFileSync(REGALIA_HTML, 'utf8');

  const weaponsObjLiteral = extractWeaponsDataObjectLiteral(legacyHtml);
  const weaponsData = evaluateExpression(weaponsObjLiteral);

  const regaliaTypesSrc = extractConstArrayByTerminator(regaliaHtml, 'regaliaTypes');
  const clothingArmorSrc = extractConstArrayByTerminator(regaliaHtml, 'clothingArmorCategories');
  const regaliaUpgradesSrc = extractConstArrayByTerminator(regaliaHtml, 'regaliaUpgrades');
  const enhancementPricingSrc = extractConstObjectLiteral(regaliaHtml, 'enhancementPricing');

  const regaliaTypes = evaluateExpression(regaliaTypesSrc);
  const clothingArmorCategories = evaluateExpression(clothingArmorSrc);
  const regaliaUpgrades = evaluateExpression(regaliaUpgradesSrc);
  const enhancementPricing = evaluateExpression(enhancementPricingSrc);

  const payload = {
    type: 'attunement-reference-data',
    version: 1,
    builtAt: new Date().toISOString(),
    weaponsData,
    regaliaTypes,
    clothingArmorCategories,
    regaliaUpgrades,
    enhancementPricing
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('Wrote attunement_data.json');
}

main();
