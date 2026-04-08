/*
  Migrates `attunement.html` from embedded reference tables to external JSON.

  What it does:
  - Removes everything between `// BEGIN EMBEDDED DATA` and `// END EMBEDDED DATA`
  - Ensures the main script declares global reference variables:
      weaponsData, regaliaTypes, clothingArmorCategories, regaliaUpgrades
  - Replaces the old boot (`renderAll()`) with an async loader that fetches
    `attunement_data.json` (or `?data=...`) and then calls `renderAll()`.

  Usage:
    node tools/migrate_attunement_to_external_data.js
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ATTUNEMENT_HTML = path.join(ROOT, 'attunement.html');

function normalizeNewlines(text) {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function replaceBetweenMarkers(text, startMarker, endMarker, replacement) {
  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
    throw new Error('Could not find BEGIN/END markers in attunement.html');
  }

  const before = text.slice(0, startIdx + startMarker.length);
  const after = text.slice(endIdx);
  return `${before}\n\n${replacement}\n\n${after}`;
}

function ensureRefVarDeclarations(text) {
  // Insert declarations right after the first "<script>" that contains "const state".
  // Idempotent: if we already see the declarations nearby, do nothing.
  const marker = '<script>';
  let idx = text.indexOf(marker);
  while (idx >= 0) {
    const nextIdx = text.indexOf(marker, idx + marker.length);
    const block = text.slice(idx, nextIdx >= 0 ? nextIdx : text.length);
    if (block.includes('const state =') || block.includes('const state={')) {
      if (block.includes('let weaponsData') && block.includes('let regaliaTypes')) {
        return text;
      }

      const insertAt = idx + marker.length;
      const decl = `\n    // Reference data (loaded by the boot script at the bottom of this file)\n    let weaponsData = null;\n    let regaliaTypes = null;\n    let clothingArmorCategories = null;\n    let regaliaUpgrades = null;\n`;
      return text.slice(0, insertAt) + decl + text.slice(insertAt);
    }
    idx = nextIdx;
  }

  throw new Error('Could not find a suitable <script> block containing `const state`');
}

function replaceBoot(text) {
  // Replace the known old boot snippet.
  // We match loosely because the exact comment may differ.
  const old = /\/\/\s*Boot[\s\S]*?\n\s*renderAll\(\);\s*\n\s*<\/script>/m;

  const replacement = `// Reference data is now loaded externally (so this HTML can stay lightweight).\n    // Build or refresh the local JSON with:\n    //   node tools/build_attunement_data_json.js\n\n    function getReferenceDataUrl() {\n      try {\n        const params = new URLSearchParams(location.search);\n        const override = (params.get('data') || '').trim();\n        if (override) return override;\n      } catch (_) {}\n      return 'attunement_data.json';\n    }\n\n    function setToolbarEnabled(enabled) {\n      const ids = ['uploadItemBtn', 'saveLoadoutBtn', 'loadLoadoutBtn', 'clearAllBtn'];\n      for (const id of ids) {\n        const el = document.getElementById(id);\n        if (el) el.disabled = !enabled;\n      }\n    }\n\n    async function loadReferenceData() {\n      const url = getReferenceDataUrl();\n\n      let res;\n      try {\n        res = await fetch(url, { cache: 'no-store' });\n      } catch (_) {\n        throw new Error('Fetch failed');\n      }\n\n      if (!res.ok) {\n        throw new Error('HTTP ' + res.status);\n      }\n\n      const json = await res.json();\n      if (!json || json.type !== 'attunement-reference-data' || Number(json.version) !== 1) {\n        throw new Error('Unexpected type/version');\n      }\n\n      if (!json.weaponsData || !json.regaliaTypes || !json.clothingArmorCategories || !json.regaliaUpgrades) {\n        throw new Error('Missing required fields');\n      }\n\n      weaponsData = json.weaponsData;\n      regaliaTypes = json.regaliaTypes;\n      clothingArmorCategories = json.clothingArmorCategories;\n      regaliaUpgrades = json.regaliaUpgrades;\n    }\n\n    // Boot (after reference data is available)\n    (async () => {\n      setToolbarEnabled(false);\n      try {\n        const statusEl = document.getElementById('statusLine');\n        if (statusEl) statusEl.textContent = 'Loading reference data…';\n      } catch (_) {}\n\n      try {\n        await loadReferenceData();\n        setToolbarEnabled(true);\n        renderAll();\n        try {\n          const statusEl = document.getElementById('statusLine');\n          if (statusEl) statusEl.textContent = 'Ready. Upload weapon/regalia JSON saves to populate your inventory.';\n        } catch (_) {}\n      } catch (err) {\n        setToolbarEnabled(false);\n        const url = getReferenceDataUrl();\n        const msg = 'Could not load attunement reference data.'\n          + '\\n\\nTried: ' + url\n          + '\\n\\nIf you are opening this file directly (file://), many browsers block fetching local JSON.'\n          + '\\nHost the JSON somewhere and open with:?data=https://your.host/attunement_data.json'\n          + '\\n\\nDetails: ' + (err && err.message ? err.message : String(err));\n        try {\n          const statusEl = document.getElementById('statusLine');\n          if (statusEl) statusEl.textContent = 'Failed to load reference data.';\n        } catch (_) {}\n        // eslint-disable-next-line no-alert\n        alert(msg);\n      }\n    })();\n  </script>`;

  if (!old.test(text)) {
    throw new Error('Could not find old boot snippet to replace.');
  }

  return text.replace(old, replacement);
}

function main() {
  let html = fs.readFileSync(ATTUNEMENT_HTML, 'utf8');
  html = normalizeNewlines(html);

  html = ensureRefVarDeclarations(html);

  // Remove embedded data block.
  html = replaceBetweenMarkers(
    html,
    '// BEGIN EMBEDDED DATA',
    '// END EMBEDDED DATA',
    '    // (Embedded tables removed — reference data now comes from attunement_data.json)'
  );

  // Replace boot.
  html = replaceBoot(html);

  fs.writeFileSync(ATTUNEMENT_HTML, html, 'utf8');
  console.log('Migrated attunement.html to external reference data.');
}

main();
