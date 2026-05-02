// preload.js - IPC Bridge
// Safely exposes main process functions to renderer

const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // App Functions
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    
    // File Functions
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    
    // Message passing
    send: (channel, data) => {
        const validChannels = ['save-message', 'load-messages', 'delete-messages'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    
    receive: (channel, func) => {
        const validChannels = ['message-received', 'settings-changed'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    
    invoke: (channel, data) => {
        const validChannels = ['save-data', 'load-data', 'validate-input'];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    }
});

console.log('✅ Preload script loaded - IPC bridge ready');
