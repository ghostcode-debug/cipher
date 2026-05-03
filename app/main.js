// main.js - Electron Main Process with IPC Handlers

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let userData = {};

// User data path
const userDataPath = path.join(app.getPath('userData'), 'cipher-data.json');

// Create the browser window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: true,
            webSecurity: true,
            allowRunningInsecureContent: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App event handlers
app.on('ready', () => {
    loadUserData();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// =============================================
// USER DATA MANAGEMENT
// =============================================

function loadUserData() {
    try {
        if (fs.existsSync(userDataPath)) {
            const data = fs.readFileSync(userDataPath, 'utf8');
            userData = JSON.parse(data);
        } else {
            userData = { conversations: {}, settings: {} };
            saveUserData();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        userData = { conversations: {}, settings: {} };
    }
}

function saveUserData() {
    try {
        const dir = path.dirname(userDataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

// =============================================
// IPC HANDLERS
// =============================================

// Get app version and info
ipcMain.handle('get-app-version', async () => {
    return {
        version: app.getVersion(),
        platform: process.platform
    };
});

// Get user data path
ipcMain.handle('get-user-data-path', async () => {
    return app.getPath('userData');
});

// Save conversations
ipcMain.handle('save-conversations', async (event, conversations) => {
    try {
        userData.conversations = conversations;
        saveUserData();
        return { success: true };
    } catch (error) {
        console.error('Save error:', error);
        return { success: false, error: error.message };
    }
});

// Load conversations
ipcMain.handle('load-conversations', async () => {
    try {
        return { success: true, data: userData.conversations };
    } catch (error) {
        console.error('Load error:', error);
        return { success: false, error: error.message };
    }
});

// Save settings
ipcMain.handle('save-settings', async (event, settings) => {
    try {
        userData.settings = settings;
        saveUserData();
        return { success: true };
    } catch (error) {
        console.error('Settings save error:', error);
        return { success: false, error: error.message };
    }
});

// Load settings
ipcMain.handle('load-settings', async () => {
    try {
        return { success: true, data: userData.settings };
    } catch (error) {
        console.error('Settings load error:', error);
        return { success: false, error: error.message };
    }
});

// Delete message
ipcMain.handle('delete-message', async (event, conversationId, messageIndex) => {
    try {
        if (userData.conversations[conversationId]) {
            userData.conversations[conversationId].messages.splice(messageIndex, 1);
            saveUserData();
            return { success: true };
        }
        return { success: false, error: 'Conversation not found' };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
});

// Clear conversation
ipcMain.handle('clear-conversation', async (event, conversationId) => {
    try {
        if (userData.conversations[conversationId]) {
            userData.conversations[conversationId].messages = [];
            saveUserData();
            return { success: true };
        }
        return { success: false, error: 'Conversation not found' };
    } catch (error) {
        console.error('Clear error:', error);
        return { success: false, error: error.message };
    }
});

// Quit app
ipcMain.handle('quit-app', async () => {
    app.quit();
});

console.log('🔐 Cipher Desktop App - Main Process Started');
console.log('Platform:', process.platform);
console.log('User Data Path:', userDataPath);
