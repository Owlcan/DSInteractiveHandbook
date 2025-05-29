/**
 * Data Manager for the Interactive Handbook
 * Centralizes access to item and monster data
 */

// References to data (will use globals if available)
// Note: We don't redeclare the variables since they're already global
// Detect environment (browser vs Node.js/Electron)
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

try {
  // In Node.js/Electron environment, we need to load the data
  if (!isBrowser) {
    // Only load via require() in Node.js environment
    const allData = require('./allData');
    window.itemsData = allData.itemsData;
    window.monstersData = allData.monstersData;
    window.preloadMonsterImages = allData.preloadMonsterImages;
    window.bestiaryData = require('./bestiary.json');
    window.itemsReferenceData = require('./itemdata');
  }
} catch (error) {
  console.error('Error loading data sources:', error);
}

/**
 * DataManager class for handling data access throughout the application
 */
class DataManager {
  constructor() {
    this.items = this._initializeItems();
    this.monsters = this._initializeMonsters();
    
    // Preload monster images if the function exists
    if (typeof preloadMonsterImages === 'function') {
      preloadMonsterImages();
    }
  }
  
  /**
   * Initialize items data, merging image paths from allData with detailed data from itemdata
   */
  _initializeItems() {
    // Use the data from allData.js which already contains image paths
    return itemsData;
  }
  
  /**
   * Initialize monster data from both the bestiary.json and allData.js
   */
  _initializeMonsters() {
    // Use the data from allData.js which has a simplified structure
    return monstersData;
  }
  
  /**
   * Get all items
   * @returns {Array} Array of all items
   */
  getAllItems() {
    return this.items;
  }
  
  /**
   * Get all monsters
   * @returns {Array} Array of all monsters
   */
  getAllMonsters() {
    return this.monsters;
  }
  
  /**
   * Get item by name
   * @param {string} name - Name of the item to find
   * @returns {Object|null} Item object or null if not found
   */
  getItemByName(name) {
    return this.items.find(item => item.name === name) || null;
  }
  
  /**
   * Get monster by name
   * @param {string} name - Name of the monster to find
   * @returns {Object|null} Monster object or null if not found
   */
  getMonsterByName(name) {
    return this.monsters.find(monster => monster.name === name) || null;
  }
  
  /**
   * Filter items by various criteria
   * @param {Object} criteria - Filtering criteria
   * @returns {Array} Filtered items array
   */
  filterItems(criteria = {}) {
    return this.items.filter(item => {
      let matches = true;
      
      if (criteria.name && !item.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        matches = false;
      }
      
      if (criteria.type && !item.type.toLowerCase().includes(criteria.type.toLowerCase())) {
        matches = false;
      }
      
      if (criteria.rarity && item.rarity !== criteria.rarity) {
        matches = false;
      }
      
      if (criteria.location && (!item.location || !item.location.toLowerCase().includes(criteria.location.toLowerCase()))) {
        matches = false;
      }
      
      return matches;
    });
  }
  
  /**
   * Filter monsters by various criteria
   * @param {Object} criteria - Filtering criteria
   * @returns {Array} Filtered monsters array
   */
  filterMonsters(criteria = {}) {
    return this.monsters.filter(monster => {
      let matches = true;
      
      if (criteria.name && !monster.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        matches = false;
      }
      
      if (criteria.type && monster.type !== criteria.type) {
        matches = false;
      }
      
      if (criteria.size && monster.size !== criteria.size) {
        matches = false;
      }
      
      if (criteria.alignment && !monster.alignment.toLowerCase().includes(criteria.alignment.toLowerCase())) {
        matches = false;
      }
      
      return matches;
    });
  }
}

// Create a singleton instance
const dataManager = new DataManager();

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js / CommonJS export
  module.exports = dataManager;
} else if (typeof window !== 'undefined') {
  // Browser global
  window.dataManager = dataManager;
}
