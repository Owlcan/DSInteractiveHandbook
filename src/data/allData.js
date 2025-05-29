/**
 * Simplified data file for the Interactive Handbook
 * This file contains just items and monsters data
 */

// Items data
const itemsData = [
  {
    name: "Adhesive",
    value: "12 VRP",
    type: "Ingredient (Essence)",
    description: "A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.",
    location: "Greensea Forest, Lissome Plains",
    rarity: "Common",
    image: "assets/images/Adhesive.png"
  },
  {
    name: "Azure Harvest Blue Moon Ice Cream",
    value: "250 VRP",
    type: "Crafted (Food Legendary)",
    description: "Some say they taste citrus, others swear there are hints of custard and aromatics—and yet still more profess their belief it tastes like the platonic ideal of blue children's modeling clay. All agree it is one of the best iced confections ever created.",
    rarity: "Legendary",
    image: "assets/images/Azure Harvest Blue Moon Ice Cream.png"
  },
  {
    name: "Azure Moon Cream",
    value: "250 VRP",
    type: "Ingredient (Legendary)",
    description: "Legendary cream harvested under a blue moon. Glows with ethereal light.",
    location: "Greensea Forest",
    rarity: "Legendary",
    image: "assets/images/Azure Moon Cream.png"
  },
  {
    name: "Barkgum",
    value: "7 VRP",
    type: "Ingredient (Botanical)",
    description: "A sticky and rubbery organic compound refined from the sap of certain trees. Used as a base for products from chewing gum to glue and rubber.",
    location: "Greensea Forest",
    rarity: "Common",
    image: "assets/images/Barkgum.png"
  },
  {
    name: "Berrimaters",
    value: "5 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "Small, round, savory and sweet—these cherry‑red delights are awfully fun to eat and pair well with many treats.",
    location: "Greensea Forest",
    rarity: "Common",
    image: "assets/images/Berrimaters.png"
  },
  {
    name: "Birch Syrup",
    value: "35 VRP",
    type: "Ingredient (Food, Botanical)",
    description: "A rare syrup tapped from ancient, enchanted birch trees; each drop resonates with the forest's whispered secrets.",
    rarity: "Uncommon",
    image: "assets/images/Birch Syrup.bak.png"
  },
  {
    name: "Butter",
    value: "5 VRP",
    type: "Crafted (Food)",
    description: "Smooth, creamy butter, perfect for cooking.",
    rarity: "Common",
    image: "assets/images/Butter.png"
  },
  {
    name: "Chromatic Platinum",
    value: "250 VRP",
    type: "Ingredient (Legendary, Metal)",
    description: "A resplendent metal alloy imbued with shifting prismatic hues, radiating a subtle magical aura.",
    rarity: "Legendary",
    image: "assets/images/Chromatic Platinum.png"
  },
  {
    name: "Cream",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Fresh dairy cream, essential for making ice cream and other desserts.",
    rarity: "Common",
    image: "assets/images/Cream.png"
  },
  {
    name: "Darkessence",
    value: "250 VRP",
    type: "Ingredient (Legendary, Essence)",
    description: "A mysterious, shadow‑infused essence that exudes an aura of hidden power, often employed in dark magical rites.",
    rarity: "Legendary",
    image: "assets/images/Darkessence.png"
  },
  {
    name: "Defractor Prism",
    value: "35 VRP",
    type: "Ingredient (Rare)",
    description: "Differentiates magical, material, and chemical processes, allowing for the breakdown of materials into their components.",
    rarity: "Rare",
    image: "assets/images/Defractor Prism.png"
  },
  {
    name: "Distillation of a Night Sky",
    value: "250 VRP",
    type: "Ingredient (Legendary, Essence)",
    description: "The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.",
    location: "Dracespire Mountain Range, Lissome Plains, Greensea Forest, Campus (Extremely Rare)",
    rarity: "Legendary",
    image: "assets/images/Distillation of a Night Sky.png"
  },
  {
    name: "Dreamvapor",
    value: "250 VRP",
    type: "Ingredient (Legendary, Essence)",
    description: "An ephemeral mist carrying the scents of lavender and lost lullabies, slipping away like a fragment of a fading dream.",
    rarity: "Legendary",
    image: "assets/images/Dreamvapor.png"
  },
  {
    name: "Egg",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "A common binding agent used in cooking and baking.",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/Egg.png"
  },
  {
    name: "Flavor Matrix",
    value: "250 VRP",
    type: "Ingredient (Legendary)",
    description: "Made from the distillation of Candy Elemental, this crystallized flavor matrix radically expands the flavor profile of many food items—and can even unlock hidden potential.",
    rarity: "Legendary",
    image: "assets/images/flavor matrix.png"
  },
  {
    name: "Fractal Copper",
    value: "7 VRP",
    type: "Ingredient (Metal)",
    description: "A mysterious, ever‑fractalizing metal whose intricate patterns appear only under the full moon's light.",
    rarity: "Common",
    image: "assets/images/Fractal Copper.png"
  },
  {
    name: "Flour",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "A finely milled powder ground from high-quality grains, known for its versatile binding properties and delicate, neutral flavor.",
    rarity: "Common",
    image: "assets/images/Flour.png"
  },
  {
    name: "Glimmelectrum",
    value: "7 VRP",
    type: "Ingredient (Metal)",
    description: "A radiant, mysterious alloy that hums with magical energy, capturing and reflecting light in mesmerizing patterns.",
    rarity: "Common",
    image: "assets/images/Glimmelectrum.png"
  },
  {
    name: "Health Potion",
    value: "5 VRP",
    type: "Crafted (Potion)",
    description: "A basic healing potion that restores vitality.",
    rarity: "Common",
    image: "assets/images/healthpotion.png"
  },
  {
    name: "Herb Butter",
    value: "5 VRP",
    type: "Crafted (Food)",
    description: "Butter infused with aromatic herbs.",
    rarity: "Common",
    image: "assets/images/Herb Butter.png"
  },
  {
    name: "Jadicine",
    value: "12 VRP",
    type: "Ingredient (Exotic)",
    description: "A translucent green substance, rumored to be distilled from the tears of a jade dragon, soothing the mind and mending wounds.",
    rarity: "Uncommon",
    image: "assets/images/Jadicine.png"
  },
  {
    name: "Liquid Pain",
    value: "250 VRP",
    type: "Ingredient (Legendary, Food, Essence)",
    description: "A shifting, blood‑red fluid pulsing as though alive, harvested from the shattered hearts of fiends—dangerous, potent, and steeped in dark magic.",
    rarity: "Legendary",
    image: "assets/images/Liquid Pain.png"
  },
  {
    name: "Lovely Diaper",
    value: "7 VRP",
    type: "Crafted (Textile Crafted)",
    description: "D'awwww! Isn't that sweet. A token meant to show just how much you want to keep someone safe.",
    rarity: "Common",
    image: "assets/images/Lovely Diaper.png"
  },
  {
    name: "Lunar‑Dodo Egg",
    value: "250 VRP",
    type: "Ingredient (Legendary, Food)",
    description: "An egg from the rare Lunar‑Dodo bird. Emits a soft blue glow.",
    location: "Lissome Plains",
    rarity: "Legendary",
    image: "assets/images/Lunar-Dodo Egg.png"
  },
  {
    name: "Bitter Balm",
    value: "20 VRP",
    type: "Crafted Item",
    description: "A pungent salve that creates an unpleasant taste when applied to objects, discouraging chewing or sucking.",
    rarity: "Uncommon",
    image: "assets/images/placeholder.js"
  },
  {
    name: "Matrix Malachite",
    value: "35 VRP",
    type: "Ingredient (Crystal)",
    description: "A green crystalline material with geometric patterns that resonate with magical energies.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/matrixmalachite.png"
  },
  {
    name: "Magibutter",
    value: "30 VRP",
    type: "Crafted (Food, Magical)",
    description: "Butter infused with magical essence, giving it a faint glow and enhanced flavor. Used in magical cooking.",
    rarity: "Uncommon",
    image: "assets/images/Magibutter.png"
  },
  {
    name: "Orichalchite",
    value: "7 VRP",
    type: "Ingredient (Metal)",
    description: "Often called 'orichalcum's ghost,' this peculiar mineral shifts between the material and ethereal realms, evoking lost legends.",
    rarity: "Common",
    image: "assets/images/Orichalchite.png"
  },
  {
    name: "Petrodistillate",
    value: "12 VRP",
    type: "Ingredient (Essence)",
    description: "A refined, volatile extract from crude oil, known for its flammable characteristics and its use in catalyzing various reactions.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/Petrodistillate.png"
  },
  {
    name: "Plastic Sheeting",
    value: "7 VRP",
    type: "Crafted (Textile Crafted)",
    description: "A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.",
    rarity: "Common",
    image: "assets/images/Plastic Sheeting.png"
  },
  {
    name: "Plasticizer",
    value: "12 VRP",
    type: "Ingredient (Essence)",
    description: "A transformative substance used to soften and mold plastics, enabling them to be fashioned into flexible forms.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/Plasticizer.png"
  },
  {
    name: "Prismatic Activator",
    value: "250 VRP",
    type: "Ingredient (Legendary, Rare)",
    description: "A dazzling device shimmering with the full spectrum of colors, designed to unlock hidden magical potentials with a decisive spark.",
    rarity: "Legendary",
    image: "assets/images/Prismatic Activator.png"
  },
  {
    name: "Quiche",
    value: "5 VRP",
    type: "Crafted (Food Crafted)",
    description: "A savory tart filled with a rich blend of ingredients, offering a hearty, delectable treat with artisanal flair.",
    rarity: "Common",
    image: "assets/images/Quiche.png"
  },
  {
    name: "Robusca",
    value: "35 VRP",
    type: "Ingredient (Crystal)",
    description: "A dense, robust crystalline alloy prized for its exceptional strength and durability, ideal for crafting heavy‑duty tools and resilient structures.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/Robusca.png"
  },
  {
    name: "Rock Salt",
    value: "7 VRP",
    type: "Ingredient (Metal, Food)",
    description: "A coarse, naturally occurring crystalline salt harvested from ancient deposits. Lends a distinct crunch and subtle brininess to recipes.",
    rarity: "Common",
    image: "assets/images/Rock Salt.png"
  },
  {
    name: "Savour Herb",
    value: "5 VRP",
    type: "Ingredient (Botanical)",
    description: "A common botanical with a rich, savory aroma.",
    location: "Greensea Forest",
    rarity: "Common",
    image: "assets/images/Savour Herb.png"
  },
  {
    name: "Solvent",
    value: "12 VRP",
    type: "Ingredient (Essence)",
    description: "A volatile liquid compound known for its ability to dissolve and extract substances, essential in various alchemical and industrial processes.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/Solvent.png"
  },
  {
    name: "Spring Water",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Pure water drawn from pristine natural springs, enriched with essential minerals to enhance clarity and freshness.",
    rarity: "Common",
    image: "assets/images/Spring Water.png"
  },
  {
    name: "Star Sugar",
    value: "250 VRP",
    type: "Ingredient (Legendary, Food)",
    description: "Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.",
    location: "Dracespire Mountain Range",
    rarity: "Legendary",
    image: "assets/images/Star Sugar.png"
  },
  {
    name: "Starsoaked Vanilla",
    value: "250 VRP",
    type: "Ingredient (Legendary, Botanical, Food, Essence)",
    description: "Vanilla beans that have been bathed in starlight for a full lunar cycle.",
    location: "Dracespire Mountain Range",
    rarity: "Legendary",
    image: "assets/images/Starsoaked Vanilla.png"
  },
  {
    name: "Starshot Ore",
    value: "7 VRP",
    type: "Ingredient (Metal)",
    description: "A celestial metallic fragment believed to have fallen from the heavens; it glimmers with soft starlight even in utter darkness.",
    rarity: "Common",
    image: "assets/images/Starshot Ore.png"
  },
  {
    name: "Sunset Essence",
    value: "35 VRP",
    type: "Ingredient (Rare, Food, Essence)",
    description: "Captured at the fleeting moment of twilight, this radiant liquid holds the fading light of a dying day, evoking enchanting warmth and mystery.",
    rarity: "Uncommon",
    image: "assets/images/Sunset Essence.png"
  },
  {
    name: "Sweetleaf",
    value: "5 VRP",
    type: "Ingredient (Food, Botanical)",
    description: "Naturally sweet leaves that add a delicate sweetness without overpowering other flavors.",
    rarity: "Common",
    image: "assets/images/placeholder.js"
  },
  {
    name: "Tastetanium Crystal",
    value: "250 VRP",
    type: "Ingredient (Legendary, Metal, Food)",
    description: "An anomalous crystalline lattice of freestate energy that interacts with ingredients to create new, novel building blocks for taste sensation—while also being incredibly durable.",
    rarity: "Legendary",
    image: "assets/images/Tastetanium Crystal.png"
  },
  {
    name: "Turbinado Sugar",
    value: "250 VRP",
    type: "Crafted (Food Legendary)",
    description: "With the awesome gastronomic might of the flavor matrix, even plain white sugar is elevated to godly tiers of taste sensation!",
    rarity: "Legendary",
    image: "assets/images/TurbonadoSugar.png"
  },
  {
    name: "Touch of Love",
    value: "250 VRP",
    type: "Ingredient (Legendary, Exotic, Essence)",
    description: "The 'most common' of Legendary Ingredients—a staple many can make themselves, yet its ubiquity is a testament to its love-infused magic.",
    location: "Greensea Forest",
    rarity: "Legendary",
    image: "assets/images/Touch of Love.png"
  },
  {
    name: "Vanilla",
    value: "5 VRP",
    type: "Ingredient (Food, Botanical, Essence)",
    description: "A fragrant flavoring extracted from vanilla pods.",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/Vanilla.png"
  },
  {
    name: "Vanilla Ice Cream",
    value: "5 VRP",
    type: "Crafted (Food)",
    description: "The tried and true classic. Almost no one can mess this up—delicious even when it turns to soup!",
    rarity: "Common",
    image: "assets/images/VanillaIceCream.png"
  },
  {
    name: "Vitalium",
    value: "35 VRP",
    type: "Ingredient (Crystal, Exotic)",
    description: "A shimmering metal imbued with the essence of life, frequently harnessed to empower enchanting constructs and devices.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/Vitalium.png"
  },
  {
    name: "Vitalocanum",
    value: "35 VRP",
    type: "Ingredient (Crystal, Exotic)",
    description: "A potent compound derived from Vitalium, renowned for its ability to bridge the gap between vitality and arcane energies.",
    location: "Dracespire Mountain Range",
    rarity: "Uncommon",
    image: "assets/images/Vitalocanum.png"
  },
  {
    name: "White Sugar",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Refined sugar that adds sweetness to any recipe.",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/White Sugar.png"
  },
  {
    name: "Whipped White Butter",
    value: "5 VRP",
    type: "Crafted (Food)",
    description: "Light and airy butter whipped to perfection. Spreads like a dream.",
    rarity: "Common",
    image: "assets/images/Whipped White Butter.png"
  },
  {
    name: "Yarn",
    value: "7 VRP",
    type: "Ingredient (Textile)",
    description: "Finely spun fiber used in weaving and knitting, prized for its delicate texture and potential enchantments in crafted garments.",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/Yarn.png"
  }
];

// Monster data from the bestiary with image caching
const monstersData = [
  {
    name: "Darkforme Overwatch",
    description: "Medium abomination, Anxious Evil",
    imageUrl: "assets/images/Monsters/Darkforme Overwatch.png",
    size: "Medium",
    type: "Abomination",
    alignment: "Anxious Evil",
    armorClass: 14,
    hitPoints: 22,
    speed: "35 ft.",
    abilities: [
      {
        name: "Pack Tactician",
        description: "When in groups of more than 2, darklings will attempt to gang up on singular opponents and close distances with long ranged attackers. This Darkling, with its superior intellect, uses its reaction to wordlessly give telepathic orders to any Darkling or Darkforme Overwatch it can see within 100 ft. If the Darkling follows this command, they receive a +1 bonus to the action."
      },
      {
        name: "Degenerate Regenerator",
        description: "If unwounded for 2 rounds, the Darkforme will begin to coalesce its being back together. Every round after the first round it is not wounded, the Darkforme Overwatch can restore 1d6 hitpoints at the start of its turn provided it does not move more than 10 ft in that turn."
      }
    ],
    actions: [
      {
        name: "Multi-Tendril Lash",
        description: "Melee Weapon Attack (Slashing): +5 to hit, reach 10 ft., one target. Hit: 8 (2d6 + 3)"
      },
      {
        name: "Shuddering Pound",
        description: "Melee Weapon Attack (Blunt): +5 to hit, reach 5 ft., one target. Hit: 4 (1d10+2)"
      },
      {
        name: "Shadowmist Jaunt",
        description: "Teleport 20 ft (Movement Action)"
      }
    ]
  },
  {
    name: "Darkling-Caller",
    description: "Small abomination, wheezing evil",
    imageUrl: "https://media-hosting.imagekit.io//29f3f8b30b754c0a/Designer%20-%202025-03-20T062451.662.png",
    size: "Small",
    type: "Abomination",
    alignment: "Wheezing Evil",
    armorClass: 11,
    hitPoints: 5,
    speed: "10 ft., fly 15 ft. (clumsy)",
    abilities: [
      {
        name: "Clumsy Flier",
        description: "The Darkling Caller has poor control over its flight, and its flying speed is halved in strong winds or heavy rain."
      },
      {
        name: "Piercing Call (Recharge 5-6)",
        description: "The Darkling Caller emits a high-pitched, reverberating screech. Each creature within 60 ft. that can hear the call must succeed on a DC 10 Constitution saving throw or be deafened until the end of its next turn. Additionally, there is a 50% chance that the call attracts 1d4 Darkformes to the Caller's location after 1d4 rounds."
      }
    ],
    actions: [
      {
        name: "Bite",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) piercing damage."
      },
      {
        name: "Wing Flap",
        description: "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 2 (1d4 - 1) bludgeoning damage. On a hit, the target must succeed on a DC 10 Strength saving throw or be pushed back 5 ft."
      }
    ]
  },
  {
    name: "Darkling-Yowler",
    description: "Small abomination, wailing evil",
    imageUrl: "https://media-hosting.imagekit.io//61f224a777904a65/Designer%20-%202025-03-20T062622.426.png",
    size: "Small",
    type: "Abomination",
    alignment: "Wailing Evil",
    armorClass: 12,
    hitPoints: 16,
    speed: "10 ft., fly 15 ft. (clumsy)",
    abilities: [
      {
        name: "Clumsy Flier",
        description: "The Darkling Yowler has poor control over its flight, and its flying speed is halved in strong winds or heavy rain."
      },
      {
        name: "Ordure Wail (Recharge 5-6)",
        description: "The Darkling Yowler emits a low, resonant tone that threatens to humiliate its enemies. Each creature within 60 ft. that can hear the wail must succeed on a DC 11 Constitution saving throw. On a failed save, the creature suffers an embarrassing \"brown note incident,\" momentarily losing control of their bowels."
      }
    ],
    actions: [
      {
        name: "Bite",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage."
      },
      {
        name: "Wing Flap",
        description: "Melee Weapon Attack: +1 to hit, reach 5 ft., one target. Hit: 3 (1d4 + 1) bludgeoning damage. On a hit, the target must succeed on a DC 11 Strength saving throw or be pushed back 5 ft."
      }
    ]
  },
  {
    name: "Darkforme-Sleek-Lurker Pack Alpha",
    description: "Medium abomination, stalking evil",
    imageUrl: "https://media-hosting.imagekit.io//729382ad448246ed/Designer%20-%202025-03-21T111612.007.png",
    size: "Medium",
    type: "Abomination",
    alignment: "Stalking Evil",
    armorClass: 14,
    hitPoints: 32,
    speed: "40 ft., climb 30 ft.",
    abilities: [
      {
        name: "Shadow Stalker",
        description: "While in dim light or darkness, the Darkling Pack Alpha has advantage on Dexterity (Stealth) checks and can Hide as a bonus action."
      },
      {
        name: "Pounce",
        description: "If the Darkling Pack Alpha moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC 13 Strength saving throw or be knocked prone."
      },
      {
        name: "Pack Tactics",
        description: "The Darkling Pack Alpha has advantage on attack rolls against a creature if at least one of the Pack Alpha's allies is within 5 feet of the creature and isn't incapacitated."
      }
    ],
    actions: [
      {
        name: "Claw",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (2d4 + 3) slashing damage."
      },
      {
        name: "Bite",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage."
      },
      {
        name: "Shadow Ambush (Recharge 5-6)",
        description: "The Darkling Pack Alpha teleports up to 30 feet to an unoccupied space in dim light or darkness that it can see. It can make a claw attack immediately after teleporting."
      }
    ]
  },
  {
    name: "Darkling-Lurker",
    description: "Small abomination, sad evil",
    imageUrl: "https://media-hosting.imagekit.io//5bfc3dc67f954010/Designer%20-%202025-03-19T172546.451.png",
    size: "Small",
    type: "Abomination",
    alignment: "Sad Evil",
    armorClass: 13,
    hitPoints: 4,
    speed: "35 ft.",
    abilities: [
      {
        name: "Pack Tactics",
        description: "When in groups of more than 2, darklings will attempt to gang up on singular opponents and close distances with long ranged attackers."
      }
    ],
    actions: [
      {
        name: "Tendril Lash",
        description: "Melee Weapon Attack (Slashing): +4 to hit, reach 10 ft., one target. Hit: 5 (1d6 + 3)."
      },
      {
        name: "Shuddering Pound",
        description: "Melee Weapon Attack (Blunt): +4 to hit, reach 5 ft., one target. Hit: 4 (1d10)."
      }
    ]
  },
  {
    name: "Darkling-Slurper",
    description: "Small abomination, hungry evil",
    imageUrl: "https://media-hosting.imagekit.io//46dcc4fad71c4a92/Designer%20(12).png",
    size: "Small",
    type: "Abomination",
    alignment: "Hungry Evil",
    armorClass: 10,
    hitPoints: 4,
    speed: "30 ft.",
    abilities: [
      {
        name: "Pack Tactics",
        description: "When in groups of more than 2, darklings will attempt to gang up on singular opponents and close distances with long ranged attackers."
      }
    ],
    actions: [
      {
        name: "Slurp",
        description: "Grapple Attack (Piercing/Blunt): +4 to hit, reach 10 ft., one target. Hit: 6 (1d6 + 3). This degenerate darkling will attempt to swallow prey and then chew upon them. This process is initiated in the same manner as a grapple."
      },
      {
        name: "Shuddering Pound",
        description: "Melee Weapon Attack (Blunt): +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 3)."
      }
    ]
  }
];

// Cache for monster images
const monsterImages = {};

// Function to preload monster images
function preloadMonsterImages() {
  monstersData.forEach(monster => {
    if (monster.imageUrl) {
      const img = new Image();
      img.src = monster.imageUrl;
      monsterImages[monster.name] = img;
    }
  });
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js / CommonJS environment
  module.exports = {
    itemsData,
    monstersData,
    preloadMonsterImages,
    monsterImages
  };
} else {
  // Browser environment - expose as global variables
  window.itemsData = itemsData;
  window.monstersData = monstersData;
  window.monsterImages = monsterImages;
  window.preloadMonsterImages = preloadMonsterImages;
}
