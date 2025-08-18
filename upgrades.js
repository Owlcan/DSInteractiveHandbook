// Upgrades definition extracted from diaperclicker.html
// Loaded before the main game script. Provides global UpgradeDefs.

// Helper to create an emoji-based square icon as a data-URI SVG
// Keeps consistency with the 76px tile size used in the UI
const emojiIcon = (emoji) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\
<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76">\
  <rect x="0" y="0" width="76" height="76" rx="12" ry="12" fill="#1c160b"/>\
  <text x="38" y="44" text-anchor="middle" dominant-baseline="middle" font-size="52">${emoji}</text>\
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

const UpgradeDefs = [
  // Gate: Advanced Diaperology — unlocks advanced toggle suite
  {
    id: 'advanced-diaperology', name: 'Advanced Diaperology', cost: 5_000_000_000, img: 'src/assets/images/logo.png',
    text: 'Foundational breakthroughs in diaper science. Unlocks advanced toggle abilities.',
    unlock: (s) => (s.units['universities']?.level || 0) >= 1,
    effect: (s) => { /* serves as gate for toggles */ },
  },

  // Advanced Toggles (require Advanced Diaperology)
  // Note: Toggle tiles are not permanently owned; clicking the tile toggles ON/OFF with cooldowns handled in main script
  {
    id: 'ghostly-pacts', name: 'Ghostly Pacts', img: emojiIcon('👻'), type: 'toggle', key: 'ghostly-pacts', cooldownMs: 2*60*1000,
    text: 'Clicking +300% power, but idle -50% while you are clicking.',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['click-power']?.level || 0) >= 25,
    effect: ()=>{},
  },
  {
    id: 'hyperbliminal', name: 'Hyperbliminal Diaper Messaging', img: emojiIcon('🧠'), type: 'toggle', key: 'hyperbliminal', cooldownMs: 2*60*1000,
    text: "Boost idle income, but if you buy any unit that isn't Media or Ministries, you incur -30% idle for 20 minutes.",
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && ((s.units['media']?.level || 0) >= 10 || (s.units['ministries']?.level || 0) >= 10),
    effect: ()=>{},
  },
  {
    id: 'global-indoctrination', name: 'Global Indoctrination Changing Stations', img: emojiIcon('🚻'), type: 'toggle', key: 'global-indoctrination', cooldownMs: 10*60*1000,
    text: 'Disable clicking, triple idle, and reduce upgrade costs by 5% while active. 10m cooldown.',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['ministries']?.level || 0) >= 25,
    effect: ()=>{},
  },
  {
    id: 'militarized-pampolice', name: 'Militarized & Obvious Diapolice', img: emojiIcon('🚔'), type: 'toggle', key: 'militarized-pampolice', cooldownMs: 2*60*1000,
    text: 'Pampolice +200% DPS +1% per 10 levels; costs 10% of current Butts to activate. Buying Pampolice may trigger 5m -80% idle backlash (90% chance).',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['pampolice']?.level || 0) >= 10,
    effect: ()=>{},
  },
  {
    id: 'crinkle-tax', name: 'Crinkle Tax', img: emojiIcon('💰'), type: 'toggle', key: 'crinkle-tax', cooldownMs: 2*60*1000,
    text: 'Clicks have a growing chance to become golden as Diapocratic levels rise. Pampublic referendums can halve click power for 10m.',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['diapocratic']?.level || 0) >= 10,
    effect: ()=>{},
  },
  {
    id: 'nannybot-autonomy', name: 'Nannybot Autonomy', img: emojiIcon('🤖'), type: 'toggle', key: 'nannybot-autonomy', cooldownMs: 2*60*1000,
    text: 'Nannybots fluctuate between 50% and 150% output while active.',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['nannybots']?.level || 0) >= 10,
    effect: ()=>{},
  },
  {
    id: 'pampul-canon', name: 'Pampul Canon', img: emojiIcon('🕯️'), type: 'toggle', key: 'pampul-canon', cooldownMs: 2*60*1000,
    text: 'All non-Church units +1% DPS per Church level, but clicking weakens slightly with total levels.',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['churches']?.level || 0) >= 10,
    effect: ()=>{},
  },
  {
    id: 'volatile-markets', name: 'Volatile Markets', img: emojiIcon('📈'), type: 'toggle', key: 'volatile-markets', cooldownMs: 2*60*1000,
    text: 'Buying or selling Factories can randomly cause 1m market surges or dips.',
    unlock: (s) => s.upgradesBought['advanced-diaperology'] && (s.units['factories']?.level || 0) >= 10,
    effect: ()=>{},
  },
  {
    id: 'blind-science', name: 'Blind Me With Science!', img: emojiIcon('🔬'), type: 'toggle', key: 'blind-science', cooldownMs: 2*60*1000,
    text: 'Toggle a light-brown “lab mode” theme. Costs 1 butt on first activation.',
    // Unlock once all other advanced toggles are unlocked
    unlock: (s) => {
      if (!s.upgradesBought['advanced-diaperology']) return false;
      const required = ['ghostly-pacts','hyperbliminal','global-indoctrination','militarized-pampolice','crinkle-tax','nannybot-autonomy','pampul-canon','volatile-markets'];
      return required.every(id => {
        // Mirrors each toggle’s unlock function conditions
        switch(id){
          case 'ghostly-pacts': return (s.units['click-power']?.level||0) >= 25;
          case 'hyperbliminal': return (s.units['media']?.level||0) >= 10 || (s.units['ministries']?.level||0) >= 10;
          case 'global-indoctrination': return (s.units['ministries']?.level||0) >= 25;
          case 'militarized-pampolice': return (s.units['pampolice']?.level||0) >= 10;
          case 'crinkle-tax': return (s.units['diapocratic']?.level||0) >= 10;
          case 'nannybot-autonomy': return (s.units['nannybots']?.level||0) >= 10;
          case 'pampul-canon': return (s.units['churches']?.level||0) >= 10;
          case 'volatile-markets': return (s.units['factories']?.level||0) >= 10;
          default: return false;
        }
      });
    },
    effect: ()=>{},
  },
  {
    id: 'plasticizer', name: 'Plasticizer', cost: 5_000, img: 'src/assets/images/Plasticizer.png',
    text: 'Improved plastic backing. +20% global DPS.',
    unlock: (s) => s.total >= 2_500, effect: (s) => s.multipliers.global *= 1.2,
  },
  // Ghost Hands tiered (Click Power milestones)
  { id: 'ghost-hands-i', name: 'Ghost Hands I', cost: 15_000, img: 'src/assets/images/expeditionandgames/diaperclicker/blueghosthands.webp',
    text: 'Ethereal assistance guides your clicks. +50% Per Click. (Req: Click Power Lv10)',
    unlock: (s) => s.units['click-power'].level >= 10, effect: (s) => s.multipliers.perClick *= 1.5 },
  { id: 'ghost-hands-ii', name: 'Ghost Hands II', cost: 250_000, img: 'src/assets/images/expeditionandgames/diaperclicker/redghosthands.webp',
    text: 'More hands, faster taps. +75% Per Click. (Req: Click Power Lv25)',
    unlock: (s) => s.units['click-power'].level >= 25, effect: (s) => s.multipliers.perClick *= 1.75 },
  { id: 'ghost-hands-iii', name: 'Ghost Hands III', cost: 8_000_000, img: 'src/assets/images/expeditionandgames/diaperclicker/greenghosthands.webp',
    text: 'A chorus of clicks. +100% Per Click. (Req: Click Power Lv50)',
    unlock: (s) => s.units['click-power'].level >= 50, effect: (s) => s.multipliers.perClick *= 2.0 },
  { id: 'ghost-hands-iv', name: 'Ghost Handlers', cost: 200_000_000, img: 'src/assets/images/expeditionandgames/diaperclicker/ghosthandlers.webp',
    text: 'Not just hands anymore, full on ghostly assistance. +150% Per Click. (Req: Click Power Lv100)',
    unlock: (s) => s.units['click-power'].level >= 100, effect: (s) => s.multipliers.perClick *= 2.5 },

  // Final corner (appears after Handlers)
  { id: 'digihands', name: 'Digihands', cost: 1_200_000_000, img: 'src/assets/images/expeditionandgames/diaperclicker/digihands.webp',
    text: "huh, there's that corner, guess it was glitched! +200% Per Click. (Req: Click Power Lv120)",
    unlock: (s) => s.units['click-power'].level >= 120, effect: (s) => s.multipliers.perClick *= 3.0 },

  // Improved Nannybots tiered (Nannybots milestones)
  { id: 'nannybots-i', name: 'Improved Nannybots I', cost: 60_000, img: 'src/assets/images/Monsters/nannybotmatron.webp',
    text: 'Firmware boosts bot efficiency. Nannybots DPS +50%. (Req: Nannybots Lv10)',
    unlock: (s) => s.units['nannybots'].level >= 10, effect: (s) => s.multipliers.units['nannybots'] = (s.multipliers.units['nannybots']||1) * 1.5 },
  { id: 'nannybots-ii', name: 'Improved Nannybots II', cost: 900_000, img: 'src/assets/images/Monsters/matronbot.webp',
    text: 'Optimized pathing and batching. Nannybots DPS +75%. (Req: Nannybots Lv25)',
    unlock: (s) => s.units['nannybots'].level >= 25, effect: (s) => s.multipliers.units['nannybots'] = (s.multipliers.units['nannybots']||1) * 1.75 },
  { id: 'nannybots-iii', name: 'Improved Nannybots III', cost: 18_000_000, img: 'src/assets/images/Monsters/matronbot.webp',
    text: 'Hardware refit and better sensors. Nannybots DPS +100%. (Req: Nannybots Lv50)',
    unlock: (s) => s.units['nannybots'].level >= 50, effect: (s) => s.multipliers.units['nannybots'] = (s.multipliers.units['nannybots']||1) * 2.0 },
  { id: 'nannybots-iv', name: 'Improved Nannybots IV', cost: 350_000_000, img: 'src/assets/images/Monsters/matronbot.webp',
    text: 'Next-gen cores and instant routing. Nannybots DPS +150%. (Req: Nannybots Lv100)',
    unlock: (s) => s.units['nannybots'].level >= 100, effect: (s) => s.multipliers.units['nannybots'] = (s.multipliers.units['nannybots']||1) * 2.5 },

  // Factories
  { id: 'factories-i', name: 'Factory Automation I', cost: 450_000, img: emojiIcon('⚙️'),
    text: 'Streamlined lines. Factories DPS +50%. (Req: Factories Lv10)',
    unlock: (s) => s.units['factories'].level >= 10, effect: (s) => s.multipliers.units['factories'] = (s.multipliers.units['factories']||1) * 1.5 },
  { id: 'factories-ii', name: 'Factory Automation II', cost: 6_500_000, img: emojiIcon('⚙️'),
    text: 'Robotics upgrade. Factories DPS +75%. (Req: Factories Lv25)',
    unlock: (s) => s.units['factories'].level >= 25, effect: (s) => s.multipliers.units['factories'] = (s.multipliers.units['factories']||1) * 1.75 },
  { id: 'factories-iii', name: 'Factory Automation III', cost: 120_000_000, img: emojiIcon('⚙️'),
    text: 'Full automation. Factories DPS +100%. (Req: Factories Lv50)',
    unlock: (s) => s.units['factories'].level >= 50, effect: (s) => s.multipliers.units['factories'] = (s.multipliers.units['factories']||1) * 2.0 },
  { id: 'factories-iv', name: 'Factory Automation IV', cost: 2_100_000_000, img: emojiIcon('⚙️'),
    text: 'Self-healing lines. Factories DPS +150%. (Req: Factories Lv100)',
    unlock: (s) => s.units['factories'].level >= 100, effect: (s) => s.multipliers.units['factories'] = (s.multipliers.units['factories']||1) * 2.5 },

  // Media
  { id: 'media-i', name: 'Ratings Boost I', cost: 3_500_000, img: emojiIcon('📈'),
    text: 'Prime time slot. Media DPS +50%. (Req: Media Lv10)',
    unlock: (s) => s.units['media'].level >= 10, effect: (s) => s.multipliers.units['media'] = (s.multipliers.units['media']||1) * 1.5 },
  { id: 'media-ii', name: 'Ratings Boost II', cost: 55_000_000, img: emojiIcon('📈'),
    text: 'Franchise spinoff. Media DPS +75%. (Req: Media Lv25)',
    unlock: (s) => s.units['media'].level >= 25, effect: (s) => s.multipliers.units['media'] = (s.multipliers.units['media']||1) * 1.75 },
  { id: 'media-iii', name: 'Ratings Boost III', cost: 900_000_000, img: emojiIcon('📈'),
    text: 'Global syndication. Media DPS +100%. (Req: Media Lv50)',
    unlock: (s) => s.units['media'].level >= 50, effect: (s) => s.multipliers.units['media'] = (s.multipliers.units['media']||1) * 2.0 },
  { id: 'media-iv', name: 'Ratings Boost IV', cost: 16_000_000_000, img: emojiIcon('📈'),
    text: 'Algorithmic dominance. Media DPS +150%. (Req: Media Lv100)',
    unlock: (s) => s.units['media'].level >= 100, effect: (s) => s.multipliers.units['media'] = (s.multipliers.units['media']||1) * 2.5 },

  // Ministries
  { id: 'ministries-i', name: 'Policy Push I', cost: 23_000_000, img: emojiIcon('📜'),
    text: 'White paper cascade. Ministries DPS +50%. (Req: Ministries Lv10)',
    unlock: (s) => s.units['ministries'].level >= 10, effect: (s) => s.multipliers.units['ministries'] = (s.multipliers.units['ministries']||1) * 1.5 },
  { id: 'ministries-ii', name: 'Policy Push II', cost: 380_000_000, img: emojiIcon('📜'),
    text: 'Regulatory nudge. Ministries DPS +75%. (Req: Ministries Lv25)',
    unlock: (s) => s.units['ministries'].level >= 25, effect: (s) => s.multipliers.units['ministries'] = (s.multipliers.units['ministries']||1) * 1.75 },
  { id: 'ministries-iii', name: 'Policy Push III', cost: 6_200_000_000, img: emojiIcon('📜'),
    text: 'Mandate harmonization. Ministries DPS +100%. (Req: Ministries Lv50)',
    unlock: (s) => s.units['ministries'].level >= 50, effect: (s) => s.multipliers.units['ministries'] = (s.multipliers.units['ministries']||1) * 2.0 },
  { id: 'ministries-iv', name: 'Policy Push IV', cost: 110_000_000_000, img: emojiIcon('📜'),
    text: 'Soft standardization. Ministries DPS +150%. (Req: Ministries Lv100)',
    unlock: (s) => s.units['ministries'].level >= 100, effect: (s) => s.multipliers.units['ministries'] = (s.multipliers.units['ministries']||1) * 2.5 },

  // Pampolice
  { id: 'pampolice-i', name: 'Compliance Drive I', cost: 210_000_000, img: 'src/assets/images/Designer%20(88).png',
    text: 'Friendly checks. Pampolice DPS +50%. (Req: Pampolice Lv10)',
    unlock: (s) => s.units['pampolice'].level >= 10, effect: (s) => s.multipliers.units['pampolice'] = (s.multipliers.units['pampolice']||1) * 1.5 },
  { id: 'pampolice-ii', name: 'Compliance Drive II', cost: 3_300_000_000, img: 'src/assets/images/Designer%20(88).png',
    text: 'Better outreach. Pampolice DPS +75%. (Req: Pampolice Lv25)',
    unlock: (s) => s.units['pampolice'].level >= 25, effect: (s) => s.multipliers.units['pampolice'] = (s.multipliers.units['pampolice']||1) * 1.75 },
  { id: 'pampolice-iii', name: 'Compliance Drive III', cost: 55_000_000_000, img: 'src/assets/images/Designer%20(88).png',
    text: 'Rapid response. Pampolice DPS +100%. (Req: Pampolice Lv50)',
    unlock: (s) => s.units['pampolice'].level >= 50, effect: (s) => s.multipliers.units['pampolice'] = (s.multipliers.units['pampolice']||1) * 2.0 },
  { id: 'pampolice-iv', name: 'Compliance Drive IV', cost: 920_000_000_000, img: 'src/assets/images/Designer%20(88).png',
    text: 'Ubiquitous presence. Pampolice DPS +150%. (Req: Pampolice Lv100)',
    unlock: (s) => s.units['pampolice'].level >= 100, effect: (s) => s.multipliers.units['pampolice'] = (s.multipliers.units['pampolice']||1) * 2.5 },

  // Diapocratic States
  { id: 'diapocratic-i', name: 'Ballot Blitz I', cost: 1_800_000_000, img: 'src/assets/images/logo.png',
    text: 'Turnout surge. Diapocratic DPS +50%. (Req: Diapocratic Lv10)',
    unlock: (s) => s.units['diapocratic'].level >= 10, effect: (s) => s.multipliers.units['diapocratic'] = (s.multipliers.units['diapocratic']||1) * 1.5 },
  { id: 'diapocratic-ii', name: 'Ballot Blitz II', cost: 29_000_000_000, img: 'src/assets/images/logo.png',
    text: 'Policy alignment. Diapocratic DPS +75%. (Req: Diapocratic Lv25)',
    unlock: (s) => s.units['diapocratic'].level >= 25, effect: (s) => s.multipliers.units['diapocratic'] = (s.multipliers.units['diapocratic']||1) * 1.75 },
  { id: 'diapocratic-iii', name: 'Ballot Blitz III', cost: 470_000_000_000, img: 'src/assets/images/logo.png',
    text: 'Regional consolidation. Diapocratic DPS +100%. (Req: Diapocratic Lv50)',
    unlock: (s) => s.units['diapocratic'].level >= 50, effect: (s) => s.multipliers.units['diapocratic'] = (s.multipliers.units['diapocratic']||1) * 2.0 },
  { id: 'diapocratic-iv', name: 'Ballot Blitz IV', cost: 7_800_000_000_000, img: 'src/assets/images/logo.png',
    text: 'Global coalition. Diapocratic DPS +150%. (Req: Diapocratic Lv100)',
    unlock: (s) => s.units['diapocratic'].level >= 100, effect: (s) => s.multipliers.units['diapocratic'] = (s.multipliers.units['diapocratic']||1) * 2.5 },

  // Churches
  { id: 'churches-i', name: 'Choir of Comfort I', cost: 14_000_000_000, img: 'src/assets/images/Designer%20(91).png',
    text: 'Sunday messaging. Churches DPS +50%. (Req: Churches Lv10)',
    unlock: (s) => s.units['churches'].level >= 10, effect: (s) => s.multipliers.units['churches'] = (s.multipliers.units['churches']||1) * 1.5 },
  { id: 'churches-ii', name: 'Choir of Comfort II', cost: 230_000_000_000, img: 'src/assets/images/Designer%20(91).png',
    text: 'Parish network. Churches DPS +75%. (Req: Churches Lv25)',
    unlock: (s) => s.units['churches'].level >= 25, effect: (s) => s.multipliers.units['churches'] = (s.multipliers.units['churches']||1) * 1.75 },
  { id: 'churches-iii', name: 'Choir of Comfort III', cost: 3_800_000_000_000, img: 'src/assets/images/Designer%20(91).png',
    text: 'Pilgrimage boom. Churches DPS +100%. (Req: Churches Lv50)',
    unlock: (s) => s.units['churches'].level >= 50, effect: (s) => s.multipliers.units['churches'] = (s.multipliers.units['churches']||1) * 2.0 },
  { id: 'churches-iv', name: 'Choir of Comfort IV', cost: 62_000_000_000_000, img: 'src/assets/images/Designer%20(91).png',
    text: 'Universal sermon. Churches DPS +150%. (Req: Churches Lv100)',
    unlock: (s) => s.units['churches'].level >= 100, effect: (s) => s.multipliers.units['churches'] = (s.multipliers.units['churches']||1) * 2.5 },

  // Dyes & special upgrades
  {
    id: 'black-dye', name: 'Dark Essence Dye', cost: 40_000, img: 'src/assets/images/Darkessence.webp',
    text: 'Black diapers: stylish and persuasive. +30% Click Power.',
    unlock: (s) => s.total >= 20_000, effect: (s) => s.multipliers.perClick *= 1.3,
  },
  {
    id: 'pink-dye', name: 'Shimmering Pink Dye', cost: 6_000_000, img: 'src/assets/images/shimmeringdust.png',
    text: 'Sparkly pinks that pop. +40% Per Click. Unlocks Pink diapers.',
    unlock: (s) => s.total >= 6_000_000, effect: (s) => s.multipliers.perClick *= 1.4,
  },
  {
    id: 'pup-dye', name: 'Pup Pamps License', cost: 200_000_000, img: 'src/assets/images/expeditionandgames/diaperclicker/puppamps.webp',
    text: 'Official license to produce Pup Pamps. Unlocks Pup diapers.',
    unlock: (s) => s.total >= 20_000_000, effect: (s) => {},
  },
  {
    id: 'holy-dye', name: 'Holy Anointment', cost: 1_000_000_000, img: 'src/assets/images/expeditionandgames/diaperclicker/holydiaper.webp',
    text: 'Blessed materials sanctioned for Holy diapers. Unlocks Holy diapers.',
    unlock: (s) => s.total >= 100_000_000, effect: (s) => {},
  },

  {
    id: 'brand-sponsor', name: 'Brand Sponsorship', cost: 250_000, img: 'src/assets/images/logo.png',
    text: 'Top brand partnership. +15% to Media & Ministries.',
    unlock: (s) => s.units.media.level >= 3 || s.units.ministries.level >= 3,
    effect: (s) => { s.multipliers.units.media *= 1.15; s.multipliers.units.ministries *= 1.15; },
  },
  {
    id: 'darkling-workers', name: 'Darkling Workers', cost: 50_000_000, img: 'src/assets/images/darkling-cactine-biggo-boy.png',
    text: 'Summon darklings to speed production. Starts a special timer; +25% global DPS.',
    unlock: (s) => s.total >= 4_000_000_000, effect: (s) => { s.flags.darklingStart = s.now(); s.multipliers.global *= 1.25; },
  },
  {
    id: 'subliminal-anime', name: 'Subliminal Diaper Anime', cost: 5_000_000, img: 'src/assets/images/expeditionandgames/diaperclicker/subliminaldiapers.webp',
    text: 'In the name of the Crinkle, I will diaper YOU!. +50% Per Click.',
    unlock: (s) => s.units.media.level >= 5, effect: (s) => s.multipliers.perClick *= 1.5,
  },
  // Media-Ministry synergy appears as an upgrade
  {
    id: 'echo-chamber', name: 'Echo Chamber (Synergy)', cost: 10_000_000, img: 'src/assets/images/Designer%20-%202025-03-27T154920.437.png',
    text: 'Media x Ministry synergy: +50% to both when both are Lv10.',
    unlock: (s) => s.units.media.level >= 10 && s.units.ministries.level >= 10,
    effect: (s) => { s.flags.synergy_echo = true; s.multipliers.units.media *= 1.5; s.multipliers.units.ministries *= 1.5; },
  },
];
