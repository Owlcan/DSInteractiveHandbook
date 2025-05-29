/**
 * Interactive Handbook - Renderer Script
 * Handles UI interactions and displays data from the data folder
 */

// Run initialization when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing handbook...");
    
    // Initialize components
    initializeComponents();
    
    // Set up navigation
    setupNavigation();
    
    // Load data from data folder
    loadDataFiles();
    
    // Default to the welcome section
    document.getElementById('welcome-section').classList.add('active');
    console.log("Handbook initialization complete");
});

/**
 * Initialize all components
 */
function initializeComponents() {
    console.log("Initializing components...");
    // Initialize the modal handler for popup windows
    if (typeof ModalHandler === 'function') {
        window.modalHandler = new ModalHandler();
        console.log("Modal handler initialized");
    } else {
        console.warn("ModalHandler not found");
    }
    
    // Initialize the audio manager for sound effects
    if (typeof AudioManager === 'function') {
        window.audioManager = new AudioManager();
        window.audioManager.initialize();
        console.log("Audio manager initialized");
    } else {
        console.warn("AudioManager not found");
    }
    
    // Initialize the alchemy tracker component
    if (typeof AlchemyTracker === 'function') {
        window.alchemyTracker = new AlchemyTracker();
        window.alchemyTracker.initialize();
        console.log("Alchemy tracker initialized");
    } else {
        console.warn("AlchemyTracker not found");
    }
}

/**
 * Set up navigation system
 */
function setupNavigation() {
    console.log("Setting up navigation...");
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`Navigation clicked: ${link.getAttribute('data-section')}`);
            
            // Get the target section name
            const targetSectionName = link.getAttribute('data-section');
            const targetSectionId = `${targetSectionName}-section`;
            
            console.log(`Navigating to section: ${targetSectionId}`);
            
            // Hide all sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Remove active class from all nav links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
              // Activate the target section
            const targetSection = document.getElementById(targetSectionId);
            targetSection.classList.add('active');
            link.classList.add('active');
            
            // If switching to items or bestiary section, make sure content is loaded
            if (targetSectionName === 'items') {
                console.log("Loading items into view");
                loadItems(window.itemsData);
            } else if (targetSectionName === 'bestiary') {
                console.log("Loading monsters into view");
                loadMonsters(window.monstersData);
            } else if (targetSectionName === 'races') {
                const racesContent = document.getElementById('races-content');
                
                // If races content is empty, load it
                if (!racesContent.innerHTML.trim()) {
                    // Load races content from simple-handbook.html
                    fetch('simple-handbook.html')
                        .then(response => response.text())
                        .then(html => {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(html, 'text/html');
                            const racesContentHTML = doc.getElementById('races-content').innerHTML;
                            racesContent.innerHTML = racesContentHTML;
                            
                            // Now that the content is loaded, generate the table of contents
                            if (typeof assignHeaderIDs === 'function' && typeof generateTableOfContents === 'function') {
                                assignHeaderIDs();
                                generateTableOfContents();
                            }
                        })
                        .catch(error => {
                            console.error('Error loading races content:', error);
                        });
                } else {
                    // Content already loaded, just update the TOC
                    if (typeof assignHeaderIDs === 'function' && typeof generateTableOfContents === 'function') {
                        assignHeaderIDs();
                        generateTableOfContents();
                    }
                }
            }

else if (targetSectionName === 'legacy-Weapons') {
    console.log("Loading legacy weapon creator");
    const legacyWeapons = document.getElementById('legacy-Weapons');

    if (legacyWeapons) {
        // If the section already exists, no need to load content from external file
        console.log("Legacy weapons section exists, showing it");
    } else {
        console.error("Could not find legacy-Weapons element");
    }
}
            // Play page turn sound effect
            if (window.audioManager) {
                window.audioManager.playSound('pageFlip');
            }
        });
    });
    
    console.log(`Set up navigation for ${navLinks.length} links`);
}

/**
 * Load data files and initialize data manager
 */
function loadDataFiles() {
    console.log("Loading data files...");
    
    // Check if data is available in window scope
    console.log("Window itemsData:", window.itemsData);
    console.log("Window monstersData:", window.monstersData);
    
    // Give a slight delay to ensure data is properly loaded
    setTimeout(() => {
        if (window.itemsData && window.monstersData) {
            console.log("Data found in global scope");
            console.log(`Found ${window.itemsData.length} items and ${window.monstersData.length} monsters`);
            
            // Initialize UI immediately since data is already loaded
            initializeUI();
        } else {
            console.error("Data not found in global scope. Using fallback data.");
            // Try to use the fallback data that browser-data.js should have created
            window.itemsData = window.itemsData || [];
            window.monstersData = window.monstersData || [];
            initializeUI();
        }
    }, 100); // Short delay to ensure scripts are fully loaded
}

/**
 * Initialize UI with data from data files
 */
function initializeUI() {
    try {
        console.log("Initializing UI with data...");
        
        // Access the data from global variables
        if (window.itemsData && window.monstersData) {
            console.log(`Found data: ${window.itemsData.length} items, ${window.monstersData.length} monsters`);
            
            // Load items and monsters into UI
            loadItems(window.itemsData);
            loadMonsters(window.monstersData);
            
            // Set up search and filtering
            setupSearch();
            
            console.log("UI initialized successfully");
        } else {
            console.error("Data not found in global variables");
            displayError("Failed to load data. Please check the console for details.");
        }
    } catch (error) {
        console.error("Error initializing UI:", error);
        displayError(`Failed to initialize UI: ${error.message}`);
    }
}

/**
 * Load items into the items container
 * @param {Array} items - Array of item objects
 */
function loadItems(items) {
    console.log(`Loading ${items.length} items into UI...`);
    const itemsContainer = document.getElementById('items-container');
    const template = document.getElementById('item-card-template');
    
    if (!itemsContainer || !template || !items) {
        console.error("Missing container, template, or items data");
        return;
    }
    
    // Clear container
    itemsContainer.innerHTML = '';
    
    items.forEach(item => {
        // Clone template
        const clone = document.importNode(template.content, true);
        
        // Fill in data
        const nameElement = clone.querySelector('.item-name');
        const imageElement = clone.querySelector('.item-image');
        const typeElement = clone.querySelector('.item-type');
        const rarityElement = clone.querySelector('.item-rarity');
        const valueElement = clone.querySelector('.item-value');
        
        if (nameElement) nameElement.textContent = item.name || 'Unknown Item';
        
        // Handle image path
        if (imageElement) {
            if (item.image && typeof item.image === 'string') {
                imageElement.src = item.image;
            } else {
                // Default image if none provided
                imageElement.src = 'assets/images/placeholder.js';
            }
            imageElement.alt = item.name || 'Item image';
        }
        
        if (typeElement) typeElement.textContent = item.type || 'Unknown Type';
        if (rarityElement) rarityElement.textContent = item.rarity || 'Unknown Rarity';
        if (valueElement) valueElement.textContent = item.value || 'Unknown Value';
        
        // Add click event to show details
        const card = clone.querySelector('.item-card');
        if (card) {
            card.addEventListener('click', () => {
                showItemDetails(item);
            });
        }
        
        // Add to container
        itemsContainer.appendChild(clone);
    });
    
    console.log(`Loaded ${items.length} items into UI`);
}

/**
 * Load monsters into the monsters container
 * @param {Array} monsters - Array of monster objects
 */
function loadMonsters(monsters) {
    console.log(`Loading ${monsters.length} monsters into UI...`);
    const monstersContainer = document.getElementById('monsters-container');
    const template = document.getElementById('monster-card-template');
    
    if (!monstersContainer || !template || !monsters) {
        console.error("Missing container, template, or monsters data");
        return;
    }
    
    // Clear container
    monstersContainer.innerHTML = '';
    
    monsters.forEach(monster => {
        // Clone template
        const clone = document.importNode(template.content, true);
        
        // Fill in data
        const nameElement = clone.querySelector('.monster-name');
        const imageElement = clone.querySelector('.monster-image');
        const descriptionElement = clone.querySelector('.monster-description');
        const sizeTypeElement = clone.querySelector('.monster-size-type');
        
        if (nameElement) nameElement.textContent = monster.name || 'Unknown Monster';
        
        // Handle image path
        if (imageElement) {
            if (monster.imageUrl && typeof monster.imageUrl === 'string') {
                imageElement.src = monster.imageUrl;
            } else {
                // Default image if none provided
                imageElement.src = 'assets/images/placeholder.js';
            }
            imageElement.alt = monster.name || 'Monster image';
        }
        
        if (descriptionElement) descriptionElement.textContent = monster.description || 'No description available';
        if (sizeTypeElement) sizeTypeElement.textContent = `${monster.size || 'Unknown Size'} ${monster.type || 'Unknown Type'}`;
        
        // Add click event to show details
        const card = clone.querySelector('.monster-card');
        if (card) {
            card.addEventListener('click', () => {
                showMonsterDetails(monster);
            });
        }
        
        // Add to container
        monstersContainer.appendChild(clone);
    });
    
    console.log(`Loaded ${monsters.length} monsters into UI`);
}

/**
 * Set up search and filtering functionality
 */
function setupSearch() {
    console.log("Setting up search functionality...");
    
    // Item search and filters
    const itemSearch = document.getElementById('item-search');
    const itemFilterType = document.getElementById('item-filter-type');
    const itemFilterRarity = document.getElementById('item-filter-rarity');
    
    if (itemSearch && itemFilterType && itemFilterRarity) {
        const applyItemFilters = () => {
            const searchValue = itemSearch.value.toLowerCase();
            const typeValue = itemFilterType.value.toLowerCase();
            const rarityValue = itemFilterRarity.value;
            
            // Filter items based on criteria
            const filteredItems = window.itemsData.filter(item => {
                let matches = true;
                
                // Filter by name
                if (searchValue && !item.name.toLowerCase().includes(searchValue)) {
                    matches = false;
                }
                
                // Filter by type
                if (typeValue && !item.type.toLowerCase().includes(typeValue)) {
                    matches = false;
                }
                
                // Filter by rarity
                if (rarityValue && item.rarity !== rarityValue) {
                    matches = false;
                }
                
                return matches;
            });
            
            loadItems(filteredItems);
        };
        
        // Add event listeners for item filters
        itemSearch.addEventListener('input', applyItemFilters);
        itemFilterType.addEventListener('change', applyItemFilters);
        itemFilterRarity.addEventListener('change', applyItemFilters);
        
        console.log("Item search functionality set up");
    } else {
        console.warn("Item search elements not found");
    }
    
    // Monster search and filters
    const monsterSearch = document.getElementById('monster-search');
    const monsterFilterType = document.getElementById('monster-filter-type');
    
    if (monsterSearch && monsterFilterType) {
        const applyMonsterFilters = () => {
            const searchValue = monsterSearch.value.toLowerCase();
            const typeValue = monsterFilterType.value;
            
            // Filter monsters based on criteria
            const filteredMonsters = window.monstersData.filter(monster => {
                let matches = true;
                
                // Filter by name
                if (searchValue && !monster.name.toLowerCase().includes(searchValue)) {
                    matches = false;
                }
                
                // Filter by type
                if (typeValue && monster.type !== typeValue) {
                    matches = false;
                }
                
                return matches;
            });
            
            loadMonsters(filteredMonsters);
        };
        
        // Add event listeners for monster filters
        monsterSearch.addEventListener('input', applyMonsterFilters);
        monsterFilterType.addEventListener('change', applyMonsterFilters);
        
        console.log("Monster search functionality set up");
    } else {
        console.warn("Monster search elements not found");
    }
}

/**
 * Show item details in a modal
 * @param {Object} item - Item object
 */
function showItemDetails(item) {
    if (!window.modalHandler) {
        console.error("Modal handler not available");
        return;
    }
    
    console.log(`Showing details for item: ${item.name}`);
    
    const content = `
        <div class="item-detail-content">
            <div class="item-detail-image">
                <img src="${item.image || 'assets/images/placeholder.js'}" alt="${item.name}">
            </div>
            
            <div class="item-detail-info">
                <h2 class="item-detail-name">${item.name}</h2>
                <div class="item-detail-meta">
                    <p><strong>Type:</strong> ${item.type || 'Unknown'}</p>
                    <p><strong>Rarity:</strong> <span class="rarity-${item.rarity.toLowerCase()}">${item.rarity || 'Unknown'}</span></p>
                    <p><strong>Value:</strong> ${item.value || 'Unknown'}</p>
                    ${item.location ? `<p><strong>Location:</strong> ${item.location}</p>` : ''}
                </div>
                
                <div class="item-detail-description">
                    <h3>Description</h3>
                    <p>${item.description || 'No description available.'}</p>
                </div>
            </div>
        </div>
    `;
    
    window.modalHandler.showModal(item.name, content);
}

/**
 * Show monster details in a modal
 * @param {Object} monster - Monster object
 */
function showMonsterDetails(monster) {
    if (!window.modalHandler) {
        console.error("Modal handler not available");
        return;
    }
    
    console.log(`Showing details for monster: ${monster.name}`);
    
    let abilitiesHtml = '';
    if (monster.abilities && monster.abilities.length > 0) {
        abilitiesHtml = `
            <div class="monster-detail-abilities">
                <h3>Abilities</h3>
                <ul>
                    ${monster.abilities.map(ability => `
                        <li>
                            <strong>${ability.name || 'Unknown Ability'}:</strong> ${ability.description || 'No description available.'}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    let actionsHtml = '';
    if (monster.actions && monster.actions.length > 0) {
        actionsHtml = `
            <div class="monster-detail-actions">
                <h3>Actions</h3>
                <ul>
                    ${monster.actions.map(action => `
                        <li>
                            <strong>${action.name || 'Unknown Action'}:</strong> ${action.description || 'No description available.'}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    const content = `
        <div class="monster-detail-content">
            <div class="monster-detail-image">
                <img src="${monster.imageUrl || 'assets/images/placeholder.js'}" alt="${monster.name}">
            </div>
            
            <div class="monster-detail-info">
                <h2 class="monster-detail-name">${monster.name}</h2>
                <p class="monster-detail-description">${monster.description || 'No description available.'}</p>
                
                <div class="monster-detail-stats">
                    <h3>Stats</h3>
                    <p><strong>Size:</strong> ${monster.size || 'Unknown'}</p>
                    <p><strong>Type:</strong> ${monster.type || 'Unknown'}</p>
                    <p><strong>Alignment:</strong> ${monster.alignment || 'Unknown'}</p>
                    <p><strong>Armor Class:</strong> ${monster.armorClass || 'Unknown'}</p>
                    <p><strong>Hit Points:</strong> ${monster.hitPoints || 'Unknown'}</p>
                    <p><strong>Speed:</strong> ${monster.speed || 'Unknown'}</p>
                </div>
                
                ${abilitiesHtml}
                ${actionsHtml}
            </div>
        </div>
    `;
    
    window.modalHandler.showModal(monster.name, content);
}

/**
 * Display an error message to the user
 * @param {string} message - Error message
 */
function displayError(message) {
    console.error(`Error: ${message}`);
    
    if (window.modalHandler) {
        window.modalHandler.showModal('Error', `
            <div class="error-message">
                <p>${message}</p>
                <p>Please try reloading the page or check the console for more information.</p>
            </div>
        `);
    } else {
        alert(`Error: ${message}`);
    }
}
/**
 * Initialize the Legacy Weapon Creator component
 */
function initializelegacyWeaponCreator() {
    console.log("Initializing Legacy Weapon Creator...");
    
    try {
        // Wait a moment for any scripts to load
        setTimeout(() => {
            // Re-initialize any scripts that were part of the legacyWeapon.html
            // Since scripts don't automatically run when loaded via innerHTML
            
            // Attempt to get key elements
            const baseWeaponSelect = document.getElementById('baseWeaponSelect');
            const weaponNameInput = document.getElementById('weaponNameInput');
            const nextBtn = document.getElementById('nextBtn');
            
            if (baseWeaponSelect && nextBtn) {
                console.log("Found Legacy Weapon Creator elements - setting up");
                
                // Add any necessary event listeners or rerun initialization code
                // This will depend on how your legacyWeapon.html is structured
                
                // For example, if your legacyWeapon.html had initialization code:
                if (typeof populateBaseWeapons === 'function') {
                    populateBaseWeapons();
                    console.log("Populated base weapons");
                }
                
                if (typeof attachEventListeners === 'function') {
                    attachEventListeners();
                    console.log("Attached event listeners");
                }
            } else {
                console.warn("Legacy Weapon Creator elements not found - may need to re-evaluate HTML structure");
            }
        }, 100);
        
        console.log("Legacy Weapon Creator initialization scheduled");
    } catch (error) {
        console.error("Error initializing Legacy Weapon Creator:", error);
    }
}