/* Builds src/srd_spells_index.json from src/data/SRD Data 2.md
 *
 * Output schema is compatible with spellbook.html (name, level, school, classes,
 * casttime, range, components, duration, ritual, description, higherlevels).
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'SRD Data 2.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'srd_spells_index.json');

function normalizeNewlines(text) {
	return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function looksLikeSpellMetaLine(line) {
	const t = String(line || '').trim();
	if (!t) return false;
	if (/\bcantrip\b/i.test(t)) return true;
	return /^\d+(st|nd|rd|th)-level\s+.+/i.test(t);
}

function looksLikeSpellNameLine(line) {
	const t = String(line || '').trim();
	if (!t) return false;
	if (t.includes(':')) return false;
	if (/^Spell Descriptions$/i.test(t)) return false;
	// Avoid common section headers and sentences.
	if (/^(At Higher Levels\.|This spell|You |A |An |The )/i.test(t)) return false;
	// Reasonably restrictive: words, digits, spaces, apostrophes, dashes.
	return /^[A-Z][A-Za-z0-9'’\- ,]+$/.test(t);
}

function parseLevelSchoolRitual(metaLine) {
	const raw = String(metaLine || '').trim();
	const ritual = /\(ritual\)/i.test(raw);
	const cleaned = raw.replace(/\(ritual\)/gi, '').trim();

	// e.g. "Conjuration cantrip"
	const cantripMatch = cleaned.match(/^(.+?)\s+cantrip$/i);
	if (cantripMatch) {
		return {
			level: 0,
			school: String(cantripMatch[1]).trim().toLowerCase(),
			ritual
		};
	}

	// e.g. "2nd-level evocation"
	const lvlMatch = cleaned.match(/^(\d+)(st|nd|rd|th)-level\s+(.+)$/i);
	if (lvlMatch) {
		return {
			level: parseInt(lvlMatch[1], 10),
			school: String(lvlMatch[3]).trim().toLowerCase(),
			ritual
		};
	}

	return { level: NaN, school: '', ritual };
}

function parseComponents(componentsLine) {
	// "V, S, M (a tiny bell ...)" or "V, S" etc
	const raw = String(componentsLine || '').trim();
	const upper = raw.toUpperCase();
	const verbal = /\bV\b/.test(upper);
	const somatic = /\bS\b/.test(upper);
	let material = false;

	const m = raw.match(/\bM\s*\(([^)]+)\)/i);
	if (m) {
		material = String(m[1]).trim();
	} else if (/\bM\b/i.test(raw)) {
		material = true;
	}

	return { verbal, somatic, material };
}

function stripPrefix(line, prefix) {
	return String(line || '').trim().slice(prefix.length).trim();
}

function parseSpellsFromLines(lines) {
	const spells = [];
	for (let i = 0; i < lines.length; ) {
		const line = (lines[i] || '').trim();

		if (
			looksLikeSpellNameLine(line) &&
			i + 1 < lines.length &&
			looksLikeSpellMetaLine(lines[i + 1])
		) {
			const name = line;
			const meta = parseLevelSchoolRitual(lines[i + 1]);
			i += 2;

			let classes = '';
			let casttime = '';
			let range = '';
			let components = null;
			let duration = '';

			// Parse structured header lines
			while (i < lines.length) {
				const l = String(lines[i] || '').trim();
				if (!l) {
					i++;
					continue;
				}
				if (l.startsWith('Classes:')) {
					classes = stripPrefix(l, 'Classes:');
					i++;
					continue;
				}
				if (l.startsWith('Casting Time:')) {
					casttime = stripPrefix(l, 'Casting Time:');
					i++;
					continue;
				}
				if (l.startsWith('Range:')) {
					range = stripPrefix(l, 'Range:');
					i++;
					continue;
				}
				if (l.startsWith('Components:')) {
					components = parseComponents(stripPrefix(l, 'Components:'));
					i++;
					continue;
				}
				if (l.startsWith('Duration:')) {
					duration = stripPrefix(l, 'Duration:');
					i++;
					continue;
				}

				break;
			}

			const descLines = [];
			const higherLines = [];
			let inHigher = false;

			while (i < lines.length) {
				const lRaw = String(lines[i] ?? '');
				const l = lRaw.trim();

				if (
					looksLikeSpellNameLine(l) &&
					i + 1 < lines.length &&
					looksLikeSpellMetaLine(lines[i + 1])
				) {
					break;
				}

				if (/^At Higher Levels\./i.test(l)) {
					inHigher = true;
					const rest = l.replace(/^At Higher Levels\./i, '').trim();
					if (rest) higherLines.push(rest);
					i++;
					continue;
				}

				if (inHigher) {
					higherLines.push(lRaw);
				} else {
					descLines.push(lRaw);
				}
				i++;
			}

			const description = normalizeNewlines(descLines.join('\n')).trim();
			const higherlevels = normalizeNewlines(higherLines.join('\n')).trim();
			const concentration = /^concentration\b/i.test(String(duration || '').trim());

			spells.push({
				name,
				level: meta.level,
				school: meta.school,
				classes,
				subclasses: '',
				casttime,
				range,
				components: components || { verbal: false, somatic: false, material: false },
				duration,
				ritual: !!meta.ritual,
				description,
				higherlevels: higherlevels || '',
				concentration
			});

			continue;
		}

		i++;
	}

	return spells;
}

function main() {
	const raw = fs.readFileSync(INPUT_PATH, 'utf8');
	const text = normalizeNewlines(raw);
	const lines = text.split('\n');

	const spells = parseSpellsFromLines(lines).filter(s => s && s.name && isFinite(Number(s.level)));

	spells.sort((a, b) => {
		const la = Number(a.level);
		const lb = Number(b.level);
		if (la !== lb) return la - lb;
		return String(a.name).localeCompare(String(b.name));
	});

	const out = {
		meta: {
			source: 'src/data/SRD Data 2.md',
			generatedAt: new Date().toISOString(),
			count: spells.length
		},
		spells
	};

	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
	console.log(`Wrote ${spells.length} spells -> ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
