const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
	const win = new BrowserWindow({
		width: 1280,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			sandbox: true,
			nodeIntegration: false,
		},
	});

	win.removeMenu();
	win.loadFile(path.join(__dirname, 'cellardungeon.html'));
};

app.whenReady().then(() => {
	app.setAppUserModelId('com.cellarways.app');
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
