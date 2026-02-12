#!/usr/bin/env node
/*
Builds a JSON index of SRD armors (5e-style armor table).

Output: `src/srd_armor_index.json`
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src', 'srd_armor_index.json');

function main() {
  // SRD armor table (2014 5e style). AC is represented as a human-readable formula.
  const armors = [
    // Light armor
    { name: 'Padded Armor', type: 'Light', gp: 5, acText: '11 + Dex', stealthDisadvantage: true, strengthReq: 0, notes: 'Stealth Disadvantage' },
    { name: 'Leather Armor', type: 'Light', gp: 10, acText: '11 + Dex', stealthDisadvantage: false, strengthReq: 0, notes: '' },
    { name: 'Studded Leather Armor', type: 'Light', gp: 45, acText: '12 + Dex', stealthDisadvantage: false, strengthReq: 0, notes: '' },

    // Medium armor
    { name: 'Hide Armor', type: 'Medium', gp: 10, acText: '12 + Dex (max 2)', stealthDisadvantage: false, strengthReq: 0, notes: '' },
    { name: 'Chain Shirt', type: 'Medium', gp: 50, acText: '13 + Dex (max 2)', stealthDisadvantage: false, strengthReq: 0, notes: '' },
    { name: 'Scale Mail', type: 'Medium', gp: 50, acText: '14 + Dex (max 2)', stealthDisadvantage: true, strengthReq: 0, notes: 'Stealth Disadvantage' },
    { name: 'Breastplate', type: 'Medium', gp: 400, acText: '14 + Dex (max 2)', stealthDisadvantage: false, strengthReq: 0, notes: '' },
    { name: 'Half Plate Armor', type: 'Medium', gp: 750, acText: '15 + Dex (max 2)', stealthDisadvantage: true, strengthReq: 0, notes: 'Stealth Disadvantage' },

    // Heavy armor
    { name: 'Ring Mail', type: 'Heavy', gp: 30, acText: '14', stealthDisadvantage: true, strengthReq: 0, notes: 'Stealth Disadvantage' },
    { name: 'Chain Mail', type: 'Heavy', gp: 75, acText: '16', stealthDisadvantage: true, strengthReq: 13, notes: 'Stealth Disadvantage; Str 13 req.' },
    { name: 'Splint Armor', type: 'Heavy', gp: 200, acText: '17', stealthDisadvantage: true, strengthReq: 15, notes: 'Stealth Disadvantage; Str 15 req.' },
    { name: 'Plate Armor', type: 'Heavy', gp: 1500, acText: '18', stealthDisadvantage: true, strengthReq: 15, notes: 'Stealth Disadvantage; Str 15 req.' },

    // Shields
    { name: 'Shield', type: 'Shield', gp: 10, acText: '+2 AC', stealthDisadvantage: false, strengthReq: 0, notes: '' }
  ];

  armors.sort((a, b) => a.name.localeCompare(b.name));

  const out = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'SRD (armor table)',
    count: armors.length,
    armors
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${armors.length} SRD armors -> ${path.relative(ROOT, OUTPUT)}`);
}

main();
