/*
Builds a single JSON resource containing Backgrounds and Origin Feats.

Inputs:
- backgrounds.html (backgroundsData array)
- originfeats.html (feat-card blocks)

Output:
- src/backgrounds_originfeats_index.json

Usage:
  node tools/build_backgrounds_originfeats_index.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readText(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function writeText(relPath, content) {
  fs.writeFileSync(path.join(ROOT, relPath), content, 'utf8');
}

function stripTags(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?em>/gi, '')
    .replace(/<\/?strong>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[\t\f\v\r ]+/g, ' ')
    .trim();
}

function slugify(text) {
  const s = String(text || '')
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'item';
}

function extractBackgroundsFromBackgroundsHtml(html) {
  const out = [];

  // Matches entries like:
  // {
  //   type: "background",
  //   name: "Budding Caregiver",
  //   id: "budding-caregiver",
  //   contentHTML: ` ... `
  // },
  const re = /\{\s*type\s*:\s*"background"\s*,\s*name\s*:\s*"([^"]+)"\s*,\s*id\s*:\s*"([^"]+)"\s*,\s*contentHTML\s*:\s*`([\s\S]*?)`\s*\}\s*,?/g;

  let m;
  while ((m = re.exec(html)) !== null) {
    const name = m[1].trim();
    const id = m[2].trim();
    const contentHTML = m[3];

    const imgMatch = contentHTML.match(/<img\s+[^>]*src\s*=\s*"([^"]+)"/i);
    const image = imgMatch ? imgMatch[1].trim() : '';

    const descMatch = contentHTML.match(/<h2>[^<]+<\/h2>\s*<p>([\s\S]*?)<\/p>/i);
    const description = descMatch ? stripTags(descMatch[1]) : '';

    function extractLi(label) {
      const r = new RegExp(`<li>\\s*<strong>\\s*${label}\\s*:<\\/strong>\\s*([\\s\\S]*?)<\\/li>`, 'i');
      const mm = contentHTML.match(r);
      return mm ? stripTags(mm[1]) : '';
    }

    const asi = extractLi('Ability Score Increases');
    const skills = extractLi('Skill Proficiencies');
    const tools = extractLi('Tool Proficiency');
    const languages = extractLi('Languages');
    const originFeat = extractLi('Origin Feat');
    const spellsFeatures = extractLi('Spells & Features');

    out.push({
      id,
      name,
      url: `backgrounds.html?id=${encodeURIComponent(id)}`,
      image,
      description,
      traits: {
        asi,
        skills,
        tools,
        languages,
        originFeat,
        spellsFeatures,
      },
    });
  }

  return out;
}

function extractDivBlocksWithClass(html, className) {
  const blocks = [];
  const needle = '<div';
  let i = 0;

  while (i < html.length) {
    const start = html.indexOf(needle, i);
    if (start === -1) break;

    const tagEnd = html.indexOf('>', start);
    if (tagEnd === -1) break;

    const openTag = html.slice(start, tagEnd + 1);
    const classMatch = openTag.match(/class\s*=\s*"([^"]+)"/i);
    const hasClass = classMatch && classMatch[1].split(/\s+/).includes(className);

    if (!hasClass) {
      i = tagEnd + 1;
      continue;
    }

    // Walk forward matching <div ...> and </div>
    let depth = 0;
    let j = start;
    while (j < html.length) {
      const nextOpen = html.indexOf('<div', j);
      const nextClose = html.indexOf('</div', j);
      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        const openEnd = html.indexOf('>', nextOpen);
        if (openEnd === -1) break;
        depth++;
        j = openEnd + 1;
        continue;
      }

      // Close
      const closeEnd = html.indexOf('>', nextClose);
      if (closeEnd === -1) break;
      depth--;
      j = closeEnd + 1;

      if (depth <= 0) {
        const block = html.slice(start, j);
        blocks.push(block);
        i = j;
        break;
      }
    }

    if (j >= html.length) break;
  }

  return blocks;
}

function extractOriginFeatsFromOriginFeatsHtml(html) {
  const blocks = extractDivBlocksWithClass(html, 'feat-card');

  const byId = new Map();
  const order = [];

  for (const block of blocks) {
    const nameMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    const name = nameMatch ? stripTags(nameMatch[1]) : '';
    if (!name) continue;

    const id = `feat-${slugify(name)}`;

    const descMatch = block.match(/<p\s+class\s*=\s*"mb-4"[^>]*>([\s\S]*?)<\/p>/i);
    const description = descMatch ? stripTags(descMatch[1]) : '';

    const img1Match = block.match(/data-img1\s*=\s*"([^"]+)"/i);
    const img2Match = block.match(/data-img2\s*=\s*"([^"]+)"/i);
    const srcMatch = block.match(/<img\s+[^>]*src\s*=\s*"([^"]+)"/i);
    const image1 = (img1Match ? img1Match[1] : (srcMatch ? srcMatch[1] : '')).trim();
    const image2 = (img2Match ? img2Match[1] : '').trim();

    const liMatches = [...block.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map(x => stripTags(x[1]));
    const bullets = liMatches.filter(Boolean);

    const asiText = bullets.find(b => /^Increase\s+your\s+/i.test(b)) || '';

    const candidate = {
      id,
      name,
      url: `originfeats.html?q=${encodeURIComponent(name)}`,
      image1,
      image2,
      description,
      bullets,
      asiText,
    };

    if (!byId.has(id)) {
      byId.set(id, candidate);
      order.push(id);
      continue;
    }

    // De-dupe preference: keep the more complete card.
    const prev = byId.get(id);
    const prevScore = (prev.bullets?.length || 0) * 10 + (prev.description?.length || 0);
    const newScore = (candidate.bullets?.length || 0) * 10 + (candidate.description?.length || 0);
    if (newScore >= prevScore) {
      byId.set(id, candidate);
    }
  }

  return order.map(id => byId.get(id)).filter(Boolean);
}

function main() {
  const backgroundsHtml = readText('backgrounds.html');
  const originFeatsHtml = readText('originfeats.html');

  const backgrounds = extractBackgroundsFromBackgroundsHtml(backgroundsHtml);
  const originFeats = extractOriginFeatsFromOriginFeatsHtml(originFeatsHtml);

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sources: {
      backgroundsHtml: 'backgrounds.html',
      originFeatsHtml: 'originfeats.html',
    },
    counts: {
      backgrounds: backgrounds.length,
      originFeats: originFeats.length,
    },
    backgrounds,
    originFeats,
  };

  writeText('src/backgrounds_originfeats_index.json', JSON.stringify(output, null, 2) + '\n');

  // eslint-disable-next-line no-console
  console.log(`Wrote src/backgrounds_originfeats_index.json with ${backgrounds.length} backgrounds and ${originFeats.length} origin feats.`);
}

main();
