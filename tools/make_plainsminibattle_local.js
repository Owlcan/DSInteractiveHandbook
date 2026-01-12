/*
  Generates plainsminibattle.html from plainsminibattle copy.html,
  rewriting hotlinked imagery/video assets to local repo paths.

  Usage:
    node tools/make_plainsminibattle_local.js
*/

const fs = require('fs');

const SOURCE_FILE = 'plainsminibattle copy.html';
const DEST_FILE = 'plainsminibattle.html';

const BASE = 'src/assets/images/expeditionandgames/plainsRPG';
const FACES = `${BASE}/characterfaces`;
const ABILITIES = `${BASE}/abilities`;
const BATTLEFIELDS = `${BASE}/battlefields`;

function mustReplaceAll(haystack, needle, replacement) {
  const before = haystack;
  const after = haystack.split(needle).join(replacement);
  if (before === after) {
    throw new Error(`Expected to replace but did not find: ${needle}`);
  }
  return after;
}

function replaceAll(haystack, needle, replacement) {
  return haystack.split(needle).join(replacement);
}

let html = fs.readFileSync(SOURCE_FILE, 'utf8');

// Remove remote texture backgrounds (imagery) so the file is fully self-hostable.
html = html.replace(/\s*background-image:\s*url\('https:\/\/www\.transparenttextures\.com\/patterns\/[^']+'\);\s*/g, '\n');

// Title logo: swap to local existing logo asset.
html = replaceAll(
  html,
  'https://gleaming-cannedlulu.wordpress.com/wp-content/uploads/2025/08/dsrpglogo.webp',
  'src/assets/images/logo.png'
);

// Faces: swap any hosted face images (07/08) to local characterfaces.
html = html.replace(
  /https:\/\/gleaming-cannedlulu\.wordpress\.com\/wp-content\/uploads\/2025\/(?:07|08)\/([a-z]+face\.png)/g,
  (_m, file) => `${FACES}/${file}`
);

// Ability overlays: swap any hosted .webp overlays to local abilities.
html = html.replace(
  /https:\/\/gleaming-cannedlulu\.wordpress\.com\/wp-content\/uploads\/2025\/(?:07|08)\/([a-z0-9]+\.webp)/gi,
  (_m, file) => `${ABILITIES}/${file}`
);

// ImageKit derestrike.webp -> local.
html = replaceAll(
  html,
  'https://ik.imagekit.io/owlcan/deregame/derestrike.webp',
  `${ABILITIES}/derestrike.webp`
);

// Battlefields: replace the battlefields array with local known filenames.
html = html.replace(
  /const battlefields\s*=\s*\[[\s\S]*?\];/m,
  [
    'const battlefields = [',
    `    '${BATTLEFIELDS}/plainsbattlefield (1).jpg',`,
    `    '${BATTLEFIELDS}/plainsbattlefield (2).jpg',`,
    `    '${BATTLEFIELDS}/plainsbattlefield (3).jpg',`,
    `    '${BATTLEFIELDS}/plainsbattlefield (4).jpg',`,
    `    '${BATTLEFIELDS}/plainsbattlefield (5).jpg',`,
    `    '${BATTLEFIELDS}/plainsbattlefield (6).jpg'`,
    '];'
  ].join('\n')
);

// Intro video: swap remote mp4 to a local mp4 that exists in the repo.
html = replaceAll(
  html,
  "video.src = 'https://ik.imagekit.io/owlcan/deregame/gameintro.mp4';",
  `video.src = '${BASE}/vidu-video-2906609577730410.mp4';`
);

// Party sprite loading: replace the "try multiple month folders" remote loader with local sprites.
html = html.replace(
  /\/\/ Try multiple month folders for sprite images[\s\S]*?\n\s*tryNextMonth\(\);\s*\n\s*\/\/ Hard code face image URLs for each class and allow name override for Cuppy\s*/m,
  [
    '                // Local sprite images (self-hosted for GitHub Pages)',
    `                sprite.src = \`${BASE}/\${member.classType}.png\`;`,
    '                sprite.onerror = function () {',
    '                    this.onerror = null;',
    `                    this.src = '${BASE}/archer.png';`,
    '                };',
    '                // Hard code face image URLs for each class and allow name override for Cuppy',
    ''
  ].join('\n')
);

// Ensure any remaining direct class sprite hotlinks get rewritten.
html = html.replace(
  /https:\/\/gleaming-cannedlulu\.wordpress\.com\/wp-content\/uploads\/2025\/(?:07|08)\/([a-z]+\.png)/g,
  (_m, file) => `${BASE}/${file}`
);

// Make sure we didn't accidentally leave a known remote logo reference.
if (html.includes('dsrpglogo.webp')) {
  // If any other occurrences exist, force them to local logo.png.
  html = replaceAll(html, 'dsrpglogo.webp', 'logo.png');
}

fs.writeFileSync(DEST_FILE, html, 'utf8');
console.log(`Wrote ${DEST_FILE} from ${SOURCE_FILE}`);
