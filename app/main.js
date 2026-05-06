const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

let mainWindow;
let userData = {};

const userDataPath = path.join(app.getPath('userData'), 'cipher-data.json');

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: true,
        
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

    mainWindow.removeMenu();
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
    // mainWindow.webContents.openDevTools(); // Disabled in production

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
        console.log('Update available');
        mainWindow.webContents.send('update-available');
    });
    
    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded');
        mainWindow.webContents.send('update-downloaded');
    });
    
    autoUpdater.on('error', (err) => {
        console.error('Update error:', err);
    });
}

app.on('ready', () => {
    loadUserData();
    createWindow();
    setupAutoUpdater();
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

// DATABASE FUNCTIONS
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

// IPC HANDLERS
ipcMain.handle('get-app-version', async () => {
    return {
        version: app.getVersion(),
        platform: process.platform
    };
});

ipcMain.handle('get-user-data-path', async () => {
    return app.getPath('userData');
});

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

ipcMain.handle('load-conversations', async () => {
    try {
        return { success: true, data: userData.conversations };
    } catch (error) {
        console.error('Load error:', error);
        return { success: false, error: error.message };
    }
});

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

ipcMain.handle('load-settings', async () => {
    try {
        return { success: true, data: userData.settings };
    } catch (error) {
        console.error('Settings load error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.handle('close-window', () => {
    mainWindow.close();
});

ipcMain.handle('quit-app', async () => {
    app.quit();
});

ipcMain.handle('restart-app', async () => {
    autoUpdater.quitAndInstall();
});

console.log('Cipher Desktop App - Main Process Started');
