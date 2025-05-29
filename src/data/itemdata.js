  // Hard-coded items from the reference data (fallback if parsing fails)
  const itemsData = [
    {
      name: "Adhesive",
      value: "12 VRP",
      type: "Ingredient (Essence)",
      description: "A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.",
      location: "Greensea Forest, Lissome Plains",
      rarity: "Common"
    },
    {
      name: "Azure Harvest Blue Moon Ice Cream",
      value: "250 VRP",
      type: "Crafted (Food Legendary)",
      description: "Some say they taste citrus, others swear there are hints of custard and aromatics—and yet still more profess their belief it tastes like the platonic ideal of blue children's modeling clay. All agree it is one of the best iced confections ever created.",
      rarity: "Legendary"
    },
    {
      name: "Azure Moon Cream",
      value: "250 VRP",
      type: "Ingredient (Legendary)",
      description: "Legendary cream harvested under a blue moon. Glows with ethereal light.",
      location: "Greensea Forest",
      rarity: "Legendary"
    },
    {
      name: "Barkgum",
      value: "7 VRP",
      type: "Ingredient (Botanical)",
      description: "A sticky and rubbery organic compound refined from the sap of certain trees. Used as a base for products from chewing gum to glue and rubber.",
      location: "Greensea Forest",
      rarity: "Common"
    },
    {
      name: "Berrimaters",
      value: "5 VRP",
      type: "Ingredient (Botanical, Food)",
      description: "Small, round, savory and sweet—these cherry‑red delights are awfully fun to eat and pair well with many treats.",
      location: "Greensea Forest",
      rarity: "Common"
    },
    {
      name: "Birch Syrup",
      value: "35 VRP",
      type: "Ingredient (Food, Botanical)",
      description: "A rare syrup tapped from ancient, enchanted birch trees; each drop resonates with the forest's whispered secrets.",
      rarity: "Uncommon"
    },
    {
      name: "Butter",
      value: "5 VRP",
      type: "Crafted (Food)",
      description: "Smooth, creamy butter, perfect for cooking.",
      rarity: "Common"
    },
    {
      name: "Chromatic Platinum",
      value: "250 VRP",
      type: "Ingredient (Legendary, Metal)",
      description: "A resplendent metal alloy imbued with shifting prismatic hues, radiating a subtle magical aura.",
      rarity: "Legendary"
    },
    {
      name: "Clear Crystal",
      value: "7 VRP",
      type: "Ingredient (Crystal)",
      description: "A small, transparent crystal with weak magical properties.",
      location: "Dracespire Mountain Range",
      rarity: "Common"
    },
    {
      name: "Common Herb",
      value: "5 VRP",
      type: "Ingredient (Herb)",
      description: "A common herb found in meadows and forests.",
      location: "Greensea Forest, Lissome Plains",
      rarity: "Common"
    },
    {
      name: "Cream",
      value: "5 VRP",
      type: "Ingredient (Food)",
      description: "Fresh dairy cream, essential for making ice cream and other desserts.",
      rarity: "Common"
    },
    {
      name: "Darkessence",
      value: "250 VRP",
      type: "Ingredient (Legendary, Essence)",
      description: "A mysterious, shadow‑infused essence that exudes an aura of hidden power, often employed in dark magical rites.",
      rarity: "Legendary"
    },
    {
      name: "Defractor Prism",
      value: "35 VRP",
      type: "Ingredient (Rare)",
      description: "Differentiates magical, material, and chemical processes, allowing for the breakdown of materials into their components.",
      rarity: "Rare"
    },
    {
      name: "Distillation of a Night Sky",
      value: "250 VRP",
      type: "Ingredient (Legendary, Essence)",
      description: "The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.",
      location: "Dracespire Mountain Range, Lissome Plains, Greensea Forest, Campus (Extremely Rare)",
      rarity: "Legendary"
    },
    {
      name: "Dreamvapor",
      value: "250 VRP",
      type: "Ingredient (Legendary, Essence)",
      description: "An ephemeral mist carrying the scents of lavender and lost lullabies, slipping away like a fragment of a fading dream.",
      rarity: "Legendary"
    },
    {
      name: "Egg",
      value: "5 VRP",
      type: "Ingredient (Food)",
      description: "A common binding agent used in cooking and baking.",
      location: "Lissome Plains",
      rarity: "Common"
    },
    {
      name: "Flavor Matrix",
      value: "250 VRP",
      type: "Ingredient (Legendary)",
      description: "Made from the distillation of Candy Elemental, this crystallized flavor matrix radically expands the flavor profile of many food items—and can even unlock hidden potential.",
      rarity: "Legendary"
    },
    {
      name: "Fractal Copper",
      value: "7 VRP",
      type: "Ingredient (Metal)",
      description: "A mysterious, ever‑fractalizing metal whose intricate patterns appear only under the full moon's light.",
      rarity: "Common"
    },
    {
      name: "Flour",
      value: "5 VRP",
      type: "Ingredient (Food)",
      description: "A finely milled powder ground from high-quality grains, known for its versatile binding properties and delicate, neutral flavor.",
      rarity: "Common"
    },
    {
      name: "Glimmergold",
      value: "35 VRP",
      type: "Ingredient (Metal)",
      description: "A rare alchemical powder that sparkles like crushed sunlight, coveted by mages and merchants alike for its enigmatic properties.",
      rarity: "Uncommon"
    },
    {
      name: "Glimmelectrum",
      value: "7 VRP",
      type: "Ingredient (Metal)",
      description: "A radiant, mysterious alloy that hums with magical energy, capturing and reflecting light in mesmerizing patterns.",
      rarity: "Common"
    },
    {
      name: "Health Potion",
      value: "5 VRP",
      type: "Crafted (Potion)",
      description: "A basic healing potion that restores vitality.",
      rarity: "Common"
    },
    {
      name: "Herb Butter",
      value: "5 VRP",
      type: "Crafted (Food)",
      description: "Butter infused with aromatic herbs.",
      rarity: "Common"
    },
    {
      name: "Iron Dust",
      value: "7 VRP",
      type: "Ingredient (Metal)",
      description: "Fine iron particles with minor alchemical uses.",
      location: "Dracespire Mountain Range",
      rarity: "Common"
    },
    {
      name: "Jadicine",
      value: "12 VRP",
      type: "Ingredient (Exotic)",
      description: "A translucent green substance, rumored to be distilled from the tears of a jade dragon, soothing the mind and mending wounds.",
      rarity: "Uncommon"
    },
    {
      name: "Liquid Pain",
      value: "250 VRP",
      type: "Ingredient (Legendary, Food, Essence)",
      description: "A shifting, blood‑red fluid pulsing as though alive, harvested from the shattered hearts of fiends—dangerous, potent, and steeped in dark magic.",
      rarity: "Legendary"
    },
    {
      name: "Lovely Diaper",
      value: "7 VRP",
      type: "Crafted (Textile Crafted)",
      description: "D'awwww! Isn't that sweet. A token meant to show just how much you want to keep someone safe.",
      rarity: "Common"
    },
    {
      name: "Lunar‑Dodo Egg",
      value: "250 VRP",
      type: "Ingredient (Legendary, Food)",
      description: "An egg from the rare Lunar‑Dodo bird. Emits a soft blue glow.",
      location: "Lissome Plains",
      rarity: "Legendary"
    },
    {
      name: "Bitter Balm",
      value: "20 VRP",
      type: "Crafted Item",
      description: "A pungent salve that creates an unpleasant taste when applied to objects, discouraging chewing or sucking.",
      rarity: "Uncommon"
    },
    {
      name: "Matrix Malachite",
      value: "35 VRP",
      type: "Ingredient (Crystal)",
      description: "A green crystalline material with geometric patterns that resonate with magical energies.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Magibutter",
      value: "30 VRP",
      type: "Crafted (Food, Magical)",
      description: "Butter infused with magical essence, giving it a faint glow and enhanced flavor. Used in magical cooking.",
      rarity: "Uncommon"
    },
    {
      name: "Orichalchite",
      value: "7 VRP",
      type: "Ingredient (Metal)",
      description: "Often called 'orichalcum's ghost,' this peculiar mineral shifts between the material and ethereal realms, evoking lost legends.",
      rarity: "Common"
    },
    {
      name: "Petrodistillate",
      value: "12 VRP",
      type: "Ingredient (Essence)",
      description: "A refined, volatile extract from crude oil, known for its flammable characteristics and its use in catalyzing various reactions.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Phoenix Feather",
      value: "250 VRP",
      type: "Ingredient (Legendary)",
      description: "A rare feather from a phoenix, containing immense magical energy.",
      location: "Dracespire Mountain Range",
      rarity: "Legendary"
    },
    {
      name: "Plastic Sheeting",
      value: "7 VRP",
      type: "Crafted (Textile Crafted)",
      description: "A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.",
      rarity: "Common"
    },
    {
      name: "Plasticizer",
      value: "12 VRP",
      type: "Ingredient (Essence)",
      description: "A transformative substance used to soften and mold plastics, enabling them to be fashioned into flexible forms.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Prismatic Activator",
      value: "250 VRP",
      type: "Ingredient (Legendary, Rare)",
      description: "A dazzling device shimmering with the full spectrum of colors, designed to unlock hidden magical potentials with a decisive spark.",
      rarity: "Legendary"
    },
    {
      name: "Quiche",
      value: "5 VRP",
      type: "Crafted (Food Crafted)",
      description: "A savory tart filled with a rich blend of ingredients, offering a hearty, delectable treat with artisanal flair.",
      rarity: "Common"
    },
    {
      name: "Robusca",
      value: "35 VRP",
      type: "Ingredient (Crystal)",
      description: "A dense, robust crystalline alloy prized for its exceptional strength and durability, ideal for crafting heavy‑duty tools and resilient structures.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Rock Salt",
      value: "7 VRP",
      type: "Ingredient (Metal, Food)",
      description: "A coarse, naturally occurring crystalline salt harvested from ancient deposits. Lends a distinct crunch and subtle brininess to recipes.",
      rarity: "Common"
    },
    {
      name: "Savour Herb",
      value: "5 VRP",
      type: "Ingredient (Botanical)",
      description: "A common botanical with a rich, savory aroma.",
      location: "Greensea Forest",
      rarity: "Common"
    },
    {
      name: "Solvent",
      value: "12 VRP",
      type: "Ingredient (Essence)",
      description: "A volatile liquid compound known for its ability to dissolve and extract substances, essential in various alchemical and industrial processes.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Spring Water",
      value: "5 VRP",
      type: "Ingredient (Food)",
      description: "Pure water drawn from pristine natural springs, enriched with essential minerals to enhance clarity and freshness.",
      rarity: "Common"
    },
    {
      name: "Star Sugar",
      value: "250 VRP",
      type: "Ingredient (Legendary, Food)",
      description: "Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.",
      location: "Dracespire Mountain Range",
      rarity: "Legendary"
    },
    {
      name: "Starsoaked Vanilla",
      value: "250 VRP",
      type: "Ingredient (Legendary, Botanical, Food, Essence)",
      description: "Vanilla beans that have been bathed in starlight for a full lunar cycle.",
      location: "Dracespire Mountain Range",
      rarity: "Legendary"
    },
    {
      name: "Starshot Ore",
      value: "7 VRP",
      type: "Ingredient (Metal)",
      description: "A celestial metallic fragment believed to have fallen from the heavens; it glimmers with soft starlight even in utter darkness.",
      rarity: "Common"
    },
    {
      name: "Sunset Essence",
      value: "35 VRP",
      type: "Ingredient (Rare, Food, Essence)",
      description: "Captured at the fleeting moment of twilight, this radiant liquid holds the fading light of a dying day, evoking enchanting warmth and mystery.",
      rarity: "Uncommon"
    },
    {
      name: "Sweetleaf",
      value: "5 VRP",
      type: "Ingredient (Food, Botanical)",
      description: "Naturally sweet leaves that add a delicate sweetness without overpowering other flavors.",
      rarity: "Common"
    },
    {
      name: "Tastetanium Crystal",
      value: "250 VRP",
      type: "Ingredient (Legendary, Metal, Food)",
      description: "An anomalous crystalline lattice of freestate energy that interacts with ingredients to create new, novel building blocks for taste sensation—while also being incredibly durable.",
      rarity: "Legendary"
    },
    {
      name: "Turbinado Sugar",
      value: "250 VRP",
      type: "Crafted (Food Legendary)",
      description: "With the awesome gastronomic might of the flavor matrix, even plain white sugar is elevated to godly tiers of taste sensation!",
      rarity: "Legendary"
    },
    {
      name: "Touch of Love",
      value: "250 VRP",
      type: "Ingredient (Legendary, Exotic, Essence)",
      description: "The 'most common' of Legendary Ingredients—a staple many can make themselves, yet its ubiquity is a testament to its love-infused magic.",
      location: "Greensea Forest",
      rarity: "Legendary"
    },
    {
      name: "Vanilla",
      value: "5 VRP",
      type: "Ingredient (Food, Botanical, Essence)",
      description: "A fragrant flavoring extracted from vanilla pods.",
      location: "Lissome Plains",
      rarity: "Common"
    },
    {
      name: "Vanilla Ice Cream",
      value: "5 VRP",
      type: "Crafted (Food)",
      description: "The tried and true classic. Almost no one can mess this up—delicious even when it turns to soup!",
      rarity: "Common"
    },
    {
      name: "Vitalium",
      value: "35 VRP",
      type: "Ingredient (Crystal, Exotic)",
      description: "A shimmering metal imbued with the essence of life, frequently harnessed to empower enchanting constructs and devices.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Vitalocanum",
      value: "35 VRP",
      type: "Ingredient (Crystal, Exotic)",
      description: "A potent compound derived from Vitalium, renowned for its ability to bridge the gap between vitality and arcane energies.",
      location: "Dracespire Mountain Range",
      rarity: "Uncommon"
    },
    {
      name: "Water Essence",
      value: "12 VRP",
      type: "Ingredient (Essence)",
      description: "The distilled magical essence of water.",
      location: "Greensea Forest",
      rarity: "Uncommon"
    },
    {
      name: "White Sugar",
      value: "5 VRP",
      type: "Ingredient (Food)",
      description: "Refined sugar that adds sweetness to any recipe.",
      location: "Lissome Plains",
      rarity: "Common"
    },
    {
      name: "Wildflower Honey-Cream",
      value: "5 VRP",
      type: "Ingredient (Food, Botanical)",
      description: "A golden cream swirled with wildflower nectar, exuding the essence of springtime warmth and renewal.",
      rarity: "Common"
    },
    {
      name: "Whipped White Butter",
      value: "5 VRP",
      type: "Crafted (Food)",
      description: "Light and airy butter whipped to perfection. Spreads like a dream.",
      rarity: "Common"
    },
    {
      name: "Yarn",
      value: "7 VRP",
      type: "Ingredient (Textile)",
      description: "Finely spun fiber used in weaving and knitting, prized for its delicate texture and potential enchantments in crafted garments.",
      location: "Lissome Plains",
      rarity: "Common"
    },
    {
      name: "Brown Tincture",
      value: "15 VRP",
      type: "Ingestion Poison, Common (Restricted)",
      description: "Created by Tabitha, this medicine's purpose should be more than obvious. The delivery, possession, and manufacture of this medicine is considered controlled on campus grounds and may result in disciplinary action if abused or misused. Upon failing a DC 15 Constitution Saving Throw, 1d4 rounds after ingestion, the user will experience complete bowel incontinence in the form of an uncontrollable messing. Every 2 hours for 1d2 days, the user must roll a DC15 con or have a bowel movement in 1d4 rounds.",
      rarity: "Common"
    },
    {
      name: "Unexploded Regression Bomb",
      value: "500 VRP",
      type: "Trigger Trap, Rare",
      description: "Created by forces of the Academy and the Sorceress during the Old War, this regression shell has lain dormant for ages but can still be triggered if it is disturbed. It can normally be disturbed by hitting it or having it heated by magic. Upon failing a DC 13 Dexterity Save, the user will be regressed to 2d4-2 years old, minimum of 2 years old for 1d4 days.",
      rarity: "Rare"
    },
    {
      name: "Old-War Regression Mine",
      value: "1050 VRP",
      type: "Trigger Trap, Very Rare",
      description: "Created by forces of the Academy and the Sorceress during the Old War, this regression mine has remained dormant for ages but can still be triggered if it is disturbed. It is triggered by stepping upon it or significantly disturbing the dirt around the device. Upon failing a DC 13 Dexterity Save, the user will be regressed to 2d4-2 years old, minimum of 2 years old for 1d4 days.",
      rarity: "Very Rare"
    },
    {
      name: "Old-War Gas Trap",
      value: "300 VRP",
      type: "Inhalant Poison, Uncommon",
      description: "Manufactured during the old war, this noxious gas is known to have a variety of effects, from stinkbombs to incontinence gas to sleepytime gas.",
      rarity: "Uncommon"
    },
    {
      name: "Terrorizer Hologram",
      value: "300 VRP", 
      type: "Holographic Fear Trap, Rare",
      description: "These enigmatic devices were created at some point immediately before, during, or right after the Old-War. The base of the holographic display will project the form of a creature no larger than 10x10x10 in a space of equal size. These hard-light abominations do not actually possess the photonic density to cause damage- and if they once did is not known.",
      rarity: "Rare"
    },
    {
      name: "Gluttonberries",
      value: "100 VRP",
      type: "Consumable, Magical Plant, Uncommon",
      description: "These golden, pearlescent berries exude a fine aura when exposed to sunlight. Sometimes called firefly berries due to the fact they retain this light for some time after dusk. They are sweet, juicy, and packed with nutrients and fiber- loaded with everything an adventurer needs.",
      rarity: "Uncommon"
    },
    {
      name: "Fool's Berries",
      value: "150 VRP",
      type: "Consumable, Magical Plant, Uncommon",
      description: "These off-yellow, glimmering berries exude a fine sheen when exposed to sunlight. Sometimes called false firefly berries due to the fact they appear to glow for a short time right before sunset. They are sweet, juicy, but have a cutting bitter aftertaste.",
      rarity: "Uncommon"
    },
    {
      name: "Penitent Mitts",
      value: "2000 VRP",
      type: "Cursed Item, Artifact",
      description: "Forged in the Artifcer Wellspring by Miss K, these bonds are meant to withstand the greatest resistance and hold back the greatest of bratting. While wearing the Penitent Mitts, a character takes disadvantage on all checks made with their hands. They also cannot cast spells that require somatic components.",
      rarity: "Very Rare"
    },
    {
      name: "Pacification Gag",
      value: "2000 VRP",
      type: "Cursed Item, Artifact",
      description: "Forged in the Artifcer Wellspring by Miss K, this adorable infantile pacifier gag was made to hold back the verbal tide of even the mouthiest of students and staff. While equipped with the Pacification Gag, a character takes disadvantage and -5 on all checks made to deception and persuasion. They also cannot cast spells that require verbal components.",
      rarity: "Very Rare"
    },
    {
      name: "Omni-Infusion Elixir",
      value: "1500 VRP",
      type: "Crafted (Potion)",
      description: "A versatile potion that enhances the magical properties of items soaked in it, making them more receptive to enchantment.",
      rarity: "Rare"
    }
  ];