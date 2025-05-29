/**
 * AlchemyTracker Component
 * Allows tracking of alchemy ingredients and recipes from the handbook
 */
class AlchemyTracker {
  constructor() {
    this.inventory = this.loadInventory();
    this.recipes = this.loadRecipes();
    this.trackerElement = document.getElementById('alchemy-tracker');
    this.tabsElement = document.getElementById('alchemy-tabs');
    this.contentElement = document.getElementById('alchemy-content');
  }
  
  /**
   * Initialize the alchemy tracker component
   */
  initialize() {
    if (!this.trackerElement) {
      console.error('Alchemy tracker element not found in DOM');
      return;
    }
    
    this.renderTabs();
    this.renderContent();
    this.attachEventListeners();
    
    // Set default tab to active
    if (this.tabsElement.children.length > 0) {
      this.tabsElement.children[0].classList.add('active');
      this.showTabContent('ingredients');
    }
  }
  
  /**
   * Render the tabs for the alchemy tracker
   */
  renderTabs() {
    const tabs = [
      { id: 'ingredients', label: 'Ingredients' },
      { id: 'recipes', label: 'Recipes' },
      { id: 'crafting', label: 'Crafting' }
    ];
    
    // Clear existing tabs
    this.tabsElement.innerHTML = '';
    
    // Create tab elements
    tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = 'alchemy-tab';
      tabElement.dataset.tab = tab.id;
      tabElement.textContent = tab.label;
      
      // Add click handler
      tabElement.addEventListener('click', () => {
        // Set active tab
        Array.from(this.tabsElement.children).forEach(t => 
          t.classList.remove('active'));
        tabElement.classList.add('active');
        
        // Show corresponding content
        this.showTabContent(tab.id);
      });
      
      this.tabsElement.appendChild(tabElement);
    });
  }
  
  /**
   * Render the content areas for each tab
   */
  renderContent() {
    // Clear existing content
    this.contentElement.innerHTML = '';
    
    // Create content sections for each tab
    const contentSections = [
      { id: 'ingredients', content: this.renderIngredientsContent() },
      { id: 'recipes', content: this.renderRecipesContent() },
      { id: 'crafting', content: this.renderCraftingContent() }
    ];
    
    contentSections.forEach(section => {
      const sectionElement = document.createElement('div');
      sectionElement.className = 'alchemy-content-section';
      sectionElement.id = `alchemy-${section.id}`;
      sectionElement.innerHTML = section.content;
      
      // Hide all sections initially
      sectionElement.style.display = 'none';
      
      this.contentElement.appendChild(sectionElement);
    });
  }
  
  /**
   * Show content for a specific tab
   * @param {string} tabId - The ID of the tab to show
   */
  showTabContent(tabId) {
    // Hide all content sections
    Array.from(this.contentElement.children).forEach(section => {
      section.style.display = 'none';
    });
    
    // Show selected content section
    const targetSection = document.getElementById(`alchemy-${tabId}`);
    if (targetSection) {
      targetSection.style.display = 'block';
      
      // Add animation class
      targetSection.classList.add('fade-in');
      setTimeout(() => {
        targetSection.classList.remove('fade-in');
      }, 500);
    }
  }
  
  /**
   * Render the content for the ingredients tab
   * @returns {string} HTML content for ingredients tab
   */
  renderIngredientsContent() {
    // Get ingredients from inventory
    const ingredients = this.inventory.filter(item => 
      item.type === 'ingredient' || item.type === 'crafting material');
    
    // If no ingredients, show placeholder
    if (ingredients.length === 0) {
      return `
        <div class="empty-state">
          <img src="assets/images/empty-potion.svg" alt="No ingredients">
          <p>You haven't collected any ingredients yet.</p>
          <p>Explore the handbook to discover ingredients!</p>
        </div>
      `;
    }
    
    // Otherwise, show ingredients list
    let html = `
      <div class="ingredients-list">
        <div class="ingredients-header">
          <h3>Your Ingredients</h3>
          <div class="ingredients-controls">
            <button id="add-ingredient-btn" class="btn">
              <i class="fas fa-plus"></i> Add New
            </button>
            <input type="text" id="ingredient-search" placeholder="Search ingredients...">
          </div>
        </div>
        <table class="ingredients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Rarity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add each ingredient
    ingredients.forEach(ingredient => {
      html += `
        <tr data-ingredient-id="${ingredient.id}">
          <td>${ingredient.name}</td>
          <td>${ingredient.type}</td>
          <td>
            <div class="quantity-control">
              <button class="quantity-btn minus" data-action="decrease">-</button>
              <span class="quantity-value">${ingredient.quantity || 0}</span>
              <button class="quantity-btn plus" data-action="increase">+</button>
            </div>
          </td>
          <td>${ingredient.rarity || 'Common'}</td>
          <td>
            <button class="info-btn" data-ingredient-id="${ingredient.id}">
              <i class="fas fa-info-circle"></i>
            </button>
            <button class="delete-btn" data-ingredient-id="${ingredient.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Render the content for the recipes tab
   * @returns {string} HTML content for recipes tab
   */
  renderRecipesContent() {
    // If no recipes, show placeholder
    if (this.recipes.length === 0) {
      return `
        <div class="empty-state">
          <img src="assets/images/empty-scroll.svg" alt="No recipes">
          <p>You haven't discovered any recipes yet.</p>
          <p>Explore the handbook to find new recipes!</p>
        </div>
      `;
    }
    
    // Otherwise, show recipes list
    let html = `
      <div class="recipes-list">
        <div class="recipes-header">
          <h3>Known Recipes</h3>
          <div class="recipes-controls">
            <input type="text" id="recipe-search" placeholder="Search recipes...">
            <select id="recipe-filter">
              <option value="all">All Types</option>
              <option value="potion">Potions</option>
              <option value="item">Items</option>
              <option value="enchantment">Enchantments</option>
            </select>
          </div>
        </div>
        <div class="recipe-cards">
    `;
    
    // Add each recipe card
    this.recipes.forEach(recipe => {
      // Check if recipe can be crafted
      const canCraft = this.canCraftRecipe(recipe);
      
      html += `
        <div class="recipe-card ${canCraft ? 'available' : 'unavailable'}" data-recipe-id="${recipe.id}">
          <div class="recipe-header">
            <h4>${recipe.name}</h4>
            <span class="recipe-type">${recipe.type}</span>
          </div>
          <div class="recipe-body">
            <p class="recipe-description">${recipe.description}</p>
            <div class="recipe-ingredients">
              <h5>Required Ingredients:</h5>
              <ul>
      `;
      
      // Add ingredients list for recipe
      recipe.ingredients.forEach(ingredient => {
        const hasEnough = this.hasEnoughIngredient(ingredient);
        html += `
          <li class="${hasEnough ? 'has-enough' : 'not-enough'}">
            ${ingredient.name} (${ingredient.quantity})
            ${hasEnough ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
          </li>
        `;
      });
      
      html += `
              </ul>
            </div>
          </div>
          <div class="recipe-footer">
            <button class="craft-btn" ${canCraft ? '' : 'disabled'} data-recipe-id="${recipe.id}">
              ${canCraft ? 'Craft' : 'Missing Ingredients'}
            </button>
            <button class="info-btn" data-recipe-id="${recipe.id}">
              <i class="fas fa-info-circle"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Render the content for the crafting tab
   * @returns {string} HTML content for crafting tab
   */
  renderCraftingContent() {
    return `
      <div class="crafting-area">
        <div class="crafting-instructions">
          <h3>Crafting Workshop</h3>
          <p>Select a recipe from the Recipes tab to begin crafting, or create a custom item below.</p>
        </div>
        
        <div class="crafting-workshop">
          <div class="workshop-left">
            <h4>Custom Creation</h4>
            <div class="custom-crafting-form">
              <div class="form-group">
                <label for="custom-item-name">Item Name</label>
                <input type="text" id="custom-item-name" placeholder="Enter item name...">
              </div>
              
              <div class="form-group">
                <label for="custom-item-type">Item Type</label>
                <select id="custom-item-type">
                  <option value="potion">Potion</option>
                  <option value="scroll">Scroll</option>
                  <option value="enchantment">Enchantment</option>
                  <option value="diaper">Diaper</option>
                  <option value="wondrous">Wondrous Item</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="custom-item-rarity">Rarity</label>
                <select id="custom-item-rarity">
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="very-rare">Very Rare</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="custom-item-description">Description</label>
                <textarea id="custom-item-description" 
                  placeholder="Enter a description for your creation..."></textarea>
              </div>
              
              <div class="form-group ingredients-selector">
                <label>Select Ingredients</label>
                <div class="selected-ingredients" id="selected-ingredients">
                  <p class="empty-ingredients">No ingredients selected</p>
                </div>
                <button id="add-ingredient-selector-btn" class="btn">
                  <i class="fas fa-plus"></i> Add Ingredient
                </button>
              </div>
              
              <button id="create-custom-item-btn" class="btn primary-btn">
                Create Item
              </button>
            </div>
          </div>
          
          <div class="workshop-right">
            <h4>Current Project</h4>
            <div class="current-project" id="current-project">
              <div class="empty-project">
                <p>No project selected</p>
                <p>Select a recipe or start a custom creation</p>
              </div>
            </div>
            
            <div class="crafting-history">
              <h4>Crafting History</h4>
              <div class="history-items" id="crafting-history-items">
                <p class="empty-history">No crafting history yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Check if a recipe can be crafted based on available ingredients
   * @param {Object} recipe - Recipe object
   * @returns {boolean} Whether the recipe can be crafted
   */
  canCraftRecipe(recipe) {
    if (!recipe || !recipe.ingredients) return false;
    
    return recipe.ingredients.every(ingredient => 
      this.hasEnoughIngredient(ingredient));
  }
  
  /**
   * Check if there's enough of a specific ingredient
   * @param {Object} requiredIngredient - Required ingredient object
   * @returns {boolean} Whether there's enough of the ingredient
   */
  hasEnoughIngredient(requiredIngredient) {
    const inventoryItem = this.inventory.find(item => 
      item.id === requiredIngredient.id || item.name === requiredIngredient.name);
    
    if (!inventoryItem) return false;
    
    return (inventoryItem.quantity || 0) >= requiredIngredient.quantity;
  }
  
  /**
   * Attach event listeners for the alchemy tracker
   */
  attachEventListeners() {
    // Add ingredient button
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if (addIngredientBtn) {
      addIngredientBtn.addEventListener('click', () => {
        this.showAddIngredientModal();
      });
    }
    
    // Quantity control buttons
    this.contentElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('quantity-btn')) {
        const action = e.target.dataset.action;
        const row = e.target.closest('tr');
        const ingredientId = row.dataset.ingredientId;
        const quantityElement = row.querySelector('.quantity-value');
        
        if (action === 'increase') {
          this.updateIngredientQuantity(ingredientId, 1);
          quantityElement.textContent = parseInt(quantityElement.textContent) + 1;
        } else if (action === 'decrease') {
          if (parseInt(quantityElement.textContent) > 0) {
            this.updateIngredientQuantity(ingredientId, -1);
            quantityElement.textContent = parseInt(quantityElement.textContent) - 1;
          }
        }
      }
    });
    
    // Info buttons
    this.contentElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('info-btn') || 
          e.target.closest('.info-btn')) {
        const button = e.target.classList.contains('info-btn') ? 
          e.target : e.target.closest('.info-btn');
        
        if (button.dataset.ingredientId) {
          this.showIngredientInfoModal(button.dataset.ingredientId);
        } else if (button.dataset.recipeId) {
          this.showRecipeInfoModal(button.dataset.recipeId);
        }
      }
    });
    
    // Delete buttons
    this.contentElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn') || 
          e.target.closest('.delete-btn')) {
        const button = e.target.classList.contains('delete-btn') ? 
          e.target : e.target.closest('.delete-btn');
        
        if (button.dataset.ingredientId) {
          this.deleteIngredient(button.dataset.ingredientId);
          // Remove row from table
          const row = button.closest('tr');
          if (row) {
            row.remove();
          }
        }
      }
    });
    
    // Craft buttons
    this.contentElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('craft-btn')) {
        const recipeId = e.target.dataset.recipeId;
        if (recipeId) {
          this.craftRecipe(recipeId);
        }
      }
    });
    
    // Search ingredients
    const ingredientSearch = document.getElementById('ingredient-search');
    if (ingredientSearch) {
      ingredientSearch.addEventListener('input', (e) => {
        this.searchIngredients(e.target.value);
      });
    }
    
    // Search recipes
    const recipeSearch = document.getElementById('recipe-search');
    if (recipeSearch) {
      recipeSearch.addEventListener('input', (e) => {
        this.searchRecipes(e.target.value);
      });
    }
    
    // Filter recipes
    const recipeFilter = document.getElementById('recipe-filter');
    if (recipeFilter) {
      recipeFilter.addEventListener('change', (e) => {
        this.filterRecipes(e.target.value);
      });
    }
    
    // Custom crafting
    const createCustomItemBtn = document.getElementById('create-custom-item-btn');
    if (createCustomItemBtn) {
      createCustomItemBtn.addEventListener('click', () => {
        this.createCustomItem();
      });
    }
    
    // Add ingredient to custom crafting
    const addIngredientSelectorBtn = document.getElementById('add-ingredient-selector-btn');
    if (addIngredientSelectorBtn) {
      addIngredientSelectorBtn.addEventListener('click', () => {
        this.showIngredientSelectorModal();
      });
    }
  }
  
  /**
   * Show modal for adding a new ingredient
   */
  showAddIngredientModal() {
    // Implementation for adding a new ingredient
    console.log('Show add ingredient modal');
    // Here you'd show a modal with a form to add a new ingredient
    
    const modalHandler = window.modalHandler;
    if (modalHandler) {
      const content = `
        <div class="add-ingredient-form">
          <div class="form-group">
            <label for="new-ingredient-name">Name</label>
            <input type="text" id="new-ingredient-name" placeholder="Ingredient name">
          </div>
          
          <div class="form-group">
            <label for="new-ingredient-type">Type</label>
            <select id="new-ingredient-type">
              <option value="ingredient">Basic Ingredient</option>
              <option value="crafting material">Crafting Material</option>
              <option value="reagent">Reagent</option>
              <option value="herb">Herb</option>
              <option value="mineral">Mineral</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="new-ingredient-quantity">Quantity</label>
            <input type="number" id="new-ingredient-quantity" min="1" value="1">
          </div>
          
          <div class="form-group">
            <label for="new-ingredient-rarity">Rarity</label>
            <select id="new-ingredient-rarity">
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Very Rare">Very Rare</option>
              <option value="Legendary">Legendary</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="new-ingredient-description">Description</label>
            <textarea id="new-ingredient-description" 
              placeholder="Describe the ingredient..."></textarea>
          </div>
          
          <div class="form-actions">
            <button id="save-new-ingredient" class="btn primary-btn">Add Ingredient</button>
            <button id="cancel-new-ingredient" class="btn">Cancel</button>
          </div>
        </div>
      `;
      
      modalHandler.showModal('Add New Ingredient', content);
      
      // Set up event listeners for the modal buttons
      setTimeout(() => {
        document.getElementById('save-new-ingredient').addEventListener('click', () => {
          this.addNewIngredient();
          modalHandler.hideModal();
        });
        
        document.getElementById('cancel-new-ingredient').addEventListener('click', () => {
          modalHandler.hideModal();
        });
      }, 0);
    }
  }
  
  /**
   * Add a new ingredient based on modal form values
   */
  addNewIngredient() {
    const name = document.getElementById('new-ingredient-name').value;
    const type = document.getElementById('new-ingredient-type').value;
    const quantity = parseInt(document.getElementById('new-ingredient-quantity').value);
    const rarity = document.getElementById('new-ingredient-rarity').value;
    const description = document.getElementById('new-ingredient-description').value;
    
    if (!name) {
      return; // Don't add if no name provided
    }
    
    const newIngredient = {
      id: this.generateId(),
      name,
      type,
      quantity: isNaN(quantity) ? 1 : quantity,
      rarity,
      description
    };
    
    // Add to inventory
    this.inventory.push(newIngredient);
    this.saveInventory();
    
    // Refresh the ingredients tab content
    document.getElementById('alchemy-ingredients').innerHTML = this.renderIngredientsContent();
    this.attachEventListeners();
  }
  
  /**
   * Update the quantity of an ingredient
   * @param {string} ingredientId - ID of the ingredient
   * @param {number} change - Amount to change (positive or negative)
   */
  updateIngredientQuantity(ingredientId, change) {
    const ingredient = this.inventory.find(item => item.id === ingredientId);
    if (ingredient) {
      ingredient.quantity = (ingredient.quantity || 0) + change;
      if (ingredient.quantity < 0) ingredient.quantity = 0;
      this.saveInventory();
    }
  }
  
  /**
   * Delete an ingredient from the inventory
   * @param {string} ingredientId - ID of the ingredient to delete
   */
  deleteIngredient(ingredientId) {
    const index = this.inventory.findIndex(item => item.id === ingredientId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
      this.saveInventory();
    }
  }
  
  /**
   * Show modal with ingredient information
   * @param {string} ingredientId - ID of the ingredient
   */
  showIngredientInfoModal(ingredientId) {
    const ingredient = this.inventory.find(item => item.id === ingredientId);
    if (!ingredient || !window.modalHandler) return;
    
    const content = `
      <div class="ingredient-detail">
        <h3>${ingredient.name}</h3>
        <p><strong>Type:</strong> ${ingredient.type}</p>
        <p><strong>Rarity:</strong> ${ingredient.rarity || 'Common'}</p>
        <p><strong>Quantity:</strong> ${ingredient.quantity || 0}</p>
        
        ${ingredient.description ? `
          <div class="ingredient-description">
            <h4>Description</h4>
            <p>${ingredient.description}</p>
          </div>
        ` : ''}
        
        <h4>Used In Recipes:</h4>
        <ul class="used-in-recipes">
          ${this.getRecipesUsingIngredient(ingredientId).map(recipe => 
            `<li>${recipe.name}</li>`).join('') || '<li>No recipes yet</li>'}
        </ul>
      </div>
    `;
    
    window.modalHandler.showModal(`Ingredient: ${ingredient.name}`, content);
  }
  
  /**
   * Get recipes that use a specific ingredient
   * @param {string} ingredientId - ID of the ingredient
   * @returns {Array} Array of recipes using this ingredient
   */
  getRecipesUsingIngredient(ingredientId) {
    return this.recipes.filter(recipe => 
      recipe.ingredients.some(i => i.id === ingredientId));
  }
  
  /**
   * Show modal with recipe information
   * @param {string} recipeId - ID of the recipe
   */
  showRecipeInfoModal(recipeId) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe || !window.modalHandler) return;
    
    const content = `
      <div class="recipe-detail">
        <h3>${recipe.name}</h3>
        <p><strong>Type:</strong> ${recipe.type}</p>
        <p><strong>Rarity:</strong> ${recipe.rarity || 'Common'}</p>
        
        <div class="recipe-description">
          <h4>Description</h4>
          <p>${recipe.description}</p>
        </div>
        
        <h4>Required Ingredients:</h4>
        <ul class="required-ingredients">
          ${recipe.ingredients.map(ingredient => {
            const hasEnough = this.hasEnoughIngredient(ingredient);
            return `
              <li class="${hasEnough ? 'has-enough' : 'not-enough'}">
                ${ingredient.name} (${ingredient.quantity})
                ${hasEnough ? 
                  '<span class="status-icon available">✓</span>' : 
                  '<span class="status-icon unavailable">✗</span>'}
              </li>
            `;
          }).join('')}
        </ul>
        
        <div class="recipe-effects">
          <h4>Effects</h4>
          <p>${recipe.effects || 'No special effects'}</p>
        </div>
      </div>
    `;
    
    window.modalHandler.showModal(`Recipe: ${recipe.name}`, content);
  }
  
  /**
   * Craft a recipe
   * @param {string} recipeId - ID of the recipe to craft
   */
  craftRecipe(recipeId) {
    const recipe = this.recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    // Check if all ingredients are available
    if (!this.canCraftRecipe(recipe)) {
      console.log('Cannot craft recipe - missing ingredients');
      return;
    }
    
    // Consume ingredients
    recipe.ingredients.forEach(ingredient => {
      const inventoryIngredient = this.inventory.find(item => 
        item.id === ingredient.id || item.name === ingredient.name);
      
      if (inventoryIngredient) {
        inventoryIngredient.quantity -= ingredient.quantity;
        if (inventoryIngredient.quantity <= 0) {
          this.deleteIngredient(inventoryIngredient.id);
        }
      }
    });
    
    // Save changes to inventory
    this.saveInventory();
    
    // Add crafted item to inventory
    const craftedItem = {
      id: this.generateId(),
      name: recipe.name,
      type: recipe.type,
      quantity: 1,
      rarity: recipe.rarity || 'Common',
      description: recipe.description,
      effects: recipe.effects
    };
    
    this.inventory.push(craftedItem);
    this.saveInventory();
    
    // Add to crafting history
    this.addCraftingHistoryEntry(recipe);
    
    // Show success modal
    if (window.modalHandler) {
      const content = `
        <div class="crafting-success">
          <div class="success-icon">
            <i class="fas fa-flask"></i>
          </div>
          <h3>Crafting Successful!</h3>
          <p>You have successfully crafted <strong>${recipe.name}</strong>.</p>
          <p>The item has been added to your inventory.</p>
        </div>
      `;
      
      window.modalHandler.showModal('Crafting Complete', content);
    }
    
    // Refresh content
    this.renderTabs();
    this.renderContent();
    this.attachEventListeners();
    
    // Show the ingredients tab
    this.showTabContent('ingredients');
    Array.from(this.tabsElement.children).forEach((tab, index) => {
      if (index === 0) tab.classList.add('active');
      else tab.classList.remove('active');
    });
  }
  
  /**
   * Add an entry to the crafting history
   * @param {Object} recipe - The crafted recipe
   */
  addCraftingHistoryEntry(recipe) {
    // Implementation for tracking crafting history
    console.log('Add crafting history entry for', recipe.name);
    
    // You would typically save this to localStorage or another storage mechanism
    const historyElement = document.getElementById('crafting-history-items');
    if (historyElement) {
      // Remove empty history message if present
      const emptyHistory = historyElement.querySelector('.empty-history');
      if (emptyHistory) {
        emptyHistory.remove();
      }
      
      const entry = document.createElement('div');
      entry.className = 'history-entry';
      entry.innerHTML = `
        <span class="history-time">${new Date().toLocaleTimeString()}</span>
        <span class="history-item">${recipe.name}</span>
        <span class="history-type">${recipe.type}</span>
      `;
      
      historyElement.appendChild(entry);
    }
  }
  
  /**
   * Search ingredients by name
   * @param {string} query - Search query
   */
  searchIngredients(query) {
    const rows = document.querySelectorAll('#alchemy-ingredients .ingredients-table tbody tr');
    const lowercaseQuery = query.toLowerCase();
    
    rows.forEach(row => {
      const name = row.querySelector('td:first-child').textContent.toLowerCase();
      if (name.includes(lowercaseQuery) || query === '') {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  /**
   * Search recipes by name
   * @param {string} query - Search query
   */
  searchRecipes(query) {
    const cards = document.querySelectorAll('#alchemy-recipes .recipe-card');
    const lowercaseQuery = query.toLowerCase();
    
    cards.forEach(card => {
      const name = card.querySelector('.recipe-header h4').textContent.toLowerCase();
      const description = card.querySelector('.recipe-description').textContent.toLowerCase();
      if (name.includes(lowercaseQuery) || 
          description.includes(lowercaseQuery) || 
          query === '') {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  /**
   * Filter recipes by type
   * @param {string} type - Type to filter by
   */
  filterRecipes(type) {
    const cards = document.querySelectorAll('#alchemy-recipes .recipe-card');
    
    cards.forEach(card => {
      const recipeType = card.querySelector('.recipe-type').textContent.toLowerCase();
      if (type === 'all' || recipeType === type) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  /**
   * Show modal for selecting ingredients for custom crafting
   */
  showIngredientSelectorModal() {
    if (!window.modalHandler) return;
    
    // Get list of available ingredients
    const availableIngredients = this.inventory.filter(item => 
      item.quantity > 0);
    
    let content = '';
    
    if (availableIngredients.length === 0) {
      content = `
        <div class="empty-ingredients-modal">
          <p>You don't have any ingredients in your inventory.</p>
          <p>Collect ingredients first or add them from the Ingredients tab.</p>
        </div>
      `;
    } else {
      content = `
        <div class="ingredient-selector-modal">
          <p>Select ingredients to use in your custom creation:</p>
          
          <div class="ingredient-list">
            ${availableIngredients.map(ingredient => `
              <div class="ingredient-option" data-ingredient-id="${ingredient.id}">
                <div class="ingredient-option-details">
                  <span class="ingredient-option-name">${ingredient.name}</span>
                  <span class="ingredient-option-type">${ingredient.type}</span>
                  <span class="ingredient-option-quantity">Available: ${ingredient.quantity}</span>
                </div>
                <div class="ingredient-option-controls">
                  <label>Amount:</label>
                  <input type="number" class="ingredient-option-amount" 
                    min="1" max="${ingredient.quantity}" value="1">
                  <button class="add-to-custom" data-ingredient-id="${ingredient.id}">
                    Add
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="modal-footer">
            <button id="done-selecting-ingredients" class="btn primary-btn">Done</button>
          </div>
        </div>
      `;
    }
    
    window.modalHandler.showModal('Select Ingredients', content);
    
    // Add event listeners
    setTimeout(() => {
      document.querySelectorAll('.add-to-custom').forEach(button => {
        button.addEventListener('click', (e) => {
          const ingredientId = e.target.dataset.ingredientId;
          const ingredient = this.inventory.find(i => i.id === ingredientId);
          if (!ingredient) return;
          
          const amountInput = e.target.parentElement.querySelector('.ingredient-option-amount');
          const amount = parseInt(amountInput.value);
          
          if (isNaN(amount) || amount <= 0 || amount > ingredient.quantity) {
            return;
          }
          
          // Add to selected ingredients
          this.addIngredientToCustomCrafting(ingredient, amount);
        });
      });
      
      const doneButton = document.getElementById('done-selecting-ingredients');
      if (doneButton) {
        doneButton.addEventListener('click', () => {
          window.modalHandler.hideModal();
        });
      }
    }, 0);
  }
  
  /**
   * Add an ingredient to the custom crafting selection
   * @param {Object} ingredient - The ingredient to add
   * @param {number} amount - Amount to use
   */
  addIngredientToCustomCrafting(ingredient, amount) {
    const selectedIngredientsContainer = document.getElementById('selected-ingredients');
    if (!selectedIngredientsContainer) return;
    
    // Remove empty message if present
    const emptyMessage = selectedIngredientsContainer.querySelector('.empty-ingredients');
    if (emptyMessage) {
      emptyMessage.remove();
    }
    
    // Check if this ingredient is already added
    const existingItem = selectedIngredientsContainer.querySelector(
      `[data-ingredient-id="${ingredient.id}"]`);
    
    if (existingItem) {
      // Update existing item
      const quantityElement = existingItem.querySelector('.selected-ingredient-amount');
      const currentAmount = parseInt(quantityElement.textContent);
      const newAmount = currentAmount + amount;
      
      if (newAmount <= ingredient.quantity) {
        quantityElement.textContent = newAmount;
      }
    } else {
      // Add new item
      const selectedIngredient = document.createElement('div');
      selectedIngredient.className = 'selected-ingredient';
      selectedIngredient.dataset.ingredientId = ingredient.id;
      selectedIngredient.innerHTML = `
        <span class="selected-ingredient-name">${ingredient.name}</span>
        <span class="selected-ingredient-amount">${amount}</span>
        <button class="remove-selected-ingredient" data-ingredient-id="${ingredient.id}">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      selectedIngredientsContainer.appendChild(selectedIngredient);
      
      // Add event listener for remove button
      selectedIngredient.querySelector('.remove-selected-ingredient')
        .addEventListener('click', () => {
          selectedIngredient.remove();
          
          // If no ingredients left, show empty message
          if (selectedIngredientsContainer.children.length === 0) {
            selectedIngredientsContainer.innerHTML = 
              '<p class="empty-ingredients">No ingredients selected</p>';
          }
        });
    }
  }
  
  /**
   * Create a custom item from the crafting workshop
   */
  createCustomItem() {
    const name = document.getElementById('custom-item-name').value;
    const type = document.getElementById('custom-item-type').value;
    const rarity = document.getElementById('custom-item-rarity').value;
    const description = document.getElementById('custom-item-description').value;
    
    // Validate input
    if (!name) {
      alert('Please enter a name for your item');
      return;
    }
    
    // Get selected ingredients
    const selectedIngredientsContainer = document.getElementById('selected-ingredients');
    const selectedIngredients = [];
    
    if (selectedIngredientsContainer) {
      const ingredientElements = selectedIngredientsContainer.querySelectorAll('.selected-ingredient');
      
      ingredientElements.forEach(element => {
        const ingredientId = element.dataset.ingredientId;
        const amount = parseInt(element.querySelector('.selected-ingredient-amount').textContent);
        const ingredient = this.inventory.find(i => i.id === ingredientId);
        
        if (ingredient && amount > 0) {
          selectedIngredients.push({
            id: ingredientId,
            name: ingredient.name,
            quantity: amount
          });
        }
      });
    }
    
    // Create custom item
    const customItem = {
      id: this.generateId(),
      name,
      type,
      rarity,
      description,
      quantity: 1,
      custom: true
    };
    
    // Add to inventory
    this.inventory.push(customItem);
    
    // Consume selected ingredients
    selectedIngredients.forEach(selectedIngredient => {
      const inventoryIngredient = this.inventory.find(i => i.id === selectedIngredient.id);
      
      if (inventoryIngredient) {
        inventoryIngredient.quantity -= selectedIngredient.quantity;
        
        if (inventoryIngredient.quantity <= 0) {
          this.deleteIngredient(inventoryIngredient.id);
        }
      }
    });
    
    // Save inventory
    this.saveInventory();
    
    // Reset form
    document.getElementById('custom-item-name').value = '';
    document.getElementById('custom-item-description').value = '';
    document.getElementById('selected-ingredients').innerHTML = 
      '<p class="empty-ingredients">No ingredients selected</p>';
    
    // Show success message
    if (window.modalHandler) {
      const content = `
        <div class="crafting-success">
          <div class="success-icon">
            <i class="fas fa-magic"></i>
          </div>
          <h3>Creation Successful!</h3>
          <p>You have successfully created <strong>${name}</strong>.</p>
          <p>The item has been added to your inventory.</p>
        </div>
      `;
      
      window.modalHandler.showModal('Custom Creation Complete', content);
    }
    
    // Add to crafting history
    const historyElement = document.getElementById('crafting-history-items');
    if (historyElement) {
      // Remove empty history message if present
      const emptyHistory = historyElement.querySelector('.empty-history');
      if (emptyHistory) {
        emptyHistory.remove();
      }
      
      const entry = document.createElement('div');
      entry.className = 'history-entry';
      entry.innerHTML = `
        <span class="history-time">${new Date().toLocaleTimeString()}</span>
        <span class="history-item">${name}</span>
        <span class="history-type">${type} (Custom)</span>
      `;
      
      historyElement.appendChild(entry);
    }
    
    // Refresh tabs
    this.renderTabs();
    this.renderContent();
    this.attachEventListeners();
  }
  
  /**
   * Generate a unique ID
   * @returns {string} A unique ID
   */
  generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Load inventory from localStorage
   * @returns {Array} Inventory array
   */
  loadInventory() {
    try {
      const storedInventory = localStorage.getItem('alchemyInventory');
      
      if (storedInventory) {
        return JSON.parse(storedInventory);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
    
    // Default inventory with some starter ingredients
    return [
      {
        id: this.generateId(),
        name: 'Bitter Balm',
        type: 'crafting material',
        quantity: 3,
        rarity: 'Uncommon',
        description: 'A waxy substance with a bitter taste. Used in potions that affect bodily functions.'
      },
      {
        id: this.generateId(),
        name: 'Matrix Malachite',
        type: 'crafting material',
        quantity: 1,
        rarity: 'Rare',
        description: 'A greenish crystal that resonates with magical energy. Essential for advanced enchantments.'
      },
      {
        id: this.generateId(),
        name: 'Adhesive',
        type: 'crafting material',
        quantity: 5,
        rarity: 'Common',
        description: 'A sticky substance that can be used in crafting to bind components together.'
      }
    ];
  }
  
  /**
   * Save inventory to localStorage
   */
  saveInventory() {
    try {
      localStorage.setItem('alchemyInventory', JSON.stringify(this.inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }
  
  /**
   * Load recipes from localStorage or default recipes
   * @returns {Array} Recipes array
   */
  loadRecipes() {
    try {
      const storedRecipes = localStorage.getItem('alchemyRecipes');
      
      if (storedRecipes) {
        return JSON.parse(storedRecipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    }
    
    // Default recipes
    return [
      {
        id: this.generateId(),
        name: 'Omni-Infusion Elixir',
        type: 'potion',
        rarity: 'Very Rare',
        description: 'A powerful elixir that enhances magical capabilities and bodily recovery.',
        effects: 'Increases spell damage by 10% for 1 hour and provides rapid healing.',
        ingredients: [
          {
            id: this.generateId(),
            name: 'Bitter Balm',
            quantity: 2
          },
          {
            id: this.generateId(),
            name: 'Matrix Malachite',
            quantity: 1
          }
        ]
      },
      {
        id: this.generateId(),
        name: 'Magibutter',
        type: 'crafting material',
        rarity: 'Uncommon',
        description: 'A magical butter-like substance that can be applied to skin for protection.',
        effects: 'Provides a +1 bonus to AC for 1 hour when applied.',
        ingredients: [
          {
            id: this.generateId(),
            name: 'Adhesive',
            quantity: 2
          },
          {
            id: this.generateId(),
            name: 'Bitter Balm',
            quantity: 1
          }
        ]
      }
    ];  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js / CommonJS environment
  module.exports = AlchemyTracker;
} else {
  // Browser environment - expose as global class
  window.AlchemyTracker = AlchemyTracker;
}
