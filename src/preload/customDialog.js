const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  customResponse: (data) => {
    console.log('Preload: Sending custom-dialog-response', data);
    return ipcRenderer.send('custom-dialog-response', data);
  },
  onUpdateDialogContent: (callback) => ipcRenderer.on('update-dialog-content', callback)
});

console.log('Custom dialog preload script loaded');
