const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Settings management
    getSettings: () => ipcRenderer.invoke('get-settings'),
    updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
    
    // System information
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    
    // Text monitoring control
    toggleTextMonitor: (active) => ipcRenderer.invoke('toggle-text-monitor', active),
    
    // Excluded applications management
    addExcludedApp: (appName) => ipcRenderer.invoke('add-excluded-app', appName),
    removeExcludedApp: (appName) => ipcRenderer.invoke('remove-excluded-app', appName),
    getExcludedApps: () => ipcRenderer.invoke('get-excluded-apps'),
    
    // Event listeners
    on: (channel, callback) => {
      // Whitelist channels we are allowed to listen to
      const validChannels = [
        'text-monitor-status-changed', 
        'correction-suggestion',
        'autocomplete-suggestion'
      ];
      if (validChannels.includes(channel)) {
        const newCallback = (_, data) => callback(data);
        ipcRenderer.on(channel, newCallback);
        
        // Return a function to remove the event listener
        return () => {
          ipcRenderer.removeListener(channel, newCallback);
        };
      }
    }
  }
);