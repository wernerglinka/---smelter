const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   *
   * @param data
   */
  customResponse: (data) => ipcRenderer.send('custom-dialog-response', data),
  /**
   *
   * @param callback
   */
  onUpdateDialogContent: (callback) => ipcRenderer.on('update-dialog-content', callback)
});
