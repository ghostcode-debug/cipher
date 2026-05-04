const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // App Functions
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    restartApp: () => ipcRenderer.invoke('restart-app'),
    
    // Data Management
    saveConversations: (data) => ipcRenderer.invoke('save-conversations', data),
    loadConversations: () => ipcRenderer.invoke('load-conversations'),
    saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    
    // Update Events
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback)
});

console.log('✅ Preload script loaded - IPC bridge ready');
