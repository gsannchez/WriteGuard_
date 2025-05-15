import { useState, useEffect } from 'react';

// This is a placeholder implementation for web
// In the Electron app, this would use IPC to communicate with the main process
export function useExcludedApps() {
  const [excludedApps, setExcludedApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load excluded apps on mount
  useEffect(() => {
    const loadExcludedApps = async () => {
      setIsLoading(true);
      try {
        // In Electron, this would use the exposed electron API
        if (window.electron) {
          const apps = await window.electron.getExcludedApps();
          setExcludedApps(apps);
        } else {
          // Demo implementation for web
          const storedApps = localStorage.getItem('excludedApps');
          if (storedApps) {
            setExcludedApps(JSON.parse(storedApps));
          }
        }
      } catch (error) {
        console.error('Error loading excluded apps:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExcludedApps();
  }, []);
  
  const addExcludedApp = async (appName: string) => {
    try {
      if (window.electron) {
        // In Electron, this would use the exposed electron API
        const updatedApps = await window.electron.addExcludedApp(appName);
        setExcludedApps(updatedApps);
      } else {
        // Demo implementation for web
        const updatedApps = [...excludedApps, appName];
        setExcludedApps(updatedApps);
        localStorage.setItem('excludedApps', JSON.stringify(updatedApps));
      }
    } catch (error) {
      console.error('Error adding excluded app:', error);
    }
  };
  
  const removeExcludedApp = async (appName: string) => {
    try {
      if (window.electron) {
        // In Electron, this would use the exposed electron API
        const updatedApps = await window.electron.removeExcludedApp(appName);
        setExcludedApps(updatedApps);
      } else {
        // Demo implementation for web
        const updatedApps = excludedApps.filter(app => app !== appName);
        setExcludedApps(updatedApps);
        localStorage.setItem('excludedApps', JSON.stringify(updatedApps));
      }
    } catch (error) {
      console.error('Error removing excluded app:', error);
    }
  };
  
  return {
    excludedApps,
    addExcludedApp,
    removeExcludedApp,
    isLoading
  };
}

// Add TypeScript definitions for the window.electron object
declare global {
  interface Window {
    electron?: {
      getExcludedApps: () => Promise<string[]>;
      addExcludedApp: (appName: string) => Promise<string[]>;
      removeExcludedApp: (appName: string) => Promise<string[]>;
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      toggleTextMonitor: (active: boolean) => Promise<boolean>;
      on: (channel: string, callback: (data: any) => void) => () => void;
    };
  }
}