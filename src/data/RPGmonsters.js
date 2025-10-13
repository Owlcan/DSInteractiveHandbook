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
    { name: "Darkling-Hooter", hp: 22, attack: 20, defense: 15, cr: 0.5, weaknesses: ['light'], image: "src/assets/images/Monsters/darkling-hooter.webp", attacks: [ { name: 'Peck', damage: 6 }, { name: 'Shadow Swoop', damage: 8 } ] },
    { name: "Darkforme-Nightpinyon", hp: 38, attack: 24, defense: 18, cr: 2.5, weaknesses: ['lightning'], image: "src/assets/images/Monsters/darkforme-nightpinyon.webp", attacks: [ { name: 'Debilitating Peck', damage: 10 }, { name: 'Night Dive', damage: 8 } ] },
    { name: "Darkling-Slitherscale", hp: 28, attack: 22, defense: 16, cr: 1, weaknesses: ['wind'], image: "src/assets/images/Monsters/darkling-slitherscale.webp", attacks: [ { name: 'Bite', damage: 8 }, { name: 'Tail Lash', damage: 7 } ] },
    { name: "Darkforme-Suffocator", hp: 44, attack: 26, defense: 19, cr: 2.5, weaknesses: ['wind'], image: "src/assets/images/Monsters/darkforme-suffocator.webp", attacks: [ { name: 'Crushing Grip', damage: 11 }, { name: 'Chokehold', damage: 9 } ] },
    { name: "Darkling-Cactine-Biggo-Boy", hp: 36, attack: 24, defense: 18, cr: 1.5, weaknesses: ['water'], image: "src/assets/images/Monsters/darkling-cactine-biggo-boy.webp", attacks: [ { name: 'Spiny Jab', damage: 8 }, { name: 'Needle Barrage', damage: 7 } ] },
    { name: "Darkforme-Ossokin-Aegisite", hp: 52, attack: 28, defense: 22, cr: 3, weaknesses: ['earth'], image: "src/assets/images/Monsters/darkforme-ossokin-aegisite.webp", attacks: [ { name: 'Bone Slam', damage: 12 }, { name: 'Shield Bash', damage: 10 } ] },
    { name: "Darkforme-Spinebearer", hp: 48, attack: 28, defense: 22, cr: 3.5, weaknesses: ['light', 'fire'], image: "src/assets/images/Monsters/darkforme-spinebearer.webp", attacks: [ { name: 'Spike Jab', damage: 14 }, { name: 'Spine Barrage', damage: 12 } ] },
    { name: "Darkling-Ossuite Charger", hp: 44, attack: 22, defense: 18, cr: 2.5, weaknesses: ['earth'], image: "src/assets/images/Monsters/darkling-ossuite-charger.webp", attacks: [ { name: 'Tendril Bow', damage: 10 }, { name: 'Ossuite Slam', damage: 8 } ] },
    { name: "Darkling-Cactine", hp: 18, attack: 18, defense: 15, cr: 1, weaknesses: ['water'], attackFrequency: 1.5, image: "src/assets/images/Monsters/darkling-cactine.webp", attacks: [ { name: 'Prickly Jab', damage: 7 }, { name: 'Spine Flurry', damage: 6 } ] },
    { name: "Darkforme-Shark", hp: 60, attack: 24, defense: 20, cr: 3.5, weaknesses: ['light'], attackFrequency: 1.5, image: "src/assets/images/Monsters/darkforme-shark.webp", attacks: [ { name: 'Ravenous Bite', damage: 14 }, { name: 'Fin Slash', damage: 10 } ] },
    { name: "Darkling-Shark", hp: 28, attack: 18, defense: 15, cr: 1.5, weaknesses: ['wind'], image: "src/assets/images/Monsters/darkling-shark.webp", attacks: [ { name: 'Bite', damage: 8 }, { name: 'Tail Whip', damage: 7 } ] },
    { name: "Darkling-Ossokin-Proselyte", hp: 22, attack: 16, defense: 15, cr: 1.5, weaknesses: ['earth'], image: "src/assets/images/Monsters/darkling-ossokin-proselyte.webp", attacks: [ { name: 'Bone Tap', damage: 6 }, { name: 'Proselyte Slam', damage: 5 } ] },
    { name: "Lost Plushie", hp: 8, attack: 1, defense: 25, cr: 0.125, weaknesses: ['fire'], image: "src/assets/images/Monsters/lostplushie.webp", attacks: [ { name: 'Sad Cuddle', damage: 1 } ] },
    { name: "Darkling-Caller", hp: 8, attack: 8, defense: 30, cr: 0.25, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkling Caller.webp", attacks: [ { name: 'Bite', damage: 4 }, { name: 'Piercing Call', damage: 6 } ] },
    { name: "Darkling-Yowler", hp: 24, attack: 10, defense: 32, cr: 0.5, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkling Yowler.webp", attacks: [ { name: 'Bite', damage: 5 }, { name: 'Ordure Wail', damage: 8 } ] },
    { name: "Darkling Bellowbelly Cubling", hp: 21, attack: 12, defense: 35, cr: 0.5, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkling Cubling.webp", attacks: [ { name: 'Bite', damage: 6 }, { name: 'Swarm Call', damage: 4 } ] },
    { name: "Darkling Weed-Tangler", hp: 36, attack: 15, defense: 38, cr: 0.5, weaknesses: ['fire'], image: "src/assets/images/Monsters/weedtangler.webp", attacks: [ { name: 'Vine Whip', damage: 8 }, { name: 'Entangle', damage: 10 } ] },
    { name: "Darkling-Slurper", hp: 28, attack: 18, defense: 36, cr: 0.5, weaknesses: ['light'], attackFrequency: 1.5, image: "src/assets/images/Monsters/Darkling Slurper.webp", attacks: [ { name: 'Grapple Bite', damage: 8 }, { name: 'Draining Slurp', damage: 6 } ] },
    { name: "Darkling Gloom-Newt", hp: 45, attack: 16, defense: 38, cr: 0.75, weaknesses: ['light'], image: "src/assets/images/Monsters/gloomnewt1.webp", attacks: [ { name: 'Toxic Bite', damage: 7 }, { name: 'Gloom Spit', damage: 9 } ] },
    { name: "Darkling-Lurker", hp: 60, attack: 22, defense: 40, cr: 1, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkling Lurker.webp", attacks: [ { name: 'Claw Slash', damage: 9 }, { name: 'Pounce', damage: 7 }, { name: 'Shadow Strike', damage: 12 } ] },
    { name: "Darkforme Overwatch", hp: 80, attack: 28, defense: 45, cr: 2, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkforme-Overwatch.webp", attacks: [ { name: 'Shadow Blast', damage: 10 }, { name: 'Dark Command', damage: 15 } ] },
    { name: "Darkling Liquid Legion", hp: 66, attack: 25, defense: 42, cr: 2, weaknesses: ['fire','light'], image: "src/assets/images/Monsters/liquidlegion.webp", attacks: [ { name: 'Pseudopod', damage: 8 }, { name: 'Engulf', damage: 12 } ] },
    { name: "Dark Dimension Changebot", hp: 60, attack: 30, defense: 48, cr: 2, weaknesses: ['earth'], image: "src/assets/images/Monsters/nannybot.webp", attacks: [ { name: 'Pincer Claw', damage: 9 }, { name: 'Forced Change', damage: 14 } ] },
    { name: "Darkforme Punishment Maid", hp: 130, attack: 35, defense: 50, cr: 4, weaknesses: ['light','earth'], image: "src/assets/images/Monsters/darkpunishmentmaid.webp", attacks: [ { name: 'Disciplinary Strike', damage: 15 }, { name: 'Shadow Whip', damage: 22 } ] },
    { name: "Darkling Blood-Gorger", hp: 168, attack: 40, defense: 55, cr: 5, weaknesses: ['light','fire'], image: "src/assets/images/Monsters/bloodgorger.webp", attacks: [ { name: 'Blood Drain', damage: 18 }, { name: 'Savage Bite', damage: 25 } ] },
    { name: "Darkling-Paralurker", hp: 140, attack: 45, defense: 58, cr: 5, weaknesses: ['light','water'], image: "src/assets/images/Monsters/darkling-paralurker.webp", attacks: [ { name: 'Paralyzing Bite', damage: 20 }, { name: 'Shadow Claw', damage: 18 }, { name: 'Dark Ambush', damage: 30 } ] },
    { name: "Sky-Darkener Nightveil", hp: 200, attack: 35, defense: 60, cr: 5, weaknesses: ['light','wind'], image: "src/assets/images/Monsters/sky-darkener-nightveil.webp", attackFrequency: 1.5, attacks: [ { name: 'Taloned Strike', damage: 20 }, { name: 'Swoop and Dive', damage: 25 } ] },
    { name: "Darkaconda", hp: 125, attack: 35, defense: 60, cr: 4, weaknesses: ['light','lightning','earth'], image: "src/assets/images/Monsters/darkaconda.webp", attacks: [ { name: 'Shadow Lunge', damage: 22 }, { name: 'Crushing Coil', damage: 18 } ] },
    { name: "Darkforme Nightsipper", hp: 120, attack: 30, defense: 52, cr: 4, weaknesses: ['light','physical'], image: "src/assets/images/Monsters/nightsipper.webp", attacks: [ { name: 'Siphoning Bite', damage: 18 }, { name: 'Brown-Note Screech', damage: 15 } ] },
    { name: "Dark Dimension Nannybot Bratnapper", hp: 44, attack: 20, defense: 22, cr: 1.5, weaknesses: [], image: "src/assets/images/Monsters/nannybot.webp", attacks: [ { name: 'Bratnap Claws', damage: 9 } ] },
    { name: "Darkling-Bellowbelly", hp: 32, attack: 20, defense: 22, cr: 1.5, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkforme Bellowbelly.webp", attacks: [ { name: 'Claw', damage: 10 }, { name: 'Bite', damage: 9 } ] },
    { name: "Darkling-Brackling", hp: 28, attack: 18, defense: 22, cr: 1.5, weaknesses: ['light'], image: "src/assets/images/Monsters/Brackling.webp", attacks: [ { name: 'Tendril Lash', damage: 11 }, { name: 'Bite', damage: 8 } ] },
    { name: "Darkform Enforcer", hp: 120, attack: 28, defense: 34, cr: 5, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkforme Enforcer.webp", attacks: [ { name: 'Tendril Barrage', damage: 14 }, { name: 'Pound', damage: 20 }, { name: 'Blistering Beam', damage: 16 } ] },
    { name: "Darkforme-Cavesweller", hp: 136, attack: 24, defense: 24, cr: 3.5, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkforme Cavesweller.webp", attacks: [ { name: 'Claw', damage: 13 }, { name: 'Bite', damage: 17 }, { name: 'Tendril Lash', damage: 15 } ] },
    { name: "Darkforme-Shade-Sneak", hp: 43, attack: 16, defense: 22, cr: 1, weaknesses: ['light'], image: "src/assets/images/Monsters/Darkforme Shadow-Lurker.webp", attacks: [ { name: 'Claw', damage: 7 }, { name: 'Bite', damage: 6 } ] },
    { name: "Darkling-Ossokin", hp: 2, attack: 14, defense: 2, cr: 0.25, weaknesses: [], image: "src/assets/images/Monsters/darkling-ossokin.webp", attacks: [ { name: 'Shin Smack', damage: 2 } ] },
    { name: "Darkling-Hungerer", hp: 33, attack: 26, defense: 22, cr: 2, weaknesses: [], image: "src/assets/images/Monsters/darkforme-hungore.webp", attacks: [ { name: 'Gnawing Swipe', damage: 5 } ] },
    { name: "Darkforme-Sleek-Lurker Pack Alpha", hp: 100, attack: 40, defense: 30, cr: 2, weaknesses: ['light','wind'], image: "src/assets/images/Monsters/Darkforme Shadow-Lurker Pack Alpha.webp", attacks: [ { name: 'Claw', damage: 9 }, { name: 'Bite', damage: 8 } ] },
    { name: "Dark Dimension Matronbot", hp: 104, attack: 26, defense: 26, cr: 5, weaknesses: [], image: "src/assets/images/Monsters/matronbot_bria.webp", attacks: [ { name: 'Diaper Grappler', damage: 12 }, { name: 'Punishment Rod', damage: 15 } ] },
    { name: "Darkling-Nightshade Elemental", hp: 36, attack: 20, defense: 22, cr: 2, weaknesses: [], image: "src/assets/images/Monsters/darkling-nightshade-elemental.webp", attacks: [ { name: 'Shadow Blast', damage: 11 } ] },
    { name: "Darkforme-Hungore", hp: 42, attack: 20, defense: 24, cr: 2.5, weaknesses: ['light'], image: "src/assets/images/Monsters/darkforme-hungore.webp", attacks: [ { name: 'Ventral Maw', damage: 9 } ] },
    { name: "The Darkformless", hp: 120, attack: 40, defense: 40, cr: 5, weaknesses: ['light'], image: "src/assets/images/Monsters/the-darkformless.png", attacks: [ { name: 'Shadow Bolt', damage: 12 }, { name: 'Umbral Blast', damage: 10 } ] },
    // Additional monsters from bestiary with local images
    { name: "Bottle Beast", hp: 48, attack: 22, defense: 20, cr: 2, weaknesses: ['earth'], image: "src/assets/images/Monsters/bottlebeast.webp", attacks: [ { name: 'Bottle Slam', damage: 10 }, { name: 'Cork Pop', damage: 8 } ] },
    { name: "Bottle Elemental", hp: 32, attack: 18, defense: 22, cr: 1.5, weaknesses: ['earth'], image: "src/assets/images/Monsters/bottleelemental.webp", attacks: [ { name: 'Liquid Jet', damage: 8 }, { name: 'Glass Shard', damage: 9 } ] },
    { name: "Ghostiby", hp: 16, attack: 12, defense: 35, cr: 0.5, weaknesses: ['light'], image: "src/assets/images/Monsters/ghostiby.webp", attacks: [ { name: 'Spectral Touch', damage: 6 }, { name: 'Frightening Wail', damage: 5 } ] },
    { name: "Pacifier Golem", hp: 85, attack: 25, defense: 18, cr: 3, weaknesses: ['fire'], image: "src/assets/images/Monsters/pacifiergolem.webp", attacks: [ { name: 'Soothing Slam', damage: 12 }, { name: 'Pacifying Aura', damage: 8 } ] },
    { name: "River Tyrant", hp: 120, attack: 32, defense: 28, cr: 4, weaknesses: ['lightning'], image: "src/assets/images/Monsters/rivertyrant.webp", attacks: [ { name: 'Tidal Crash', damage: 15 }, { name: 'Whirlpool Drag', damage: 12 } ] },
    { name: "Sentient Crib", hp: 75, attack: 20, defense: 25, cr: 2.5, weaknesses: ['fire'], image: "src/assets/images/Monsters/sentientcrib.webp", attacks: [ { name: 'Rocking Slam', damage: 11 }, { name: 'Lullaby Drain', damage: 9 } ] },
    { name: "Teddy Bombination", hp: 28, attack: 24, defense: 16, cr: 1.5, weaknesses: ['fire'], image: "src/assets/images/Monsters/teddybombination.webp", attacks: [ { name: 'Cuddle Bomb', damage: 12 }, { name: 'Fluff Explosion', damage: 10 } ] },
    { name: "Diaper Check Bot", hp: 40, attack: 15, defense: 30, cr: 1, weaknesses: ['lightning'], image: "src/assets/images/Monsters/diapercheckbot.webp", attacks: [ { name: 'Scanner Beam', damage: 7 }, { name: 'Mechanical Grab', damage: 9 } ] },
    { name: "Matronbot", hp: 65, attack: 28, defense: 22, cr: 2.5, weaknesses: ['lightning'], image: "src/assets/images/Monsters/matronbot.webp", attacks: [ { name: 'Disciplinary Strike', damage: 11 }, { name: 'Authority Command', damage: 13 } ] },
    { name: "Nanny Bot Matron", hp: 90, attack: 30, defense: 26, cr: 3.5, weaknesses: ['lightning'], image: "src/assets/images/Monsters/nannybotmatron.webp", attacks: [ { name: 'Caregiving Crush', damage: 14 }, { name: 'Protective Swipe', damage: 12 } ] },
    { name: "Bellyacher", hp: 20, attack: 14, defense: 18, cr: 0.5, weaknesses: ['light'], image: "src/assets/images/Monsters/bellyacher.webp", attacks: [ { name: 'Whining Wail', damage: 6 }, { name: 'Tantrum Flail', damage: 8 } ] },
    { name: "Enforcer", hp: 95, attack: 35, defense: 28, cr: 4, weaknesses: ['light'], image: "src/assets/images/Monsters/enforcer.webp", attacks: [ { name: 'Authority Strike', damage: 16 }, { name: 'Discipline Beam', damage: 14 } ] },
    { name: "Bracklings", hp: 35, attack: 20, defense: 24, cr: 1.5, weaknesses: ['light'], image: "src/assets/images/Monsters/bracklings.webp", attacks: [ { name: 'Swarm Attack', damage: 9 }, { name: 'Tendril Mass', damage: 11 } ] },
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
    { name: "Darkling-Ossuite Charger Omega", hp: 220, attack: 55, defense: 70, cr: 7, weaknesses: normWeak(['radiant','earth']), image: "src/assets/images/Monsters/darkling-ossuite-charger.webp", attacks: [ { name: 'Lance Strike', damage: 18 }, { name: 'Hoof Stomp', damage: 12 }, { name: 'Tendril Arrow', damage: 10 } ] },
    { name: "Chap'Hell", hp: 260, attack: 65, defense: 80, cr: 9, weaknesses: normWeak(['light','fire']), attackFrequency: 1.5, image: "src/assets/images/Monsters/chaphell.webp", attacks: [ { name: 'Bone Slam', damage: 20 }, { name: 'Bone Rake', damage: 14 }, { name: 'Black Ooze Cannon', damage: 18 } ] },
    { name: "Lakeopus Rex", hp: 300, attack: 70, defense: 85, cr: 10, weaknesses: normWeak(['radiant','wind']), attackFrequency: 1.5, image: "src/assets/images/Monsters/lakeopus_rex.webp", attacks: [ { name: 'Crushing Bite', damage: 25 }, { name: 'Tentacle', damage: 18 }, { name: 'Abyssal Wave', damage: 20 } ] },
    { name: "Nightmare Sire Reaver", hp: 500, attack: 75, defense: 90, cr: 10, weaknesses: normWeak(['light','wind']), attackFrequency: 1.5, image: "src/assets/images/Pagematerials/sire_reaver.webp", attacks: [ { name: 'Lance of Shadows', damage: 30 }, { name: 'Hooves', damage: 18 }, { name: 'Shadow Charge', damage: 22 } ] },
    { name: "Night-Mare Shadowstorm", hp: 400, attack: 55, defense: 65, cr: 9, weaknesses: normWeak(['light','earth']), attackFrequency: 1.5, image: "src/assets/images/Monsters/shadowstorm.webp", attacks: [ { name: 'Lance of Dusk', damage: 20 }, { name: 'Hoof Stomp', damage: 23 }, { name: 'Charging Trample', damage: 28 }, { name: 'Shadowy Tendrils', damage: 35 } ] },
    { name: "Shadow Slimepress", hp: 1000, attack: 80, defense: 90, cr: 13, weaknesses: normWeak(['fire','lightning']), attackFrequency: 1.5, image: "src/assets/images/Monsters/slimepress.webp", attacks: [ { name: 'Pseudopod Lash', damage: 25 }, { name: 'Engulf', damage: 40 }, { name: 'Demanding Decree', damage: 45 } ] },
    // Additional boss-level monsters from bestiary
    { name: "Dark Dimension Rift", hp: 350, attack: 70, defense: 75, cr: 11, weaknesses: normWeak(['light','wind']), attackFrequency: 1.5, image: "src/assets/images/Monsters/darkdimensionrift.webp", attacks: [ { name: 'Void Tear', damage: 28 }, { name: 'Dimensional Pull', damage: 22 }, { name: 'Reality Warp', damage: 35 } ] },
    { name: "Darkforme Ossuarian", hp: 280, attack: 65, defense: 70, cr: 8, weaknesses: normWeak(['light','earth']), attackFrequency: 1.5, image: "src/assets/images/Monsters/darkforme-ossuarian.webp", attacks: [ { name: 'Bone Spear', damage: 20 }, { name: 'Skeletal Grasp', damage: 24 }, { name: 'Marrow Drain', damage: 18 } ] },
    { name: "Darkforme Spinebearer", hp: 320, attack: 68, defense: 82, cr: 9, weaknesses: normWeak(['light','fire']), attackFrequency: 1.5, image: "src/assets/images/Monsters/darkforme-spinebearer.webp", attacks: [ { name: 'Spine Lance', damage: 26 }, { name: 'Thorn Barrage', damage: 22 }, { name: 'Piercing Charge', damage: 30 } ] },
    { name: "Darkforme Suffocator", hp: 250, attack: 60, defense: 78, cr: 7.5, weaknesses: normWeak(['wind','light']), attackFrequency: 1.5, image: "src/assets/images/Monsters/darkforme-suffocator.webp", attacks: [ { name: 'Strangling Grip', damage: 24 }, { name: 'Breath Steal', damage: 18 }, { name: 'Crushing Embrace', damage: 28 } ] },
    { name: "Darkforme Nightpinyon", hp: 220, attack: 55, defense: 65, cr: 6.5, weaknesses: normWeak(['lightning','wind']), attackFrequency: 1.5, image: "src/assets/images/Monsters/darkforme-nightpinyon.webp", attacks: [ { name: 'Shadow Dive', damage: 20 }, { name: 'Night Strike', damage: 18 }, { name: 'Darkness Shroud', damage: 22 } ] },
  ];

  // Export in browser global
  global.monsters = monsters;
  global.bossMonsters = bossMonsters;
})(window);
