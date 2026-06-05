#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_MD = path.join(ROOT, 'referencedata', 'World of Scholia Diaspros', 'THE OBSIDIAN CODEX_ THE THIRTY-TWO SHADOWS OF THE SEAMS.md');
const ADDITIONS_JSON = path.join(ROOT, 'tools', '_tmp_bestiary_v3_additions.json');
const BESTIARY_HTML = path.join(ROOT, 'bestiary.html');
const BESTIARY_ID = '6870862c97a02efde25f91ce';

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function syncEmbeddedArray(merged) {
  const html = readText(BESTIARY_HTML);
  const startToken = 'const EMBEDDED_BESTIARY_V3_ADDITIONS = ';
  const endToken = '        // Current selected monster';
  const startIndex = html.indexOf(startToken);
  const endIndex = html.indexOf(endToken, startIndex);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Failed to locate EMBEDDED_BESTIARY_V3_ADDITIONS in bestiary.html');
  }
  const replacement = `${startToken}${JSON.stringify(merged)};\n\n${endToken}`;
  const updated = `${html.slice(0, startIndex)}${replacement}${html.slice(endIndex + endToken.length)}`;
  writeText(BESTIARY_HTML, updated);
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\\\./g, '.')
    .replace(/\\!/g, '!')
    .replace(/\\-/g, '-')
    .replace(/\\\+/g, '+')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/ +/g, ' ')
    .trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function slugify(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function abilityModifier(score) {
  return Math.floor((Number(score) - 10) / 2);
}

function modifierString(score) {
  const mod = abilityModifier(score);
  return `${score} (${mod >= 0 ? '+' : ''}${mod})`;
}

function proficiencyForCr(challengeRating) {
  const cr = Number(challengeRating);
  if (!Number.isFinite(cr) || cr <= 4) return 2;
  if (cr <= 8) return 3;
  if (cr <= 12) return 4;
  if (cr <= 16) return 5;
  if (cr <= 20) return 6;
  if (cr <= 24) return 7;
  if (cr <= 28) return 8;
  return 9;
}

function parseChallengeToken(token) {
  const raw = normalizeText(token);
  if (raw.includes('/')) {
    const [numerator, denominator] = raw.split('/').map(Number);
    return numerator / denominator;
  }
  return Number(raw);
}

function parseImageList(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^src\\assets\\images\\Monsters\\/i.test(line))
    .map((line) => line.replace(/\\/g, '/'));
}

function normalizeImageKey(value) {
  return normalizeText(value)
    .replace(/\([^)]*\)/g, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();
}

function buildImageLookup(imagePaths) {
  const lookup = new Map();
  for (const imagePath of imagePaths) {
    const baseName = path.basename(imagePath);
    lookup.set(normalizeImageKey(baseName), imagePath);
  }
  return lookup;
}

function resolveImagePath(monsterName, imageLookup) {
  const overrides = {
    'darklingdiapermimic': 'src/assets/images/Monsters/Darkling Diaper Mimick.webp',
  };

  const directKey = normalizeImageKey(monsterName);
  if (overrides[directKey]) return overrides[directKey];

  const imagePath = imageLookup.get(directKey);
  if (imagePath) return imagePath;

  throw new Error(`No image found for monster: ${monsterName}`);
}

function splitSections(markdown) {
  const regex = /^### \*\*(.+?)\*\*$/gm;
  const matches = [...markdown.matchAll(regex)];
  const sections = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : markdown.length;
    sections.push({
      heading: normalizeText(match[1]),
      body: markdown.slice(start, end).trim(),
    });
  }

  return sections;
}

function extractLine(body, label) {
  const regex = new RegExp(`^\\*\\*${label}\\*\\*\\s+(.+)$`, 'm');
  const match = body.match(regex);
  return match ? normalizeText(match[1]) : '';
}

function parseBulletSection(body, sectionLabel) {
  const header = `**${sectionLabel}:**`;
  const start = body.indexOf(header);
  if (start === -1) return [];

  const remaining = body.slice(start + header.length);
  const nextSectionMatch = remaining.match(/\n\*\*[A-Za-z][^\n]*:\*\*/);
  const block = nextSectionMatch ? remaining.slice(0, nextSectionMatch.index) : remaining;
  const lines = block.split('\n');
  const bullets = [];
  let current = '';

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r/g, '');
    if (/^##\s+/.test(line.trim())) break;
    if (/^\* /.test(line)) {
      if (current) bullets.push(current.trim());
      current = line.replace(/^\* /, '').trim();
      continue;
    }

    if (!current) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    current += ` ${trimmed}`;
  }

  if (current) bullets.push(current.trim());

  return bullets.map((entry) => {
    const cleaned = normalizeText(entry);
    const colonIndex = cleaned.indexOf(':');
    if (colonIndex !== -1) {
      return {
        name: normalizeText(cleaned.slice(0, colonIndex)),
        description: normalizeText(cleaned.slice(colonIndex + 1)),
        descriptionHtml: {},
      };
    }

    return {
      name: cleaned,
      description: '',
      descriptionHtml: {},
    };
  });
}

function parseSavingThrows(value) {
  if (!value || value === '—') return [];
  const abilityMap = {
    str: 'strength',
    dex: 'dexterity',
    con: 'constitution',
    int: 'intelligence',
    wis: 'wisdom',
    cha: 'charisma',
  };

  return value.split(',').map((part) => normalizeText(part)).filter(Boolean).map((entry) => {
    const match = entry.match(/^([A-Za-z]{3})\s*([+-]\d+)$/);
    if (!match) return null;
    const abbreviation = match[1].toLowerCase();
    const modifier = Number(match[2]);
    return {
      ability: abilityMap[abbreviation] || abbreviation,
      proficient: true,
      modifier,
      modifierStr: `${match[1]} ${modifier >= 0 ? '+' : ''}${modifier}`,
    };
  }).filter(Boolean);
}

function parseSkills(value) {
  if (!value || value === '—') return [];
  return value.split(',').map((part) => normalizeText(part)).filter(Boolean).map((entry) => {
    const match = entry.match(/^(.+?)\s*([+-]\d+)$/);
    if (!match) return null;
    const name = normalizeText(match[1]);
    const modifier = Number(match[2]);
    return {
      name,
      proficient: true,
      modifier,
      modifierStr: `${name} ${modifier >= 0 ? '+' : ''}${modifier}`,
    };
  }).filter(Boolean);
}

function splitProtectedList(value) {
  const text = normalizeText(value);
  if (!text || text === '—') return [];

  const protectedPhrasePattern = /Bludgeoning, Piercing, and Slashing(?: from [^;]+)?/gi;
  const protectedPhrases = [];
  const placeholderText = text.replace(protectedPhrasePattern, (match) => {
    const token = `__PROTECTED_${protectedPhrases.length}__`;
    protectedPhrases.push(match);
    return token;
  });

  return placeholderText
    .split(/[;,]/)
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .map((part) => part.replace(/__PROTECTED_(\d+)__/g, (_, index) => protectedPhrases[Number(index)]));
}

function parseLanguages(value) {
  const text = normalizeText(value);
  if (!text || text === '—') return [];
  return text.split(',').map((part) => normalizeText(part)).filter(Boolean);
}

function parseSenses(value) {
  const text = normalizeText(value);
  if (!text || text === '—') return [];
  return text.split(',').map((part) => normalizeText(part)).filter(Boolean);
}

function parseAbilityScores(body) {
  const lines = body.split('\n').map((line) => line.trim());
  const headerIndex = lines.findIndex((line) => line === '| STR | DEX | CON | INT | WIS | CHA |');
  if (headerIndex === -1 || !lines[headerIndex + 2]) {
    throw new Error('Failed to parse ability score table');
  }

  const values = lines[headerIndex + 2]
    .split('|')
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .map((entry) => Number((entry.match(/^(\d+)/) || [])[1]));

  return {
    strength: values[0],
    dexterity: values[1],
    constitution: values[2],
    intelligence: values[3],
    wisdom: values[4],
    charisma: values[5],
  };
}

function parseIdentity(rawIdentity) {
  const text = normalizeText(rawIdentity).replace(/^\*/, '').replace(/\*$/, '');
  const match = text.match(/^([A-Za-z]+)\s+(.+?),\s+(.+)$/);
  if (!match) {
    throw new Error(`Failed to parse identity line: ${rawIdentity}`);
  }

  return {
    size: normalizeText(match[1]),
    race: normalizeText(match[2]),
    alignment: normalizeText(match[3]),
    description: normalizeText(text),
  };
}

function parseHitPoints(value) {
  const match = value.match(/^(\d+)\s*\((\d+)d(\d+)\s*(?:\+\s*(\d+))?.*\)$/);
  if (!match) {
    throw new Error(`Failed to parse hit points: ${value}`);
  }

  return {
    hitPoints: Number(match[1]),
    numHitDie: Number(match[2]),
    hitDieSize: Number(match[3]),
    extraHealthFromConstitution: Number(match[4] || 0),
    hitPointsStr: normalizeText(value),
  };
}

function parseArmorClass(value) {
  const match = value.match(/^(\d+)(?:\s*\((.+)\))?$/);
  if (!match) {
    throw new Error(`Failed to parse armor class: ${value}`);
  }

  return {
    armorClass: Number(match[1]),
    armorType: normalizeText(match[2] || ''),
  };
}

function parseChallenge(value) {
  const match = value.match(/^([0-9/]+)\s*\(([\d,]+)XP\)$/i);
  if (!match) {
    throw new Error(`Failed to parse challenge line: ${value}`);
  }

  return {
    challengeRatingStr: normalizeText(match[1]),
    challengeRating: parseChallengeToken(match[1]),
    experiencePoints: Number(match[2].replace(/,/g, '')),
  };
}

function parsePassivePerception(senses) {
  const match = senses.find((entry) => /passive perception/i.test(entry || ''));
  if (!match) return 10;
  const value = match.match(/(\d+)/);
  return value ? Number(value[1]) : 10;
}

function parseMonster(section, imagePath, index) {
  const heading = normalizeText(section.heading).replace(/^\d+\.\s*/, '');
  const lines = section.body.split('\n').map((line) => line.trim()).filter(Boolean);
  const identityLine = lines.find((line) => /^\*.+\*$/.test(line));
  const identity = parseIdentity(identityLine);

  const region = extractLine(section.body, 'Region:');
  const armor = parseArmorClass(extractLine(section.body, 'Armor Class'));
  const hp = parseHitPoints(extractLine(section.body, 'Hit Points'));
  const challenge = parseChallenge(extractLine(section.body, 'Challenge'));
  const abilityScores = parseAbilityScores(section.body);
  const senses = parseSenses(extractLine(section.body, 'Senses'));

  const descriptionParagraphs = [];
  let startedAfterIdentity = false;
  for (const line of lines) {
    if (line === identityLine) {
      startedAfterIdentity = true;
      continue;
    }
    if (!startedAfterIdentity) continue;
    if (/^\*\*Region:\*\*/.test(line)) break;
    descriptionParagraphs.push(line);
  }

  const stats = {
    size: identity.size,
    race: identity.race,
    alignment: identity.alignment,
    armorType: armor.armorType,
    armorClass: armor.armorClass,
    numHitDie: hp.numHitDie,
    speed: extractLine(section.body, 'Speed'),
    abilityScores,
    proficiencyBonus: proficiencyForCr(challenge.challengeRating),
    damageVulnerabilities: splitProtectedList(extractLine(section.body, 'Damage Vulnerabilities')),
    damageResistances: splitProtectedList(extractLine(section.body, 'Damage Resistances')),
    damageImmunities: splitProtectedList(extractLine(section.body, 'Damage Immunities')),
    conditionImmunities: splitProtectedList(extractLine(section.body, 'Condition Immunities')),
    senses,
    languages: parseLanguages(extractLine(section.body, 'Languages')),
    challengeRating: challenge.challengeRating,
    experiencePoints: challenge.experiencePoints,
    legendaryActionsPerRound: 0,
    legendaryActionsDescription: '',
    savingThrows: parseSavingThrows(extractLine(section.body, 'Saving Throws')),
    skills: parseSkills(extractLine(section.body, 'Skills')),
    additionalAbilities: parseBulletSection(section.body, 'Traits'),
    actions: parseBulletSection(section.body, 'Actions'),
    reactions: parseBulletSection(section.body, 'Reactions'),
    legendaryActions: parseBulletSection(section.body, 'Legendary Actions'),
    hitDieSize: hp.hitDieSize,
    armorTypeStr: armor.armorType ? `(${armor.armorType})` : '',
    abilityScoreModifiers: {
      strength: abilityModifier(abilityScores.strength),
      dexterity: abilityModifier(abilityScores.dexterity),
      constitution: abilityModifier(abilityScores.constitution),
      intelligence: abilityModifier(abilityScores.intelligence),
      wisdom: abilityModifier(abilityScores.wisdom),
      charisma: abilityModifier(abilityScores.charisma),
    },
    abilityScoreStrs: {
      strength: modifierString(abilityScores.strength),
      dexterity: modifierString(abilityScores.dexterity),
      constitution: modifierString(abilityScores.constitution),
      intelligence: modifierString(abilityScores.intelligence),
      wisdom: modifierString(abilityScores.wisdom),
      charisma: modifierString(abilityScores.charisma),
    },
    extraHealthFromConstitution: hp.extraHealthFromConstitution,
    hitPoints: hp.hitPoints,
    hitPointsStr: hp.hitPointsStr,
    legendaryActionsDescriptionHtml: {},
    passivePerception: parsePassivePerception(senses),
    challengeRatingStr: challenge.challengeRatingStr,
  };

  return {
    flavor: {
      faction: '',
      environment: region,
      description: identity.description,
      nameIsProper: false,
      imageUrl: imagePath,
      descriptionHtml: {},
    },
    stats,
    sharing: { linkSharingEnabled: false },
    _id: `local-obsidian-codex-${String(index + 1).padStart(2, '0')}`,
    name: heading,
    bestiaryId: BESTIARY_ID,
    __v: 0,
    sourceNote: descriptionParagraphs.join(' '),
    _sourceDocSlug: slugify(heading),
  };
}

function stripHelperFields(creature) {
  const clone = JSON.parse(JSON.stringify(creature));
  delete clone.sourceNote;
  delete clone._sourceDocSlug;
  return clone;
}

function main() {
  const markdown = readText(SOURCE_MD);
  const imagePaths = parseImageList(markdown);
  const sections = splitSections(markdown).filter((section) => /^\d+\./.test(section.heading));
  const imageLookup = buildImageLookup(imagePaths);

  if (imagePaths.length !== 32) {
    throw new Error(`Expected 32 image paths but found ${imagePaths.length}`);
  }
  if (sections.length !== 32) {
    throw new Error(`Expected 32 monster sections but found ${sections.length}`);
  }

  const parsedCreatures = sections
    .map((section, index) => parseMonster(section, resolveImagePath(section.heading.replace(/^\d+\.\s*/, ''), imageLookup), index))
    .map(stripHelperFields);
  const existing = JSON.parse(readText(ADDITIONS_JSON));
  const parsedByName = new Map(parsedCreatures.map((creature) => [normalizeKey(creature.name), creature]));
  const existingSourceNames = new Set(existing.map((entry) => normalizeKey(entry && entry.name)).filter((key) => parsedByName.has(key)));

  const merged = existing.map((entry) => {
    const key = normalizeKey(entry && entry.name);
    return parsedByName.get(key) || entry;
  });

  let added = 0;
  for (const creature of parsedCreatures) {
    const key = normalizeKey(creature.name);
    if (!key || existingSourceNames.has(key)) continue;
    merged.push(creature);
    added += 1;
  }

  writeText(ADDITIONS_JSON, `${JSON.stringify(merged, null, 2)}\n`);
  syncEmbeddedArray(merged);

  console.log(JSON.stringify({ parsed: parsedCreatures.length, added, merged: merged.length }, null, 2));
}

main();