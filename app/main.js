// main.js - Electron Main Process
// Controls the app window and handles system events

const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

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
app.on('ready', createWindow);

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

// IPC Handlers
ipcMain.handle('get-app-version', async () => {
    return {
        version: app.getVersion(),
        platform: process.platform
    };
});

ipcMain.handle('get-user-data-path', async () => {
    return app.getPath('userData');
});

ipcMain.handle('quit-app', async () => {
    app.quit();
});

console.log('🔐 Cipher Desktop App - Main Process Started');
console.log('Platform:', process.platform);
console.log('Version:', app.getVersion());
