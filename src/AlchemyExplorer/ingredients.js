const ingredients = [
    // Regular Ice Cream Ingredients
    {
        id: 'cream',
        name: 'Cream',
        description: 'Fresh dairy cream, essential for making ice cream and other desserts.',
        category: ['food'],
        image: 'assets/images/Cream.webp',
        color: '#fff5e6'
    },
    {
        id: 'white-sugar',
        name: 'White Sugar',
        description: 'Refined sugar that adds sweetness to any recipe.',
        category: ['food'],
        image: 'assets/images/White Sugar.webp',
        color: '#ffffff'
    },
    {
        id: 'egg',
        name: 'Egg',
        description: 'A common binding agent used in cooking and baking.',
        category: ['food'],
        image: 'assets/images/Egg.webp',
        color: '#ffe0b3'
    },
    {
        id: 'vanilla',
        name: 'Vanilla',
        description: 'A fragrant flavoring extracted from vanilla pods.',
        category: ['food', 'botanical', 'essence'],
        image: 'assets/images/Vanilla.webp',
        color: '#f5e3c4'
    },

    // Legendary Ice Cream Ingredients
    {
        id: 'azure-cream',
        name: 'Azure Moon Cream',
        description: 'Legendary cream harvested under a blue moon. Glows with ethereal light.',
        category: ['legendary', 'food'],
        image: 'assets/images/Azure Moon Cream.webp',
        color: '#8eb8e5'
    },
    {
        id: 'star-sugar',
        name: 'Star Sugar',
        description: 'Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.',
        category: ['legendary', 'food'],
        image: 'assets/images/Star Sugar.webp',
        color: '#e0e0ff'
    },
    {
        id: 'lunar-egg',
        name: 'Lunar-Dodo Egg',
        description: 'An egg from the rare Lunar-Dodo bird. Emits a soft blue glow.',
        category: ['legendary', 'food'],
        image: 'assets/images/Lunar-Dodo Egg.webp',
        color: '#c4d8f5'
    },
    {
        id: 'starsoaked-vanilla',
        name: 'Starsoaked Vanilla',
        description: 'Vanilla beans that have been bathed in starlight for a full lunar cycle.',
        category: ['legendary', 'botanical', 'food', 'essence'],
        image: 'assets/images/Starsoaked Vanilla.webp',
        color: '#d2c4f5'
    },
    {
        id: 'night-sky',
        name: 'Distillation of a Night Sky',
        description: 'The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Distillation of a Night Sky.webp',
        color: '#0a1a3f'
    },
    {
        id: 'flavor-matrix',
        name: 'Flavor Matrix',
        description: 'Made from the distillation of Candy Elemental, this crystallized flavor matrix can radically expand the flavor profile of many food items- and even unlock the hidden potential of some ingredients.',
        category: ['legendary'],
        image: 'assets/images/Flavor Matrix.webp',
        color: '#7986cb'
    },
    {
        id: 'turbonado-sugar',
        name: 'Turbonado Sugar',
        description: 'With the awesome gastronomic might of the flavor matrix, even plain white sugar can be elevated to godly tiers of taste sensation!',
        category: ['legendary', 'food'],
        image: 'assets/images/TurbonadoSugar.webp',
        color: '#b39ddb'
    },
    {
        id: 'liquid-pain',
        name: 'Liquid Pain',
        description: 'A shifting, blood‑red fluid pulsing as though alive, harvested from the shattered hearts of fiends—dangerous, potent, and steeped in dark magic.',
        category: ['legendary', 'food', 'essence'],
        image: 'assets/images/Liquid Pain.webp',
        color: '#8b0000'
    },
    {
        id: 'touch-of-love',
        name: 'Touch of Love',
        description: 'The \'most common\' of Legendary Ingredients is one many can make themselves- but isn\'t it being so common a good thing? <3',
        category: ['legendary', 'exotic', 'essence'],
        image: 'assets/images/Touch of Love.webp',
        color: '#ffb6c1'
    },

    // New Ingredients
    {
        id: 'wildflower-honey-cream',
        name: 'Wildflower Honey-Cream',
        description: 'A golden cream swirled with wildflower nectar, exuding the essence of springtime warmth and renewal.',
        category: ['food', 'botanical'],
        image: 'assets/images/Wildflower Honey-Cream.bak.webp',
        color: '#ffd700'
    },
    {
        id: 'birch-syrup',
        name: 'Birch Syrup',
        description: 'A rare syrup tapped from ancient, enchanted birch trees; each drop resonates with the forest\'s whispered secrets.',
        category: ['food', 'botanical'],
        image: 'assets/images/Birch Syrup.bak.webp',
        color: '#8b4513'
    },
    {
        id: 'chromatic-platinum',
        name: 'Chromatic Platinum',
        description: 'A resplendent metal alloy imbued with shifting prismatic hues, radiating a subtle magical aura.',
        category: ['legendary', 'metal'],
        image: 'assets/images/Chromatic Platinum.webp',
        color: '#e5e4e2'
    },
    {
        id: 'dreamvapor',
        name: 'Dreamvapor',
        description: 'An ephemeral mist carrying the scents of lavender and lost lullabies, slipping away like a fragment of a fading dream.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Dreamvapor.webp',
        color: '#e6e6fa'
    },
    {
        id: 'fractal-copper',
        name: 'Fractal Copper',
        description: 'A mysterious, ever-fractalizing metal whose intricate patterns appear only under the full moon\'s light.',
        category: ['metal'],
        image: 'assets/images/Fractal Copper.webp',
        color: '#b87333'
    },
    {
        id: 'defractor-prism',
        name: 'Defractor Prism',
        description: 'Differentiates magical, material, and chemical processes, allowing for breakdown of materials into their components.',
        category: ['rare'],
        image: 'assets/images/Defractor Prism.webp',
        color: '#f0f8ff'
    },
    {
        id: 'glimmelectrum',
        name: 'Glimmelectrum',
        description: 'A radiant, mysterious alloy that hums with magical energy, capturing and reflecting light in mesmerizing patterns.',
        category: ['metal'],
        image: 'assets/images/Glimmelectrum.webp',
        color: '#e5e4e2'
    },
    {
        id: 'glimmergold',
        name: 'Glimmergold',
        description: 'A rare alchemical powder that sparkles like crushed sunlight, coveted by mages and merchants alike for its enigmatic properties.',
        category: ['metal'],
        image: 'assets/images/glimmergold.bak.webp',
        color: '#ffd700'
    },
    {
        id: 'sunset-essence',
        name: 'Sunset Essence',
        description: 'Captured at the fleeting moment of twilight, this radiant liquid holds the fading light of a dying day, evoking enchanting warmth and mystery.',
        category: ['rare', 'food', 'essence'],
        image: 'assets/images/Sunset Essence.webp',
        color: '#ffa07a'
    },
    {
        id: 'hemimetrichite',
        name: 'Hemimetrichite',
        description: 'A shimmering crystal with half-formed facets, said to harbor the memories of unfulfilled destinies and ancient lore.',
        category: ['metal'],
        image: 'assets/images/hemimetrichite.webp',
        color: '#c0c0c0'
    },
    {
        id: 'starshot-ore',
        name: 'Starshot Ore',
        description: 'A celestial metallic fragment believed to have fallen from the heavens; it glimmers with soft starlight even in utter darkness.',
        category: ['metal'],
        image: 'assets/images/Starshot Ore.webp',
        color: '#e6e6fa'
    },
    {
        id: 'orichalchite',
        name: 'Orichalchite',
        description: 'Often called "orichalcum\'s ghost," this peculiar mineral shifts between the material and ethereal realms, evoking lost legends.',
        category: ['metal'],
        image: 'assets/images/Orichalchite.webp',
        color: '#daa520'
    },
    {
        id: 'jadicine',
        name: 'Jadicine',
        description: 'A translucent green substance, rumored to be distilled from the tears of a jade dragon, soothing the mind and mending wounds.',
        category: ['exotic'],
        image: 'assets/images/Jadicine.webp',
        color: '#90ee90'
    },
    {
        id: 'matrix-malachite',
        name: 'Matrix Malachite',
        description: 'A stone of intricate interlocking veins, its mystifying patterns hint at the buried wisdom of ancient sages.',
        category: ['metal'],
        image: 'assets/images/matrixmalachite.webp',
        color: '#2e8b57'
    },
    {
        id: 'prismatic-activator',
        name: 'Prismatic Activator',
        description: 'A dazzling device shimmering with the full spectrum of colors, designed to unlock hidden magical potentials with a decisive spark.',
        category: ['legendary', 'rare'],
        image: 'assets/images/Prismatic Activator.webp',
        color: '#ff69b4'
    },
    {
        id: 'phoenix-feather',
        name: 'Phoenix Feather',
        description: 'A warm, ember-bright feather said to carry a spark of renewal and unyielding will.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Sunset Essence.webp',
        color: '#ff7f50'
    },
    {
        id: 'rock-salt',
        name: 'Rock Salt',
        description: 'A coarse, naturally occurring crystalline salt harvested from ancient deposits. It lends a distinct crunch and subtle brininess to recipes.',
        category: ['metal', 'food'],
        image: 'assets/images/Rock Salt.webp',
        color: '#e0e0e0'
    },
    {
        id: 'flour',
        name: 'Flour',
        description: 'A finely milled powder ground from high-quality grains, known for its versatile binding properties and delicate, neutral flavor.',
        category: ['food'],
        image: 'assets/images/Flour.webp',
        color: '#fff5e6'
    },
    {
        id: 'water-essence',
        name: 'Water Essence',
        description: 'A distilled essence of pure water, refined for alchemical stability and gentle infusion.',
        category: ['essence'],
        image: 'assets/images/Spring Water.webp',
        color: '#bfefff'
    },
    {
        id: 'savour-herb',
        name: 'Savour Herb',
        description: 'A common botanical with a rich, savory aroma.',
        image: 'assets/images/Savour Herb.webp',
        category: ['botanical'],
        defaultCount: 5
    },
    {
        id: 'common-herb',
        name: 'Common Herb',
        description: 'A simple, dependable herb used in everyday teas, broths, and basic remedies.',
        category: ['botanical', 'food'],
        image: 'assets/images/herb1.webp',
        color: '#7cfc90'
    },
    {
        id: 'sweetleaf',
        name: 'Sweetleaf',
        description: 'Naturally sweet leaves that add a delicate sweetness without overpowering other flavors.',
        category: ['food', 'botanical'],
        image: 'assets/images/Sweetleaf.webp',
        color: '#98fb98'
    },
    {
        id: 'tastetanium-crystal',
        name: 'Tastetanium Crystal',
        description: 'This anomalous crystalline lattice of freestate energy interacts with ingredients to create new and novel building blocks for taste sensation! It\'s also incredibly durable, but who cares about that?',
        category: ['legendary', 'metal', 'food'],
        image: 'assets/images/Tastetanium Crystal.webp',
        color: '#b19cd9'
    },
    {
        id: 'butter',
        name: 'Butter',
        description: 'A rich, creamy spread made from churned cream and salt. Essential for countless recipes.',
        category: ['food'],
        image: 'assets/images/Butter.webp',
        color: '#fff4c4'
    },
    {
        id: 'whipped-butter',
        name: 'Whipped White Butter',
        description: 'Light and airy butter whipped to perfection. Spreads like a dream.',
        category: ['food'],
        image: 'assets/images/Whipped White Butter.webp',
        color: '#fffff0'
    },
    {
        id: 'herb-butter',
        name: 'Herb Butter',
        description: 'Delicious and flavorful, with hints of savory rosemary and garlic common to savourherb.',
        category: ['food'],
        image: 'assets/images/Herb Butter.webp',
        color: '#e6ffe6'
    },
    {
        id: 'magibutter',
        name: 'Magibutter',
        description: 'This incredibutter brings all of the flavor and joy of butter, with all of the protein and vitamins and minerals, but somehow no calories! Whoa!',
        category: ['food'],
        image: 'assets/images/Magibutter.webp',
        color: '#e6e6fa'
    },
    {
        id: 'yarn',
        name: 'Yarn',
        description: 'Finely spun fiber used in weaving and knitting, prized for its delicate texture and potential enchantments in crafted garments.',
        category: ['textile'],
        image: 'assets/images/Yarn.webp',
        color: '#d9a066'
    },
    {
        id: 'darkessence',
        name: 'Darkessence',
        description: 'A mysterious, shadow-infused essence that exudes an aura of hidden power, often employed in dark magical rites.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Darkessence.webp',
        color: '#301934'
    },
    {
        id: 'darkling-residue',
        name: 'Darkling Residue',
        description: 'Can be used as a component for Stench Strike or Foul Fragrance spells.',
        category: ['essence'],
        image: '../src/assets/images/darklingresidue.png',
        color: '#4f5a4c'
    },
    {
        id: 'umbral-weave-fragment',
        name: 'Umbral Weave Fragment',
        description: 'Powerful component for necrotic/fear-based spells, or imbues a weapon with 1d4 necrotic damage for one attack.',
        category: ['rare', 'essence'],
        image: '../src/assets/images/umbralweavefragment.png',
        color: '#32263f'
    },
    {
        id: 'plasticizer',
        name: 'Plasticizer',
        description: 'A transformative substance used to soften and mold plastics, enabling materials to be fashioned into flexible forms.',
        category: ['essence'],
        image: 'assets/images/Plasticizer.webp',
        color: '#a3c1ad'
    },
    {
        id: 'vitalium',
        name: 'Vitalium',
        description: 'A shimmering metal imbued with the essence of life, frequently harnessed to empower enchanting constructs and devices.',
        category: ['crystal', 'exotic'],
        image: 'assets/images/Vitalium.webp',
        color: '#7cfc00'
    },
    {
        id: 'vitalocanum',
        name: 'Vitalocanum',
        description: 'A potent compound derived from Vitalium, renowned for its ability to bridge the gap between vitality and arcane energies.',
        category: ['crystal', 'exotic'],
        image: 'assets/images/Vitalocanum.webp',
        color: '#7fff00'
    },
    {
        id: 'adhesive',
        name: 'Adhesive',
        description: 'A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.',
        category: ['essence'],
        image: 'assets/images/Adhesive.webp',
        color: '#ffff99'
    },
    {
        id: 'cotton-fluff',
        name: 'Cotton Fluff',
        description: 'A soft, airy fluff derived from cotton fibers, cherished for its light, cushioning properties and gentle texture.',
        category: ['textile', 'crafted'],
        image: 'assets/images/Cotton Fluff.webp',
        color: '#ffffff'
    },
    {
        id: 'plastic-sheeting',
        name: 'Plastic Sheeting',
        description: 'A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.',
        category: ['crafted', 'textile'],
        image: 'assets/images/Plastic Sheeting.webp',
        color: '#e0e0e0'
    },
    {
        id: 'petrodistillate',
        name: 'Petrodistillate',
        description: 'A refined, volatile extract from crude oil, known for its flammable characteristics and use in catalyzing various reactions.',
        category: ['essence'],
        image: 'assets/images/Petrodistillate.webp',
        color: '#2f4f4f'
    },
    {
        id: 'robusca',
        name: 'Robusca',
        description: 'A dense, robust crystalline alloy prized for its exceptional strength and durability, ideal for crafting heavy-duty tools and resilient structures.',
        category: ['crystal'],
        image: 'assets/images/Robusca.webp',
        color: '#708090'
    },
    {
        id: 'solvent',
        name: 'Solvent',
        description: 'A volatile liquid compound known for its ability to dissolve and extract substances, essential in various alchemical and industrial processes.',
        category: ['essence'],
        image: 'assets/images/Solvent.webp',
        color: '#87ceeb'
    },
    {
        id: 'barkgum',
        name: 'Barkgum',
        description: 'A sticky and rubbery organic compound refined from the sap of certain types of trees. It is used as a base to make an enormous array of products from chewing-gum to glue to rubber.',
        category: ['botanical'],
        image: 'assets/images/Barkgum.webp',
        color: '#8b4513'
    },
    {
        id: 'berrimaters',
        name: 'Berrimaters',
        description: 'Small, round, savory and sweet, these cherry-red little guys are awfully fun to eat! And they pair well with many treats, so you can flex your cooking feats!',
        category: ['botanical', 'food'],
        image: 'assets/images/Berrimaters.webp',
        color: '#c41e3a'
    },
    {
        id: 'common-mushroom',
        name: 'Common Mushroom',
        description: 'A simple edible mushroom commonly used as food. When consumed, it restores 1 HP.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/common_mushroom.webp',
        color: '#d9d0bf'
    },
    {
        id: 'blushcap-puffball',
        name: 'Blushcap Puffball',
        description: 'A soft pink mushroom that releases a visible cloud of harmless spores when disturbed. Creatures exposed must succeed a mild composure check or become flustered and distracted for 1 minute.',
        category: ['botanical'],
        image: '../src/assets/images/blushcap_puffball.webp',
        color: '#f2b6c9'
    },
    {
        id: 'nightshroom',
        name: 'Nightshroom',
        description: 'A dark, alchemically reactive fungus. If consumed directly, it deals 1 HP of damage. Commonly used as a base ingredient for various concoctions.',
        category: ['rare', 'botanical'],
        image: '../src/assets/images/nightshroom.webp',
        color: '#3b324a'
    },
    {
        id: 'pottytime-fungus',
        name: 'Pottytime Fungus',
        description: 'A peculiar mushroom that restores 1 HP when consumed, but immediately forces a potty-check at disadvantage. Frequently used as a base ingredient for experimental concoctions.',
        category: ['rare', 'botanical'],
        image: '../src/assets/images/pottytime_fungus.webp',
        color: '#d9b56e'
    },
    {
        id: 'lashvine',
        name: 'Lashvine',
        description: 'A sturdy eight-foot length of heavy-duty jungle vine that can be used as rope without any further modification.',
        category: ['botanical'],
        image: '../src/assets/images/lashvine.webp',
        color: '#4d8a53'
    },
    {
        id: 'secondthought-sprout',
        name: 'Secondthought Sprout',
        description: 'A reflective herb that sharpens judgment. When consumed, it grants advantage on one Wisdom save, but imposes disadvantage on the next Dexterity check.',
        category: ['rare', 'botanical'],
        image: '../src/assets/images/secondthought_sprout.webp',
        color: '#7da37b'
    },
    {
        id: 'scholarian-wizard-weed',
        name: 'Scholarian Wizard Weed',
        description: 'A weird and wonderfully colored herb notable for growing near the Academy. It strongly promotes euphoria and good vibes, often at the cost of a little maturity.',
        category: ['rare', 'botanical'],
        image: '../src/assets/images/scholarian_wizard_weed.webp',
        color: '#8c68d9'
    },
    {
        id: 'chronal-crystal',
        name: 'Chronal Crystal',
        description: 'A shimmering crystal that seems to pulse with the flow of time itself. It is said to have the power to manipulate temporal energies, allowing for brief glimpses into the past or future.',
        category: ['legendary', 'crystal'],
        image: '../src/assets/images/chronal_crystal.webp',
        color: '#88d5ff'
    },
    {
        id: 'atem-pod',
        name: 'Atem Pod',
        description: 'An odd, sticky, resinous pod known for its ability to be concentrated into a potent combat and performance stimulant.',
        category: ['legendary', 'botanical'],
        image: '../src/assets/images/atem_pod.webp',
        color: '#9b4035'
    },
    {
        id: 'fuddleroot',
        name: 'Fuddleroot',
        description: 'An old and trusted remedy of the crinkly-crawlies, and a well-known analgesic with potent poppy-like qualities and taste. Concentrated forms are softly banned, though the raw root is permitted.',
        category: ['legendary', 'botanical'],
        image: '../src/assets/images/fuddleroot.webp',
        color: '#b38359'
    },
    {
        id: 'tryphacosmia',
        name: 'Tryphacosmia',
        description: 'A rare purple and red-petaled flower once called Elf Sleep Toxin. Its hallucinogenic properties are strong enough to induce a sleep-like catatonia even in sleep-immune individuals. Banned on scholia grounds in both raw and concentrated form, it nevertheless appears in prank powders and recreational tinctures across the realm and campus.',
        category: ['legendary', 'botanical'],
        image: '../src/assets/images/tryphacosmia.webp',
        color: '#8b3da8'
    },
    {
        id: 'whimleaf-curl',
        name: 'Whimleaf Curl',
        description: 'A botanical leaf that induces light euphoria and playful behavior. Users suffer a minor penalty to seriousness-based checks for 10 minutes. Often brewed into teas or concentrated into tinctures for more pronounced effects. Its use became unrestricted following the loosening of the Controlled Magical Substances Act of 51BT.',
        category: ['rare', 'botanical'],
        image: '../src/assets/images/whimleaf_curl.webp',
        color: '#86d87d'
    },
    {
        id: 'dozerbell-lily',
        name: 'Dozerbell Lily',
        description: 'A mildly sedative flowering plant. Consuming it imposes disadvantage on initiative rolls for 10 minutes, but grants advantage on the next Constitution save.',
        category: ['rare', 'botanical'],
        image: '../src/assets/images/dozerbell_lily.webp',
        color: '#9d8fd6'
    },

    // Pantry + Tea Time
    {
        id: 'water',
        name: 'Water',
        description: 'Clean water suitable for cooking, brewing, and keeping doughs and teas from drying out.',
        category: ['food'],
        image: 'assets/images/Spring Water.webp',
        color: '#e6f3ff'
    },
    {
        id: 'spring-water',
        name: 'Spring Water',
        description: 'Pure water drawn from pristine natural springs, enriched with essential minerals to enhance clarity and freshness.',
        category: ['food'],
        image: 'assets/images/Spring Water.webp',
        color: '#cfefff'
    },
    {
        id: 'simple-herb',
        name: 'Simple Herb',
        description: 'A mild, dependable herb commonly steeped into simple teas and broths.',
        category: ['botanical', 'food'],
        image: 'assets/images/Savour Herb.webp',
        color: '#7cfc90',
        defaultCount: 5
    },

    // Cacao (for cookies and pies)
    {
        id: 'greensea-cacao',
        name: 'Greensea Cacao',
        description: 'Found in the temperate jungles surrounding the Scholia, these pods contain a highly sought-after ingredient in the most coveted of candies: chocolate! While the nibs require some sort of processing to use, the entire cacao pod is usable in some fashion—and most of it is edible!',
        category: ['botanical', 'food'],
        image: 'assets/images/greensea cacao.webp',
        color: '#5b3a29'
    },
    {
        id: 'eldritch-cacao',
        name: 'Eldritch Cacao',
        description: 'A rare, mystical cacao found deep in the darkest spaces of the Greensea Jungle. These pods have veritably "seen some stuff" and imbue foods with a bittersweet complement to sweetness and savouriness other herbs and spices fail to deliver. Known to upset the tummy when overeaten, however.',
        category: ['rare', 'botanical', 'food'],
        image: 'assets/images/eldritch cacao.webp',
        color: '#2b1a1a'
    },

    // Cookie + Cake Crafted Items (also usable as ingredients)
    {
        id: 'caramel',
        name: 'Caramel',
        description: 'Topping, treat, and all-around excellent ingredient, it has a place in many recipes, including some you wouldn\'t expect!',
        category: ['food', 'crafted'],
        image: 'assets/images/caramel.webp',
        color: '#c68642'
    },
    {
        id: 'magicaramel',
        name: 'Magicaramel',
        description: 'It\'s caramel, but magic... so it\'s better...',
        category: ['food', 'crafted'],
        image: 'assets/images/magicaramel.webp',
        color: '#d4a36a'
    },
    {
        id: 'vanilla-frosting',
        name: 'Vanilla Frosting',
        description: 'The standard in frosting, and hard to mess up whether in the kitchen or in the lab—and darn tasty, too!',
        category: ['food', 'crafted'],
        image: 'assets/images/vanilla frosting.webp',
        color: '#f7f0df'
    },
    {
        id: 'white-cake',
        name: 'White Cake',
        description: 'While it can certainly be said that it\'s plain, it\'s never dull—it\'s cake!',
        category: ['food', 'crafted'],
        image: 'assets/images/white cake_birefnet.webp',
        color: '#fff7ef'
    },
    {
        id: 'sugar-cookie',
        name: 'Sugar Cookie',
        description: 'The simplest of cookies, and a simple pleasure.',
        category: ['food', 'crafted'],
        image: 'assets/images/sugar cookie.webp',
        color: '#f3d9a6'
    },
    {
        id: 'simple-waffle-cookie',
        name: 'Simple Waffle Cookie',
        description: 'A waffle cookie sandwiching a layer of caramel.',
        category: ['food', 'crafted'],
        image: 'assets/images/simple waffle cookie.webp',
        color: '#d2a679'
    },
    {
        id: 'chocochipper',
        name: 'Chocochipper',
        description: 'Classic and traditional—but by no means boring! Who can shame a perfect chocolate chip cookie?!',
        category: ['food', 'crafted'],
        image: 'assets/images/chocochipper.webp',
        color: '#8b5a2b'
    },
    {
        id: 'eldritch-chocochipper',
        name: 'Eldritch Chocochipper',
        description: 'A rare and delicious subtype of the definitive regent of regal cookies—extra dark, extra magical.',
        category: ['food', 'crafted'],
        image: 'assets/images/eldritch chocochipper.webp',
        color: '#3b2b2b'
    },
    {
        id: 'cookies-and-cream-pie',
        name: 'Cookies and Cream Pie',
        description: 'A favorite for some, and a sometimes-treat for others, but undeniably delicious and rich.',
        category: ['food', 'crafted'],
        image: 'assets/images/cookies and cream pie.webp',
        color: '#e8e1d6'
    },
    {
        id: 'magic-stroopwafel',
        name: 'Magic Stroopwafel',
        description: 'Two magically infused and buttery waffle cookies sandwich a sumptuous and generous layer of caramel.',
        category: ['food', 'crafted'],
        image: 'assets/images/magic stroopwafel.webp',
        color: '#f0b36c'
    },
    {
        id: 'magicookie',
        name: 'Magicookie',
        description: 'The simplest of cookies—redefined with a touch of the arcane!',
        category: ['food', 'crafted'],
        image: 'assets/images/magicookie.webp',
        color: '#c9a7ff'
    },
    {
        id: 'simple-biscuit',
        name: 'Simple Biscuit',
        description: 'It ain\'t much, but it\'s a decent treat and they keep for a long time if you bake \u2019em till they\'re extra crisp!',
        category: ['food', 'crafted'],
        image: 'assets/images/simple biscuit.webp',
        color: '#d9b38c'
    },
    {
        id: 'simple-tea',
        name: 'Simple Tea',
        description: 'The beverage of big-kids and adults the world over—and when sweetened it\'s the drink of basically everyone.',
        category: ['food', 'crafted'],
        image: 'assets/images/simple tea.webp',
        color: '#caa56a'
    },

    // Prank catalyst (crafted item, but also usable as an exotic ingredient)
    {
        id: 'giggle-gas',
        name: 'Giggle Gas',
        description: 'A pressurized, glittering pink gas that\'s hard to contain and harder to forget.',
        category: ['legendary', 'essence', 'crafted'],
        image: 'assets/images/Giggle Gas.webp',
        color: '#ff69b4'
    },

    // Prank potion result (also usable as an ingredient in future recipes)
    {
        id: 'giggly-health-potion',
        name: 'Gigglelixir',
        description: 'A standard healing draught—sweetened and supernaturally bubbly in a way that feels… ominously playful.',
        category: ['crafted', 'essence', 'giggly'],
        image: 'assets/images/gigglelixir.webp',
        color: '#ff69b4'
    },

    // Standard healing potion (craftable, and usable in future recipes)
    {
        id: 'health-potion',
        name: 'HP Pot',
        description: 'It restores health, you should know how this works. Restores 2d6 HP.',
        category: ['crafted', 'essence'],
        image: 'assets/images/hppot.webp',
        color: '#ff4d4d'
    },
    {
        id: 'bronzewood',
        name: 'Bronzewood',
        description: 'As hard as bronze but workable like timber. Used for crafting durable shafts and reinforcements.',
        category: ['material'],
        image: 'assets/images/bronzewood.webp',
        color: '#cd7f32'
    },
    {
        id: 'yeast',
        name: 'Yeast',
        description: 'A living leavening agent essential for rising doughs and brewing effervescent drinks.',
        category: ['biological'],
        image: 'assets/images/yeast.webp',
        color: '#f5deb3'
    },
    {
        id: 'rice',
        name: 'Rice',
        description: 'A staple grain that serves as the foundation for countless meals and treats.',
        category: ['food'],
        image: 'assets/images/rice.webp',
        color: '#faf0be'
    },
    {
        id: 'royalrice',
        name: 'Royal Rice',
        description: 'Prismatic grains harvested from the Emperor\'s celestial paddies. They hum with a faint, regal melody when poured.',
        category: ['food', 'legendary'],
        image: 'assets/images/royalrice.webp',
        color: '#e6e6fa'
    },
    {
        id: 'planarcherry',
        name: 'Planar Cherry',
        description: 'A cherry that exists in three dimensions and tastes like it belongs in four. Bursting with tart, reality-bending juice.',
        category: ['food', 'rare'],
        image: 'assets/images/planarcherry.webp',
        color: '#de3163'
    },
    {
        id: 'plainspeanuts',
        name: 'Plains Peanuts',
        description: 'Humble legumes dug from the earth of the Lissome Plains. Rich, oily, and distinctly nutty.',
        category: ['food'],
        image: 'assets/images/plainspeanuts.webp',
        color: '#d2b48c'
    },
    {
        id: 'lissomesoybeans',
        name: 'Lissome Soybeans',
        description: 'Radiant beans that grow in the sun-drenched Lissome Plains. High in protein and oddly shiny.',
        category: ['food'],
        image: 'assets/images/lissomesoybeans.webp',
        color: '#f0e68c'
    },
    {
        id: 'lissomelemons',
        name: 'Lissome Lemons',
        description: 'Bright yellow citrus fruits that hum with a low-level static charge. Zesty!',
        category: ['food'],
        image: 'assets/images/lissomelemons.webp',
        color: '#fff700'
    },
    {
        id: 'greenwood',
        name: 'Greenwood',
        description: 'Wood harvested while still alive and seasoned with alchemy to remain evergreen. Flexible and surprisingly tough.',
        category: ['material'],
        image: 'assets/images/greenwood.webp',
        color: '#228b22'
    },
    {
        id: 'congealed-silk',
        name: 'Congealed Silk',
        description: 'A thick, sticky spool of spun silk thread, highly useful in textile alchemy and binding spells.',
        category: ['material', 'textile'],
        image: 'assets/images/congealed_silk.webp',
        color: '#f8f9fa'
    },
    {
        id: 'refined-silk',
        name: 'Refined Silk',
        description: 'Silken thread spun and treated to form a light, shimmering fabric with high magical affinity.',
        category: ['crafted', 'material', 'textile', 'rare'],
        image: 'assets/images/refinedsilk.webp',
        color: '#e9ecef'
    },
    {
        id: 'greater-hp-potion',
        name: 'Greater HP Potion',
        description: 'A strong restorative potion that mends deep injuries much faster than the academy-standard red bottle.',
        category: ['crafted', 'essence'],
        image: 'assets/images/greaterhealthpotion.webp',
        color: '#ff3333'
    },
    {
        id: 'weaver-sigil',
        name: 'Weaver Sigil',
        description: 'A spun sigil keyed to the Great Weaver. Invoke it outside combat to veil one traveler, halving random encounter cadence.',
        category: ['crafted', 'essence'],
        image: 'assets/images/weaversigil.webp',
        color: '#dda0dd'
    },
    {
        id: 'emergency-rescue-beacon',
        name: 'Emergency Rescue Beacon',
        description: 'A single-use rescue flare keyed to Scholia. Trigger it outside combat to yank one bearer back to the Scholia front gates.',
        category: ['crafted', 'essence'],
        image: 'assets/images/rescuebeacon.webp',
        color: '#ffae42'
    },
    {
        id: 'brown-tincture',
        name: 'Brown Tincture',
        description: 'An ingestion poison that forces DC 15 CON saves against bowel incontinence.',
        category: ['crafted', 'essence'],
        image: 'assets/images/itemsandutility/healthpotion.webp',
        color: '#8b5a2b'
    },
    {
        id: 'gluttonberries',
        name: 'Gluttonberries',
        description: 'These golden, pearlescent berries sweet, juicy, and packed with nutrients and fiber.',
        category: ['food', 'botanical'],
        image: 'assets/images/Gluttonberries.png',
        color: '#ffd700'
    },
    {
        id: 'fools-berries',
        name: "Fool's Berries",
        description: 'These off-yellow, glimmering berries sweet, juicy, but have a cutting bitter aftertaste.',
        category: ['food', 'botanical'],
        image: 'assets/images/Foolsberries.webp',
        color: '#f0e68c'
    },
    {
        id: 'echo-shard',
        name: 'Echo Crystal Shard',
        description: 'Holding to ear allows hearing faint, disembodied whispers/echoes of past sounds. Can add a psychic element to illusions.',
        category: ['rare', 'material'],
        image: 'assets/images/echocrystalshard.webp',
        color: '#c5a3e8'
    },
    {
        id: 'echoing-mana-brew',
        name: 'Echoing Mana Brew',
        description: 'A resonating magical beverage crafted from chronal crystals and echo shards. Overconsumption of its temporal properties causes rapid biological urgency, forcing an immediate potty check.',
        category: ['food', 'crafted'],
        image: 'assets/images/itemsandutility/echoing_mana_brew.webp',
        color: '#a3e5e8'
    },
    {
        id: 'eldritch-spiced-cocoa',
        name: 'Eldritch Spiced Cocoa',
        description: 'A decadent spiced chocolate beverage that tempers the spirit but challenges the stomach, forcing an immediate potty check.',
        category: ['food', 'crafted'],
        image: 'assets/images/itemsandutility/eldritch_spiced_cocoa.webp',
        color: '#3d2b3b'
    },
    {
        id: 'resilience-ointment',
        name: 'Resilience Ointment',
        description: 'A thick herbal balm that bolsters physical endurance and Constitution saving throws.',
        category: ['crafted', 'essence'],
        image: 'assets/images/itemsandutility/resilience_ointment.webp',
        color: '#8be58e'
    },
    {
        id: 'phoenix-embers-glaze',
        name: 'Phoenix Embers Glaze',
        description: 'A sweet, glowing glaze that bestows the eternal protective warmth of the phoenix. Its explosive fiery heat requires an immediate potty check.',
        category: ['food', 'crafted', 'legendary'],
        image: 'assets/images/itemsandutility/phoenix_embers_glaze.webp',
        color: '#ff7f50'
    },
    {
        id: 'planar-cherry-tart',
        name: 'Planar Cherry Tart',
        description: 'A sweet, space-bending pastry that accelerates travel. Its dimensional shifting forces an immediate potty check.',
        category: ['food', 'crafted'],
        image: 'assets/images/itemsandutility/planar_cherry_tart.webp',
        color: '#de3163'
    },
    {
        id: 'soothing-lavender-compress',
        name: 'Soothing Lavender Compress',
        description: 'A lavender-infused cloth treated with refined silk and cotton fluff. Placed on a traveler, it heals exhaustion and promotes calming sleep.',
        category: ['crafted', 'material', 'textile'],
        image: 'assets/images/itemsandutility/soothing_lavender_compress.webp',
        color: '#e6e6fa'
    },
    {
        id: 'arcane-catalyst-brew',
        name: 'Arcane Catalyst Brew',
        description: 'A glowing brew that restores 1st and 2nd level spell slots, accelerating magic recovery.',
        category: ['crafted', 'essence'],
        image: 'assets/images/itemsandutility/Arcane Catalyst Brew.webp',
        color: '#4b0082'
    },
    {
        id: 'mystic-surge-tonic',
        name: 'Mystic Surge Tonic',
        description: 'A sudden arcane rush that briefly overclocks spellwork and replenishes a spark of power.',
        category: ['crafted', 'legendary', 'essence'],
        image: 'assets/images/itemsandutility/Mystic Surge Tonic.webp',
        color: '#00ffff'
    },
    {
        id: 'old-war-memorabilia',
        name: 'Old War Memorabilia',
        description: 'Assorted remnants from the old war, including medals, flags, banners, and other memorabilia taff. Valued for symbolic, ritual, or sentimental purposes.',
        category: ['material'],
        image: '../src/assets/images/old_war_memorabilia.webp',
        color: '#b38359'
    },
    {
        id: 'safrillium-nectar-flute-fresh',
        name: 'Safrillium Nectar Flute (Fresh)',
        description: 'A wondrous magical plant once widespread before the old war. Its flute-like flower fills with thick, rich nectar over the season. When consumed fresh, it restores 1d10 HP, or exactly 10 HP if consumed during a short rest. Its richness forces an immediate potty-check at disadvantage.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/safrillium_nectar_flute_fresh.webp',
        color: '#ffb6c1'
    },
    {
        id: 'safrillium-nectar-flute-ripened',
        name: 'Safrillium Nectar Flute (Ripened)',
        description: 'A season-aged Safrillium flower whose nectar has matured into a syrupy, naturally alcoholic form. It restores 1d6 HP, or exactly 6 HP if consumed during a short rest. Its richness forces an immediate potty-check at disadvantage. It is considered two alcoholic drinks at approximately 12% ABV.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/safrillium_nectar_flute.webp',
        color: '#da70d6'
    },
    {
        id: 'floral-horn-century-safrillium-nectar',
        name: 'Floral Horn of Century Safrillium Nectar',
        description: 'A legendary trumpet-shaped Safrillium flower whose nectar has matured over a full century of miraculous serenity. It restores 4d6 HP, or exactly 24 HP if consumed during a short rest, and instantly cures any non-magical illness or disease. Its richness forces an immediate potty-check at disadvantage. The potent alcoholic content of the full flute requires a DC 15 Constitution check or the consumer suffers temporary drunkenness.',
        category: ['legendary', 'botanical', 'food'],
        image: '../src/assets/images/floral_horn_century_safrillium_nectar.webp',
        color: '#ffd700'
    },
    {
        id: 'crimson-emberpetal',
        name: 'Crimson Emberpetal',
        description: 'A warm and vital red flower known for its beneficial effects on the body and cardiovascular health. Frequently used as a reagent in restorative and fortifying potions, it is prized both for its practical alchemical applications and its striking beauty.',
        category: ['botanical', 'material'],
        image: '../src/assets/images/crimson_emberpetal.webp',
        color: '#ff4d4d'
    },
    {
        id: 'sapphire-gleampetal',
        name: 'Sapphire Gleampetal',
        description: 'A cool and vital blue flower associated with mental clarity and immune health. Said to enhance potions of magical make, it is a favored reagent among arcanists and healers alike, valued for both its alchemical potency and calming charm.',
        category: ['botanical', 'material'],
        image: '../src/assets/images/sapphire_gleampetal.webp',
        color: '#4169e1'
    },
    {
        id: 'gildenrods',
        name: 'Gildenrods',
        description: 'A bright and charming golden flower widely used in medical and alchemical processes. Known for its antimicrobial properties and striking appearance, Gildenrods are a reliable and popular reagent among healers, herbalists, and alchemists alike.',
        category: ['botanical', 'material'],
        image: '../src/assets/images/gildenrods.webp',
        color: '#ffd700'
    },
    {
        id: 'greensea-coffee-beans',
        name: 'Greensea Coffee Beans',
        description: 'The go-bean of many universes. Greensea Coffee Beans are known for their woody, earthy flavor profile, with sweet notes of caramel and chocolate, and a nostalgic hint of magical childhood travails.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/greensea_coffee_beans.webp',
        color: '#5b3a29'
    },
    {
        id: 'school-clam',
        name: 'School Clam',
        description: 'A very common shellfish found along lakesides and waterways throughout the Scholian and Majickan regions. Best enjoyed cooked with butter or in soup, and occasionally found to contain a shiny Scholar\'s Pearl.',
        category: ['animal', 'food'],
        image: '../src/assets/images/school_clam.webp',
        color: '#d9b38c'
    },
    {
        id: 'scholars-pearl',
        name: 'Scholar\'s Pearl',
        description: 'A beautiful opalescent and iridescent pearl found within some School Clams. These pearls are believed to be imbued with ambient magic, enhancing the potency of aqueous solutions and alchemical brews.',
        category: ['material', 'rare'],
        image: '../src/assets/images/scholars_pearl.webp',
        color: '#f5f5f5'
    },
    {
        id: 'fellowship-pearl',
        name: 'Fellowship Pearl',
        description: 'A conjoined triplet pearl of exceptional beauty and power. Sometimes called a Century Triplet Pearl, these legendary reagents form only under the rarest circumstances and radiate profound magical resonance.',
        category: ['material', 'legendary'],
        image: '../src/assets/images/fellowship_pearl.webp',
        color: '#e8e6f4'
    },
    {
        id: 'cardiocrysanthea',
        name: 'Cardiocrysanthea',
        description: 'Sometimes called Crinkleheart Bottoms due to its twin bell-shaped crimson flowers and spade-like crimson and pink stem mantle. A plant related to Tryphacosmia, it is known for mood-calming, emotionally soothing, and vitality-supporting properties, and is widely used in alchemical and therapeutic preparations.',
        category: ['botanical', 'rare'],
        image: '../src/assets/images/cardiocrysanthea.webp',
        color: '#ff69b4'
    },
    {
        id: 'white-flower',
        name: 'White Flower',
        description: 'A delicate white flower associated with purity and cleanliness magic. Valued both for its aesthetic beauty and its frequent use in rituals, potions, and enchantments concerned with cleansing and sanctification.',
        category: ['botanical'],
        image: '../src/assets/images/white_flower.webp',
        color: '#ffffff'
    },
    {
        id: 'vitreye-bloom',
        name: 'Vitreye Bloom',
        description: 'A rare flower with an eye-like structure of blue and red petals surrounding a dark central core. Strongly associated with magic tied to sight, visions, and peering beyond the boundaries of reality.',
        category: ['botanical', 'rare'],
        image: '../src/assets/images/vitreye_bloom.webp',
        color: '#7b1fa2'
    },
    {
        id: 'coneseeds',
        name: 'Coneseeds',
        description: 'The pine-nuts of common conifer trees found throughout the Scholian woods. Rich, aromatic, and nutty in flavor, they are widely used in meals and dishes. When eaten alone, a handful of Coneseeds restores 1d2 HP.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/coneseeds.webp',
        color: '#8b5a2b'
    },
    {
        id: 'lakale',
        name: 'Lakale',
        description: 'A leafy green, kale- or lettuce-like aquatic plant that grows abundantly in Lake Soleista. Commonly harvested as a basic botanical ingredient for cooking, brewing, and low-grade alchemical preparations.',
        category: ['botanical'],
        image: '../src/assets/images/lakale.webp',
        color: '#3cb371'
    },
    {
        id: 'drupel',
        name: 'Drupel',
        description: 'A fist-sized berry far more sour than a lemon and only faintly sweet. Too tart for most humanoids to eat raw, Drupel is excellent when boiled with other fruits to form the hearty base of jams and preserves, requiring no added citric acid. Its high acid content also makes it useful in many chemical and alchemical reactions.',
        category: ['botanical'],
        image: '../src/assets/images/drupel.webp',
        color: '#9acd32'
    },
    {
        id: 'ghost-piper-stalk',
        name: 'Ghost-Piper Stalk (Inner Jungle)',
        description: 'A pale, chlorophyll-free plant that grows in total darkness within the Inner Jungle. Despite its ghostly appearance, its flower contains an unusually high concentration of capsaicin, making it highly sought after for advanced alchemical refining.',
        category: ['botanical', 'rare'],
        image: '../src/assets/images/ghost_piper_stalk.webp',
        color: '#fdfefe'
    },
    {
        id: 'sugar-sap',
        name: 'Sugar-Sap (Rainforest)',
        description: 'A thick, amber-colored liquid that bleeds from certain rainforest hardwoods. Less refined and more raw than Turbinado or Star sugars, Sugar-Sap is widely used in cooking, brewing, and early-stage alchemical processes.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/sugar_sap.webp',
        color: '#cd853f'
    },
    {
        id: 'shellshard',
        name: 'Shellshard (Lake/Riverways)',
        description: 'Fragments of an extinct massive iridescent freshwater crustacean found along lakebeds and riverways. Shellshards can be ground into a shimmering powder for alchemical use or shaped and layered into scale-mail.',
        category: ['material'],
        image: '../src/assets/images/shellshard.webp',
        color: '#afeeee'
    },
    {
        id: 'stellar-mercury',
        name: 'Stellar-Mercury (Inner Jungle)',
        description: 'A liquid metal found in small pools near deep-earth fissures in the Inner Jungle. Highly toxic to handle or ingest, Stellar-Mercury is nevertheless vital for many advanced alchemical and chemical reactions.',
        category: ['material', 'rare'],
        image: '../src/assets/images/stellar_mercury.webp',
        color: '#b2beb5'
    },
    {
        id: 'cattail-fluff',
        name: 'Cattail Fluff',
        description: 'Super-absorbent seed-head fibers harvested from cattails, beaten and processed into a hypoallergenic padding. Essential for high-tier nursery garments, filtration systems, and other applications requiring gentle but effective absorption.',
        category: ['botanical', 'material'],
        image: '../src/assets/images/cattail_fluff.webp',
        color: '#f5deb3'
    },
    {
        id: 'lifeblood-clay',
        name: 'Lifeblood Clay',
        description: 'A fine-grit, striking crimson clay used extensively for traditional nursery pottery and as a pigment base for Scholarian art instruction. Its vivid color and smooth working properties make it a staple material.',
        category: ['material'],
        image: '../src/assets/images/lifeblood_clay.webp',
        color: '#cd5c5c'
    },
    {
        id: 'scholian-blue-clay',
        name: 'Scholian Blue Clay',
        description: 'A deep-water sediment sometimes deposited along lake shores after churning storms. When fired, it produces a beautiful, water-resistant ceramic commonly used for high-end laboratory vessels and refined dining-ware.',
        category: ['material'],
        image: '../src/assets/images/scholian_blue_clay.webp',
        color: '#4682b4'
    },
    {
        id: 'lode-pebble',
        name: 'Lode-Pebble',
        description: 'Naturally magnetic stones found near iron veins within the Inner Jungle. An essential component in the construction of navigational compasses and magical wayfinding arrays.',
        category: ['material'],
        image: '../src/assets/images/lode_pebble.webp',
        color: '#708090'
    },
    {
        id: 'stormlode',
        name: 'Stormlode',
        description: 'A jagged, static-charged silicate formed at lightning strike sites. Stormlode serves as a battery-equivalent for basic magical machinery and is exceedingly rare outside of Stormveil and the Bay of Blitz.',
        category: ['material', 'rare'],
        image: '../src/assets/images/stormlode.webp',
        color: '#00bfff'
    },
    {
        id: 'bogsquares',
        name: 'Bogsquares',
        description: 'Compressed squares of peat formed from carbonized organic matter. Bogsquares provide a slow-burning, high-temperature fuel source favored for rustic heating systems and survivalist campsites.',
        category: ['material'],
        image: '../src/assets/images/bogsquares.webp',
        color: '#5c4033'
    },
    {
        id: 'zephyr-quartz',
        name: 'Zephyr-Quartz',
        description: 'A clear crystal containing internal gas bubbles that appear to drift and move. Used in air-aligned machinery and buoyancy aids, Zephyr-Quartz was long believed to be depleted following Tabitha’s air campaigns during the old war.',
        category: ['material', 'rare'],
        image: '../src/assets/images/zephyr_quartz.webp',
        color: '#e0ffff'
    },
    {
        id: 'tumble-grain',
        name: 'Tumble-Grain',
        description: 'A hardy wild cereal native to the steppes and open plains. Tumble-Grain breaks free from its stalk when mature, rolling across the land with the wind to spread its seeds. Highly nutritious, though it requires significant milling and refining before use in most meals.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/tumble_grain.webp',
        color: '#f5f5dc'
    },
    {
        id: 'musk-pod',
        name: 'Musk-Pod',
        description: 'A potent pheromone extract found within insect mounds and ancient jungle fortifications of the Inner Jungle. Used by Scholarian trackers to attract specific wildlife or to mask the distinct humanoid scent during expeditions.',
        category: ['material', 'rare'],
        image: '../src/assets/images/musk_pod.webp',
        color: '#a0522d'
    },
    {
        id: 'river-glass',
        name: 'River-Glass',
        description: 'Naturally tumbled shards of obsidian and quartz found along riverbanks and lakebeds. River-Glass is commonly used in decorative prisms, simple lenses, and low-grade optical focusing components.',
        category: ['material'],
        image: '../src/assets/images/river_glass.webp',
        color: '#faf0e6'
    },
    {
        id: 'marsh-mallow-root',
        name: 'Marsh-Mallow Root',
        description: 'A spongy, mucilaginous tuber harvested from marshlands. Marsh-Mallow Root serves as the culinary base for Scholia-approved nursery treats and is widely used in the preparation of soothing medicinal lozenges.',
        category: ['botanical', 'food'],
        image: '../src/assets/images/marsh_mallow_root.webp',
        color: '#fff5ee'
    },
    {
        id: 'marbled-marshmallows',
        name: 'Marbled Marshmallows',
        description: 'A batch of marshmallows swirled with vibrant colors. They taste like normal marshmallows.',
        category: ['food'],
        image: 'assets/images/marbled-marshmallows.webp',
        color: '#ffffff'
    },
    {
        id: 'chocolate-bar',
        name: 'Chocolate Bar',
        description: 'A simple bar of smooth milk chocolate. A classic pick-me-up.',
        category: ['food', 'crafted'],
        image: 'assets/images/chocolate bar.webp',
        color: '#5b3a29'
    },
    {
        id: 'rain-lily',
        name: 'Rain-Lily',
        description: 'A beautiful rainforest flower that naturally collects pure, sweet liquid during heavy deluges. Rain-Lily acts as a magical stabilizer in liquid-based culinary and alchemical recipes, helping prevent spoilage or magical destabilization.',
        category: ['botanical'],
        image: '../src/assets/images/rain_lily.webp',
        color: '#e6e6fa'
    },
    {
        id: 'serpent-shed',
        name: 'Serpent-Shed',
        description: 'A flexible, waterproof dermal layer shed by arboreal reptiles in dense jungle regions. When properly cured, Serpent-Shed becomes a high-grade leather ideal for durable, non-absorbent garments and equipment.',
        category: ['material'],
        image: '../src/assets/images/serpent_shed.webp',
        color: '#556b2f'
    },
    {
        id: 'berreems',
        name: 'Berreems',
        description: 'A large, incredibly juicy cluster of grape-like berries native to the safer outskirts of the Greensea Expanse. When bitten into, they burst with a sweet, floral nectar that stains the tongue a vibrant purple. Eating a handful of Berreems restores 1d4 hit points.',
        category: ['food'],
        image: '../src/assets/images/berreems.webp',
        color: '#da70d6'
    },
    {
        id: 'greenseananners',
        name: 'Greensea Nanners',
        description: 'A staple fruit harvested from the towering, broad-leafed trees bordering the Marshland Nexus. Greensea Nanners possess a slightly thicker peel than mundane bananas and a soft, subtly minty flavor underneath the standard sweetness. They are a favored snack for long expeditions, known to settle nervous stomachs and provide a +1 bonus to Constitution saving throws against nausea for 1 hour.',
        category: ['food'],
        image: '../src/assets/images/greenseananners.webp',
        color: '#fffacd'
    },
    {
        id: 'everripenanners',
        name: 'Everripe Nanners',
        description: 'A remarkable, magically stabilized variant of the Greensea Nanner. Touched by the ambient mana of the Campus Woods, these nanners never bruise, rot, or over-ripen, maintaining a perfect, starchy sweetness indefinitely. Consuming an Everripe Nanner provides the nutritional equivalent of a full day\'s rations and grants the eater advantage on their next Potty Check (Continence Check) within 24 hours.',
        category: ['food'],
        image: '../src/assets/images/everripenanners.webp',
        color: '#fafad2'
    },
    {
        id: 'fairyfarts',
        name: 'Ampule of Powdered Fairy Farts',
        description: 'A tiny, corked glass vial filled with a swirling, glittering pink-and-gold dust. Smells faintly of cotton candy and ozone. It is highly volatile; when used as an alchemical base or spell component, it can double the duration of Charm or Illusion effects, though it carries a 10% chance to make the caster uncontrollably giggle for 1 minute.',
        category: ['essence', 'rare'],
        image: '../src/assets/images/fairyfarts.webp',
        color: '#ffb6c1'
    },
    {
        id: 'funkygotato',
        name: 'Funky Gotato',
        description: 'A Gotato that has been exposed to the psychic pollution leaking from the Sunken Tower in the Marshland Nexus. It is bruised in unnatural hues of bruised purple and sickly green, emitting a foul, rotting odor. Unfit for consumption, but skilled poisoners value its extract for crafting noxious tinctures.',
        category: ['food'],
        image: '../src/assets/images/funkygotato.webp',
        color: '#4b0082'
    },
    {
        id: 'gotato',
        name: 'Gotato',
        description: 'The humble Gotato is the foundational tuber of Scholia Diaspros. Hearty, starchy, and easily cultivated in the magically enriched soils of the outer farms. It can be boiled, mashed, or stuck in a stew.',
        category: ['food'],
        image: '../src/assets/images/gotato.webp',
        color: '#cd853f'
    },
    {
        id: 'potonade',
        name: 'Potonade',
        description: 'A highly volatile, magically desiccated Gotato. Combat Academy students discovered that by rapidly drawing the moisture out of a Gotato while infusing it with basic evocation magic, the tuber becomes a rock-hard impact explosive. It smells faintly of burnt french fries when detonated.',
        category: ['crafted', 'weapon'],
        image: '../src/assets/images/potonade.webp',
        color: '#556b2f'
    },
    {
        id: 'greenseamatoto',
        name: 'Greensea Matoto',
        description: 'An exotic, deep-teal tomato variant native to the damp soils near the Creekfalls. Bursting with a savory, almost salty juice. When used in cooking, it acts as a natural preservative, and consuming it raw grants a minor soothing effect, briefly suppressing the effects of minor magical compulsions.',
        category: ['food'],
        image: '../src/assets/images/greenseamatoto.webp',
        color: '#008080'
    },
    {
        id: 'honey',
        name: 'Honey',
        description: 'Standard, sticky, sweet golden honey harvested from the giant, docile bumblebees kept by the agricultural department. Used widely in both baking and basic potion brewing to bind volatile ingredients together. It never spoils.',
        category: ['food'],
        image: '../src/assets/images/honey.webp',
        color: '#ff8c00'
    },
    {
        id: 'baybeehoney',
        name: 'Baybee Honey',
        description: 'A deluxe, opalescent honey produced only by the elusive Nursery Nightweaver spiders who have been coaxed into cultivating enchanted pollen. Tastes of vanilla and warm milk. Consuming a spoonful immediately removes the Frightened condition, stabilizes emotions, and grants advantage on Constitution saving throws against magical stress for 1 hour.',
        category: ['food', 'rare'],
        image: '../src/assets/images/baybeehoney.webp',
        color: '#fffacd'
    },
    {
        id: 'jungleiron',
        name: 'Jungle Iron',
        description: 'A peculiar, rust-resistant metal harvested from the depths of the Greensea Expanse. Jungle Iron has a natural greenish tint and is remarkably lightweight for its durability. Frequently used by artificers to craft structural reinforcements.',
        category: ['metal'],
        image: '../src/assets/images/jungleiron.webp',
        color: '#2e8b57'
    },
    {
        id: 'irondust',
        name: 'Iron Dust',
        description: 'Fine metallic powder scraped from corroded constructs, shattered warforged plating, and old battlefield debris. Iron Dust is used as a base reagent for tempering alloys, etching ward-lines, and stabilizing artificer mixes.',
        category: ['metal'],
        image: '',
        color: '#708090'
    },
    {
        id: 'prizedjungleiron',
        name: 'Prized Jungle Iron',
        description: 'A highly purified ingot of Jungle Iron, forged using Old War techniques or found in pristine condition deep within the Marshland Nexus. This metal naturally hums with a faint, stabilizing magic.',
        category: ['metal', 'rare'],
        image: '../src/assets/images/prizedjungleiron.webp',
        color: '#3cb371'
    },
    {
        id: 'oldwarscrap',
        name: 'Old War Scrap',
        description: 'Jagged, scorched remnants of armor, siege engines, or magical focuses left behind from the First Internal Siege. Skillful artificers can melt down Old War Scrap to infuse weapons with unpredictable elemental damage or craft items that can pierce magical wards.',
        category: ['material', 'rare'],
        image: '../src/assets/images/oldwarscrap.webp',
        color: '#8b4513'
    },
    {
        id: 'brick-of-hootz-marble',
        name: 'Brick of Hootz Marble',
        description: 'A heavy, pale brick cut from Hootz Marble—stone prized for its clean grain and the faint, lingering hum it carries after long exposure to warded structures.',
        category: ['stone'],
        image: '../src/assets/images/brick_of_hootz_marble.webp',
        color: '#f0fff0'
    }
];

// Player inventory is managed by app.js.
// This file only exposes a global inventory object for tools/UI that read it.
// IMPORTANT: Do not auto-seed full inventories here, otherwise dev reset and
// fresh-load starter inventory cannot work correctly.
var playerInventory = {};

try {
    const savedInventory = localStorage.getItem('playerInventory');
    if (savedInventory && savedInventory !== 'undefined') {
        playerInventory = JSON.parse(savedInventory) || {};
    }
} catch (error) {
    console.error('Error loading inventory:', error);
    playerInventory = {};
}

// Helper functions
function getIngredientById(id) {
    return ingredients.find(ingredient => ingredient.id === id);
}

// Update the getIngredientsByCategory function to work with the new array format
function getIngredientsByCategory(category) {
    if (category === 'all') {
        return ingredients;
    }
    return ingredients.filter(ingredient => {
        if (Array.isArray(ingredient.category)) {
            return ingredient.category.includes(category);
        } else {
            return ingredient.category === category;
        }
    });
}
