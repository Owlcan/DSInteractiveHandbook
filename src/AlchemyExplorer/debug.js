// Debug helper for Alchemy & Expedition game

console.log("Debug helper loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug helper loaded');

    let __debugInitialized = false;
    function initializeDebugPanel() {
        if (__debugInitialized) return;
        __debugInitialized = true;
    
    // Fix for potential errors - check if required variables exist
    if (typeof ingredients === 'undefined') {
        console.error('Error: ingredients not defined! Check if ingredients.js is loaded properly.');
        alert('Debug error: ingredients.js not loaded properly. Check the console for details.');
        return;
    }
    
    if (typeof recipes === 'undefined') {
        console.error('Error: recipes not defined! Check if recipes.js is loaded properly.');
        alert('Debug error: recipes.js not loaded properly. Check the console for details.');
        return;
    }
    
    if (typeof playerInventory === 'undefined') {
        console.error('Error: playerInventory not defined! Check if ingredients.js is loaded properly and initializeInventory() is called.');
        alert('Debug error: playerInventory not initialized. Check the console for details.');
        return;
    }
    
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = '#fff';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.zIndex = '1000';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.maxHeight = '300px';
    debugPanel.style.overflowY = 'auto';
    debugPanel.style.maxWidth = '400px';
    debugPanel.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
    
    const debugTitle = document.createElement('h3');
    debugTitle.textContent = 'Debugging Info';
    debugTitle.style.margin = '0 0 10px 0';
    debugPanel.appendChild(debugTitle);
    
    const debugContent = document.createElement('div');
    debugContent.style.display = 'block'; // Ensure content is visible initially
    debugPanel.appendChild(debugContent);
    
    // Initial debug info - show basic stats
    debugContent.innerHTML = `
        <p>Total ingredients: ${ingredients.length}</p>
        <p>Total recipes: ${recipes.length}</p>
        <p>Click buttons below for more details</p>
    `;
    
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Hide Debug';
    toggleButton.style.marginTop = '10px';
    toggleButton.style.padding = '5px';
    toggleButton.style.backgroundColor = '#4e342e';
    toggleButton.style.color = '#fff';
    toggleButton.style.border = '1px solid #8d6e63';
    toggleButton.style.borderRadius = '3px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '5px';
    toggleButton.style.right = '5px';
    
    // Track collapsed state
    let panelCollapsed = false;
    
    toggleButton.addEventListener('click', function() {
        panelCollapsed = !panelCollapsed;
        
        if (panelCollapsed) {
            // Hide the entire panel except for a small tab
            debugPanel.style.transform = 'translateX(calc(100% - 40px))';
            debugPanel.style.opacity = '0.7';
            toggleButton.textContent = 'Show';
            
            // Hide all children except toggle button
            Array.from(debugPanel.children).forEach(child => {
                if (child !== toggleButton) {
                    child.style.display = 'none';
                }
            });
        } else {
            // Show the panel
            debugPanel.style.transform = 'translateX(0)';
            debugPanel.style.opacity = '1';
            toggleButton.textContent = 'Hide Debug';
            
            // Show all children
            Array.from(debugPanel.children).forEach(child => {
                if (child !== toggleButton) {
                    child.style.display = '';
                }
            });
            
            // Specifically ensure content display is block
            debugContent.style.display = 'block';
        }
    });
    
    // Add keyboard shortcut for toggle (Alt+D)
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 'd') {
            toggleButton.click();
        }
    });
    
    debugPanel.appendChild(toggleButton);
    document.body.appendChild(debugPanel);
    
    // Debug ingredients
    const checkIngredientsBtn = document.createElement('button');
    checkIngredientsBtn.textContent = 'Check Ingredients';
    checkIngredientsBtn.style.display = 'block';
    checkIngredientsBtn.style.marginTop = '5px';
    checkIngredientsBtn.style.padding = '5px';
    checkIngredientsBtn.style.backgroundColor = '#4e342e';
    checkIngredientsBtn.style.color = '#fff';
    checkIngredientsBtn.style.border = '1px solid #8d6e63';
    checkIngredientsBtn.style.borderRadius = '3px';
    checkIngredientsBtn.style.cursor = 'pointer';
    
    checkIngredientsBtn.addEventListener('click', function() {
        debugContent.innerHTML = '<h4>Ingredients</h4>';
        
        // Log all ingredients
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        
        // Header row
        const headerRow = table.insertRow();
        ['ID', 'Name', 'Image Path', 'Inventory'].forEach(text => {
            const cell = headerRow.insertCell();
            cell.textContent = text;
            cell.style.border = '1px solid #8d6e63';
            cell.style.padding = '3px';
            cell.style.fontWeight = 'bold';
        });
        
        // Data rows
        ingredients.forEach(ingredient => {
            const row = table.insertRow();
            
            const idCell = row.insertCell();
            idCell.textContent = ingredient.id;
            idCell.style.border = '1px solid #8d6e63';
            idCell.style.padding = '3px';
            
            const nameCell = row.insertCell();
            nameCell.textContent = ingredient.name;
            nameCell.style.border = '1px solid #8d6e63';
            nameCell.style.padding = '3px';
            
            const imgCell = row.insertCell();
            imgCell.textContent = ingredient.image || 'No image';
            imgCell.style.border = '1px solid #8d6e63';
            imgCell.style.padding = '3px';
            
            const invCell = row.insertCell();
            invCell.textContent = playerInventory[ingredient.id] || 0;
            invCell.style.border = '1px solid #8d6e63';
            invCell.style.padding = '3px';
        });
        
        debugContent.appendChild(table);
    });
    
    debugPanel.insertBefore(checkIngredientsBtn, toggleButton);
    
    // Add debug function for recipes
    const checkRecipesBtn = document.createElement('button');
    checkRecipesBtn.textContent = 'Check Recipes';
    checkRecipesBtn.style.display = 'block';
    checkRecipesBtn.style.marginTop = '5px';
    checkRecipesBtn.style.padding = '5px';
    checkRecipesBtn.style.backgroundColor = '#4e342e';
    checkRecipesBtn.style.color = '#fff';
    checkRecipesBtn.style.border = '1px solid #8d6e63';
    checkRecipesBtn.style.borderRadius = '3px';
    checkRecipesBtn.style.cursor = 'pointer';
    
    checkRecipesBtn.addEventListener('click', function() {
        debugContent.innerHTML = '<h4>Recipes</h4>';
        
        recipes.forEach((recipe, index) => {
            const recipeDiv = document.createElement('div');
            recipeDiv.style.marginBottom = '10px';
            recipeDiv.style.padding = '5px';
            recipeDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            recipeDiv.style.borderRadius = '3px';
            
            recipeDiv.innerHTML = `
                <strong>Recipe ${index + 1}: ${recipe.name}</strong><br>
                Ingredients: ${recipe.ingredients.join(', ')}<br>
                Exotic: ${recipe.exoticIngredient || 'None'}<br>
                Result image: ${recipe.result.image || 'None'}
            `;
            
            debugContent.appendChild(recipeDiv);
        });
    });
    
    debugPanel.insertBefore(checkRecipesBtn, toggleButton);
    
    // Test image loading
    const testImgBtn = document.createElement('button');
    testImgBtn.textContent = 'Test Image Loading';
    testImgBtn.style.display = 'block';
    testImgBtn.style.marginTop = '5px';
    testImgBtn.style.padding = '5px';
    testImgBtn.style.backgroundColor = '#4e342e';
    testImgBtn.style.color = '#fff';
    testImgBtn.style.border = '1px solid #8d6e63';
    testImgBtn.style.borderRadius = '3px';
    testImgBtn.style.cursor = 'pointer';
    
    testImgBtn.addEventListener('click', function() {
        debugContent.innerHTML = '<h4>Image Loading Test</h4>';
        
        ingredients.forEach(ingredient => {
            if (ingredient.image) {
                const imgDiv = document.createElement('div');
                imgDiv.style.marginBottom = '5px';
                
                const testImg = new Image();
                testImg.style.width = '30px';
                testImg.style.height = '30px';
                testImg.style.marginRight = '5px';
                testImg.style.verticalAlign = 'middle';
                testImg.style.border = '1px solid #8d6e63';
                testImg.alt = ingredient.name;
                
                // Test regular path
                testImg.src = ingredient.image;
                
                testImg.onload = function() {
                    imgDiv.style.color = 'green';
                    imgDiv.textContent += ' ✓ Loaded';
                };
                
                testImg.onerror = function() {
                    imgDiv.style.color = 'red';
                    imgDiv.textContent += ' ✗ Failed';
                    
                    // Try alternate path
                    const altImg = new Image();
                    altImg.style.width = '30px';
                    altImg.style.height = '30px';
                    altImg.style.marginRight = '5px';
                    altImg.style.verticalAlign = 'middle';
                    altImg.style.border = '1px solid #8d6e63';
                    
                    // Try with assets/images prefix
                    altImg.src = 'assets/images/' + ingredient.image;
                    imgDiv.appendChild(document.createElement('br'));
                    imgDiv.appendChild(document.createTextNode('Trying: assets/images/'));
                    imgDiv.appendChild(altImg);
                    
                    altImg.onload = function() {
                        imgDiv.appendChild(document.createTextNode(' ✓ Loaded with prefix'));
                        imgDiv.appendChild(document.createElement('br'));
                        imgDiv.appendChild(document.createTextNode('Fix: Update ingredients.js to use this path'));
                    };
                    
                    altImg.onerror = function() {
                        imgDiv.appendChild(document.createTextNode(' ✗ Failed with prefix'));
                    };
                };
                
                imgDiv.appendChild(testImg);
                imgDiv.appendChild(document.createTextNode(` ${ingredient.name}: ${ingredient.image}`));
                
                debugContent.appendChild(imgDiv);
            }
        });
    });
    
    debugPanel.insertBefore(testImgBtn, toggleButton);
    
    // Add the check image paths button
    const fixPathsBtn = document.createElement('button');
    fixPathsBtn.textContent = 'Fix Image Paths';
    fixPathsBtn.style.display = 'block';
    fixPathsBtn.style.marginTop = '5px';
    fixPathsBtn.style.padding = '5px';
    fixPathsBtn.style.backgroundColor = '#4e342e';
    fixPathsBtn.style.color = '#fff';
    fixPathsBtn.style.border = '1px solid #8d6e63';
    fixPathsBtn.style.borderRadius = '3px';
    fixPathsBtn.style.cursor = 'pointer';
    
    fixPathsBtn.addEventListener('click', function() {
        debugContent.innerHTML = '<h4>Attempting to fix image paths...</h4>';
        
        // This is just a simulation as we can't actually modify JS files from the browser
        debugContent.innerHTML += '<p>This would update the image paths in ingredients.js and recipes.js.</p>';
        debugContent.innerHTML += '<p>Since we can\'t modify files directly from JavaScript, do the following:</p>';
        debugContent.innerHTML += '<ul>';
        debugContent.innerHTML += '<li>Update image paths in ingredients.js to include "assets/images/" prefix, OR</li>';
        debugContent.innerHTML += '<li>Move all image files back to the root directory, OR</li>';
        debugContent.innerHTML += '<li>Modify app.js to add "assets/images/" prefix when loading images</li>';
        debugContent.innerHTML += '</ul>';
        
        // Show temporary path fix for testing
        debugContent.innerHTML += '<h4>Temporary path fix for testing:</h4>';
        debugContent.innerHTML += '<p>This will modify the image paths in memory for this session only:</p>';
        
        const fixButton = document.createElement('button');
        fixButton.textContent = 'Apply Temporary Fix';
        fixButton.style.padding = '5px';
        fixButton.style.backgroundColor = '#4caf50';
        fixButton.style.color = '#fff';
        fixButton.style.border = '1px solid #388e3c';
        fixButton.style.borderRadius = '3px';
        fixButton.style.cursor = 'pointer';
        
        fixButton.addEventListener('click', function() {
            // Modify image paths in memory
            ingredients.forEach(ingredient => {
                if (ingredient.image && !ingredient.image.includes('assets/images/')) {
                    ingredient.image = 'assets/images/' + ingredient.image;
                }
            });
            
            // Update recipe result images
            recipes.forEach(recipe => {
                if (recipe.result.image && !recipe.result.image.includes('assets/images/')) {
                    recipe.result.image = 'assets/images/' + recipe.result.image;
                }
            });
            
            debugContent.innerHTML += '<p style="color: green">✓ Image paths updated in memory!</p>';
            debugContent.innerHTML += '<p>Refresh ingredients drawer by clicking a category tab</p>';
        });
        
        debugContent.appendChild(fixButton);
    });
    
    debugPanel.insertBefore(fixPathsBtn, toggleButton);
    
    debugPanel.appendChild(testImgBtn);
    
    // Add sound testing section
    const testSoundsBtn = document.createElement('button');
    testSoundsBtn.textContent = 'Test Sounds';
    testSoundsBtn.style.display = 'block';
    testSoundsBtn.style.marginTop = '5px';
    testSoundsBtn.style.padding = '5px';
    testSoundsBtn.style.backgroundColor = '#4e342e';
    testSoundsBtn.style.color = '#fff';
    testSoundsBtn.style.border = '1px solid #8d6e63';
    testSoundsBtn.style.borderRadius = '3px';
    testSoundsBtn.style.cursor = 'pointer';
    
    testSoundsBtn.addEventListener('click', function() {
        debugContent.innerHTML = '<h4>Sound Testing Panel</h4>';
        
        const soundTests = [
            {
                name: 'Slot Place',
                id: 'slot-sound',
                action: (sound) => {
                    sound.preservesPitch = false;
                    sound.playbackRate = 1;
                    sound.currentTime = 0;
                    return sound.play();
                }
            },
            {
                name: 'Slot Remove',
                id: 'slot-sound',
                action: (sound) => {
                    sound.preservesPitch = false;
                    sound.playbackRate = 1;
                    sound.currentTime = 0;
                    // Play forward but at half speed for "remove" effect
                    // (since reverse playback isn't well supported)
                    sound.playbackRate = 0.5;
                    return sound.play();
                }
            },
            { name: 'Liquid Flow', id: 'liquid-flow-sound' },
            { name: 'Success', id: 'success-sound' },
            { name: 'Legendary Success', id: 'legendary-success-sound' },
            { name: 'Fail', id: 'fail-sound' }
        ];
        
        soundTests.forEach(test => {
            const testDiv = document.createElement('div');
            testDiv.style.marginBottom = '10px';
            
            const testButton = document.createElement('button');
            testButton.textContent = `Test ${test.name}`;
            testButton.style.padding = '5px 10px';
            testButton.style.marginRight = '10px';
            testButton.style.backgroundColor = '#8d6e63';
            testButton.style.color = '#fff';
            testButton.style.border = '1px solid #d4af37';
            testButton.style.borderRadius = '3px';
            testButton.style.cursor = 'pointer';
            
            const statusSpan = document.createElement('span');
            statusSpan.textContent = 'Ready';
            
            testButton.addEventListener('click', function() {
                const sound = document.getElementById(test.id);
                if (sound) {
                    // Reset sound properties
                    sound.currentTime = 0;
                    sound.volume = volumeSlider ? volumeSlider.value / 100 : 0.7;
                    
                    // Use custom action if provided, otherwise default play
                    const playPromise = test.action ? 
                        test.action(sound) : 
                        sound.play();
                    
                    playPromise.then(() => {
                        statusSpan.textContent = 'Playing';
                        statusSpan.style.color = '#4caf50';
                        setTimeout(() => {
                            statusSpan.textContent = 'Ready';
                            statusSpan.style.color = '';
                        }, sound.duration * 1000);
                    }).catch(e => {
                        statusSpan.textContent = 'Error: ' + e.message;
                        statusSpan.style.color = '#f44336';
                        console.error('Sound play failed:', e);
                    });
                } else {
                    statusSpan.textContent = 'Error: Sound not found';
                    statusSpan.style.color = '#f44336';
                }
            });
            
            testDiv.appendChild(testButton);
            testDiv.appendChild(statusSpan);
            debugContent.appendChild(testDiv);
        });
        
        // Add volume controls
        const volumeDiv = document.createElement('div');
        volumeDiv.style.marginTop = '20px';
        volumeDiv.innerHTML = '<h4>Volume Control</h4>';
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '70';
        volumeSlider.style.width = '200px';
        
        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = ' 70%';
        
        volumeSlider.addEventListener('input', function() {
            const volume = this.value / 100;
            volumeLabel.textContent = ` ${this.value}%`;
            
            // Update all audio elements
            document.querySelectorAll('audio').forEach(audio => {
                audio.volume = volume;
            });
        });
        
        volumeDiv.appendChild(volumeSlider);
        volumeDiv.appendChild(volumeLabel);
        debugContent.appendChild(volumeDiv);
    });
    
    debugPanel.insertBefore(testSoundsBtn, toggleButton);
    
    document.body.appendChild(debugPanel);

    // Create a debug button
    const debugBtn = document.createElement('button');
    debugBtn.textContent = "Debug Info";
    debugBtn.style.position = "fixed";
    debugBtn.style.bottom = "10px";
    debugBtn.style.right = "10px";
    debugBtn.style.zIndex = "9999";
    debugBtn.style.padding = "8px 15px";
    debugBtn.style.backgroundColor = "#4CAF50";
    debugBtn.style.color = "white";
    debugBtn.style.border = "none";
    debugBtn.style.borderRadius = "4px";
    document.body.appendChild(debugBtn);

    debugBtn.addEventListener('click', function() {
        displayDebugInfo();
    });

    function displayDebugInfo() {
        console.clear();
        console.group("Debugging Info");
        
        // Check for null DOM elements the app is trying to access
        const missingElements = checkMissingElements([
            { id: 'compendium-btn', name: 'Compendium Button' },
            { id: 'recipe-book-btn', name: 'Recipe Book Button' },
            { id: 'brew-btn', name: 'Brew/Craft Button' },
            { id: 'ingredients-container', name: 'Ingredients Container' },
            { id: 'result-chamber', name: 'Result Chamber' },
            { className: 'collapse-btn', name: 'Collapse Button' },
            { id: 'crafted-items-container', name: 'Crafted Items Container' },
            { className: 'ingredients-drawer', name: 'Ingredients Drawer' }
        ]);
        
        console.log("Missing DOM Elements:", missingElements);
        
        // Check localStorage
        checkLocalStorage();
        
        // Check ingredients data
        console.log("Ingredients loaded:", typeof ingredients !== 'undefined' ? ingredients.length : 'NOT LOADED');
        if (typeof ingredients !== 'undefined') {
            console.table(ingredients.map(i => ({
                ID: i.id,
                Name: i.name,
                "Image Path": i.image,
                Inventory: window.playerInventory ? window.playerInventory[i.id] || 0 : 'N/A'
            })));
        }
        
        // Check recipes data
        console.log("Recipes loaded:", typeof recipes !== 'undefined' ? recipes.length : 'NOT LOADED');
        
        console.groupEnd();
    }

    function checkMissingElements(elementsToCheck) {
        return elementsToCheck.filter(el => {
            if (el.id) {
                return !document.getElementById(el.id);
            } else if (el.className) {
                return document.getElementsByClassName(el.className).length === 0;
            }
            return true;
        }).map(el => el.name);
    }

    function checkLocalStorage() {
        try {
            console.group("LocalStorage Check");
            
            // List all localStorage keys
            console.log("All localStorage keys:", Object.keys(localStorage));
            
            // Check specific items
            const storageItems = [
                'playerInventory',
                'discoveredRecipes',
                'craftedInventory',
                'playerCraftedItems'
            ];
            
            storageItems.forEach(key => {
                try {
                    const value = localStorage.getItem(key);
                    console.log(`${key}:`, value ? JSON.parse(value) : 'not set');
                } catch (e) {
                    console.error(`Error parsing ${key}:`, e.message);
                    console.log(`Raw value:`, localStorage.getItem(key));
                }
            });
            
            console.groupEnd();
        } catch (e) {
            console.error("LocalStorage check failed:", e);
        }
    }

    // Run initial check
    setTimeout(displayDebugInfo, 1000);

    function checkForGhostElements() {
        const slotsContainer = document.querySelector('.slots-container');
        if (!slotsContainer) {
            console.error('Could not find slots container');
            return;
        }
    
        // Clear any previous highlighting
        document.querySelectorAll('.debug-highlight').forEach(el => {
            el.classList.remove('debug-highlight');
        });
    
        // Get all grid children
        const children = Array.from(slotsContainer.children);
        console.group('Grid Children Check');
        
        // Valid element IDs that should be in the grid
        const validIds = [
            'slot-a', 'slot-b', 'slot-c', 'slot-d', 'slot-e',
            'channel-a-b', 'channel-b-c', 'channel-c-d', 'channel-d-e',
            'result-chamber'
        ];
    
        // Check each child element
        const unexpectedElements = children.filter(child => {
            const isValid = validIds.includes(child.id) ||
                child.classList.contains('ingredient-slot') ||
                child.classList.contains('channel') ||
                child.classList.contains('result-chamber');
    
            // Log element details
            console.log(`Element: ${child.id || 'no-id'}`, {
                id: child.id,
                classes: Array.from(child.classList),
                gridArea: getComputedStyle(child).gridArea,
                display: getComputedStyle(child).display,
                position: getComputedStyle(child).position,
                isValid: isValid
            });
    
            // Highlight unexpected elements
            if (!isValid) {
                child.classList.add('debug-highlight');
                child.style.outline = '2px solid red';
                child.title = 'Unexpected grid element';
            }
    
            return !isValid;
        });
    
        console.log('Unexpected elements found:', unexpectedElements.length);
        if (unexpectedElements.length > 0) {
            console.warn('Found unexpected elements:', unexpectedElements);
            alert(`Found ${unexpectedElements.length} unexpected elements in the grid. Check the console for details and look for elements highlighted in red.`);
        } else {
            console.log('No ghost elements found. Grid layout is clean.');
            alert('No ghost elements found. Grid layout is clean.');
        }
        console.groupEnd();
    
        // Add temporary cleanup button if unexpected elements are found
        if (unexpectedElements.length > 0) {
            const cleanupBtn = document.createElement('button');
            cleanupBtn.textContent = 'Remove Ghost Elements';
            cleanupBtn.style.marginLeft = '10px';
            cleanupBtn.style.backgroundColor = '#f44336';
            cleanupBtn.style.color = 'white';
            cleanupBtn.onclick = () => {
                unexpectedElements.forEach(el => el.remove());
                cleanupBtn.remove();
                alert('Ghost elements removed. Check grid layout.');
            };
            document.getElementById('debug-menu').appendChild(cleanupBtn);
        }
    }
    
    // Add button to debug panel
    const checkGhostBtn = document.createElement('button');
    checkGhostBtn.textContent = 'Check Ghost Elements';
    checkGhostBtn.style.cssText = 'display: block; margin-top: 5px; padding: 5px; background-color: #4e342e; color: #fff; border: 1px solid #8d6e63; border-radius: 3px; cursor: pointer;';
    
    checkGhostBtn.addEventListener('click', checkForGhostElements);
    
    // Add button before toggle button
    debugPanel.insertBefore(checkGhostBtn, toggleButton);

    // Add styles for debug highlighting
    const style = document.createElement('style');
    style.textContent = `
        .debug-highlight {
            outline: 2px solid red !important;
            position: relative !important;
        }
        .debug-highlight::after {
            content: '!' !important;
            position: absolute !important;
            top: -10px !important;
            right: -10px !important;
            background: red !important;
            color: white !important;
            width: 20px !important;
            height: 20px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: bold !important;
            z-index: 1000 !important;
        }
    `;
    document.head.appendChild(style);

    function checkChannelAnimation() {
        const channels = ['channel-a-b', 'channel-b-c', 'channel-c-d', 'channel-d-e'];
        
        channels.forEach(channelId => {
            const channel = document.getElementById(channelId);
            if (channel) {
                // Check if channel has animation styles
                const style = window.getComputedStyle(channel);
                console.log(`Channel ${channelId}:`, {
                    hasAnimation: channel.querySelector('.channel-filled') !== null,
                    transition: style.transition,
                    animation: style.animation,
                    width: style.width,
                    overflow: style.overflow
                });
            } else {
                console.warn(`Channel ${channelId} not found`);
            }
        });
    }
    
    // Add button to debug panel
    const checkChannelBtn = document.createElement('button');
    checkChannelBtn.textContent = 'Check Channel Animation';
    checkChannelBtn.style.cssText = 'display: block; margin-top: 5px; padding: 5px; background-color: #4e342e; color: #fff; border: 1px solid #8d6e63; border-radius: 3px; cursor: pointer;';
    
    checkChannelBtn.addEventListener('click', checkChannelAnimation);
    
    // Add button before toggle button
    debugPanel.insertBefore(checkChannelBtn, toggleButton);
    }

    // Locked by default. Unlock by dispatching: window.dispatchEvent(new CustomEvent('craftingtools:debug-unlock'))
    if (!window.__CT_DEBUG_UNLOCKED__) {
        window.addEventListener('craftingtools:debug-unlock', function() {
            window.__CT_DEBUG_UNLOCKED__ = true;
            initializeDebugPanel();
        }, { once: true });
        window.__craftingToolsUnlockDebug = function() {
            window.__CT_DEBUG_UNLOCKED__ = true;
            initializeDebugPanel();
        };
        return;
    }

    initializeDebugPanel();
});