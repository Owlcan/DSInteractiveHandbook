// Simple loader for browser environment with hardcoded example data
// This will ensure we have at least some data to display

// DIRECTLY USE ALL THE ACTUAL DATA FROM ALLDATA.JS
// No fallbacks or examples - use the REAL data that was defined in allData.js

console.log("Accessing all data from allData.js for display");

// Make sure the data is available globally for the browser.
// Guarded so a missing/failed allData.js load doesn't break the rest of the page.
if (typeof itemsData !== 'undefined') window.itemsData = itemsData;
if (typeof monstersData !== 'undefined') window.monstersData = monstersData;
if (typeof monsterImages !== 'undefined') window.monsterImages = monsterImages || {};

// Confirm data is accessible
if (Array.isArray(window.itemsData) && Array.isArray(window.monstersData)) {
	console.log(`CONFIRMED: Loaded ${window.itemsData.length} items and ${window.monstersData.length} monsters from allData.js`);
} else {
	console.warn('browser-data.js: allData.js globals not found (itemsData/monstersData).');
}

// Log the first few items and monsters to verify content
if (Array.isArray(window.itemsData)) {
	console.log("Sample items:", window.itemsData.slice(0, 3).map((item) => item.name));
}
if (Array.isArray(window.monstersData)) {
	console.log("Sample monsters:", window.monstersData.slice(0, 3).map((monster) => monster.name));
}

// Set up image cache
if (typeof monsterImages !== 'undefined') window.monsterImages = monsterImages || {};

console.log("Browser data initialization complete");
