import { app, Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
import Store from 'electron-store';
import log from 'electron-log';

// Configuración para almacenar preferencias
const store = new Store();

let trayInstance: Tray | null = null;

/**
 * Crea y configura el icono en la bandeja del sistema
 * @param mainWindow Ventana principal de la aplicación
 * @param toggleTextMonitorCallback Función para activar/desactivar el monitor de texto
 */
export function createTray(
  mainWindow: BrowserWindow,
  toggleTextMonitorCallback: (active: boolean) => void
): Tray {
  if (trayInstance) {
    return trayInstance;
  }

  try {
    log.info('Iniciando la creación del ícono en la bandeja del sistema');

    // Ruta al ícono de la bandeja (16x16, 32x32)
    const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

    // Crear la instancia de la bandeja
    trayInstance = new Tray(trayIcon);
    trayInstance.setToolTip('Asistente de Escritura Inteligente');

    // Verificar estado actual del monitor de texto
    const isTextMonitorActive = store.get('textMonitorActive', true);

    // Función para actualizar el menú contextual
    const updateContextMenu = () => {
      const isOfflineMode = store.get('workOffline', false);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Abrir Asistente',
          click: () => {
            if (!mainWindow.isVisible()) {
              mainWindow.show();
            } else {
              mainWindow.focus();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Monitor de Texto',
          type: 'checkbox',
          checked: store.get('textMonitorActive', true) as boolean,
          click: (menuItem) => {
            store.set('textMonitorActive', menuItem.checked);
            toggleTextMonitorCallback(menuItem.checked);
            // Actualizar tooltip
            trayInstance?.setToolTip(
              `Asistente de Escritura Inteligente - Monitor ${menuItem.checked ? 'Activado' : 'Desactivado'}`
            );
          }
        },
        {
          label: 'Modo Offline',
          type: 'checkbox',
          checked: isOfflineMode,
          click: (menuItem) => {
            store.set('workOffline', menuItem.checked);
            // También actualizar en la configuración global
            store.set('settings.workOffline', menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'Configuración',
          click: () => {
            if (!mainWindow.isVisible()) {
              mainWindow.show();
            }
            // Enviar evento a renderer para navegar a configuración
            mainWindow.webContents.send('navigate-to', '/settings');
          }
        },
        {
          label: 'Estadísticas',
          click: () => {
            if (!mainWindow.isVisible()) {
              mainWindow.show();
            }
            // Enviar evento a renderer para navegar a estadísticas
            mainWindow.webContents.send('navigate-to', '/statistics');
          }
        },
        { type: 'separator' },
        {
          label: 'Salir',
          click: () => app.quit()
        }
      ]);

      trayInstance?.setContextMenu(contextMenu);
    };

    // Configurar evento de doble clic para mostrar la aplicación
    trayInstance.on('double-click', () => {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      } else {
        mainWindow.focus();
      }
    });

    // Inicializar menú
    updateContextMenu();

    // Escuchar cambios en la configuración para actualizar el menú
    store.onDidChange('workOffline', () => {
      updateContextMenu();
    });

    log.info('Ícono de bandeja creado exitosamente');

    return trayInstance;
  } catch (error) {
    log.error('Error al crear el ícono de bandeja:', error);
    // Crear un ícono de bandeja dummy en caso de error
    const dummyTray = new Tray(nativeImage.createEmpty());
    dummyTray.setToolTip('Asistente de Escritura Inteligente (Error)');
    trayInstance = dummyTray;
    return dummyTray;
  }
}

/**
 * Destruye la instancia del ícono de bandeja
 */
export function destroyTray() {
  if (trayInstance) {
    trayInstance.destroy();
    trayInstance = null;
  }
}

/**
 * Actualiza el texto o estado del ícono de bandeja
 * @param text Texto a mostrar en la bandeja
 */
export function updateTrayTooltip(text: string) {
  if (trayInstance) {
    trayInstance.setToolTip(text);
  }
}

/**
 * Obtiene el estado actual del monitor de texto
 * @returns Estado actual (activo/inactivo)
 */
export function getTextMonitorState(): boolean {
  return store.get('textMonitorActive', true) as boolean;
}