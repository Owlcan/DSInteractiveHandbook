#!/usr/bin/env node
/*
Builds structured indexes from `referencedata/scholia subclasses.txt`.

Outputs:
- src/custom_spells_index.json
- src/custom_subclasses_index.json

Goals:
- Best-effort parsing from messy plain text.
- Preserve raw blocks so the UI can still print something even when structured parsing misses.
- Extract spell definitions (name + level/school + casting/range/components/duration + description).
- Extract subclass blocks (name, guessed class, raw text, extracted spell references).
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'referencedata', 'scholia subclasses.txt');
const OUT_SPELLS = path.join(ROOT, 'src', 'custom_spells_index.json');
const OUT_SUBCLASSES = path.join(ROOT, 'src', 'custom_subclasses_index.json');

function normalizeNewlines(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizeSpaces(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function explodeAlignedLines(inputLines) {
  const out = [];
  for (const line of inputLines) {
    const raw = String(line ?? '');
    // Many parts of this file are exported with large whitespace runs separating columns.
    // Split those into separate logical lines so spell blocks don't get glued together.
    if (/\t/.test(raw) || /\s{6,}/.test(raw)) {
      const parts = raw.split(/\s{6,}|\t+/g).map(p => p.trim()).filter(Boolean);
      if (parts.length) out.push(...parts);
      else out.push(raw);
    } else {
      out.push(raw);
    }
  }
  return out;
}

function compactText(t) {
  return String(t || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function looksLikeDocMarkerLine(t) {
  return /^<\/?[^>]+>$/.test(String(t || '').trim());
}

function looksLikeSubclassTitle(t) {
  const s = String(t || '').trim();
  if (!s) return false;
  if (/^\d/.test(s)) return false;
  if (s.length > 80) return false;
  if (/[.:]/.test(s)) return false;
  // Reject sentence-like lines.
  if (/\b(is|are|was|were|perhaps|practitioners)\b/i.test(s)) return false;
  if (s.split(/\s+/).length > 10) return false;
  if (/^oath\s+of\s+/i.test(s)) return true;
  if (/\boath\b/i.test(s) && /oath$/i.test(s) && /^[A-Za-z0-9'’\-\s]+$/.test(s) && s.length <= 64) return true;
  if (/^pact\s+of\s+/i.test(s)) return true;
  if (/^circle\s+of\s+/i.test(s)) return true;
  if (/\bcircle\s+of\b/i.test(s) && s.length <= 80) return true;
  if (/^college\s+of\s+/i.test(s)) return true;
  if (/\bdomain\b/i.test(s) && /domain$/i.test(s)) return true;
  if (/^way\s+of\s+/i.test(s)) return true;
  if (/^school\s+of\s+/i.test(s)) return true;
  return false;
}

function guessClassFromSubclassTitle(title) {
  const t = String(title || '').trim();
  if (!t) return '';
  if (/^oath\s+of\b/i.test(t) || (/\boath\b/i.test(t) && /oath$/i.test(t))) return 'Paladin';
  if (/^pact\s+of\b/i.test(t)) return 'Warlock';
  if (/\bcircle\s+of\b/i.test(t)) return 'Druid';
  if (/\bdomain\b/i.test(t) && /domain$/i.test(t)) return 'Cleric';
  if (/^college\s+of\b/i.test(t)) return 'Bard';
  if (/^way\s+of\b/i.test(t)) return 'Monk';
  if (/^school\s+of\b/i.test(t) || /\barcane\s+tradition\b/i.test(t)) return 'Wizard';
  return '';
}

function stripAsterisks(name) {
  return String(name || '').replace(/[\*]+/g, '').trim();
}

function extractSpellRefsFromBlockLines(lines) {
  const refs = [];
  const spellNameRe = /([A-Z][A-Za-z0-9'’\-]+(?:\s+[A-Z][A-Za-z0-9'’\-]+){0,8})\s*(?:\*\*|\*)?/g;

  for (const raw of lines) {
    const t = String(raw || '').trim();
    if (!t) continue;

    // Skip obvious non-spell list headers.
    if (/^spell\s+level\b/i.test(t)) continue;
    if (/^spells\b/i.test(t)) continue;
    if (/^paladin\s+level\b/i.test(t)) continue;
    if (/^channel\s+divinity\b/i.test(t)) continue;
    if (/^tenets\b/i.test(t)) continue;

    // Spell list rows tend to have commas.
    const hasComma = t.includes(',');
    const hasTab = t.includes('\t');
    const hasTwoSpaces = /\s{2,}/.test(t);

    if (!hasComma && !hasTab && !hasTwoSpaces) continue;

    // Capture potential spell names (capitalized sequences).
    const names = [];
    let m;
    while ((m = spellNameRe.exec(t)) !== null) {
      const name = stripAsterisks(m[1]);
      // Filter common false positives.
      if (!name) continue;
      if (/^(Spell|Spells|Casting|Components|Duration|Range|Paladin|Druid|Warlock|Cleric|Level)$/i.test(name)) continue;
      if (name.length < 3) continue;
      names.push(name);
    }

    if (names.length) {
      // Try to infer the level column (e.g. "3rd" or "1st").
      const lvl = (t.match(/^(\d+)(st|nd|rd|th)\b/i) || [])[1] || '';
      refs.push({ atLevel: lvl ? `${lvl}` : '', spells: Array.from(new Set(names)) });
    }
  }

  // Merge by atLevel.
  const byLevel = new Map();
  for (const r of refs) {
    const k = String(r.atLevel || '');
    if (!byLevel.has(k)) byLevel.set(k, new Set());
    for (const s of r.spells || []) byLevel.get(k).add(s);
  }

  const out = [];
  for (const [k, set] of byLevel.entries()) {
    out.push({ atLevel: k, spells: Array.from(set).sort((a, b) => a.localeCompare(b)) });
  }

  // Prefer known ordering for numeric keys; keep blanks last.
  out.sort((a, b) => {
    const na = parseInt(a.atLevel, 10);
    const nb = parseInt(b.atLevel, 10);
    const fa = Number.isFinite(na);
    const fb = Number.isFinite(nb);
    if (fa && fb && na !== nb) return na - nb;
    if (fa && !fb) return -1;
    if (!fa && fb) return 1;
    return String(a.atLevel).localeCompare(String(b.atLevel));
  });

  // Remove empty entries.
  return out.filter(x => (x.spells || []).length);
}

// ---- Spell parsing (best-effort) ----

function looksLikeSpellNameLine(line) {
  const raw = String(line || '');
  const t = normalizeSpaces(raw);
  if (!t) return false;
  if (raw.includes(':')) return false;
  if (/\s{8,}/.test(raw)) return false; // table-ish alignment / columns
  if (looksLikeDocMarkerLine(t)) return false;

  // Hard excludes: list/table headings we never want to treat as spell names.
  if (/\bnew\s+domain\s+spells\b/i.test(t)) return false;

  // Exclude common headings.
  if (/^(New\s+.+\s+Spells|Oath\s+Spells|Expanded\s+Spell\s+List|Spell\s+Level|Spells|Channel\s+Divinity|Tenets|Classes|Class\s+Features)$/i.test(t)) return false;

  // Reasonably restrictive: starts with capital letter.
  return /^[A-Z][A-Za-z0-9'’\- ]{2,80}$/.test(t);
}

function parseLevelSchoolAndClasses(metaLine) {
  const raw = normalizeSpaces(metaLine);
  if (!raw) return null;

  // Examples:
  //  "1st-level Enchantment, Paladin"
  //  "4th level Transmutation"
  //  "3rd level Illusion"
  //  "Conjuration cantrip"

  const ritual = /\(ritual\)/i.test(raw);
  const cleaned = raw.replace(/\(ritual\)/gi, '').trim();

  const cantrip = cleaned.match(/^(.+?)\s+cantrip\b/i);
  if (cantrip) {
    return { level: 0, school: String(cantrip[1]).trim().toLowerCase(), ritual, classes: '' };
  }

  const lvl = cleaned.match(/^(\d+)(st|nd|rd|th)?(?:-|\s+)level\s+([^,]+)(?:,\s*(.+))?$/i);
  if (lvl) {
    return {
      level: parseInt(lvl[1], 10),
      school: String(lvl[3] || '').trim().toLowerCase(),
      ritual,
      classes: String(lvl[4] || '').trim()
    };
  }

  return null;
}

function parseInlineField(text, label) {
  const re = new RegExp(`${label}\\s*:\\s*([\\s\\S]+?)(?=(?:Casting Time|Range|Components|Duration)\\s*:|$)`, 'i');
  const m = String(text || '').match(re);
  return m ? String(m[1]).trim() : '';
}

function cleanDuration(duration) {
  let d = normalizeSpaces(duration);
  if (!d) return '';
  // Common formatting issue: description begins on same line after duration.
  const splitters = [' You ', ' Choose ', ' The target ', ' A creature '];
  for (const s of splitters) {
    const idx = d.indexOf(s.trim());
    if (idx > 0) {
      // Only split if it looks like a sentence-start token after a duration phrase.
      const before = d.slice(0, idx).trim();
      if (/(instantaneous|round|minute|minutes|hour|hours|day|days|until)/i.test(before)) return before;
    }
  }
  return d;
}

function splitDurationAndTail(durationRaw) {
  const d = normalizeSpaces(durationRaw);
  if (!d) return { duration: '', tail: '' };

  const patterns = [
    /^Instantaneous\b/i,
    /^Special\b/i,
    /^Until dispelled\b/i,
    /^Concentration,\s*up to\s*\d+\s*(round|rounds|minute|minutes|hour|hours|day|days)\b/i,
    /^Up to\s*\d+\s*(round|rounds|minute|minutes|hour|hours|day|days)\b/i,
    /^\d+\s*(round|rounds|minute|minutes|hour|hours|day|days)\b/i
  ];

  for (const re of patterns) {
    const m = d.match(re);
    if (!m) continue;
    const dur = m[0].trim();
    const tail = d.slice(m[0].length).trim().replace(/^[\-—:]+\s*/, '');
    return { duration: dur, tail };
  }

  return { duration: cleanDuration(d), tail: '' };
}

function parseComponents(raw) {
  const t = String(raw || '').trim();
  const upper = t.toUpperCase();
  const verbal = /\bV\b/.test(upper);
  const somatic = /\bS\b/.test(upper);
  let material = false;
  const m = t.match(/\bM\s*\(([^)]+)\)/i);
  if (m) material = String(m[1]).trim();
  else if (/\bM\b/.test(upper)) material = true;
  return { verbal, somatic, material };
}

function parseSpellsFromLines(lines) {
  const spells = [];

  const HEADER_TOKEN_RE = /(?:^|\b)(Casting Time|Range|Components|Duration)\s*:/i;

  function nextNonEmptyIndex(i) {
    for (let j = i; j < lines.length; j++) {
      if (String(lines[j] || '').trim()) return j;
    }
    return -1;
  }

  const schoolWhitelist = new Set([
    'abjuration','conjuration','divination','enchantment','evocation','illusion','necromancy','transmutation'
  ]);

  for (let i = 0; i < lines.length; ) {
    const nameLine = String(lines[i] || '').trim();

    if (looksLikeSpellNameLine(nameLine)) {
      const j = nextNonEmptyIndex(i + 1);
      if (j > 0) {
        const meta = parseLevelSchoolAndClasses(lines[j]);
        if (meta && Number.isFinite(meta.level) && meta.level >= 0 && meta.level <= 9 && schoolWhitelist.has(String(meta.school || ''))) {
          const name = nameLine;
          i = j + 1;

          let casttime = '';
          let range = '';
          let components = null;
          let duration = '';
          const descPrefix = [];

          // Header lines may be split or combined; consume contiguous header-ish lines.
          for (let k = 0; k < 10 && i < lines.length; k++) {
            const rawHdr = String(lines[i] || '');
            const hdr = rawHdr.trim();
            if (!hdr) {
              i++;
              continue;
            }
            if (looksLikeDocMarkerLine(hdr)) break;

            const hasHeaderToken = HEADER_TOKEN_RE.test(hdr);
            if (!hasHeaderToken) break;

            if (!casttime) casttime = parseInlineField(hdr, 'Casting Time');
            if (!range) range = parseInlineField(hdr, 'Range');
            if (!duration) {
              const durRaw = parseInlineField(hdr, 'Duration');
              if (durRaw) {
                const split = splitDurationAndTail(durRaw);
                duration = split.duration;
                if (split.tail) descPrefix.push(split.tail);
              }
            }
            const compRaw = parseInlineField(hdr, 'Components');
            if (!components && compRaw) components = parseComponents(compRaw);
            i++;
          }

          duration = cleanDuration(duration);

          const descLines = [];
          if (descPrefix.length) descLines.push(descPrefix.join(' '));
          const higherLines = [];
          let inHigher = false;

          for (; i < lines.length; i++) {
            const raw = String(lines[i] ?? '');
            const t = raw.trim();

            if (looksLikeDocMarkerLine(t)) {
              i--; // let outer loop consume marker normally
              break;
            }

            // If a new unnamed spell block starts (Casting Time etc) we stop to avoid contaminating.
            if (/^Casting Time\s*:/i.test(t) && (descLines.length || higherLines.length)) {
              i--; // let outer loop continue scanning from here
              break;
            }

            // Stop if we detect next spell.
            if (looksLikeSpellNameLine(t)) {
              const nxt = nextNonEmptyIndex(i + 1);
              const meta2 = nxt > 0 ? parseLevelSchoolAndClasses(lines[nxt]) : null;
              if (meta2 && Number.isFinite(meta2.level) && schoolWhitelist.has(String(meta2.school || ''))) {
                i--; // let outer loop parse next spell
                break;
              }
            }

            // Sometimes headers appear again (formatting). If we haven't filled them yet, capture.
            if (HEADER_TOKEN_RE.test(t)) {
              if (!casttime) casttime = parseInlineField(t, 'Casting Time');
              if (!range) range = parseInlineField(t, 'Range');
              if (!duration) {
                const durRaw = parseInlineField(t, 'Duration');
                if (durRaw) {
                  const split = splitDurationAndTail(durRaw);
                  duration = cleanDuration(split.duration);
                  if (split.tail) descLines.push(split.tail);
                }
              }
              const compRaw = parseInlineField(t, 'Components');
              if (!components && compRaw) components = parseComponents(compRaw);
              continue;
            }

            if (/^At Higher Levels\./i.test(t)) {
              inHigher = true;
              const rest = t.replace(/^At Higher Levels\./i, '').trim();
              if (rest) higherLines.push(rest);
              continue;
            }

            if (inHigher) higherLines.push(raw);
            else descLines.push(raw);
          }

          const description = compactText(descLines.join('\n'));
          const higherlevels = compactText(higherLines.join('\n'));
          const concentration = /^concentration\b/i.test(String(duration || '').trim());

          spells.push({
            name,
            level: meta.level,
            school: meta.school,
            classes: meta.classes || '',
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

          i++;
          continue;
        }
      }
    }

    i++;
  }

  // De-dupe by name.
  const byKey = new Map();
  for (const s of spells) {
    const k = normalizeKey(s.name);
    if (!k) continue;
    if (!byKey.has(k)) byKey.set(k, s);
  }
  const deduped = Array.from(byKey.values());
  deduped.sort((a, b) => a.name.localeCompare(b.name));
  return deduped;
}

function parseSubclassesFromLines(lines) {
  const out = [];
  let currentDoc = '';
  let current = null;

  for (const rawLine of lines) {
    const t = String(rawLine || '').trim();

    if (looksLikeDocMarkerLine(t)) {
      currentDoc = t.replace(/[<>]/g, '').trim();
      continue;
    }

    if (looksLikeSubclassTitle(t)) {
      if (current) {
        current.text = compactText(current.lines.join('\n'));
        current.spellRefs = extractSpellRefsFromBlockLines(current.lines);
        delete current.lines;
        out.push(current);
      }
      current = {
        name: t,
        className: guessClassFromSubclassTitle(t),
        sourceDoc: currentDoc,
        text: '',
        spellRefs: [],
        lines: [t]
      };
      continue;
    }

    if (current) current.lines.push(rawLine);
  }

  if (current) {
    current.text = compactText(current.lines.join('\n'));
    current.spellRefs = extractSpellRefsFromBlockLines(current.lines);
    delete current.lines;
    out.push(current);
  }

  // De-dupe (keep the longest text for a given name+class).
  const byKey = new Map();
  for (const s of out) {
    const k = `${normalizeKey(s.name)}|${normalizeKey(s.className)}`;
    if (!k.trim()) continue;
    const prev = byKey.get(k);
    if (!prev || String(s.text || '').length > String(prev.text || '').length) byKey.set(k, s);
  }

  const deduped = Array.from(byKey.values());
  deduped.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  return deduped;
}

function main() {
  if (!fs.existsSync(INPUT)) throw new Error(`Missing input: ${INPUT}`);
  const text = normalizeNewlines(fs.readFileSync(INPUT, 'utf8'));
  const rawLines = text.split('\n');
  const lines = explodeAlignedLines(rawLines);

  const subclasses = parseSubclassesFromLines(lines);
  const spells = parseSpellsFromLines(lines);

  const outSpells = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'referencedata/scholia subclasses.txt',
    count: spells.length,
    spells
  };

  const outSubclasses = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'referencedata/scholia subclasses.txt',
    count: subclasses.length,
    subclasses
  };

  fs.mkdirSync(path.dirname(OUT_SPELLS), { recursive: true });
  fs.writeFileSync(OUT_SPELLS, JSON.stringify(outSpells, null, 2) + '\n', 'utf8');
  fs.writeFileSync(OUT_SUBCLASSES, JSON.stringify(outSubclasses, null, 2) + '\n', 'utf8');

  process.stdout.write(
    JSON.stringify(
      {
        input: path.relative(ROOT, INPUT),
        spells: { count: spells.length, out: path.relative(ROOT, OUT_SPELLS) },
        subclasses: { count: subclasses.length, out: path.relative(ROOT, OUT_SUBCLASSES) }
      },
      null,
      2
    ) + '\n'
  );
}

main();
