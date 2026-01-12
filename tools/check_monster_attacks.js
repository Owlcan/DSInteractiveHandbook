// Quick validation script: checks monsters/bossMonsters for missing numeric attack damage.
// Usage: node tools/check_monster_attacks.js

const fs = require('fs');
const vm = require('vm');

const codePath = 'src/data/RPGmonsters.js';
let code = fs.readFileSync(codePath, 'utf8');

// Expose arrays declared with const/let into the VM global (if any), and also
// allow browser-style assignment to window.monsters/window.bossMonsters.
code += `\nthis.__monsters = (typeof monsters !== 'undefined') ? monsters : undefined;\n`;
code += `this.__bossMonsters = (typeof bossMonsters !== 'undefined') ? bossMonsters : undefined;\n`;

const ctx = { console, window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx, { filename: codePath });

const monsters = Array.isArray(ctx.__monsters)
  ? ctx.__monsters
  : (Array.isArray(ctx.window.monsters) ? ctx.window.monsters : []);

const bossMonsters = Array.isArray(ctx.__bossMonsters)
  ? ctx.__bossMonsters
  : (Array.isArray(ctx.window.bossMonsters) ? ctx.window.bossMonsters : []);

const all = [...monsters, ...bossMonsters];
const issues = [];

for (const m of all) {
  if (!m || typeof m !== 'object') {
    issues.push({ name: String(m), issue: 'monster not object' });
    continue;
  }

  if (!Number.isFinite(m.attack)) {
    issues.push({ name: m.name, issue: 'monster.attack not finite', value: m.attack });
  }

  if (!Array.isArray(m.attacks) || m.attacks.length === 0) {
    issues.push({ name: m.name, issue: 'missing attacks array' });
    continue;
  }

  for (const a of m.attacks) {
    if (!a || typeof a !== 'object') {
      issues.push({ name: m.name, issue: 'attack not object', attack: String(a) });
      continue;
    }
    if (!Number.isFinite(a.damage)) {
      issues.push({ name: m.name, issue: 'attack.damage not finite', attack: a.name, damage: a.damage });
    }
  }
}

console.log('monsters', monsters.length, 'boss', bossMonsters.length);
console.log('issues', issues.length);
if (issues.length) {
  console.log(JSON.stringify(issues.slice(0, 80), null, 2));
}
process.exitCode = issues.length ? 2 : 0;
