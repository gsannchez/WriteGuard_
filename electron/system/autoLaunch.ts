import AutoLaunch from 'auto-launch';
import { app } from 'electron';
import Store from 'electron-store';
import log from 'electron-log';
import path from 'path';

// Configuración para almacenar preferencias
const store = new Store();

// Instancia del auto launcher
let autoLauncher: AutoLaunch | null = null;

/**
 * Inicializa el sistema de auto-arranque
 */
export function initAutoLaunch(): void {
  try {
    log.info('Inicializando sistema de auto-arranque');
    
    const appName = app.getName();
    const appPath = app.getPath('exe');
    
    // Crear la instancia de auto-launch
    autoLauncher = new AutoLaunch({
      name: appName,
      path: appPath,
      isHidden: true, // Iniciar minimizado
    });
    
    // Verificar si el arranque automático está habilitado en la configuración
    const startOnBoot = store.get('settings.startOnBoot', true) as boolean;
    
    // Configurar según la preferencia del usuario
    setAutoLaunchState(startOnBoot)
      .then(() => {
        log.info(`Auto-arranque inicializado (estado: ${startOnBoot ? 'activado' : 'desactivado'})`);
      })
      .catch(error => {
        log.error('Error al inicializar auto-arranque:', error);
      });
  } catch (error) {
    log.error('Error al crear instancia de auto-arranque:', error);
  }
}

/**
 * Activa o desactiva el auto-arranque
 * @param enable Estado a configurar (true para activar)
 * @returns Promesa que se resuelve cuando se completa la operación
 */
export async function setAutoLaunchState(enable: boolean): Promise<void> {
  if (!autoLauncher) {
    log.warn('No se pudo configurar auto-arranque: instancia no inicializada');
    return;
  }
  
  try {
    // Verificar el estado actual
    const isEnabled = await autoLauncher.isEnabled();
    
    // Solo cambiar si es necesario
    if (enable && !isEnabled) {
      await autoLauncher.enable();
      log.info('Auto-arranque activado');
    } else if (!enable && isEnabled) {
      await autoLauncher.disable();
      log.info('Auto-arranque desactivado');
    }
    
    // Guardar estado en configuración
    store.set('settings.startOnBoot', enable);
  } catch (error) {
    log.error('Error al configurar auto-arranque:', error);
    throw error;
  }
}

/**
 * Verifica si el auto-arranque está habilitado
 * @returns Promesa que se resuelve con el estado actual
 */
export async function isAutoLaunchEnabled(): Promise<boolean> {
  if (!autoLauncher) {
    return false;
  }
  
  try {
    return await autoLauncher.isEnabled();
  } catch (error) {
    log.error('Error al verificar estado de auto-arranque:', error);
    return false;
  }
}