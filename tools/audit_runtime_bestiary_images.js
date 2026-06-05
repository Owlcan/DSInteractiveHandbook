#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'bestiary.html');
const RUNTIME_PATH = path.join(ROOT, 'Diaper-School-Full-BestiaryRuntime.json');
function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

function extractConstArrayLiteral(htmlText, constName) {
  const marker = `const ${constName} =`;
  const start = htmlText.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${constName}`);
  let i = start + marker.length;
  while (i < htmlText.length && htmlText[i] !== '[') i += 1;
  if (i >= htmlText.length) throw new Error(`Could not find opening [ for ${constName}`);
  return extractBracketLiteral(htmlText, i, '[', ']');
}

function extractNewMapArrayLiteral(htmlText, constName) {
  const marker = `const ${constName} = new Map(`;
  const start = htmlText.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${constName}`);
  let i = start + marker.length;
  while (i < htmlText.length && htmlText[i] !== '[') i += 1;
  if (i >= htmlText.length) throw new Error(`Could not find opening [ for ${constName}`);
  return extractBracketLiteral(htmlText, i, '[', ']');
}

function extractFunctionSource(htmlText, functionName) {
  const marker = `function ${functionName}(`;
  const start = htmlText.indexOf(marker);
  if (start === -1) throw new Error(`Could not find function ${functionName}`);
  let i = start;
  while (i < htmlText.length && htmlText[i] !== '{') i += 1;
  if (i >= htmlText.length) throw new Error(`Could not find opening { for ${functionName}`);
  const body = extractBracketLiteral(htmlText, i, '{', '}');
  return htmlText.slice(start, i) + body;
}

function extractBestiaryObjectLiteralFromHtml(htmlText) {
  const marker = 'var bestiary =';
  const start = htmlText.indexOf(marker);
  if (start === -1) throw new Error(`Could not find marker: ${marker}`);
  let i = start + marker.length;
  while (i < htmlText.length && htmlText[i] !== '{') i += 1;
  if (i >= htmlText.length) throw new Error('Could not find opening { for bestiary object');
  return extractBracketLiteral(htmlText, i, '{', '}');
}

function extractBracketLiteral(text, startIndex, openChar, closeChar) {
  let depth = 0;
  let inString = false;
  let stringQuote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === stringQuote) {
        inString = false;
        stringQuote = null;
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === '\'' || ch === '`') {
      inString = true;
      stringQuote = ch;
      continue;
    }
    if (ch === openChar) depth += 1;
    if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return text.slice(startIndex, i + 1);
    }
  }

  throw new Error(`Unterminated literal starting at ${startIndex}`);
}

function buildAuditContext(htmlText) {
  const source = [
    `const IMAGE_BASE_DIRS = ${extractConstArrayLiteral(htmlText, 'IMAGE_BASE_DIRS')};`,
    `const IMAGE_EXTS = ${extractConstArrayLiteral(htmlText, 'IMAGE_EXTS')};`,
    `const IMAGE_NAME_OVERRIDES = new Map(${extractNewMapArrayLiteral(htmlText, 'IMAGE_NAME_OVERRIDES')});`,
    extractFunctionSource(htmlText, 'normalizeName'),
    extractFunctionSource(htmlText, 'tokenVariants'),
    extractFunctionSource(htmlText, 'buildCandidatePaths'),
    'module.exports = { IMAGE_BASE_DIRS, IMAGE_EXTS, IMAGE_NAME_OVERRIDES, normalizeName, tokenVariants, buildCandidatePaths };',
  ].join('\n\n');

  const sandbox = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(source, sandbox, { timeout: 2000 });
  return sandbox.module.exports;
}

function normalizeFilePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function basenameNoExt(fileName) {
  return fileName.replace(/\.[^.]+$/, '');
}

function normalizeCreatureKey(name) {
  return String(name || '').trim().toLowerCase();
}

function canonicalFileStem(fileName) {
  return basenameNoExt(fileName)
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/g, '')
    .replace(/\d+$/g, '')
    .replace(/[_\-\s]+/g, ' ')
    .replace(/\b(copy|focus|bria|alt|variant)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fileLooksVariant(fileName) {
  return /\(\d+\)|__|_\.(webp|png|jpg|jpeg)$|\bbria\b|\bcopy\b|\bvariant\b|\bfocus\b|\d+\.(webp|png|jpg|jpeg)$/i.test(fileName);
}

function creatureLooksCoveredByImageName(creatureName, fileName) {
  const creatureStem = String(creatureName || '')
    .toLowerCase()
    .replace(/[“”‘’'`]/g, '')
    .replace(/\(([^)]*)\)/g, ' $1 ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  const fileStem = canonicalFileStem(fileName)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  if (!creatureStem || !fileStem) return false;
  return creatureStem === fileStem || creatureStem.includes(fileStem) || fileStem.includes(creatureStem);
}

function listImageFilesFromBaseDirs(baseDirs) {
  const files = new Set();

  for (const baseDir of baseDirs || []) {
    const absDir = path.join(ROOT, normalizeFilePath(baseDir));
    if (!fs.existsSync(absDir)) continue;
    for (const name of fs.readdirSync(absDir)) {
      if (/\.(webp|png|jpg|jpeg)$/i.test(name)) files.add(name);
    }
  }

  return Array.from(files).sort((a, b) => a.localeCompare(b));
}

function byCreatureName(creatures) {
  const map = new Map();
  for (const creature of creatures || []) {
    const key = normalizeCreatureKey(creature && creature.name);
    if (!key || map.has(key)) continue;
    map.set(key, creature);
  }
  return map;
}

function collectDuplicateCreatureNames(creatures) {
  const counts = new Map();
  for (const creature of creatures || []) {
    const key = normalizeCreatureKey(creature && creature.name);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function stringifyArray(value) {
  return JSON.stringify(Array.isArray(value) ? value : []);
}

function deepCloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function stableNormalize(value) {
  if (Array.isArray(value)) return value.map(stableNormalize);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableNormalize(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function stringifyStable(value) {
  return JSON.stringify(stableNormalize(value));
}

function normalizeCreatureName(name) {
  return String(name || '').trim().toLowerCase();
}

function hasDamageVulnerability(creature, vulnerabilityName) {
  const vuln = String(vulnerabilityName || '').trim().toLowerCase();
  if (!vuln) return false;
  const list = creature && creature.stats && creature.stats.damageVulnerabilities;
  if (!Array.isArray(list)) return false;
  return list.some((value) => String(value || '').trim().toLowerCase() === vuln);
}

function isDarklingOrDarkeformeCreature(creature) {
  const name = normalizeCreatureName(creature && creature.name);
  const faction = normalizeCreatureName(creature && creature.flavor && creature.flavor.faction);
  const race = normalizeCreatureName(creature && creature.stats && creature.stats.race);
  const fields = [name, faction, race].filter(Boolean);
  return fields.some((value) => (
    value.includes('darkling') ||
    value.includes('darkforme') ||
    value.includes('darkeforme') ||
    value.includes('darkform') ||
    value.includes('darkeform')
  ));
}

function ensureRadiantWeaknessForDarklingsAndDarkeformes(creatures) {
  let changed = 0;
  for (const creature of creatures || []) {
    if (!isDarklingOrDarkeformeCreature(creature)) continue;
    if (!creature.stats || typeof creature.stats !== 'object') creature.stats = {};
    if (!Array.isArray(creature.stats.damageVulnerabilities)) creature.stats.damageVulnerabilities = [];
    if (hasDamageVulnerability(creature, 'Radiant')) continue;
    creature.stats.damageVulnerabilities.push('Radiant');
    changed += 1;
  }
  return changed;
}

function collectDarklingRadiantCoverage(creatures) {
  const relevantCreatures = (creatures || []).filter(isDarklingOrDarkeformeCreature);
  const missingRadiant = relevantCreatures
    .filter((creature) => !hasDamageVulnerability(creature, 'Radiant'))
    .map((creature) => creature.name)
    .sort((a, b) => a.localeCompare(b));

  return {
    trackedCreatureCount: relevantCreatures.length,
    missingRadiantCount: missingRadiant.length,
    missingRadiantCreatures: missingRadiant,
  };
}

function collectLikelyFilesForCreature(creatureName, fileNames) {
  return fileNames
    .filter((fileName) => creatureLooksCoveredByImageName(creatureName, fileName))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 10);
}

function resolveMatchedFilesForCreature(creatureName, auditContext, availableFilesSet) {
  const matches = new Set();
  const overrideEntry = auditContext.IMAGE_NAME_OVERRIDES.get(creatureName);
  const overrideList = Array.isArray(overrideEntry) ? overrideEntry : (overrideEntry ? [overrideEntry] : []);

  for (const override of overrideList) {
    const raw = String(override || '');
    if (!raw) continue;
    const normalized = normalizeFilePath(raw);
    const baseName = path.posix.basename(normalized);
    if (availableFilesSet.has(baseName)) matches.add(baseName);
  }

  const candidatePaths = [
    ...auditContext.buildCandidatePaths(creatureName, false),
    ...auditContext.buildCandidatePaths(creatureName, true),
  ];

  for (const candidate of candidatePaths) {
    const decoded = decodeURI(candidate);
    const baseName = path.posix.basename(normalizeFilePath(decoded));
    if (availableFilesSet.has(baseName)) matches.add(baseName);
  }

  return Array.from(matches).sort((a, b) => a.localeCompare(b));
}

function addDirectImageUrlMatches(creature, availableFilesSet, matches) {
  const raw = creature && creature.flavor && creature.flavor.imageUrl;
  if (!raw || typeof raw !== 'string') return false;
  const normalized = normalizeFilePath(decodeURI(raw.trim()));
  if (!normalized) return false;
  const baseName = path.posix.basename(normalized);
  if (availableFilesSet.has(baseName)) matches.add(baseName);
  return true;
}

function main() {
  const htmlText = fs.readFileSync(HTML_PATH, 'utf8');
  const runtime = readJson(RUNTIME_PATH);
  const creatures = Array.isArray(runtime.creatures) ? runtime.creatures : [];
  const embedded = vm.runInNewContext(`(${extractBestiaryObjectLiteralFromHtml(htmlText)})`, {}, { timeout: 2000 });
  const embeddedCreatures = Array.isArray(embedded && embedded.creatures) ? embedded.creatures : [];
  const auditContext = buildAuditContext(htmlText);
  const imageFiles = listImageFilesFromBaseDirs(auditContext.IMAGE_BASE_DIRS);
  const availableFilesSet = new Set(imageFiles);

  const creatureMatches = [];
  const matchedFileToCreatures = new Map();
  const uncoveredCreatures = [];

  for (const creature of creatures) {
    const name = creature && creature.name;
    const matchedFilesSet = new Set(resolveMatchedFilesForCreature(name, auditContext, availableFilesSet));
    const hasExplicitImageUrl = addDirectImageUrlMatches(creature, availableFilesSet, matchedFilesSet);
    const matchedFiles = Array.from(matchedFilesSet).sort((a, b) => a.localeCompare(b));
    creatureMatches.push({ name, matchedFiles });
    if (!matchedFiles.length && !hasExplicitImageUrl) uncoveredCreatures.push(name);
    for (const fileName of matchedFiles) {
      if (!matchedFileToCreatures.has(fileName)) matchedFileToCreatures.set(fileName, []);
      matchedFileToCreatures.get(fileName).push(name);
    }
  }

  const unmatchedFiles = imageFiles.filter((fileName) => !matchedFileToCreatures.has(fileName));
  const unmatchedNonVariantFiles = unmatchedFiles.filter((fileName) => !fileLooksVariant(fileName));

  const nearMatchSuggestions = unmatchedNonVariantFiles.map((fileName) => {
    const relatedCreatures = creatures
      .map((creature) => creature && creature.name)
      .filter((name) => creatureLooksCoveredByImageName(name, fileName))
      .sort((a, b) => a.localeCompare(b));
    return {
      fileName,
      canonicalStem: canonicalFileStem(fileName),
      possibleExistingCreatures: relatedCreatures.slice(0, 10),
    };
  });

  const coveredByMultipleCreatures = Array.from(matchedFileToCreatures.entries())
    .filter(([, names]) => names.length > 1)
    .map(([fileName, names]) => ({ fileName, creatureNames: names.sort((a, b) => a.localeCompare(b)) }))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  const uncoveredCreatureSuggestions = uncoveredCreatures
    .map((name) => ({
      name,
      possibleUnmatchedFiles: collectLikelyFilesForCreature(name, unmatchedNonVariantFiles),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const embeddedMap = byCreatureName(embeddedCreatures);
  const runtimeMap = byCreatureName(creatures);
  const duplicateEmbeddedNames = collectDuplicateCreatureNames(embeddedCreatures);
  let embeddedMissingFromRuntime = 0;
  let entriesWithAnyObjectChange = 0;
  let entriesWithChangedDamageVulnerabilities = 0;
  let entriesWithChangedDamageResistances = 0;
  let entriesWithChangedDamageImmunities = 0;
  const changedStatArrayEntries = [];
  const changedEmbeddedEntries = [];

  for (const [name, embeddedCreature] of embeddedMap.entries()) {
    const runtimeCreature = runtimeMap.get(name);
    if (!runtimeCreature) {
      embeddedMissingFromRuntime += 1;
      continue;
    }

    const objectChanged = stringifyStable(embeddedCreature) !== stringifyStable(runtimeCreature);
    if (objectChanged) {
      entriesWithAnyObjectChange += 1;
      changedEmbeddedEntries.push(embeddedCreature.name);
    }

    const damageVulnerabilitiesChanged = stringifyArray(embeddedCreature && embeddedCreature.stats && embeddedCreature.stats.damageVulnerabilities)
      !== stringifyArray(runtimeCreature && runtimeCreature.stats && runtimeCreature.stats.damageVulnerabilities);
    const damageResistancesChanged = stringifyArray(embeddedCreature && embeddedCreature.stats && embeddedCreature.stats.damageResistances)
      !== stringifyArray(runtimeCreature && runtimeCreature.stats && runtimeCreature.stats.damageResistances);
    const damageImmunitiesChanged = stringifyArray(embeddedCreature && embeddedCreature.stats && embeddedCreature.stats.damageImmunities)
      !== stringifyArray(runtimeCreature && runtimeCreature.stats && runtimeCreature.stats.damageImmunities);

    if (damageVulnerabilitiesChanged) entriesWithChangedDamageVulnerabilities += 1;
    if (damageResistancesChanged) entriesWithChangedDamageResistances += 1;
    if (damageImmunitiesChanged) entriesWithChangedDamageImmunities += 1;

    if (damageVulnerabilitiesChanged || damageResistancesChanged || damageImmunitiesChanged) {
      changedStatArrayEntries.push({
        name: embeddedCreature.name,
        damageVulnerabilitiesChanged,
        damageResistancesChanged,
        damageImmunitiesChanged,
      });
    }
  }

  const runtimeRadiantCoverageBeforeFixup = collectDarklingRadiantCoverage(creatures);
  const postFixupCreatures = deepCloneJson(creatures);
  const radiantFixupsApplied = ensureRadiantWeaknessForDarklingsAndDarkeformes(postFixupCreatures);
  const runtimeRadiantCoverageAfterFixup = collectDarklingRadiantCoverage(postFixupCreatures);

  const report = {
    runtimeCreatureCount: creatures.length,
    embeddedCreatureCount: embeddedCreatures.length,
    imageFileCount: imageFiles.length,
    matchedImageFileCount: matchedFileToCreatures.size,
    unmatchedImageFileCount: unmatchedFiles.length,
    unmatchedNonVariantImageFileCount: unmatchedNonVariantFiles.length,
    uncoveredCreatureCount: uncoveredCreatures.length,
    embeddedIntegrity: {
      embeddedMissingFromRuntime,
      entriesWithAnyObjectChange,
      entriesWithChangedDamageVulnerabilities,
      entriesWithChangedDamageResistances,
      entriesWithChangedDamageImmunities,
      duplicateEmbeddedNameCount: duplicateEmbeddedNames.length,
      duplicateEmbeddedNames,
      changedEmbeddedEntries,
      changedStatArrayEntries,
    },
    darklingRadiantCoverage: {
      runtimeBeforePageFixup: runtimeRadiantCoverageBeforeFixup,
      radiantFixupsApplied,
      pageStateAfterFixup: runtimeRadiantCoverageAfterFixup,
    },
    unmatchedFiles,
    unmatchedNonVariantFiles,
    nearMatchSuggestions,
    uncoveredCreatures,
    uncoveredCreatureSuggestions,
    coveredByMultipleCreatures,
  };

  const outputPath = path.join(ROOT, 'tools', '_tmp_runtime_bestiary_image_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({
    outputPath: path.relative(ROOT, outputPath).split(path.sep).join('/'),
    runtimeCreatureCount: report.runtimeCreatureCount,
    embeddedCreatureCount: report.embeddedCreatureCount,
    imageFileCount: report.imageFileCount,
    matchedImageFileCount: report.matchedImageFileCount,
    unmatchedImageFileCount: report.unmatchedImageFileCount,
    unmatchedNonVariantImageFileCount: report.unmatchedNonVariantImageFileCount,
    uncoveredCreatureCount: report.uncoveredCreatureCount,
    embeddedIntegrity: report.embeddedIntegrity,
  }, null, 2));
}

main();