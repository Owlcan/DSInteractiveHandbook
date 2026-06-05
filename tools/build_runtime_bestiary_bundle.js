#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'bestiary.html');
const OUTPUTS = [
  path.join(ROOT, 'Diaper-School-Full-BestiaryRuntime.json'),
  path.join(ROOT, 'src', 'data', 'Diaper-School-Full-BestiaryRuntime.json'),
];
const RPGMONSTER_RECOVERY_NAMES = new Set([
  'nanny bot matron',
]);
const V4_RECOVERY_NAMES = new Set([
  'darkforme taxmaster',
  'darkling taxling',
]);

function readJsonCreatures(absPath) {
  if (!fs.existsSync(absPath)) return [];
  const parsed = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.creatures)) return parsed.creatures;
  return [];
}

function firstExisting(paths) {
  for (const relPath of paths) {
    const absPath = path.join(ROOT, relPath);
    if (fs.existsSync(absPath)) return absPath;
  }
  return null;
}

function extractBestiaryObjectLiteralFromHtml(htmlText) {
  const marker = 'var bestiary =';
  const start = htmlText.indexOf(marker);
  if (start === -1) throw new Error(`Could not find marker: ${marker}`);

  let i = start + marker.length;
  while (i < htmlText.length && htmlText[i] !== '{') i += 1;
  if (i >= htmlText.length) throw new Error('Could not find opening { for bestiary object');
  const objStart = i;

  let depth = 0;
  let inString = false;
  let stringQuote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (; i < htmlText.length; i += 1) {
    const ch = htmlText[i];
    const next = htmlText[i + 1];

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
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return htmlText.slice(objStart, i + 1);
    }
  }

  throw new Error('Unterminated bestiary object literal');
}

function evaluateObjectLiteral(objectLiteral) {
  return vm.runInNewContext(`(${objectLiteral})`, {}, { timeout: 2000 });
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function readRpgMonsters(absPath) {
  if (!fs.existsSync(absPath)) return [];
  const scriptText = fs.readFileSync(absPath, 'utf8');
  const sandbox = { window: {}, globalThis: {} };
  sandbox.window = sandbox;
  vm.runInNewContext(scriptText, sandbox, { timeout: 2000 });
  const monsters = Array.isArray(sandbox.monsters) ? sandbox.monsters : [];
  const bossMonsters = Array.isArray(sandbox.bossMonsters) ? sandbox.bossMonsters : [];
  return [...monsters, ...bossMonsters];
}

function titleCaseToken(token) {
  if (!token) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function normalizeWeaknessLabel(weakness) {
  const raw = String(weakness || '').trim();
  if (!raw) return null;
  const lowered = raw.toLowerCase();
  if (lowered === 'light') return 'Radiant';
  if (lowered === 'physical') return 'Bludgeoning';
  return titleCaseToken(lowered);
}

function challengeRatingToXp(challengeRating) {
  const key = String(challengeRating);
  const table = {
    '0': 10,
    '0.125': 25,
    '0.25': 50,
    '0.5': 100,
    '1': 200,
    '2': 450,
    '3': 700,
    '4': 1100,
    '5': 1800,
    '6': 2300,
    '7': 2900,
    '8': 3900,
    '9': 5000,
    '10': 5900,
    '11': 7200,
    '12': 8400,
    '13': 10000,
    '14': 11500,
  };
  return table[key] || 0;
}

function attackDescription(attack) {
  const name = String((attack && attack.name) || 'Attack').trim() || 'Attack';
  const damage = Number(attack && attack.damage);
  if (Number.isFinite(damage) && damage > 0) {
    return `${name} deals ${damage} damage.`;
  }
  return `${name}.`;
}

function toBestiaryCreatureFromRpgMonster(monster) {
  const hp = Number(monster && monster.hp);
  const ac = Number(monster && monster.defense);
  const cr = Number(monster && monster.cr);
  const vulnerabilities = Array.isArray(monster && monster.weaknesses)
    ? monster.weaknesses.map(normalizeWeaknessLabel).filter(Boolean)
    : [];
  const attacks = Array.isArray(monster && monster.attacks) ? monster.attacks : [];
  const numHitDie = Math.max(1, Math.round((Number.isFinite(hp) ? hp : 8) / 8));

  return {
    name: monster.name,
    flavor: {
      faction: 'Recovered from RPG roster',
      environment: '',
      description: 'Recovered runtime bestiary entry.',
      nameIsProper: false,
      imageUrl: String(monster.image || ''),
      descriptionHtml: {},
    },
    stats: {
      size: 'Medium',
      race: 'Unknown',
      alignment: 'unaligned',
      armorType: 'Natural Armor',
      armorClass: Number.isFinite(ac) ? ac : 10,
      numHitDie,
      speed: '30 ft.',
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
      proficiencyBonus: Math.max(2, Math.ceil((Number.isFinite(cr) ? cr : 0) / 4) + 1),
      damageVulnerabilities: vulnerabilities,
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: ['passive Perception 10'],
      languages: ['-'],
      challengeRating: Number.isFinite(cr) ? cr : 0,
      experiencePoints: challengeRatingToXp(Number.isFinite(cr) ? cr : 0),
      legendaryActionsPerRound: 0,
      legendaryActionsDescription: '',
      savingThrows: [],
      skills: [],
      additionalAbilities: [],
      actions: attacks.map((attack) => ({
        name: String((attack && attack.name) || 'Attack'),
        description: attackDescription(attack),
        descriptionHtml: {},
      })),
      reactions: [],
      legendaryActions: [],
      hitDieSize: 8,
      armorTypeStr: '(Natural Armor)',
      abilityScoreModifiers: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      abilityScoreStrs: {
        strength: '10 (+0)',
        dexterity: '10 (+0)',
        constitution: '10 (+0)',
        intelligence: '10 (+0)',
        wisdom: '10 (+0)',
        charisma: '10 (+0)',
      },
      extraHealthFromConstitution: 0,
      hitPoints: Number.isFinite(hp) ? hp : 8,
      hitPointsStr: String(Number.isFinite(hp) ? hp : 8),
      passivePerception: 10,
      challengeRatingStr: Number.isFinite(cr) ? String(cr) : '0',
    },
    sharing: { linkSharingEnabled: false },
    _id: `rpgmonsters-recovered-${normalizeName(monster.name).replace(/[^a-z0-9]+/g, '-')}`,
    bestiaryId: 'runtime-recovered',
    __v: 0,
  };
}

function mergeByName(target, incoming, sourceLabel, existing) {
  if (!Array.isArray(incoming) || !incoming.length) return 0;
  let added = 0;
  for (const creature of incoming) {
    const key = normalizeName(creature && creature.name);
    if (!key || existing.has(key)) continue;
    existing.add(key);
    target.push(creature);
    added += 1;
  }
  return added;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function main() {
  const htmlText = fs.readFileSync(HTML_PATH, 'utf8');
  const embedded = evaluateObjectLiteral(extractBestiaryObjectLiteralFromHtml(htmlText));
  const mergedCreatures = [];
  const existing = new Set();

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
  const v4Path = firstExisting([
    'src/data/Diaper-School-Full-BestiaryV4.json',
    'Diaper-School-Full-BestiaryV4.json',
  ]);
  const rpgMonstersPath = firstExisting([
    'src/data/RPGmonsters.js',
  ]);

  const recoveredV4Creatures = readJsonCreatures(v4Path)
    .filter((creature) => V4_RECOVERY_NAMES.has(normalizeName(creature && creature.name)));
  const recoveredRpgCreatures = readRpgMonsters(rpgMonstersPath)
    .filter((monster) => RPGMONSTER_RECOVERY_NAMES.has(normalizeName(monster && monster.name)))
    .map(toBestiaryCreatureFromRpgMonster);

  const counts = {
    embedded: mergeByName(mergedCreatures, embedded.creatures, 'embedded', existing),
    additions: mergeByName(mergedCreatures, readJsonCreatures(additionsPath), 'additions', existing),
    critterdb: mergeByName(mergedCreatures, readJsonCreatures(critterDbPath), 'critterdb', existing),
    v3: mergeByName(mergedCreatures, readJsonCreatures(v3Path), 'v3', existing),
    v2: mergeByName(mergedCreatures, readJsonCreatures(v2Path), 'v2', existing),
    recoveredV4: mergeByName(mergedCreatures, recoveredV4Creatures, 'recoveredV4', existing),
    recoveredRpg: mergeByName(mergedCreatures, recoveredRpgCreatures, 'recoveredRpg', existing),
  };

  const bundle = {
    ...embedded,
    name: embedded && embedded.name ? embedded.name : 'Runtime Bestiary',
    description: embedded && typeof embedded.description === 'string'
      ? embedded.description
      : 'Unified non-V4 runtime bestiary bundle.',
    creatures: mergedCreatures,
    runtimeBundleMeta: {
      builtAt: new Date().toISOString(),
      totalCreatures: mergedCreatures.length,
      counts,
      sources: {
        additionsPath: additionsPath ? path.relative(ROOT, additionsPath).split(path.sep).join('/') : null,
        critterDbPath: critterDbPath ? path.relative(ROOT, critterDbPath).split(path.sep).join('/') : null,
        v3Path: v3Path ? path.relative(ROOT, v3Path).split(path.sep).join('/') : null,
        v2Path: v2Path ? path.relative(ROOT, v2Path).split(path.sep).join('/') : null,
        v4Path: v4Path ? path.relative(ROOT, v4Path).split(path.sep).join('/') : null,
        rpgMonstersPath: rpgMonstersPath ? path.relative(ROOT, rpgMonstersPath).split(path.sep).join('/') : null,
      },
    },
  };

  for (const outPath of OUTPUTS) {
    ensureDir(outPath);
    fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
  }

  console.log(JSON.stringify({
    outputs: OUTPUTS.map((outPath) => path.relative(ROOT, outPath).split(path.sep).join('/')),
    totalCreatures: mergedCreatures.length,
    counts,
  }, null, 2));
}

main();
