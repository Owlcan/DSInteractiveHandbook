const recipes = [
    {
        id: 'vanilla-ice-cream',
        name: 'Vanilla Ice Cream',
        ingredients: ['cream', 'white-sugar', 'egg', 'vanilla'], // Fixed sugar ID to match ingredients.js
        exoticIngredient: null,
        result: {
            name: 'Vanilla Ice Cream',
            description: 'The tried and true classic. Almost no one can mess this up- delicious even when it turns to soup!',
            effects: 'Restores 6HP, 8 if savored during a short rest.',
            image: 'assets/images/VanillaIceCreamSMALL.webp',
            craftedImage: 'assets/images/VanillaIceCream.webp',  // Removed TINY
            size: {
                width: 128,
                height: 128
            }
        }
    },
    {
        id: 'lovely-vanilla-ice-cream',
        name: 'Lovely Vanilla Ice Cream',
        ingredients: ['cream', 'white-sugar', 'egg', 'vanilla'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Lovely Vanilla Ice Cream',
            description: 'Who would have thought you could infuse love in something firming up in the fridge?! Delightfully creamy and airy, whipped to perfection and chilled patiently- this is the real deal.',
            effects: 'Grants an Inspiration point that may be used whenever the player desires. Fully heals HP and restores all spell slots lower than 4th.',
            image: 'assets/images/Lovely Vanilla Ice Cream.webp',
            craftedImage: 'assets/images/Lovely Vanilla Ice Cream.webp',
            category: ['food', 'legendary']  // Added category array to ensure it appears in crafted items
        }
    },
    {
        id: 'azure-ice-cream',
        name: 'Azure Harvest Blue Moon Ice Cream',
        ingredients: ['azure-cream', 'star-sugar', 'lunar-egg', 'starsoaked-vanilla'],
        exoticIngredient: 'night-sky',
        result: {
            name: 'Azure Harvest Blue Moon Ice Cream',
            description: 'Some say they taste citrus, others swear there are hints of custard and aromatics- and yet still more profess their belief it tastes like the platonic ideal of blue children\'s modelling clay- all of them agree it is one of the best iced confections ever created.',
            effects: 'Resistance to fire for one dungeon or expedition. When consumed on expedition, you instantly succeed 2 of the required checks for completion. When consumed it restores 12HP and cures all non-magical diseases and afflictions.',
            image: 'assets/images/Azure Harvest Blue Moon Ice Cream.webp',
            craftedImage: 'assets/images/Azure Harvest Blue Moon Ice Cream.webp',
            category: ['food', 'legendary']  // Added category array to ensure it appears in crafted items
        }
    },
    {
        id: 'turbonado-sugar',
        name: 'Turbonado Sugar',
        ingredients: ['white-sugar'],
        exoticIngredient: 'flavor-matrix',
        result: {
            name: 'Turbonado Sugar',
            description: 'With the awesome gastronomic might of the flavor matrix, even plain white sugar can be elevated to godly tiers of taste sensation!',
            effects: 'A legendary catalyst that can dramatically enhance the potency of any recipe.',
            image: 'assets/images/TurbonadoSugar.webp'
        },
        validate: function (slots) {
            // Extensive debug logging
            console.group('Turbonado Sugar Recipe Validation');
            console.log('Slot Contents:', slots);
            console.log('Checking slot C:', slots.c?.id);
            console.log('Checking slot E:', slots.e?.id);
            console.log('Expected slot C: white-sugar'); // Updated to match ingredients.js
            console.log('Expected slot E: flavor-matrix');

            // Updated validation to use white-sugar
            const isValid = slots.c?.id === 'white-sugar' && slots.e?.id === 'flavor-matrix';

            console.log('Validation result:', isValid);
            console.groupEnd();

            return isValid;
        }
    },
    {
        id: 'white-sugar',
        name: 'White Sugar',
        ingredients: ['turbonado-sugar'],
        exoticIngredient: null,
        // Break down 1 turbonado sugar into a batch of plain sugar.
        resultAmount: 20,
        result: {
            name: 'White Sugar',
            description: 'A batch of refined sugar crystals, broken back down from turbonado sugar.',
            effects: 'Creates 20 White Sugar.',
            image: 'assets/images/White Sugar.webp'
        }
    },
    {
        id: 'white-sugar-from-sweetleaf',
        name: 'White Sugar (Sweetleaf)',
        ingredients: [],
        exoticIngredient: null,
        outputId: 'white-sugar',
        resultAmount: 1,
        validate: function (slots) {
            // Exactly 2 sweetleaf, no exotic.
            if (slots.e) return false;
            const ids = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);
            return ids.length === 2 && ids.every(id => id === 'sweetleaf');
        },
        result: {
            name: 'White Sugar',
            description: 'Refined sugar coaxed from Sweetleaf and crystallized into a familiar pantry staple.',
            effects: 'Creates 1 White Sugar.',
            image: 'assets/images/White Sugar.webp'
        }
    },
    {
        id: 'white-sugar-from-birch-water',
        name: 'White Sugar (Birch + Water)',
        ingredients: ['birch-syrup', 'water'],
        exoticIngredient: null,
        outputId: 'white-sugar',
        resultAmount: 2,
        result: {
            name: 'White Sugar',
            description: 'Birch syrup reduced and clarified with clean water, leaving behind bright white crystals.',
            effects: 'Creates 2 White Sugar.',
            image: 'assets/images/White Sugar.webp'
        }
    },
    {
        id: 'vanilla',
        name: 'Vanilla',
        ingredients: ['savour-herb', 'sweetleaf', 'fractal-copper', 'water'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Vanilla',
            description: 'A fragrant flavoring extracted from vanilla pods.',
            effects: 'Creates 3 Vanilla.',
            image: 'assets/images/Vanilla.webp'
        }
    },
    {
        id: 'butter',
        name: 'Butter',
        ingredients: ['cream', 'rock-salt'],
        exoticIngredient: null,
        validate: function (slots) {
            // Only cream and rock-salt, exactly 2 ingredients
            const slotArray = Object.values(slots).filter(slot => slot !== null);
            const hasRequiredIngredients = slotArray.some(slot => slot.id === 'cream') &&
                slotArray.some(slot => slot.id === 'rock-salt');
            return hasRequiredIngredients && slotArray.length === 2;
        },
        result: {
            name: 'Butter',
            description: 'A rich, creamy spread made from churned cream and salt. Essential for countless recipes.',
            effects: 'A basic but vital ingredient for many recipes.',
            image: 'assets/images/Butter.webp'
        }
    },
    {
        id: 'whipped-butter',
        name: 'Whipped White Butter',
        ingredients: ['cream', 'rock-salt'], // Updated to include ingredients
        exoticIngredient: null,
        validate: function (slots) {
            // Debug logging
            console.log('Validating Whipped Butter Recipe');
            console.log('Slot contents:', slots);

            // Count how many slots contain butter
            const butterCount = Object.values(slots)
                .filter(slot => slot && slot.id === 'butter')
                .length;

            console.log('Found butter in', butterCount, 'slots');

            // Need exactly 2 butter for whipped butter
            return butterCount === 2;
        },
        result: {
            name: 'Whipped White Butter',
            description: 'Light and airy butter whipped to perfection. Spreads like a dream.',
            effects: 'Can be used as a substitute for regular butter in most recipes, with enhanced results.',
            image: 'assets/images/Whipped White Butter.webp'
        }
    },
    {
        id: 'herb-butter',
        name: 'Herb Butter',
        ingredients: ['cream', 'rock-salt', 'savour-herb'], // Updated to include ingredients
        exoticIngredient: null,
        validate: function (slots) {
            // Debug logging
            console.log('Validating Herb Butter Recipe');
            console.log('Slot contents:', slots);

            // Check for cream, rock salt, and savour herb in any slots
            const hasIngredients = {
                cream: false,
                rockSalt: false,
                savourHerb: false
            };

            Object.values(slots).forEach(slot => {
                if (slot) {
                    if (slot.id === 'cream') hasIngredients.cream = true;
                    if (slot.id === 'rock-salt') hasIngredients.rockSalt = true;
                    if (slot.id === 'savour-herb') hasIngredients.savourHerb = true;
                }
            });

            // All ingredients must be present and must have exactly 3 ingredients
            const totalIngredients = Object.values(slots).filter(slot => slot !== null).length;
            const isValid = hasIngredients.cream &&
                hasIngredients.rockSalt &&
                hasIngredients.savourHerb &&
                totalIngredients === 3;

            console.log('Herb Butter validation:', hasIngredients, 'Total ingredients:', totalIngredients);
            console.log('Recipe is valid:', isValid);

            return isValid;
        },
        result: {
            name: 'Herb Butter',
            description: 'Delicious and flavorful, with hints of savory rosemary and garlic common to savourherb.',
            effects: 'Enhances the savory aspects of any dish it\'s used in.',
            image: 'assets/images/Herb Butter.webp'
        }
    },
    {
        id: 'magibutter',
        name: 'Magibutter',
        ingredients: ['cream', 'rock-salt'],
        exoticIngredient: 'tastetanium-crystal',
        validate: function (slots) {
            // Need cream, rock-salt, and tastetanium-crystal in exotic slot
            const hasBasicIngredients = Object.values(slots)
                .filter(slot => slot !== null)
                .some(slot => slot.id === 'cream') &&
                Object.values(slots)
                    .filter(slot => slot !== null)
                    .some(slot => slot.id === 'rock-salt');
            const hasExotic = slots.e?.id === 'tastetanium-crystal';
            return hasBasicIngredients && hasExotic;
        },
        result: {
            name: 'Magibutter',
            description: 'This incredibutter brings all of the flavor and joy of butter, with all of the protein and vitamins and minerals, but somehow no calories! Whoa!',
            effects: 'A magical butter substitute that provides all the benefits with none of the drawbacks.',
            image: 'assets/images/Magibutter.webp'
        }
    },
    {
        id: 'plastic-sheeting',
        name: 'Plastic Sheeting',
        ingredients: ['plasticizer', 'petrodistillate'],
        exoticIngredient: null,
        validate: function (slots) {
            // Need exactly plasticizer and petrodistillate
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);

            const hasPlasticizer = ingredients.includes('plasticizer');
            const hasPetrodistillate = ingredients.includes('petrodistillate');
            const hasExactly2Ingredients = ingredients.length === 2;

            return hasPlasticizer && hasPetrodistillate && hasExactly2Ingredients;
        },
        result: {
            name: 'Plastic Sheeting',
            description: 'A thin yet durable layer of plastic engineered for protective coverings, waterproofing, and precise industrial applications.',
            effects: 'Can be used in crafting to create waterproof items and containers.',
            category: ['crafted', 'textile'],
            image: 'assets/images/Plastic Sheeting.webp',
            craftedImage: 'assets/images/Plastic Sheeting.webp' // Removed TINY
        }
    },
    {
        id: 'crafted-adhesive',
        name: 'Adhesive',
        ingredients: ['barkgum', 'plasticizer', 'solvent'],
        exoticIngredient: null,
        validate: function (slots) {
            // Need exactly barkgum, plasticizer, and solvent
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);

            const hasBarkgum = ingredients.includes('barkgum');
            const hasPlasticizer = ingredients.includes('plasticizer');
            const hasSolvent = ingredients.includes('solvent');
            const hasExactly3Ingredients = ingredients.length === 3;

            return hasBarkgum && hasPlasticizer && hasSolvent && hasExactly3Ingredients;
        },
        result: {
            name: 'Adhesive',
            description: 'A highly effective, sticky substance with powerful bonding properties, ideal for uniting disparate materials into one cohesive whole.',
            effects: 'Used in crafting to bind materials together.',
            category: ['crafted', 'essence'],
            image: 'assets/images/Adhesive.webp',
            craftedImage: 'assets/images/Adhesive.webp' // Removed TINY
        }
    },
    {
        id: 'diaper',
        name: 'Diaper',
        ingredients: ['plastic-sheeting', 'adhesive', 'cotton-fluff'],
        exoticIngredient: null,
        validate: function (slots) {
            // Need exactly plastic-sheeting, adhesive, and cotton-fluff
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);

            const hasPlasticSheeting = ingredients.includes('plastic-sheeting');
            const hasAdhesive = ingredients.includes('adhesive');
            const hasCottonFluff = ingredients.includes('cotton-fluff');
            const hasExactly3Ingredients = ingredients.length === 3;
            const noExotic = !slots.e;

            return hasPlasticSheeting && hasAdhesive && hasCottonFluff && hasExactly3Ingredients && noExotic;
        },
        result: {
            name: 'Diaper',
            description: 'A durable plastic-backed marvel of engineering and magic! The ultimate in protection- you can\'t get any safer small clothes than these!',
            effects: 'Provides exceptional protection and comfort.',
            category: ['crafted', 'textile'],
            image: 'assets/images/diaper.webp',
            craftedImage: 'assets/images/diaper.webp' // Removed TINY
        }
    },
    {
        id: 'lovely-diaper',
        name: 'Lovely Diaper',
        ingredients: ['plastic-sheeting', 'adhesive', 'cotton-fluff'],
        exoticIngredient: 'touch-of-love',
        validate: function (slots) {
            // Need exactly plastic-sheeting, adhesive, cotton-fluff, and touch-of-love in exotic slot
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null && slot.id !== 'touch-of-love')
                .map(slot => slot.id);

            const hasPlasticSheeting = ingredients.includes('plastic-sheeting');
            const hasAdhesive = ingredients.includes('adhesive');
            const hasCottonFluff = ingredients.includes('cotton-fluff');
            const hasExotic = slots.e && slots.e.id === 'touch-of-love';
            const hasExactly3RegularIngredients = ingredients.length === 3;

            return hasPlasticSheeting && hasAdhesive && hasCottonFluff && hasExotic && hasExactly3RegularIngredients;
        },
        result: {
            name: 'Lovely Diaper',
            description: 'D\'awwww! Isn\'t that sweet. I bet whoever receives this will know how much you want to keep them safe.',
            effects: 'Provides exceptional protection and comfort with an extra dose of love and care.',
            category: ['crafted', 'textile', 'legendary'],
            image: 'assets/images/lovely diaper.webp',
            craftedImage: 'assets/images/lovely diaper.webp' // Removed TINY
        }
    },
    {
        id: 'quiche',
        name: 'Quiche',
        ingredients: ['egg', 'cream', 'flour', 'herb-butter'],
        exoticIngredient: null,
        validate: function (slots) {
            // Need these 4 ingredients
            const ingredients = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);

            const hasEgg = ingredients.includes('egg');
            const hasCream = ingredients.includes('cream');
            const hasFlour = ingredients.includes('flour');
            const hasHerbButter = ingredients.includes('herb-butter');
            const hasExactly4Ingredients = ingredients.length === 4;

            return hasEgg && hasCream && hasFlour && hasHerbButter && hasExactly4Ingredients;
        },
        result: {
            name: 'Quiche',
            description: 'A savory tart filled with a rich blend of ingredients, offering a hearty, delectable treat with artisanal flair.',
            effects: 'Provides substantial nourishment and restores 10 hit points when consumed.',
            category: ['food', 'crafted'],
            image: 'assets/images/Quiche.webp',
            craftedImage: 'assets/images/Quiche.webp' // Removed TINY
        }
    },
    {
        id: 'bitter-balm',
        name: 'Bitter Balm',
        ingredients: ['liquid-pain', 'water', 'vitalocanum'],
        exoticIngredient: null,
        result: {
            name: 'Bitter Balm',
            description: 'A bitter, volatile balm brewed from pain and vitality, best used with care.',
            effects: 'Grants resistance to necrotic damage for 1 minute. DC 12 CON save or take 1d4 acid damage backlash.',
            category: ['crafted', 'essence'],
            image: 'assets/images/healthpotion.webp',
            craftedImage: 'assets/images/healthpotion.webp'
        }
    },
    {
        id: 'health-potion',
        name: 'HP Pot',
        ingredients: ['robusca', 'vitalocanum', 'water'],
        exoticIngredient: null,
        result: {
            name: 'HP Pot',
            description: 'It restores health, you should know how this works. Restores 2d6 HP.',
            effects: 'Restores 2d6 HP.',
            category: ['crafted', 'essence'],
            image: 'assets/images/hppot.webp',
            craftedImage: 'assets/images/hppot.webp'
        }
    },
    {
        id: 'herbal-infusion',
        name: 'Herbal Infusion',
        ingredients: ['common-herb', 'water-essence'],
        exoticIngredient: null,
        result: {
            name: 'Herbal Infusion',
            description: 'A mild, travel-friendly infusion that steadies the stomach and wards off minor ailments.',
            effects: 'Advantage on saving throws against poison and disease for 1 hour.',
            category: ['food', 'crafted'],
            image: 'assets/images/herbal infusion.webp',
            craftedImage: 'assets/images/herbal infusion.webp'
        }
    },
    {
        id: 'morning-boost-pancake',
        name: 'Morning Boost Pancake',
        ingredients: ['egg', 'cream', 'flour'],
        exoticIngredient: null,
        result: {
            name: 'Morning Boost Pancake',
            description: 'A hearty breakfast staple with a little extra pep for the road ahead.',
            effects: 'Gain 1d6 temporary hit points and advantage on CON saving throws for 1 hour.',
            category: ['food', 'crafted'],
            image: 'assets/images/Morning Boost Pancake.webp',
            craftedImage: 'assets/images/Morning Boost Pancake.webp'
        }
    },
    {
        id: 'sweet-rejuvenation-porridge',
        name: 'Sweet Rejuvenation Porridge',
        ingredients: ['egg', 'birch-syrup', 'flour', 'sweetleaf'],
        exoticIngredient: null,
        result: {
            name: 'Sweet Rejuvenation Porridge',
            description: 'A hearty, sweet porridge that helps worn-down adventurers find their footing again.',
            effects: 'Reduce one level of exhaustion (if applicable) and gain 1d4 temporary hit points for 1 hour (once per long rest).',
            category: ['food', 'crafted'],
            image: 'assets/images/sweet rejuvenation porridge.webp',
            craftedImage: 'assets/images/sweet rejuvenation porridge.webp'
        }
    },
    {
        id: 'herbal-shield-stew',
        name: 'Herbal Shield Stew',
        ingredients: ['egg', 'cream', 'savour-herb', 'rock-salt'],
        exoticIngredient: null,
        result: {
            name: 'Herbal Shield Stew',
            description: 'A robust stew whose fragrant herbs seem to harden resolve into a shimmering ward.',
            effects: 'Gain +2 AC and 1d6 temporary hit points for 1 minute.',
            category: ['food', 'crafted'],
            image: 'assets/images/Herbal Shield Stew.webp',
            craftedImage: 'assets/images/Herbal Shield Stew.webp'
        }
    },
    {
        id: 'metallic-bonding-resin',
        name: 'Metallic Bonding Resin',
        ingredients: ['petrodistillate', 'plasticizer', 'solvent', 'adhesive'],
        exoticIngredient: null,
        result: {
            name: 'Metallic Bonding Resin',
            description: 'An advanced, enchanted resin used by artisans to fuse metal components into resilient wholes.',
            effects: 'A crafting reagent: enhances bonded nonmagical metal durability (table-use dependent).',
            category: ['crafted', 'essence'],
            image: 'assets/images/Metallic Bonding Resin.webp',
            craftedImage: 'assets/images/Metallic Bonding Resin.webp'
        }
    },
    {
        id: 'deduction-tonic',
        name: 'Deduction Tonic',
        ingredients: ['defractor-prism', 'jadicine', 'water'],
        exoticIngredient: null,
        result: {
            name: 'Deduction Tonic',
            description: 'A peculiar tonic that sharpens pattern recognition and makes the mind feel wonderfully ordered.',
            effects: 'For 10 minutes: advantage on INT (Arcana) checks; once during that time, identify a nonmagical item\'s hidden properties as if using identify.',
            category: ['crafted', 'essence'],
            image: 'assets/images/Deduction Tonic.webp',
            craftedImage: 'assets/images/Deduction Tonic.webp'
        }
    },
    {
        id: 'honeyed-herbal-tonic',
        name: 'Honeyed Herbal Tonic',
        ingredients: ['wildflower-honey-cream', 'common-herb', 'water'],
        exoticIngredient: null,
        result: {
            name: 'Honeyed Herbal Tonic',
            description: 'A soothing tonic with a honeyed finish, popular with rangers and herbalists.',
            effects: 'Restore 1d4 hit points and gain advantage on WIS (Nature) checks for 10 minutes.',
            category: ['food', 'crafted'],
            image: 'assets/images/Honeyed Herbal Tonic.webp',
            craftedImage: 'assets/images/Honeyed Herbal Tonic.webp'
        }
    },
    {
        id: 'bitter-sweet-draught',
        name: 'Bitter Sweet Draught',
        ingredients: ['liquid-pain', 'sweetleaf', 'water'],
        exoticIngredient: null,
        result: {
            name: 'Bitter Sweet Draught',
            description: 'A daring brew that stings, then steadies—pain transmuted into a brief, protective vigor.',
            effects: 'Take 1d4 necrotic damage, then gain temporary hit points equal to the damage dealt for 1 minute.',
            category: ['crafted', 'essence'],
            image: 'assets/images/Bitter Sweet Draught.webp',
            craftedImage: 'assets/images/Bitter Sweet Draught.webp'
        }
    },
    {
        id: 'sweet-energy-elixir',
        name: 'Sweet Energy Elixir',
        ingredients: ['white-sugar', 'water', 'cream', 'savour-herb'],
        exoticIngredient: null,
        result: {
            name: 'Sweet Energy Elixir',
            description: 'A brisk, sugary elixir with a savory edge—an alchemical "sprint" in a bottle.',
            effects: 'Gain 1d6 temporary hit points and advantage on DEX (Acrobatics) checks for 1 minute.',
            category: ['crafted', 'food'],
            image: 'assets/images/Sweet Energy Elixir.webp',
            craftedImage: 'assets/images/Sweet Energy Elixir.webp'
        }
    },
    {
        id: 'fritter-of-focus',
        name: 'Fritter of Focus',
        ingredients: ['egg', 'flour', 'savour-herb', 'sweetleaf'],
        exoticIngredient: null,
        result: {
            name: 'Fritter of Focus',
            description: 'A crisp, savory-sweet fritter that clears the fog and narrows the mind to the task at hand.',
            effects: 'For 10 minutes: advantage on INT (Investigation) checks; add +2 to one skill check of your choice during that duration.',
            category: ['food', 'crafted'],
            image: 'assets/images/Fritter of Focus.webp',
            craftedImage: 'assets/images/Fritter of Focus.webp'
        }
    },
    {
        id: 'refractive-elixir',
        name: 'Refractive Elixir',
        ingredients: ['defractor-prism', 'water', 'common-herb'],
        exoticIngredient: null,
        result: {
            name: 'Refractive Elixir',
            description: 'A prismatic brew that briefly sharpens perception and reveals subtle magical traces.',
            effects: 'For 1 minute: limited truesight out to 10 feet; once during that time, identify the magical properties of a nonmagical object as if using identify.',
            category: ['crafted', 'essence'],
            image: 'assets/images/Refractive Elixir.webp',
            craftedImage: 'assets/images/Refractive Elixir.webp'
        }
    },
    {
        id: 'comforting-custard',
        name: 'Comforting Custard',
        ingredients: ['egg', 'cream', 'sweetleaf'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Comforting Custard',
            description: 'Rich, velvety custard that warms the spirit as much as it nourishes the body.',
            effects: 'During a short rest: restore 1d4 hit points; if a Hit Die is spent, regain +1 extra hit point.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Comforting Custard.webp',
            craftedImage: 'assets/images/Comforting Custard.webp'
        }
    },
    {
        id: 'soothing-herb-biscuit',
        name: 'Soothing Herb Biscuit',
        ingredients: ['flour', 'egg', 'common-herb', 'rock-salt'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Soothing Herb Biscuit',
            description: 'A gentle, savory biscuit whose herbal aroma steadies the constitution.',
            effects: 'Restore 1d4 hit points and gain advantage on the next CON saving throw before the end of the short rest.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Soothing Herb Biscuit.webp',
            craftedImage: 'assets/images/Soothing Herb Biscuit.webp'
        }
    },
    {
        id: 'mild-recovery-porridge',
        name: 'Mild Recovery Porridge',
        ingredients: ['egg', 'cream', 'birch-syrup', 'sweetleaf'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Mild Recovery Porridge',
            description: 'A warm, soothing bowl that helps the body recover without overwhelming the senses.',
            effects: 'During a short rest: restore 1d6 hit points and reduce one level of exhaustion (if applicable).',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Mild Recovery Porridge.webp',
            craftedImage: 'assets/images/Mild Recovery Porridge.webp'
        }
    },
    {
        id: 'mending-muffin',
        name: 'Mending Muffin',
        ingredients: ['flour', 'egg', 'cream', 'white-sugar'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Mending Muffin',
            description: 'A fresh, comforting muffin that feels like a small kindness baked into reality.',
            effects: 'During a short rest: heal 1d4 hit points; gain 1 temporary hit point for the next hour.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Mending Muffin.webp',
            craftedImage: 'assets/images/Mending Muffin.webp'
        }
    },
    {
        id: 'healthy-bread-pudding',
        name: 'Healthy Bread Pudding',
        ingredients: ['flour', 'egg', 'cream', 'sweetleaf'],
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Healthy Bread Pudding',
            description: 'A warm bread pudding with a mild enchantment that makes rest feel more restorative.',
            effects: 'During a short rest: restore 1d4 hit points; if a Hit Die is spent, regain an extra Hit Die.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Healthy Bread Pudding.webp',
            craftedImage: 'assets/images/Healthy Bread Pudding.webp'
        }
    },
    {
        id: 'dragons-fist-elixir',
        name: 'Dragon\'s Fist Elixir',
        ingredients: ['vitalium', 'phoenix-feather', 'common-herb', 'rock-salt'],
        exoticIngredient: null,
        result: {
            name: 'Dragon\'s Fist Elixir',
            description: 'A potent elixir that floods the body with martial vigor and burning focus.',
            effects: 'For 1 minute: gain bonus ki equal to proficiency bonus; unarmed strikes deal +1d4 damage (monk-friendly).',
            category: ['crafted', 'legendary'],
            image: 'assets/images/Dragon\'s Fist Elixir.webp',
            craftedImage: 'assets/images/Dragon\'s Fist Elixir.webp'
        }
    },
    {
        id: 'mystic-surge-tonic',
        name: 'Mystic Surge Tonic',
        ingredients: ['prismatic-activator', 'darkessence', 'water', 'common-herb'],
        exoticIngredient: null,
        result: {
            name: 'Mystic Surge Tonic',
            description: 'A sudden arcane rush that briefly overclocks spellwork and replenishes a spark of power.',
            effects: 'For 10 minutes: once, regain one expended 1st-level spell slot OR treat your next spell as cast 1 slot level higher.',
            category: ['crafted', 'legendary'],
            image: 'assets/images/Mystic Surge Tonic.webp',
            craftedImage: 'assets/images/Mystic Surge Tonic.webp'
        }
    },
    {
        id: 'arcane-catalyst-brew',
        name: 'Arcane Catalyst Brew',
        ingredients: ['darkessence', 'flavor-matrix', 'water', 'common-herb'],
        exoticIngredient: null,
        result: {
            name: 'Arcane Catalyst Brew',
            description: 'A brew infused with raw arcane insight, stabilizing a single powerful casting within the body.',
            effects: 'For the next 24 hours: cast one arcane spell up to 3rd-level without expending a spell slot (declare when consumed).',
            category: ['crafted', 'legendary'],
            image: 'assets/images/Arcane Catalyst Brew.webp',
            craftedImage: 'assets/images/Arcane Catalyst Brew.webp'
        }
    },
    {
        id: 'omni-infusion-elixir',
        name: 'Omni-Infusion Elixir',
        ingredients: ['orichalchite', 'vitalium', 'robusca', 'matrix-malachite'],
        exoticIngredient: null,
        result: {
            name: 'Omni-Infusion Elixir',
            description: 'An exotic infusion forged from rare metals and crystals, prized for its adaptable, all-purpose empowerment.',
            effects: 'For 1 hour choose one: resistance to a damage type; or +2 to all saving throws; or regain HP equal to 2d8 + CON mod. Also acts as a universal catalyst for crafting (table-use dependent).',
            category: ['crafted', 'legendary'],
            image: 'assets/images/Omni-Infusion Elixir.webp',
            craftedImage: 'assets/images/Omni-Infusion Elixir.webp'
        }
    },
    {
        id: 'omni-infusion-elixir-enhanced',
        name: 'Omni-Infusion Elixir, Enhanced',
        ingredients: ['orichalchite', 'vitalium', 'robusca', 'matrix-malachite'],
        exoticIngredient: 'prismatic-activator',
        result: {
            name: 'Omni-Infusion Elixir, Enhanced',
            description: 'An enhanced omni-infusion intensified by a legendary catalyst—versatile, potent, and sought-after by multiclass adventurers.',
            effects: 'Base effect plus: gain +2 to attack rolls OR spell attack rolls for 1 hour (your choice at consumption).',
            category: ['crafted', 'legendary'],
            image: 'assets/images/enhanced Omni-Infusion Elixir.webp',
            craftedImage: 'assets/images/enhanced Omni-Infusion Elixir.webp'
        }
    },
    {
        id: 'littlespace-lick',
        name: 'Littlespace Lick',
        ingredients: ['turbonado-sugar'],
        exoticIngredient: 'tastetanium-crystal',
        validate: function (slots) {
            // Turbonado Sugar + (any fruit or sweet herb) + Tastetanium Crystal in exotic slot
            const regularSlots = ['a', 'b', 'c', 'd']
                .map(k => slots[k])
                .filter(Boolean);

            if (regularSlots.length !== 2) return false;
            if (slots.e?.id !== 'tastetanium-crystal') return false;

            const hasTurbonado = regularSlots.some(s => s.id === 'turbonado-sugar');
            if (!hasTurbonado) return false;

            const other = regularSlots.find(s => s.id !== 'turbonado-sugar');
            if (!other) return false;

            // Allow anything "fruit-ish" / "sweet herb" by category (works with future fruit ingredients)
            const categories = Array.isArray(other.category) ? other.category : [];
            const isFoodOrBotanical = categories.includes('food') || categories.includes('botanical');
            return isFoodOrBotanical;
        },
        result: {
            name: 'Littlespace Lick',
            description: 'A vibrant crystal-studded swirl pop that\'s cute, sweet, and alarmingly magical.',
            effects: 'Restore 2d8 HP; +1 to all rolls for 1 hour; incontinence for 4 hours with an immediate potty check upon consumption.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Littlespace Lick.webp',
            craftedImage: 'assets/images/Littlespace Lick.webp'
        }
    },
    {
        id: 'babybrain-syrup',
        name: 'Babybrain Syrup',
        ingredients: ['lunar-egg', 'sunset-essence', 'birch-syrup', 'star-sugar'],
        exoticIngredient: null,
        result: {
            name: 'Babybrain Syrup',
            description: 'A dreamy gradient syrup sparkling with tiny edible stars.',
            effects: 'As the Babybrain spell for 12 hours per dose. One recipe yields 4 doses (or 8 half-doses lasting 4 hours).',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/Babybrain Syrup.webp',
            craftedImage: 'assets/images/Babybrain Syrup.webp'
        }
    },
    {
        id: 'giggle-gas',
        name: 'Giggle Gas',
        ingredients: ['dreamvapor', 'defractor-prism'],
        exoticIngredient: 'prismatic-activator',
        result: {
            name: 'Giggle Gas',
            description: 'A pressurized, glittering pink gas that\'s hard to contain and harder to forget.',
            effects: 'If inhaled: DC 15 CON save or become incontinent for 1d4 days per round inhaled (cumulative). Subsequent inhalations require new saves and add duration.',
            category: ['crafted', 'essence', 'legendary'],
            image: 'assets/images/Giggle Gas.webp',
            craftedImage: 'assets/images/Giggle Gas.webp'
        }
    },
    {
        id: 'potion-of-parental-power',
        name: 'Potion of Parental Power',
        ingredients: ['dreamvapor', 'vitalocanum', 'robusca'],
        exoticIngredient: 'prismatic-activator',
        result: {
            name: 'Potion of Parental Power',
            description: 'A tall, trophy-like potion that radiates authority and rainbow-currents of prismatic power.',
            effects: 'Functions as the Parental Power spell for 4 hours per dose. Recipe yields 2 doses (or 3 on a rare Perfect Potion result).',
            category: ['crafted', 'legendary'],
            image: 'assets/images/Potion of Parental Power.webp',
            craftedImage: 'assets/images/Potion of Parental Power.webp'
        }
    },

    // Cookie + Cake set (from instructions.txt)
    {
        id: 'caramel',
        name: 'Caramel',
        ingredients: ['butter', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Caramel',
            description: 'Topping, treat, and all-around excellent ingredient, it has a place in many recipes, including some you wouldn\'t expect!',
            effects: 'A versatile ingredient used in many sweets (and a few surprises).',
            category: ['food', 'crafted'],
            image: 'assets/images/caramel.webp',
            craftedImage: 'assets/images/caramel.webp'
        }
    },
    {
        id: 'magicaramel',
        name: 'Magicaramel',
        ingredients: [],
        exoticIngredient: null,
        resultAmount: 1,
        validate: function (slots) {
            // Two valid combos (exactly 2 regular ingredients):
            // - Magibutter + White Sugar
            // - Turbonado Sugar + Butter
            const ids = Object.values(slots)
                .filter(slot => slot !== null)
                .map(slot => slot.id);

            if (ids.length !== 2) return false;
            const a = ids.includes('magibutter') && ids.includes('white-sugar');
            const b = ids.includes('turbonado-sugar') && ids.includes('butter');
            return a || b;
        },
        result: {
            name: 'Magicaramel',
            description: 'It\'s caramel, but magic... so it\'s better...',
            effects: 'A superior caramel with an alchemical sheen; excellent in enchanted desserts.',
            category: ['food', 'crafted'],
            image: 'assets/images/magicaramel.webp',
            craftedImage: 'assets/images/magicaramel.webp'
        }
    },
    {
        id: 'vanilla-frosting',
        name: 'Vanilla Frosting',
        ingredients: ['butter', 'white-sugar', 'cream'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Vanilla Frosting',
            description: 'The standard in frosting, and hard to mess up whether in the kitchen or in the lab—and darn tasty, too!',
            effects: 'A classic frosting used to elevate cakes and pies.',
            category: ['food', 'crafted'],
            image: 'assets/images/vanilla frosting.webp',
            craftedImage: 'assets/images/vanilla frosting.webp'
        }
    },
    {
        id: 'white-cake',
        name: 'White Cake',
        ingredients: ['vanilla-frosting', 'egg', 'flour', 'cream'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'White Cake',
            description: 'Food — while it can certainly be said that it\'s plain, it\'s never dull—it\'s cake! (One craft produces 6 servings.)',
            effects: 'During a short rest: restores 1d6 HP per slice. If more than 2 servings are consumed in a short rest, make a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/white cake_birefnet.webp',
            craftedImage: 'assets/images/white cake_birefnet.webp'
        }
    },
    {
        id: 'sugar-cookie',
        name: 'Sugar Cookie',
        ingredients: ['white-sugar', 'flour', 'egg', 'water'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Sugar Cookie',
            description: 'Food — the simplest of cookies, and a simple pleasure. (Each craft produces 6 cookies.)',
            effects: 'During a short rest: restores 1d4 HP. Consuming more than 2 cookies requires a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/sugar cookie.webp',
            craftedImage: 'assets/images/sugar cookie.webp'
        }
    },
    {
        id: 'simple-waffle-cookie',
        name: 'Simple Waffle Cookie',
        ingredients: ['white-sugar', 'flour', 'egg', 'caramel'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Simple Waffle Cookie',
            description: 'Food — a waffle cookie sandwiching a layer of caramel. (Each craft produces 6 cookies.)',
            effects: 'During a short rest: restores 1d4 HP, or 1d6 HP if consumed with Simple Tea (or another warm drink).',
            category: ['food', 'crafted'],
            image: 'assets/images/simple waffle cookie.webp',
            craftedImage: 'assets/images/simple waffle cookie.webp'
        }
    },
    {
        id: 'chocochipper',
        name: 'Chocochipper',
        ingredients: ['greensea-cacao', 'flour', 'egg', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Chocochipper',
            description: 'Food — classic and traditional—but by no means boring! Who can shame a perfect chocolate chip cookie?!',
            effects: 'During a short rest: restores 1d4 HP. Consuming more than 3 in a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/chocochipper.webp',
            craftedImage: 'assets/images/chocochipper.webp'
        }
    },
    {
        id: 'eldritch-chocochipper',
        name: 'Eldritch Chocochipper',
        ingredients: ['turbonado-sugar', 'eldritch-cacao', 'flour', 'lunar-egg'],
        exoticIngredient: null,
        resultAmount: 2,
        result: {
            name: 'Eldritch Chocochipper',
            description: 'Food — a rare and delicious double-chocolate chip cookie that\'s extra dark and extra magical.',
            effects: 'During a short rest: restores 1d6 HP and recover either a spell slot or a limited-use feature (DM/table call). More than one cookie does not grant additional slot/feature recovery. Make a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/eldritch chocochipper.webp',
            craftedImage: 'assets/images/eldritch chocochipper.webp'
        }
    },
    {
        id: 'cookies-and-cream-pie',
        name: 'Cookies and Cream Pie',
        ingredients: ['greensea-cacao', 'cream', 'flour', 'vanilla-frosting'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Cookies and Cream Pie',
            description: 'A favorite for some, and a sometimes-treat for others, but undeniably delicious and rich. (Makes 4 slices per craft.)',
            effects: 'During a short rest: restores 1d8 HP. Consuming more than 1 slice requires a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/cookies and cream pie.webp',
            craftedImage: 'assets/images/cookies and cream pie.webp'
        }
    },
    {
        id: 'magic-stroopwafel',
        name: 'Magic Stroopwafel',
        ingredients: ['turbonado-sugar', 'flour', 'egg', 'magicaramel'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Magic Stroopwafel',
            description: 'Food — two magically infused and buttery waffle cookies sandwich a sumptuous layer of caramel. (Each craft produces 4.)',
            effects: 'During a short rest: restores 1d6 HP, or 1d12 HP if consumed with Simple Tea (or another warm drink). This enhanced effect applies only to the first Magic Stroopwafel eaten per short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/magic stroopwafel.webp',
            craftedImage: 'assets/images/magic stroopwafel.webp'
        }
    },
    {
        id: 'magicookie',
        name: 'Magicookie',
        ingredients: ['turbonado-sugar', 'flour', 'egg', 'cream'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Magicookie',
            description: 'Food — the simplest of cookies, redefined with a touch of the arcane! (Each craft produces 4.)',
            effects: 'During a short rest: restores 1d8 HP. Consuming more than 1 cookie requires a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/magicookie.webp',
            craftedImage: 'assets/images/magicookie.webp'
        }
    },
    {
        id: 'simple-biscuit',
        name: 'Simple Biscuit',
        ingredients: ['white-sugar', 'vanilla', 'flour', 'water'],
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Simple Biscuit',
            description: 'Food, ingredient — it ain\'t much, but it\'s a decent treat and they keep for a long time if you bake \u2019em till they\'re extra crisp! (Each craft creates 10.)',
            effects: 'During a short rest: restores 1d2 HP. Consuming more than 4 biscuits during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/simple biscuit.webp',
            craftedImage: 'assets/images/simple biscuit.webp'
        }
    },
    {
        id: 'simple-tea',
        name: 'Simple Tea',
        ingredients: ['simple-herb', 'water'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Simple Tea',
            description: 'Food — the beverage of big-kids and adults the world over—and when sweetened it\'s the drink of basically everyone. (Each craft creates 3 servings.)',
            effects: 'During a short rest: restores 2 HP. Consuming more than one serving during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/simple tea.webp',
            craftedImage: 'assets/images/simple tea.webp'
        }
    },

    // Giggly (prank) variants: add Giggle Gas in the exotic slot
    {
        id: 'giggly-sugar-cookie',
        name: 'Giggly Sugar Cookie',
        ingredients: ['white-sugar', 'flour', 'egg', 'water'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 6,
        result: {
            name: 'Giggly Sugar Cookie',
            description: 'Tag: Giggly. The simplest of cookies, and a simple pleasure—now with a suspiciously bubbly finish. (Each craft produces 6 cookies.)',
            effects: 'During a short rest: restores 1d4 HP. Consuming more than 2 cookies requires a Continence Check at the end of the short rest.\nGiggly effect (batch-wide): At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['food', 'crafted', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/sugar cookie.webp',
            craftedImage: 'assets/images/sugar cookie.webp'
        }
    },
    {
        id: 'giggly-simple-waffle-cookie',
        name: 'Giggly Simple Waffle Cookie',
        ingredients: ['white-sugar', 'flour', 'egg', 'caramel'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 6,
        result: {
            name: 'Giggly Simple Waffle Cookie',
            description: 'Tag: Giggly. A waffle cookie sandwiching a layer of caramel—now with a fizzy, giggle-inducing twist. (Each craft produces 6 cookies.)',
            effects: 'During a short rest: restores 1d4 HP, or 1d6 HP if consumed with Simple Tea (or another warm drink).\nGiggly effect (batch-wide): At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['food', 'crafted', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/simple waffle cookie.webp',
            craftedImage: 'assets/images/simple waffle cookie.webp'
        }
    },
    {
        id: 'giggly-chocochipper',
        name: 'Giggly Chocochipper',
        ingredients: ['greensea-cacao', 'flour', 'egg', 'white-sugar'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 4,
        result: {
            name: 'Giggly Chocochipper',
            description: 'Tag: Giggly. Classic and traditional—but by no means boring! This one\'s got a mischievous sparkle. ',
            effects: 'During a short rest: restores 1d4 HP. Consuming more than 3 in a short rest requires a Continence Check at the end of that rest.\nGiggly effect: At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['food', 'crafted', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/chocochipper.webp',
            craftedImage: 'assets/images/chocochipper.webp'
        }
    },
    {
        id: 'giggly-white-cake',
        name: 'Giggly White Cake',
        ingredients: ['vanilla-frosting', 'egg', 'flour', 'cream'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 6,
        result: {
            name: 'Giggly White Cake',
            description: 'Tag: Giggly. While it can certainly be said that it\'s plain, it\'s never dull—it\'s cake! Now it\'s also… suspicious. (One craft produces 6 servings.)',
            effects: 'During a short rest: restores 1d6 HP per slice. If more than 2 servings are consumed in a short rest, make a Continence Check at the end of that rest.\nGiggly effect (batch-wide): At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['food', 'crafted', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/white cake_birefnet.webp',
            craftedImage: 'assets/images/white cake_birefnet.webp'
        }
    },
    {
        id: 'giggly-simple-tea',
        name: 'Giggly Simple Tea',
        ingredients: ['simple-herb', 'water'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 3,
        result: {
            name: 'Giggly Simple Tea',
            description: 'Tag: Giggly. The beverage of big-kids and adults the world over—this batch bubbles with mischief. (Each craft creates 3 servings.)',
            effects: 'During a short rest: restores 2 HP. Consuming more than one serving during a short rest requires a Continence Check at the end of that rest.\nGiggly effect (batch-wide): At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['food', 'crafted', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/simple tea.webp',
            craftedImage: 'assets/images/simple tea.webp'
        }
    },
    {
        id: 'giggly-health-potion',
        name: 'Gigglelixir',
        ingredients: ['vitalocanum', 'water', 'white-sugar'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 1,
        result: {
            name: 'Gigglelixir',
            description: 'Tag: Giggly. A standard healing draught—sweetened and supernaturally bubbly in a way that feels… ominously playful.',
            effects: 'Normal healing effect (as your table\'s Health Potion).\nGiggly effect: At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['crafted', 'essence', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/gigglelixir.webp',
            craftedImage: 'assets/images/gigglelixir.webp'
        }
    },

    // New recipes (from instructions.txt)
    {
        id: 'cooking-oil',
        name: 'Cooking Oil',
        ingredients: ['plainspeanuts', 'solvent'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Cooking Oil',
            description: 'A neutral oil pressed from peanuts. Essential for frying, sautéing, and making machinery less squeaky.',
            effects: 'Creates 3 Cooking Oil.',
            category: ['food', 'crafted'],
            image: 'assets/images/cookingoil.webp',
            craftedImage: 'assets/images/cookingoil.webp'
        }
    },
    {
        id: 'peanut-butter',
        name: 'Peanut Butter',
        ingredients: ['plainspeanuts', 'rock-salt', 'cooking-oil'],
        exoticIngredient: null,
        resultAmount: 2,
        result: {
            name: 'Peanut Butter',
            description: 'Smooth, creamy butter made from roasted plains peanuts. A high-energy staple.',
            effects: 'Creates 2 Peanut Butter.',
            category: ['food', 'crafted'],
            image: 'assets/images/peanutbutter.webp',
            craftedImage: 'assets/images/peanutbutter.webp'
        }
    },
    {
        id: 'fletching',
        name: 'Fletching',
        ingredients: ['petrodistillate', 'plastic-sheeting'],
        exoticIngredient: null,
        resultAmount: 24, // Increased yield to ensure enough for multiple arrow batches
        result: {
            name: 'Fletching',
            description: 'Synthetic feathers refined for perfect aerodynamics. Essential for crafting stabilizing fins for arrows and bolts.',
            effects: 'Creates 24 Fletching.',
            category: ['crafted', 'material'],
            image: 'assets/images/fletching.webp',
            craftedImage: 'assets/images/fletching.webp'
        }
    },
    {
        id: 'lightwood-shafts',
        name: 'Lightwood Shafts',
        ingredients: ['greenwood', 'solvent'], // UPDATED: Greenwood is the lighter/flexible wood
        exoticIngredient: null,
        resultAmount: 12,
        result: {
            name: 'Lightwood Shafts',
            description: 'Lightweight shafts crafted from flexible greenwood. Essential for crafting standard and rapid-fire arrows.',
            effects: 'Creates 12 Lightwood Shafts.',
            category: ['crafted', 'material'],
            image: 'assets/images/lightwoodshafts.webp',
            craftedImage: 'assets/images/lightwoodshafts.webp'
        }
    },
    {
        id: 'darkwood-shafts',
        name: 'Darkwood Shafts',
        ingredients: ['bronzewood', 'darkessence', 'solvent'], // UPDATED: Bronzewood is the hard/dark wood
        exoticIngredient: null,
        resultAmount: 12,
        result: {
            name: 'Darkwood Shafts',
            description: 'Shafts cured in shadow from heavy bronzewood. Silent and difficult to snap. Essential for crafting stealth and heavy arrows.',
            effects: 'Creates 12 Darkwood Shafts.',
            category: ['crafted', 'material'],
            image: 'assets/images/darkwoodshafts.webp',
            craftedImage: 'assets/images/darkwoodshafts.webp'
        }
    },

    // AMMUNITION (BULLETS)
    {
        id: 'standard-bullets',
        name: 'Standard Bullets',
        ingredients: ['robusca', 'petrodistillate', 'fractal-copper'],
        exoticIngredient: null,
        resultAmount: 20,
        result: {
            name: 'Standard Bullets',
            description: 'Reliable, standard-issue kinetic rounds suitable for most firearms. Used for dealing non-magical piercing damage.',
            effects: 'Creates 20 rounds of Standard Bullets.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/standardbullets.webp',
            craftedImage: 'assets/images/standardbullets.webp'
        }
    },
    {
        id: 'penetrator-rounds',
        name: 'Penetrator Rounds',
        ingredients: ['robusca', 'petrodistillate', 'fractal-copper'],
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Penetrator Rounds',
            description: 'Heavy-tipped rounds designed to punch through plating. Grants a +1 bonus to Attack rolls against targets wearing armor.',
            effects: 'Creates 10 rounds of Penetrator Rounds. While used: +1 to attack rolls against armored targets.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/penetratorrounds.webp',
            craftedImage: 'assets/images/penetratorrounds.webp'
        }
    },
    {
        id: 'babybrain-bullets',
        name: 'Babybrain Bullets',
        ingredients: ['robusca', 'petrodistillate', 'giggle-gas', 'fractal-copper'],
        exoticIngredient: null,
        resultAmount: 5,
        result: {
            name: 'Babybrain Bullets',
            description: 'Ammunition infused with volatile laughing gas compounds. On a hit, target must succeed on a DC 14 Wisdom save or suffer the Babybrain effect as per the spell for 1 minute.',
            effects: 'Creates 5 rounds of Babybrain Bullets. On hit: DC 14 WIS save or Babybrain for 1 minute.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/babybrainbullets.webp',
            craftedImage: 'assets/images/babybrainbullets.webp'
        }
    },
    {
        id: 'radiant-bullets',
        name: 'Radiant Bullets',
        ingredients: ['robusca', 'petrodistillate', 'starshot-ore', 'fractal-copper'],
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Radiant Bullets',
            description: 'Ammunition that streaks with blinding starlight. On a hit, deals the weapon\'s damage plus 1d4 as Radiant damage.',
            effects: 'Creates 10 rounds of Radiant Bullets. On hit: +1d4 radiant damage.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/radiantbullets.webp',
            craftedImage: 'assets/images/radiantbullets.webp'
        }
    },

    // AMMUNITION (ARROWS) - Using Shafts
    {
        id: 'penetrator-arrows',
        name: 'Penetrator Arrows',
        ingredients: ['darkwood-shafts', 'robusca', 'fractal-copper', 'fletching'], // UPDATED: Uses Darkwood Shafts
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Penetrator Arrows',
            description: 'A heavy arrow with a rifled metal tip. Deals piercing damage that overcomes Resistance to non-magical attacks.',
            effects: 'Creates 10 Penetrator Arrows. While used: ignores Resistance to non-magical piercing damage (table/DM call as needed).',
            category: ['crafted', 'weapon'],
            image: 'assets/images/penetratorarrows.webp',
            craftedImage: 'assets/images/penetratorarrows.webp'
        }
    },
    {
        id: 'radiant-arrows',
        name: 'Radiant Arrows',
        ingredients: ['darkwood-shafts', 'starshot-ore', 'phoenix-feather', 'fletching'], // UPDATED: Uses Darkwood Shafts (Heavy/Legendary base)
        exoticIngredient: null,
        resultAmount: 5,
        result: {
            name: 'Radiant Arrows',
            description: 'Arrows tipped with crystallized starlight. Deals additional Radiant damage and sheds bright light in flight.',
            effects: 'Creates 5 Radiant Arrows. While used: deals +1d4 radiant damage and sheds bright light while in flight (table/DM call).',
            category: ['crafted', 'weapon', 'legendary'],
            image: 'assets/images/radiantarrows.webp',
            craftedImage: 'assets/images/radiantarrows.webp'
        }
    },
    {
        id: 'pyroclasm-arrows',
        name: 'Pyroclasm Arrows',
        ingredients: ['darkwood-shafts', 'petrodistillate', 'phoenix-feather', 'fletching'], // UPDATED: Uses Darkwood Shafts (Heavy/Legendary base)
        exoticIngredient: null,
        resultAmount: 5,
        result: {
            name: 'Pyroclasm Arrows',
            description: 'Volatile arrows that detonate on impact. Targets within 5ft of the hit take 1d6 Fire damage.',
            effects: 'Creates 5 Pyroclasm Arrows. On hit: creatures within 5 ft take 1d6 fire damage (table/DM call).',
            category: ['crafted', 'weapon', 'legendary'],
            image: 'assets/images/pyroclasmarrows.webp',
            craftedImage: 'assets/images/pyroclasmarrows.webp'
        }
    },
    {
        id: 'hydroseethe-arrows',
        name: 'Hydroseethe Arrows',
        ingredients: ['lightwood-shafts', 'water-essence', 'fletching', 'rock-salt'], // Existing Lightwood
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Hydroseethe Arrows',
            description: 'Arrows that burst into boiling mist on impact. Targets hit deal half damage on their next weapon attack due to scalding steam.',
            effects: 'Creates 10 Hydroseethe Arrows. On hit: target deals half damage on its next weapon attack (table/DM call).',
            category: ['crafted', 'weapon'],
            image: 'assets/images/hydroseethearrows.webp',
            craftedImage: 'assets/images/hydroseethearrows.webp'
        }
    },
    {
        id: 'glimmerspark-arrows',
        name: 'Glimmerspark Arrows',
        ingredients: ['lightwood-shafts', 'copper-wire', 'fletching', 'lissomelemons'], // Existing Lightwood
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Glimmerspark Arrows',
            description: 'Arrows that crackle with low-voltage static. On a hit, the target cannot take Reactions until the start of its next turn.',
            effects: 'Creates 10 Glimmerspark Arrows. On hit: target can\'t take Reactions until the start of its next turn.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/glimmersparkarrows.webp',
            craftedImage: 'assets/images/glimmersparkarrows.webp'
        }
    },
    {
        id: 'giggle-gas-arrows',
        name: 'Giggle Gas Arrows',
        ingredients: ['lightwood-shafts', 'giggle-gas', 'fletching'], // Existing Lightwood
        exoticIngredient: null,
        resultAmount: 10,
        result: {
            name: 'Giggle Gas Arrows',
            description: 'Arrows with a fragile payload of laughing gas. On a hit, target suffers disadvantage on their next attack roll due to uncontrollable giggles.',
            effects: 'Creates 10 Giggle Gas Arrows. On hit: target has disadvantage on its next attack roll.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/gigglegasarrows.webp',
            craftedImage: 'assets/images/gigglegasarrows.webp'
        }
    },
    {
        id: 'magic-arrow-missiles',
        name: 'Magic Arrow Missiles',
        ingredients: ['darkwood-shafts', 'fletching', 'tastetanium-crystal'], // Existing Darkwood
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Magic Arrow Missiles',
            description: 'Arrows that split into three force darts in flight. Acts as the Magic Missile spell (1st level) when fired.',
            effects: 'Creates 3 Magic Arrow Missiles. When fired: functions as Magic Missile (1st level) (table/DM call).',
            category: ['crafted', 'weapon', 'legendary'],
            image: 'assets/images/magic arrow missiles.webp',
            craftedImage: 'assets/images/magic arrow missiles.webp'
        }
    },

    // GRENADES
    {
        id: 'grenade',
        name: 'Grenade',
        ingredients: ['petrodistillate', 'robusca', 'fractal-copper'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Grenade',
            description: 'A standard explosive device. Thrown (range 20/60). Explodes in a 5ft radius dealing 1d6 Fire + 1d6 Piercing damage.',
            effects: 'Creates 3 Grenades. Thrown (20/60). 5 ft radius: 1d6 fire + 1d6 piercing.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/grenade.webp',
            craftedImage: 'assets/images/grenade.webp'
        }
    },
    {
        id: 'babybrain-grenade',
        name: 'Babybrain Grenade',
        ingredients: ['babybrain-syrup', 'robusca', 'petrodistillate', 'giggle-gas'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Babybrain Grenade',
            description: 'A canister of weaponized incompetence. Thrown (range 20/60). 10ft radius cloud; DC 14 Wisdom save or suffer Babybrain effect for 1 minute.',
            effects: 'Creates 1 Babybrain Grenade. Thrown (20/60). 10 ft radius cloud: DC 14 WIS save or Babybrain for 1 minute.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/babybraingrenade.webp',
            craftedImage: 'assets/images/babybraingrenade.webp'
        }
    },
    {
        id: 'giggle-gas-grenade',
        name: 'Giggle Gas Grenade',
        ingredients: ['robusca', 'giggle-gas', 'petrodistillate'],
        exoticIngredient: null,
        resultAmount: 2,
        result: {
            name: 'Giggle Gas Grenade',
            description: 'Grenade that bursts into a fit of pink sparkles. 10ft radius; DC 12 Constitution save or be Incapacitated with laughter for 1 minute (save ends).',
            effects: 'Creates 2 Giggle Gas Grenades. 10 ft radius: DC 12 CON save or Incapacitated with laughter for 1 minute (save ends).',
            category: ['crafted', 'weapon'],
            image: 'assets/images/gigglegasgrenade.webp',
            craftedImage: 'assets/images/gigglegasgrenade.webp'
        }
    },

    // BEVERAGES
    {
        id: 'birch-beer',
        name: 'Birch Beer',
        ingredients: ['birch-syrup', 'water', 'yeast', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 2, // UPDATED Yield: 2
        result: {
            name: 'Birch Beer',
            description: 'A frothy, earthy soda with a deep forest taste.',
            effects: 'Restores 1d6 HP and grants 1d4 temporary HP. Overconsumption: consuming more than 1 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/birch beer.webp',
            craftedImage: 'assets/images/birch beer.webp'
        }
    },
    {
        id: 'sassy-sunset-birch-beer',
        name: 'Sassy Sunset Birch Beer',
        ingredients: ['birch-syrup', 'water', 'yeast', 'star-sugar', 'sunset-essence'],
        exoticIngredient: null,
        resultAmount: 1, // UPDATED Yield: 1
        result: {
            name: 'Sassy Sunset Birch Beer',
            description: 'A bold, \'Sassy\' root beer with a finish that glows like twilight.',
            effects: 'Restores 2d8 HP and grants Resistance to Cold damage for 4 hours. Overconsumption: consumption requires a Continence Check (table/DM call for timing).',
            category: ['food', 'crafted'],
            image: 'assets/images/sassysunsetbirchbeer.webp',
            craftedImage: 'assets/images/sassysunsetbirchbeer.webp'
        }
    },
    {
        id: 'lemonade',
        name: 'Lemonade',
        ingredients: ['lissomelemons', 'water', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Lemonade',
            description: 'A cool, refreshing drink that tingles on the tongue.',
            effects: 'Restores 1d6 HP and grants Resistance to Lightning damage for 1 hour. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/lemonade.webp',
            craftedImage: 'assets/images/lemonade.webp'
        }
    },
    {
        id: 'pink-lemonade',
        name: 'Pink Lemonade',
        ingredients: ['lissomelemons', 'water', 'white-sugar', 'berrimaters'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Pink Lemonade',
            description: 'Sweet, tart, and vibrating with color.',
            effects: 'Restores 1d8 HP and grants immunity to the Charmed condition for 4 hours. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/pinklemonade.webp',
            craftedImage: 'assets/images/pinklemonade.webp'
        }
    },

    // SWEETS & TREATS
    {
        id: 'cherry-ice-cream',
        name: 'Cherry Ice Cream',
        ingredients: ['white-sugar', 'cream', 'egg', 'planarcherry'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Cherry Ice Cream',
            description: 'Ice Cream and Fruit?! Said someone silly a long time ago, this stuff is delicious.',
            effects: 'During a short rest: restores 1d8 HP. Overconsumption: consuming more than 2 servings requires a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/cherryicecream.webp',
            craftedImage: 'assets/images/cherryicecream.webp'
        }
    },
    {
        id: 'chocolate-ice-cream',
        name: 'Chocolate Ice Cream',
        ingredients: ['cream', 'white-sugar', 'egg', 'greensea-cacao'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Chocolate Ice Cream',
            description: 'Rich, cold, and chocolatey. It cures what ails the soul.',
            effects: 'During a short rest: restores 1d8 HP. Overconsumption: consuming more than 2 servings requires a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/chocolateicecream.webp',
            craftedImage: 'assets/images/chocolateicecream.webp'
        }
    },
    {
        id: 'cherry-bar',
        name: 'Cherry Bar',
        ingredients: ['lissomesoybeans', 'peanut-butter', 'white-sugar', 'planarcherry'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Cherry Bar',
            description: 'Dense, chewy, and bursting with tart dimensional flavor.',
            effects: 'During a short rest: restores 1d8 HP. Overconsumption: consuming more than 2 requires a Continence Check at the end of the short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/cherrybar.webp',
            craftedImage: 'assets/images/cherrybar.webp'
        }
    },
    {
        id: 'chocolate-bar',
        name: 'Chocolate Bar',
        ingredients: ['greensea-cacao', 'white-sugar', 'cream'],
        exoticIngredient: null,
        resultAmount: 6, // UPDATED Yield: 6
        result: {
            name: 'Chocolate Bar',
            description: 'A simple bar of smooth milk chocolate. A classic pick-me-up.',
            effects: 'Restores 5 HP. Overconsumption: consuming more than 3 squares during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/chocolate bar.webp',
            craftedImage: 'assets/images/chocolate bar.webp'
        }
    },
    {
        id: 'cosmic-dark-chocolate',
        name: 'Cosmic Dark Chocolate',
        ingredients: ['eldritch-cacao', 'magicaramel', 'star-sugar', 'cream'],
        exoticIngredient: null,
        resultAmount: 2,
        result: {
            name: 'Cosmic Dark Chocolate',
            description: 'Chocolate so dark it absorbs light, flecked with literal stardust.',
            effects: 'Restores 3d8 HP and grants Resistance to Psychic damage for 4 hours. Overconsumption: consuming more than 1 requires a Continence Check (table/DM call for timing).',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/cosmicdarkchocolate.webp',
            craftedImage: 'assets/images/cosmicdarkchocolate.webp'
        }
    },
    {
        id: 'magichocolate',
        name: 'Magichocolate',
        ingredients: ['greensea-cacao', 'magicaramel', 'white-sugar', 'cream'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Magichocolate',
            description: 'Chocolate swirled with magical caramel.',
            effects: 'Restores 1d6 HP and grants a vague sense of optimism. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/magichocolate.webp',
            craftedImage: 'assets/images/magichocolate.webp'
        }
    },
    {
        id: 'mochi',
        name: 'Mochi',
        ingredients: ['rice', 'white-sugar', 'water'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Mochi',
            description: 'Chewy, sweet rice cakes with a delightful texture. A popular snack that keeps well on the road.',
            effects: 'Restores 2 HP. Overconsumption: consuming more than 6 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/mochi.webp',
            craftedImage: 'assets/images/mochi.webp'
        }
    },
    {
        id: 'royal-mochi',
        name: 'Royal Mochi',
        ingredients: ['royalrice', 'white-sugar', 'lissomesoybeans', 'planarcherry'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Royal Mochi',
            description: 'Soft, chewy rice cakes made from the Emperor\'s grain.',
            effects: 'Restores 2d10 HP and removes one level of Exhaustion. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/royalmochi.webp',
            craftedImage: 'assets/images/royalmochi.webp'
        }
    },

    // COOKIES, MUFFINS & FROSTINGS
    {
        id: 'peanut-butter-cookies',
        name: 'Peanut Butter Cookies',
        ingredients: ['peanut-butter', 'flour', 'egg', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Peanut Butter Cookies',
            description: 'Crisp, crumbly cookies with a rich, nutty heart.',
            effects: 'During a short rest: restores 1d4 HP and grants Advantage on Strength checks for 10 minutes. Overconsumption: consuming more than 3 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/peanutbuttercookies.webp',
            craftedImage: 'assets/images/peanutbuttercookies.webp'
        }
    },
    {
        id: 'choco-peanut-butter-cookies',
        name: 'Choco Peanut Butter Cookies',
        ingredients: ['peanut-butter', 'greensea-cacao', 'flour', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Choco Peanut Butter Cookies',
            description: 'The ultimate alliance of two great flavors.',
            effects: 'During a short rest: restores 1d6 HP. Overconsumption: consuming more than 3 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/chocopeanutbuttercookies.webp',
            craftedImage: 'assets/images/chocopeanutbuttercookies.webp'
        }
    },
    {
        id: 'muffin',
        name: 'Muffin',
        ingredients: ['flour', 'egg', 'cream', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Muffin',
            description: 'A simple, fluffy muffin. Not fancy, but it feels like home.',
            effects: 'During a short rest: restores 1d4 HP. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/muffin.webp',
            craftedImage: 'assets/images/muffin.webp'
        }
    },
    {
        id: 'lemon-muffin',
        name: 'Lemon Muffin',
        ingredients: ['flour', 'egg', 'cream', 'lissomelemons'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Lemon Muffin',
            description: 'A light muffin with a citrus zing. Wakes you right up!',
            effects: 'During a short rest: restores 1d4 HP and grants immunity to Sleep effects for 4 hours. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/lemonmuffin.webp',
            craftedImage: 'assets/images/lemonmuffin.webp'
        }
    },
    {
        id: 'chocomuffin',
        name: 'Chocomuffin',
        ingredients: ['flour', 'egg', 'cream', 'greensea-cacao'],
        exoticIngredient: null,
        resultAmount: 6,
        result: {
            name: 'Chocomuffin',
            description: 'A dark, moist muffin that pairs perfectly with coffee or milk.',
            effects: 'During a short rest: restores 2d4 HP. Overconsumption: consuming more than 2 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/chocomuffin.webp',
            craftedImage: 'assets/images/chocomuffin.webp'
        }
    },
    {
        id: 'dubble-choco-muffin',
        name: 'Dubble Choco Muffin',
        ingredients: ['flour', 'egg', 'cream', 'greensea-cacao', 'magichocolate'],
        exoticIngredient: null,
        resultAmount: 4,
        result: {
            name: 'Dubble Choco Muffin',
            description: 'A muffin so rich effectively it\'s closer to truffle than bread.',
            effects: 'During a short rest: restores 3d4 HP. Overconsumption: consuming more than 1 during a short rest requires a Continence Check at the end of that rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/dubblechocomuffin.webp',
            craftedImage: 'assets/images/dubblechocomuffin.webp'
        }
    },
    // Frosting jars (yield 1, multi-use presumed flavor, heavy sugar warning)
    {
        id: 'lemon-frosting',
        name: 'Lemon Frosting',
        ingredients: ['butter', 'white-sugar', 'cream', 'lissomelemons'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Lemon Frosting',
            description: 'A zesty, creamy frosting that balances sweetness with a sharp citrus kick.',
            effects: 'Restores 1d4 HP and clears the Frightened condition. High Sugar: Continence Check required if consumed alone (table/DM call).',
            category: ['food', 'crafted'],
            image: 'assets/images/lemonfrosting.webp',
            craftedImage: 'assets/images/lemonfrosting.webp'
        }
    },
    {
        id: 'peanut-butter-frosting',
        name: 'Peanut Butter Frosting',
        ingredients: ['peanut-butter', 'white-sugar', 'cream', 'butter'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Peanut Butter Frosting',
            description: 'Thick, nutty frosting that tastes good on almost anything (even a spoon).',
            effects: 'High Sugar: Continence Check required if consumed alone (table/DM call).',
            category: ['food', 'crafted'],
            image: 'assets/images/peanut butter frosting.webp',
            craftedImage: 'assets/images/peanut butter frosting.webp'
        }
    },
    {
        id: 'exotic-cherry-frosting',
        name: 'Exotic Cherry Frosting',
        ingredients: ['planarcherry', 'white-sugar', 'cream', 'butter'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Exotic Cherry Frosting',
            description: 'Frosting that tastes tart, sweet, and faintly like the color purple.',
            effects: 'Restores 1d4 HP. High Sugar: Continence Check required if consumed alone (table/DM call).',
            category: ['food', 'crafted'],
            image: 'assets/images/exoticherryfrosting.webp',
            craftedImage: 'assets/images/exoticherryfrosting.webp'
        }
    },
    {
        id: 'chocolate-frosting',
        name: 'Chocolate Frosting',
        ingredients: ['greensea-cacao', 'white-sugar', 'cream', 'butter'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Chocolate Frosting',
            description: 'A rich, velvety chocolate ganache whipped into a spreadable delight.',
            effects: 'High Sugar: Continence Check required if consumed alone (table/DM call).',
            category: ['food', 'crafted'],
            image: 'assets/images/chocolate frosting.webp',
            craftedImage: 'assets/images/chocolate frosting.webp'
        }
    },
    {
        id: 'darkwood-paddle',
        name: 'Darkwood Paddle',
        ingredients: ['bronzewood', 'vitalium', 'defractor-prism'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Darkwood Paddle',
            description: 'A paddle crafted of dark hardwood that contains the power to bring others under heel. This paddle ignores all but the thickest of magical padding and strikes true as though it were not there.',
            effects: 'Creates 1 Darkwood Paddle. When used to perform discipline, the target can\'t take Reactions until the start of its next turn and its speed is reduced by 10ft for each strike of the paddle.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/darkwoodpaddle.webp',
            craftedImage: 'assets/images/darkwoodpaddle.webp'
        }
    },
    {
        id: 'lightwood-paddle',
        name: 'Lightwood Paddle',
        ingredients: ['greenwood', 'vitalocanum', 'defractor-prism'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Lightwood Paddle',
            description: 'A paddle crafted of light hardwood that contains the power to bring others under heel. This paddle ignores all but the thickest of magical padding and strikes true as though it were not there.',
            effects: 'Creates 1 Lightwood Paddle. When used to perform discipline, the target does not get the benefit of armor or magical padding against the paddle strikes- each strike reduces their speed by 5ft until the end of their next turn.',
            category: ['crafted', 'weapon'],
            image: 'assets/images/lightwoodpaddle.webp',
            craftedImage: 'assets/images/lightwoodpaddle.webp'
        }
    },
    {
        id: 'giggly-vanilla-ice-cream',
        name: 'Giggly Vanilla Ice Cream',
        ingredients: ['cream', 'white-sugar', 'egg', 'vanilla'],
        exoticIngredient: 'giggle-gas',
        resultAmount: 1,
        result: {
            name: 'Giggly Vanilla Ice Cream',
            description: 'Tag: Giggly. The tried-and-true classic, now with tiny effervescent pops that make you smile… and maybe regret it.',
            effects: 'Restores 6HP, 8 if savored during a short rest.\nGiggly effect: At the end of the short rest, roll 1d2. On a 2, nothing happens beyond normal restoration. On a 1, the user suffers a failed Continence check (treated as a Critical Failure/Natural 1) at the end of the short rest.',
            category: ['food', 'crafted', 'giggly'],
            nameColor: '#ff69b4',
            image: 'assets/images/VanillaIceCreamSMALL.webp',
            craftedImage: 'assets/images/VanillaIceCream.webp',
            size: {
                width: 128,
                height: 128
            }
        }
    },
    {
        id: 'lemon-cheesecake-donut',
        name: 'Lemon Cheesecake Donut',
        ingredients: ['flour', 'cream', 'white-sugar', 'lissomelemons'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Lemon Cheesecake Donut',
            description: 'A rich, zesty donut filled with creamy sweetness and topped with a bright, static-charged lemon glaze.',
            effects: 'Restores 1d8+4 HP in combat or 12 HP during a short rest. Additionally, the zesty charge grants immunity to Sleep and Hallucination effects for 1 hour. Overconsumption: consuming more than 1 per short rest requires an immediate potty check at the end of that short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/lemoncheesecakedonut.webp',
            craftedImage: 'assets/images/lemoncheesecakedonut.webp'
        }
    },
    {
        id: 'lavender-cream-donut',
        name: 'Lavender Cream Donut',
        ingredients: ['flour', 'cream', 'white-sugar', 'dreamvapor'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Lavender Cream Donut',
            description: 'A delicate, fluffy donut infused with the ephemeral, soothing essence of lavender mist and lost lullabies.',
            effects: 'Restores 1d8+4 HP in combat or 12 HP during a short rest. Additionally, its soothing nature grants advantage on saving throws against being Charmed or Frightened for 1 hour. Overconsumption: consuming more than 1 per short rest requires an immediate potty check at the end of that short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/lavendercreamdonut.webp',
            craftedImage: 'assets/images/lavendercreamdonut.webp'
        }
    },
    {
        id: 'wildberry-tart-donut',
        name: 'Wildberry Tart Donut',
        ingredients: ['flour', 'egg', 'white-sugar', 'planarcherry'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Wildberry Tart Donut',
            description: 'A sweet, doughy ring topped with a brilliant, dimensional tart-berry reduction that tingles on the tongue.',
            effects: 'Restores 1d8+4 HP in combat or 12 HP during a short rest. Additionally, the multi-dimensional fruit grants a +10 ft bonus to your walking speed for 10 minutes. Overconsumption: consuming more than 1 per short rest requires an immediate potty check at the end of that short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/wildberrytartdonut.webp',
            craftedImage: 'assets/images/wildberrytartdonut.webp'
        }
    },
    {
        id: 'strawberry-iced-donut',
        name: 'Strawberry Iced Donut',
        ingredients: ['flour', 'butter', 'white-sugar', 'berrimaters'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Strawberry Iced Donut',
            description: 'The ultimate comforting classic. A perfectly fried ring topped with a sweet, cherry-red berrimater icing and colorful sprinkles.',
            effects: 'Restores 1d8+4 HP in combat or 12 HP during a short rest. Additionally, the pure sugary comfort grants 1d4 temporary hit points that last for 1 hour. Overconsumption: consuming more than 1 per short rest requires an immediate potty check at the end of that short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/strawberryiceddonut.webp',
            craftedImage: 'assets/images/strawberryiceddonut.webp'
        }
    },
    {
        id: 'old-fashioned-choco-classic',
        name: 'Old-Fashioned Choco-Classic',
        ingredients: ['flour', 'egg', 'white-sugar', 'greensea-cacao'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Old-Fashioned Choco-Classic',
            description: 'A dense, cakey donut with a perfect, slightly crunchy exterior, heavily glazed in rich, dark jungle cacao.',
            effects: 'Restores 1d8+4 HP in combat or 12 HP during a short rest. Overconsumption: consuming more than 1 per short rest requires an immediate potty check at the end of that short rest.',
            category: ['food', 'crafted'],
            image: 'assets/images/oldfashionedchococlassic.webp',
            craftedImage: 'assets/images/oldfashionedchococlassic.webp'
        }
    },
    {
        id: 'greater-hp-potion',
        name: 'Greater HP Potion',
        ingredients: ['robusca', 'vitalocanum', 'water-essence'],
        exoticIngredient: 'sunset-essence',
        resultAmount: 1,
        result: {
            name: 'Greater HP Potion',
            description: 'A strong restorative potion that mends deep injuries much faster than the academy-standard red bottle.',
            effects: 'Restores 6d4+6 HP in combat, or up to 30 HP outside combat.',
            category: ['crafted', 'essence'],
            image: 'assets/images/greaterhealthpotion.webp',
            craftedImage: 'assets/images/greaterhealthpotion.webp'
        }
    },
    {
        id: 'weaver-sigil',
        name: 'Weaver Sigil',
        ingredients: ['congealed-silk', 'yarn', 'defractor-prism'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Weaver Sigil',
            description: 'A spun sigil keyed to the Great Weaver. Invoke it outside combat to veil one traveler, halving random encounter cadence.',
            effects: 'Halves random encounter cadence for one traveler for the next 150 hexes of movement. Consumed on use.',
            category: ['crafted', 'essence'],
            image: 'assets/images/weaversigil.webp',
            craftedImage: 'assets/images/weaversigil.webp'
        }
    },
    {
        id: 'refined-silk',
        name: 'Refined Silk',
        ingredients: ['congealed-silk', 'solvent'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Refined Silk',
            description: 'Silken thread spun and treated to form a light, shimmering fabric with high magical affinity.',
            effects: 'A processed material used in high-end magical crafting.',
            category: ['crafted', 'material', 'textile', 'rare'],
            image: 'assets/images/refinedsilk.webp',
            craftedImage: 'assets/images/refinedsilk.webp'
        }
    },
    {
        id: 'emergency-rescue-beacon',
        name: 'Emergency Rescue Beacon',
        ingredients: ['refined-silk', 'vitalocanum', 'defractor-prism', 'sunset-essence'],
        exoticIngredient: 'prismatic-activator',
        resultAmount: 1,
        result: {
            name: 'Emergency Rescue Beacon',
            description: 'A single-use rescue flare keyed to Scholia. Trigger it outside combat to yank one bearer back to the Scholia front gates.',
            effects: 'Return one bearer to the Scholia front gates. Consumed on use.',
            category: ['crafted', 'essence'],
            image: 'assets/images/rescuebeacon.webp',
            craftedImage: 'assets/images/rescuebeacon.webp'
        }
    },
    {
        id: 'brown-tincture',
        name: 'Brown Tincture',
        ingredients: ['pottytime-fungus', 'nightshroom', 'water'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Brown Tincture',
            description: 'An ingestion poison that forces DC 15 CON saves against bowel incontinence.',
            effects: 'DC 15 Constitution Save or bowel incontinence for 1d2 days.',
            category: ['crafted', 'essence'],
            image: 'assets/images/healthpotion.webp',
            craftedImage: 'assets/images/healthpotion.webp'
        }
    },
    {
        id: 'echoing-mana-brew',
        name: 'Echoing Mana Brew',
        ingredients: ['echo-shard', 'chronal-crystal', 'water'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Echoing Mana Brew',
            description: 'A resonating magical beverage crafted from chronal crystals and echo shards. Overconsumption of its temporal properties causes rapid biological urgency, forcing an immediate potty check.',
            effects: 'Restores one 1st-level spell slot and one 2nd-level spell slot. Overconsumption triggers an immediate potty check.',
            category: ['food', 'crafted'],
            image: 'assets/images/echoing_mana_brew.webp',
            craftedImage: 'assets/images/echoing_mana_brew.webp'
        }
    },
    {
        id: 'eldritch-spiced-cocoa',
        name: 'Eldritch Spiced Cocoa',
        ingredients: ['eldritch-cacao', 'starshot-ore', 'lunar-egg', 'white-sugar'],
        exoticIngredient: null,
        resultAmount: 2,
        result: {
            name: 'Eldritch Spiced Cocoa',
            description: 'A decadent spiced chocolate beverage that tempers the spirit but challenges the stomach, forcing an immediate potty check.',
            effects: 'Restores 10 HP and grants temporary resistance to Psychic damage for 4 hours. Overconsumption triggers an immediate potty check.',
            category: ['food', 'crafted'],
            image: 'assets/images/eldritch_spiced_cocoa.webp',
            craftedImage: 'assets/images/eldritch_spiced_cocoa.webp'
        }
    },
    {
        id: 'resilience-ointment',
        name: 'Resilience Ointment',
        ingredients: ['simple-herb', 'adhesive', 'vitalium'],
        exoticIngredient: null,
        resultAmount: 3,
        result: {
            name: 'Resilience Ointment',
            description: 'A thick herbal balm that bolsters physical endurance and Constitution saving throws.',
            effects: 'Grants advantage on Constitution saving throws (including continence checks) for 2 hours.',
            category: ['crafted', 'essence'],
            image: 'assets/images/resilience_ointment.webp',
            craftedImage: 'assets/images/resilience_ointment.webp'
        }
    },
    {
        id: 'phoenix-embers-glaze',
        name: 'Phoenix Embers Glaze',
        ingredients: ['wildflower-honey-cream', 'star-sugar', 'water-essence'],
        exoticIngredient: 'phoenix-feather',
        resultAmount: 1,
        result: {
            name: 'Phoenix Embers Glaze',
            description: 'A sweet, glowing glaze that bestows the eternal protective warmth of the phoenix. Its explosive fiery heat requires an immediate potty check.',
            effects: 'Restores 15 HP and grants Fire immunity and Cold resistance for 2 hours. Overconsumption triggers an immediate potty check.',
            category: ['food', 'crafted', 'legendary'],
            image: 'assets/images/phoenix_embers_glaze.webp',
            craftedImage: 'assets/images/phoenix_embers_glaze.webp'
        }
    },
    {
        id: 'planar-cherry-tart',
        name: 'Planar Cherry Tart',
        ingredients: ['planarcherry', 'butter', 'flour', 'star-sugar'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Planar Cherry Tart',
            description: 'A sweet, space-bending pastry that accelerates travel. Its dimensional shifting forces an immediate potty check.',
            effects: 'Restores 12 HP and increases travel speed by 3 hexes for the next 300 hexes of travel. Overconsumption triggers an immediate potty check.',
            category: ['food', 'crafted'],
            image: 'assets/images/planar_cherry_tart.webp',
            craftedImage: 'assets/images/planar_cherry_tart.webp'
        }
    },
    {
        id: 'marbled-marshmallows',
        name: 'Marbled Marshmallows',
        ingredients: ['marsh-mallow-root', 'white-sugar', 'spring-water'],
        resultAmount: 5,
        exoticIngredient: null,
        result: {
            name: 'Marbled Marshmallows',
            description: 'A spongy, delightfully soft cuboid treat popular among students camping in the Campus Woods. The ambient glowing fog of the Marshland Nexus gives it a beautiful, faint-blue marbling.',
            effects: 'Restores 1d4 HP (Maximum 4 HP if consumed during a short rest) and grants resistance to falling damage for 1 hour. Overconsumption Penalty: Consuming more than four per short rest forces an immediate Potty Check.',
            image: 'assets/images/marbled-marshmallows.webp',
            craftedImage: 'assets/images/marbled-marshmallows.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'school-clam-chowder',
        name: 'School Clam Chowder',
        ingredients: ['school-clam', 'cream', 'savour-herb', 'rock-salt'],
        resultAmount: 1,
        exoticIngredient: null,
        result: {
            name: 'School Clam Chowder',
            description: 'A thick, deeply warming, and profoundly savory soup. It is a staple comfort food designed to shake off the bone-chilling dampness of the coastal winds or the humid chill of the deep jungle.',
            effects: 'Grants 2d6 Temporary Hit Points (Maximum 12 Temp HP if consumed during a short rest) and advantage on Constitution saving throws against cold environments for 12 hours. Overconsumption Penalty: The rich dairy base forces an immediate Potty Check if more than one bowl is eaten per short rest.',
            image: 'assets/images/School_Clam_Chowder.webp',
            craftedImage: 'assets/images/School_Clam_Chowder.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'smores',
        name: 'Smores',
        ingredients: ['chocolate-bar', 'simple-biscuit', 'marbled-marshmallows'],
        resultAmount: 2,
        exoticIngredient: null,
        result: {
            name: 'Smores',
            description: 'The quintessential champion of outdoor student survival, assembled over a crackling campfire. The hot, toasted marshmallow melts the chocolate, creating a gooey, transcendent center of domestic comfort.',
            effects: 'Instantly removes the Frightened or Charmed condition. If consumed during a Short Rest, the profound sense of comfort allows the student to add a +1 bonus to the maximum value of every Hit Die rolled. Overconsumption Penalty: The intense sugar rush forces an immediate Potty Check.',
            image: 'assets/images/Smores.webp',
            craftedImage: 'assets/images/Smores.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'foundry-floor-coffee',
        name: 'Foundry-Floor Coffee',
        ingredients: ['water', 'cream', 'greensea-coffee-beans'],
        resultAmount: 2,
        exoticIngredient: null,
        result: {
            name: 'Foundry-Floor Coffee',
            description: 'A dark, viscous, and incredibly potent brew consumed by the gallon in the subterranean macro-forges of Elzbereth. It is functional, bitter, and hits the nervous system like a warhammer.',
            effects: 'Restores 1d4 HP (Maximum 4 HP if consumed during a short rest). For the next hour, the drinker gains a +2 bonus to Initiative rolls. Overconsumption Penalty: The sheer acidic caffeine content is brutal on the digestive tract. Consuming more than one per short rest forces an immediate Potty Check at disadvantage.',
            image: 'assets/images/Foundry-Floor_Coffee.webp',
            craftedImage: 'assets/images/Foundry-Floor_Coffee.webp',
            category: ['beverage', 'consumable']
        }
    },
    {
        id: 'arcanists-espresso-cake',
        name: "Arcanist's Espresso Cake",
        ingredients: ['flour', 'butter', 'white-sugar', 'greensea-coffee-beans'],
        resultAmount: 2,
        exoticIngredient: null,
        result: {
            name: "Arcanist's Espresso Cake",
            description: 'A dense, springy sponge cake deeply marbled with concentrated coffee. It is a favored treat among chronomancers who require massive bursts of simultaneous caloric and mental energy.',
            effects: 'Restores 1d6 HP (Maximum 6 HP if consumed during a short rest). Grants advantage on Intelligence (Arcana) checks for 10 minutes. Overconsumption Penalty: The dense combination of fat, sugar, and raw caffeine acts as an aggressive laxative. Eating more than one slice per short rest forces an immediate Potty Check.',
            image: 'assets/images/Arcanist_Espresso_Cake.webp',
            craftedImage: 'assets/images/Arcanist_Espresso_Cake.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'greensea-canopy-salad',
        name: 'Greensea Canopy Salad',
        ingredients: ['lakale', 'greenseamatoto', 'coneseeds', 'savour-herb'],
        resultAmount: 2,
        exoticIngredient: null,
        result: {
            name: 'Greensea Canopy Salad',
            description: 'A crunchy, nutrient-dense, and highly fibrous bowl of raw greens natively harvested from the untamed borders of the Greensea Expanse. It tastes intensely of the earth and requires serious jaw-strength to chew.',
            effects: 'Restores 1d8 HP (Maximum 8 HP if consumed during a short rest). Eating this superfood immediately cures the Poisoned condition. Overconsumption Penalty: The extreme volume of raw, magical jungle fiber is notoriously difficult to process. Eating more than one salad per short rest forcefully purges the system, triggering an immediate Potty Check at disadvantage.',
            image: 'assets/images/Greensea_Canopy_Salad.webp',
            craftedImage: 'assets/images/Greensea_Canopy_Salad.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'wayfarers-gotato-fries',
        name: "Wayfarer's Gotato Fries",
        ingredients: ['gotato', 'cooking-oil', 'rock-salt'],
        resultAmount: 1,
        exoticIngredient: null,
        result: {
            name: "Wayfarer's Gotato Fries",
            description: 'A greasy, salty, universally beloved comfort food sold in paper cones at the snack shack along the Road to Majica.',
            effects: 'Restores 1d6 HP (Maximum 6 HP if consumed during a short rest). Grants a +1 bonus to the next saving throw made within 10 minutes. Overconsumption Penalty: The heavy grease from the cooking oil settles poorly in a resting stomach. Eating more than one serving per short rest forces an immediate Potty Check.',
            image: 'assets/images/Wayfarer_Gotato_Fries.webp',
            craftedImage: 'assets/images/Wayfarer_Gotato_Fries.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'crimson-mess-hall-mashed-gotatos',
        name: 'Crimson Mess Hall Mashed Gotatos',
        ingredients: ['gotato', 'cream', 'rock-salt', 'herb-butter'],
        resultAmount: 2,
        exoticIngredient: null,
        result: {
            name: 'Crimson Mess Hall Mashed Gotatos',
            description: 'A thick, buttery, and incredibly heavy side dish traditionally served in the grand chambers of the Crimson Mess Hall. It is designed to physically weigh a student down and coat the ribs.',
            effects: 'Restores 2d4 HP (Maximum 8 HP if consumed during a short rest). Restores 1 lost Maturity Point. Overconsumption Penalty: The overwhelming amount of heavy dairy fat mixed with dense starch creates an undeniable biological pressure. Consuming more than one bowl per short rest forces an immediate Potty Check at disadvantage.',
            image: 'assets/images/Crimson_Mess_Hall_Mashed_Gotatos.webp',
            craftedImage: 'assets/images/Crimson_Mess_Hall_Mashed_Gotatos.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'greensea-nanner-loaf',
        name: 'Greensea Nanner Loaf',
        ingredients: ['greenseananners', 'flour', 'butter', 'egg'],
        resultAmount: 2,
        exoticIngredient: null,
        result: {
            name: 'Greensea Nanner Loaf',
            description: 'A sweet, incredibly dense, and moist bread that utilizes the naturally sweet, energy-rich fruits found in the humid, explosive growth of the Temperate Jungle.',
            effects: 'Restores 1d8 HP (Maximum 8 HP if consumed during a short rest). Grants 1d4 temporary hit points that last until the next rest. Overconsumption Penalty: The heavy, dense fruit bread sits like a brick in the lower intestines. Eating more than one loaf per short rest forces an immediate Potty Check.',
            image: 'assets/images/Greensea_Nanner_Loaf.webp',
            craftedImage: 'assets/images/Greensea_Nanner_Loaf.webp',
            category: ['food', 'consumable']
        }
    },
    {
        id: 'the-nanners-hootzer',
        name: 'The Nanners Hootzer',
        ingredients: ['greenseananners', 'greensea-cacao', 'cream', 'caramel'],
        resultAmount: 1,
        exoticIngredient: null, // Since the logic dictates combination-based legendary, but we could assign one if it used a specific catalyst.
        result: {
            name: 'The Nanners Hootzer',
            description: 'A decadent, awe-inspiring, and outrageously indulgent legendary dessert named in honor of Headmaster Horace Hootz. It is a massive sundae-style concoction usually reserved for graduating seniors.',
            effects: 'Restores 4d4 HP (Maximum 16 HP if consumed during a short rest). Instantly removes one level of exhaustion and restores all missing Maturity Points. Overconsumption Penalty: This dish is an absolute biological ticking time bomb of pure sugar, heavy dairy, and rich cacao. Consuming more than one of these massive sundaes per short rest completely overwhelms the digestive tract, forcing an immediate Potty Check at disadvantage, and reducing the eater’s movement speed by 5 feet for 1 hour due to intense bloating.',
            image: 'assets/images/The_Nanners_Hootzer.webp',
            craftedImage: 'assets/images/The_Nanners_Hootzer.webp',
            category: ['food', 'legendary', 'consumable']
        }
    },
    {
        id: 'cosmic-cold-brew',
        name: 'Cosmic Cold Brew',
        ingredients: ['water', 'greensea-coffee-beans', 'star-sugar'],
        resultAmount: 1,
        exoticIngredient: 'distillation-of-a-night-sky',
        result: {
            name: 'Cosmic Cold Brew',
            description: 'A freezing, glittering stimulant that looks like a swirling galaxy trapped within a heavy, industrial mug.',
            effects: 'Restores 4d4 HP (Maximum 16 HP if consumed during a short rest). Cures all levels of exhaustion instantly and grants the drinker Darkvision and a +10 ft. bonus to their movement speed for 8 hours. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Cosmic_Cold_Brew.webp',
            craftedImage: 'assets/images/Cosmic_Cold_Brew.webp',
            category: ['beverage', 'legendary', 'consumable']
        }
    },
    {
        id: 'mothers-comfort-mash',
        name: "Mother's Comfort Mash",
        ingredients: ['gotato', 'magibutter', 'cream', 'rock-salt'],
        resultAmount: 1,
        exoticIngredient: 'touch-of-love',
        result: {
            name: "Mother's Comfort Mash",
            description: 'The ultimate expression of domestic safety in County Majicka, a haven known for its comfortable, padded domesticity. The infusion of common love magic turns a simple bowl of mashed gotatos into a comforting psychological shield.',
            effects: 'Restores 3d6 HP (Maximum 18 HP if consumed during a short rest). The eater gains advantage on saving throws against the Frightened and Charmed conditions for 4 hours, wrapped in a soothing sense of maternal protection. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Mothers_Comfort_Mash.webp',
            craftedImage: 'assets/images/Mothers_Comfort_Mash.webp',
            category: ['food', 'uncommon', 'consumable']
        }
    },
    {
        id: 'matrix-glazed-biscuits',
        name: 'Matrix-Glazed Biscuits',
        ingredients: ['biscuits', 'white-sugar', 'butter'],
        resultAmount: 4,
        exoticIngredient: 'flavor-matrix',
        result: {
            name: 'Matrix-Glazed Biscuits',
            description: 'An ordinary, crumbly biscuit weaponized by the awesome gastronomic might of the flavor matrix. The glaze shifts colors randomly and tastes like pure, concentrated dopamine.',
            effects: 'Restores 2d4 HP (Maximum 8 HP if consumed during a short rest). A volatile catalyst snack: roll 1d4 when eaten to restore that many expended spell slots of 1st or 2nd level. Overconsumption Penalty: Consuming more than two per short rest forces an immediate Potty Check.',
            image: 'assets/images/Matrix-Glazed_Biscuits.webp',
            craftedImage: 'assets/images/Matrix-Glazed_Biscuits.webp',
            category: ['food', 'legendary', 'consumable']
        }
    },
    {
        id: 'azure-clam-chowder',
        name: 'Azure Clam Chowder',
        ingredients: ['school-clam', 'azure-cream', 'rock-salt', 'savour-herb'],
        resultAmount: 1,
        exoticIngredient: 'distillation-of-a-night-sky',
        result: {
            name: 'Azure Clam Chowder',
            description: 'A glowing, ethereal blue chowder. The bottled twilight essence perfectly complements the oceanic brine of the clam harvested from the Westersea.',
            effects: 'Restores 3d8 HP (Maximum 24 HP if consumed during a short rest). Grants the eater resistance to Cold and Fire damage for the duration of an expedition, and allows them to breathe underwater for 1 hour. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Azure_Clam_Chowder.webp',
            craftedImage: 'assets/images/Azure_Clam_Chowder.webp',
            category: ['food', 'legendary', 'consumable']
        }
    },
    {
        id: 'lovers-latte',
        name: 'Lover’s Latte',
        ingredients: ['water', 'greensea-coffee-beans', 'wildflower-honey-cream', 'star-sugar'],
        resultAmount: 1,
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Lover’s Latte',
            description: 'A warm, perfectly frothed morning beverage adorned with a glowing pink foam heart that never dissolves.',
            effects: 'Restores 2d6 HP (Maximum 12 HP if consumed during a short rest). Grants the drinker advantage on all Charisma-based checks for 1 hour, and immediately restores 1d4 Maturity Points. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Lovers_Latte.webp',
            craftedImage: 'assets/images/Lovers_Latte.webp',
            category: ['beverage', 'uncommon', 'consumable']
        }
    },
    {
        id: 'starlight-mallow-fudge',
        name: 'Starlight Mallow-Fudge',
        ingredients: ['marsh-mallow-root', 'magibutter', 'eldritch-cacao', 'star-sugar'],
        resultAmount: 4,
        exoticIngredient: 'flavor-matrix',
        result: {
            name: 'Starlight Mallow-Fudge',
            description: 'A cube of fudge so dense, sweet, and perfectly synthesized that it defies standard culinary physics, never melting in the sun.',
            effects: 'Restores 4d10 HP (Maximum 40 HP if consumed during a short rest). Acts as a perfect survival ration. One bite sustains a creature for a full day and grants 10 Temporary Hit Points. Overconsumption Penalty: Consuming more than two per short rest forces an immediate Potty Check.',
            image: 'assets/images/Starlight_Mallow-Fudge.webp',
            craftedImage: 'assets/images/Starlight_Mallow-Fudge.webp',
            category: ['food', 'legendary', 'consumable']
        }
    },
    {
        id: 'star-soaked-nanner-flambe',
        name: 'Star-Soaked Nanner Flambé',
        ingredients: ['everripenanners', 'magicaramel', 'magibutter', 'starsoaked-vanilla'],
        resultAmount: 1,
        exoticIngredient: null,
        result: {
            name: 'Star-Soaked Nanner Flambé',
            description: 'Using the legendary, luminous starsoaked-vanilla and potent magicaramel to flambé the extremely rare, energy-rich jungle fruit cultivated near the humid canopy of the Greensea.',
            effects: 'Restores 2d10 HP (Maximum 20 HP if consumed during a short rest). A heavy, magical sugar rush that grants a +10 ft. bonus to walking speed for 12 hours. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Star-Soaked_Nanner_Flambe.webp',
            craftedImage: 'assets/images/Star-Soaked_Nanner_Flambe.webp',
            category: ['food', 'epic', 'consumable']
        }
    },
    {
        id: 'lunar-egg-custard',
        name: 'Lunar Egg Custard',
        ingredients: ['lunar-egg', 'azure-cream', 'star-sugar'],
        resultAmount: 1,
        exoticIngredient: null,
        result: {
            name: 'Lunar Egg Custard',
            description: 'A wildly expensive, glowing blue pudding made entirely of high-tier celestial drops without needing a true exotic catalyst.',
            effects: 'Restores 2d8+3 HP (Maximum 19 HP if consumed during a short rest). Cures all non-magical diseases and poisons. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Lunar_Egg_Custard.webp',
            craftedImage: 'assets/images/Lunar_Egg_Custard.webp',
            category: ['food', 'legendary', 'consumable']
        }
    },
    {
        id: 'savour-herb-nanner-salad',
        name: 'Savour-Herb Nanner Salad',
        ingredients: ['lakale', 'greenseananners', 'coneseeds', 'savour-herb'],
        resultAmount: 1,
        exoticIngredient: null,
        result: {
            name: 'Savour-Herb Nanner Salad',
            description: 'A confusing but incredibly healthy mix of tough jungle fiber, sweet fruit, and savory herbs.',
            effects: 'Restores 1d8 HP (Maximum 8 HP if consumed during a short rest). Grants advantage on Constitution saving throws against ingested hazards for 8 hours. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Savour-Herb_Nanner_Salad.webp',
            craftedImage: 'assets/images/Savour-Herb_Nanner_Salad.webp',
            category: ['food', 'uncommon', 'consumable']
        }
    },
    {
        id: 'marbled-mocha',
        name: 'Marbled Mocha',
        ingredients: ['water', 'greensea-coffee-beans', 'marbled-marshmallows', 'chocolate-bar'],
        resultAmount: 1,
        exoticIngredient: null,
        result: {
            name: 'Marbled Mocha',
            description: 'A hot, sweet coffee drink where the blue-marbled mallows have melted into a thick, magical, buoyant foam atop a rich cosmic chocolate base.',
            effects: 'Restores 2d6 HP (Maximum 12 HP if consumed during a short rest). Removes one level of exhaustion and grants a +1 bonus to Strength and Dexterity checks for 3 hours. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Marbled_Mocha.webp',
            craftedImage: 'assets/images/Marbled_Mocha.webp',
            category: ['beverage', 'rare', 'consumable']
        }
    },
    {
        id: 'cosmic-caramel-crunch',
        name: 'Cosmic Caramel Crunch',
        ingredients: ['caramel', 'coneseeds', 'rock-salt'],
        resultAmount: 3,
        exoticIngredient: 'distillation-of-a-night-sky',
        result: {
            name: 'Cosmic Caramel Crunch',
            description: 'Sticky, salty, roasted seeds suspended in a hardened, black-and-silver starry caramel brittle.',
            effects: 'Restores 1d4 HP (Maximum 4 HP if consumed during a short rest). When chewed, the starry brittle pops loudly, granting the eater the ability to cast the Light cantrip at will for 1 hour. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Cosmic_Caramel_Crunch.webp',
            craftedImage: 'assets/images/Cosmic_Caramel_Crunch.webp',
            category: ['food', 'legendary', 'consumable']
        }
    },
    {
        id: 'eldritch-touch-cocoa',
        name: 'Eldritch Touch Cocoa',
        ingredients: ['water', 'eldritch-cacao', 'wildflower-honey-cream', 'white-sugar'],
        resultAmount: 1,
        exoticIngredient: 'touch-of-love',
        result: {
            name: 'Eldritch Touch Cocoa',
            description: 'The quintessential rainy-day drink infused with rare, mind-bending cacao and divine affection. Thick, warm, and overwhelmingly nostalgic.',
            effects: 'Restores 3d10 HP (Maximum 30 HP if consumed during a short rest). Removes the Frightened condition, fully restores a student\'s Maturity Meter, and grants 1d6 Temporary Hit Points. Overconsumption Penalty: Consuming more than one per short rest forces an immediate Potty Check.',
            image: 'assets/images/Eldritch_Touch_Cocoa.webp',
            craftedImage: 'assets/images/Eldritch_Touch_Cocoa.webp',
            category: ['beverage', 'epic', 'consumable']
        }
    },
    {
        id: 'soothing-lavender-compress',
        name: 'Soothing Lavender Compress',
        ingredients: ['refined-silk', 'cotton-fluff', 'simple-herb', 'water'],
        exoticIngredient: null,
        resultAmount: 1,
        result: {
            name: 'Soothing Lavender Compress',
            description: 'A lavender-infused cloth treated with refined silk and cotton fluff. Placed on a traveler, it heals exhaustion and promotes calming sleep.',
            effects: 'Removes 1 level of exhaustion and restores 15 HP. Clears active debuffs.',
            category: ['crafted', 'material', 'textile'],
            image: 'assets/images/soothing_lavender_compress.webp',
            craftedImage: 'assets/images/soothing_lavender_compress.webp'
        }
    }
];

// Update findMatchingRecipe to handle recipe validation better
function findMatchingRecipe(slotContents) {
    console.group('Recipe Matching');
    console.log('Checking slots:', slotContents);

    // Get all matching recipes instead of just the first one
    const matchingRecipes = recipes.filter(recipe => {
        if (recipe.validate) {
            return recipe.validate(slotContents);
        }

        // Standard ingredient matching (must match exact count)
        const slotArray = Object.values(slotContents).filter(slot => slot !== null);
        const requiredCount = recipe.ingredients.length + (recipe.exoticIngredient ? 1 : 0);
        if (slotArray.length !== requiredCount) {
            return false;
        }
        const hasAllIngredients = recipe.ingredients.every(
            ingId => slotArray.some(slot => slot.id === ingId)
        );
        const matchesExotic = recipe.exoticIngredient ?
            slotContents.e?.id === recipe.exoticIngredient :
            !slotContents.e;

        return hasAllIngredients && matchesExotic;
    });

    if (matchingRecipes.length > 0) {
        // Sort by complexity (more ingredients = higher priority)
        matchingRecipes.sort((a, b) => {
            const complexityA = a.ingredients.length + (a.exoticIngredient ? 1 : 0);
            const complexityB = b.ingredients.length + (b.exoticIngredient ? 1 : 0);
            return complexityB - complexityA;
        });

        console.log('Found recipe:', matchingRecipes[0].id);
        console.groupEnd();
        return matchingRecipes[0];
    }

    console.log('No recipe found');
    console.groupEnd();
    return null;
}

// Fix recipe preview check
function isRecipeComplete(slots, recipe) {
    if (recipe.validate) {
        return recipe.validate(slots);
    }

    const slotArray = Object.values(slots).filter(slot => slot !== null);
    const hasAllIngredients = recipe.ingredients.every(
        ingId => slotArray.some(slot => slot.id === ingId)
    );
    const matchesExotic = recipe.exoticIngredient ?
        slots.e?.id === recipe.exoticIngredient :
        !slots.e;

    return hasAllIngredients && matchesExotic;
}

function displayResult(result) {
    // ...existing code...
    const img = document.createElement('img');
    // Use craftedImage for inventory slots if it exists
    img.src = slotContents ? (result.craftedImage || result.image) : result.image;
    // ...existing code...
}

// ...existing code...

function checkForDiscoveredRecipe() {
    console.group('Check for Recipe Preview');
    const recipe = findMatchingRecipe(slotContents);
    const resultChamber = document.getElementById('result-chamber');

    // Get or create preview box
    let previewBox = document.querySelector('.recipe-preview');
    if (!previewBox) {
        previewBox = document.createElement('div');
        previewBox.className = 'recipe-preview';
        resultChamber.parentNode.insertBefore(previewBox, resultChamber);
    }

    // Clear previous content
    resultChamber.innerHTML = '';
    previewBox.innerHTML = '';
    previewBox.style.display = 'none';

    if (recipe) {
        console.log('Found recipe:', recipe.id);
        console.log('Recipe is discovered:', !!discoveredRecipes[recipe.id]);

        // Show preview if recipe is valid and discovered
        if (discoveredRecipes[recipe.id] && isRecipeComplete(slotContents, recipe)) {
            previewBox.style.display = 'flex';

            const img = document.createElement('img');
            img.src = recipe.result.image;
            img.alt = recipe.result.name;
            previewBox.appendChild(img);

            // Add tooltip and visual feedback
            previewBox.title = `Click Craft to create: ${recipe.result.name}`;
            previewBox.style.opacity = '1';
            previewBox.style.cursor = 'pointer';
        }
    }

    console.groupEnd();
}

// ...existing code...
