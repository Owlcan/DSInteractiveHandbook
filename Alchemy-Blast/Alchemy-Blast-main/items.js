const ingredients = [
    // Regular Ice Cream Ingredients
    {
        id: 'cream',
        name: 'Cream',
        description: 'Fresh dairy cream, essential for making ice cream and other desserts.',
        category: ['food'],
        image: 'assets/images/Cream.png',
        color: '#fff5e6'
    },
    {
        id: 'white-sugar',
        name: 'White Sugar',
        description: 'Refined sugar that adds sweetness to any recipe.',
        category: ['food'],
        image: 'assets/images/White Sugar.png',
        color: '#ffffff'
    },
    {
        id: 'egg',
        name: 'Egg',
        description: 'A common binding agent used in cooking and baking.',
        category: ['food'],
        image: 'assets/images/Egg.png',
        color: '#ffe0b3'
    },
    {
        id: 'vanilla',
        name: 'Vanilla',
        description: 'A fragrant flavoring extracted from vanilla pods.',
        category: ['food', 'botanical', 'essence'],
        image: 'assets/images/Vanilla.png',
        color: '#f5e3c4'
    },
    
    // Legendary Ice Cream Ingredients
    {
        id: 'azure-cream',
        name: 'Azure Moon Cream',
        description: 'Legendary cream harvested under a blue moon. Glows with ethereal light.',
        category: ['legendary', 'food'],
        image: 'assets/images/Azure Moon Cream.png',
        color: '#8eb8e5'
    },
    {
        id: 'star-sugar',
        name: 'Star Sugar',
        description: 'Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.',
        category: ['legendary', 'food'],
        image: 'assets/images/Star Sugar.png',
        color: '#e0e0ff'
    },
    {
        id: 'lunar-egg',
        name: 'Lunar-Dodo Egg',
        description: 'An egg from the rare Lunar-Dodo bird. Emits a soft blue glow.',
        category: ['legendary', 'food'],
        image: 'assets/images/Lunar-Dodo Egg.png',
        color: '#c4d8f5'
    },
    {
        id: 'starsoaked-vanilla',
        name: 'Starsoaked Vanilla',
        description: 'Vanilla beans that have been bathed in starlight for a full lunar cycle.',
        category: ['legendary', 'botanical', 'food', 'essence'],
        image: 'assets/images/Starsoaked Vanilla.png',
        color: '#d2c4f5'
    },
    {
        id: 'night-sky',
        name: 'Distillation of a Night Sky',
        description: 'The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Distillation of a Night Sky.png',
        color: '#0a1a3f'
    },
    {
        id: 'flavor-matrix',
        name: 'Flavor Matrix',
        description: 'Made from the distillation of Candy Elemental, this crystallized flavor matrix can radically expand the flavor profile of many food items- and even unlock the hidden potential of some ingredients.',
        category: ['legendary'],
        image: 'assets/images/Flavor Matrix.png',
        color: '#7986cb'
    },
    {
        id: 'turbonado-sugar',
        name: 'Turbonado Sugar',
        description: 'With the awesome gastronomic might of the flavor matrix, even plain white sugar can be elevated to godly tiers of taste sensation!',
        category: ['legendary', 'food'],
        image: 'assets/images/TurbonadoSugar.png',
        color: '#b39ddb'
    },
    {
        id: 'liquid-pain',
        name: 'Liquid Pain',
        description: 'A shifting, blood‑red fluid pulsing as though alive, harvested from the shattered hearts of fiends—dangerous, potent, and steeped in dark magic.',
        category: ['legendary', 'food', 'essence'],
        image: 'assets/images/Liquid Pain.png',
        color: '#8b0000'
    },
    {
        id: 'touch-of-love',
        name: 'Touch of Love',
        description: 'The \'most common\' of Legendary Ingredients is one many can make themselves- but isn\'t it being so common a good thing? <3',
        category: ['legendary', 'exotic', 'essence'],
        image: 'assets/images/Touch of Love.png',
        color: '#ffb6c1'
    },
    
    // New Ingredients
    {
        id: 'wildflower-honey-cream',
        name: 'Wildflower Honey-Cream',
        description: 'A golden cream swirled with wildflower nectar, exuding the essence of springtime warmth and renewal.',
        category: ['food', 'botanical'],
        image: 'assets/images/Wildflower Honey-Cream.bak.png',
        color: '#ffd700'
    },
    {
        id: 'birch-syrup',
        name: 'Birch Syrup',
        description: 'A rare syrup tapped from ancient, enchanted birch trees; each drop resonates with the forest\'s whispered secrets.',
        category: ['food', 'botanical'],
        image: 'assets/images/Birch Syrup.bak.png',
        color: '#8b4513'
    },
    {
        id: 'chromatic-platinum',
        name: 'Chromatic Platinum',
        description: 'A resplendent metal alloy imbued with shifting prismatic hues, radiating a subtle magical aura.',
        category: ['legendary', 'metal'],
        image: 'assets/images/Chromatic Platinum.png',
        color: '#e5e4e2'
    },
    {
        id: 'dreamvapor',
        name: 'Dreamvapor',
        description: 'An ephemeral mist carrying the scents of lavender and lost lullabies, slipping away like a fragment of a fading dream.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Dreamvapor.png',
        color: '#e6e6fa'
    },
    {
        id: 'fractal-copper',
        name: 'Fractal Copper',
        description: 'A mysterious, ever-fractalizing metal whose intricate patterns appear only under the full moon\'s light.',
        category: ['metal'],
        image: 'assets/images/Fractal Copper.png',
        color: '#b87333'
    },
    {
        id: 'defractor-prism',
        name: 'Defractor Prism',
        description: 'Differentiates magical, material, and chemical processes, allowing for breakdown of materials into their components.',
        category: ['rare'],
        image: 'assets/images/Defractor Prism.png',
        color: '#f0f8ff'
    },
    {
        id: 'glimmelectrum',
        name: 'Glimmelectrum',
        description: 'A radiant, mysterious alloy that hums with magical energy, capturing and reflecting light in mesmerizing patterns.',
        category: ['metal'],
        image: 'assets/images/Glimmelectrum.png',
        color: '#e5e4e2'
    },
    {
        id: 'glimmergold',
        name: 'Glimmergold',
        description: 'A rare alchemical powder that sparkles like crushed sunlight, coveted by mages and merchants alike for its enigmatic properties.',
        category: ['metal'],
        image: 'assets/images/glimmergold.bak.png',
        color: '#ffd700'
    },
    {
        id: 'sunset-essence',
        name: 'Sunset Essence',
        description: 'Captured at the fleeting moment of twilight, this radiant liquid holds the fading light of a dying day, evoking enchanting warmth and mystery.',
        category: ['rare', 'food', 'essence'],
        image: 'assets/images/Sunset Essence.png',
        color: '#ffa07a'
    },
    {
        id: 'hemimetrichite',
        name: 'Hemimetrichite',
        description: 'A shimmering crystal with half-formed facets, said to harbor the memories of unfulfilled destinies and ancient lore.',
        category: ['metal'],
        image: 'assets/images/hemimetrichite.png',
        color: '#c0c0c0'
    },
    {
        id: 'starshot-ore',
        name: 'Starshot Ore',
        description: 'A celestial metallic fragment believed to have fallen from the heavens; it glimmers with soft starlight even in utter darkness.',
        category: ['metal'],
        image: 'assets/images/Starshot Ore.png',
        color: '#e6e6fa'
    },
    {
        id: 'orichalchite',
        name: 'Orichalchite',
        description: 'Often called "orichalcum\'s ghost," this peculiar mineral shifts between the material and ethereal realms, evoking lost legends.',
        category: ['metal'],
        image: 'assets/images/Orichalchite.png',
        color: '#daa520'
    },
    {
        id: 'jadicine',
        name: 'Jadicine',
        description: 'A translucent green substance, rumored to be distilled from the tears of a jade dragon, soothing the mind and mending wounds.',
        category: ['exotic'],
        image: 'assets/images/Jadicine.png',
        color: '#90ee90'
    },
    {
        id: 'matrix-malachite',
        name: 'Matrix Malachite',
        description: 'A stone of intricate interlocking veins, its mystifying patterns hint at the buried wisdom of ancient sages.',
        category: ['metal'],
        image: 'assets/images/matrixmalachite.png',
        color: '#2e8b57'
    },
    {
        id: 'prismatic-activator',
        name: 'Prismatic Activator',
        description: 'A dazzling device shimmering with the full spectrum of colors, designed to unlock hidden magical potentials with a decisive spark.',
        category: ['legendary', 'rare'],
        image: 'assets/images/Prismatic Activator.png',
        color: '#ff69b4'
    },
    {
        id: 'rock-salt',
        name: 'Rock Salt',
        description: 'A coarse, naturally occurring crystalline salt harvested from ancient deposits. It lends a distinct crunch and subtle brininess to recipes.',
        category: ['metal', 'food'],
        image: 'assets/images/Rock Salt.png',
        color: '#e0e0e0'
    },
    {
        id: 'flour',
        name: 'Flour',
        description: 'A finely milled powder ground from high-quality grains, known for its versatile binding properties and delicate, neutral flavor.',
        category: ['food'],
        image: 'assets/images/Flour.png',
        color: '#fff5e6'
    },
    {
        id: 'spring-water',
        name: 'Spring Water',
        description: 'Pure water drawn from pristine natural springs, enriched with essential minerals to enhance the clarity and freshness of any culinary creation.',
        category: ['food'],
        image: 'assets/images/Spring Water.png',
        color: '#e6f3ff'
    },
    {
        id: 'savour-herb',
        name: 'Savour Herb',
        description: 'A common botanical with a rich, savory aroma.',
        image: 'assets/images/Savour Herb.png',
        category: ['botanical'],
        defaultCount: 5
    },
    {
        id: 'sweetleaf',
        name: 'Sweetleaf',
        description: 'Naturally sweet leaves that add a delicate sweetness without overpowering other flavors.',
        category: ['food', 'botanical'],
        image: 'assets/images/Sweetleaf.png',
        color: '#98fb98'
    },
    {
        id: 'tastetanium-crystal',
        name: 'Tastetanium Crystal',
        description: 'This anomalous crystalline lattice of freestate energy interacts with ingredients to create new and novel building blocks for taste sensation! It\'s also incredibly durable, but who cares about that?',
        category: ['legendary', 'metal', 'food'],
        image: 'assets/images/Tastetanium Crystal.png',
        color: '#b19cd9'
    },
    {
        id: 'butter',
        name: 'Butter',
        description: 'A rich, creamy spread made from churned cream and salt. Essential for countless recipes.',
        category: ['food'],
        image: 'assets/images/Butter.png',
        color: '#fff4c4'
    },
    {
        id: 'whipped-butter',
        name: 'Whipped White Butter',
        description: 'Light and airy butter whipped to perfection. Spreads like a dream.',
        category: ['food'],
        image: 'assets/images/Whipped White Butter.png',
        color: '#fffff0'
    },
    {
        id: 'herb-butter',
        name: 'Herb Butter',
        description: 'Delicious and flavorful, with hints of savory rosemary and garlic common to savourherb.',
        category: ['food'],
        image: 'assets/images/Herb Butter.png',
        color: '#e6ffe6'
    },
    {
        id: 'magibutter',
        name: 'Magibutter',
        description: 'This incredibutter brings all of the flavor and joy of butter, with all of the protein and vitamins and minerals, but somehow no calories! Whoa!',
        category: ['food'],
        image: 'assets/images/Magibutter.png',
        color: '#e6e6fa'
    },
    {
        id: 'yarn',
        name: 'Yarn',
        description: 'Finely spun fiber used in weaving and knitting, prized for its delicate texture and potential enchantments in crafted garments.',
        category: ['textile'],
        image: 'assets/images/Yarn.png',
        color: '#d9a066'
    },
    {
        id: 'darkessence',
        name: 'Darkessence',
        description: 'A mysterious, shadow-infused essence that exudes an aura of hidden power, often employed in dark magical rites.',
        category: ['legendary', 'essence'],
        image: 'assets/images/Darkessence.png',
        color: '#301934'
    },
    {
        id: 'plasticizer',
        name: 'Plasticizer',
        description: 'A transformative substance used to soften and mold plastics, enabling materials to be fashioned into flexible forms.',
        category: ['essence'],
        image: 'assets/images/Plasticizer.png',
        color: '#a3c1ad'
    },
    {
        id: 'vitalium',
        name: 'Vitalium',
        description: 'A shimmering metal imbued with the essence of life, frequently harnessed to empower enchanting constructs and devices.',
        category: ['crystal', 'exotic'],
        image: 'assets/images/Vitalium.png',
        color: '#7cfc00'
    },
    {
        id: 'vitalocanum',
        name: 'Vitalocanum',
        description: 'A potent compound derived from Vitalium, renowned for its ability to bridge the gap between vitality and arcane energies.',
        category: ['crystal', 'exotic'],
        image: 'assets/images/Vitalocanum.png',
        color: '#7fff00'
    },
    {
        id: 'adhesive',
        name: 'Adhesive',
        description: 'A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.',
        category: ['essence'],
        image: 'assets/images/Adhesive.png',
        color: '#ffff99'
    },
    {
        id: 'cotton-fluff',
        name: 'Cotton Fluff',
        description: 'A soft, airy fluff derived from cotton fibers, cherished for its light, cushioning properties and gentle texture.',
        category: ['textile', 'crafted'],
        image: 'assets/images/Cotton Fluff.png',
        color: '#ffffff'
    },
    {
        id: 'plastic-sheeting',
        name: 'Plastic Sheeting',
        description: 'A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.',
        category: ['crafted', 'textile'],
        image: 'assets/images/Plastic Sheeting.png',
        color: '#e0e0e0'
    },
    {
        id: 'petrodistillate',
        name: 'Petrodistillate',
        description: 'A refined, volatile extract from crude oil, known for its flammable characteristics and use in catalyzing various reactions.',
        category: ['essence'],
        image: 'assets/images/Petrodistillate.png',
        color: '#2f4f4f'
    },
    {
        id: 'robusca',
        name: 'Robusca',
        description: 'A dense, robust crystalline alloy prized for its exceptional strength and durability, ideal for crafting heavy-duty tools and resilient structures.',
        category: ['crystal'],
        image: 'assets/images/Robusca.png',
        color: '#708090'
    },
    {
        id: 'solvent',
        name: 'Solvent',
        description: 'A volatile liquid compound known for its ability to dissolve and extract substances, essential in various alchemical and industrial processes.',
        category: ['essence'],
        image: 'assets/images/Solvent.png',
        color: '#87ceeb'
    },
    {
        id: 'barkgum',
        name: 'Barkgum',
        description: 'A sticky and rubbery organic compound refined from the sap of certain types of trees. It is used as a base to make an enormous array of products from chewing-gum to glue to rubber.',
        category: ['botanical'],
        image: 'assets/images/Barkgum.png',
        color: '#8b4513'
    },
    {
        id: 'berrimaters',
        name: 'Berrimaters',
        description: 'Small, round, savory and sweet, these cherry-red little guys are awfully fun to eat! And they pair well with many treats, so you can flex your cooking feats!',
        category: ['botanical', 'food'],
        image: 'assets/images/Berrimaters.png',
        color: '#c41e3a'
    }
];

// Initialize player inventory
let playerInventory = {};

// Add starting ingredients to inventory
function initializeInventory() {
    try {
        // Clear existing inventory
        playerInventory = {};
        
        // Give starting amounts
        ingredients.forEach(ingredient => {
            const isLegendary = Array.isArray(ingredient.category) 
                ? ingredient.category.includes('legendary') 
                : ingredient.category === 'legendary';
            
            playerInventory[ingredient.id] = isLegendary ? 2 : 5;
        });
        
        // Save to localStorage with error checking
        const saved = localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
        console.log('Inventory save successful:', saved);
        console.log('Initialized inventory:', playerInventory);
    } catch (error) {
        console.error('Failed to initialize inventory:', error);
        alert('Failed to initialize inventory. Please check console for details.');
    }
}

// Try to load saved inventory with error handling
try {
    const savedInventory = localStorage.getItem('playerInventory');
    if (savedInventory) {
        playerInventory = JSON.parse(savedInventory);
        console.log('Loaded saved inventory successfully');
    } else {
        console.log('No saved inventory found, initializing new one');
        initializeInventory();
    }
} catch (error) {
    console.error('Error loading inventory:', error);
    alert('Error loading saved data. Initializing new inventory.');
    initializeInventory();
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
