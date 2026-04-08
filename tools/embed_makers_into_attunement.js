#!/usr/bin/env node

// Embeds the full HTML of the Legacy Weapon Maker and Regalia Maker
// into attunement.html <template> blocks so attunement.html can be hosted
// as a single, standalone file (no external maker HTML fetches).
//
// Usage:
//   node tools/embed_makers_into_attunement.js

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const attunementPath = path.join(root, 'attunement.html');

const sources = [
  {
    file: path.join(root, 'src', 'legacyweapon.html'),
    marker: 'src/legacyweapon.html'
  },
  {
    file: path.join(root, 'regalia maker.html'),
    marker: 'regalia maker.html'
  }
];

function normalizeNewlines(s) {
  return String(s).replace(/\r\n/g, '\n');
}

function escapeHtml(s) {
  // Keep embedded maker HTML inert inside attunement.html.
  // It will be decoded at runtime before being assigned to iframe.srcdoc.
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceBetweenMarkers(haystack, markerName, replacement) {
  const begin = `<!-- BEGIN_EMBED:${markerName} -->`;
  const end = `<!-- END_EMBED:${markerName} -->`;

  const startIdx = haystack.indexOf(begin);
  if (startIdx === -1) throw new Error(`Missing begin marker: ${begin}`);

  const endIdx = haystack.indexOf(end, startIdx);
  if (endIdx === -1) throw new Error(`Missing end marker: ${end}`);

  const before = haystack.slice(0, startIdx + begin.length);
  const after = haystack.slice(endIdx);

  // Keep a clean newline boundary so the template stays readable.
  const payload = `\n${replacement.trim()}\n`;
  return `${before}${payload}${after}`;
}

function main() {
  let att = normalizeNewlines(fs.readFileSync(attunementPath, 'utf8'));

  for (const src of sources) {
    const html = normalizeNewlines(fs.readFileSync(src.file, 'utf8'));
    const escaped = escapeHtml(html);
    att = replaceBetweenMarkers(att, src.marker, escaped);
  }

  fs.writeFileSync(attunementPath, att, 'utf8');
  process.stdout.write(`Embedded makers into ${path.relative(root, attunementPath)}\n`);
}

main();
