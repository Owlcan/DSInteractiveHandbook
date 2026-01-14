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
