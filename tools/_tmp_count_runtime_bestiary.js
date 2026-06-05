const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.cwd();
const htmlPath = path.join(root, 'bestiary.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const startMarker = 'var bestiary = ';
const endMarker = '\n        // Current selected monster';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);
if (start === -1 || end === -1) throw new Error('Could not locate embedded bestiary block');

const objText = html.slice(start + startMarker.length, end).trim().replace(/;\s*$/, '');
const embedded = vm.runInNewContext('(' + objText + ')');

const normalize = (name) => String(name || '').trim().toLowerCase();
const existing = new Set();
const merged = [];

function addCreatures(creatures) {
  if (!Array.isArray(creatures)) return 0;
  let added = 0;
  for (const creature of creatures) {
    const key = normalize(creature && creature.name);
    if (!key || existing.has(key)) continue;
    existing.add(key);
    merged.push(creature);
    added += 1;
  }
  return added;
}

function firstExisting(candidates) {
  return candidates
    .map((p) => path.join(root, p))
    .find((p) => fs.existsSync(p));
}

function parseJsonCreatures(filePath) {
  if (!filePath) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data && data.creatures)) return data.creatures;
  return Array.isArray(data) ? data : [];
}

addCreatures(embedded.creatures);

const additionsPath = firstExisting([
  'tools/_tmp_bestiary_v3_additions.json',
]);
const critterDbPath = firstExisting([
  'referencedata/World of Scholia Diaspros/new-monsters-critterdb.json',
]);
const v3Path = firstExisting([
  'Diaper-School-Full-BestiaryV3.json',
  'src/data/Diaper-School-Full-BestiaryV3.json',
]);
const v2Path = firstExisting([
  'Diaper-School-Full-BestiaryV2.json',
  'src/data/Diaper-School-Full-BestiaryV2.json',
]);

const bySource = {
  embedded: embedded.creatures.length,
  additions: addCreatures(parseJsonCreatures(additionsPath)),
  critterdb: addCreatures(parseJsonCreatures(critterDbPath)),
  v3: addCreatures(parseJsonCreatures(v3Path)),
  v2: addCreatures(parseJsonCreatures(v2Path)),
};

console.log(JSON.stringify({
  totalUniqueTracked: merged.length,
  bySource,
  resolvedPaths: {
    additionsPath,
    critterDbPath,
    v3Path,
    v2Path,
  },
}, null, 2));
