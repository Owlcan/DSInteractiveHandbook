// Simple loader for browser environment with hardcoded example data
// This will ensure we have at least some data to display

// DIRECTLY USE ALL THE ACTUAL DATA FROM ALLDATA.JS
// No fallbacks or examples - use the REAL data that was defined in allData.js

console.log("Accessing all data from allData.js for display");

// Make sure the data is available globally for the browser
window.itemsData = itemsData;
window.monstersData = monstersData;
window.monsterImages = monsterImages || {};

// Confirm data is accessible
console.log(`CONFIRMED: Loaded ${itemsData.length} items and ${monstersData.length} monsters from allData.js`);

// Log the first few items and monsters to verify content
console.log("Sample items:", itemsData.slice(0, 3).map(item => item.name));
console.log("Sample monsters:", monstersData.slice(0, 3).map(monster => monster.name));

// Set up image cache
window.monsterImages = monsterImages || {};

console.log("Browser data initialization complete");
