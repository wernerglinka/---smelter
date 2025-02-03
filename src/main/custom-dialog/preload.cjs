const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  customResponse: (data) => {
    return ipcRenderer.send('custom-dialog-response', data);
  },
  onUpdateDialogContent: (callback) => ipcRenderer.on('update-dialog-content', callback)
});
