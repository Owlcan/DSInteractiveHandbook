/**
 * Master Item Database
 * A comprehensive, alphabetized list of all ingredients and crafted items
 * with unique internal ID numbers for tracking and debugging.
 */

const masterItemDatabase = {
    // All items sorted alphabetically with unique IDs
    items: [
        {
            internalId: 1,
            id: 'adhesive',
            name: 'Adhesive',
            type: 'ingredient',
            category: 'essence',
            description: 'A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.'
        },
        {
            internalId: 2,
            id: 'azure-cream',
            name: 'Azure Moon Cream',
            type: 'ingredient',
            category: 'legendary',
            description: 'Legendary cream harvested under a blue moon. Glows with ethereal light.'
        },
        {
            internalId: 3,
            id: 'azure-ice-cream',
            name: 'Azure Harvest Blue Moon Ice Cream',
            type: 'crafted',
            category: 'food legendary',
            description: 'Some say they taste citrus, others swear there are hints of custard and aromatics- and yet still more profess their belief it tastes like the platonic ideal of blue children\'s modelling clay- all of them agree it is one of the best iced confections ever created.'
        },
        {
            internalId: 4,
            id: 'barkgum',
            name: 'Barkgum',
            type: 'ingredient',
            category: 'botanical',
            description: 'A sticky and rubbery organic compound refined from the sap of certain types of trees. It is used as a base to make an enormous array of products from chewing-gum to glue to rubber.'
        },
        {
            internalId: 5,
            id: 'berrimaters',
            name: 'Berrimaters',
            type: 'ingredient',
            category: 'botanical',
            description: 'Small, round, savory and sweet, these cherry-red little guys are awfully fun to eat! And they pair well with many treats, so you can flex your cooking feats!'
        },
        {
            internalId: 6,
            id: 'butter',
            name: 'Butter',
            type: 'crafted',
            category: 'food',
            description: 'Smooth, creamy butter, perfect for cooking.'
        },
        {
            internalId: 7,
            id: 'cotton-fluff',
            name: 'Cotton Fluff',
            type: 'ingredient',
            category: 'textile crafted',
            description: 'A soft, airy fluff derived from cotton fibers, cherished for its light, cushioning properties and gentle texture.'
        },
        {
            internalId: 8,
            id: 'cream',
            name: 'Cream',
            type: 'ingredient',
            category: 'food',
            description: 'Fresh dairy cream, essential for making ice cream and other desserts.'
        },
        {
            internalId: 9,
            id: 'crystal1',
            name: 'Clear Crystal',
            type: 'ingredient',
            category: 'crystal',
            description: 'A small, transparent crystal with weak magical properties.'
        },
        {
            internalId: 10,
            id: 'darkessence',
            name: 'Darkessence',
            type: 'ingredient',
            category: 'legendary reagent',
            description: 'A mysterious, shadow-infused essence that exudes an aura of hidden power, often employed in dark magical rites.'
        },
        {
            internalId: 11,
            id: 'diaper',
            name: 'Diaper',
            type: 'crafted',
            category: 'textile crafted',
            description: 'A durable plastic-backed marvel of engineering and magic! The ultimate in protection- you can\'t get any safer small clothes than these!'
        },
        {
            internalId: 12,
            id: 'egg',
            name: 'Egg',
            type: 'ingredient',
            category: 'food',
            description: 'A common binding agent used in cooking and baking.'
        },
        {
            internalId: 13,
            id: 'essence1',
            name: 'Water Essence',
            type: 'ingredient',
            category: 'essence',
            description: 'The distilled magical essence of water.'
        },
        {
            internalId: 14,
            id: 'health-potion',
            name: 'Health Potion',
            type: 'crafted',
            category: 'potion',
            description: 'A basic healing potion that restores vitality.'
        },
        {
            internalId: 15,
            id: 'herb-butter',
            name: 'Herb Butter',
            type: 'crafted',
            category: 'food',
            description: 'Butter infused with aromatic herbs.'
        },
        {
            internalId: 16,
            id: 'herb1',
            name: 'Common Herb',
            type: 'ingredient',
            category: 'herb',
            description: 'A common herb found in meadows and forests.'
        },
        {
            internalId: 17,
            id: 'legendary1',
            name: 'Phoenix Feather',
            type: 'ingredient',
            category: 'legendary',
            description: 'A rare feather from a phoenix, containing immense magical energy.'
        },
        {
            internalId: 18,
            id: 'lovely-diaper',
            name: 'Lovely Diaper',
            type: 'crafted',
            category: 'textile crafted',
            description: 'D\'awwww! Isn\'t that sweet. I bet whoever receives this will know how much you want to keep them safe.'
        },
        {
            internalId: 19,
            id: 'lunar-egg',
            name: 'Lunar-Dodo Egg',
            type: 'ingredient',
            category: 'legendary',
            description: 'An egg from the rare Lunar-Dodo bird. Emits a soft blue glow.'
        },
        {
            internalId: 20,
            id: 'metal1',
            name: 'Iron Dust',
            type: 'ingredient',
            category: 'metal',
            description: 'Fine iron particles with minor alchemical uses.'
        },
        {
            internalId: 21,
            id: 'night-sky',
            name: 'Distillation of a Night Sky',
            type: 'ingredient',
            category: 'legendary',
            description: 'The essence of a perfect night sky captured in a bottle. Contains stardust and dreams.'
        },
        {
            internalId: 22,
            id: 'petrodistillate',
            name: 'Petrodistillate',
            type: 'ingredient',
            category: 'essence',
            description: 'A refined, volatile extract from crude oil, known for its flammable characteristics and use in catalyzing various reactions.'
        },
        {
            internalId: 23,
            id: 'plastic-sheeting',
            name: 'Plastic Sheeting',
            type: 'crafted',
            category: 'textile crafted',
            description: 'A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.'
        },
        {
            internalId: 24,
            id: 'plasticizer',
            name: 'Plasticizer',
            type: 'ingredient',
            category: 'essence',
            description: 'A transformative substance used to soften and mold plastics, enabling materials to be fashioned into flexible forms.'
        },
        {
            internalId: 25,
            id: 'quiche',
            name: 'Quiche',
            type: 'crafted',
            category: 'food crafted',
            description: 'A savory tart filled with a rich blend of ingredients, offering a hearty, delectable treat with artisanal flair.'
        },
        {
            internalId: 26,
            id: 'robusca',
            name: 'Robusca',
            type: 'ingredient',
            category: 'crystal',
            description: 'A dense, robust crystalline alloy prized for its exceptional strength and durability, ideal for crafting heavy-duty tools and resilient structures.'
        },
        {
            internalId: 27,
            id: 'rock-salt',
            name: 'Rock Salt',
            type: 'ingredient',
            category: 'crystal',
            description: 'Crystallized salt with preservative properties.'
        },
        {
            internalId: 28,
            id: 'savour-herb',
            name: 'Savoury Herb',
            type: 'ingredient',
            category: 'herb',
            description: 'A fragrant herb with a strong taste, perfect for cooking.'
        },
        {
            internalId: 29,
            id: 'solvent',
            name: 'Solvent',
            type: 'ingredient',
            category: 'essence',
            description: 'A volatile liquid compound known for its ability to dissolve and extract substances, essential in various alchemical and industrial processes.'
        },
        {
            internalId: 30,
            id: 'star-sugar',
            name: 'Star Sugar',
            type: 'ingredient',
            category: 'legendary',
            description: 'Crystallized sweetness that fell from the stars. Sparkles with cosmic energy.'
        },
        {
            internalId: 31,
            id: 'starsoaked-vanilla',
            name: 'Starsoaked Vanilla',
            type: 'ingredient',
            category: 'legendary',
            description: 'Vanilla beans that have been bathed in starlight for a full lunar cycle.'
        },
        {
            internalId: 32,
            id: 'sugar',
            name: 'White Sugar',
            type: 'ingredient',
            category: 'food',
            description: 'Refined sugar that adds sweetness to any recipe.'
        },
        {
            internalId: 33,
            id: 'touch-of-love',
            name: 'Touch of Love',
            type: 'ingredient',
            category: 'exotic',
            description: 'A magical essence that imbues items with care and affection.'
        },
        {
            internalId: 34,
            id: 'turbonado-sugar',
            name: 'Turbinado Sugar',
            type: 'crafted',
            category: 'food legendary',
            description: 'A magical sugar with extraordinary properties.'
        },
        {
            internalId: 35,
            id: 'vanilla',
            name: 'Vanilla',
            type: 'ingredient',
            category: 'botanical',
            description: 'A fragrant flavoring extracted from vanilla pods.'
        },
        {
            internalId: 36,
            id: 'vanilla-ice-cream',
            name: 'Vanilla Ice Cream',
            type: 'crafted',
            category: 'food',
            description: 'The tried and true classic. Almost no one can mess this up- delicious even when it turns to soup!'
        },
        {
            internalId: 37,
            id: 'vitalium',
            name: 'Vitalium',
            type: 'ingredient',
            category: 'crystal exotic',
            description: 'A shimmering metal imbued with the essence of life, frequently harnessed to empower enchanting constructs and devices.'
        },
        {
            internalId: 38,
            id: 'vitalocanum',
            name: 'Vitalocanum',
            type: 'ingredient',
            category: 'crystal exotic',
            description: 'A potent compound derived from Vitalium, renowned for its ability to bridge the gap between vitality and arcane energies.'
        },
        {
            internalId: 39,
            id: 'yarn',
            name: 'Yarn',
            type: 'ingredient',
            category: 'textile',
            description: 'Finely spun fiber used in weaving and knitting, prized for its delicate texture and potential enchantments in crafted garments.'
        }
    ],

    // Utility functions
    getItemById: function(id) {
        return this.items.find(item => item.id === id);
    },
    
    getItemByInternalId: function(internalId) {
        return this.items.find(item => item.internalId === internalId);
    },
    
    getIngredients: function() {
        return this.items.filter(item => item.type === 'ingredient');
    },
    
    getCraftedItems: function() {
        return this.items.filter(item => item.type === 'crafted');
    },
    
    getItemsByCategory: function(category) {
        return this.items.filter(item => 
            item.category.split(' ').includes(category) || 
            item.category === category
        );
    },
    
    getItemsByName: function(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.items.filter(item => 
            item.name.toLowerCase().includes(term)
        );
    }
};

// Add to window scope for debug console access
window.masterItemDatabase = masterItemDatabase;