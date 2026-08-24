const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'src', 'fishingminigame.html');
const source = fs.readFileSync(htmlPath, 'utf8');
const localWebpPattern = /assets\/images\/(?:fish|items)\/[^"'`]+\.webp/g;
const references = new Map();
let coastalDormant = false;

for (const line of source.split(/\r?\n/)) {
  if (line.includes('name: "Coastal Waters"')) coastalDormant = true;
  if (line.includes('name: "Deep Caverns"')) coastalDormant = false;

  for (const match of line.matchAll(localWebpPattern)) {
    const reference = match[0];
    const usage = references.get(reference) || { active: false, dormant: false };
    if (coastalDormant) usage.dormant = true;
    else usage.active = true;
    references.set(reference, usage);
  }
}

const pngReferences = source.match(/assets\/images\/[^"'`]+\.png/g) || [];
const activeMissing = [];
const dormantMissing = [];
const caseMismatches = [];

for (const [reference, usage] of references) {
  const relativePath = reference.replaceAll('/', path.sep);
  const absolutePath = path.join(root, 'src', relativePath);
  const directory = path.dirname(absolutePath);
  const filename = path.basename(absolutePath);
  const directoryEntries = fs.existsSync(directory) ? fs.readdirSync(directory) : [];

  if (directoryEntries.includes(filename)) continue;

  const caseInsensitiveMatch = directoryEntries.find(entry => entry.toLowerCase() === filename.toLowerCase());
  if (caseInsensitiveMatch) {
    caseMismatches.push(`${reference} -> ${path.posix.join(path.posix.dirname(reference), caseInsensitiveMatch)}`);
  } else if (usage.active) {
    activeMissing.push(reference);
  } else {
    dormantMissing.push(reference);
  }
}

if (pngReferences.length) {
  console.error(`PNG references (${pngReferences.length}):`);
  console.error([...new Set(pngReferences)].join('\n'));
}
if (caseMismatches.length) {
  console.error(`Case mismatches (${caseMismatches.length}):`);
  console.error(caseMismatches.join('\n'));
}
if (activeMissing.length) {
  console.error(`Missing active assets (${activeMissing.length}):`);
  console.error(activeMissing.join('\n'));
}
if (dormantMissing.length) {
  console.log(`Dormant Coastal assets not yet available (${dormantMissing.length}):`);
  console.log(dormantMissing.join('\n'));
}

if (pngReferences.length || caseMismatches.length || activeMissing.length) process.exitCode = 1;
else console.log(`Fishing asset check passed (${references.size} unique WebP references).`);