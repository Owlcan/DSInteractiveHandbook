// Preload script runs before the renderer process starts
// It has access to both Node.js APIs and limited access to Electron APIs
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing all of electron's API
contextBridge.exposeInMainWorld(
  'api', {
    // Electron API access we want to provide to the renderer process
    send: (channel, data) => {
      // Whitelist channels to ensure security
      const validChannels = [
        'app-quit', 
        'navigate-to-section', 
        'toggle-alchemy-tracker', 
        'toggle-music',
        'update-volume'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      // Whitelist channels to ensure security
      const validChannels = [
        'navigate-to-section', 
        'toggle-alchemy-tracker', 
        'show-about-dialog', 
        'focus-search',
        'theme-changed'
      ];
      if (validChannels.includes(channel)) {
        // Remove the event listener if it already exists to avoid duplicates
        ipcRenderer.removeAllListeners(channel);
        // Add a new event listener for this channel
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Invoke methods that receive a response
    invoke: async (channel, data) => {
      const validChannels = [
        'get-handbook-data',
        'get-app-version',
        'check-for-updates'
      ];
      if (validChannels.includes(channel)) {
        return await ipcRenderer.invoke(channel, data);
      }
      return null;
    }
  }
);

// Add any additional preload functionality here

// Let the renderer process know when the preload script has completed
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  // Version information
  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
