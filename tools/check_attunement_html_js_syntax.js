/*
  Extracts the first <script>...</script> block from attunement.html and checks
  whether Node can parse it (via `new Function`).

  Usage:
    node tools/check_attunement_html_js_syntax.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'attunement.html');

const html = fs.readFileSync(FILE, 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/i);
if (!match) {
  console.error('No <script> block found');
  process.exit(2);
}

const js = match[1];
try {
  // Parse only (do not execute app code).
  // eslint-disable-next-line no-new-func
  new Function(js);
  console.log('JS OK');
} catch (e) {
  console.error('JS SYNTAX ERROR:', e && e.message ? e.message : String(e));
  process.exit(1);
}
