document.addEventListener('DOMContentLoaded', function() {
    const DEBUG_ENABLED = new URLSearchParams(window.location.search).has('debug');

    // Make sure AlchemyBlaster is available before anything else
    if (typeof AlchemyBlaster === 'undefined') {
        console.error('AlchemyBlaster not found, creating interface');
        window.AlchemyBlaster = class {
            constructor() {
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.width = 640;
                this.canvas.height = 800;
            }
        };
    }

    // Initialize player inventory and storage first
    let playerInventory = {};
    let discoveredRecipes = {};
    let playerCraftedItems = {};
    let craftedInventory = {};

    // Helper functions for inventory management
    function initializeInventory() {
        try {
            const savedInventory = localStorage.getItem('playerInventory');
            if (savedInventory && savedInventory !== "undefined") {
                try {
                    playerInventory = JSON.parse(savedInventory);
                } catch (e) {
                    console.error("Error parsing player inventory:", e);
                    playerInventory = {};
                }
            } else {
                // Fresh load starter set (no dev loadout)
                // Only: cream, egg, sugar, vanilla, flour, salt
                playerInventory = {};

                const hasIngredientId = (id) =>
                    typeof ingredients !== 'undefined' && Array.isArray(ingredients)
                        ? ingredients.some(i => i && i.id === id)
                        : false;

                const sugarId = hasIngredientId('white-sugar') ? 'white-sugar' : 'sugar';
                const saltId = hasIngredientId('rock-salt') ? 'rock-salt' : 'salt';

                const starterIds = ['cream', 'egg', sugarId, 'vanilla', 'flour', saltId];
                starterIds.forEach(id => {
                    playerInventory[id] = 5;
                });
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
            }

            // Save migration: unify water IDs (legacy 'spring-water' -> 'water').
            try {
                const legacy = Number(playerInventory['spring-water'] || 0);
                if (legacy > 0) {
                    playerInventory['water'] = Number(playerInventory['water'] || 0) + legacy;
                    delete playerInventory['spring-water'];
                    localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                }
            } catch (e) {
                console.warn('Failed to migrate spring-water to water:', e);
            }

            // Save migration: unify Lissome Lemons ID (legacy 'lissome-lemons' -> 'lissomelemons').
            try {
                const legacy = Number(playerInventory['lissome-lemons'] || 0);
                if (legacy > 0) {
                    playerInventory['lissomelemons'] = Number(playerInventory['lissomelemons'] || 0) + legacy;
                    delete playerInventory['lissome-lemons'];
                    localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                }
            } catch (e) {
                console.warn('Failed to migrate lissome-lemons to lissomelemons:', e);
            }
            
            // Load other storage items with error handling
            try {
                const savedCraftedItems = localStorage.getItem('craftedInventory');
                if (savedCraftedItems && savedCraftedItems !== "undefined") {
                    craftedInventory = JSON.parse(savedCraftedItems);
                }
            } catch (e) {
                console.error("Error loading crafted inventory:", e);
                craftedInventory = {};
            }
            
            try {
                const savedRecipes = localStorage.getItem('discoveredRecipes');
                if (savedRecipes && savedRecipes !== "undefined") {
                    discoveredRecipes = JSON.parse(savedRecipes);
                }
            } catch (e) {
                console.error("Error loading discovered recipes:", e);
                discoveredRecipes = {};
            }
            
            try {
                const savedPlayerCrafted = localStorage.getItem('playerCraftedItems');
                if (savedPlayerCrafted && savedPlayerCrafted !== "undefined") {
                    playerCraftedItems = JSON.parse(savedPlayerCrafted);
                }
            } catch (e) {
                console.error("Error loading player crafted items:", e);
                playerCraftedItems = {};
            }

            // Historically, some builds mirrored crafted items into BOTH playerInventory and craftedInventory.
            // That causes double-counting in the Crafted Items drawer (e.g. 6 showing as 12).
            // Consolidate to a single source of truth: playerInventory.
            try {
                if (craftedInventory && typeof craftedInventory === 'object') {
                    Object.entries(craftedInventory).forEach(([id, amt]) => {
                        const a = Number(playerInventory && playerInventory[id] ? playerInventory[id] : 0);
                        const b = Number(amt || 0);
                        const merged = Math.max(0, Math.floor(Math.max(a, b)));
                        if (merged > 0) {
                            playerInventory[id] = merged;
                            // Keep playerCraftedItems in sync as an availability counter.
                            if (playerCraftedItems && typeof playerCraftedItems === 'object') {
                                const have = Number(playerCraftedItems[id] || 0);
                                playerCraftedItems[id] = Math.max(Math.floor(have), merged);
                            }
                        }
                    });
                }

                // Clear out craftedInventory so we don't double count anymore.
                craftedInventory = {};
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                localStorage.setItem('craftedInventory', JSON.stringify(craftedInventory));
                localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));
            } catch (e) {
                console.warn('Failed to consolidate crafted inventory:', e);
            }
        } catch (e) {
            console.error("Error in initializeInventory:", e);
            playerInventory = {};
            craftedInventory = {};
            discoveredRecipes = {};
            playerCraftedItems = {};
        }
        
        // Debug menu is intentionally disabled for normal users.
        // Enable with ?debug=1 in the URL.
        if (DEBUG_ENABLED) {
            initializeDebugMenu();
        }
    }

    function syncGlobalState() {
        // Keep a global view for debug/tools that inspect these.
        window.playerInventory = playerInventory;
        window.craftedInventory = craftedInventory;
        window.discoveredRecipes = discoveredRecipes;
        window.playerCraftedItems = playerCraftedItems;
    }

    function initializeDebugMenu() {
        const debugMenu = document.createElement('div');
        debugMenu.id = 'debug-menu';
        debugMenu.style.position = 'fixed';
        debugMenu.style.top = '10px';
        debugMenu.style.right = '10px';
        debugMenu.style.padding = '10px';
        debugMenu.style.background = '#333';
        debugMenu.style.border = '1px solid #666';
        debugMenu.style.borderRadius = '5px';
        debugMenu.style.zIndex = '9999';

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All Data';
        resetButton.onclick = function() {
            if (confirm('This will reset all progress. Are you sure?')) {
                localStorage.clear();
                playerInventory = {
                    'herb1': 5,
                    'crystal1': 3,
                    'metal1': 3,  // Fixed typo: was 'metal11'
                    'essence1': 2,
                    'legendary1': 1
                };
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                discoveredRecipes = {};
                localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipes));
                playerCraftedItems = {};
                localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));
                location.reload();
            }
        };
        debugMenu.appendChild(resetButton);

        const addIngredientsButton = document.createElement('button');
        addIngredientsButton.textContent = 'Add Ingredients';
        addIngredientsButton.style.marginLeft = '10px';
        addIngredientsButton.onclick = function() {
            ingredients.forEach(ing => {
                playerInventory[ing.id] = (playerInventory[ing.id] || 0) + 5;
            });
            localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
            loadIngredients(document.querySelector('.category-btn.active').dataset.category);
        };
        debugMenu.appendChild(addIngredientsButton);

        document.body.appendChild(debugMenu);
    }

    // Initialize variables
    let slotContents = {
        a: null,
        b: null,
        c: null,
        d: null,
        e: null
    };

    // Hidden debug unlock gesture: click EMPTY Slot E 5x, then click Craft.
    let debugUnlockClicksE = 0;
    let debugUnlockArmed = false;
    const DEBUG_UNLOCK_CLICKS_REQUIRED = 5;
    
    const brewButton = document.getElementById('brew-btn');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const slots = document.querySelectorAll('.ingredient-slot');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const compendiumButton = document.getElementById('compendium-btn');
    const compendiumModal = document.getElementById('compendium-modal');
    const resultModal = document.getElementById('result-modal');
    const compCategoryButtons = document.querySelectorAll('.comp-category-btn');
    const closeButtons = document.querySelectorAll('.close');
    const collectButton = document.getElementById('collect-btn');
    const recipeBookButton = document.getElementById('recipe-book-btn');
    const recipeBookModal = document.getElementById('recipe-book-modal');
    const logbookButton = document.getElementById('logbook-btn');
    const logbookModal = document.getElementById('logbook-modal');
    const logbookEntriesEl = document.getElementById('logbook-entries');
    const logbookSaveBtn = document.getElementById('logbook-save-btn');
    const logbookRefreshBtn = document.getElementById('logbook-refresh-btn');

    // Dev reset modal elements (hidden gesture)
    const devResetModal = document.getElementById('dev-reset-modal');
    const devResetConfirmBtn = document.getElementById('dev-reset-confirm');
    const devResetCancelBtn = document.getElementById('dev-reset-cancel');

    // Save / Load / Bundle buttons
    const exportSaveBtn = document.getElementById('export-save-btn');
    const importSaveBtn = document.getElementById('import-save-btn');
    const uploadBundleBtn = document.getElementById('upload-bundle-btn');

    // Inventory Tools dropdown
    const inventoryToolsBtn = document.getElementById('inventory-tools-btn');
    const inventoryToolsMenu = document.getElementById('inventory-tools-menu');
    const inventoryCopyPlainBtn = document.getElementById('inventory-copy-plain-btn');
    const inventoryExportMdBtn = document.getElementById('inventory-export-md-btn');

    // Use-crafted-item modal elements
    const useCraftedModal = document.getElementById('use-crafted-modal');
    const useCraftedImg = document.getElementById('use-crafted-image');
    const useCraftedName = document.getElementById('use-crafted-name');
    const useCraftedDesc = document.getElementById('use-crafted-description');
    const useCraftedEffects = document.getElementById('use-crafted-effects');
    const useCraftedAvail = document.getElementById('use-crafted-available');
    const useCraftedAmount = document.getElementById('use-crafted-amount');
    const useCraftedConfirm = document.getElementById('use-crafted-confirm');
    const useCraftedCancel = document.getElementById('use-crafted-cancel');

    // Inventory remove/consume modal elements
    const inventoryRemoveModal = document.getElementById('inventory-remove-modal');
    const inventoryRemoveName = document.getElementById('inventory-remove-name');
    const inventoryRemoveAvailable = document.getElementById('inventory-remove-available');
    const inventoryRemoveAmount = document.getElementById('inventory-remove-amount');
    const inventoryRemoveConfirm = document.getElementById('inventory-remove-confirm');
    const inventoryRemoveCancel = document.getElementById('inventory-remove-cancel');
    let inventoryRemoveTargetId = null;
    
    // Initialize sound elements - update paths
    const sounds = {
        liquidFlow: document.getElementById('liquid-flow-sound'),
        success: document.getElementById('success-sound'),
        legendarySuccess: document.getElementById('legendary-success-sound'),
        fail: document.getElementById('fail-sound'),
        slot: document.getElementById('slot-sound'),
        slotRemove: document.getElementById('slot-remove-sound')
    };

    function stopLiquidFlowSound({ resetTime = true } = {}) {
        const sound = sounds.liquidFlow;
        if (!sound) return;
        sound.loop = false;
        sound.pause();
        if (resetTime) sound.currentTime = 0;
        // restore default volume for the next play
        sound.volume = 0.5;
    }

    function startLiquidFlowSound({ loop = true, volume = 0.5, restart = false } = {}) {
        const sound = sounds.liquidFlow;
        if (!sound) return;
        sound.loop = loop;
        sound.volume = volume;
        if (restart) sound.currentTime = 0;
        if (!sound.paused && loop) return;
        sound.play().catch(e => console.warn('Sound play failed (liquidFlow):', e));
    }
    
    // Helper function for safer sound playing
    function playSound(soundId, options = {}) {
        const sound = sounds[soundId];
        if (!sound) {
            console.warn(`Sound not found: ${soundId}`);
            return;
        }

        if (typeof options.loop === 'boolean') {
            sound.loop = options.loop;
        }
        
        sound.currentTime = 0;
        sound.volume = options.volume || 0.7;
        
        if (options.playbackRate) {
            sound.preservesPitch = false;
            sound.playbackRate = options.playbackRate;
        }
        
        return sound.play().catch(e => {
            console.warn(`Sound play failed (${soundId}):`, e);
        });
    }

    // Random header tagline on start
    const taglineEl = document.getElementById('tagline');
    if (taglineEl) {
        const taglines = [
            "Kiki Calls It 'Slappy Pots!'",
            'Dere Says, "Don\'t Drink EVERY Potion,"',
            'Liquid pain does, INDEED, cause pain upon consumption.',
            'CAUTION: Diapers On For Safety After This Point!!!'
        ];
        taglineEl.textContent = taglines[Math.floor(Math.random() * taglines.length)];
    }
    
    // Replace the existing playSlotSound function
    function playSlotSound(isRemoving = false) {
        if (isRemoving) {
            playSound('slotRemove', { volume: 0.5 });
        } else {
            playSound('slot', { volume: 0.7 });
        }
    }
    
    // Add collapse functionality for crafted items drawer
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const craftedItemsContainer = document.getElementById('crafted-items-container');
            if (craftedItemsContainer) {
                craftedItemsContainer.classList.toggle('collapsed');
            }
        });
    }

    function setDropdownOpen(dropdownEl, isOpen) {
        if (!dropdownEl) return;
        if (isOpen) dropdownEl.classList.add('is-open');
        else dropdownEl.classList.remove('is-open');
        const toggle = dropdownEl.querySelector('.dropdown-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function closestDropdown(el) {
        if (!el) return null;
        return el.closest ? el.closest('.dropdown') : null;
    }

    async function copyToClipboard(text) {
        try {
            if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {
            // fallback below
        }

        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return !!ok;
        } catch (_) {
            return false;
        }
    }

    function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 250);
    }

    function getInventoryNameForId(itemId) {
        try {
            const ing = (typeof getIngredientById === 'function') ? getIngredientById(itemId) : null;
            if (ing && ing.name) return ing.name;
        } catch (_) {
            // ignore
        }
        try {
            const recipe = (typeof recipes !== 'undefined' && Array.isArray(recipes))
                ? recipes.find(r => r && r.id === itemId)
                : null;
            if (recipe && recipe.result && recipe.result.name) return recipe.result.name;
        } catch (_) {
            // ignore
        }
        return itemId;
    }

    function buildInventoryLines({ format = 'plain' } = {}) {
        const inv = (playerInventory && typeof playerInventory === 'object') ? playerInventory : {};
        const entries = Object.entries(inv)
            .map(([id, qty]) => ({
                id,
                qty: Math.floor(Number(qty) || 0),
                name: getInventoryNameForId(id)
            }))
            .filter(x => x.id && x.qty > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        // plain
        return entries.map(e => `${e.name} x${e.qty} (${e.id})`);
    }

    function buildInventoryPlainText() {
        return buildInventoryLines({ format: 'plain' }).join('\n');
    }

    function buildInventoryMarkdown() {
        const inv = (playerInventory && typeof playerInventory === 'object') ? playerInventory : {};
        const entries = Object.entries(inv)
            .map(([id, qty]) => ({
                id,
                qty: Math.floor(Number(qty) || 0),
                name: getInventoryNameForId(id)
            }))
            .filter(x => x.id && x.qty > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        const escapeCell = (v) => String(v ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
        const header = `# Inventory\n\nExported: ${new Date().toLocaleString()}\n\n`;
        const tableHeader = '| Item | item-id | amount |\n|---|---|---|\n';

        if (!entries.length) {
            return header + tableHeader + '| _(empty)_ |  |  |\n';
        }

        const rows = entries
            .map(e => `| ${escapeCell(e.name)} | ${escapeCell(e.id)} | ${escapeCell(e.qty)} |`)
            .join('\n');
        return header + tableHeader + rows + '\n';
    }

    // Wire Inventory Tools dropdown
    if (inventoryToolsBtn) {
        const dropdown = closestDropdown(inventoryToolsBtn);
        inventoryToolsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = dropdown && dropdown.classList.contains('is-open');
            setDropdownOpen(dropdown, !isOpen);
        });
    }

    document.addEventListener('click', (evt) => {
        const t = evt.target;
        document.querySelectorAll('.dropdown.is-open').forEach(dd => {
            if (!dd.contains(t)) setDropdownOpen(dd, false);
        });
    });

    document.addEventListener('keydown', (evt) => {
        if (evt.key !== 'Escape') return;
        document.querySelectorAll('.dropdown.is-open').forEach(dd => setDropdownOpen(dd, false));
    });

    if (inventoryCopyPlainBtn) {
        inventoryCopyPlainBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const text = buildInventoryPlainText();
            const ok = await copyToClipboard(text);
            if (!ok) alert('Copy failed. Your browser may block clipboard access.');
            const dd = closestDropdown(inventoryCopyPlainBtn);
            setDropdownOpen(dd, false);
        });
    }

    if (inventoryExportMdBtn) {
        inventoryExportMdBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const md = buildInventoryMarkdown();
            const stamp = new Date().toISOString().slice(0, 10);
            downloadTextFile(`alchemy-inventory-${stamp}.md`, md, 'text/markdown;charset=utf-8');
            const dd = closestDropdown(inventoryExportMdBtn);
            setDropdownOpen(dd, false);
        });
    }

    // Initialize the player's inventory
    initializeInventory();
    syncGlobalState();

    // Compendium Peek state must be initialized BEFORE we render the compendium.
    // Otherwise loadCompendiumItems() can throw a TDZ ReferenceError when it reads this.
    let compendiumPeekActive = false;
    
    // Load ingredients into the drawer
    loadIngredients('all');
    
    // Load compendium items
    loadCompendiumItems('all');
    
    // Track if last recipe was successful
    let lastRecipeSuccess = false;

    // Tracks the most recent brewed recipe so Collect can be reliable.
    let pendingCraft = null;

    // Hidden Dev Reset: click empty slots in sequence E E A A B, then press Craft.
    const DEV_RESET_SEQUENCE = 'EEAAB';
    let devResetBuffer = '';
    let devResetArmed = false;

    // Hidden Compendium Peek: click slots in sequence A A B B C D, then press Craft.
    // Quick + dirty: reveals everything for this session only (resets on refresh).
    const COMPENDIUM_PEEK_SEQUENCE = 'AABBCD';
    let compendiumPeekBuffer = '';
    let compendiumPeekArmed = false;

    function armCompendiumPeekIfMatched() {
        if (compendiumPeekBuffer.length > COMPENDIUM_PEEK_SEQUENCE.length) {
            compendiumPeekBuffer = compendiumPeekBuffer.slice(-COMPENDIUM_PEEK_SEQUENCE.length);
        }
        compendiumPeekArmed = compendiumPeekBuffer === COMPENDIUM_PEEK_SEQUENCE;
    }

    function resetCompendiumPeekGesture() {
        compendiumPeekBuffer = '';
        compendiumPeekArmed = false;
    }

    function showToast(text, { durationMs = 2600 } = {}) {
        const id = 'alchemy-toast';
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.style.position = 'fixed';
            el.style.left = '50%';
            el.style.bottom = '24px';
            el.style.transform = 'translateX(-50%)';
            el.style.zIndex = '9999';
            el.style.padding = '10px 14px';
            el.style.borderRadius = '10px';
            el.style.background = 'rgba(20, 16, 28, 0.92)';
            el.style.border = '1px solid rgba(255,255,255,0.12)';
            el.style.color = '#fff';
            el.style.fontSize = '14px';
            el.style.maxWidth = '80vw';
            el.style.textAlign = 'center';
            el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
            el.style.opacity = '0';
            el.style.transition = 'opacity 120ms ease';
            document.body.appendChild(el);
        }

        el.textContent = String(text || '');
        clearTimeout(showToast._t);
        requestAnimationFrame(() => {
            el.style.opacity = '1';
        });
        showToast._t = setTimeout(() => {
            el.style.opacity = '0';
        }, Math.max(600, Number(durationMs) || 2600));
    }

    function performCompendiumPeek() {
        compendiumPeekActive = true;
        resetCompendiumPeekGesture();

        showToast('here ya go, take a peek!');

        if (window.Logbook && typeof window.Logbook.addEntry === 'function') {
            window.Logbook.addEntry({
                type: 'note',
                title: "Took a peek at the full compendium... (Don't worry, you're not in trouble! I am impressed you found this.)",
                data: { secret: 'compendium-peek' }
            });
        }

        // Refresh any open views.
        try {
            if (compendiumModal && compendiumModal.style.display === 'block') {
                const active = document.querySelector('.comp-category-btn.active');
                loadCompendiumItems(active ? active.dataset.category : 'all');
            }
        } catch (_) {}
        try {
            if (recipeBookModal && recipeBookModal.style.display === 'block') {
                loadRecipeBook();
            }
        } catch (_) {}
    }

    function armDevResetIfMatched() {
        if (devResetBuffer.length > DEV_RESET_SEQUENCE.length) {
            devResetBuffer = devResetBuffer.slice(-DEV_RESET_SEQUENCE.length);
        }
        devResetArmed = devResetBuffer === DEV_RESET_SEQUENCE;
    }

    function resetDevResetGesture() {
        devResetBuffer = '';
        devResetArmed = false;
    }

    function performDevReset() {
        // Core crafting/save keys
        const keysToClear = [
            'playerInventory',
            'craftedInventory',
            'playerCraftedItems',
            'discoveredRecipes',
            'alchemyLogbookEntries',
            'recipeFirstProducedAt'
        ];

        keysToClear.forEach(k => {
            try { localStorage.removeItem(k); } catch (_) {}
        });

        resetDevResetGesture();
        location.reload();
    }

    function openDevResetModal() {
        if (!devResetModal) return;
        devResetModal.style.display = 'block';
    }

    function closeDevResetModal() {
        if (!devResetModal) return;
        devResetModal.style.display = 'none';
        resetDevResetGesture();
    }

    if (devResetConfirmBtn) {
        devResetConfirmBtn.addEventListener('click', function() {
            performDevReset();
        });
    }
    if (devResetCancelBtn) {
        devResetCancelBtn.addEventListener('click', function() {
            closeDevResetModal();
        });
    }
    if (devResetModal) {
        const closeBtn = devResetModal.querySelector('.close');
        if (closeBtn) closeBtn.addEventListener('click', closeDevResetModal);
        window.addEventListener('click', function(event) {
            if (event.target === devResetModal) closeDevResetModal();
        });
    }
    
    // Event Listeners
    brewButton.addEventListener('click', brewPotion);

    function safeParseJson(text, fallback) {
        try {
            const parsed = JSON.parse(text);
            return parsed ?? fallback;
        } catch {
            return fallback;
        }
    }

    function downloadJson(filename, obj) {
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function readJsonFileFromPicker({ accept = 'application/json' } = {}) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.style.display = 'none';
            document.body.appendChild(input);

            input.addEventListener('change', async () => {
                const file = input.files && input.files[0];
                input.remove();
                if (!file) return resolve(null);
                try {
                    const text = await file.text();
                    resolve(text);
                } catch (e) {
                    reject(e);
                }
            }, { once: true });

            input.click();
        });
    }

    function buildSavePayload() {
        // Logbook internals (detailed)
        const logEntries = (window.Logbook && typeof window.Logbook.getEntries === 'function')
            ? window.Logbook.getEntries()
            : safeParseJson(localStorage.getItem('alchemyLogbookEntries') || '[]', []);
        const recipeFirstProducedAt = safeParseJson(localStorage.getItem('recipeFirstProducedAt') || '{}', {});

        // Core save
        const payload = {
            type: 'crafting-tools-save',
            version: 1,
            createdAt: new Date().toISOString(),
            data: {
                playerInventory: playerInventory || {},
                craftedInventory: craftedInventory || {},
                playerCraftedItems: playerCraftedItems || {},
                discoveredRecipes: discoveredRecipes || {}
            },
            logbook: {
                entries: Array.isArray(logEntries) ? logEntries : [],
                recipeFirstProducedAt: recipeFirstProducedAt || {}
            }
        };

        return payload;
    }

    function applySavePayload(payload) {
        if (!payload || payload.type !== 'crafting-tools-save') {
            throw new Error('Not a crafting-tools-save JSON');
        }

        const data = payload.data || {};
        const nextInv = data.playerInventory && typeof data.playerInventory === 'object' ? data.playerInventory : {};
        const nextCrafted = data.craftedInventory && typeof data.craftedInventory === 'object' ? data.craftedInventory : {};
        const nextPlayerCrafted = data.playerCraftedItems && typeof data.playerCraftedItems === 'object' ? data.playerCraftedItems : {};
        const nextDiscovered = data.discoveredRecipes && typeof data.discoveredRecipes === 'object' ? data.discoveredRecipes : {};

        localStorage.setItem('playerInventory', JSON.stringify(nextInv));
        localStorage.setItem('craftedInventory', JSON.stringify(nextCrafted));
        localStorage.setItem('playerCraftedItems', JSON.stringify(nextPlayerCrafted));
        localStorage.setItem('discoveredRecipes', JSON.stringify(nextDiscovered));

        if (payload.logbook) {
            const entries = Array.isArray(payload.logbook.entries) ? payload.logbook.entries : [];
            const firstProduced = payload.logbook.recipeFirstProducedAt && typeof payload.logbook.recipeFirstProducedAt === 'object'
                ? payload.logbook.recipeFirstProducedAt
                : {};
            localStorage.setItem('alchemyLogbookEntries', JSON.stringify(entries));
            localStorage.setItem('recipeFirstProducedAt', JSON.stringify(firstProduced));
        }

        // Hard refresh ensures every subsystem reads the new storage state.
        location.reload();
    }

    function applyBundlePayload(payload) {
        if (!payload || payload.type !== 'crafting-tools-bundle' || !Array.isArray(payload.items)) {
            throw new Error('Not a crafting-tools-bundle JSON');
        }

        const recipesList = (typeof recipes !== 'undefined' && Array.isArray(recipes))
            ? recipes
            : (Array.isArray(window.recipes) ? window.recipes : []);

        const recipeIdSet = new Set((Array.isArray(recipesList) ? recipesList : []).map(r => r && r.id).filter(Boolean));
        const granted = [];

        payload.items.forEach(it => {
            if (!it || !it.id) return;
            const id = String(it.id);
            const amount = Math.floor(Number(it.amount));
            if (!Number.isFinite(amount) || amount <= 0) return;

            // Always grant into playerInventory so the player "has" the item.
            playerInventory[id] = (playerInventory[id] || 0) + amount;

            // If it's a crafted item (recipe id), track for the "crafted count" label.
            // Availability itself is stored in playerInventory.
            if (recipeIdSet.has(id)) {
                playerCraftedItems[id] = (playerCraftedItems[id] || 0) + amount;
            }

            granted.push({ id, amount });
        });

        localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
        // craftedInventory is legacy; keep empty to avoid double-counting.
        craftedInventory = {};
        localStorage.setItem('craftedInventory', JSON.stringify(craftedInventory));
        localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));

        try {
            if (window.Logbook && typeof window.Logbook.addEntry === 'function' && granted.length) {
                window.Logbook.addEntry({
                    type: 'bundle',
                    title: `Bundle applied · ${granted.length} item(s)`,
                    data: { items: granted, bundleCreatedAt: payload.createdAt || null }
                });
            }
        } catch (e) {
            console.warn('Failed to log bundle application', e);
        }

        // Refresh UI
        updateCraftedItemsDisplay();
        const activeCategory = document.querySelector('.category-btn.active')?.dataset?.category || 'all';
        loadIngredients(activeCategory);
        checkBrewButton();
    }

    async function exportSaveToJson() {
        const payload = buildSavePayload();
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadJson(`crafting-tools-save-${stamp}.json`, payload);
    }

    async function loadSaveFromJson() {
        const text = await readJsonFileFromPicker();
        if (!text) return;
        const parsed = safeParseJson(text, null);
        if (!parsed) {
            alert('Invalid JSON file.');
            return;
        }
        if (!confirm('Load this save file? This will overwrite your current save + logbook.')) return;
        applySavePayload(parsed);
    }

    async function uploadBundleFromJson() {
        const text = await readJsonFileFromPicker();
        if (!text) return;
        const parsed = safeParseJson(text, null);
        if (!parsed) {
            alert('Invalid JSON file.');
            return;
        }
        if (!confirm('Apply this bundle to your current save?')) return;
        try {
            applyBundlePayload(parsed);
        } catch (e) {
            alert(`Failed to apply bundle: ${e && e.message ? e.message : e}`);
        }
    }

    if (exportSaveBtn) exportSaveBtn.addEventListener('click', exportSaveToJson);
    if (importSaveBtn) importSaveBtn.addEventListener('click', loadSaveFromJson);
    if (uploadBundleBtn) uploadBundleBtn.addEventListener('click', uploadBundleFromJson);
    
    // Update category buttons to match the ingredient categories
    const categories = [
        { id: 'all', label: 'All' },
        { id: 'botanical', label: 'Botanicals' },
        { id: 'crystal', label: 'Crystals' },
        { id: 'metal', label: 'Metals' },
        { id: 'essence', label: 'Essences' },
        { id: 'food', label: 'Food' },
        { id: 'legendary', label: 'Legendary' }
    ];
    
    // Set up category filter buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadIngredients(this.dataset.category);
        });
    });
    
    // Also update compendium category buttons
    const compCategoryButtonContainer = document.querySelector('.comp-category-buttons');
    if (compCategoryButtonContainer) {
        compCategoryButtonContainer.innerHTML = ''; // Clear existing buttons
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'comp-category-btn';
            button.dataset.category = category.id;
            button.textContent = category.label;
            
            if (category.id === 'all') {
                button.classList.add('active');
            }
            
            button.addEventListener('click', function() {
                document.querySelectorAll('.comp-category-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                loadCompendiumItems(this.dataset.category);
            });
            
            compCategoryButtonContainer.appendChild(button);
        });
    }
    
    // Compendium category filter buttons
    compCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            compCategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadCompendiumItems(this.dataset.category);
        });
    });
    
    // Open compendium modal
    compendiumButton.addEventListener('click', function() {
        compendiumModal.style.display = 'block';
    });
    
    // Close modals when clicking the X
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            compendiumModal.style.display = 'none';
            resultModal.style.display = 'none';
            recipeBookModal.style.display = 'none';
            if (logbookModal) logbookModal.style.display = 'none';

            // If the result modal was closed via X, ensure the craft circle clears too.
            if (resultModal && resultModal.style.display === 'none') {
                clearResultChamberOnly();
            }
        });
    });
    
    // Close modals when clicking outside of them
    window.addEventListener('click', function(event) {
        if (event.target === compendiumModal) {
            compendiumModal.style.display = 'none';
        }
        if (event.target === resultModal) {
            resultModal.style.display = 'none';
            clearResultChamberOnly();
        }
        if (event.target === recipeBookModal) {
            recipeBookModal.style.display = 'none';
        }
        if (logbookModal && event.target === logbookModal) {
            logbookModal.style.display = 'none';
        }
    });

    function clearResultChamberOnly() {
        const resultChamber = document.getElementById('result-chamber');
        if (resultChamber) {
            resultChamber.innerHTML = '';
            resultChamber.classList.remove('glow');
            resultChamber.classList.remove('discovered');
            resultChamber.title = '';
            resultChamber.style.backgroundColor = '';
            resultChamber.style.boxShadow = '';
        }

        const resultImg = document.getElementById('result-image');
        if (resultImg) {
            resultImg.onerror = null;
            resultImg.src = '';
        }

        const countElement = document.getElementById('crafted-count');
        if (countElement) {
            countElement.textContent = '';
            countElement.style.display = 'none';
        }
    }

    function renderLogbook() {
        if (!logbookEntriesEl) return;
        if (!window.Logbook) {
            logbookEntriesEl.innerHTML = '<div style="opacity:0.85;">Logbook module not loaded.</div>';
            return;
        }

        const entries = window.Logbook.getEntries();
        if (!entries || entries.length === 0) {
            logbookEntriesEl.innerHTML = '<div style="opacity:0.85;">No log entries yet.</div>';
            return;
        }

        const rows = entries.map(e => {
            const when = window.Logbook.formatLocal(e.ts);
            const title = e.title ? String(e.title) : '';
            const type = e.type ? String(e.type) : 'note';
            let details = '';

            if (e.data && e.type === 'expedition' && Array.isArray(e.data.rewards)) {
                const rewardText = e.data.rewards
                    .map(r => `${r.id}${r.amount > 1 ? ` x${r.amount}` : ''}`)
                    .join(', ');
                details = rewardText ? `<div class="logbook-details">${rewardText}</div>` : '';
            }

            return `
                <div class="logbook-entry">
                    <div class="logbook-meta">
                        <div class="logbook-when">${when}</div>
                        <div class="logbook-type">${type}</div>
                    </div>
                    <div class="logbook-body">
                        <div class="logbook-title">${title}</div>
                        ${details}
                    </div>
                </div>
            `;
        }).join('');

        logbookEntriesEl.innerHTML = rows;
    }

    if (logbookButton && logbookModal && logbookModal.dataset.logbookWired !== '1') {
        logbookButton.addEventListener('click', function () {
            logbookModal.style.display = 'block';
            renderLogbook();
        });
    }

    if (logbookRefreshBtn) {
        logbookRefreshBtn.addEventListener('click', renderLogbook);
    }

    if (logbookSaveBtn) {
        logbookSaveBtn.addEventListener('click', function () {
            if (!window.Logbook) return;
            const entries = window.Logbook.getEntries();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `logbook_${timestamp}.json`;
            const dataStr = JSON.stringify(entries, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        });
    }
    
    // Collect button in result modal
    collectButton.addEventListener('click', function() {
        const resultName = document.getElementById('result-name')?.textContent || '';
        const modalRecipeId = resultModal && resultModal.dataset ? (resultModal.dataset.recipeId || '') : '';
        const amountToCollect = Math.max(1, parseInt(resultModal?.dataset?.collectAmount || '1', 10) || 1);
        
        try {
            // Prefer recipeId stored on the modal (name-based lookups are fragile)
            const recipe = modalRecipeId
                ? recipes.find(r => r && r.id === modalRecipeId)
                : recipes.find(r => r && r.result && r.result.name === resultName);
            if (recipe) {
                // Allow alternate recipes to output an existing item ID.
                // Example: multiple recipes can produce 'white-sugar' without duplicating IDs.
                const outputId = (recipe.outputId && typeof recipe.outputId === 'string') ? recipe.outputId : recipe.id;

                // Add to player inventory
                playerInventory[outputId] = (playerInventory[outputId] || 0) + amountToCollect;

                // Track availability for the Crafted Items drawer.
                // (playerInventory is the single source of truth; craftedInventory is legacy and kept empty.)
                playerCraftedItems[outputId] = (playerCraftedItems[outputId] || 0) + amountToCollect;

                // Log first time this recipe was produced (or backfill if the log was cleared).
                if (window.Logbook && typeof window.Logbook.markRecipeFirstProduced === 'function') {
                    window.Logbook.markRecipeFirstProduced({
                        recipeId: recipe.id,
                        recipeName: recipe.result && recipe.result.name ? recipe.result.name : recipe.id
                    });
                }

                // Log every craft (not just first-time)
                if (window.Logbook && typeof window.Logbook.addEntry === 'function') {
                    let usedIngredientIds = null;
                    try {
                        const raw = resultModal?.dataset?.usedIngredients || '[]';
                        const parsed = JSON.parse(raw);
                        usedIngredientIds = Array.isArray(parsed) ? parsed : null;
                    } catch {
                        usedIngredientIds = null;
                    }

                    window.Logbook.addEntry({
                        type: 'craft',
                        title: `Crafted: ${recipe.result && recipe.result.name ? recipe.result.name : recipe.id}${amountToCollect > 1 ? ` x${amountToCollect}` : ''}`,
                        data: {
                            recipeId: recipe.id,
                            recipeName: recipe.result && recipe.result.name ? recipe.result.name : recipe.id,
                            amount: amountToCollect,
                            usedIngredientIds
                        }
                    });
                }
                
                // Save all inventory changes
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                localStorage.setItem('craftedInventory', JSON.stringify({}));
                localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));
                
                console.log(`Added ${recipe.result.name} (${outputId}) x${amountToCollect} to inventory and crafted items`);
                
                // Update the crafted items display
                updateCraftedItemsDisplay();
            } else {
                console.error('Recipe not found for result:', resultName);
            }
            
            // Update inventory display
            const activeCategory = document.querySelector('.category-btn.active').dataset.category;
            loadIngredients(activeCategory);
            
            // Close modal and reset station
            resultModal.style.display = 'none';
            resetAlchemyStation();
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save changes. Please check console for details.');
        }
    });

    function updateCraftedItems() {
        const container = document.getElementById('crafted-items-container');
        container.innerHTML = '';
        
        Object.entries(craftedInventory).forEach(([itemName, count]) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'crafted-item';
            
            const recipe = recipes.find(r => r.result.name === itemName);
            if (recipe) {
                const img = document.createElement('img');
                img.src = recipe.result.image;
                img.alt = itemName;
                img.title = itemName;
                itemElement.appendChild(img);
                
                const countBadge = document.createElement('span');
                countBadge.className = 'crafted-count';
                countBadge.textContent = count;
                itemElement.appendChild(countBadge);
            }
            
            container.appendChild(itemElement);
        });
    }

    function displayCraftedItems() {
        const craftedContainer = document.getElementById('crafted-items-container');
        craftedContainer.innerHTML = '';
        
        console.log("Displaying crafted items:", craftedItems);
        
        Object.keys(craftedItems).forEach(itemId => {
            const count = craftedItems[itemId];
            if (count > 0) {
                const recipe = recipes.find(r => r.id === itemId);
                if (recipe && recipe.result) {
                    const itemBox = document.createElement('div');
                    itemBox.className = 'item-box crafted-item';
                    itemBox.dataset.id = itemId;
                    
                    // Log the recipe we're trying to display
                    console.log(`Creating crafted item display for: ${recipe.id}`, recipe.result);
                    
                    const img = document.createElement('img');
                    // Ensure image path includes assets/images/ prefix
                    let imagePath = recipe.result.image;
                    if (!imagePath.includes('assets/images/') && !imagePath.includes(':\\')) {
                        imagePath = 'assets/images/' + imagePath;
                    }
                    img.src = imagePath;
                    img.alt = recipe.result.name;
                    
                    // Add error handling for image loading
                    img.onerror = function() {
                        console.error(`Failed to load image for ${recipe.id}: ${imagePath}`);
                        // Try alternate image path if available
                        if (recipe.result.craftedImage) {
                            const altImagePath = recipe.result.craftedImage;
                            console.log(`Trying alternate image path: ${altImagePath}`);
                            img.src = altImagePath;
                        } else {
                            // Use a placeholder
                            img.src = 'assets/images/placeholder.webp';
                        }
                    };
                    
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = recipe.result.name;
                    
                    const countSpan = document.createElement('span');
                    countSpan.className = 'count-badge';
                    countSpan.textContent = count;
                    
                    itemBox.appendChild(img);
                    itemBox.appendChild(nameSpan);
                    itemBox.appendChild(countSpan);
                    
                    // Add event listener for item details
                    itemBox.addEventListener('click', function() {
                        showCraftedItemDetails(recipe.result);
                    });
                    
                    craftedContainer.appendChild(itemBox);
                    
                    console.log(`Displayed crafted item: ${recipe.result.name}, image: ${img.src}`);
                } else {
                    console.warn(`No recipe found for crafted item: ${itemId}`);
                }
            }
        });
    }

    // Initialize crafted items display
    updateCraftedItemsDisplay();
    
    // Event Listeners for Recipe Book
    recipeBookButton.addEventListener('click', function() {
        loadRecipeBook();
        recipeBookModal.style.display = 'block';
    });
    
    // Close Recipe Book modal when clicking X
    const recipeBookClose = recipeBookModal.querySelector('.close');
    recipeBookClose.addEventListener('click', function() {
        recipeBookModal.style.display = 'none';
    });
    
    // Make slots accept dragged ingredients and handle right-click removal
    slots.forEach(slot => {
        slot.addEventListener('dragover', allowDrop);
        slot.addEventListener('drop', drop);
        slot.addEventListener('dragenter', dragEnter);
        slot.addEventListener('dragleave', dragLeave);

        // Hidden debug unlock click tracking (Slot E only, and only when empty)
        slot.addEventListener('click', function() {
            const position = this.dataset.position;
            const hasInState = !!slotContents[position];
            const hasInDom = this.querySelector('img') || this.children.length > 0 || this.innerHTML.trim() !== '';
            const isEmpty = !hasInState && !hasInDom;

            // Dev reset gesture only tracks empty-slot clicks.
            if (isEmpty) {
                devResetBuffer += String(position).toUpperCase();
                armDevResetIfMatched();

                // Compendium peek gesture also tracks empty-slot clicks.
                compendiumPeekBuffer += String(position).toUpperCase();
                armCompendiumPeekIfMatched();
            } else {
                resetDevResetGesture();
                resetCompendiumPeekGesture();
            }

            if (position !== 'e') return;
            if (!isEmpty) {
                debugUnlockClicksE = 0;
                debugUnlockArmed = false;
                return;
            }

            debugUnlockClicksE += 1;
            if (debugUnlockClicksE >= DEBUG_UNLOCK_CLICKS_REQUIRED) {
                debugUnlockArmed = true;
            }
        });
        
        // Add right-click handler for removal
        slot.addEventListener('contextmenu', function(e) {
            e.preventDefault(); // Prevent context menu
            const position = this.dataset.position;
            
            // If there's an ingredient in this slot, remove it
            if (slotContents[position]) {
                // Return the ingredient to inventory
                playerInventory[slotContents[position].id]++;
                
                // Play removal sound
                playSlotSound(true);
                
                // Clear the slot
                slotContents[position] = null;
                this.innerHTML = '';
                
                // Reload the ingredients drawer to update counts
                const activeCategory = document.querySelector('.category-btn.active').dataset.category;
                loadIngredients(activeCategory);
                
                // Update channels
                updateChannels();
                
                // Update brew button state
                checkBrewButton();
                
                // Check for discovered recipes
                checkForDiscoveredRecipe();
            }
        });
    });
    
    // Function to load ingredients into the drawer based on category
    function loadIngredients(category) {
        if (!ingredientsContainer) return;
        ingredientsContainer.innerHTML = '';
        
        const filteredIngredients = getIngredientsByCategory(category);

        if (!filteredIngredients || filteredIngredients.length === 0) {
            // Avoid throwing if ingredients.js is missing; keep UI usable.
            ingredientsContainer.innerHTML = '<div style="opacity:0.85; padding:8px;">No ingredients loaded.</div>';
            return;
        }
        
        // Add debug info to help locate issues
        console.log('Loading ingredients:', filteredIngredients);
        console.log('Player inventory:', playerInventory);
        
        filteredIngredients.forEach(ingredient => {
            if (playerInventory[ingredient.id] && playerInventory[ingredient.id] > 0) {
                const ingredientElement = document.createElement('div');
                ingredientElement.className = `ingredient-item ${ingredient.category}`;
                ingredientElement.dataset.id = ingredient.id;
                ingredientElement.draggable = true;
                
                // Use unicode character if image doesn't exist
                if (!ingredient.image) {
                    ingredientElement.textContent = getGreekLetter(ingredient.name);
                } else {
                    const img = document.createElement('img');
                    // Check for absolute vs relative path and add error handling
                    img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                    img.alt = ingredient.name;
                    img.onerror = function() {
                        console.error(`Failed to load image: ${img.src}`);
                        this.onerror = null;
                        this.src = ''; // Clear the src to prevent continuous error
                        ingredientElement.textContent = getGreekLetter(ingredient.name);
                    };
                    ingredientElement.appendChild(img);
                }
                
                // Restore the count badges to show inventory amounts
                const countBadge = document.createElement('span');
                countBadge.className = 'ingredient-count';
                countBadge.textContent = playerInventory[ingredient.id];
                ingredientElement.appendChild(countBadge);
                
                // Fix drag and drop events
                ingredientElement.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/plain', this.dataset.id);
                    this.classList.add('dragging');
                    // Ensure dragImage looks good
                    const dragImg = this.cloneNode(true);
                    dragImg.style.width = '60px';
                    dragImg.style.height = '60px';
                    document.body.appendChild(dragImg);
                    e.dataTransfer.setDragImage(dragImg, 30, 30);
                    setTimeout(() => {
                        document.body.removeChild(dragImg);
                    }, 0);
                });
                
                ingredientsContainer.appendChild(ingredientElement);
            }
        });
    }
    
    // Function to load items into the compendium
    function loadCompendiumItems(category) {
        const compendiumItems = document.querySelector('.compendium-items');
        if (!compendiumItems) return;
        compendiumItems.innerHTML = '';
        
        const filteredIngredients = getIngredientsByCategory(category);

        if (!filteredIngredients || filteredIngredients.length === 0) {
            compendiumItems.innerHTML = '<div style="opacity:0.85; padding:8px;">No compendium data loaded.</div>';
            return;
        }
        
        filteredIngredients.forEach(ingredient => {
            // Only show ingredients the player has discovered
            if (compendiumPeekActive || (playerInventory[ingredient.id] && playerInventory[ingredient.id] > 0)) {
                const itemElement = document.createElement('div');
                itemElement.className = 'compendium-item';
                
                // Use unicode character if image doesn't exist
                if (!ingredient.image) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'greek-placeholder';
                    placeholder.textContent = getGreekLetter(ingredient.name);
                    itemElement.appendChild(placeholder);
                } else {
                    const img = document.createElement('img');
                    img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                    img.alt = ingredient.name;
                    img.onerror = function() {
                        console.error(`Failed to load compendium image: ${img.src}`);
                        this.onerror = null;
                        this.src = '';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'greek-placeholder';
                        placeholder.textContent = getGreekLetter(ingredient.name);
                        itemElement.replaceChild(placeholder, this);
                    };
                    itemElement.appendChild(img);
                }
                
                const name = document.createElement('h4');
                name.textContent = ingredient.name;
                itemElement.appendChild(name);
                
                const description = document.createElement('p');
                description.textContent = ingredient.description;
                itemElement.appendChild(description);

                if (ingredient.effects) {
                    const effects = document.createElement('p');
                    const strong = document.createElement('strong');
                    strong.textContent = 'Effects:';
                    effects.appendChild(strong);
                    effects.appendChild(document.createTextNode(' ' + String(ingredient.effects)));
                    itemElement.appendChild(effects);
                }
                
                compendiumItems.appendChild(itemElement);
            }
        });
    }
    
    // Drag and drop functions
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.target.classList.add('dragging');
        
        // Log the drag operation to verify it's working
        console.log('Dragging ingredient with ID:', e.target.dataset.id);
        
        // Ensure dragImage looks good
        const dragImg = e.target.cloneNode(true);
        dragImg.style.width = '60px';
        dragImg.style.height = '60px';
        document.body.appendChild(dragImg);
        e.dataTransfer.setDragImage(dragImg, 30, 30);
        setTimeout(() => {
            document.body.removeChild(dragImg);
        }, 0);
    }
    
    function allowDrop(e) {
        e.preventDefault();
    }
    
    function dragEnter(e) {
        e.preventDefault();
        e.target.classList.add('can-drop');
    }
    
    function dragLeave(e) {
        e.target.classList.remove('can-drop');
    }
    
    function drop(e) {
        e.preventDefault();
        
        // Log the drop event
        console.log('Drop event triggered');
        
        // Get the slot element, accounting for nested elements
        const slot = e.target.closest('.ingredient-slot');
        if (!slot) {
            console.log('No valid slot found for drop');
            return;
        }
        
        slot.classList.remove('can-drop');
        const ingredientId = e.dataTransfer.getData('text/plain');
        console.log('Dropped ingredient ID:', ingredientId);
        
        // Find the dragging element if it exists
        const draggingElement = document.querySelector(`.ingredient-item[data-id="${ingredientId}"]`);
        if (draggingElement) {
            draggingElement.classList.remove('dragging');
        } else {
            console.warn('Could not find dragging element with ID:', ingredientId);
        }
        
        // Get the ingredient by ID
        const ingredient = getIngredientById(ingredientId);
        if (!ingredient) {
            console.error('Could not find ingredient with ID:', ingredientId);
            return;
        }
        
        // Get the position (a, b, c, d, e)
        const position = slot.dataset.position;
        
        // Check if this is the exotic slot (e) and if the ingredient is legendary
        if (position === 'e' && !ingredient.category.includes('legendary')) {
            alert('Only legendary ingredients can be placed in the exotic slot!');
            return;
        }
        
        // If there's already an ingredient in this slot, put it back in inventory
        if (slotContents[position]) {
            playerInventory[slotContents[position].id]++;
            playSlotSound(true);  // Play removal sound
        }
        
        // Decrease inventory count and play placement sound
        playerInventory[ingredientId]--;
        playSlotSound(false);  // Play placement sound
        
        // Update the slot with the new ingredient
        slotContents[position] = ingredient;
        
        // Update slot visually
        updateSlot(slot, ingredient);
        
        // Reload the ingredients drawer to update counts
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        loadIngredients(activeCategory);
        
        // Update channels
        updateChannels();
        
        // Enable/disable brew button
        checkBrewButton();
        
        // Check for discovered recipes
        checkForDiscoveredRecipe();
    }
    
    // Update the slot with an ingredient
    function updateSlot(slot, ingredient) {
        slot.innerHTML = '';
        
        if (ingredient) {
            if (!ingredient.image) {
                slot.textContent = getGreekLetter(ingredient.name);
                slot.style.color = ingredient.color || '#ffffff';
            } else {
                const img = document.createElement('img');
                img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                img.alt = ingredient.name;
                img.onerror = function() {
                    console.error(`Failed to load slot image: ${img.src}`);
                    this.onerror = null;
                    this.src = '';
                    slot.textContent = getGreekLetter(ingredient.name);
                    slot.style.color = ingredient.color || '#ffffff';
                };
                slot.appendChild(img);
            }
        }
    }
    
    // Update channels between ingredients
    function updateChannels() {
        // Remove channel-e-result from channels list
        updateChannel('channel-a-b', slotContents.a, slotContents.b);
        updateChannel('channel-b-c', slotContents.b, slotContents.c);
        updateChannel('channel-c-d', slotContents.c, slotContents.d);
        updateChannel('channel-d-e', slotContents.d, slotContents.e);

        // Keep liquid flow loop in sync with actual connectivity.
        // This avoids the sound getting stuck if channel fills fade out asynchronously.
        const hasAnyConnection = !!(
            (slotContents.a && slotContents.b) ||
            (slotContents.b && slotContents.c) ||
            (slotContents.c && slotContents.d) ||
            (slotContents.d && slotContents.e)
        );
        if (hasAnyConnection) {
            startLiquidFlowSound({ loop: true, volume: 0.5, restart: false });
        } else {
            stopLiquidFlowSound({ resetTime: true });
        }
        
        // Add exotic effects when slot E is filled
        const slotsContainer = document.querySelector('.slots-container');
        if (slotContents.e && slotContents.e.category.includes('legendary')) {
            slotsContainer.classList.add('exotic-active');
            document.querySelectorAll('.ingredient-slot, .result-chamber').forEach(el => {
                el.classList.add('exotic-sparkle');
            });
        } else {
            slotsContainer.classList.remove('exotic-active');
            document.querySelectorAll('.ingredient-slot, .result-chamber').forEach(el => {
                el.classList.remove('exotic-sparkle');
            });
        }
    }
    
    // Update a specific channel with gradient colors
    function updateChannel(channelId, startIngredient, endIngredient) {
        const channel = document.getElementById(channelId);
        if (!channel) return;

        const existingFill = channel.querySelector('div');
        const hasRequirements = startIngredient && endIngredient;

        // If no ingredients or missing connection, clear the channel
        if (!hasRequirements) {
            if (existingFill) {
                // Fade out animation
                existingFill.style.transition = 'opacity 0.3s';
                existingFill.style.opacity = '0';
                setTimeout(() => {
                    channel.innerHTML = '';
                }, 300);
            }
            return;
        }

        // If already filled and still has requirements, do nothing
        if (existingFill && existingFill.classList.contains('filled')) {
            return;
        }

        // Create new fill element
        const fillDiv = document.createElement('div');
        channel.innerHTML = '';
        channel.appendChild(fillDiv);

        // Force reflow
        fillDiv.offsetHeight;

        // Add animation class
        fillDiv.classList.add('animate');

        // After animation completes, add filled class
        fillDiv.addEventListener('animationend', () => {
            fillDiv.classList.remove('animate');
            fillDiv.classList.add('filled');
        });

        // Sound is managed centrally in updateChannels().
    }

    function getNextOpenSlotPositionForIngredient(ingredient) {
        if (!ingredient) return null;
        const positions = ['a', 'b', 'c', 'd', 'e'];
        for (const pos of positions) {
            if (slotContents[pos]) continue;
            if (pos === 'e' && !String(ingredient.category || '').includes('legendary')) continue;
            return pos;
        }
        return null;
    }

    function quickAddIngredientToNextOpenSlot(ingredientId) {
        const ingredient = getIngredientById(ingredientId);
        if (!ingredient) return false;

        if (!playerInventory[ingredientId] || playerInventory[ingredientId] <= 0) {
            return false;
        }

        const position = getNextOpenSlotPositionForIngredient(ingredient);
        if (!position) return false;

        const slotEl = document.querySelector(`#slot-${position}`);
        if (!slotEl) return false;

        playerInventory[ingredientId]--;
        playSlotSound(false);

        slotContents[position] = ingredient;
        updateSlot(slotEl, ingredient);

        const activeCategory = document.querySelector('.category-btn.active')?.dataset?.category || 'all';
        loadIngredients(activeCategory);
        updateChannels();
        checkBrewButton();
        checkForDiscoveredRecipe();

        return true;
    }
    
    // Helper function to convert color to hue rotation
    function getHueRotation(color) {
        // Extract RGB from hex
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            // Default values if color parsing fails
            r = 0;
            g = 150;
            b = 255;
        }
        
        // Convert RGB to HSL and return hue
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        
        if (max === min) {
            h = 0; // achromatic
        } else {
            const d = max - min;
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        
        // Map the hue to a rotation value (210 is the base hue of our animation)
        return (h - 210) % 360;
    }
    
    // Check if we can brew a potion and enable/disable button
    function checkBrewButton() {
        const brewBtn = document.getElementById('brew-btn');
        if (brewBtn) {
            // Logic for enabling/disabling the brew button
            const hasIngredients = Object.values(slotContents).some(slot => slot !== null);
            
            // Toggle button state based on whether there are ingredients
            if (hasIngredients) {
                brewBtn.classList.remove('disabled');
                brewBtn.src = "assets/images/button1a.webp"; // Active state with higher resolution
                brewBtn.style.cursor = "pointer";
            } else {
                brewBtn.classList.add('disabled');
                brewBtn.src = "assets/images/button.webp"; // Inactive state
                brewBtn.style.cursor = "not-allowed";
            }
        }
    }
    
    // Brew the potion when button is clicked (now called "Craft")
    function brewPotion() {
        // Secret debug unlock: click empty Slot E 5 times, then press Craft.
        // This consumes the Craft click and avoids triggering a failed brew alert.
        if (debugUnlockArmed && debugUnlockClicksE >= DEBUG_UNLOCK_CLICKS_REQUIRED) {
            debugUnlockArmed = false;
            debugUnlockClicksE = 0;

            try {
                window.dispatchEvent(new CustomEvent('craftingtools:debug-unlock'));
            } catch (_) {
                const evt = document.createEvent('Event');
                evt.initEvent('craftingtools:debug-unlock', true, true);
                window.dispatchEvent(evt);
            }
            return;
        }

        // Hidden Dev Reset: EEAAB then Craft (shows confirmation)
        if (devResetArmed) {
            openDevResetModal();
            return;
        }

        // Hidden Compendium Peek: AABBCD then Craft (no crafting side-effects)
        if (compendiumPeekArmed) {
            performCompendiumPeek();
            return;
        }

        console.group('Brewing Process');
        console.log('Current slot contents:', slotContents);
        
        // Try to find a matching recipe
        const recipe = findMatchingRecipe(slotContents);
        console.log('Found recipe:', recipe?.id);
        
        if (recipe) {
            console.log('Starting brewing animation for:', recipe.id);
            // Store success state for later
            lastRecipeSuccess = true;

            // Snapshot the actual ingredients used before we clear the station.
            const usedIngredientIds = Object.values(slotContents)
                .filter(v => v && v.id)
                .map(v => v.id);
            pendingCraft = {
                recipeId: recipe.id,
                recipeName: recipe.result && recipe.result.name ? recipe.result.name : recipe.id,
                usedIngredientIds
            };
            
            // Mark recipe as discovered immediately
            if (!discoveredRecipes[recipe.id]) {
                discoveredRecipes[recipe.id] = true;
                localStorage.setItem('discoveredRecipes', JSON.stringify(discoveredRecipes));
            }
            
            // Clear ingredients from slots immediately
            Object.keys(slotContents).forEach(slot => {
                if (slotContents[slot]) {
                    const slotElement = document.querySelector(`#slot-${slot}`);
                    if (slotElement) {
                        slotElement.innerHTML = '';
                    }
                }
            });
            
            // Reset slot contents
            slotContents = {
                a: null,
                b: null,
                c: null,
                d: null,
                e: null
            };
            
            // Animate the brewing process
            animateBrewingProcess().then(() => {
                // Show result after animation completes
                displayResult(recipe);
                
                // Play success sound only once here
                if (recipe.id === 'turbonado-sugar' || recipe.id === 'azure-ice-cream') {
                    playSound('legendarySuccess', { volume: 0.7 });
                } else {
                    playSound('success', { volume: 0.7 });
                }
                
                // Save inventory changes
                localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
                
                // Update ingredients drawer
                const activeCategory = document.querySelector('.category-btn.active').dataset.category;
                loadIngredients(activeCategory);
            });
        } else {
            // Handle failure...
            lastRecipeSuccess = false;
            animateFailedBrewing().then(() => {
                alert("Your concoction fizzles and bubbles, but produces nothing useful.");
                resetAlchemyStation();
            });
        }
        console.groupEnd();
    }
    
    // Animate the brewing process
    function animateBrewingProcess() {
        return new Promise(resolve => {
            // Play liquid flow sound
            startLiquidFlowSound({ loop: true, volume: 0.5, restart: true });
            
            // Disable brew button during animation
            brewButton.disabled = true;

            // Define all channels in order of animation
            const primaryChannels = ['channel-a-b', 'channel-b-c', 'channel-c-d'];
            const convergingChannel = 'channel-d-e';
            
            // Animate primary channels simultaneously
            primaryChannels.forEach(channelId => {
                const channel = document.getElementById(channelId);
                if (channel) {
                    const fill = document.createElement('div');
                    fill.className = 'channel-filled converging';
                    channel.appendChild(fill);
                }
            });

            // After primary channels, animate converging channel
            setTimeout(() => {
                const convergingChan = document.getElementById(convergingChannel);
                if (convergingChan) {
                    const fill = document.createElement('div');
                    fill.className = 'channel-filled center-flow';
                    convergingChan.appendChild(fill);
                }

                // Animate result chamber
                setTimeout(() => {
                    const resultChamber = document.getElementById('result-chamber');
                    resultChamber.classList.add('glow');
                    
                    // Complete animation
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }, 1000);
            }, 1500);

            // Fade out sound gradually
            const fadeInterval = setInterval(() => {
                if (sounds.liquidFlow && sounds.liquidFlow.volume > 0.01) {
                    sounds.liquidFlow.volume = Math.max(0, sounds.liquidFlow.volume - 0.1);
                } else {
                    clearInterval(fadeInterval);
                    stopLiquidFlowSound({ resetTime: true });
                }
            }, 200);
        });
    }
    
    // Animate a failed brewing attempt
    function animateFailedBrewing() {
        return new Promise(resolve => {
            // Similar to brewing animation but with different colors to indicate failure
            const channels = [
                'channel-a-b',
                'channel-b-c',
                'channel-c-d',
                'channel-d-e',
                'channel-e-result'
            ];
            
            // Disable brew button during animation
            brewButton.disabled = true;
            
            // Animate each channel turning red in sequence
            let delay = 0;
            channels.forEach(channelId => {
                const channel = document.getElementById(channelId);
                const channelFill = channel.querySelector('.channel-filled');
                
                if (channelFill) {
                    setTimeout(() => {
                        channelFill.style.background = 'red';
                    }, delay);
                    delay += 300;
                }
            });
            
            // Animate the result chamber with a "poof" effect
            setTimeout(() => {
                const resultChamber = document.getElementById('result-chamber');
                resultChamber.style.backgroundColor = '#8d6e63';
                resultChamber.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
                
                // Play fail sound
                playSound('fail', { volume: 0.7 });
                
                // Reset after animation
                setTimeout(() => {
                    resultChamber.style.backgroundColor = '';
                    resultChamber.style.boxShadow = '';
                    resolve();
                }, 1000);
            }, delay);
        });
    }
    
    // Display the result of successful brewing
    function normalizeImagePath(path) {
        const rawInput = (path || '').toString();
        if (!rawInput) return '';

        const forward = rawInput.replaceAll('\\', '/');
        let raw = forward;
        while (raw.startsWith('./')) raw = raw.slice(2);
        if (raw.startsWith('/')) raw = raw.slice(1);

        // Portable build support: resolve known asset paths to embedded data URIs.
        // We attempt a few normalized keys to handle case differences and URL-encoding.
        const map = window.__PORTABLE_ASSET_URLS;
        if (map && typeof map === 'object') {
            const candidates = [];
            candidates.push(raw);
            candidates.push(raw.replaceAll('%20', ' '));
            candidates.push(raw.toLowerCase());
            candidates.push(raw.replaceAll('%20', ' ').toLowerCase());
            for (const k of candidates) {
                if (map[k]) return map[k];
            }
        }

        if (raw.startsWith('data:') || raw.includes(':\\') || raw.includes('://')) return raw;
        if (raw.includes('assets/images/')) return raw;
        return 'assets/images/' + raw;
    }

    function displayResult(recipeOrResult) {
        const recipe = (recipeOrResult && recipeOrResult.result) ? recipeOrResult : null;
        const result = recipe ? recipe.result : recipeOrResult;
        if (!result) return;

        const amountToCollect = recipe && Number.isFinite(Number(recipe.resultAmount))
            ? Math.max(1, Math.floor(Number(recipe.resultAmount)))
            : 1;

        const bestResultImage = result.craftedImage || result.image;

        // Set the result image in the chamber
        const resultChamber = document.getElementById('result-chamber');
        resultChamber.innerHTML = '';

        // Persist which recipe this modal represents (avoid name-based lookups)
        if (resultModal) {
            const recipeId = recipe && recipe.id ? recipe.id : '';
            if (recipeId) resultModal.dataset.recipeId = recipeId;
            resultModal.dataset.collectAmount = String(amountToCollect);
            try {
                const used = pendingCraft && pendingCraft.recipeId === recipeId ? pendingCraft.usedIngredientIds : [];
                resultModal.dataset.usedIngredients = JSON.stringify(Array.isArray(used) ? used : []);
            } catch {
                resultModal.dataset.usedIngredients = '[]';
            }
        }

        // Update Collect button label to reflect yield
        if (collectButton) {
            collectButton.textContent = amountToCollect > 1 ? `Collect x${amountToCollect}` : 'Collect';
        }
        
        const img = document.createElement('img');
        img.className = 'result-chamber-image';
        img.src = normalizeImagePath(bestResultImage);
        img.alt = result.name;
        img.onerror = function() {
            console.error(`Failed to load result image: ${img.src}`);
            this.onerror = null;
            this.src = '';
            resultChamber.textContent = '✨'; // Use a sparkle character as fallback
        };
        resultChamber.appendChild(img);
        
        // Fill in the result modal
        const resultImg = document.getElementById('result-image');
        resultImg.src = normalizeImagePath(bestResultImage);
        resultImg.onerror = function() {
            console.error(`Failed to load modal result image: ${resultImg.src}`);
            this.onerror = null;
            this.src = '';
        };
        
        document.getElementById('result-name').textContent = result.name;
        document.getElementById('result-description').textContent = result.description;
        document.getElementById('result-effects').textContent = result.effects;

        // Optional per-item name color (used by prank/giggly variants)
        const resultNameEl = document.getElementById('result-name');
        if (resultNameEl) {
            const cats = Array.isArray(result.category) ? result.category : [];
            const wantsPink = cats.includes('giggly');
            resultNameEl.style.color = (result.nameColor || (wantsPink ? '#ff69b4' : ''));
        }
        
        // Show crafted item count if we've made this before
        const countElement = document.getElementById('crafted-count');
        if (countElement) {
            const recipeId = recipe && recipe.id ? recipe.id : (Object.values(recipes).find(r => r && r.result && r.result.name === result.name)?.id || null);
            const count = recipeId && playerCraftedItems && playerCraftedItems[recipeId] ? playerCraftedItems[recipeId] : 0;
            countElement.textContent = `You have crafted this ${count} time${count !== 1 ? 's' : ''}.`;
            countElement.style.display = 'block';
        }
        
        // Show the result modal
        resultModal.style.display = 'block';
    }
    
    // Reset the alchemy station after brewing
    function resetAlchemyStation() {
        // Clear slot contents
        slotContents = {
            a: null,
            b: null,
            c: null,
            d: null,
            e: null
        };
        
        // Clear slot visuals
        slots.forEach(slot => {
            slot.innerHTML = '';
        });
        
        // Clear channels with fade animation
        const channels = document.querySelectorAll('.channel');
        channels.forEach(channel => {
            const fill = channel.querySelector('div');
            if (fill) {
                fill.style.transition = 'opacity 0.3s';
                fill.style.opacity = '0';
                setTimeout(() => {
                    channel.innerHTML = '';
                }, 300);
            }
        });
        
        // Clear result chamber
        clearResultChamberOnly();
        
        // Disable brew button
        brewButton.disabled = true;
        
        // Remove exotic effects
        document.querySelector('.slots-container').classList.remove('exotic-active');
        document.querySelectorAll('.ingredient-slot, .result-chamber').forEach(el => {
            el.classList.remove('exotic-sparkle');
        });
        
        // Stop any playing sounds
        stopLiquidFlowSound({ resetTime: true });
        
        // Reload ingredients drawer
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        loadIngredients(activeCategory);
    }
    
    // Helper function to get Greek letter for ingredients without images
    function getGreekLetter(name) {
        const greekLetters = {
            'a': 'α', 'b': 'β', 'c': 'γ', 'd': 'δ', 'e': 'ε',
            'f': 'ζ', 'g': 'η', 'h': 'θ', 'i': 'ι', 'j': 'κ',
            'k': 'λ', 'l': 'μ', 'm': 'ν', 'n': 'ξ', 'o': 'ο',
            'p': 'π', 'q': 'ρ', 'r': 'σ', 's': 'τ', 't': 'υ',
            'u': 'φ', 'v': 'χ', 'w': 'ψ', 'x': 'ω', 'y': 'ς',
            'z': 'ω'
        };
        
        // Get first letter of name and return corresponding Greek letter
        const firstChar = name.charAt(0).toLowerCase();
        return greekLetters[firstChar] || firstChar;
    }
    
    // Function to check if current slots match a known recipe
    function checkForDiscoveredRecipe() {
        const recipe = findMatchingRecipe(slotContents);
        const resultChamber = document.getElementById('result-chamber');
        resultChamber.innerHTML = ''; // Always clear result chamber

        // Remove preview box functionality - it creates ghost elements
        let previewBox = document.querySelector('.recipe-preview');
        if (previewBox) {
            previewBox.remove();
        }
    }
    
    // Helper function to check if recipe is complete
    function isRecipeComplete(slots, recipe) {
        // Check if all required ingredients are present
        const requiredCount = recipe.ingredients.length + (recipe.exoticIngredient ? 1 : 0);
        const currentCount = Object.values(slots).filter(slot => slot !== null).length;
        
        if (currentCount !== requiredCount) return false;
        
        // For recipes with specific slot requirements
        if (recipe.validate) {
            return recipe.validate(slots);
        }
        
        // For standard recipes
        const ingredientIds = [];
        for (const position of ['a', 'b', 'c', 'd']) {
            if (slots[position]) {
                ingredientIds.push(slots[position].id);
            }
        }
        
        const allIngredientsMatch = recipe.ingredients.every(ingId => 
            ingredientIds.includes(ingId)
        );
        
        const exoticMatches = 
            (recipe.exoticIngredient === null && !slots.e) || 
            (recipe.exoticIngredient && slots.e?.id === recipe.exoticIngredient);
        
        return allIngredientsMatch && exoticMatches;
    }
    
    // Function to load the recipe book
    function loadRecipeBook() {
        console.log('Loading recipe book...');
        const recipeBookItems = document.querySelector('.recipe-book-items');
        
        // Clear any existing content to prevent duplication
        if (recipeBookItems) {
            recipeBookItems.innerHTML = '';
        } else {
            console.error('Recipe book items container not found!');
            return;
        }
        
        const recipeList = getRecipesData();
        if (!recipeList.length) {
            recipeBookItems.innerHTML = '<div style="opacity:0.85; padding:8px;">No recipes loaded.</div>';
            return;
        }

        // Load discovered recipes from localStorage if they exist
        const savedRecipes = localStorage.getItem('discoveredRecipes');
        if (savedRecipes) {
            discoveredRecipes = JSON.parse(savedRecipes);
        }
        
        // Track how many recipes are added
        let recipesAdded = 0;
        
        recipeList.forEach(recipe => {
            // Only show recipes that have been discovered
            if (compendiumPeekActive || discoveredRecipes[recipe.id]) {
                recipesAdded++;
                const recipeElement = document.createElement('div');
                recipeElement.className = 'recipe-item';
                
                // Add recipe image in a container to control size
                const imageContainer = document.createElement('div');
                imageContainer.className = 'recipe-item-image';
                const img = document.createElement('img');
                img.src = recipe.result.image.includes(':\\') ? recipe.result.image : recipe.result.image;
                img.alt = recipe.result.name;
                img.onerror = function() {
                    this.onerror = null;
                    imageContainer.textContent = '✨';
                };
                imageContainer.appendChild(img);
                recipeElement.appendChild(imageContainer);
                
                // Add recipe name
                const name = document.createElement('h3');
                name.textContent = recipe.result.name;
                name.style.fontSize = '0.9rem';
                name.style.margin = '8px 0';
                try {
                    const cats = (recipe && recipe.result && Array.isArray(recipe.result.category)) ? recipe.result.category : [];
                    if (cats.includes('giggly')) {
                        name.style.color = '#ff69b4';
                    }
                } catch (_) {}
                recipeElement.appendChild(name);
                
                // Add recipe description - keep it very short
                const description = document.createElement('p');
                const shortDesc = recipe.result.description.length > 120 ? 
                    recipe.result.description.substring(0, 117) + '...' : 
                    recipe.result.description;
                description.textContent = shortDesc;
                description.title = recipe.result.description; // Full description on hover
                description.className = 'recipe-description';
                recipeElement.appendChild(description);
                
                // Add recipe effects - make this more compact
                const effects = document.createElement('p');
                const effectsStrong = document.createElement('strong');
                effectsStrong.textContent = 'Effects:';
                effects.appendChild(effectsStrong);
                effects.appendChild(document.createTextNode(' ' + String(recipe.result.effects || '')));
                effects.title = String(recipe.result.effects || ''); // Full effects on hover
                effects.className = 'recipe-effects';
                recipeElement.appendChild(effects);
                
                // Add ingredient list
                const instructionsContainer = document.createElement('div');
                instructionsContainer.className = 'recipe-instructions';
                instructionsContainer.style.marginTop = '5px';
                instructionsContainer.style.padding = '5px 0';
                
                const ingredientsTitle = document.createElement('p');
                ingredientsTitle.innerHTML = '<strong>Recipe:</strong>';
                ingredientsTitle.style.textAlign = 'center';
                ingredientsTitle.style.marginBottom = '4px';
                ingredientsTitle.style.fontSize = '0.8rem';
                instructionsContainer.appendChild(ingredientsTitle);
                
                const ingredientsContainer = document.createElement('div');
                ingredientsContainer.className = 'recipe-ingredients';
                ingredientsContainer.style.display = 'flex';
                ingredientsContainer.style.justifyContent = 'center';
                ingredientsContainer.style.gap = '5px';
                
                // Create recipe ingredient elements for all ingredients upfront
                const ingredientElements = [];
                
                // Add regular ingredients - remove size restrictions to show more text
                recipe.ingredients.forEach(ingredientId => {
                    const ingredient = getIngredientById(ingredientId);
                    if (ingredient) {
                        const ingredientElement = document.createElement('div');
                        ingredientElement.className = 'recipe-ingredient';
                        ingredientElement.title = ingredient.name;
                        ingredientElement.style.width = '45px';  // Increased from 25px
                        ingredientElement.style.height = '45px'; // Increased from 25px
                        ingredientElement.style.position = 'relative';
                        ingredientElement.style.display = 'flex';
                        ingredientElement.style.justifyContent = 'center';
                        ingredientElement.style.alignItems = 'center';
                        
                        const img = document.createElement('img');
                        img.src = ingredient.image.includes(':\\') ? ingredient.image : ingredient.image;
                        img.alt = ingredient.name;
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '100%';
                        img.style.objectFit = 'contain';
                        
                        img.onerror = function() {
                            this.onerror = null;
                            ingredientElement.textContent = getGreekLetter(ingredient.name);
                            ingredientElement.style.fontSize = '0.7rem';
                        };
                        ingredientElement.appendChild(img);
                        ingredientElements.push(ingredientElement);
                    }
                });
                
                // Add exotic ingredient if present - with special styling
                if (recipe.exoticIngredient) {
                    const exoticIngredient = getIngredientById(recipe.exoticIngredient);
                    if (exoticIngredient) {
                        const exoticElement = document.createElement('div');
                        exoticElement.className = 'recipe-ingredient legendary';
                        exoticElement.title = exoticIngredient.name + ' (Exotic)';
                        exoticElement.style.width = '35px';  // Increased from 25px
                        exoticElement.style.height = '35px'; // Increased from 25px
                        exoticElement.style.borderColor = '#b39ddb';
                        exoticElement.style.justifyContent = 'center';
                        exoticElement.style.alignItems = 'center';
                        
                        const img = document.createElement('img');
                        img.src = exoticIngredient.image.includes(':\\') ? exoticIngredient.image : exoticIngredient.image;
                        img.alt = exoticIngredient.name;
                        img.style.maxWidth = '100%';
                        img.style.maxHeight = '100%';
                        img.style.objectFit = 'contain';
                        
                        img.onerror = function() {
                            this.onerror = null;
                            exoticElement.textContent = getGreekLetter(exoticIngredient.name);
                            exoticElement.style.fontSize = '0.7rem';
                        };
                        exoticElement.appendChild(img);
                        ingredientElements.push(exoticElement);
                    }
                }
                
                // Now add all ingredient elements to the container
                ingredientElements.forEach(element => {
                    ingredientsContainer.appendChild(element);
                });
                
                instructionsContainer.appendChild(ingredientsContainer);
                recipeElement.appendChild(instructionsContainer);
                recipeBookItems.appendChild(recipeElement);
            }
        });
        
        console.log(`Added ${recipesAdded} recipes to the book`);
        
        // If no recipes have been discovered yet
        if (recipesAdded === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.gridColumn = '1 / -1';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '40px';
            emptyMessage.innerHTML = '<h3 style="color: var(--workspace-trim);">No Recipes Discovered Yet</h3>' +
                '<p>Craft successful recipes to fill your recipe book!</p>';
            recipeBookItems.appendChild(emptyMessage);
        }
    }
    
    // Initialize discovered recipes from localStorage
    // const savedRecipes = localStorage.getItem('discoveredRecipes');
    // if (savedRecipes) {
    //     discoveredRecipes = JSON.parse(savedRecipes);
    // }

    // Initialize player's crafted items from localStorage
    // let playerCraftedItems = {};
    // const savedCraftedItems = localStorage.getItem('playerCraftedItems');
    // if (savedCraftedItems) {
    //     playerCraftedItems = JSON.parse(savedCraftedItems);
    // }
    
    // Initialize player's inventory (add this if missing)
    // let playerInventory = {};

    // Function to initialize inventory (add this if missing)
    // function initializeInventory() {
    //     // Load from localStorage if it exists
    //     const savedInventory = localStorage.getItem('playerInventory');
    //     if (savedInventory) {
    //         playerInventory = JSON.parse(savedInventory);
    //     } else {
    //         // Initialize with some starter ingredients
    //         playerInventory = {
    //             'herb1': 5,
    //             'crystal1': 3,
    //             'metal1': 3,
    //             'essence1': 2,
    //             'legendary1': 1
    //         };
    //         // Save initial inventory
    //         localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
    //     }
    // }

    function getIngredientsData() {
        // IMPORTANT: Don't reference an undeclared global directly.
        // If ingredients.js fails to load for any reason, `ingredients` would be a ReferenceError.
        const fromGlobal = (typeof ingredients !== 'undefined') ? ingredients : undefined;
        const fromWindow = (window && Array.isArray(window.ingredients)) ? window.ingredients : undefined;
        return Array.isArray(fromGlobal) ? fromGlobal : (Array.isArray(fromWindow) ? fromWindow : []);
    }

    function getRecipesData() {
        const fromGlobal = (typeof recipes !== 'undefined') ? recipes : undefined;
        const fromWindow = (window && Array.isArray(window.recipes)) ? window.recipes : undefined;
        return Array.isArray(fromGlobal) ? fromGlobal : (Array.isArray(fromWindow) ? fromWindow : []);
    }

    // Helper function to get ingredients by category
    function getIngredientsByCategory(category) {
        const list = getIngredientsData();
        if (!list.length) {
            console.warn('Ingredients data not loaded (ingredients.js missing or empty).');
            return [];
        }

        if (category === 'all') return list;

        return list.filter(i => {
            const cat = i && i.category;
            if (Array.isArray(cat)) return cat.includes(category);
            if (typeof cat === 'string') return cat.includes(category);
            return false;
        });
    }

    // Helper function to get ingredient by ID
    function getIngredientById(id) {
        const ingredientList = getIngredientsData();
        const recipeList = getRecipesData();

        // Back-compat: treat old "spring-water" as the single canonical "water".
        const normalizedId = (id === 'spring-water') ? 'water' : id;

        // First check ingredients array
        const ingredient = ingredientList.find(ing => ing && ing.id === normalizedId);
        if (ingredient) return ingredient;

        // Then check recipe results (for crafted items)
        for (const recipe of recipeList) {
            if (recipe && recipe.result && (recipe.result.id === id || recipe.id === id)) {
                return recipe.result;
            }
        }

        return null;
    }

    // Function to find matching recipe - improved to handle similar recipes like herb butter vs typical butter
    function findMatchingRecipe(slots) {
        const recipeList = getRecipesData();
        if (!recipeList.length) {
            console.warn('Recipes data not loaded (recipes.js missing or empty).');
            return null;
        }
        
        // Get all filled slot IDs
        const slotIngredients = {};
        for (const [position, ingredient] of Object.entries(slots)) {
            if (ingredient) {
                slotIngredients[position] = ingredient.id;
            }
        }
        
        // Count ingredients of each type
        const ingredientCounts = {};
        Object.values(slotIngredients).forEach(id => {
            ingredientCounts[id] = (ingredientCounts[id] || 0) + 1;
        });
        
        console.log('Searching for recipe with ingredients:', slotIngredients);
        console.log('Ingredient counts:', ingredientCounts);
        
        // First check for recipes with specific slot requirements or exact validation
        for (const recipe of recipeList) {
            // If recipe has a custom validation function, use it first
            if (recipe.validate && recipe.validate(slots)) {
                console.log('Found recipe with custom validation:', recipe.id);
                return recipe;
            }
        }
        
        // Then look for recipes with exact ingredient match (including counts)
        const matchingRecipes = recipeList.filter(recipe => {
            // Skip recipes with custom validation as we already checked those
            if (recipe.validate) return false;
            
            // Check if all required ingredients are present
            const requiredCount = recipe.ingredients.length + (recipe.exoticIngredient ? 1 : 0);
            const filledSlots = Object.values(slots).filter(slot => slot !== null).length;
            
            if (filledSlots !== requiredCount) return false;
            
            // Count recipe ingredients
            const recipeIngredientCounts = {};
            recipe.ingredients.forEach(id => {
                recipeIngredientCounts[id] = (recipeIngredientCounts[id] || 0) + 1;
            });
            
            if (recipe.exoticIngredient) {
                recipeIngredientCounts[recipe.exoticIngredient] = 
                    (recipeIngredientCounts[recipe.exoticIngredient] || 0) + 1;
            }
            
            // Check if ingredient counts match exactly
            const allIngredientsMatch = Object.entries(recipeIngredientCounts).every(([id, count]) => 
                ingredientCounts[id] === count
            );
            
            const noExtraIngredients = Object.keys(ingredientCounts).every(id => 
                recipeIngredientCounts[id] !== undefined
            );
            
            return allIngredientsMatch && noExtraIngredients;
        });
        
        // If we found exactly one matching recipe, return it
        if (matchingRecipes.length === 1) {
            console.log('Found recipe with exact ingredient match:', matchingRecipes[0].id);
            return matchingRecipes[0];
        }
        
        // If we found multiple matching recipes, prioritize more specific ones
        // (assuming herb butter is more specific than typical butter)
        if (matchingRecipes.length > 1) {
            console.log('Found multiple matching recipes:', matchingRecipes.map(r => r.id));
            
            // First, check if herb butter is among the matches
            const herbButterRecipe = matchingRecipes.find(r => r.id.includes('herb') && r.id.includes('butter'));
            if (herbButterRecipe) {
                console.log('Prioritizing herb butter recipe');
                return herbButterRecipe;
            }
            
            // If no specific rules match, return the first recipe (but log a warning)
            console.warn('Multiple matching recipes found with no priority rule, using first match');
            return matchingRecipes[0];
        }
        
        // Finally, fall back to the original simpler matching logic
        return recipes.find(recipe => {
            // Skip recipes with validate function as we already checked those
            if (recipe.validate) return false;
            
            // Check if the exotic ingredient matches
            const exoticMatches = !recipe.exoticIngredient || 
                (slots.e && slots.e.id === recipe.exoticIngredient);
                
            if (!exoticMatches) return false;
            
            // Get all non-exotic ingredient IDs from filled slots
            const nonExoticIngredients = Object.entries(slots)
                .filter(([pos, ing]) => pos !== 'e' && ing !== null)
                .map(([pos, ing]) => ing.id);
            
            // Check if all recipe ingredients are in the slots
            return recipe.ingredients.every(id => nonExoticIngredients.includes(id));
        });
    }

    // Helper function to handle crafted items correctly
    function updateCraftedItemsDisplay() {
        const container = document.getElementById('crafted-items-container');
        if (!container) {
            console.error('Crafted items container not found!');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Debug log
        console.log('Updating crafted items display');
        console.log('Player inventory:', playerInventory);
        console.log('Crafted inventory (legacy):', craftedInventory);
        console.log('Player crafted items:', playerCraftedItems);
        
        // Check all recipes, including Lovely Vanilla Ice Cream
        let craftedCount = 0;
        
        // Crafted availability lives in playerInventory.
        recipes.forEach(recipe => {
            if (!recipe || !recipe.id) return;

            const count = (playerInventory && typeof playerInventory[recipe.id] === 'number')
                ? playerInventory[recipe.id]
                : 0;
            
            // Create crafted item element if count > 0
            if (count > 0) {
                craftedCount++;
                
                // Create element
                const itemElement = document.createElement('div');
                itemElement.className = 'crafted-item';
                itemElement.dataset.id = recipe.id;
                
                // Add appropriate classes based on category
                if (recipe.result.category) {
                    // Handle both string and array formats
                    if (typeof recipe.result.category === 'string') {
                        if (recipe.result.category.includes('food')) {
                            itemElement.classList.add('food');
                        }
                        if (recipe.result.category.includes('legendary')) {
                            itemElement.classList.add('legendary');
                        }
                    } else if (Array.isArray(recipe.result.category)) {
                        if (recipe.result.category.includes('food')) {
                            itemElement.classList.add('food');
                        }
                        if (recipe.result.category.includes('legendary')) {
                            itemElement.classList.add('legendary');
                        }
                    }
                }
                
                // Add the image
                const img = document.createElement('img');
                const imagePath = (recipe.result && (recipe.result.craftedImage || recipe.result.image)) ? (recipe.result.craftedImage || recipe.result.image) : '';
                
                // Handle Lovely Vanilla Ice Cream specially if needed
                if (recipe.id === 'lovely-vanilla-ice-cream') {
                    console.log('Adding Lovely Vanilla Ice Cream to crafted items');
                }
                
                img.src = normalizeImagePath(imagePath);
                img.alt = recipe.result.name;
                img.title = recipe.result.name;
                
                // Better error handling for image loading
                img.onerror = function() {
                    console.warn(`Failed to load crafted item image: ${img.src}`);
                    this.onerror = null;

                    // Fallback order: try recipe.result.image (if different), then placeholder.
                    const fallback = (recipe.result && recipe.result.image && recipe.result.image !== imagePath)
                        ? recipe.result.image
                        : 'assets/images/placeholder.webp';
                    this.src = normalizeImagePath(fallback);
                };
                
                itemElement.appendChild(img);
                
                // Add count badge
                const countBadge = document.createElement('span');
                countBadge.className = 'crafted-count';
                countBadge.textContent = count;
                itemElement.appendChild(countBadge);
                
                container.appendChild(itemElement);
                // Left-click to open Use modal
                itemElement.addEventListener('click', () => openUseCraftedItemModal(recipe.id));
            }
        });
        
        // Show message if no crafted items
        if (craftedCount === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.padding = '10px';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#aaa';
            emptyMsg.textContent = 'No crafted items yet';
            container.appendChild(emptyMsg);
        }
        
        console.log(`Displayed ${craftedCount} crafted items`);
    }

    function getCraftedAvailableCount(recipeId) {
        const a = (playerInventory && typeof playerInventory[recipeId] === 'number') ? playerInventory[recipeId] : 0;
        return (a | 0);
    }

    function openUseCraftedItemModal(recipeId) {
        const recipe = recipes.find(r => r && r.id === recipeId);
        if (!recipe) return;

        const available = getCraftedAvailableCount(recipeId);
        if (available <= 0) {
            alert('You have none of this item to use.');
            return;
        }

        // Populate modal
        useCraftedModal.dataset.recipeId = recipeId;
        useCraftedImg.src = normalizeImagePath((recipe.result && (recipe.result.craftedImage || recipe.result.image)) || 'assets/images/placeholder.webp');
        useCraftedImg.onerror = function () {
            this.onerror = null;
            this.src = 'assets/images/placeholder.webp';
        };
        useCraftedName.textContent = recipe.result.name || recipe.id;
        if (useCraftedName) {
            const cats = Array.isArray(recipe.result.category) ? recipe.result.category : [];
            const wantsPink = cats.includes('giggly');
            useCraftedName.style.color = (recipe.result.nameColor || (wantsPink ? '#ff69b4' : ''));
        }
        useCraftedDesc.textContent = recipe.result.description || '';
        if (useCraftedEffects) useCraftedEffects.textContent = recipe.result.effects || '';
        useCraftedAvail.textContent = String(available);
        useCraftedAmount.min = '1';
        useCraftedAmount.value = '1';
        useCraftedAmount.max = String(available);

        if (useCraftedModal) useCraftedModal.style.display = 'block';
    }

    function closeUseCraftedItemModal() {
        if (useCraftedModal) useCraftedModal.style.display = 'none';
    }

    function useCraftedItemConfirmAction() {
        if (!useCraftedModal) return;
        const recipeId = useCraftedModal.dataset.recipeId;
        if (!recipeId) return;

        const available = getCraftedAvailableCount(recipeId);
        let qty = Math.floor(Number(useCraftedAmount.value));
        if (!Number.isFinite(qty) || qty <= 0) {
            alert('Enter a valid amount.');
            return;
        }
        if (qty > available) qty = available;

        // Consume from playerInventory (single source of truth)
        const invHave = (playerInventory && playerInventory[recipeId]) ? playerInventory[recipeId] : 0;
        const takeFromInv = Math.min(qty, invHave);
        if (takeFromInv > 0) {
            playerInventory[recipeId] = invHave - takeFromInv;
            if (playerInventory[recipeId] <= 0) delete playerInventory[recipeId];
        }

        // Adjust playerCraftedItems count for display consistency
        if (qty > 0 && playerCraftedItems) {
            const have = playerCraftedItems[recipeId] || 0;
            playerCraftedItems[recipeId] = Math.max(0, have - qty);
            if (playerCraftedItems[recipeId] === 0) delete playerCraftedItems[recipeId];
        }

        // Persist
        localStorage.setItem('craftedInventory', JSON.stringify({}));
        localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
        localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));

        // Log usage to Logbook
        try {
            if (window.Logbook && typeof window.Logbook.addEntry === 'function') {
                const recipe = recipes.find(r => r && r.id === recipeId);
                window.Logbook.addEntry({
                    type: 'use',
                    title: `Used ${recipe && recipe.result ? (recipe.result.name || recipeId) : recipeId} x${qty}`,
                    data: { recipeId, amount: qty }
                });
            }
        } catch (e) {
            console.warn('Failed to log item usage', e);
        }

        // Refresh UI
        closeUseCraftedItemModal();
        updateCraftedItemsDisplay();
        const activeCategory = document.querySelector('.category-btn.active')?.dataset?.category || 'all';
        loadIngredients(activeCategory);
    }

    // Wire Use modal controls
    if (useCraftedCancel) useCraftedCancel.addEventListener('click', closeUseCraftedItemModal);
    if (useCraftedConfirm) useCraftedConfirm.addEventListener('click', useCraftedItemConfirmAction);
    if (useCraftedModal) {
        const closer = useCraftedModal.querySelector('.close');
        if (closer) closer.addEventListener('click', closeUseCraftedItemModal);
        useCraftedModal.addEventListener('click', (evt) => {
            if (evt.target === useCraftedModal) closeUseCraftedItemModal();
        });
    }

    function getInventoryDisplayName(itemId) {
        try {
            const ingredient = (typeof getIngredientById === 'function') ? getIngredientById(itemId) : null;
            if (ingredient && ingredient.name) return ingredient.name;
        } catch (_) {
            // ignore
        }
        try {
            const recipe = (typeof recipes !== 'undefined' && Array.isArray(recipes))
                ? recipes.find(r => r && r.id === itemId)
                : null;
            if (recipe && recipe.result && recipe.result.name) return recipe.result.name;
        } catch (_) {
            // ignore
        }
        return itemId;
    }

    function openInventoryRemoveModal(itemId) {
        if (!inventoryRemoveModal || !inventoryRemoveAmount || !inventoryRemoveAvailable || !inventoryRemoveName) return;
        const have = (playerInventory && typeof playerInventory[itemId] === 'number') ? (playerInventory[itemId] | 0) : 0;
        if (have <= 0) return;

        inventoryRemoveTargetId = itemId;
        inventoryRemoveName.textContent = getInventoryDisplayName(itemId);
        inventoryRemoveAvailable.textContent = String(have);
        inventoryRemoveAmount.min = '1';
        inventoryRemoveAmount.max = String(have);
        inventoryRemoveAmount.value = '1';
        inventoryRemoveModal.style.display = 'block';
    }

    function closeInventoryRemoveModal() {
        if (!inventoryRemoveModal) return;
        inventoryRemoveModal.style.display = 'none';
        inventoryRemoveTargetId = null;
    }

    function inventoryRemoveConfirmAction() {
        if (!inventoryRemoveModal || !inventoryRemoveTargetId || !inventoryRemoveAmount) return;
        const itemId = inventoryRemoveTargetId;
        const have = (playerInventory && typeof playerInventory[itemId] === 'number') ? (playerInventory[itemId] | 0) : 0;
        if (have <= 0) {
            closeInventoryRemoveModal();
            return;
        }

        let qty = Math.floor(Number(inventoryRemoveAmount.value));
        if (!Number.isFinite(qty) || qty <= 0) {
            alert('Enter a valid amount.');
            return;
        }
        if (qty > have) qty = have;

        // Remove from playerInventory (single source of truth)
        playerInventory[itemId] = have - qty;
        if (playerInventory[itemId] <= 0) delete playerInventory[itemId];

        // Adjust playerCraftedItems count if present (display consistency)
        if (playerCraftedItems && typeof playerCraftedItems[itemId] === 'number') {
            const c = (playerCraftedItems[itemId] | 0);
            playerCraftedItems[itemId] = Math.max(0, c - qty);
            if (playerCraftedItems[itemId] === 0) delete playerCraftedItems[itemId];
        }

        // Persist
        localStorage.setItem('craftedInventory', JSON.stringify({}));
        localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
        localStorage.setItem('playerCraftedItems', JSON.stringify(playerCraftedItems));

        // Log removal to Logbook
        try {
            if (window.Logbook && typeof window.Logbook.addEntry === 'function') {
                window.Logbook.addEntry({
                    type: 'inventory',
                    title: `Removed ${getInventoryDisplayName(itemId)} x${qty}`,
                    data: { itemId, amount: qty }
                });
            }
        } catch (e) {
            console.warn('Failed to log item removal', e);
        }

        // Refresh UI
        closeInventoryRemoveModal();
        updateCraftedItemsDisplay();
        const activeCategory = document.querySelector('.category-btn.active')?.dataset?.category || 'all';
        loadIngredients(activeCategory);
        checkBrewButton();
    }

    // Wire inventory remove modal controls
    if (inventoryRemoveCancel) inventoryRemoveCancel.addEventListener('click', closeInventoryRemoveModal);
    if (inventoryRemoveConfirm) inventoryRemoveConfirm.addEventListener('click', inventoryRemoveConfirmAction);
    if (inventoryRemoveModal) {
        const closer = inventoryRemoveModal.querySelector('.close');
        if (closer) closer.addEventListener('click', closeInventoryRemoveModal);
        inventoryRemoveModal.addEventListener('click', (evt) => {
            if (evt.target === inventoryRemoveModal) closeInventoryRemoveModal();
        });
    }

    // Add the tooltip container to the DOM
    function createTooltipContainer() {
        // Check if tooltip container already exists
        if (document.getElementById('item-tooltip')) {
            return;
        }
        
        const tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'item-tooltip';
        tooltipContainer.className = 'item-tooltip';
        tooltipContainer.style.display = 'none';
        tooltipContainer.style.position = 'fixed';
        tooltipContainer.style.zIndex = '1000';
        tooltipContainer.style.background = '#1e2128';
        tooltipContainer.style.border = '2px solid #3a4049';
        tooltipContainer.style.borderRadius = '8px';
        tooltipContainer.style.padding = '12px';
        tooltipContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        tooltipContainer.style.maxWidth = '320px';
        tooltipContainer.style.color = '#e0e0e0';
        tooltipContainer.style.fontSize = '14px';
        tooltipContainer.style.pointerEvents = 'none'; // Prevent the tooltip from capturing mouse events
        
        document.body.appendChild(tooltipContainer);
    }

    // Show tooltip with item info at mouse position
    function showItemTooltip(item, event) {
        event.preventDefault(); // Prevent the default context menu
        
        // Create tooltip container if it doesn't exist
        createTooltipContainer();
        
        const tooltip = document.getElementById('item-tooltip');
        if (!tooltip) return;
        
        // Fix: Ensure we're using valid item data
        if (!item || !item.name) {
            console.warn('Attempted to show tooltip for invalid item:', item);
            return;
        }
        
        // Build tooltip content
        tooltip.innerHTML = '';
        
        // Container for image and name (header)
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.marginBottom = '8px';
        
        // Item image
        const img = document.createElement('img');
        img.src = item.image;
        if (!img.src.includes('assets/images/') && !img.src.includes(':\\')) {
            img.src = 'assets/images/' + item.image;
        }
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.objectFit = 'contain';
        img.style.marginRight = '10px';
        img.style.borderRadius = '4px';
        img.style.border = item.category?.includes('legendary') ? '2px solid gold' : '1px solid #555';
        
        // Error fallback
        img.onerror = function() {
            console.warn(`Failed to load crafted item image: ${img.src}`);
            this.onerror = null;
            // Try with assets/images/ prefix if it's missing
            if (!img.src.includes('assets/images/')) {
                img.src = 'assets/images/' + item.image;
            } else {
                this.src = 'assets/images/placeholder.webp';
            }
        };
        
        // Item name
        const name = document.createElement('h3');
        name.textContent = item.name;
        name.style.margin = '0';
        name.style.fontSize = '18px';
        {
            const categoryList = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
            const isGiggly = categoryList.includes('giggly');
            const isLegendary = categoryList.includes('legendary');
            name.style.color = isGiggly ? '#ff69b4' : (isLegendary ? '#ffd700' : '#ffffff');
        }
        
        header.appendChild(img);
        header.appendChild(name);
        tooltip.appendChild(header);
        
        // Category badges
        const categories = document.createElement('div');
        categories.style.display = 'flex';
        categories.style.flexWrap = 'wrap';
        categories.style.gap = '4px';
        categories.style.marginBottom = '8px';
        
        if (item.category) {
            const categoryList = Array.isArray(item.category) ? item.category : [item.category];
            categoryList.forEach(cat => {
                const badge = document.createElement('span');
                badge.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                badge.style.padding = '2px 6px';
                badge.style.borderRadius = '4px';
                badge.style.fontSize = '11px';
                badge.style.backgroundColor = getCategoryColor(cat);
                badge.style.color = '#fff';
                categories.appendChild(badge);
            });
        }
        
        tooltip.appendChild(categories);
        
        // Description
        if (item.description) {
            const desc = document.createElement('p');
            desc.textContent = item.description;
            desc.style.margin = '6px 0';
            desc.style.fontSize = '14px';
            tooltip.appendChild(desc);
        }
        
        // Effects (if present)
        if (item.effects) {
            const effectsTitle = document.createElement('h4');
            effectsTitle.textContent = 'Effects:';
            effectsTitle.style.margin = '8px 0 2px 0';
            effectsTitle.style.fontSize = '15px';
            effectsTitle.style.color = '#afd5ff';
            
            const effects = document.createElement('p');
            effects.textContent = item.effects;
            effects.style.margin = '4px 0 8px 0';
            effects.style.fontSize = '13px';
            
            tooltip.appendChild(effectsTitle);
            tooltip.appendChild(effects);
        }
        
        // Recipe ingredients (for crafted items)
        const recipe = recipes.find(r => r.result.name === item.name);
        if (recipe) {
            const ingredientsTitle = document.createElement('h4');
            ingredientsTitle.textContent = 'Recipe:';
            ingredientsTitle.style.margin = '8px 0 4px 0';
            ingredientsTitle.style.fontSize = '15px';
            ingredientsTitle.style.color = '#b8e986';
            
            const ingredientsList = document.createElement('div');
            ingredientsList.style.display = 'flex';
            ingredientsList.style.flexWrap = 'wrap';
            ingredientsList.style.gap = '6px';
            
            // Add regular ingredients
            recipe.ingredients.forEach(ingId => {
                const ing = getIngredientById(ingId);
                if (ing) {
                    const ingItem = document.createElement('div');
                    ingItem.style.width = '32px';
                    ingItem.style.height = '32px';
                    ingItem.style.position = 'relative';
                    ingItem.style.border = '1px solid #555';
                    ingItem.style.borderRadius = '4px';
                    ingItem.style.overflow = 'hidden';
                    
                    const ingImg = document.createElement('img');
                    let imagePath = ing.image;
                    if (!imagePath.includes('assets/images/') && !imagePath.includes(':\\')) {
                        imagePath = 'assets/images/' + imagePath;
                    }
                    ingImg.src = imagePath;
                    ingImg.style.width = '100%';
                    ingImg.style.height = '100%';
                    ingImg.style.objectFit = 'contain';
                    ingImg.title = ing.name;
                    
                    ingItem.appendChild(ingImg);
                    ingredientsList.appendChild(ingItem);
                }
            });
            
            // Add exotic ingredient if present
            if (recipe.exoticIngredient) {
                const exoticIng = getIngredientById(recipe.exoticIngredient);
                if (exoticIng) {
                    const exoticItem = document.createElement('div');
                    exoticItem.style.width = '32px';
                    exoticItem.style.height = '32px';
                    exoticItem.style.position = 'relative';
                    exoticItem.style.border = '2px solid gold';
                    exoticItem.style.borderRadius = '4px';
                    exoticItem.style.overflow = 'hidden';
                    
                    const exoticImg = document.createElement('img');
                    let imagePath = exoticIng.image;
                    if (!imagePath.includes('assets/images/') && !imagePath.includes(':\\')) {
                        imagePath = 'assets/images/' + imagePath;
                    }
                    exoticImg.src = imagePath;
                    exoticImg.style.width = '100%';
                    exoticImg.style.height = '100%';
                    exoticImg.style.objectFit = 'contain';
                    exoticImg.title = exoticIng.name + ' (Exotic)';
                    
                    exoticItem.appendChild(exoticImg);
                    ingredientsList.appendChild(exoticItem);
                }
            }
            
            tooltip.appendChild(ingredientsTitle);
            tooltip.appendChild(ingredientsList);
        }
        
        // Position tooltip near the mouse
        tooltip.style.display = 'block';
        positionTooltip(tooltip, event);
    }

    // Get a color based on category
    function getCategoryColor(category) {
        const colors = {
            'food': '#8d6e63',
            'essence': '#7986cb',
            'crystal': '#4db6ac',
            'metal': '#78909c',
            'botanical': '#81c784',
            'textile': '#ce93d8',
            'herb': '#81c784',
            'legendary': '#ffd54f',
            'crafted': '#90a4ae',
            'exotic': '#ff8a65'
        };
        
        return colors[category.toLowerCase()] || '#757575';
    }

    // Hide the tooltip
    function hideItemTooltip() {
        const tooltip = document.getElementById('item-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // Position the tooltip near the mouse
    function positionTooltip(tooltip, event) {
        const padding = 15; // Space between mouse and tooltip
        
        // Get mouse position
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get tooltip dimensions
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        
        // Default position (right and below the cursor)
        let posX = mouseX + padding;
        let posY = mouseY + padding;
        
        // Check if tooltip would go off the right edge
        if (posX + tooltipWidth > viewportWidth) {
            posX = mouseX - tooltipWidth - padding;
        }
        
        // Check if tooltip would go off the bottom edge
        if (posY + tooltipHeight > viewportHeight) {
            posY = mouseY - tooltipHeight - padding;
        }
        
        // Ensure tooltip doesn't go off the left or top edges
        posX = Math.max(10, posX);
        posY = Math.max(10, posY);
        
        // Set the position
        tooltip.style.left = posX + 'px';
        tooltip.style.top = posY + 'px';
    }

    // Document click handler to hide tooltip
    document.addEventListener('click', function() {
        hideItemTooltip();
    });

    // Add event listeners to ingredient items for tooltip functionality
    function addTooltipListeners() {
        // For ingredients in the drawer
        document.querySelectorAll('.ingredient-item').forEach(item => {
            // Right click = remove/consume; Ctrl+Right click = quick add; Shift+Right click = tooltip.
            item.oncontextmenu = function(e) {
                e.preventDefault();
                const ingredientId = this.dataset.id;
                if (!ingredientId) return;

                if (e.shiftKey) {
                    const ingredient = getIngredientById(ingredientId);
                    if (ingredient) showItemTooltip(ingredient, e);
                    return;
                }

                if (e.ctrlKey) {
                    const placed = quickAddIngredientToNextOpenSlot(ingredientId);
                    if (!placed) {
                        const ingredient = getIngredientById(ingredientId);
                        if (ingredient) showItemTooltip(ingredient, e);
                    }
                    return;
                }

                openInventoryRemoveModal(ingredientId);
            };
        });
        
        // For ingredients in the slots
        document.querySelectorAll('.ingredient-slot').forEach(slot => {
            slot.addEventListener('contextmenu', function(e) {
                const position = this.dataset.position;
                if (slotContents && slotContents[position]) {
                    showItemTooltip(slotContents[position], e);
                }
            });
        });
        
        // For crafted items - FIX HERE
        document.querySelectorAll('#crafted-items-container .crafted-item').forEach(item => {
            item.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // Prevent default context menu
                
                const recipeId = this.dataset.id;
                console.log('Right-clicked crafted item with recipeId:', recipeId);
                
                if (recipeId) {
                    if (e.shiftKey) {
                        const recipe = recipes.find(r => r.id === recipeId);
                        if (recipe && recipe.result) {
                            showItemTooltip(recipe.result, e);
                        } else {
                            console.warn('Could not find recipe with id:', recipeId);
                        }
                        return;
                    }
                    openInventoryRemoveModal(recipeId);
                }
            });
        });
    }

    // Override loadIngredients to add tooltip functionality
    const originalLoadIngredients = loadIngredients;
    loadIngredients = function(category) {
        originalLoadIngredients(category);
        addTooltipListeners();
    };

    // Add direct tooltip support to displayCraftedItems
    const originalDisplayCraftedItems = displayCraftedItems;
    displayCraftedItems = function() {
        // Call original function
        originalDisplayCraftedItems();
        
        // Add our tooltip functionality with a slight delay to ensure DOM is ready
        setTimeout(() => {
            // Select all crafted items that don't have a context menu listener yet
            document.querySelectorAll('#crafted-items-container .crafted-item').forEach(item => {
                // Remove any existing contextmenu listeners to prevent duplicates
                const clone = item.cloneNode(true);
                item.parentNode.replaceChild(clone, item);
                
                // Add the tooltip functionality
                clone.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    const recipeId = this.dataset.id;

                    if (e.shiftKey) {
                        console.log('Showing tooltip for crafted item:', recipeId);
                        const recipe = recipes.find(r => r.id === recipeId);
                        if (recipe && recipe.result) {
                            showItemTooltip(recipe.result, e);
                        }
                        return;
                    }

                    openInventoryRemoveModal(recipeId);
                });
            });
            
            console.log('Added tooltip listeners to crafted items');
        }, 100);
    };

    // Add MutationObserver to specifically watch the crafted items container
    const craftedItemsObserver = new MutationObserver(function(mutations) {
        addTooltipListeners();
    });

    // Start observing the crafted items container specifically
    document.addEventListener('DOMContentLoaded', function() {
        const craftedItemsContainer = document.getElementById('crafted-items-container');
        if (craftedItemsContainer) {
            craftedItemsObserver.observe(craftedItemsContainer, { 
                childList: true, 
                subtree: true 
            });
        }
    });

    // Add CSS for tooltip
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .item-tooltip {
            transition: opacity 0.2s ease;
            opacity: 1;
        }
    `;
    document.head.appendChild(tooltipStyle);

    // Initialize tooltip functionality
    addTooltipListeners();

    // MutationObserver to add tooltip listeners when DOM changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addTooltipListeners();
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Prevent context menu on ingredient containers
    document.querySelectorAll('#ingredients-container, #crafted-items-container').forEach(container => {
        container.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
    
    // Expedition handling (in-page modal)
    const expeditionBtn = document.getElementById('expedition-btn');
    const expeditionModal = document.getElementById('expedition-modal');
    const expeditionContainer = document.getElementById('expedition-container');
    const expeditionLevelSelect = document.getElementById('expedition-level-select');
    const expeditionLevelThumbs = document.querySelectorAll('#expedition-level-select .level-thumbnail');

    let currentGame = null;
    let expeditionWired = false;
    let currentZoneId = 'lissome-plains';

    function stopCurrentExpeditionGame() {
        if (currentGame && typeof currentGame.destroy === 'function') {
            currentGame.destroy();
        }
        currentGame = null;
        if (expeditionContainer) expeditionContainer.style.display = 'none';
    }

    function applyExpeditionRewards(rewards) {
        // `distributeRewards()` returns aggregated objects: [{ id, amount }]
        if (!rewards || !Array.isArray(rewards)) return;

        rewards.forEach(rewardId => {
            if (typeof rewardId === 'string' && rewardId.length > 0) {
                playerInventory[rewardId] = (playerInventory[rewardId] || 0) + 1;
            } else if (rewardId && rewardId.id && rewardId.amount) {
                // Backwards compatible if we ever return objects
                playerInventory[rewardId.id] = (playerInventory[rewardId.id] || 0) + rewardId.amount;
            }
        });

        localStorage.setItem('playerInventory', JSON.stringify(playerInventory));
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        loadIngredients(activeCategory);

        // Log expedition rewards with timestamp for tracking
        if (window.Logbook && typeof window.Logbook.addExpeditionRewards === 'function') {
            try {
                const zoneCfg = (window.ZonePatrolZones && typeof window.ZonePatrolZones.getZoneConfig === 'function')
                    ? window.ZonePatrolZones.getZoneConfig(currentZoneId)
                    : { logbookLocationId: currentZoneId || 'lissome-plains', logbookLocationName: 'Lissome Plains' };
                window.Logbook.addExpeditionRewards({
                    locationId: zoneCfg && zoneCfg.logbookLocationId ? zoneCfg.logbookLocationId : (currentZoneId || 'lissome-plains'),
                    locationName: zoneCfg && zoneCfg.logbookLocationName ? zoneCfg.logbookLocationName : 'Lissome Plains',
                    score: currentGame && typeof currentGame.score === 'number' ? currentGame.score : null,
                    round: currentGame && typeof currentGame.round === 'number' ? currentGame.round : null,
                    wave: currentGame && typeof currentGame.wave === 'number' ? currentGame.wave : null,
                    rewards
                });
            } catch (e) {
                console.warn('Failed to log expedition rewards', e);
            }
        }
    }

    function showExpeditionLevelSelect() {
        if (expeditionContainer) expeditionContainer.style.display = 'none';
        if (expeditionLevelSelect) expeditionLevelSelect.style.display = 'block';
    }

    function startExpeditionGame(zoneId) {
        if (!expeditionContainer) return;

        currentZoneId = (zoneId && typeof zoneId === 'string') ? zoneId : 'lissome-plains';

        // Stop any existing game instance to avoid listener stacking.
        stopCurrentExpeditionGame();

        expeditionContainer.style.display = 'block';
        if (expeditionLevelSelect) expeditionLevelSelect.style.display = 'none';

        // Start a new game instance each time to avoid input-handler stacking.
        currentGame = new AlchemyBlaster({
            container: expeditionContainer,
            enemyStyle: 'invaders',
            zoneId: currentZoneId,
            sounds: {
                shoot: document.getElementById('shoot-sound'),
                hit1: document.getElementById('hit1-sound'),
                hit2: document.getElementById('hit2-sound'),
                victory: document.getElementById('victory-sound'),
                victory1: document.getElementById('victory1-sound'),
                victory2: document.getElementById('victory2-sound'),
                gameOver: document.getElementById('gameover-sound'),
                gameOver1: document.getElementById('gameover1-sound'),
                spellfire: [
                    document.getElementById('spellfire-sound'),
                    document.getElementById('spellfire1-sound'),
                    document.getElementById('spellfire2-sound'),
                    document.getElementById('spellfire3-sound')
                ],
                alizaHit1: document.getElementById('aliza-hit1-sound'),
                alizaHit2: document.getElementById('aliza-hit2-sound'),
                alizaVictory1: document.getElementById('aliza-victory1-sound'),
                alizaVictory2: document.getElementById('aliza-victory2-sound'),
                alizaGameOver1: document.getElementById('aliza-gameover1-sound'),
                alizaGameOver2: document.getElementById('aliza-gameover2-sound')
            },
            onRewardsCollected: applyExpeditionRewards,
            onReturnToMenu: () => {
                stopCurrentExpeditionGame();
                showExpeditionLevelSelect();
            },
            onExit: () => {
                stopCurrentExpeditionGame();
                if (expeditionModal) expeditionModal.style.display = 'none';
                showExpeditionLevelSelect();
            }
        });
    }

    function openExpeditionModal() {
        if (!expeditionModal) return;
        expeditionModal.style.display = 'block';
        showExpeditionLevelSelect();

        function isExpeditionRunActive() {
            return !!(currentGame && (currentGame.gameState === 'playing' || currentGame.gameState === 'paused' || currentGame.gameState === 'powerChoice' || currentGame.gameState === 'bossRushRewardChoice'));
        }

        function attemptCloseExpeditionModal() {
            // If a run is active, don't allow accidental closure (click-away) that would lose progress.
            if (isExpeditionRunActive()) {
                const ok = window.confirm('A Zone Patrol run is still in progress.\n\nQuit and claim items from your current score?');
                if (!ok) return;

                try {
                    if (currentGame && typeof currentGame.quitRun === 'function') {
                        currentGame.quitRun();
                    }
                } catch (e) {
                    console.warn('Failed to quit expedition run cleanly', e);
                }
            }

            stopCurrentExpeditionGame();
            expeditionModal.style.display = 'none';
            showExpeditionLevelSelect();
        }

        if (!expeditionWired) {
            expeditionWired = true;

            (expeditionLevelThumbs || []).forEach(el => {
                if (!el) return;
                el.addEventListener('click', function () {
                    const zoneId = el && el.dataset ? el.dataset.level : null;
                    startExpeditionGame(zoneId);
                });
            });

            const closeBtn = expeditionModal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    attemptCloseExpeditionModal();
                });
            }

            window.addEventListener('click', function(event) {
                if (event.target === expeditionModal) {
                    attemptCloseExpeditionModal();
                }
            });
        }
    }

    if (expeditionBtn) {
        expeditionBtn.addEventListener('click', openExpeditionModal);
    }

    // --- Layout Tuner (overlay + brew button positioning) ---
    (function initLayoutTuner() {
        const tunerEl = document.getElementById('layout-tuner');
        if (!tunerEl) return;

        const overlayYInput = document.getElementById('layout-overlay-y');
        const brewYInput = document.getElementById('layout-brew-y');
        const overlayScaleInput = document.getElementById('layout-overlay-scale');
        const brewScaleInput = document.getElementById('layout-brew-scale');
        const overlayYValue = document.getElementById('layout-overlay-y-value');
        const brewYValue = document.getElementById('layout-brew-y-value');
        const overlayScaleValue = document.getElementById('layout-overlay-scale-value');
        const brewScaleValue = document.getElementById('layout-brew-scale-value');

        const targetSelect = document.getElementById('layout-target');
        const targetLabel = document.getElementById('layout-target-label');
        const targetXInput = document.getElementById('layout-target-x');
        const targetYInput = document.getElementById('layout-target-y');
        const targetXValue = document.getElementById('layout-target-x-value');
        const targetYValue = document.getElementById('layout-target-y-value');

        const outputEl = document.getElementById('layout-css-output');
        const copyBtn = document.getElementById('layout-copy-css');
        const resetBtn = document.getElementById('layout-reset');
        const closeBtn = document.getElementById('layout-tuner-close');

        const root = document.documentElement;
        const slotsContainer = document.querySelector('.slots-container');
        const overlayEl = document.querySelector('.slots-container .alchemy-station-overlay');
        const brewContainer = document.querySelector('.slots-container .brew-button-container');

        const STORAGE_KEY = 'layoutTunerOffsetsV4';

        const DEFAULTS = {
            '--alchemy-brew-scale': 78,
            '--alchemy-brew-x': 0,
            '--alchemy-brew-y': -20,
            '--alchemy-channels-x': 0,
            '--alchemy-channels-y': -80,
            '--alchemy-overlay-scale': 109,
            '--alchemy-overlay-x': 0,
            '--alchemy-overlay-y': -3,
            '--alchemy-result-x': 0,
            '--alchemy-result-y': -1.5,
            '--alchemy-slot-a-x': 11.5,
            '--alchemy-slot-a-y': -16.5,
            '--alchemy-slot-b-x': -4.5,
            '--alchemy-slot-b-y': -12,
            '--alchemy-slot-c-x': 4.5,
            '--alchemy-slot-c-y': -12,
            '--alchemy-slot-d-x': -11.5,
            '--alchemy-slot-d-y': -16.5,
            '--alchemy-slot-e-x': -3.5,
            '--alchemy-slot-e-y': -20
        };

        const TARGETS = {
            overlay: { label: 'Overlay', xVar: '--alchemy-overlay-x', yVar: '--alchemy-overlay-y' },
            brew: { label: 'Craft Button', xVar: '--alchemy-brew-x', yVar: '--alchemy-brew-y' },
            'slot-a': { label: 'Slot A', xVar: '--alchemy-slot-a-x', yVar: '--alchemy-slot-a-y' },
            'slot-b': { label: 'Slot B', xVar: '--alchemy-slot-b-x', yVar: '--alchemy-slot-b-y' },
            'slot-c': { label: 'Slot C', xVar: '--alchemy-slot-c-x', yVar: '--alchemy-slot-c-y' },
            'slot-d': { label: 'Slot D', xVar: '--alchemy-slot-d-x', yVar: '--alchemy-slot-d-y' },
            'slot-e': { label: 'Slot E', xVar: '--alchemy-slot-e-x', yVar: '--alchemy-slot-e-y' },
            result: { label: 'Result Chamber', xVar: '--alchemy-result-x', yVar: '--alchemy-result-y' },
            channels: { label: 'Channels (all)', xVar: '--alchemy-channels-x', yVar: '--alchemy-channels-y' }
        };

        const VAR_LIMITS = {
            position: { min: -140, max: 140, step: 0.5 },
            size: { min: 50, max: 150, step: 1 }
        };

        const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
        const roundTo = (value, step) => Math.round(value / step) * step;

        function getVarNumber(name, fallback) {
            const raw = getComputedStyle(root).getPropertyValue(name).trim();
            const parsed = Number(raw);
            return Number.isFinite(parsed) ? parsed : fallback;
        }

        function setVarNumber(name, value) {
            root.style.setProperty(name, String(value));
        }

        function readStored() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object') return null;
                return parsed;
            } catch {
                return null;
            }
        }

        function writeStored(values) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
            } catch {
                // ignore
            }
        }

        function formatOutput(allVars) {
            const keys = Object.keys(allVars).sort();
            const lines = ['/* Paste into assets/css/style.css */', ':root {'];
            for (const k of keys) {
                lines.push(`  ${k}: ${allVars[k]};`);
            }
            lines.push('}', '', '/* Tip: you can delete localStorage key "layoutTunerOffsetsV4" after baking these in. */');
            return lines.join('\n');
        }

        function snapshotAllVars() {
            const allVars = {
                ...DEFAULTS,
                '--alchemy-overlay-scale': getVarNumber('--alchemy-overlay-scale', DEFAULTS['--alchemy-overlay-scale']),
                '--alchemy-brew-scale': getVarNumber('--alchemy-brew-scale', DEFAULTS['--alchemy-brew-scale'])
            };

            for (const k of Object.keys(DEFAULTS)) {
                allVars[k] = getVarNumber(k, DEFAULTS[k]);
            }
            return allVars;
        }

        function persistSnapshot() {
            const allVars = snapshotAllVars();
            writeStored({ vars: allVars });
        }

        function applyAllVars(allVars) {
            for (const [k, v] of Object.entries(allVars)) {
                if (typeof v === 'number' && Number.isFinite(v)) {
                    setVarNumber(k, v);
                }
            }
        }

        function setTargetUI(targetKey) {
            const target = TARGETS[targetKey] || TARGETS.overlay;
            if (targetLabel) targetLabel.textContent = target.label;

            const x = getVarNumber(target.xVar, DEFAULTS[target.xVar] ?? 0);
            const y = getVarNumber(target.yVar, DEFAULTS[target.yVar] ?? 0);

            if (targetXInput) targetXInput.value = String(x);
            if (targetYInput) targetYInput.value = String(y);
            if (targetXValue) targetXValue.textContent = String(x);
            if (targetYValue) targetYValue.textContent = String(y);
        }

        function syncUIFromVars() {
            const overlayY = getVarNumber('--alchemy-overlay-y', DEFAULTS['--alchemy-overlay-y']);
            const brewY = getVarNumber('--alchemy-brew-y', DEFAULTS['--alchemy-brew-y']);
            const overlayScale = getVarNumber('--alchemy-overlay-scale', DEFAULTS['--alchemy-overlay-scale']);
            const brewScale = getVarNumber('--alchemy-brew-scale', DEFAULTS['--alchemy-brew-scale']);

            if (overlayYInput) overlayYInput.value = String(overlayY);
            if (brewYInput) brewYInput.value = String(brewY);
            if (overlayScaleInput) overlayScaleInput.value = String(overlayScale);
            if (brewScaleInput) brewScaleInput.value = String(brewScale);
            if (overlayYValue) overlayYValue.textContent = String(overlayY);
            if (brewYValue) brewYValue.textContent = String(brewY);
            if (overlayScaleValue) overlayScaleValue.textContent = String(overlayScale);
            if (brewScaleValue) brewScaleValue.textContent = String(brewScale);

            if (outputEl) outputEl.value = formatOutput(snapshotAllVars());

            if (targetSelect) {
                setTargetUI(targetSelect.value || 'overlay');
            }
        }

        function applyFromUI() {
            const overlayY = overlayYInput ? Number(overlayYInput.value) : getVarNumber('--alchemy-overlay-y', DEFAULTS['--alchemy-overlay-y']);
            const brewY = brewYInput ? Number(brewYInput.value) : getVarNumber('--alchemy-brew-y', DEFAULTS['--alchemy-brew-y']);
            const overlayScale = overlayScaleInput ? Number(overlayScaleInput.value) : getVarNumber('--alchemy-overlay-scale', DEFAULTS['--alchemy-overlay-scale']);
            const brewScale = brewScaleInput ? Number(brewScaleInput.value) : getVarNumber('--alchemy-brew-scale', DEFAULTS['--alchemy-brew-scale']);

            const cleanOverlayY = clamp(roundTo(overlayY, VAR_LIMITS.position.step), VAR_LIMITS.position.min, VAR_LIMITS.position.max);
            const cleanBrewY = clamp(roundTo(brewY, VAR_LIMITS.position.step), VAR_LIMITS.position.min, VAR_LIMITS.position.max);
            const cleanOverlayScale = clamp(roundTo(overlayScale, 1), VAR_LIMITS.size.min, VAR_LIMITS.size.max);
            const cleanBrewScale = clamp(roundTo(brewScale, 1), VAR_LIMITS.size.min, VAR_LIMITS.size.max);

            setVarNumber('--alchemy-overlay-y', cleanOverlayY);
            setVarNumber('--alchemy-brew-y', cleanBrewY);
            setVarNumber('--alchemy-overlay-scale', cleanOverlayScale);
            setVarNumber('--alchemy-brew-scale', cleanBrewScale);

            persistSnapshot();
            syncUIFromVars();
        }

        function setOpen(isOpen) {
            tunerEl.classList.toggle('is-open', isOpen);
            tunerEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            document.body.classList.toggle('layout-tuner-active', isOpen);
            if (isOpen) {
                const stored = readStored();
                if (stored && stored.vars && typeof stored.vars === 'object') {
                    applyAllVars(stored.vars);
                }
                syncUIFromVars();
            }
        }
        syncUIFromVars();

        // Safety: always start CLOSED.
        // If the body ever winds up with `layout-tuner-active` without the panel being open,
        // the decorative overlay can start capturing pointer events and make the whole UI feel dead.
        try {
            setOpen(false);
        } catch (_) {
            document.body.classList.remove('layout-tuner-active');
            tunerEl.classList.remove('is-open');
            tunerEl.setAttribute('aria-hidden', 'true');
        }

        // Wire events
        overlayYInput?.addEventListener('input', applyFromUI);
        brewYInput?.addEventListener('input', applyFromUI);
        overlayScaleInput?.addEventListener('input', applyFromUI);
        brewScaleInput?.addEventListener('input', applyFromUI);

        targetSelect?.addEventListener('change', () => {
            setTargetUI(targetSelect.value);
        });

        function applyTargetXY() {
            if (!targetSelect) return;
            const t = TARGETS[targetSelect.value] || TARGETS.overlay;

            const x = targetXInput ? Number(targetXInput.value) : getVarNumber(t.xVar, DEFAULTS[t.xVar] ?? 0);
            const y = targetYInput ? Number(targetYInput.value) : getVarNumber(t.yVar, DEFAULTS[t.yVar] ?? 0);
            const cleanX = clamp(roundTo(x, VAR_LIMITS.position.step), VAR_LIMITS.position.min, VAR_LIMITS.position.max);
            const cleanY = clamp(roundTo(y, VAR_LIMITS.position.step), VAR_LIMITS.position.min, VAR_LIMITS.position.max);

            setVarNumber(t.xVar, cleanX);
            setVarNumber(t.yVar, cleanY);
            persistSnapshot();

            // Keep the quick sliders in sync when target is overlay/brew
            if (t.yVar === '--alchemy-overlay-y' && overlayYInput) overlayYInput.value = String(cleanY);
            if (t.yVar === '--alchemy-brew-y' && brewYInput) brewYInput.value = String(cleanY);

            syncUIFromVars();
        }

        targetXInput?.addEventListener('input', applyTargetXY);
        targetYInput?.addEventListener('input', applyTargetXY);

        closeBtn?.addEventListener('click', () => setOpen(false));

        resetBtn?.addEventListener('click', () => {
            applyAllVars({
                ...DEFAULTS,
                '--alchemy-overlay-scale': DEFAULTS['--alchemy-overlay-scale'],
                '--alchemy-brew-scale': DEFAULTS['--alchemy-brew-scale']
            });
            persistSnapshot();
            syncUIFromVars();
        });

        copyBtn?.addEventListener('click', async () => {
            const text = outputEl ? outputEl.value : '';
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.textContent = 'Copied!';
                setTimeout(() => (copyBtn.textContent = 'Copy CSS'), 900);
            } catch {
                // Fallback: select text so user can Ctrl+C
                outputEl?.focus();
                outputEl?.select();
            }
        });

        // Toggle with Ctrl+Alt+L
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && (e.key === 'l' || e.key === 'L')) {
                e.preventDefault();
                const nowOpen = !tunerEl.classList.contains('is-open');
                setOpen(nowOpen);
            }
        });

        // Dragging support (when tuner is open)
        function attachDrag(targetEl, xVar, yVar) {
            if (!targetEl) return;

            let isDragging = false;
            let startX = 0;
            let startY = 0;
            let startValueX = 0;
            let startValueY = 0;
            let basisWidth = 1;
            let basisHeight = 1;

            const onPointerMove = (ev) => {
                if (!isDragging) return;
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                const deltaPercentX = (dx / basisWidth) * 100;
                const deltaPercentY = (dy / basisHeight) * 100;

                const nextX = clamp(roundTo(startValueX + deltaPercentX, VAR_LIMITS.position.step), VAR_LIMITS.position.min, VAR_LIMITS.position.max);
                const nextY = clamp(roundTo(startValueY + deltaPercentY, VAR_LIMITS.position.step), VAR_LIMITS.position.min, VAR_LIMITS.position.max);

                setVarNumber(xVar, nextX);
                setVarNumber(yVar, nextY);

                // Keep quick sliders in sync
                if (yVar === '--alchemy-overlay-y' && overlayYInput) overlayYInput.value = String(nextY);
                if (yVar === '--alchemy-brew-y' && brewYInput) brewYInput.value = String(nextY);

                persistSnapshot();
                syncUIFromVars();
            };

            const onPointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            targetEl.addEventListener('pointerdown', (ev) => {
                if (!tunerEl.classList.contains('is-open')) return;
                if (!slotsContainer) return;

                ev.preventDefault();
                isDragging = true;
                startX = ev.clientX;
                startY = ev.clientY;
                startValueX = getVarNumber(xVar, DEFAULTS[xVar] ?? 0);
                startValueY = getVarNumber(yVar, DEFAULTS[yVar] ?? 0);

                const rect = targetEl.getBoundingClientRect();
                basisWidth = Math.max(1, rect?.width || slotsContainer.getBoundingClientRect().width || 1);
                basisHeight = Math.max(1, rect?.height || slotsContainer.getBoundingClientRect().height || 1);

                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
            });
        }

        // Set initial target UI
        if (targetSelect && !targetSelect.value) targetSelect.value = 'overlay';
        if (targetSelect) setTargetUI(targetSelect.value || 'overlay');

        attachDrag(overlayEl, '--alchemy-overlay-x', '--alchemy-overlay-y');
        attachDrag(brewContainer, '--alchemy-brew-x', '--alchemy-brew-y');
    })();
});
