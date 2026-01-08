(function(){
  const DEFAULT_URL = '/src/data/Diaper-School-Full-Bestiary.json';
  const cache = { loaded:false, byKey:null, list:[], nameToKey:null };

  const sizeToTiles = (size) => {
    if(!size) return 1;
    const s = String(size).toLowerCase();
    if (s.includes('gargantuan')) return 4;
    if (s.includes('huge')) return 3;
    if (s.includes('large')) return 2;
    return 1; // small/medium/tiny -> 1 tile
  };

  const slug = (name) => String(name||'').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

  const parseCR = (stats) => {
    if (!stats) return 0.5;
    if (typeof stats.challengeRating === 'number') return stats.challengeRating;
    const s = stats.challengeRatingStr || '';
    if (!s) return 0.5;
    const map = { '1/8': 0.125, '1/4': 0.25, '1/2': 0.5 };
    if (map[s]) return map[s];
    const n = parseFloat(s);
    return isNaN(n) ? 0.5 : n;
  };

  const crTier = (cr) => {
    if (cr < 1) return 't0';
    if (cr < 2) return 't1';
    if (cr < 5) return 't2';
    if (cr < 9) return 't3';
    return 't4';
  };

  const pickEmoji = (name, race) => {
    const n = (name||'').toLowerCase();
    const r = (race||'').toLowerCase();
    if (n.includes('ghost') || n.includes('wraith')) return '👻';
    if (n.includes('leviathan') || n.includes('opus') || r.includes('aquatic')) return '🐙';
    if (n.includes('golem') || r.includes('construct')) return '🤖';
    if (n.includes('ooze') || r.includes('ooze')) return '🫧';
    if (n.includes('elemental') || r.includes('elemental')) return '🌊';
    if (n.includes('serpent') || n.includes('aconda') || n.includes('snake')) return '🐍';
    if (n.includes('darkling') || n.includes('darkforme')) return '😈';
    return '👾';
  };

  const parseSpeed = (speedStr) => {
    const rawInput = String(speedStr || '').trim();
    if (!rawInput) return { raw: '', modes: {}, notes: {} };

    // Normalize common formatting issues: missing spaces (fly30ft), missing spaces after commas, etc.
    const normalized = rawInput
      .replace(/\u00a0/g, ' ')
      .replace(/([a-zA-Z])(?=\d)/g, '$1 ')
      .replace(/(\d+)\s*ft\.?\b/gi, '$1 ft.')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    const modes = {};
    const notes = {};
    const parts = normalized.split(',').map(p => p.trim()).filter(Boolean);

    const setMode = (mode, feet, note) => {
      if (!mode) return;
      if (typeof feet === 'number' && !isNaN(feet)) modes[mode] = feet;
      if (note) notes[mode] = note;
    };

    for (const part of parts) {
      // Extract any parenthetical note, e.g. "fly 15 ft. (clumsy)"
      const noteMatch = part.match(/\(([^)]+)\)\s*$/);
      const note = noteMatch ? `(${noteMatch[1]})` : '';
      const partNoNote = part.replace(/\s*\([^)]*\)\s*$/g, '').trim();

      // Attempt to parse movement mode + feet
      const feetMatch = partNoNote.match(/(\d+)\s*(?:ft\.?|feet)\b/i);
      const feet = feetMatch ? parseInt(feetMatch[1], 10) : null;

      let mode = null;
      const lower = partNoNote.toLowerCase();

      // Examples:
      // - "35 ft." => walk
      // - "climb 20 ft." => climb
      // - "fly 15 ft." => fly
      // - "teleport 20 ft." => teleport
      if (/^(climb|climbing)\b/.test(lower)) mode = 'climb';
      else if (/^(fly|flying)\b/.test(lower)) mode = 'fly';
      else if (/^(swim|swimming)\b/.test(lower)) mode = 'swim';
      else if (/^(burrow|burrowing|dig)\b/.test(lower)) mode = 'burrow';
      else if (/^(glide|gliding)\b/.test(lower)) mode = 'glide';
      else if (/^(teleport|teleportation)\b/.test(lower)) mode = 'teleport';
      else if (/^(walk|walking)\b/.test(lower)) mode = 'walk';
      else if (/^\d+\s*(?:ft\.?|feet)\b/i.test(lower)) mode = 'walk';

      if (mode) {
        setMode(mode, feet, note);
      }
    }

    return { raw: normalized, modes, notes };
  };

  const buildAliasMap = (byKey) => {
    // Map legacy keys used in VR/Editor to bestiary slugs
    const nameToKey = {};
    Object.values(byKey).forEach(m => { nameToKey[slug(m.name)] = m.key; });
    const nameKey = (n) => nameToKey[slug(n)] || null;
    const alias = {
      dark_dimension_auditarch: nameKey('Dark Dimension Auditarch'),
      night_mare_shadowstorm: nameKey('Night-Mare Shadowstorm'),
      pacifier_golem: nameKey('Pacifier Golem'),
      lakeopus_rex: nameKey('Lakeopus Rex'),
      darkling_hooter: nameKey('Darkling-Hooter'),
      bottle_elemental: nameKey('Bottle Elemental'),
      primordial_bottle_beast: nameKey('Primordial Bottle Beast'),
      darkaconda: nameKey('Darkaconda'),
      darkforme_abyssal_leviathan: nameKey('Darkforme Abyssal Leviathan'),
      dark_dimension_changebot: nameKey('Dark Dimension Changebot'),
      darkling_ghostiby: nameKey('Darkling-Ghostiby'),
      darkling_liquid_legion: nameKey('Darkling Liquid Legion'),
      darkforme_nightpinyon: nameKey('Darkforme-Nightpinyon'),
      darkling_slitherscale: nameKey('Darkling-Slitherscale')
      // Additional aliases can be added as needed
    };
    return alias;
  };

  async function loadMonsters(url = DEFAULT_URL) {
    if (cache.loaded && cache.byKey) return cache.byKey;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load bestiary JSON: '+res.status);
    const json = await res.json();
    const creatures = Array.isArray(json.creatures) ? json.creatures : [];

    const byKey = {};
    const list = [];

    for (const c of creatures) {
      const name = (c && c.name) || null;
      if (!name) continue;
      const stats = c.stats || {};
      const k = slug(name);
      const cr = parseCR(stats);
      const tiles = sizeToTiles(stats.size);
      const race = stats.race || '';
      const desc = (c.flavor && c.flavor.description) || '';
      const imageUrl = c.flavor && c.flavor.imageUrl || '';
      const abilities = Array.isArray(stats.additionalAbilities) ? stats.additionalAbilities.map(a => a.name).filter(Boolean) : [];
      const actions = Array.isArray(stats.actions) ? stats.actions.map(a => ({ name: a.name, description: a.description })) : [];
      const ac = (typeof stats.armorClass === 'number' || typeof stats.armorClass === 'string') ? stats.armorClass : null;
      const armorType = stats.armorType || stats.armorTypeStr || '';
      const hpStr = stats.hitPointsStr || '';
      const speedParsed = parseSpeed(stats.speed);
      const abilityScores = {
        str: stats.strength ?? stats.STR ?? null,
        dex: stats.dexterity ?? stats.DEX ?? null,
        con: stats.constitution ?? stats.CON ?? null,
        int: stats.intelligence ?? stats.INT ?? null,
        wis: stats.wisdom ?? stats.WIS ?? null,
        cha: stats.charisma ?? stats.CHA ?? null,
      };
      const m = {
        key: k,
        name,
        cr,
        crStr: stats.challengeRatingStr || String(cr),
        size: stats.size || 'Medium',
        tiles,
        race,
        description: desc,
        imageUrl,
        abilities,
        actions,
        ac,
        armorType,
        hpStr,
        // Raw speed string as written in the bestiary (normalized for minor formatting issues)
        speed: speedParsed.raw,
        // Structured movement modes (feet). Example: { walk: 35, climb: 20, glide: 10 }
        speedModes: speedParsed.modes,
        // Notes per mode, if any. Example: { fly: "(clumsy)" }
        speedNotes: speedParsed.notes,
        abilityScores,
        emoji: pickEmoji(name, race),
        tier: crTier(cr)
      };
      byKey[k] = m;
      list.push(m);
    }

    cache.byKey = byKey;
    cache.list = list;
    cache.nameToKey = Object.fromEntries(list.map(m => [slug(m.name), m.key]));
    cache.alias = buildAliasMap(byKey);
    cache.loaded = true;
    return byKey;
  }

  function resolveKey(key) {
    if (!cache.loaded) return null;
    if (cache.byKey[key]) return key;
    const a = cache.alias && cache.alias[key];
    if (a && cache.byKey[a]) return a;
    return null;
  }

  function get(key) {
    const rk = resolveKey(key);
    return rk ? cache.byKey[rk] : null;
  }

  function all() { return cache.list || []; }

  window.MonstersRuntime = {
    loadMonsters,
    get,
    all,
    cache,
  };
})();
