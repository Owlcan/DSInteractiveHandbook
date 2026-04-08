#!/usr/bin/env node
/*
Build a single-file stopgap version of bestiary.html by:
- Inlining selected JSON payloads so bestiary.html can load them without external files.
- Inlining selected monster images as data: URIs so you can ship ONE HTML file.

Defaults are tuned for "small stopgap" updates:
- Bake V3 + additions JSON into the HTML
- Bake images for creatures in the additions bundle

Usage examples:
  node tools/build_bestiary_stopgap_singlefile.js
  node tools/build_bestiary_stopgap_singlefile.js --out dist/bestiary-stopgap.html
  node tools/build_bestiary_stopgap_singlefile.js --bakeImages allV3
  node tools/build_bestiary_stopgap_singlefile.js --overrides tools/bestiary_bake_overrides.json

Overrides JSON format (optional):
  {
    "Monster Name": "src/assets/images/Monsters/somefile.webp",
    "Other Monster": ["src/assets/images/Monsters/a.webp", "src/assets/images/Monsters/b.webp"]
  }
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {
    template: 'bestiary.html',
    out: 'dist/bestiary-stopgap.html',
    bakeV3: true,
    bakeV2: false,
    bakeAdditions: true,
    bakeImages: 'additions', // additions | allV3 | allFiles
    imagesDirs: [
      // Default to the main tokens folder only.
      // (You can add additional folders via --imagesDir if needed.)
      'src/assets/images/Monsters',
    ],
    allFilesWebpOnly: true,
    overridesPath: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--template') args.template = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--bakeV3') args.bakeV3 = true;
    else if (a === '--no-bakeV3') args.bakeV3 = false;
    else if (a === '--bakeV2') args.bakeV2 = true;
    else if (a === '--no-bakeV2') args.bakeV2 = false;
    else if (a === '--bakeAdditions') args.bakeAdditions = true;
    else if (a === '--no-bakeAdditions') args.bakeAdditions = false;
    else if (a === '--bakeImages') args.bakeImages = String(argv[++i] || '').trim();
    else if (a === '--imagesDir') args.imagesDirs.push(argv[++i]);
    else if (a === '--allFilesWebpOnly') args.allFilesWebpOnly = true;
    else if (a === '--allFilesAllExts') args.allFilesWebpOnly = false;
    else if (a === '--overrides') args.overridesPath = argv[++i];
    else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    } else {
      console.warn('[stopgap] Unknown arg:', a);
    }
  }

  if (!args.bakeImages) args.bakeImages = 'additions';
  if (!['additions', 'allV3', 'allFiles'].includes(args.bakeImages)) {
    console.warn('[stopgap] Unsupported --bakeImages value:', args.bakeImages);
    console.warn('[stopgap] Falling back to additions');
    args.bakeImages = 'additions';
  }

  return args;
}

function printHelp() {
  console.log(`\nBuild a single-file bestiary stopgap HTML\n\n` +
`Options:\n` +
`  --template <path>          Input HTML template (default: bestiary.html)\n` +
`  --out <path>               Output HTML path (default: dist/bestiary-stopgap.html)\n` +
`  --bakeV3 / --no-bakeV3     Inline Diaper-School-Full-BestiaryV3.json (default: on)\n` +
`  --bakeV2 / --no-bakeV2     Inline Diaper-School-Full-BestiaryV2.json (default: off)\n` +
`  --bakeAdditions / --no-bakeAdditions Inline tools/_tmp_bestiary_v3_additions.json (default: on)\n` +
`  --bakeImages <additions|allV3|allFiles> Which images to inline (default: additions)\n` +
`  --allFilesWebpOnly         When --bakeImages allFiles, only bake .webp (default: on)\n` +
`  --allFilesAllExts          When --bakeImages allFiles, bake webp/png/jpg/gif (bigger)\n` +
`  --imagesDir <dir>          Add an image directory (repeatable)\n` +
`  --overrides <json>          Optional name->image path(s) mapping JSON\n`);
}

function readJsonMaybe(fileRel) {
  const abs = path.join(ROOT, fileRel);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed parsing JSON ${fileRel}: ${e.message}`);
  }
}

function creaturesFromJsonPayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.creatures)) return payload.creatures;
  return [];
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeKey(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function contentTypeForExt(extLower) {
  if (extLower === '.webp') return 'image/webp';
  if (extLower === '.png') return 'image/png';
  if (extLower === '.jpg' || extLower === '.jpeg') return 'image/jpeg';
  if (extLower === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

function buildImageFileIndex(imagesDirsRel) {
  const exts = new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif']);
  const byBaseKey = new Map(); // normalized base -> rel path

  for (const dirRel of imagesDirsRel) {
    const dirAbs = path.join(ROOT, dirRel);
    if (!fs.existsSync(dirAbs)) continue;

    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name).toLowerCase();
      if (!exts.has(ext)) continue;
      const base = path.basename(ent.name, ext);
      const key = normalizeKey(base);
      const rel = path.posix.join(dirRel.replace(/\\/g, '/'), ent.name);
      if (!byBaseKey.has(key)) byBaseKey.set(key, rel);
    }
  }

  return byBaseKey;
}

function walkImageFiles(dirAbs, exts) {
  const out = [];
  if (!fs.existsSync(dirAbs)) return out;
  const stack = [dirAbs];
  const extSet = exts instanceof Set
    ? exts
    : new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif']);

  while (stack.length) {
    const cur = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch (_) {
      continue;
    }
    for (const ent of entries) {
      const abs = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        stack.push(abs);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name).toLowerCase();
        if (!extSet.has(ext)) continue;
        out.push(abs);
      }
    }
  }
  return out;
}

function posixRelFromAbs(absPath) {
  const rel = path.relative(ROOT, absPath);
  return rel.split(path.sep).join('/');
}

function buildBakedImagesByPath(imagesDirsRel, { webpOnly = true } = {}) {
  const baked = {};
  let count = 0;
  let bytesRaw = 0;

  const extSet = webpOnly
    ? new Set(['.webp'])
    : new Set(['.webp', '.png', '.jpg', '.jpeg', '.gif']);

  for (const dirRel of imagesDirsRel) {
    const dirAbs = path.join(ROOT, dirRel);
    const filesAbs = walkImageFiles(dirAbs, extSet);
    for (const abs of filesAbs) {
      const rel = posixRelFromAbs(abs);
      let stat;
      try {
        stat = fs.statSync(abs);
      } catch (_) {
        stat = null;
      }
      if (stat && typeof stat.size === 'number') bytesRaw += stat.size;

      // bestiary.html uses encodeURI on candidate paths, so store encoded keys.
      const k1 = encodeURI(rel);
      const k2 = encodeURI('/' + rel);
      const data = toDataUriFromRelPath(rel);
      baked[k1] = data;
      baked[k2] = data;
      count++;
    }
  }

  return { baked, count, bytesRaw };
}

function toDataUriFromRelPath(relPath) {
  const abs = path.join(ROOT, relPath);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(relPath).toLowerCase();
  const mime = contentTypeForExt(ext);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function loadOverrides(overridesPathRel) {
  if (!overridesPathRel) return {};
  const abs = path.join(ROOT, overridesPathRel);
  if (!fs.existsSync(abs)) throw new Error(`Overrides file not found: ${overridesPathRel}`);
  const raw = fs.readFileSync(abs, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Overrides JSON must be an object mapping names -> path(s)');
  }
  return parsed;
}

function computeBakedImagesByName({ creatures, imageIndex, overrides }) {
  const baked = {};
  const missing = [];

  for (const creature of creatures) {
    const name = String(creature?.name || '').trim();
    if (!name) continue;

    const overrideEntry = overrides[name];
    if (overrideEntry) {
      const list = Array.isArray(overrideEntry) ? overrideEntry : [overrideEntry];
      const cleaned = list.map(s => String(s || '').trim()).filter(Boolean);
      if (cleaned.length) {
        try {
          const bakedList = cleaned.map((rel) => toDataUriFromRelPath(rel));
          baked[name] = bakedList.length === 1 ? bakedList[0] : bakedList;
          continue;
        } catch (e) {
          // fall through to auto
        }
      }
    }

    // Try explicit local imageUrl if present.
    const explicit = String(creature?.imageUrl || creature?.imgUrl || creature?.flavor?.imageUrl || '').trim();
    if (explicit && !/^https?:/i.test(explicit)) {
      // Make a best-effort attempt to resolve as a workspace-relative path.
      const rel = explicit.replace(/^\//, '');
      const abs = path.join(ROOT, rel);
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        try {
          baked[name] = toDataUriFromRelPath(rel);
          continue;
        } catch (e) {
          // fall through
        }
      }
    }

    // Auto-match by normalized base name.
    const key = normalizeKey(name);
    const hitRel = imageIndex.get(key) || '';
    if (hitRel) {
      baked[name] = toDataUriFromRelPath(hitRel);
    } else {
      missing.push(name);
    }
  }

  return { baked, missing };
}

function buildBakedJsonByPath({ v3, v2, additions }) {
  const map = {};

  if (additions) {
    const payload = additions;
    for (const p of [
      'tools/_tmp_bestiary_v3_additions.json',
      '/tools/_tmp_bestiary_v3_additions.json',
      './tools/_tmp_bestiary_v3_additions.json',
    ]) {
      map[p] = payload;
    }
  }

  if (v3) {
    const payload = v3;
    for (const p of [
      'Diaper-School-Full-BestiaryV3.json',
      '/Diaper-School-Full-BestiaryV3.json',
      'src/data/Diaper-School-Full-BestiaryV3.json',
      './src/data/Diaper-School-Full-BestiaryV3.json',
      '/src/data/Diaper-School-Full-BestiaryV3.json',
    ]) {
      map[p] = payload;
    }
  }

  if (v2) {
    const payload = v2;
    for (const p of [
      'Diaper-School-Full-BestiaryV2.json',
      '/Diaper-School-Full-BestiaryV2.json',
      'src/data/Diaper-School-Full-BestiaryV2.json',
      './src/data/Diaper-School-Full-BestiaryV2.json',
      '/src/data/Diaper-School-Full-BestiaryV2.json',
    ]) {
      map[p] = payload;
    }
  }

  return map;
}

function injectGlobals(html, bakedJsonByPath, bakedImagesByName, bakedImagesByPath) {
  const marker = '// Initialize when the page loads';
  const idx = html.indexOf(marker);
  if (idx < 0) throw new Error('Template marker not found for injection');

  const injected = `\n        // --- Stopgap single-file bake (auto-generated) ---\n` +
    `        window.__BAKED_JSON_BY_PATH__ = ${JSON.stringify(bakedJsonByPath)};\n` +
    `        window.__BAKED_IMAGE_BY_NAME__ = ${JSON.stringify(bakedImagesByName)};\n` +
    `        window.__BAKED_IMAGE_BY_PATH__ = ${JSON.stringify(bakedImagesByPath || {})};\n` +
    `        // --- End stopgap bake ---\n\n`;

  return html.slice(0, idx) + injected + html.slice(idx);
}

function patchFetchJsonFirstOk(html) {
  const needle = 'for (const p of paths) {';
  const insert = `for (const p of paths) {\n                try {\n                    const baked = window.__BAKED_JSON_BY_PATH__ || null;\n                    if (baked && Object.prototype.hasOwnProperty.call(baked, p)) return baked[p];\n                    // If opened as file://, browsers block fetch(file://...) due to CORS.
                    // For single-file stopgaps we prefer baked JSON, so skip fetch entirely.
                    if (baked && location && location.protocol === 'file:') continue;\n                } catch (_) { /* ignore baked lookup errors */ }`;

  if (!html.includes(needle)) throw new Error('Could not find fetchJsonFirstOk loop to patch');
  return html.replace(needle, insert);
}

function patchResolveLocalImageByName(html) {
  const needle = 'async function resolveLocalImageByName(name) {';
  if (!html.includes(needle)) throw new Error('Could not find resolveLocalImageByName to patch');

  const insert = `${needle}\n            // Stopgap bake: inline images by creature name\n            try {\n                const baked = window.__BAKED_IMAGE_BY_NAME__ || null;\n                const v = baked ? baked[name] : null;\n                if (v) {\n                    const pick = Array.isArray(v) ? (v.find(Boolean) || null) : v;\n                    if (pick) {\n                        imageCache.set(name, pick);\n                        return pick;\n                    }\n                }\n            } catch (_) { /* ignore baked lookup errors */ }\n`;

  return html.replace(needle, insert);
}

function patchPreload(html) {
  const needle = 'function preload(src) {';
  if (!html.includes(needle)) throw new Error('Could not find preload() helper to patch');

  const insert = `${needle}\n            // Stopgap bake: resolve local file-path src to baked data URIs\n            try {\n                const baked = window.__BAKED_IMAGE_BY_PATH__ || null;\n                if (baked && src) {\n                    const s = String(src);\n                    const hit = baked[s] || baked[s.replace(/^\\/+/, '')] || null;\n                    if (hit) src = hit;\n                }\n            } catch (_) { /* ignore baked lookup errors */ }\n`;
  return html.replace(needle, insert);
}

function patchSetMonsterImage(html) {
  const needle = 'async function setMonsterImage(imgEl, monster) {';
  if (!html.includes(needle)) throw new Error('Could not find setMonsterImage() helper to patch');

  const insert = `${needle}
            const resolveBakedImageSrc = (src) => {
                try {
                    const baked = window.__BAKED_IMAGE_BY_PATH__ || null;
                    if (!baked || !src) return src;
                    const s0 = String(src);
                    if (/^data:/i.test(s0)) return s0;
                    // Don't rewrite http(s) URLs.
                    if (/^https?:/i.test(s0)) return s0;

                    // If a browser expanded a relative src to file://..., try to recover the repo-relative path.
                    let s = s0;
                    if (/^file:/i.test(s)) {
                        const mark1 = '/src/assets/images/';
                        const mark2 = '/Cellardungeon%20Miniapp/Monsters/';
                        const i1 = s.indexOf(mark1);
                        const i2 = s.indexOf(mark2);
                        if (i1 >= 0) s = s.slice(i1 + 1);
                        else if (i2 >= 0) s = decodeURI(s.slice(i2 + 1));
                    }

                    return baked[s] || baked[encodeURI(s)] || baked[s.replace(/^\\/+/, '')] || baked[encodeURI(s.replace(/^\\/+/, ''))] || s0;
                } catch (_) {
                    return src;
                }
            };
`;

  let out = html.replace(needle, insert);
  // Ensure final assignments prefer baked data URIs.
  out = out.replace('imgEl.src = localSrc;', 'imgEl.src = resolveBakedImageSrc(localSrc);');
  out = out.replace('imgEl.src = ok;', 'imgEl.src = resolveBakedImageSrc(ok);');
  return out;
}

function main() {
  const args = parseArgs(process.argv);

  const templateAbs = path.join(ROOT, args.template);
  if (!fs.existsSync(templateAbs)) {
    console.error('[stopgap] Template not found:', args.template);
    process.exit(1);
  }

  const v3 = args.bakeV3 ? readJsonMaybe('Diaper-School-Full-BestiaryV3.json') : null;
  const v2 = args.bakeV2 ? readJsonMaybe('Diaper-School-Full-BestiaryV2.json') : null;
  const additions = args.bakeAdditions ? readJsonMaybe('tools/_tmp_bestiary_v3_additions.json') : null;

  const creaturesAdditions = creaturesFromJsonPayload(additions);
  const creaturesV3 = creaturesFromJsonPayload(v3);

  const bakeCreatures = (args.bakeImages === 'allV3') ? creaturesV3 : creaturesAdditions;

  const overrides = loadOverrides(args.overridesPath);
  const imageIndex = buildImageFileIndex(args.imagesDirs);
  const { baked: bakedImagesByName, missing } = (args.bakeImages === 'allFiles')
    ? { baked: {}, missing: [] }
    : computeBakedImagesByName({
        creatures: bakeCreatures,
        imageIndex,
        overrides,
      });

  const bakedImagesByPathInfo = (args.bakeImages === 'allFiles')
    ? buildBakedImagesByPath(args.imagesDirs, { webpOnly: !!args.allFilesWebpOnly })
    : { baked: {}, count: 0, bytesRaw: 0 };

  const bakedJsonByPath = buildBakedJsonByPath({ v3, v2, additions });

  let html = fs.readFileSync(templateAbs, 'utf8');
  html = patchFetchJsonFirstOk(html);
  html = patchPreload(html);
  html = patchResolveLocalImageByName(html);
  html = patchSetMonsterImage(html);
  html = injectGlobals(html, bakedJsonByPath, bakedImagesByName, bakedImagesByPathInfo.baked);

  const outAbs = path.join(ROOT, args.out);
  ensureDirForFile(outAbs);
  fs.writeFileSync(outAbs, html, 'utf8');

  const bakedCount = Object.keys(bakedImagesByName).length;
  console.log(`[stopgap] Wrote ${args.out}`);
  console.log(`[stopgap] Baked JSON: v3=${!!v3} v2=${!!v2} additions=${!!additions}`);
  if (args.bakeImages === 'allFiles') {
    console.log(`[stopgap] Baked image files (by path): ${bakedImagesByPathInfo.count}`);
    console.log(`[stopgap] Total raw image bytes: ${bakedImagesByPathInfo.bytesRaw}`);
  } else {
    console.log(`[stopgap] Baked images: ${bakedCount}/${bakeCreatures.length}`);
  }
  if (missing.length) {
    console.warn(`[stopgap] Missing images for ${missing.length} creature(s):`);
    console.warn(missing.slice(0, 50).join('\n'));
    if (missing.length > 50) console.warn(`...and ${missing.length - 50} more`);
    console.warn('[stopgap] Tip: add an overrides JSON via --overrides to map name -> image path.');
  }
}

main();
