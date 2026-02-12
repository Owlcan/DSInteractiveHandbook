/* Builds src/legacy_weapons_index.json from src/legacyweapon.html
 *
 * Extracts the inline `weaponsData` JS object, flattens categories, filters
 * base_cost <= 500 gp, and writes a compact index for MyFirstGSheetMaker.html.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const INPUT_PATH = path.join(__dirname, '..', 'src', 'legacyweapon.html');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'legacy_weapons_index.json');

function normalizeNewlines(text) {
	return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function extractWeaponsDataObjectLiteral(html) {
	const text = normalizeNewlines(html);
	const startMatch = text.match(/\bconst\s+weaponsData\s*=\s*\{/);
	if (!startMatch || startMatch.index == null) {
		throw new Error('Could not find `const weaponsData = {` in legacyweapon.html');
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

function evalObjectLiteral(objLiteral) {
	const sandbox = Object.create(null);
	// Wrap in parentheses so it evaluates as an expression.
	return vm.runInNewContext(`(${objLiteral})`, sandbox, { timeout: 1000 });
}

function main() {
	const html = fs.readFileSync(INPUT_PATH, 'utf8');
	const objLiteral = extractWeaponsDataObjectLiteral(html);
	const weaponsData = evalObjectLiteral(objLiteral);
	if (!weaponsData || typeof weaponsData !== 'object') {
		throw new Error('weaponsData did not evaluate to an object');
	}

	const flattened = [];
	for (const [group, arr] of Object.entries(weaponsData)) {
		if (!Array.isArray(arr)) continue;
		for (const w of arr) {
			if (!w || typeof w !== 'object') continue;
			flattened.push({ ...w, group });
		}
	}

	const filtered = flattened
		.filter(w => typeof w.base_cost === 'number' && isFinite(w.base_cost) && w.base_cost <= 500)
		.map(w => {
			const special = w.special ? String(w.special).trim() : '';
			const props = [w.light ? 'Light' : '', w.finesse ? 'Finesse' : '', special].filter(Boolean).join(', ');
			return {
				name: String(w.name || '').trim(),
				group: String(w.group || '').trim(),
				category: String(w.category || '').trim(),
				damage_dice: String(w.damage_dice || '').trim(),
				damage_type: String(w.damage_type || '').trim(),
				properties: props,
				base_cost: w.base_cost
			};
		})
		.filter(w => w.name);

	filtered.sort((a, b) => a.name.localeCompare(b.name));

	const out = {
		meta: {
			source: 'src/legacyweapon.html',
			generatedAt: new Date().toISOString(),
			maxBaseCostGp: 500,
			count: filtered.length
		},
		weapons: filtered
	};

	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
	console.log(`Wrote ${filtered.length} legacy weapons -> ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
