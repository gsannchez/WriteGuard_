import { app, BrowserWindow, ipcMain, screen, dialog } from 'electron';
import path from 'path';
import Store from 'electron-store';
import log from 'electron-log';

// Importar módulos del sistema
import { createTray, destroyTray, updateTrayTooltip, getTextMonitorState } from './system/tray';
import { registerGlobalShortcuts, unregisterAllShortcuts, updateGlobalShortcut } from './system/shortcuts';
import { initAutoLaunch, setAutoLaunchState } from './system/autoLaunch';

// Importar el monitor de texto
import * as textMonitor from './textMonitor';

// Configurar el sistema de registro
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Iniciando aplicación', {
  time: new Date().toISOString(),
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch
});

// Inicializar almacenamiento de configuración
const store = new Store({
  name: 'config',
  defaults: {
    settings: {
      // System options
      startOnBoot: true,
      showInTray: true,
      autoUpdates: true,
      // Correction options
      spellingCheck: true,
      grammarCheck: true,
      styleCheck: false,
      autocomplete: true,
      // Style preferences
      language: 'en-US',
      writingStyle: 'standard',
      correctionSensitivity: 'medium',
      // Privacy options
      usageData: true,
      storeHistory: true,
      workOffline: false,
      // UI preferences
      notificationStyle: 'popup',
      zenMode: false,
      // System
      globalShortcut: 'Control+Shift+Space',
      excludedApps: [] as string[]
    },
    windowBounds: {
      width: 1200,
      height: 800,
      x: undefined,
      y: undefined
    },
    firstRun: true
  }
});

// Variables globales
let mainWindow: BrowserWindow | null = null;
let isQuitting = false;
let isFirstRun = store.get('firstRun', true) as boolean;

// Flag para modo desarrollo
const isDev = process.env.NODE_ENV === 'development';

// URL de la aplicación
const appUrl = isDev
  ? 'http://localhost:5000' // Servidor de desarrollo
  : `file://${path.join(__dirname, '../dist/index.html')}`; // Build de producción

/**
 * Crea la ventana principal de la aplicación
 */
function createWindow(): BrowserWindow {
  log.info('Creando ventana principal');
  
  // Obtener tamaño de la pantalla
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  
  // Recuperar tamaño y posición guardados
  const savedBounds = store.get('windowBounds') as {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  
  // Configurar ventana principal
  const win = new BrowserWindow({
    width: savedBounds.width || Math.min(1200, screenWidth * 0.8),
    height: savedBounds.height || Math.min(800, screenHeight * 0.8),
    x: savedBounds.x,
    y: savedBounds.y,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: !store.get('settings.showInTray', true), // No mostrar inicialmente si está en la bandeja
    title: 'Asistente de Escritura Inteligente',
    backgroundColor: '#ffffff',
    minWidth: 800,
    minHeight: 600,
  });
  
  // Cargar la aplicación
  win.loadURL(appUrl);
  
  // Abrir DevTools en modo desarrollo
  if (isDev) {
    win.webContents.openDevTools();
  }
  
  // Guardar tamaño y posición de la ventana al cerrar
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win.hide();
      log.info('Ventana principal ocultada');
      return false;
    }
    
    // Guardar dimensiones
    const { width, height, x, y } = win.getBounds();
    store.set('windowBounds', { width, height, x, y });
    log.info('Dimensiones de ventana guardadas', { width, height, x, y });
    return true;
  });
  
  // Mostrar ventana cuando esté lista
  win.once('ready-to-show', () => {
    if (!store.get('settings.showInTray', true) || isFirstRun) {
      win.show();
      log.info('Ventana principal mostrada (primera ejecución o configurada para mostrar)');
      
      // Si es la primera ejecución, mostrar la página de bienvenida
      if (isFirstRun) {
        win.webContents.send('navigate-to', '/onboarding');
        store.set('firstRun', false);
        isFirstRun = false;
      }
    } else {
      log.info('Ventana principal lista pero no mostrada (mostrando solo en bandeja)');
    }
  });
  
  return win;
}

/**
 * Inicializa todos los componentes de la aplicación
 */
async function initializeApp() {
  try {
    log.info('Inicializando aplicación');
    
    // Crear ventana principal
    mainWindow = createWindow();
    
    // Crear ícono en la bandeja del sistema
    createTray(mainWindow, toggleTextMonitor);
    
    // Registrar atajos globales
    registerGlobalShortcuts(mainWindow);
    
    // Inicializar auto-arranque
    initAutoLaunch();
    
    // Configurar IPC
    setupIPC();
    
    // Iniciar monitor de texto
    const isTextMonitorActive = getTextMonitorState();
    if (isTextMonitorActive) {
      if (mainWindow) {
        textMonitor.start(mainWindow);
        log.info('Monitor de texto iniciado');
      }
    }
    
    // Cargar lista de aplicaciones excluidas
    const excludedApps = store.get('settings.excludedApps', []) as string[];
    textMonitor.setExcludedApps(excludedApps);
    log.info(`Lista de aplicaciones excluidas cargada: ${excludedApps.length} aplicaciones`);
    
    // Si llegamos aquí, la inicialización fue exitosa
    log.info('Inicialización completada exitosamente');
  } catch (error) {
    log.error('Error durante la inicialización:', error);
    dialog.showErrorBox(
      'Error de inicialización',
      'Ha ocurrido un error al iniciar la aplicación. Por favor, consulte los registros para más detalles.'
    );
  }
}

/**
 * Activa o desactiva el monitor de texto
 * @param active Estado a configurar
 * @returns El nuevo estado
 */
function toggleTextMonitor(active: boolean): boolean {
  if (!mainWindow) {
    log.warn('No se puede cambiar el estado del monitor: ventana principal no disponible');
    return false;
  }
  
  log.info(`Cambiando estado del monitor de texto: ${active ? 'activado' : 'desactivado'}`);
  
  if (active) {
    textMonitor.start(mainWindow);
  } else {
    textMonitor.stop();
  }
  
  // Actualizar mensaje en bandeja
  updateTrayTooltip(`Asistente de Escritura Inteligente - Monitor ${active ? 'Activado' : 'Desactivado'}`);
  
  // Notificar al frontend
  mainWindow.webContents.send('text-monitor-status-changed', active);
  
  return active;
}

/**
 * Configura la comunicación IPC entre procesos
 */
function setupIPC() {
  log.info('Configurando comunicación IPC');
  
  // Obtener configuración
  ipcMain.handle('get-settings', () => {
    return store.get('settings');
  });
  
  // Actualizar configuración
  ipcMain.handle('update-settings', async (event, settings: Record<string, any>) => {
    log.info('Actualizando configuración:', settings);
    
    // Manejar configuraciones específicas
    if (settings.hasOwnProperty('startOnBoot')) {
      await setAutoLaunchState(settings.startOnBoot);
    }
    
    if (settings.hasOwnProperty('globalShortcut') && mainWindow) {
      updateGlobalShortcut(mainWindow, settings.globalShortcut);
    }
    
    // Actualizar configuración general
    const currentSettings = store.get('settings') as Record<string, any>;
    const newSettings = { ...currentSettings, ...settings };
    store.set('settings', newSettings);
    
    return newSettings;
  });
  
  // Obtener información del sistema
  ipcMain.handle('get-system-info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.getCPUUsage?.() || { percentCPUUsage: 0, idleWakeupsPerSecond: 0 }
    };
  });
  
  // Control del monitor de texto
  ipcMain.handle('toggle-text-monitor', (event, active: boolean) => {
    return toggleTextMonitor(active);
  });
  
  // Manejo de aplicaciones excluidas
  ipcMain.handle('add-excluded-app', (event, appName: string) => {
    const excludedApps = store.get('settings.excludedApps', []) as string[];
    
    if (!excludedApps.includes(appName)) {
      excludedApps.push(appName);
      store.set('settings.excludedApps', excludedApps);
      textMonitor.setExcludedApps(excludedApps);
      log.info(`Aplicación añadida a exclusiones: ${appName}`);
    }
    
    return excludedApps;
  });
  
  ipcMain.handle('remove-excluded-app', (event, appName: string) => {
    const excludedApps = store.get('settings.excludedApps', []) as string[];
    const updatedList = excludedApps.filter(app => app !== appName);
    
    store.set('settings.excludedApps', updatedList);
    textMonitor.setExcludedApps(updatedList);
    log.info(`Aplicación removida de exclusiones: ${appName}`);
    
    return updatedList;
  });
  
  ipcMain.handle('get-excluded-apps', () => {
    return store.get('settings.excludedApps', []);
  });
  
  // Exportar configuración
  ipcMain.handle('export-settings', async () => {
    if (!mainWindow) return { success: false, error: 'Ventana principal no disponible' };
    
    try {
      const settings = store.get('settings');
      
      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Exportar configuración',
        defaultPath: path.join(app.getPath('documents'), 'asistente-configuracion.json'),
        filters: [{ name: 'Archivos JSON', extensions: ['json'] }]
      });
      
      if (!filePath) return { success: false, cancelled: true };
      
      const fs = require('fs');
      fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
      
      log.info(`Configuración exportada a: ${filePath}`);
      return { success: true, path: filePath };
    } catch (error) {
      log.error('Error al exportar configuración:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  
  // Importar configuración
  ipcMain.handle('import-settings', async () => {
    if (!mainWindow) return { success: false, error: 'Ventana principal no disponible' };
    
    try {
      const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Importar configuración',
        defaultPath: app.getPath('documents'),
        filters: [{ name: 'Archivos JSON', extensions: ['json'] }],
        properties: ['openFile']
      });
      
      if (!filePaths || filePaths.length === 0) return { success: false, cancelled: true };
      
      const fs = require('fs');
      const settingsData = fs.readFileSync(filePaths[0], 'utf-8');
      const settings = JSON.parse(settingsData);
      
      // Preservar algunas configuraciones del sistema
      const currentSettings = store.get('settings') as Record<string, any>;
      const newSettings = { ...settings, globalShortcut: currentSettings.globalShortcut };
      
      store.set('settings', newSettings);
      
      // Actualizar componentes relacionados
      if (mainWindow) {
        await setAutoLaunchState(newSettings.startOnBoot);
        textMonitor.setExcludedApps(newSettings.excludedApps || []);
      }
      
      log.info(`Configuración importada desde: ${filePaths[0]}`);
      return { success: true, settings: newSettings };
    } catch (error) {
      log.error('Error al importar configuración:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  
  // Reportar errores
  ipcMain.handle('report-error', async (event, errorData: any) => {
    try {
      log.error('Error reportado por la aplicación:', errorData);
      
      // Guardar error en archivo de log específico
      const fs = require('fs');
      const logPath = path.join(app.getPath('userData'), 'logs', 'errors.log');
      
      // Asegurar que el directorio existe
      if (!fs.existsSync(path.dirname(logPath))) {
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
      }
      
      // Agregar fecha y formato al error
      const formattedError = `[${new Date().toISOString()}] ${JSON.stringify(errorData, null, 2)}\n\n`;
      fs.appendFileSync(logPath, formattedError);
      
      return { success: true, logPath };
    } catch (error) {
      log.error('Error al guardar reporte de error:', error);
      return { success: false, error: (error as Error).message };
    }
  });
  
  // Para pruebas: simular entrada de texto
  ipcMain.handle('simulate-typing', (event, text: string, app: string) => {
    return textMonitor.handleTextInput(text, app);
  });
  
  log.info('Comunicación IPC configurada');
}

// Cuando Electron ha finalizado la inicialización
app.whenReady().then(initializeApp);

// Al cerrar todas las ventanas (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// En macOS, recrear la ventana al hacer clic en el ícono del dock
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

// Limpiar recursos antes de salir
app.on('before-quit', () => {
  log.info('Aplicación cerrándose, limpiando recursos');
  isQuitting = true;
  unregisterAllShortcuts();
  destroyTray();
});