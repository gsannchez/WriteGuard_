import { globalShortcut, BrowserWindow } from 'electron';
import Store from 'electron-store';
import log from 'electron-log';

// Configuración para almacenar preferencias
const store = new Store();

// Lista de todos los atajos registrados
const registeredShortcuts: string[] = [];

/**
 * Registra el atajo global principal para mostrar/ocultar la aplicación
 * @param mainWindow Ventana principal de la aplicación
 */
export function registerGlobalShortcuts(mainWindow: BrowserWindow): void {
  try {
    log.info('Registrando atajos globales');

    // Obtener atajo global configurado o usar el predeterminado
    const globalShortcutKey = store.get('settings.globalShortcut', 'Control+Shift+Space') as string;
    
    // Registrar atajo principal
    registerMainShortcut(mainWindow, globalShortcutKey);
    
    // Registrar otros atajos específicos
    registerFeatureShortcuts(mainWindow);
    
    log.info('Atajos globales registrados exitosamente');
  } catch (error) {
    log.error('Error al registrar atajos globales:', error);
  }
}

/**
 * Registra el atajo principal para mostrar/ocultar la ventana
 * @param mainWindow Ventana principal
 * @param shortcutKey Combinación de teclas
 */
function registerMainShortcut(mainWindow: BrowserWindow, shortcutKey: string): void {
  try {
    // Desregistrar si ya existe
    if (globalShortcut.isRegistered(shortcutKey)) {
      globalShortcut.unregister(shortcutKey);
    }
    
    // Registrar el nuevo atajo
    const success = globalShortcut.register(shortcutKey, () => {
      log.info(`Atajo global "${shortcutKey}" activado`);
      
      if (!mainWindow) {
        log.warn('Ventana principal no disponible');
        return;
      }
      
      // Alternar visibilidad
      if (mainWindow.isVisible()) {
        if (mainWindow.isFocused()) {
          mainWindow.hide();
        } else {
          mainWindow.focus();
        }
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    
    if (success) {
      log.info(`Atajo global "${shortcutKey}" registrado exitosamente`);
      registeredShortcuts.push(shortcutKey);
    } else {
      log.error(`Error al registrar atajo global "${shortcutKey}"`);
    }
  } catch (error) {
    log.error(`Error al registrar atajo principal "${shortcutKey}":`, error);
  }
}

/**
 * Registra atajos adicionales para funciones específicas
 * @param mainWindow Ventana principal
 */
function registerFeatureShortcuts(mainWindow: BrowserWindow): void {
  const featureShortcuts = [
    // Activar/desactivar modo offline rápidamente
    { 
      key: 'Control+Shift+O', 
      action: () => {
        const currentMode = store.get('settings.workOffline', false) as boolean;
        store.set('settings.workOffline', !currentMode);
        store.set('workOffline', !currentMode);
        
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('show-toast', {
            title: `Modo Offline ${!currentMode ? 'Activado' : 'Desactivado'}`,
            message: `El asistente ahora está trabajando ${!currentMode ? 'sin conexión' : 'en línea'}`
          });
        }
      }
    },
    
    // Abrir página de configuración
    {
      key: 'Control+Shift+,',
      action: () => {
        if (mainWindow) {
          if (!mainWindow.isVisible()) {
            mainWindow.show();
          }
          mainWindow.webContents.send('navigate-to', '/settings');
        }
      }
    },
    
    // Abrir página de estadísticas
    {
      key: 'Control+Shift+S',
      action: () => {
        if (mainWindow) {
          if (!mainWindow.isVisible()) {
            mainWindow.show();
          }
          mainWindow.webContents.send('navigate-to', '/statistics');
        }
      }
    }
  ];
  
  // Registrar cada atajo
  featureShortcuts.forEach(shortcut => {
    try {
      if (globalShortcut.isRegistered(shortcut.key)) {
        globalShortcut.unregister(shortcut.key);
      }
      
      const success = globalShortcut.register(shortcut.key, shortcut.action);
      
      if (success) {
        log.info(`Atajo de característica "${shortcut.key}" registrado exitosamente`);
        registeredShortcuts.push(shortcut.key);
      } else {
        log.error(`Error al registrar atajo de característica "${shortcut.key}"`);
      }
    } catch (error) {
      log.error(`Error al registrar atajo "${shortcut.key}":`, error);
    }
  });
}

/**
 * Actualiza el atajo global principal
 * @param mainWindow Ventana principal
 * @param newShortcut Nuevo atajo a configurar
 */
export function updateGlobalShortcut(mainWindow: BrowserWindow, newShortcut: string): void {
  try {
    // Desregistrar el atajo anterior (si existe en la configuración)
    const previousShortcut = store.get('settings.globalShortcut', 'Control+Shift+Space') as string;
    if (globalShortcut.isRegistered(previousShortcut)) {
      globalShortcut.unregister(previousShortcut);
      // Eliminar de la lista de atajos registrados
      const index = registeredShortcuts.indexOf(previousShortcut);
      if (index > -1) {
        registeredShortcuts.splice(index, 1);
      }
    }
    
    // Guardar nuevo atajo en configuración
    store.set('settings.globalShortcut', newShortcut);
    
    // Registrar el nuevo atajo
    registerMainShortcut(mainWindow, newShortcut);
    
    log.info(`Atajo global actualizado a "${newShortcut}"`);
  } catch (error) {
    log.error('Error al actualizar atajo global:', error);
  }
}

/**
 * Desregistra todos los atajos globales
 */
export function unregisterAllShortcuts(): void {
  try {
    log.info('Desregistrando todos los atajos globales');
    
    // Desregistrar cada atajo individualmente
    registeredShortcuts.forEach(shortcut => {
      if (globalShortcut.isRegistered(shortcut)) {
        globalShortcut.unregister(shortcut);
        log.info(`Atajo "${shortcut}" desregistrado`);
      }
    });
    
    // Alternative: unregister all at once
    // globalShortcut.unregisterAll();
    
    // Limpiar lista de atajos
    registeredShortcuts.length = 0;
    
    log.info('Todos los atajos globales desregistrados');
  } catch (error) {
    log.error('Error al desregistrar atajos globales:', error);
  }
}