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
    image: "assets/images/Darkessence.webp"
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
    image: "assets/images/Bitter Balm.png"
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
    image: "assets/images/Rock_Salt.png"
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
    image: "assets/images/Sweetleaf.png"
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
  },
  {
    name: "Common Mushroom",
    value: "5 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "A simple edible mushroom commonly used as food. When consumed, it restores 1 HP.",
    rarity: "Common",
    image: "assets/images/common_mushroom.webp"
  },
  {
    name: "Blushcap Puffball",
    value: "15 VRP",
    type: "Ingredient (Botanical)",
    description: "A soft pink mushroom that releases a visible cloud of harmless spores when disturbed. Creatures exposed must succeed a mild composure check or become flustered and distracted for 1 minute.",
    rarity: "Common",
    image: "assets/images/blushcap_puffball.webp"
  },
  {
    name: "Nightshroom",
    value: "50 VRP",
    type: "Ingredient (Botanical)",
    description: "A dark, alchemically reactive fungus. If consumed directly, it deals 1 HP of damage. Commonly used as a base ingredient for various concoctions.",
    rarity: "Uncommon",
    image: "assets/images/nightshroom.webp"
  },
  {
    name: "Pottytime Fungus",
    value: "50 VRP",
    type: "Ingredient (Botanical)",
    description: "A peculiar mushroom that restores 1 HP when consumed, but immediately forces a potty-check at disadvantage. Frequently used as a base ingredient for experimental concoctions.",
    rarity: "Uncommon",
    image: "assets/images/pottytime_fungus.webp"
  },
  {
    name: "Old War Memorabilia",
    value: "25 VRP",
    type: "Ingredient (Material)",
    description: "Assorted remnants from the old war, including medals, flags, banners, and other memorabilia taff. Valued for symbolic, ritual, or sentimental purposes.",
    rarity: "Uncommon",
    image: "assets/images/old_war_memorabilia.webp"
  },
  {
    name: "Lashvine",
    value: "1 VRP",
    type: "Ingredient (Botanical)",
    description: "A sturdy eight-foot length of heavy-duty jungle vine that can be used as rope without any further modification.",
    rarity: "Common",
    image: "assets/images/lashvine.webp"
  },
  {
    name: "Secondthought Sprout",
    value: "30 VRP",
    type: "Ingredient (Botanical)",
    description: "A reflective herb that sharpens judgment. When consumed, it grants advantage on one Wisdom save, but imposes disadvantage on the next Dexterity check.",
    rarity: "Uncommon",
    image: "assets/images/secondthought_sprout.webp"
  },
  {
    name: "Scholarian Wizard Weed",
    value: "N/A",
    type: "Ingredient (Botanical)",
    description: "A weird and wonderfully colored herb notable for growing near the Academy. It strongly promotes euphoria and good vibes, often at the cost of a little maturity.",
    rarity: "Uncommon",
    image: "assets/images/scholarian_wizard_weed.webp"
  },
  {
    name: "Atem Pod",
    value: "250 VRP",
    type: "Ingredient (Botanical)",
    description: "An odd, sticky, resinous pod known for its ability to be concentrated into a potent combat and performance stimulant.",
    rarity: "Legendary",
    image: "assets/images/atem_pod.webp"
  },
  {
    name: "Fuddleroot",
    value: "250 VRP",
    type: "Ingredient (Botanical)",
    description: "An old and trusted remedy of the crinkly-crawlies, and a well-known analgesic with potent poppy-like qualities and taste. Concentrated forms are softly banned, though the raw root is permitted.",
    rarity: "Legendary",
    image: "assets/images/fuddleroot.webp"
  },
  {
    name: "Tryphacosmia",
    value: "250 VRP",
    type: "Ingredient (Botanical)",
    description: "A rare purple and red-petaled flower once called Elf Sleep Toxin. Its hallucinogenic properties are strong enough to induce a sleep-like catatonia even in sleep-immune individuals. Banned on scholia grounds in both raw and concentrated form, it nevertheless appears in prank powders and recreational tinctures across the realm and campus.",
    rarity: "Legendary",
    image: "assets/images/tryphacosmia.webp"
  },
  {
    name: "Whimleaf Curl",
    value: "75 VRP",
    type: "Ingredient (Botanical)",
    description: "A botanical leaf that induces light euphoria and playful behavior. Users suffer a minor penalty to seriousness-based checks for 10 minutes. Often brewed into teas or concentrated into tinctures for more pronounced effects. Its use became unrestricted following the loosening of the Controlled Magical Substances Act of 51BT.",
    rarity: "Uncommon",
    image: "assets/images/whimleaf_curl.webp"
  },
  {
    name: "Dozerbell Lily",
    value: "150 VRP",
    type: "Ingredient (Botanical)",
    description: "A mildly sedative flowering plant. Consuming it imposes disadvantage on initiative rolls for 10 minutes, but grants advantage on the next Constitution save.",
    rarity: "Rare",
    image: "assets/images/dozerbell_lily.webp"
  },
  {
    name: "Safrillium Nectar Flute (Fresh)",
    value: "5 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "A wondrous magical plant once widespread before the old war. Its flute-like flower fills with thick, rich nectar over the season. When consumed fresh, it restores 1d10 HP, or exactly 10 HP if consumed during a short rest. Its richness forces an immediate potty-check at disadvantage.",
    rarity: "Uncommon",
    image: "assets/images/safrillium_nectar_flute_fresh.webp"
  },
  {
    name: "Safrillium Nectar Flute (Ripened)",
    value: "25 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "A season-aged Safrillium flower whose nectar has matured into a syrupy, naturally alcoholic form. It restores 1d6 HP, or exactly 6 HP if consumed during a short rest. Its richness forces an immediate potty-check at disadvantage. It is considered two alcoholic drinks at approximately 12% ABV.",
    rarity: "Uncommon",
    image: "assets/images/safrillium_nectar_flute.webp"
  },
  {
    name: "Floral Horn of Century Safrillium Nectar",
    value: "500 VRP",
    type: "Ingredient (Botanical, Food, Legendary)",
    description: "A legendary trumpet-shaped Safrillium flower whose nectar has matured over a full century of miraculous serenity. It restores 4d6 HP, or exactly 24 HP if consumed during a short rest, and instantly cures any non-magical illness or disease. Its richness forces an immediate potty-check at disadvantage. The potent alcoholic content of the full flute requires a DC 15 Constitution check or the consumer suffers temporary drunkenness.",
    rarity: "Legendary",
    image: "assets/images/floral_horn_century_safrillium_nectar.webp"
  },
  {
    name: "Fishing Rod",
    value: "10 VRP",
    type: "Tool (Fishing)",
    description: "A basic fishing rod used to access fishable worldmap zones. Phase 1 uses this as the required inventory key for starting fishing interactions.",
    rarity: "Common",
    image: "assets/images/Old_Fashioned_Rod.webp"
  },
  {
    name: "Magirod",
    value: "125 VRP",
    type: "Tool (Fishing, Magical)",
    description: "A sparkly magical fishing rod that enhances the user's fishing abilities. It grants a +2 bonus to fishing checks when used.",
    rarity: "Uncommon",
    image: "assets/images/Magi_Rod.webp"
  },
  {
    name: "Fishing Lure",
    value: "5 VRP",
    type: "Tool (Fishing Accessory)",
    description: "A fishing lure, standard in appearance and functionality.",
    rarity: "Common",
    image: "assets/images/Standard_Lure.webp"
  },
  {
    name: "Magi-Jig Lure",
    value: "40 VRP",
    type: "Tool (Fishing Accessory, Magical)",
    description: "A magical lure that glows with an otherworldly light, designed to attract rare and elusive fish. It grants a +1 bonus to fishing checks when used.",
    rarity: "Uncommon",
    image: "assets/images/Magijig_Lure.webp"
  },
  {
    name: "Lake Carp",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 4HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/lake_carp.png"
  },
  {
    name: "Rainbow Carp",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 4HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/rainbow_carp.png"
  },
  {
    name: "Lake Trout",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 4HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/lake_trout.png"
  },
  {
    name: "Black Trout",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 6HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/black_trout.png"
  },
  {
    name: "Softback Turtle",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 6HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/softback_turtle.png"
  },
  {
    name: "Armorshell Turtle",
    value: "10 VRP",
    type: "Fishing Catch",
    description: "If prepared over a fire during a short rest, provides 4HP & +1 AC for 1d4 hrs.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/armorshell_turtle.png"
  },
  {
    name: "Swordclaw Crab",
    value: "10 VRP",
    type: "Fishing Catch",
    description: "If prepared over a fire during a short rest, provides 4HP & +1 ATT for 1d4 hrs.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/swordclaw_crab.png"
  },
  {
    name: "Blueclaw Crab",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "A tasty crustacean. If boiled over a fire during a short rest, provides 4HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/blueclaw_crab.png"
  },
  {
    name: "Darkling Trout",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Inedible except for Darklings, abominations, and omniphages, provides 2HP.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/darkling_trout.png"
  },
  {
    name: "Lake Mini-Shark",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 6HP.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/lake_mini_shark.png"
  },
  {
    name: "Lakeopus",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When consumed, grants a +1 bonus to Wisdom ability checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/lakeopus.png"
  },
  {
    name: "Tarheel Eel",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Consuming this eel grants a temporary +1 to Dexterity saving throws for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/tarheel_eel.png"
  },
  {
    name: "Unisturgeon",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When prepared during a short rest, grants 3HP and +1 to Intelligence checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/unisturgeon.png"
  },
  {
    name: "Cavern Cod",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 6HP.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/cavern_cod.png"
  },
  {
    name: "Deep Swimmer Guppy",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When consumed raw, grants water breathing for 10 minutes.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/deep_swimmer_guppy.png"
  },
  {
    name: "Deep Swimmer Gulpy",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When prepared during a short rest, provides 3HP and +1 to Initiative for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/deep_swimmer_gulpy.png"
  },
  {
    name: "Deep Swimmer Gulper",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When consumed, grants 5 temporary hit points that last for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/deep_swimmer_gulper.png"
  },
  {
    name: "Deep Lurker Dark Gulper",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Consuming this fish grants darkvision for 30 minutes if you don't already have it.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/deep_lurker_dark_gulper.png"
  },
  {
    name: "Boot",
    value: "5 VRP",
    type: "Fishing Catch (Junk)",
    description: "A useless boot, always feels like a fish on the line...",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/old_boot.png"
  },
  {
    name: "Fancy Boot",
    value: "6 VRP",
    type: "Fishing Catch (Junk)",
    description: "How it remained so nice for so long is anyone's guess...",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/fancy_boot.webp"
  },
  {
    name: "Magic Boot",
    value: "1500 VRP",
    type: "Fishing Catch (Junk, Magical)",
    description: "Get two to complete a set and they become a magic item.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/magic_boot.webp"
  },
  {
    name: "Empty Can",
    value: "5 VRP",
    type: "Fishing Catch (Junk)",
    description: "Damn litterers! Someone needs a spanking!",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/tin_can.png"
  },
  {
    name: "Full Can",
    value: "5 VRP",
    type: "Fishing Catch (Junk)",
    description: "DM discretion.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/full_can.png"
  },
  {
    name: "Can of Whoopass",
    value: "100 VRP",
    type: "Fishing Catch (Junk, Magical)",
    description: "+1 ATT and DMG for 1d4 hours, instant potty check.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/can_of_whoopass.png"
  },
  {
    name: "A Whole Trashcan",
    value: "5 VRP",
    type: "Fishing Catch (Junk)",
    description: "Surprisingly clean inside. May contain a useful trinket (25% chance) or fish bait.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/whole_trashcan.png"
  },
  {
    name: "Deactivated Warforged",
    value: "5 VRP",
    type: "Fishing Catch (Junk)",
    description: "A waterlogged construct. With proper tools, may be reactivated as a temporary ally.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/deactivated_warforged.png"
  },
  {
    name: "Broken Good-Rod",
    value: "5 VRP",
    type: "Tool (Fishing, Damaged)",
    description: "A broken magical fishing rod, maybe it can be repaired?",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/broken_good_rod.png"
  },
  {
    name: "Functional Good-Rod",
    value: "5 VRP",
    type: "Tool (Fishing, Magical)",
    description: "A magical fishing rod. Gives +1 to Fishing Checks.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/functional_good_rod.png"
  },
  {
    name: "Merbab (Angy)",
    value: "0 VRP",
    type: "Fishing Encounter",
    description: "Will cast Incontinence on you and flee. DC14 resist.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/merbab_angy.webp"
  },
  {
    name: "Merbab (Curious)",
    value: "0 VRP",
    type: "Fishing Encounter",
    description: "Will cast Incontinence on you if you don't have a snack; if fed, +1 to fishing for 1 day.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/merbab_curious.webp"
  },
  {
    name: "Jaguar Gar",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When consumed, grants +1 to attack rolls for 1 hour due to its fierce spirit.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/jaguargar.png"
  },
  {
    name: "Trope Eel",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Consuming this eel grants a +1 to Performance checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/tropeeel.png"
  },
  {
    name: "River Kaleido",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Its kaleidoscopic patterns grant +1 to Perception checks for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/kaleido.png"
  },
  {
    name: "Skyflapper",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "A tasty fish. If prepared over a fire during a short rest, provides 6HP.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/skyflapper.png"
  },
  {
    name: "Drought Trout",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When prepared properly, grants resistance to fire damage for 10 minutes.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/drouttrout.png"
  },
  {
    name: "Creeken-Rivar Trout",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Consuming this fish during a short rest provides 5HP and +1 to Constitution saves for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/creekenrivartrout.png"
  },
  {
    name: "Long Swimmer",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Grants a swimming speed equal to your walking speed for 30 minutes when consumed.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/longswimmer.png"
  },
  {
    name: "Brown Frog",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When consumed, grants a +2 bonus to jump distance for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/brownfrog.png"
  },
  {
    name: "Round Frog",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Consuming this frog provides 3 temporary hit points that last for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/roundfrog.png"
  },
  {
    name: "Black-Spot Frog",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "When consumed, grants advantage on poison saving throws for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/blackspotfrog.png"
  },
  {
    name: "Aquatic Toad",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Grants the ability to hold your breath twice as long for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/aquatictoad.png"
  },
  {
    name: "Darkling Rill-Skitter",
    value: "10 VRP",
    type: "Fishing Encounter",
    description: "A stealthy darkling lurking in shallows, using murky waters to ambush prey.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/rillskitter.png"
  },
  {
    name: "Darkling Blood-Gorger",
    value: "15 VRP",
    type: "Fishing Encounter",
    description: "A parasitic darkling that drains its victim's vitality with a chilling bite.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/bloodgorger.png"
  },
  {
    name: "Darkforme Pike-Maw",
    value: "20 VRP",
    type: "Fishing Encounter",
    description: "A monstrous gar-like predator, attacking with shocking speed.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/pikemaw.png"
  },
  {
    name: "Darkforme Current-Snapper",
    value: "20 VRP",
    type: "Fishing Encounter",
    description: "A turtle-like darkling with iron jaws capable of trapping prey.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/currentsnapper.png"
  },
  {
    name: "Darkling River-Lurk",
    value: "10 VRP",
    type: "Fishing Encounter",
    description: "A slippery shadow-form serpent, striking like a constricting vine.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/riverlurk.png"
  },
  {
    name: "Darkforme Mire-Croaker",
    value: "20 VRP",
    type: "Fishing Encounter",
    description: "A bloated, croaking horror that leaps and snares victims with its tongue.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/mirecroaker.png"
  },
  {
    name: "Darkforme Mud-Gnasher",
    value: "20 VRP",
    type: "Fishing Encounter",
    description: "A territorial ambusher that erupts from muddy riverbeds to attack.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/mudgnasher.png"
  },
  {
    name: "Darkling Pond-Skulker",
    value: "10 VRP",
    type: "Fishing Encounter",
    description: "A mischievous thief that steals bait and causes frustration.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/pondskulker.png"
  },
  {
    name: "Darkling Weed-Tangler",
    value: "30 VRP",
    type: "Fishing Encounter",
    description: "A tangle of dark, grasping river weeds with ensnaring tendrils.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/darkling_weed_tangler.png"
  },
  {
    name: "Darkling Gloom-Newt",
    value: "30 VRP",
    type: "Fishing Encounter",
    description: "A slippery, shadow-coated amphibian that exudes disorienting slime.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/gloomnewt.png"
  },
  {
    name: "Darkforme Current-Drifter",
    value: "40 VRP",
    type: "Fishing Encounter",
    description: "An amorphous darkling, generating electrical bursts in murky waters.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/currentdrifter.png"
  },
  {
    name: "Darkforme Titan-Snapper",
    value: "500 VRP",
    type: "Fishing Encounter",
    description: "A colossal snapping turtle-shaped darkforme that shatters boats. Creatures over 50 HP may yield treasure-contact the DM or Assistant Game Masters.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/titansnapper.png"
  },
  {
    name: "Darkforme River Tyrant",
    value: "750 VRP",
    type: "Fishing Encounter",
    description: "An ancient crocodilian terror dominating entire river stretches. Creatures over 50 HP may yield treasure-contact the DM or Assistant Game Masters.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/rivertyrant.png"
  },
  {
    name: "Darkforme Abyssal Leviathan",
    value: "1500 VRP",
    type: "Fishing Encounter",
    description: "The deepwater nightmare that consumes everything in its path. Creatures over 50 HP may yield treasure-contact the DM or Assistant Game Masters.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/abyssalleviathan.png"
  },
  {
    name: "Lakeopus Rex",
    value: "80 VRP",
    type: "Fishing Catch",
    description: "The king of all Lakopuses. Catching and releasing the Lakeopus Rex allows for the King of the Lake VR boss battle to be unlocked.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/lakeopus_rex.png"
  },
  {
    name: "Prismatic Carp",
    value: "40 VRP",
    type: "Fishing Catch",
    description: "A shimmering fish with scales that cycle through all colors. Grants resistance to a random damage type for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/prismatic_carp.png"
  },
  {
    name: "Thunder Catfish",
    value: "45 VRP",
    type: "Fishing Catch",
    description: "Generates small electrical charges. Consuming it grants the ability to cast Shocking Grasp once within the next 8 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/thunder_catfish.png"
  },
  {
    name: "Arcane Bass",
    value: "30 VRP",
    type: "Fishing Catch",
    description: "Shows faint magical runes on its scales. When consumed, grants the ability to detect magic for 10 minutes.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/arcane_bass.png"
  },
  {
    name: "Silver Perch",
    value: "7 VRP",
    type: "Fishing Catch",
    description: "Its reflective scales shimmer in the light. When prepared during a short rest, provides 5HP and +1 to Charisma (Performance) checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/silver_perch.png"
  },
  {
    name: "Golden Minnow",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "A small but valuable fish. When consumed, grants the ability to hold your breath for twice as long for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/golden_minnow.png"
  },
  {
    name: "Spotted River Bass",
    value: "9 VRP",
    type: "Fishing Catch",
    description: "A common game fish. When prepared during a short rest, provides 6HP and advantage on Athletics checks for swimming for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/spotted_river_bass.png"
  },
  {
    name: "Mossy Catfish",
    value: "10 VRP",
    type: "Fishing Catch",
    description: "Covered in a harmless moss that has mild healing properties. When consumed, provides 5HP and advantage on saving throws against disease for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/mossy_catfish.png"
  },
  {
    name: "River Pike",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "A predatory freshwater fish. When prepared properly, grants +1 to Wisdom (Survival) checks for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/river_pike.png"
  },
  {
    name: "Whiskered Sturgeon",
    value: "10 VRP",
    type: "Fishing Catch",
    description: "Its sensitive barbels detect minute vibrations. When consumed, grants advantage on Wisdom (Perception) checks that rely on hearing for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/whiskered_sturgeon.png"
  },
  {
    name: "Copper Minnow",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Has a distinctive metallic sheen. When consumed, grants resistance to lightning damage for 10 minutes.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/copper_minnow.png"
  },
  {
    name: "Dappled Sunfish",
    value: "7 VRP",
    type: "Fishing Catch",
    description: "Covered in colorful spots that change with the light. When consumed, grants advantage on saving throws against being blinded for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/dappled_sunfish.png"
  },
  {
    name: "Pebble Sucker",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "Collects small stones in its mouth. When prepared properly, provides 4HP and +1 to Athletics checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/pebble_sucker.png"
  },
  {
    name: "River Pincer",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "Has specialized fins that can grip objects. When consumed, grants advantage on checks to avoid being disarmed for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/river_pincer.png"
  },
  {
    name: "Meadow Brook Trout",
    value: "7 VRP",
    type: "Fishing Catch",
    description: "Smells faintly of wildflowers. When prepared during a short rest, provides 5HP and advantage on Nature checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/meadow_brook_trout.png"
  },
  {
    name: "Echo Minnow",
    value: "7 VRP",
    type: "Fishing Catch",
    description: "Makes distinctive clicking sounds to navigate murky waters. When consumed, grants +2 to Perception checks in darkness for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/echo_minnow.webp"
  },
  {
    name: "Lazuli Swimmer",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "Has brilliant blue scales. When prepared properly, provides 5HP and +1 to Charisma checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/lazuli_swimmer.png"
  },
  {
    name: "Featherscale",
    value: "7 VRP",
    type: "Fishing Catch",
    description: "Extremely light with wispy fins. When consumed, grants reduced falling damage (half damage) for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/featherscale.png"
  },
  {
    name: "Mud Dreamer",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "Found half-buried in riverbed mud. When prepared during a short rest, provides 6HP and advantage on saving throws against exhaustion for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/mud_dreamer.png"
  },
  {
    name: "Whitewater Bass",
    value: "9 VRP",
    type: "Fishing Catch",
    description: "Strong fish with powerful muscles. When consumed, grants +1 to Strength checks and jumping distance for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/whitewater_bass.png"
  },
  {
    name: "Spotted Gar",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "Has armored scales and a long snout. When prepared properly, provides 5HP and +1 AC against piercing damage for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/spotted_gar.png"
  },
  {
    name: "River Goby",
    value: "9 VRP",
    type: "Fishing Catch",
    description: "A small fish that can camouflage itself. When consumed, grants advantage on Stealth checks in natural environments for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/river_goby.png"
  },
  {
    name: "Silverfin Darter",
    value: "10 VRP",
    type: "Fishing Catch",
    description: "Its silver fins shimmer in the light. When prepared during a short rest, provides 6HP and +1 to Dexterity saves against traps for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/silverfin_darter.png"
  },
  {
    name: "Golden Shiner",
    value: "11 VRP",
    type: "Fishing Catch",
    description: "A small, golden fish. When consumed, grants a +1 bonus to Charisma checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/golden_shiner.png"
  },
  {
    name: "Bluegill Sunfish",
    value: "12 VRP",
    type: "Fishing Catch",
    description: "A common freshwater fish. When prepared properly, provides 7HP and +1 to Wisdom saves against illusions for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/bluegill_sunfish.png"
  },
  {
    name: "Redfin Pickerel",
    value: "13 VRP",
    type: "Fishing Catch",
    description: "A predatory fish with sharp teeth. When consumed, grants advantage on attack rolls against aquatic creatures for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/redfin_pickerel.png"
  },
  {
    name: "Mottled Catfish",
    value: "14 VRP",
    type: "Fishing Catch",
    description: "Its mottled skin provides excellent camouflage. When prepared during a short rest, provides 8HP and +1 to Stealth checks in water for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/mottled_catfish.png"
  },
  {
    name: "Stream Darter",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "A small, quick fish. When consumed, grants +1 to Dexterity checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/stream_darter.png"
  },
  {
    name: "Muddy Sucker",
    value: "5 VRP",
    type: "Fishing Catch",
    description: "Not the prettiest fish, but provides 4HP when cooked properly.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/muddy_sucker.png"
  },
  {
    name: "Creek Chub",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "A hardy little fish. When prepared, grants 3HP and +1 to Constitution saves against cold for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/creek_chub.png"
  },
  {
    name: "Willow Minnow",
    value: "6 VRP",
    type: "Fishing Catch",
    description: "Small but nutritious. When prepared during a short rest, provides 3HP and +1 to Wisdom checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Common",
    image: "assets/images/fish/willow_minnow.png"
  },
  {
    name: "Lake Bluegill",
    value: "7 VRP",
    type: "Fishing Catch",
    description: "A popular angling fish. When prepared properly, provides 4HP and +1 to Animal Handling checks for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/lake_bluegill.png"
  },
  {
    name: "Yellow Perch",
    value: "8 VRP",
    type: "Fishing Catch",
    description: "Its yellow stripes are distinctive. When consumed, grants the ability to see clearly underwater for 30 minutes.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/yellow_perch.png"
  },
  {
    name: "Northern Pike",
    value: "12 VRP",
    type: "Fishing Catch",
    description: "A voracious predator. When prepared during a short rest, provides 6HP and +1 to attack rolls for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/northern_pike.png"
  },
  {
    name: "Channel Catfish",
    value: "11 VRP",
    type: "Fishing Catch",
    description: "A bottom feeder with keen senses. When prepared, grants darkvision for 1 hour if you don't already have it.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/channel_catfish.png"
  },
  {
    name: "Muskellunge",
    value: "15 VRP",
    type: "Fishing Catch",
    description: "The fish of a thousand casts. When prepared properly, grants 8HP and advantage on Constitution saves for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/muskellunge.png"
  },
  {
    name: "Lake Sturgeon",
    value: "18 VRP",
    type: "Fishing Catch",
    description: "An ancient fish species. When consumed, grants 5 temporary hit points and resistance to one damage type of your choice for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/lake_sturgeon.png"
  },
  {
    name: "River Snapper",
    value: "15 VRP",
    type: "Fishing Catch",
    description: "A snapping turtle-like fish. When consumed, grants resistance to bludgeoning damage for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/river_snapper.png"
  },
  {
    name: "Giant River Shrimp",
    value: "20 VRP",
    type: "Fishing Catch",
    description: "A large shrimp that can be eaten raw or cooked. Provides a +2 bonus to Dexterity saving throws for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/giant_river_shrimp.png"
  },
  {
    name: "Crystal Trout",
    value: "25 VRP",
    type: "Fishing Catch",
    description: "Its scales refract light like a prism. When prepared properly, provides 10HP and advantage on Intelligence checks for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/crystal_trout.png"
  },
  {
    name: "Ethereal Catfish",
    value: "30 VRP",
    type: "Fishing Catch",
    description: "A ghostly fish that can phase through solid objects. When consumed, grants the ability to move through solid objects as if they were difficult terrain for 10 minutes.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/ethereal_catfish.png"
  },
  {
    name: "Spectral Pike",
    value: "35 VRP",
    type: "Fishing Catch",
    description: "A spectral fish that can become invisible at will. When consumed, grants the ability to turn invisible for 1 minute.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/spectral_pike.png"
  },
  {
    name: "Void Eel",
    value: "40 VRP",
    type: "Fishing Catch",
    description: "A dark eel that seems to absorb light. When consumed, grants resistance to necrotic damage for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/void_eel.webp"
  },
  {
    name: "Celestial Salmon",
    value: "50 VRP",
    type: "Fishing Catch",
    description: "A shimmering fish that glows faintly. When prepared properly, provides 12HP and advantage on saving throws against being charmed for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/celestial_salmon.png"
  },
  {
    name: "Astral Sturgeon",
    value: "60 VRP",
    type: "Fishing Catch",
    description: "A massive fish with star-like patterns on its scales. When consumed, grants the ability to cast Astral Projection once within the next 8 hours.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/astral_sturgeon.png"
  },
  {
    name: "Giant River Eel",
    value: "20 VRP",
    type: "Fishing Catch",
    description: "A massive eel that can constrict its prey. When consumed, grants a +2 bonus to Dexterity saving throws for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/giant_river_eel.webp"
  },
  {
    name: "Silver Salmon",
    value: "25 VRP",
    type: "Fishing Catch",
    description: "A shimmering fish that grants a +1 bonus to Dexterity checks for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/silver_salmon.webp"
  },
  {
    name: "Golden Catfish",
    value: "30 VRP",
    type: "Fishing Catch",
    description: "Its golden scales are said to bring good luck. When consumed, grants advantage on the next attack roll made within 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/golden_catfish.webp"
  },
  {
    name: "Ethereal Pike",
    value: "35 VRP",
    type: "Fishing Catch",
    description: "A ghostly fish that can phase through solid objects. When consumed, grants the ability to move through solid objects as if they were difficult terrain for 10 minutes.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/ethereal_pike.webp"
  },
  {
    name: "Spectral Sturgeon",
    value: "40 VRP",
    type: "Fishing Catch",
    description: "A rare fish that glows faintly in the dark. When consumed, grants darkvision for 1 hour if you don't already have it.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/spectral_sturgeon.webp"
  },
  {
    name: "Titanic Catfish",
    value: "50 VRP",
    type: "Fishing Catch",
    description: "A colossal catfish that can swallow whole boats. When consumed, grants the ability to breathe underwater for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/titanic_catfish.png"
  },
  {
    name: "Frostfin Trout",
    value: "30 VRP",
    type: "Fishing Catch",
    description: "A trout that thrives in icy waters. When consumed, grants resistance to cold damage for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/frostfin_trout.png"
  },
  {
    name: "Emberfish",
    value: "35 VRP",
    type: "Fishing Catch",
    description: "A fiery fish that glows with internal heat. When consumed, grants resistance to fire damage for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/emberfish.png"
  },
  {
    name: "Stormscale Eel",
    value: "40 VRP",
    type: "Fishing Catch",
    description: "An eel that crackles with electrical energy. When consumed, grants the ability to cast Thunderwave once within the next 8 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/stormscale_eel.webp"
  },
  {
    name: "Voidfin Shark",
    value: "45 VRP",
    type: "Fishing Catch",
    description: "A shark that seems to exist partially in another dimension. When consumed, grants the ability to cast Misty Step once within the next 8 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/voidfin_shark.png"
  },
  {
    name: "Celestial Ray",
    value: "50 VRP",
    type: "Fishing Catch",
    description: "A ray that glows with celestial light. When prepared properly, provides 15HP and advantage on saving throws against being blinded for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/celestial_ray.png"
  },
  {
    name: "Astral Leviathan",
    value: "60 VRP",
    type: "Fishing Catch",
    description: "A massive leviathan that swims through the astral plane. When consumed, grants the ability to cast Astral Projection once within the next 8 hours.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/astral_leviathan.png"
  },
  {
    name: "Moonbeam Gar",
    value: "35 VRP",
    type: "Fishing Catch",
    description: "Only surfaces during certain lunar phases. When prepared under moonlight, grants resistance to necrotic damage for 24 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/moonbeam_gar.png"
  },
  {
    name: "Elder Lake Turtle",
    value: "40 VRP",
    type: "Fishing Catch",
    description: "Said to be over 200 years old. When its meat is consumed, grants +1 to Wisdom and advantage on Wisdom saves for 24 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/elder_lake_turtle.png"
  },
  {
    name: "Depths Walker",
    value: "45 VRP",
    type: "Fishing Catch",
    description: "A fish that seems to walk along the lake bottom. When consumed, grants water walking for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/depths_walker.png"
  },
  {
    name: "Arcane Trout",
    value: "200 VRP",
    type: "Fishing Catch",
    description: "A fish infused with magical energy. Grants +1 to spell attack rolls for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/arcane_trout.webp"
  },
  {
    name: "Mana Carp",
    value: "250 VRP",
    type: "Fishing Catch",
    description: "Shimmering with arcane energy. Restores one 1st-level spell slot when consumed (once per day only).",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/mana_carp.webp"
  },
  {
    name: "Spellscale Bass",
    value: "300 VRP",
    type: "Fishing Catch",
    description: "Scales shimmer with magical patterns. Grants +1 to spell save DCs for 1 hour when prepared properly.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/spellscale_bass.webp"
  },
  {
    name: "Runic Catfish",
    value: "350 VRP",
    type: "Fishing Catch",
    description: "Mystical runes appear on its skin. Can be used as a component for enhancing enchantment spells.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/runic_catfish.webp"
  },
  {
    name: "Ethereal Eel",
    value: "400 VRP",
    type: "Fishing Catch",
    description: "Partially phases in and out of reality. Grants the ability to cast Misty Step once when consumed.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/ethereal_eel.webp"
  },
  {
    name: "Wizard's Whiskerfish",
    value: "450 VRP",
    type: "Fishing Catch",
    description: "Its whiskers can be used as wand components. Increases wand spell damage by 1d4 for one casting.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/wizard_whiskerfish.webp"
  },
  {
    name: "Familiar Fry",
    value: "300 VRP",
    type: "Fishing Catch",
    description: "A school of tiny, intelligent fish. Can serve as a temporary water-breathing familiar for 24 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/familiar_fry.webp"
  },
  {
    name: "Elemental Sturgeon",
    value: "500 VRP",
    type: "Fishing Catch",
    description: "Contains essence of elemental magic. Grants resistance to one damage type for 1 hour when consumed.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/elemental_sturgeon.webp"
  },
  {
    name: "Divination Sunfish",
    value: "400 VRP",
    type: "Fishing Catch",
    description: "Its reflective scales show glimpses of possible futures. Grants advantage on one Wisdom check when consumed.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/divination_sunfish.webp"
  },
  {
    name: "Conjurer's Crab",
    value: "350 VRP",
    type: "Fishing Catch",
    description: "Can temporarily conjure small objects with its claws. Useful for magical demonstrations.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/conjurers_crab.webp"
  },
  {
    name: "Enchanted Lake Carp",
    value: "150 VRP",
    type: "Fishing Catch",
    description: "Magically enhanced carp. When prepared over a fire during a short rest, provides 8HP and +1 to Constitution checks for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/enchanted_lake_carp.webp"
  },
  {
    name: "Mystic Rainbow Carp",
    value: "175 VRP",
    type: "Fishing Catch",
    description: "Shimmers with rainbow magic. When prepared during a short rest, provides 8HP and advantage on Charisma checks for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/mystic_rainbow_carp.webp"
  },
  {
    name: "Blessed Lake Trout",
    value: "160 VRP",
    type: "Fishing Catch",
    description: "Touched by divine magic. When prepared during a short rest, provides 8HP and advantage on Wisdom saving throws for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/blessed_lake_trout.webp"
  },
  {
    name: "Spellbound Black Trout",
    value: "200 VRP",
    type: "Fishing Catch",
    description: "Infused with shadow magic. When consumed, provides 10HP and darkvision for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/spellbound_black_trout.webp"
  },
  {
    name: "Wardshell Turtle",
    value: "250 VRP",
    type: "Fishing Catch",
    description: "Its shell pulses with protective magic. When prepared during a short rest, provides 8HP and +2 AC for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/wardshell_turtle.webp"
  },
  {
    name: "Bladeclaw Crab",
    value: "275 VRP",
    type: "Fishing Catch",
    description: "Its claws gleam with magical sharpness. When prepared during a short rest, provides 8HP and +2 to attack and damage rolls for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/bladeclaw_crab.webp"
  },
  {
    name: "Sapphire Crab",
    value: "200 VRP",
    type: "Fishing Catch",
    description: "Its shell sparkles like a gemstone. When boiled during a short rest, provides 8HP and resistance to cold damage for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/sapphire_crab.webp"
  },
  {
    name: "Enchanted Lakeopus",
    value: "300 VRP",
    type: "Fishing Catch",
    description: "A magically enhanced octopus. When consumed, grants +2 to Wisdom checks and advantage on Investigation checks for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/enchanted_lakeopus.webp"
  },
  {
    name: "Lightning Eel",
    value: "225 VRP",
    type: "Fishing Catch",
    description: "Crackles with electrical energy. When consumed, grants +2 to Dexterity saves and the ability to cast Shocking Grasp once.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/lightning_eel.webp"
  },
  {
    name: "Sage Sturgeon",
    value: "250 VRP",
    type: "Fishing Catch",
    description: "Contains ancient wisdom. When prepared during a short rest, grants 8HP, +2 to Intelligence checks, and the ability to understand one additional language for 4 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/sage_sturgeon.webp"
  },
  {
    name: "Phase Swimmer",
    value: "350 VRP",
    type: "Fishing Catch",
    description: "Can slip between dimensions. When consumed, grants the ability to cast Misty Step twice and water breathing for 1 hour.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/phase_swimmer.webp"
  },
  {
    name: "Chrono Bass",
    value: "300 VRP",
    type: "Fishing Catch",
    description: "Time magic flows through its scales. When consumed, grants advantage on Initiative rolls and +10 feet to movement speed for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/chrono_bass.webp"
  },
  {
    name: "Voidscale Gulper",
    value: "400 VRP",
    type: "Fishing Catch",
    description: "Its dark scales absorb light. When consumed, grants 10 temporary hit points, resistance to necrotic damage, and advantage on Stealth checks for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/voidscale_gulper.webp"
  },
  {
    name: "Astral Pike",
    value: "300 VRP",
    type: "Fishing Catch",
    description: "Swims through the astral sea. When prepared properly, grants +2 to Wisdom (Survival) checks and the ability to sense magic within 30 feet for 4 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/astral_pike.webp"
  },
  {
    name: "Harmonic Sturgeon",
    value: "375 VRP",
    type: "Fishing Catch",
    description: "Its barbels detect magical vibrations. When consumed, grants advantage on all Wisdom (Perception) checks and the ability to detect lies for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/harmonic_sturgeon.webp"
  },
  {
    name: "Celestial Perch",
    value: "275 VRP",
    type: "Fishing Catch",
    description: "Blessed by celestial forces. When prepared during a short rest, provides 10HP, +2 to Charisma (Performance) checks, and the ability to cast Light at will for 4 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/celestial_perch.webp"
  },
  {
    name: "Transmutation Minnow",
    value: "225 VRP",
    type: "Fishing Catch",
    description: "Can temporarily alter its form. When consumed, grants the ability to hold breath for 4 times as long and advantage on Constitution saves for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Uncommon",
    image: "assets/images/fish/transmutation_minnow.webp"
  },
  {
    name: "Wardskin Catfish",
    value: "325 VRP",
    type: "Fishing Catch",
    description: "Protected by magical barriers. When consumed, grants 8HP, resistance to force damage, and advantage on saving throws against spells for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Rare",
    image: "assets/images/fish/wardskin_catfish.webp"
  },
  {
    name: "Prismatic Paddlefish",
    value: "450 VRP",
    type: "Fishing Catch",
    description: "Its snout refracts magical energy. When prepared by an expert chef, grants +3 to all ability checks and resistance to one damage type of choice for 2 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/prismatic_paddlefish.webp"
  },
  {
    name: "Moonlight Trout",
    value: "500 VRP",
    type: "Fishing Catch",
    description: "Glows with lunar magic. When consumed under moonlight, grants the ability to cast Moonbeam once and advantage on all saves for 4 hours.",
    location: "Lakes & Riverways",
    rarity: "Epic",
    image: "assets/images/fish/moonlight_trout.webp"
  },
  {
    name: "Planar Gar",
    value: "550 VRP",
    type: "Fishing Catch",
    description: "Exists partially in multiple planes. When prepared under specific lunar conditions, grants resistance to all damage types for 1 hour and the ability to cast Plane Shift once.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/planar_gar.webp"
  },
  {
    name: "Timeless Turtle",
    value: "600 VRP",
    type: "Fishing Catch",
    description: "Unaffected by the passage of time. When consumed, grants +2 to Wisdom, immunity to aging effects, and the ability to cast Slow once for 8 hours.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/timeless_turtle.webp"
  },
  {
    name: "Reality Swimmer",
    value: "700 VRP",
    type: "Fishing Catch",
    description: "Swims through the fabric of reality itself. When consumed, grants water walking, the ability to cast Dimension Door twice, and +3 to all saves for 4 hours.",
    location: "Lakes & Riverways",
    rarity: "Legendary",
    image: "assets/images/fish/reality_swimmer.webp"
  },
  {
    name: "Crimson Emberpetal",
    value: "20 VRP",
    type: "Ingredient (Botanical, Material)",
    rarity: "Uncommon",
    description: "A warm and vital red flower known for its beneficial effects on the body and cardiovascular health. Frequently used as a reagent in restorative and fortifying potions, it is prized both for its practical alchemical applications and its striking beauty.",
    image: "assets/images/crimson_emberpetal.webp"
  },
  {
    name: "Sapphire Gleampetal",
    value: "20 VRP",
    type: "Ingredient (Botanical, Material)",
    rarity: "Uncommon",
    description: "A cool and vital blue flower associated with mental clarity and immune health. Said to enhance potions of magical make, it is a favored reagent among arcanists and healers alike, valued for both its alchemical potency and calming charm.",
    image: "assets/images/sapphire_gleampetal.webp"
  },
  {
    name: "Gildenrods",
    value: "20 VRP",
    type: "Ingredient (Botanical, Material)",
    rarity: "Uncommon",
    description: "A bright and charming golden flower widely used in medical and alchemical processes. Known for its antimicrobial properties and striking appearance, Gildenrods are a reliable and popular reagent among healers, herbalists, and alchemists alike.",
    image: "assets/images/gildenrods.webp"
  },
  {
    name: "Waystone Shard \"Scholia\"",
    value: "Priceless",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A fragment of a once-great magical waystone beacon that allowed students of earlier eras to traverse local campus grounds in the blink of an eye. The rune etched into its surface reads \"Scholia,\" marking its origin and attunement.",
    image: "assets/images/waystone_shard_scholia.webp"
  },
  {
    name: "Waystone Shard \"Aegium Pavilla\"",
    value: "Priceless",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A fragment of a once-great magical waystone beacon that enabled instantaneous travel across the lands surrounding Old Majicka. The rune upon it reads \"Aegium Pavilla,\" an ancient phrase meaning \"The Old Way.\"",
    image: "assets/images/waystone_shard_aegium_pavilla.webp"
  },
  {
    name: "Greensea Coffee Beans",
    value: "10 VRP",
    type: "Ingredient (Botanical, Food)",
    rarity: "Common",
    description: "The go-bean of many universes. Greensea Coffee Beans are known for their woody, earthy flavor profile, with sweet notes of caramel and chocolate, and a nostalgic hint of magical childhood travails.",
    image: "assets/images/greensea_coffee_beans.webp"
  },
  {
    name: "School Clam",
    value: "1 VRP",
    type: "Ingredient (Animal, Food)",
    rarity: "Common",
    description: "A very common shellfish found along lakesides and waterways throughout the Scholian and Majickan regions. Best enjoyed cooked with butter or in soup, and occasionally found to contain a shiny Scholar's Pearl.",
    image: "assets/images/school_clam.webp"
  },
  {
    name: "Scholar's Pearl",
    value: "150 VRP",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A beautiful opalescent and iridescent pearl found within some School Clams. These pearls are believed to be imbued with ambient magic, enhancing the potency of aqueous solutions and alchemical brews.",
    image: "assets/images/scholars_pearl.webp"
  },
  {
    name: "Fellowship Pearl",
    value: "1000 VRP",
    type: "Ingredient (Material)",
    rarity: "Legendary",
    description: "A conjoined triplet pearl of exceptional beauty and power. Sometimes called a Century Triplet Pearl, these legendary reagents form only under the rarest circumstances and radiate profound magical resonance.",
    image: "assets/images/fellowship_pearl.webp"
  },
  {
    name: "Cardiocrysanthea",
    value: "—",
    type: "Ingredient (Botanical)",
    rarity: "Rare",
    description: "Sometimes called Crinkleheart Bottoms due to its twin bell-shaped crimson flowers and spade-like crimson and pink stem mantle. A plant related to Tryphacosmia, it is known for mood-calming, emotionally soothing, and vitality-supporting properties, and is widely used in alchemical and therapeutic preparations.",
    image: "assets/images/cardiocrysanthea.webp"
  },
  {
    name: "White Flower",
    value: "15 VRP",
    type: "Ingredient (Botanical)",
    rarity: "Uncommon",
    description: "A delicate white flower associated with purity and cleanliness magic. Valued both for its aesthetic beauty and its frequent use in rituals, potions, and enchantments concerned with cleansing and sanctification.",
    image: "assets/images/white_flower.webp"
  },
  {
    name: "Vitreye Bloom",
    value: "75 VRP",
    type: "Ingredient (Botanical)",
    rarity: "Rare",
    description: "A rare flower with an eye-like structure of blue and red petals surrounding a dark central core. Strongly associated with magic tied to sight, visions, and peering beyond the boundaries of reality.",
    image: "assets/images/vitreye_bloom.webp"
  },
  {
    name: "Waystone Shard \"Protecium\"",
    value: "Priceless",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A fragment of a sacred waystone inscribed with the rune meaning \"Protector.\" It is associated with the Respite Shrine of the Angelic Protector in Elder Greensea, and is believed to carry lingering warding and sanctuary magic.",
    image: "assets/images/waystone_shard_protecium.webp"
  },
  {
    name: "Coneseeds",
    value: "3 VRP",
    type: "Ingredient (Botanical, Food)",
    rarity: "Common",
    description: "The pine-nuts of common conifer trees found throughout the Scholian woods. Rich, aromatic, and nutty in flavor, they are widely used in meals and dishes. When eaten alone, a handful of Coneseeds restores 1d2 HP.",
    image: "assets/images/coneseeds.webp"
  },
  {
    name: "Waystone Shard \"Arbomemorium\"",
    value: "Priceless",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A fragment of a sacred waystone inscribed with the runic symbol for \"Memory Tree.\" It refers to the widely renowned treehouse known as the Arbomemorium, located within the temperate Greensea Forest bordering the Scholia Campus. The shard is believed to carry lingering magic tied to memory, place, and gentle traversal.",
    image: "assets/images/waystone_shard_arbomemorium.webp"
  },
  {
    name: "Lakale",
    value: "2 VRP",
    type: "Ingredient (Botanical)",
    rarity: "Common",
    description: "A leafy green, kale- or lettuce-like aquatic plant that grows abundantly in Lake Soleista. Commonly harvested as a basic botanical ingredient for cooking, brewing, and low-grade alchemical preparations.",
    image: "assets/images/lakale.webp"
  },
  {
    name: "Drupel",
    value: "4 VRP",
    type: "Ingredient (Botanical)",
    rarity: "Common",
    description: "A fist-sized berry far more sour than a lemon and only faintly sweet. Too tart for most humanoids to eat raw, Drupel is excellent when boiled with other fruits to form the hearty base of jams and preserves, requiring no added citric acid. Its high acid content also makes it useful in many chemical and alchemical reactions.",
    image: "assets/images/drupel.webp"
  },
  {
    name: "Ghost-Piper Stalk (Inner Jungle)",
    value: "35 VRP",
    type: "Ingredient (Botanical)",
    rarity: "Uncommon",
    description: "A pale, chlorophyll-free plant that grows in total darkness within the Inner Jungle. Despite its ghostly appearance, its flower contains an unusually high concentration of capsaicin, making it highly sought after for advanced alchemical refining.",
    image: "assets/images/ghost_piper_stalk.webp"
  },
  {
    name: "Sugar-Sap (Rainforest)",
    value: "5 VRP",
    type: "Ingredient (Botanical)",
    rarity: "Common",
    description: "A thick, amber-colored liquid that bleeds from certain rainforest hardwoods. Less refined and more raw than Turbinado or Star sugars, Sugar-Sap is widely used in cooking, brewing, and early-stage alchemical processes.",
    image: "assets/images/sugar_sap.webp"
  },
  {
    name: "Shellshard (Lake/Riverways)",
    value: "40 VRP",
    type: "Ingredient (Material)",
    rarity: "Uncommon",
    description: "Fragments of an extinct massive iridescent freshwater crustacean found along lakebeds and riverways. Shellshards can be ground into a shimmering powder for alchemical use or shaped and layered into scale-mail.",
    image: "assets/images/shellshard.webp"
  },
  {
    name: "Stellar-Mercury (Inner Jungle)",
    value: "120 VRP",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A liquid metal found in small pools near deep-earth fissures in the Inner Jungle. Highly toxic to handle or ingest, Stellar-Mercury is nevertheless vital for many advanced alchemical and chemical reactions.",
    image: "assets/images/stellar_mercury.webp"
  },
  {
    name: "Gluttonberries",
    value: "150 VRP",
    type: "Ingredient (Botanical, Food)",
    rarity: "Rare",
    description: "These golden, pearlescent berries exude a fine aura when exposed to sunlight. Sometimes called firefly berries due to the fact they retain this light for some time after dusk. They are sweet, juicy, and packed with nutrients and fiber- loaded with everything an adventurer needs.",
    image: "assets/images/Gluttonberries.png"
  },
  {
    name: "Fool's Berries",
    value: "100 VRP",
    type: "Ingredient (Botanical, Food)",
    rarity: "Uncommon",
    description: "These off-yellow, glimmering berries exude a fine sheen when exposed to sunlight. Sometimes called false firefly berries due to the fact they appear to glow for a short time right before sunset. They are sweet, juicy, but have a cutting bitter aftertaste.",
    image: "assets/images/Foolsberries.webp"
  },
  {
    name: "Cattail Fluff",
    value: "5 GP",
    type: "Ingredient (Botanical, Material)",
    rarity: "Common",
    description: "Super-absorbent seed-head fibers harvested from cattails, beaten and processed into a hypoallergenic padding. Essential for high-tier nursery garments, filtration systems, and other applications requiring gentle but effective absorption.",
    image: "assets/images/cattail_fluff.webp"
  },
  {
    name: "Lifeblood Clay",
    value: "8 GP",
    type: "Ingredient (Material)",
    rarity: "Common",
    description: "A fine-grit, striking crimson clay used extensively for traditional nursery pottery and as a pigment base for Scholarian art instruction. Its vivid color and smooth working properties make it a staple material.",
    image: "assets/images/lifeblood_clay.webp"
  },
  {
    name: "Scholian Blue Clay",
    value: "10 GP",
    type: "Ingredient (Material)",
    rarity: "Common",
    description: "A deep-water sediment sometimes deposited along lake shores after churning storms. When fired, it produces a beautiful, water-resistant ceramic commonly used for high-end laboratory vessels and refined dining-ware.",
    image: "assets/images/scholian_blue_clay.webp"
  },
  {
    name: "Lode-Pebble",
    value: "35 GP",
    type: "Ingredient (Material)",
    rarity: "Uncommon",
    description: "Naturally magnetic stones found near iron veins within the Inner Jungle. An essential component in the construction of navigational compasses and magical wayfinding arrays.",
    image: "assets/images/lode_pebble.webp"
  },
  {
    name: "Stormlode",
    value: "70 GP",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A jagged, static-charged silicate formed at lightning strike sites. Stormlode serves as a battery-equivalent for basic magical machinery and is exceedingly rare outside of Stormveil and the Bay of Blitz.",
    image: "assets/images/stormlode.webp"
  },
  {
    name: "Bogsquares",
    value: "4 GP",
    type: "Ingredient (Material)",
    rarity: "Common",
    description: "Compressed squares of peat formed from carbonized organic matter. Bogsquares provide a slow-burning, high-temperature fuel source favored for rustic heating systems and survivalist campsites.",
    image: "assets/images/bogsquares.webp"
  },
  {
    name: "Zephyr-Quartz",
    value: "200 GP",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A clear crystal containing internal gas bubbles that appear to drift and move. Used in air-aligned machinery and buoyancy aids, Zephyr-Quartz was long believed to be depleted following Tabitha’s air campaigns during the old war.",
    image: "assets/images/zephyr_quartz.webp"
  },
  {
    name: "Tumble-Grain",
    value: "5 GP",
    type: "Ingredient (Botanical, Food)",
    rarity: "Common",
    description: "A hardy wild cereal native to the steppes and open plains. Tumble-Grain breaks free from its stalk when mature, rolling across the land with the wind to spread its seeds. Highly nutritious, though it requires significant milling and refining before use in most meals.",
    image: "assets/images/tumble_grain.webp"
  },
  {
    name: "Musk-Pod",
    value: "40 GP",
    type: "Ingredient (Material)",
    rarity: "Rare",
    description: "A potent pheromone extract found within insect mounds and ancient jungle fortifications of the Inner Jungle. Used by Scholarian trackers to attract specific wildlife or to mask the distinct humanoid scent during expeditions.",
    image: "assets/images/musk_pod.webp"
  },
  {
    name: "Congealed Silk",
    value: "28 GP",
    type: "Ingredient (Material)",
    rarity: "Uncommon",
    description: "A high-tensile natural thread harvested from arboreal weaver-spiders in dense jungle canopies. Congealed Silk serves as the base fiber for a wide range of Scholian magic-conductive textiles and enchanted fabrics.",
    image: "assets/images/congealed_silk.webp"
  },
  {
    name: "River-Glass",
    value: "6 GP",
    type: "Ingredient (Material)",
    rarity: "Common",
    description: "Naturally tumbled shards of obsidian and quartz found along riverbanks and lakebeds. River-Glass is commonly used in decorative prisms, simple lenses, and low-grade optical focusing components.",
    image: "assets/images/river_glass.webp"
  },
  {
    name: "Marsh-Mallow Root",
    value: "8 GP",
    type: "Ingredient (Botanical, Food)",
    rarity: "Common",
    description: "A spongy, mucilaginous tuber harvested from marshlands. Marsh-Mallow Root serves as the culinary base for Scholia-approved nursery treats and is widely used in the preparation of soothing medicinal lozenges.",
    image: "assets/images/marsh_mallow_root.webp"
  },
  {
    name: "Rain-Lily",
    value: "20 GP",
    type: "Ingredient (Botanical)",
    rarity: "Uncommon",
    description: "A beautiful rainforest flower that naturally collects pure, sweet liquid during heavy deluges. Rain-Lily acts as a magical stabilizer in liquid-based culinary and alchemical recipes, helping prevent spoilage or magical destabilization.",
    image: "assets/images/rain_lily.webp"
  },
  {
    name: "Serpent-Shed",
    value: "30 GP",
    type: "Ingredient (Material)",
    rarity: "Uncommon",
    description: "A flexible, waterproof dermal layer shed by arboreal reptiles in dense jungle regions. When properly cured, Serpent-Shed becomes a high-grade leather ideal for durable, non-absorbent garments and equipment.",
    image: "assets/images/serpent_shed.webp"
  },
  {
    name: "Bronzewood",
    value: "7 VRP",
    type: "Ingredient (Material)",
    description: "As hard as bronze but workable like timber. Used for crafting durable shafts and reinforcements.",
    rarity: "Common",
    image: "assets/images/bronzewood.webp"
  },
  {
    name: "Common Herb",
    value: "5 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "A simple, dependable herb used in everyday teas, broths, and basic remedies.",
    location: "Greensea Forest, Lissome Plains",
    rarity: "Common",
    image: "assets/images/herb1.png"
  },
  {
    name: "Eldritch Cacao",
    value: "35 VRP",
    type: "Ingredient (Rare, Botanical, Food)",
    description: "A rare, mystical cacao found deep in the darkest spaces of the Greensea Jungle. These pods have veritably \"seen some stuff\" and imbue foods with a bittersweet complement to sweetness and savouriness other herbs and spices fail to deliver. Known to upset the tummy when overeaten, however.",
    rarity: "Rare",
    image: "assets/images/eldritch cacao.webp"
  },
  {
    name: "Glimmergold",
    value: "35 VRP",
    type: "Ingredient (Metal)",
    description: "A rare alchemical powder that sparkles like crushed sunlight, coveted by mages and merchants alike for its enigmatic properties.",
    rarity: "Uncommon",
    image: "assets/images/glimmergold.bak.png"
  },
  {
    name: "Greensea Cacao",
    value: "5 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "Found in the temperate jungles surrounding the Scholia, these pods contain a highly sought-after ingredient in the most coveted of candies: chocolate! While the nibs require some sort of processing to use, the entire cacao pod is usable in some fashion—and most of it is edible!",
    rarity: "Common",
    image: "assets/images/greensea cacao.webp"
  },
  {
    name: "Greenwood",
    value: "7 VRP",
    type: "Ingredient (Material)",
    description: "Wood harvested while still alive and seasoned with alchemy to remain evergreen. Flexible and surprisingly tough.",
    rarity: "Common",
    image: "assets/images/greenwood.webp"
  },
  {
    name: "Hemimetrichite",
    value: "7 VRP",
    type: "Ingredient (Metal)",
    description: "A shimmering crystal with half-formed facets, said to harbor the memories of unfulfilled destinies and ancient lore.",
    rarity: "Common",
    image: "assets/images/hemimetrichite.png"
  },
  {
    name: "Lissome Lemons",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Bright yellow citrus fruits that hum with a low-level static charge. Zesty!",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/lissomelemons.webp"
  },
  {
    name: "Lissome Soybeans",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Radiant beans that grow in the sun-drenched Lissome Plains. High in protein and oddly shiny.",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/lissomesoybeans.webp"
  },
  {
    name: "Phoenix Feather",
    value: "250 VRP",
    type: "Ingredient (Legendary, Essence)",
    description: "A warm, ember-bright feather said to carry a spark of renewal and unyielding will.",
    rarity: "Legendary",
    image: "assets/images/Sunset Essence.png"
  },
  {
    name: "Plains Peanuts",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Humble legumes dug from the earth of the Lissome Plains. Rich, oily, and distinctly nutty.",
    location: "Lissome Plains",
    rarity: "Common",
    image: "assets/images/plainspeanuts.webp"
  },
  {
    name: "Planar Cherry",
    value: "35 VRP",
    type: "Ingredient (Rare, Food)",
    description: "A cherry that exists in three dimensions and tastes like it belongs in four. Bursting with tart, reality-bending juice.",
    rarity: "Rare",
    image: "assets/images/planarcherry.webp"
  },
  {
    name: "Rice",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "A staple grain that serves as the foundation for countless meals and treats.",
    rarity: "Common",
    image: "assets/images/rice.webp"
  },
  {
    name: "Royal Rice",
    value: "250 VRP",
    type: "Ingredient (Legendary, Food)",
    description: "Prismatic grains harvested from the Emperor's celestial paddies. They hum with a faint, regal melody when poured.",
    rarity: "Legendary",
    image: "assets/images/royalrice.webp"
  },
  {
    name: "Simple Herb",
    value: "5 VRP",
    type: "Ingredient (Botanical, Food)",
    description: "A mild, dependable herb commonly steeped into simple teas and broths.",
    rarity: "Common",
    image: "assets/images/Savour Herb.png"
  },
  {
    name: "Turbonado Sugar",
    value: "250 VRP",
    type: "Ingredient (Legendary, Food)",
    description: "With the awesome gastronomic might of the flavor matrix, even plain white sugar can be elevated to godly tiers of taste sensation!",
    rarity: "Legendary",
    image: "assets/images/TurbonadoSugar.png"
  },
  {
    name: "Water",
    value: "5 VRP",
    type: "Ingredient (Food)",
    description: "Clean water suitable for cooking, brewing, and keeping doughs and teas from drying out.",
    rarity: "Common",
    image: "assets/images/Spring Water.png"
  },
  {
    name: "Water Essence",
    value: "12 VRP",
    type: "Ingredient (Essence)",
    description: "A distilled essence of pure water, refined for alchemical stability and gentle infusion.",
    rarity: "Uncommon",
    image: "assets/images/Spring Water.png"
  },
  {
    name: "Wildflower Honey-Cream",
    value: "5 VRP",
    type: "Ingredient (Food, Botanical)",
    description: "A golden cream swirled with wildflower nectar, exuding the essence of springtime warmth and renewal.",
    rarity: "Common",
    image: "assets/images/Wildflower Honey-Cream.bak.png"
  },
  {
    name: "Yeast",
    value: "5 VRP",
    type: "Ingredient (Biological)",
    description: "A living leavening agent essential for rising doughs and brewing effervescent drinks.",
    rarity: "Common",
    image: "assets/images/yeast.webp"
  },
  {
    name: "Berreems",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "A large, incredibly juicy cluster of grape-like berries native to the safer outskirts of the Greensea Expanse. When bitten into, they burst with a sweet, floral nectar that stains the tongue a vibrant purple. Often gathered by students skipping classes in the Campus Woods, eating a handful of Berreems provides a minor burst of energy, restoring 1d4 hit points.",
    location: "Greensea Expanse, Campus Woods",
    rarity: "Common",
    image: "assets/images/berreems.webp"
  },
  {
    name: "Greensea Nanners",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "A staple fruit harvested from the towering, broad-leafed trees bordering the Marshland Nexus. Greensea Nanners possess a slightly thicker peel than mundane bananas and a soft, subtly minty flavor underneath the standard sweetness. They are a favored snack for long expeditions, known to settle nervous stomachs and provide a +1 bonus to Constitution saving throws against nausea for 1 hour.",
    location: "Marshland Nexus, Greensea Expanse",
    rarity: "Common",
    image: "assets/images/greenseananners.webp"
  },
  {
    name: "Everripe Nanners",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "A remarkable, magically stabilized variant of the Greensea Nanner. Touched by the ambient mana of the Campus Woods, these nanners never bruise, rot, or over-ripen, maintaining a perfect, starchy sweetness indefinitely. Consuming an Everripe Nanner provides the nutritional equivalent of a full day's rations and grants the eater advantage on their next Potty Check (Continence Check) within 24 hours.",
    location: "Campus Woods",
    rarity: "Uncommon",
    image: "assets/images/everripenanners.webp"
  },
  {
    name: "Ampule of Powdered Fairy Farts",
    value: "N/A",
    type: "Ingredient (Essence)",
    description: "A tiny, corked glass vial filled with a swirling, glittering pink-and-gold dust. Despite the crude name given by Academy alchemists, this substance is the crystallized byproduct of fey mischief from the deep Campus Woods. It smells faintly of cotton candy and ozone. It is highly volatile; when used as an alchemical base or spell component, it can double the duration of Charm or Illusion effects, though it carries a 10% chance to make the caster uncontrollably giggle for 1 minute.",
    location: "Campus Woods",
    rarity: "Rare",
    image: "assets/images/fairyfarts.webp"
  },
  {
    name: "Funky Gotato",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "A Gotato that has been exposed to the psychic pollution leaking from the Sunken Tower in the Marshland Nexus. It is bruised in unnatural hues of bruised purple and sickly green, emitting a foul, rotting odor. Unfit for consumption, eating one requires a DC 13 Constitution saving throw, inflicting the Poisoned condition and 1d6 poison damage on a failure. However, skilled poisoners value its extract for crafting noxious tinctures.",
    location: "Marshland Nexus (Sunken Tower)",
    rarity: "Uncommon",
    image: "assets/images/funkygotato.webp"
  },
  {
    name: "Gotato",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "The humble Gotato is the foundational tuber of Scholia Diaspros. Hearty, starchy, and easily cultivated in the magically enriched soils of the Academy's outer farms. It can be boiled, mashed, or stuck in a stew. While it offers no magical benefits, it is filling, cheap, and a staple of the cafeteria's Tuesday menu.",
    location: "Academy Outer Farms",
    rarity: "Common",
    image: "assets/images/gotato.webp"
  },
  {
    name: "Potonade",
    value: "N/A",
    type: "Crafted (Weapon)",
    description: "A highly volatile, magically desiccated Gotato. Combat Academy students discovered that by rapidly drawing the moisture out of a Gotato while infusing it with basic evocation magic, the tuber becomes a rock-hard impact explosive. As an action, a character can throw a Potonade at a point up to 60 feet away. Each creature within 5 feet of that point must succeed on a DC 12 Dexterity saving throw, taking 2d6 force damage on a failed save, or half as much on a successful one. It smells faintly of burnt french fries when detonated.",
    location: "Combat Academy",
    rarity: "Uncommon",
    image: "assets/images/potonade.webp"
  },
  {
    name: "Greensea Matoto",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "An exotic, deep-teal tomato variant native to the damp soils near the Creekfalls. The Greensea Matoto is bursting with a savory, almost salty juice that is highly sought after by culinary students. When used in cooking, it acts as a natural preservative, and consuming it raw grants a minor soothing effect, briefly suppressing the effects of minor magical compulsions.",
    location: "Greensea Expanse (Creekfalls)",
    rarity: "Uncommon",
    image: "assets/images/greenseamatoto.webp"
  },
  {
    name: "Honey",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "Standard, sticky, sweet golden honey harvested from the giant, docile bumblebees kept by the Academy's agricultural department. Used widely in both baking and basic potion brewing to bind volatile ingredients together. It never spoils.",
    location: "Academy Agricultural Department",
    rarity: "Common",
    image: "assets/images/honey.webp"
  },
  {
    name: "Baybee Honey",
    value: "N/A",
    type: "Ingredient (Food)",
    description: "A deluxe, opalescent honey produced only by the elusive Nursery Nightweaver spiders who have been coaxed into cultivating enchanted pollen. This thick, soothing syrup tastes of vanilla and warm milk. Consuming a spoonful as an action immediately removes the Frightened condition, stabilizes a character's emotions, and grants advantage on Constitution saving throws against magical stress for 1 hour. It is a highly coveted ingredient in high-tier soothing tinctures.",
    location: "Campus Woods",
    rarity: "Rare",
    image: "assets/images/baybeehoney.webp"
  },
  {
    name: "Jungle Iron",
    value: "N/A",
    type: "Ingredient (Metal)",
    description: "A peculiar, rust-resistant metal harvested from the depths of the Greensea Expanse. Jungle Iron has a natural greenish tint and is remarkably lightweight for its durability. It is frequently used by artificers to craft structural reinforcements for heavy-duty diapers (such as the TactiTush Elite) or to forge lightweight martial weapons.",
    location: "Greensea Expanse",
    rarity: "Uncommon",
    image: "assets/images/jungleiron.webp"
  },
  {
    name: "Prized Jungle Iron",
    value: "N/A",
    type: "Ingredient (Metal)",
    description: "A highly purified ingot of Jungle Iron, forged using Old War techniques or found in pristine condition deep within the Marshland Nexus. This metal naturally hums with a faint, stabilizing magic. Armor or weapons crafted with Prized Jungle Iron gain a permanent +1 bonus to AC or attack/damage rolls respectively, and padding reinforced with it automatically gains an extra Use Charge capacity.",
    location: "Marshland Nexus",
    rarity: "Rare",
    image: "assets/images/prizedjungleiron.webp"
  },
  {
    name: "Old War Scrap",
    value: "N/A",
    type: "Ingredient (Material)",
    description: "Jagged, scorched remnants of armor, siege engines, or magical focuses left behind from the First Internal Siege when Tabitha Caelestis's ambition scarred the Academy. These scraps still resonate with raw, chaotic mana from the Old War. While dangerous to handle raw, skilled artificers can melt down Old War Scrap to infuse weapons with unpredictable elemental damage or craft items that can pierce magical wards.",
    location: "Old War sites",
    rarity: "Rare",
    image: "assets/images/oldwarscrap.webp"
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
