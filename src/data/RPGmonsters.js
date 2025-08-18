// RPGmonsters.js
// Exports monsters and bossMonsters arrays for Battle on the Plains
// Keep this file focused on data. Rebalance here; game logic reads these.

/* eslint-disable */
(function(global){
  // Utility: normalize weaknesses (radiant/holy -> light, ice -> wind)
  const normWeak = (arr)=> (arr||[]).map(w=>{
    const s = String(w||'').toLowerCase();
    if (s === 'radiant' || s === 'holy') return 'light';
    if (s === 'ice') return 'wind';
    return s;
  });
  // Single roster: main list with all monsters appended directly (no scratchpad split)
  const monstersRaw = [
    { name: "Darkling-Hooter", hp: 22, attack: 20, defense: 15, cr: 0.5, weaknesses: ['light'], image: "https://i.postimg.cc/br86ctwG/darkling-hooter.png", attacks: [ { name: 'Peck', damage: 6 }, { name: 'Shadow Swoop', damage: 8 } ] },
    { name: "Darkforme-Nightpinyon", hp: 38, attack: 24, defense: 18, cr: 2.5, weaknesses: ['lightning'], image: "https://i.postimg.cc/Z51xzdfT/darkforme-nightpinyon.png", attacks: [ { name: 'Debilitating Peck', damage: 10 }, { name: 'Night Dive', damage: 8 } ] },
    { name: "Darkling-Slitherscale", hp: 28, attack: 22, defense: 16, cr: 1, weaknesses: ['wind'], image: "https://i.postimg.cc/NFgxPvdm/darkling-slitherscale.png", attacks: [ { name: 'Bite', damage: 8 }, { name: 'Tail Lash', damage: 7 } ] },
    { name: "Darkforme-Suffocator", hp: 44, attack: 26, defense: 19, cr: 2.5, weaknesses: ['wind'], image: "https://i.postimg.cc/GtQXcm4X/darkforme-suffocator.png", attacks: [ { name: 'Crushing Grip', damage: 11 }, { name: 'Chokehold', damage: 9 } ] },
    { name: "Darkling-Cactine-Biggo-Boy", hp: 36, attack: 24, defense: 18, cr: 1.5, weaknesses: ['water'], image: "https://i.postimg.cc/BZcY5Mm2/darkling-cactine-biggo-boy.png", attacks: [ { name: 'Spiny Jab', damage: 8 }, { name: 'Needle Barrage', damage: 7 } ] },
    { name: "Darkforme-Ossokin-Aegisite", hp: 52, attack: 28, defense: 22, cr: 3, weaknesses: ['earth'], image: "https://i.postimg.cc/VNnBfkTX/darkforme-ossokin-aegisite.png", attacks: [ { name: 'Bone Slam', damage: 12 }, { name: 'Shield Bash', damage: 10 } ] },
    { name: "Darkforme-Spinebearer", hp: 48, attack: 28, defense: 22, cr: 3.5, weaknesses: ['light', 'fire'], image: "https://i.postimg.cc/C5LjsHK4/darkforme-spinebearer.png", attacks: [ { name: 'Spike Jab', damage: 14 }, { name: 'Spine Barrage', damage: 12 } ] },
    { name: "Darkling-Ossuite Charger", hp: 44, attack: 22, defense: 18, cr: 2.5, weaknesses: ['earth'], image: "https://i.postimg.cc/yNZnDPJg/darkling-ossuite-charger.png", attacks: [ { name: 'Tendril Bow', damage: 10 }, { name: 'Ossuite Slam', damage: 8 } ] },
    { name: "Darkling-Cactine", hp: 18, attack: 18, defense: 15, cr: 1, weaknesses: ['water'], attackFrequency: 1.5, image: "https://i.postimg.cc/1tDWjHsh/darkling-cactine.png", attacks: [ { name: 'Prickly Jab', damage: 7 }, { name: 'Spine Flurry', damage: 6 } ] },
    { name: "Darkforme-Shark", hp: 60, attack: 24, defense: 20, cr: 3.5, weaknesses: ['light'], attackFrequency: 1.5, image: "https://i.postimg.cc/ZRL8NDJR/darkforme-shark.png", attacks: [ { name: 'Ravenous Bite', damage: 14 }, { name: 'Fin Slash', damage: 10 } ] },
    { name: "Darkling-Shark", hp: 28, attack: 18, defense: 15, cr: 1.5, weaknesses: ['wind'], image: "https://i.postimg.cc/qRcLLvxp/darkling-shark.png", attacks: [ { name: 'Bite', damage: 8 }, { name: 'Tail Whip', damage: 7 } ] },
    { name: "Darkling-Ossokin-Proselyte", hp: 22, attack: 16, defense: 15, cr: 1.5, weaknesses: ['earth'], image: "https://i.postimg.cc/kgDTm9qy/darkling-ossokin-proselyte.png", attacks: [ { name: 'Bone Tap', damage: 6 }, { name: 'Proselyte Slam', damage: 5 } ] },
    { name: "Lost Plushie", hp: 8, attack: 1, defense: 25, cr: 0.125, weaknesses: ['fire'], image: "https://ik.imagekit.io/owlcan/Monsters/lostplushie1.png", attacks: [ { name: 'Sad Cuddle', damage: 1 } ] },
    { name: "Darkling-Caller", hp: 8, attack: 8, defense: 30, cr: 0.25, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkling%20Caller.png", attacks: [ { name: 'Bite', damage: 4 }, { name: 'Piercing Call', damage: 6 } ] },
    { name: "Darkling-Yowler", hp: 24, attack: 10, defense: 32, cr: 0.5, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkling%20Yowler.png", attacks: [ { name: 'Bite', damage: 5 }, { name: 'Ordure Wail', damage: 8 } ] },
    { name: "Darkling Bellowbelly Cubling", hp: 21, attack: 12, defense: 35, cr: 0.5, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkling%20Cubling.png", attacks: [ { name: 'Bite', damage: 6 }, { name: 'Swarm Call', damage: 4 } ] },
    { name: "Darkling Weed-Tangler", hp: 36, attack: 15, defense: 38, cr: 0.5, weaknesses: ['fire'], image: "https://ik.imagekit.io/owlcan/Monsters/weedtangler.png", attacks: [ { name: 'Vine Whip', damage: 8 }, { name: 'Entangle', damage: 10 } ] },
    { name: "Darkling-Slurper", hp: 28, attack: 18, defense: 36, cr: 0.5, weaknesses: ['light'], attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/Monsters/Darkling%20Slurper.png", attacks: [ { name: 'Grapple Bite', damage: 8 }, { name: 'Draining Slurp', damage: 6 } ] },
    { name: "Darkling Gloom-Newt", hp: 45, attack: 16, defense: 38, cr: 0.75, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/gloomnewt1.png", attacks: [ { name: 'Toxic Bite', damage: 7 }, { name: 'Gloom Spit', damage: 9 } ] },
    { name: "Darkling-Lurker", hp: 60, attack: 22, defense: 40, cr: 1, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkling%20Lurker.png", attacks: [ { name: 'Claw Slash', damage: 9 }, { name: 'Pounce', damage: 7 }, { name: 'Shadow Strike', damage: 12 } ] },
    { name: "Darkforme Overwatch", hp: 80, attack: 28, defense: 45, cr: 2, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkforme-Overwatch.png", attacks: [ { name: 'Shadow Blast', damage: 10 }, { name: 'Dark Command', damage: 15 } ] },
    { name: "Darkling Liquid Legion", hp: 66, attack: 25, defense: 42, cr: 2, weaknesses: ['fire','light'], image: "https://ik.imagekit.io/owlcan/Monsters/liquidlegion1.png", attacks: [ { name: 'Pseudopod', damage: 8 }, { name: 'Engulf', damage: 12 } ] },
    { name: "Dark Dimension Changebot", hp: 60, attack: 30, defense: 48, cr: 2, weaknesses: ['earth'], image: "https://ik.imagekit.io/owlcan/Monsters/nannybot.jpg", attacks: [ { name: 'Pincer Claw', damage: 9 }, { name: 'Forced Change', damage: 14 } ] },
    { name: "Darkforme Punishment Maid", hp: 130, attack: 35, defense: 50, cr: 4, weaknesses: ['light','earth'], image: "https://ik.imagekit.io/owlcan/Monsters/darkpunishmentmaid.png", attacks: [ { name: 'Disciplinary Strike', damage: 15 }, { name: 'Shadow Whip', damage: 22 } ] },
    { name: "Darkling Blood-Gorger", hp: 168, attack: 40, defense: 55, cr: 5, weaknesses: ['light','fire'], image: "https://ik.imagekit.io/owlcan/Monsters/bloodgorger.png", attacks: [ { name: 'Blood Drain', damage: 18 }, { name: 'Savage Bite', damage: 25 } ] },
    { name: "Darkling-Paralurker", hp: 140, attack: 45, defense: 58, cr: 5, weaknesses: ['light','water'], image: "https://ik.imagekit.io/owlcan/Monsters/weirdling-paralurker.png", attacks: [ { name: 'Paralyzing Bite', damage: 20 }, { name: 'Shadow Claw', damage: 18 }, { name: 'Dark Ambush', damage: 30 } ] },
    { name: "Sky-Darkener Nightveil", hp: 200, attack: 35, defense: 60, cr: 5, weaknesses: ['light','wind'], image: "https://ik.imagekit.io/owlcan/Monsters/sky-darkener-nightveil.png ", attackFrequency: 1.5, attacks: [ { name: 'Taloned Strike', damage: 20 }, { name: 'Swoop and Dive', damage: 25 } ] },
    { name: "Darkaconda", hp: 125, attack: 35, defense: 60, cr: 4, weaknesses: ['light','lightning','earth'], image: "https://ik.imagekit.io/owlcan/Monsters/darkaconda.png", attacks: [ { name: 'Shadow Lunge', damage: 22 }, { name: 'Crushing Coil', damage: 18 } ] },
    { name: "Darkforme Nightsipper", hp: 120, attack: 30, defense: 52, cr: 4, weaknesses: ['light','physical'], image: "https://ik.imagekit.io/owlcan/Monsters/nightsipper.png", attacks: [ { name: 'Siphoning Bite', damage: 18 }, { name: 'Brown-Note Screech', damage: 15 } ] },
    { name: "Dark Dimension Nannybot Bratnapper", hp: 44, attack: 20, defense: 22, cr: 1.5, weaknesses: [], image: "https://ik.imagekit.io/owlcan/Monsters/nannybot.jpg", attacks: [ { name: 'Bratnap Claws', damage: 9 } ] },
    { name: "Darkling-Bellowbelly", hp: 32, attack: 20, defense: 22, cr: 1.5, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Bellowbelly.png", attacks: [ { name: 'Claw', damage: 10 }, { name: 'Bite', damage: 9 } ] },
    { name: "Darkling-Brackling", hp: 28, attack: 18, defense: 22, cr: 1.5, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Brackling.png", attacks: [ { name: 'Tendril Lash', damage: 11 }, { name: 'Bite', damage: 8 } ] },
    { name: "Darkform Enforcer", hp: 120, attack: 28, defense: 34, cr: 5, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Enforcer.png", attacks: [ { name: 'Tendril Barrage', damage: 14 }, { name: 'Pound', damage: 20 }, { name: 'Blistering Beam', damage: 16 } ] },
    { name: "Darkforme-Cavesweller", hp: 136, attack: 24, defense: 24, cr: 3.5, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Cavesweller.png", attacks: [ { name: 'Claw', damage: 13 }, { name: 'Bite', damage: 17 }, { name: 'Tendril Lash', damage: 15 } ] },
    { name: "Darkforme-Shade-Sneak", hp: 43, attack: 16, defense: 22, cr: 1, weaknesses: ['light'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Shadow-Lurker.png", attacks: [ { name: 'Claw', damage: 7 }, { name: 'Bite', damage: 6 } ] },
    { name: "Darkling-Ossokin", hp: 2, attack: 14, defense: 2, cr: 0.25, weaknesses: [], image: "https://i.postimg.cc/wTwwZ38v/darkling-ossokin.png", attacks: [ { name: 'Shin Smack', damage: 2 } ] },
    { name: "Darkling-Hungerer", hp: 33, attack: 26, defense: 22, cr: 2, weaknesses: [], image: "https://i.postimg.cc/rFVhfxH3/darkling-hungerer.png", attacks: [ { name: 'Gnawing Swipe', damage: 5 } ] },
    { name: "Darkforme-Sleek-Lurker Pack Alpha", hp: 100, attack: 40, defense: 30, cr: 2, weaknesses: ['light','wind'], image: "https://ik.imagekit.io/owlcan/Monsters/Darkforme%20Shadow-Lurker%20Pack%20Alpha.png", attacks: [ { name: 'Claw', damage: 9 }, { name: 'Bite', damage: 8 } ] },
    { name: "Dark Dimension Project Auditor", hp: 92, attack: 22, defense: 26, cr: 5, weaknesses: [], image: "https://ik.imagekit.io/owlcan/projectauditor.png", attacks: [ { name: 'Enchanted Saber', damage: 17 }, { name: 'Arcane Detonation', damage: 18 } ] },
    { name: "Dark Dimension Matronbot", hp: 104, attack: 26, defense: 26, cr: 5, weaknesses: [], image: "https://ik.imagekit.io/owlcan/Monsters/matronbot_bria.png", attacks: [ { name: 'Diaper Grappler', damage: 12 }, { name: 'Punishment Rod', damage: 15 } ] },
    { name: "Darkling-Nightshade Elemental", hp: 36, attack: 20, defense: 22, cr: 2, weaknesses: [], image: "https://i.postimg.cc/x17tj7dV/darkling-nightshade-elemental.png", attacks: [ { name: 'Shadow Blast', damage: 11 } ] },
    { name: "Darkforme-Hungore", hp: 42, attack: 20, defense: 24, cr: 2.5, weaknesses: ['light'], image: "https://i.postimg.cc/RZ3LYRLs/darkforme-hungore.png", attacks: [ { name: 'Ventral Maw', damage: 9 } ] },
    { name: "The Darkformless", hp: 120, attack: 40, defense: 40, cr: 5, weaknesses: ['light'], image: "https://i.postimg.cc/v8zhxDmz/the-darkformless.png", attacks: [ { name: 'Shadow Bolt', damage: 12 }, { name: 'Umbral Blast', damage: 10 } ] },
  ];

  // Normalize weaknesses and apply light balance floors to avoid one-shots.
  // Floors only raise low outliers; they don't reduce any stats.
  const monsters = monstersRaw
    .map(m => ({ ...m, weaknesses: normWeak(m.weaknesses) }))
    .map(m => {
      let def = m.defense;
      let hp = m.hp;
      if (m.cr >= 1 && m.cr < 1.5) {
        def = Math.max(def, 18);
        hp = Math.max(hp, 24);
      } else if (m.cr >= 1.5 && m.cr < 2.5) {
        def = Math.max(def, 22);
        hp = Math.max(hp, 30);
      } else if (m.cr >= 2.5 && m.cr < 3.5) {
        def = Math.max(def, 24);
        hp = Math.max(hp, 40);
      }
      return { ...m, defense: def, hp };
    });

  const bossMonsters = [
    { name: "Darkling-Ossuite Charger Omega", hp: 220, attack: 55, defense: 70, cr: 7, weaknesses: normWeak(['radiant','earth']), image: "https://i.postimg.cc/Jh67Phkj/Comfy-UI-00880.png", attacks: [ { name: 'Lance Strike', damage: 18 }, { name: 'Hoof Stomp', damage: 12 }, { name: 'Tendril Arrow', damage: 10 } ] },
    { name: "Chap'Hell", hp: 260, attack: 65, defense: 80, cr: 9, weaknesses: normWeak(['light','fire']), attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/chaphell.png", attacks: [ { name: 'Bone Slam', damage: 20 }, { name: 'Bone Rake', damage: 14 }, { name: 'Black Ooze Cannon', damage: 18 } ] },
    { name: "Lakeopus Rex", hp: 300, attack: 70, defense: 85, cr: 10, weaknesses: normWeak(['radiant','wind']), attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/Monsters/lakeopus_rex.png", attacks: [ { name: 'Crushing Bite', damage: 25 }, { name: 'Tentacle', damage: 18 }, { name: 'Abyssal Wave', damage: 20 } ] },
    { name: "Nightmare Sire Reaver", hp: 500, attack: 75, defense: 90, cr: 10, weaknesses: normWeak(['light','wind']), attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/Pagematerials/sire_reaver.png", attacks: [ { name: 'Lance of Shadows', damage: 30 }, { name: 'Hooves', damage: 18 }, { name: 'Shadow Charge', damage: 22 } ] },
    { name: "Stalker of the Dark Passages: Nightdrinker", hp: 400, attack: 80, defense: 95, cr: 12, weaknesses: normWeak(['radiant','fire']), attackFrequency: 1.5, image: "https://media-hosting.imagekit.io//321c65af6ff74b38/SPOILER_OIG.png", attacks: [ { name: 'Tentacle Bash', damage: 22 }, { name: "Twilight's Lash", damage: 18 }, { name: 'Nightmare Grasp', damage: 24 } ] },
    { name: "Night-Mare Shadowstorm", hp: 400, attack: 55, defense: 65, cr: 9, weaknesses: normWeak(['light','earth']), attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/Monsters/shadowstorm.png", attacks: [ { name: 'Lance of Dusk', damage: 20 }, { name: 'Hoof Stomp', damage: 23 }, { name: 'Charging Trample', damage: 28 }, { name: 'Shadowy Tendrils', damage: 35 } ] },
    { name: "Dark Dimension Auditarch", hp: 280, attack: 60, defense: 68, cr: 7, weaknesses: normWeak(['wind','water']), attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/Monsters/annapasted-image_bria.png", attacks: [ { name: 'Empowered Saber', damage: 17 }, { name: 'Arcane Volley', damage: 25 }, { name: 'Commanding Presence', damage: 30 } ] },
    { name: "Shadow Slimepress", hp: 1000, attack: 80, defense: 90, cr: 13, weaknesses: normWeak(['fire','lightning']), attackFrequency: 1.5, image: "https://ik.imagekit.io/owlcan/Monsters/slimepress.png", attacks: [ { name: 'Pseudopod Lash', damage: 25 }, { name: 'Engulf', damage: 40 }, { name: 'Demanding Decree', damage: 45 } ] },
  ];

  // Export in browser global
  global.monsters = monsters;
  global.bossMonsters = bossMonsters;
})(window);
