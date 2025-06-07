(async () => {
  const electron = await import('electron');
  const { contextBridge, ipcRenderer } = electron;

  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld(
    'electron',
    {
      ipcRenderer: {
        send: (channel, data) => {
          // whitelist channels
          let validChannels = ['toggle-fullscreen'];
          if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
          }
        },
        receive: (channel, func) => {
          let validChannels = ['toggle-fullscreen-response'];
          if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
        }
      }
    }
  );
})(); 