const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

const BESTIARY_FILENAME = 'Diaper-School-Full-Bestiary.json';
const bestiaryPath = path.join(__dirname, BESTIARY_FILENAME);
let bundledBestiary = '';

try {
	bundledBestiary = fs.readFileSync(bestiaryPath, 'utf8');
} catch (err) {
	console.warn('[preload] Unable to read bundled bestiary:', err?.message || err);
}

contextBridge.exposeInMainWorld('bestiaryBridge', {
	getBundledBestiaryText: () => bundledBestiary,
	getBundledBestiarySource: () => BESTIARY_FILENAME,
});
