// preload.js - IPC Bridge with all communication channels

const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // App Functions
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    
    // Data Management
    saveConversations: (data) => ipcRenderer.invoke('save-conversations', data),
    loadConversations: () => ipcRenderer.invoke('load-conversations'),
    saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    
    // Message Management
    deleteMessage: (convId, msgIndex) => ipcRenderer.invoke('delete-message', convId, msgIndex),
    clearConversation: (convId) => ipcRenderer.invoke('clear-conversation', convId),
    
    // File Functions
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    
    // Message passing (two-way)
    send: (channel, data) => {
        const validChannels = ['save-message', 'load-messages', 'delete-messages'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    
    receive: (channel, func) => {
        const validChannels = ['message-received', 'settings-changed', 'data-synced'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    
    // Invoke (request/response)
    invoke: (channel, data) => {
        const validChannels = ['save-data', 'load-data', 'validate-input'];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
    }
});

console.log('✅ Preload script loaded - IPC bridge ready');
