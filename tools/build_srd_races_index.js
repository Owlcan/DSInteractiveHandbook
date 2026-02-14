/* Builds src/srd_races_index.json from src/data/SRD Data.md
 *
 * Output schema is compatible with MyFirstGSheetMaker.html race picker:
 * {
 *   meta: {...},
 *   races: {
 *     "Dwarf": { name, id, traits: [...], subraces: { ... } }
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'SRD Data.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'srd_races_index.json');

function normalizeNewlines(text) {
	return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function slugifyId(name) {
	return String(name || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.trim();
}

function isBulletRaceLine(line) {
	const t = String(line || '').trim();
	if (!t) return false;
	// Matches unicode en-dash (–) and hyphen-minus
	return /^[\u2013\-]\s+\S+/.test(t);
}

function parseBaseRaceList(lines) {
	const races = [];
	for (const rawLine of lines) {
		const t = String(rawLine || '').trim();
		if (!t) continue;
		if (/^\s*[•\*]\s*Classes\b/i.test(t) || /^Classes\b/i.test(t)) break;
		if (isBulletRaceLine(t)) {
			const name = t.replace(/^[\u2013\-]\s+/, '').trim();
			if (name) races.push(name);
		}
	}
	// De-dupe preserving order
	const seen = new Set();
	const out = [];
	for (const r of races) {
		const key = r.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(r);
	}
	return out;
}

function looksLikeTraitStart(line) {
	const t = String(line || '').trim();
	if (!t) return false;
	// Common SRD trait format: "Ability Score Increase. ..."
	if (/^[A-Z][A-Za-z0-9'’\- ]+\.[\s\S]+/.test(t)) return true;
	return false;
}

function looksLikeSectionLabelForTable(line, nextNonEmptyLine) {
	const t = String(line || '').trim();
	if (!t) return false;
	if (t.includes('.')) return false;
	if (/:$/.test(t)) return false;
	if (t.length > 42) return false;
	if (!/^[A-Z][A-Za-z0-9'’\- ]+$/.test(t)) return false;
	const next = String(nextNonEmptyLine || '');
	// Heuristic: next line contains tabs or multiple spaces suggesting a table.
	if (/\t/.test(next)) return true;
	if (/\s{2,}/.test(next) && /[A-Za-z]/.test(next)) return true;
	return false;
}

function parseTraitsFromLines(lines) {
	const traits = [];
	let cur = [];

	const pushCur = () => {
		const text = cur.join('\n').trim();
		cur = [];
		if (!text) return;
		traits.push(text);
	};

	const getNextNonEmpty = (startIdx) => {
		for (let j = startIdx; j < lines.length; j++) {
			const t = String(lines[j] || '').trim();
			if (t) return t;
		}
		return '';
	};

	for (let i = 0; i < lines.length; i++) {
		const raw = String(lines[i] ?? '');
		const t = raw.trim();
		if (!t) continue;
		// Drop redundant "X Traits" headers.
		if (/\bTraits\b/i.test(t) && !t.includes('.')) {
			continue;
		}

		const nextNonEmpty = getNextNonEmpty(i + 1);
		const isTableLabel = looksLikeSectionLabelForTable(t, nextNonEmpty);

		if (looksLikeTraitStart(t) || isTableLabel) {
			pushCur();
			cur.push(isTableLabel ? `${t}.` : raw.trim());
			continue;
		}

		// Continuation line.
		if (cur.length === 0) {
			// If we haven't started a trait yet, ignore narrative preamble.
			continue;
		}
		cur.push(raw.trim());
	}

	pushCur();
	return traits;
}

function isSubraceHeading(line, parentRaceName) {
	const t = String(line || '').trim();
	if (!t) return false;
	if (t.includes('.')) return false;
	if (t.endsWith(':')) return false;
	if (!/^[A-Z][A-Za-z0-9'’\- ]+$/.test(t)) return false;
	if (/\bTraits\b/i.test(t)) return false;
	if (!parentRaceName) return false;

	// Most SRD subraces contain the parent race name, e.g. "Hill Dwarf", "High Elf".
	const parentWord = String(parentRaceName).split(/\s+/).slice(-1)[0];
	if (!parentWord) return false;
	return new RegExp(`\\b${parentWord.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i').test(t);
}

function parseSubraceBlock(lines) {
	// Description = leading non-trait lines.
	let descLines = [];
	let i = 0;
	for (; i < lines.length; i++) {
		const t = String(lines[i] || '').trim();
		if (!t) continue;
		if (looksLikeTraitStart(t)) break;
		descLines.push(t);
	}
	const description = descLines.join(' ').trim();
	const traits = parseTraitsFromLines(lines.slice(i));
	return { description, traits };
}

function main() {
	if (!fs.existsSync(INPUT_PATH)) {
		throw new Error(`Missing input file: ${INPUT_PATH}`);
	}

	const raw = fs.readFileSync(INPUT_PATH, 'utf8');
	const text = normalizeNewlines(raw);
	const lines = text.split('\n');

	const baseRaces = parseBaseRaceList(lines);
	if (!baseRaces.length) {
		throw new Error('Could not find base race list at top of SRD Data.md');
	}

	// Find section starts by exact heading match.
	const startIndices = [];
	for (let i = 0; i < lines.length; i++) {
		const t = String(lines[i] || '').trim();
		if (!t) continue;
		const idx = baseRaces.findIndex(r => r === t);
		if (idx >= 0) {
			startIndices.push({ race: t, idx: i });
		}
	}

	startIndices.sort((a, b) => a.idx - b.idx);
	const races = {};
	let subraceCount = 0;

	for (let si = 0; si < startIndices.length; si++) {
		const raceName = startIndices[si].race;
		const start = startIndices[si].idx + 1;
		const end = si + 1 < startIndices.length ? startIndices[si + 1].idx : lines.length;
		const chunk = lines.slice(start, end);

		// Detect subrace heading indices within this chunk.
		const subHeads = [];
		for (let i = 0; i < chunk.length; i++) {
			const t = String(chunk[i] || '').trim();
			if (!t) continue;
			if (isSubraceHeading(t, raceName)) {
				subHeads.push({ name: t, idx: i });
			}
		}

		const firstSub = subHeads.length ? subHeads[0].idx : chunk.length;
		const baseLines = chunk.slice(0, firstSub);
		const baseTraits = parseTraitsFromLines(baseLines);

		const subraces = {};
		for (let i = 0; i < subHeads.length; i++) {
			const name = subHeads[i].name;
			const sStart = subHeads[i].idx + 1;
			const sEnd = i + 1 < subHeads.length ? subHeads[i + 1].idx : chunk.length;
			const sChunk = chunk.slice(sStart, sEnd);
			const parsed = parseSubraceBlock(sChunk);
			const key = name;
			subraces[key] = {
				name,
				description: parsed.description,
				traits: parsed.traits
			};
			subraceCount++;
		}

		races[raceName] = {
			name: raceName,
			id: slugifyId(raceName) || null,
			traits: baseTraits,
			subraces
		};
	}

	const out = {
		meta: {
			source: 'src/data/SRD Data.md',
			generatedAt: new Date().toISOString(),
			baseRaceCount: Object.keys(races).length,
			subraceCount
		},
		races
	};

	fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
	console.log(`Wrote ${Object.keys(races).length} SRD races -> ${path.relative(path.join(__dirname, '..'), OUTPUT_PATH)}`);
}

main();
