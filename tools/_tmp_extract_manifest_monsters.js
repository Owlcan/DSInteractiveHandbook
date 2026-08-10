const fs = require("fs");
const path = require("path");

const root = process.cwd();
const manifestPath = path.join(root, "referencedata", "monster manifest absolute");
const critterPath = path.join(root, "referencedata", "World of Scholia Diaspros", "new-monsters-critterdb.json");
const v4Path = path.join(root, "src", "data", "Diaper-School-Full-BestiaryV4.json");
const addablePath = path.join(root, "remove these", "addable stuff.txt");
const outputPath = path.join(root, "referencedata", "manifest-75-monsters.json");

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/__focus/g, "")
    .replace(/\(2\)/g, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/mimick/g, "mimic")
    .replace(/miter/g, "mite")
    .replace(/black[ _-]*bramble[ _-]*stag/g, "bramble-stag")
    .replace(/avalanche[ _-]*horn/g, "shatterhorn")
    .replace(/[ _-]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function loadManifestNames() {
  const lines = fs.readFileSync(manifestPath, "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.map((line) => {
    const cleaned = line.replace(/^"|"$/g, "");
    return path.basename(cleaned, path.extname(cleaned));
  });
}

function loadCritterCreatures() {
  const parsed = JSON.parse(fs.readFileSync(critterPath, "utf8"));
  return Array.isArray(parsed.creatures) ? parsed.creatures : [];
}

function loadV4Creatures() {
  const parsed = JSON.parse(fs.readFileSync(v4Path, "utf8"));
  return Array.isArray(parsed.creatures) ? parsed.creatures : [];
}

function loadAddableCreatures() {
  return JSON.parse(fs.readFileSync(addablePath, "utf8"));
}

const manifestNames = loadManifestNames();
const critterCreatures = loadCritterCreatures();
const v4Creatures = loadV4Creatures();
const addableCreatures = loadAddableCreatures();
const critterByName = new Map(critterCreatures.map((entry) => [normalize(entry.name), entry]));
const v4ByName = new Map(v4Creatures.map((entry) => [normalize(entry.name), entry]));
const addableByName = new Map(addableCreatures.map((entry) => [normalize(entry.name), entry]));

const resolved = [];
const missingFromCritter = [];
const missingFromV4 = [];
const missingFromAddable = [];

for (const manifestName of manifestNames) {
  const key = normalize(manifestName);
  const critter = critterByName.get(key) || null;
  const v4 = v4ByName.get(key) || null;
  const addable = addableByName.get(key) || null;
  if (!critter) missingFromCritter.push(manifestName);
  if (!v4) missingFromV4.push(manifestName);
  if (!addable) missingFromAddable.push(manifestName);
  resolved.push({
    manifestName,
    critterName: critter ? critter.name : null,
    v4Name: v4 ? v4.name : null,
    addableName: addable ? addable.name : null,
    source: v4 ? "v4" : critter ? "critterdb" : addable ? "addable" : null,
    creature: v4 || critter || addable || null,
  });
}

const extracted = resolved.filter((entry) => entry.creature).map((entry) => entry.creature);
fs.writeFileSync(outputPath, JSON.stringify(extracted, null, 2) + "\n");

console.log(JSON.stringify({
  manifestLineCount: manifestNames.length,
  uniqueNormalizedManifestCount: new Set(manifestNames.map(normalize)).size,
  critterMatchCount: resolved.filter((entry) => entry.critterName).length,
  v4MatchCount: resolved.filter((entry) => entry.v4Name).length,
  addableMatchCount: resolved.filter((entry) => entry.addableName).length,
  extractedCount: extracted.length,
  uniqueExtractedCount: new Set(extracted.map((entry) => normalize(entry.name))).size,
  missingFromCritter,
  missingFromV4,
  missingFromAddable,
  missingEverywhere: resolved.filter((entry) => !entry.creature).map((entry) => entry.manifestName),
  outputPath,
}, null, 2));
