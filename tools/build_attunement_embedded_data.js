/*
  Builds (or refreshes) the embedded data tables inside `attunement.html`.

  It extracts:
  - `const weaponsData = { ... }` from `src/legacyweapon.html`
  - `const regaliaTypes = [ ... ]`, `const clothingArmorCategories = [ ... ]`,
    and `const regaliaUpgrades = [ ... ]` from `regalia maker.html`

  Then replaces everything between:
    // BEGIN EMBEDDED DATA
    ...
    // END EMBEDDED DATA

  Usage:
    node tools/build_attunement_embedded_data.js
*/

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

const LEGACY_WEAPON_HTML = path.join(ROOT, 'src', 'legacyweapon.html');
const REGALIA_HTML = path.join(ROOT, 'regalia maker.html');
const ATTUNEMENT_HTML = path.join(ROOT, 'attunement.html');

function normalizeNewlines(text) {
	return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function sanitizeScriptEnd(text) {
	// Prevent accidental closing of the surrounding <script> tag.
	return String(text || '').replace(/<\s*\/\s*script\s*>/gi, '<\\/script>');
}

function stripTrailingSemicolons(src) {
	let t = String(src || '').trim();
	while (t.endsWith(';')) {
		t = t.slice(0, -1).trimEnd();
	}
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

function findArraySourceByConstName(html, constName) {
	return extractConstArrayByTerminator(html, constName);
}

function extractConstArrayByTerminator(html, constName) {
	const text = normalizeNewlines(html);
	const re = new RegExp(`\\bconst\\s+${constName.replace(/[$]/g, '\\$&')}\\s*=\\s*\\[`, 'm');
	const m = text.match(re);
	if (!m || m.index == null) throw new Error(`Could not find \`const ${constName} = [\``);

	const after = m.index + m[0].length - 1; // points at '['
	const startBracket = after;

	const rest = text.slice(startBracket);
	const endM = rest.match(/\n\s*\];/m);
	if (!endM || endM.index == null) throw new Error(`Could not find end terminator for ${constName} (expected a line containing \`];\`)`);

	// Include the closing `]`, but exclude the trailing `;`.
	const endIdx = startBracket + endM.index + endM[0].lastIndexOf(']') + 1;
	return text.slice(startBracket, endIdx);
}

function assertEvaluatesToArray(src, name) {
	const sandbox = Object.create(null);
	vm.createContext(sandbox);
	const code = `(${stripTrailingSemicolons(src)})`;
	const value = vm.runInContext(code, sandbox, { timeout: 1000 });
	if (!Array.isArray(value)) throw new Error(`${name} did not evaluate to an array`);
	return true;
}

function replaceBetweenMarkers(text, startMarker, endMarker, replacement) {
	const startIdx = text.indexOf(startMarker);
	const endIdx = text.indexOf(endMarker);
	if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
		throw new Error('Could not find BEGIN/END markers in attunement.html');
	}

	const before = text.slice(0, startIdx + startMarker.length);
	const after = text.slice(endIdx);

	return `${before}\n\n${replacement}\n\n${after}`;
}

function indentBlock(block, spaces) {
	const pad = ' '.repeat(spaces);
	return normalizeNewlines(block)
		.split('\n')
		.map(line => (line.trim() ? pad + line : line))
		.join('\n');
}

function main() {
	const legacyHtml = fs.readFileSync(LEGACY_WEAPON_HTML, 'utf8');
	const regaliaHtml = fs.readFileSync(REGALIA_HTML, 'utf8');
	let attunementHtml = fs.readFileSync(ATTUNEMENT_HTML, 'utf8');

	const weaponsObj = sanitizeScriptEnd(extractWeaponsDataObjectLiteral(legacyHtml));

	const regaliaTypesSrc = stripTrailingSemicolons(sanitizeScriptEnd(findArraySourceByConstName(regaliaHtml, 'regaliaTypes')));
	const clothingArmorSrc = stripTrailingSemicolons(
		sanitizeScriptEnd(findArraySourceByConstName(regaliaHtml, 'clothingArmorCategories'))
	);
	const regaliaUpgradesSrc = stripTrailingSemicolons(
		sanitizeScriptEnd(findArraySourceByConstName(regaliaHtml, 'regaliaUpgrades'))
	);

	// Quick sanity check: these should all evaluate.
	assertEvaluatesToArray(regaliaTypesSrc, 'regaliaTypes');
	assertEvaluatesToArray(clothingArmorSrc, 'clothingArmorCategories');
	assertEvaluatesToArray(regaliaUpgradesSrc, 'regaliaUpgrades');

	const replacement = [
		'// Weapon data (from src/legacyweapon.html)',
		`const weaponsData = ${weaponsObj};`,
		'',
		'// Regalia bases + classification + upgrades (from regalia maker.html)',
		`const regaliaTypes = ${regaliaTypesSrc};`,
		`const clothingArmorCategories = ${clothingArmorSrc};`,
		`const regaliaUpgrades = ${regaliaUpgradesSrc};`
	].join('\n');

	attunementHtml = replaceBetweenMarkers(
		normalizeNewlines(attunementHtml),
		'// BEGIN EMBEDDED DATA',
		'// END EMBEDDED DATA',
		indentBlock(replacement, 4)
	);

	fs.writeFileSync(ATTUNEMENT_HTML, attunementHtml, 'utf8');
	console.log('Updated attunement.html embedded tables.');
}

main();
