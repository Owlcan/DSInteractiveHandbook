/**
 * ModalHandler class for handling right-click context menus and modals
 * in the Interactive D&D Handbook
 */
class ModalHandler {
  constructor() {
    this.modalContainer = document.getElementById('modal-container');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalClose = document.getElementById('modal-close');
    
    // Set up event listeners
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.hideModal());
    }
    
    if (this.modalContainer) {
      this.modalContainer.addEventListener('click', (e) => {
        if (e.target === this.modalContainer) {
          this.hideModal();
        }
      });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal();
      }
    });
  }
  
  /**
   * Show a modal with the provided content
   * @param {string} title - Modal title
   * @param {string} content - Modal body content (HTML allowed)
   * @param {Object} position - Optional position for the modal
   */
  showModal(title, content, position = null) {
    if (!this.modalContainer || !this.modalTitle || !this.modalBody) {
      console.error('Modal elements not found in the DOM');
      return;
    }
    
    // Set modal content
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = content;
    
    // Show modal
    this.modalContainer.classList.remove('hidden');
    
    // Position the modal if coordinates are provided
    if (position) {
      const modalContent = document.getElementById('modal-content');
      
      // Ensure the modal stays within the viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = modalContent.offsetWidth;
      const modalHeight = modalContent.offsetHeight;
      
      let left = position.x;
      let top = position.y;
      
      // Adjust horizontal position if needed
      if (left + modalWidth > viewportWidth) {
        left = position.x - modalWidth;
      }
      
      // Adjust vertical position if needed
      if (top + modalHeight > viewportHeight) {
        top = position.y - modalHeight;
      }
      
      // Make sure modal is not positioned off-screen
      left = Math.max(0, Math.min(left, viewportWidth - modalWidth));
      top = Math.max(0, Math.min(top, viewportHeight - modalHeight));
      
      // Apply positioning
      modalContent.style.position = 'absolute';
      modalContent.style.left = `${left}px`;
      modalContent.style.top = `${top}px`;
      modalContent.style.transform = 'none';
    } else {
      // Center the modal if no position is specified
      const modalContent = document.getElementById('modal-content');
      modalContent.style.position = '';
      modalContent.style.left = '';
      modalContent.style.top = '';
      modalContent.style.transform = '';
    }
    
    // Add animation class
    document.getElementById('modal-content').classList.add('modal-appear');
  }
  
  /**
   * Hide the modal
   */
  hideModal() {
    if (this.modalContainer) {
      // Add fade-out animation
      const modalContent = document.getElementById('modal-content');
      modalContent.classList.add('modal-disappear');
      
      // Hide after animation completes
      setTimeout(() => {
        this.modalContainer.classList.add('hidden');
        modalContent.classList.remove('modal-appear');
        modalContent.classList.remove('modal-disappear');
      }, 300);
    }
  }
  
  /**
   * Create a context menu for right-click events
   * @param {MouseEvent} event - The right-click event
   * @param {Array} menuItems - Array of menu item objects with text and action properties
   */
  showContextMenu(event, menuItems) {
    event.preventDefault();
    
    // Remove any existing context menu
    this.removeContextMenu();
    
    // Create context menu element
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'context-menu';
    
    // Add menu items
    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      menuItem.textContent = item.text;
      menuItem.addEventListener('click', () => {
        item.action();
        this.removeContextMenu();
      });
      
      contextMenu.appendChild(menuItem);
    });
    
    // Position the menu at the cursor
    contextMenu.style.position = 'fixed';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    
    // Add to document
    document.body.appendChild(contextMenu);
    
    // Add click event listener to remove menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', this.removeContextMenu);
    }, 0);
  }
  
  /**
   * Remove the context menu from the DOM
   */
  removeContextMenu = () => {
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu) {
      document.body.removeChild(contextMenu);
    }
    document.removeEventListener('click', this.removeContextMenu);
  };
  
  /**
   * Show a specific type of modal for monsters
   * @param {Object} monster - Monster data object
   */
  showMonsterModal(monster) {
    // Generate content for monster modal
    const content = this.generateMonsterModalContent(monster);
    this.showModal(`${monster.name}`, content);
  }
  
  /**
   * Generate HTML content for a monster modal
   * @param {Object} monster - Monster data object
   * @returns {string} HTML content for the modal
   */
  generateMonsterModalContent(monster) {
    return `
      <div class="monster-detail">
        <p><strong>Type:</strong> ${monster.type}</p>
        <p><strong>Size:</strong> ${monster.size}</p>
        <p><strong>Alignment:</strong> ${monster.alignment}</p>
        <hr>
        <p><strong>Armor Class:</strong> ${monster.ac}</p>
        <p><strong>Hit Points:</strong> ${monster.hp}</p>
        <p><strong>Speed:</strong> ${monster.speed}</p>
        <div class="ability-scores">
          <div class="ability">
            <span>STR</span>
            <span>${monster.str} (${this.getAbilityModifier(monster.str)})</span>
          </div>
          <div class="ability">
            <span>DEX</span>
            <span>${monster.dex} (${this.getAbilityModifier(monster.dex)})</span>
          </div>
          <div class="ability">
            <span>CON</span>
            <span>${monster.con} (${this.getAbilityModifier(monster.con)})</span>
          </div>
          <div class="ability">
            <span>INT</span>
            <span>${monster.int} (${this.getAbilityModifier(monster.int)})</span>
          </div>
          <div class="ability">
            <span>WIS</span>
            <span>${monster.wis} (${this.getAbilityModifier(monster.wis)})</span>
          </div>
          <div class="ability">
            <span>CHA</span>
            <span>${monster.cha} (${this.getAbilityModifier(monster.cha)})</span>
          </div>
        </div>
        
        ${monster.specialTraits ? `
          <h4>Special Traits</h4>
          ${monster.specialTraits.map(trait => 
            `<p><strong>${trait.name}:</strong> ${trait.description}</p>`
          ).join('')}
        ` : ''}
        
        <h4>Actions</h4>
        ${monster.actions.map(action => 
          `<p><strong>${action.name}:</strong> ${action.description}</p>`
        ).join('')}
        
        ${monster.lore ? `
          <h4>Lore</h4>
          <p>${monster.lore}</p>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Calculate ability score modifier
   * @param {number} score - The ability score
   * @returns {string} Formatted modifier string (e.g., "+3" or "-1")
   */
  getAbilityModifier(score) {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }
  
  /**
   * Show a specific type of modal for spells
   * @param {Object} spell - Spell data object
   */
  showSpellModal(spell) {
    // Generate content for spell modal
    const content = this.generateSpellModalContent(spell);
    this.showModal(`${spell.name}`, content);
  }
  
  /**
   * Generate HTML content for a spell modal
   * @param {Object} spell - Spell data object
   * @returns {string} HTML content for the modal
   */
  generateSpellModalContent(spell) {
    return `
      <div class="spell-detail">
        <p><strong>Level:</strong> ${spell.level}</p>
        <p><strong>Casting Time:</strong> ${spell.castingTime}</p>
        <p><strong>Range:</strong> ${spell.range}</p>
        <p><strong>Components:</strong> ${spell.components}</p>
        <p><strong>Duration:</strong> ${spell.duration}</p>
        <hr>
        <p>${spell.description}</p>
        ${spell.higherLevels ? `<p><strong>At Higher Levels:</strong> ${spell.higherLevels}</p>` : ''}
      </div>
    `;
  }
  
  /**
   * Show a specific type of modal for items
   * @param {Object} item - Item data object
   */
  showItemModal(item) {
    // Generate content for item modal
    const content = this.generateItemModalContent(item);
    this.showModal(`${item.name}`, content);
  }
  
  /**
   * Generate HTML content for an item modal
   * @param {Object} item - Item data object
   * @returns {string} HTML content for the modal
   */
  generateItemModalContent(item) {
    return `
      <div class="item-detail">
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Rarity:</strong> ${item.rarity}</p>
        ${item.attunement ? `<p><strong>Attunement:</strong> ${item.attunement}</p>` : ''}
        <hr>
        <p>${item.description}</p>
      </div>
    `;
  }
  
  /**
   * Show a specific type of modal for diaper mechanics
   * @param {string} mechanic - Mechanic name
   * @param {string} description - Mechanic description
   */
  showMechanicModal(mechanic, description) {
    this.showModal(`Diaper Mechanic: ${mechanic}`, description);
  }
}
