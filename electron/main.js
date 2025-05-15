const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize store for settings
const store = new Store({
  defaults: {
    settings: {
      startOnBoot: true,
      showInTray: true,
      autoUpdates: true,
      spellingCheck: true,
      grammarCheck: true,
      autocomplete: true,
      language: 'en-US',
      usageData: true,
      storeHistory: true,
      excludedApps: []
    }
  }
});

// Keep a global reference of objects to prevent garbage collection
let mainWindow = null;
let tray = null;
let isQuiting = false;

// Text monitoring state
let textMonitorActive = true;

// Flag to check if app is in development mode
const isDev = process.env.NODE_ENV === 'development';

// Path to serve from
const appUrl = isDev 
  ? 'http://localhost:5000' // Development server
  : `file://${path.join(__dirname, '../dist/index.html')}`; // Production build

// Create the main window
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: Math.min(1200, width * 0.8),
    height: Math.min(800, height * 0.8),
    webPreferences: {
      nodeIntegration: true, // Enable Node.js in the renderer
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/assets/icon.png'),
    show: false, // Don't show initially, will show once ready
  });

  // Load the app
  mainWindow.loadURL(appUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Register global shortcut to toggle the main window
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Hide window instead of closing it when user clicks the close button
  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });

  // Show window when it's ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// Setup tray icon
function createTray() {
  tray = new Tray(path.join(__dirname, '../public/assets/tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open Smart Writer', 
      click: () => { 
        mainWindow.show(); 
      } 
    },
    { type: 'separator' },
    { 
      label: 'Enable Text Monitoring', 
      type: 'checkbox',
      checked: textMonitorActive,
      click: (menuItem) => {
        textMonitorActive = menuItem.checked;
        mainWindow.webContents.send('text-monitor-status-changed', textMonitorActive);
      } 
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        isQuiting = true;
        app.quit();
      } 
    }
  ]);
  
  tray.setToolTip('Smart Writer');
  tray.setContextMenu(contextMenu);
  
  // Show app on tray double-click
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

// Handle starting at login
function setAutoLaunch(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  });
}

// When Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Apply auto-launch setting
  setAutoLaunch(store.get('settings.startOnBoot'));
  
  // Setup IPC listeners for renderer process communication
  setupIPC();
});

// Set up IPC communication
function setupIPC() {
  // Get settings
  ipcMain.handle('get-settings', () => {
    return store.get('settings');
  });
  
  // Update settings
  ipcMain.handle('update-settings', (event, settings) => {
    // Update auto-launch if needed
    if (settings.hasOwnProperty('startOnBoot')) {
      setAutoLaunch(settings.startOnBoot);
    }
    
    // Update the settings in store
    const currentSettings = store.get('settings');
    store.set('settings', { ...currentSettings, ...settings });
    
    return store.get('settings');
  });
  
  // Get system information
  ipcMain.handle('get-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron
    };
  });
  
  // Toggle text monitoring
  ipcMain.handle('toggle-text-monitor', (event, active) => {
    textMonitorActive = active;
    // Update tray menu
    const menu = tray.getContextMenu();
    const monitoringMenuItem = menu.items.find(item => item.label === 'Enable Text Monitoring');
    if (monitoringMenuItem) {
      monitoringMenuItem.checked = textMonitorActive;
      tray.setContextMenu(menu);
    }
    return textMonitorActive;
  });
  
  // Add app to excluded list
  ipcMain.handle('add-excluded-app', (event, appName) => {
    const settings = store.get('settings');
    const excludedApps = settings.excludedApps || [];
    
    if (!excludedApps.includes(appName)) {
      excludedApps.push(appName);
      store.set('settings.excludedApps', excludedApps);
    }
    
    return excludedApps;
  });
  
  // Remove app from excluded list
  ipcMain.handle('remove-excluded-app', (event, appName) => {
    const settings = store.get('settings');
    const excludedApps = settings.excludedApps || [];
    
    const updatedExcludedApps = excludedApps.filter(app => app !== appName);
    store.set('settings.excludedApps', updatedExcludedApps);
    
    return updatedExcludedApps;
  });
  
  // Get excluded apps list
  ipcMain.handle('get-excluded-apps', () => {
    const settings = store.get('settings');
    return settings.excludedApps || [];
  });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create the window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// Clean up resources before quitting
app.on('before-quit', () => {
  isQuiting = true;
  globalShortcut.unregisterAll();
});

// Simple API to monitor text and provide suggestions
// Note: In a real application, this would use native OS-level hooks
// to capture text from any application, which requires additional 
// platform-specific libraries and code.