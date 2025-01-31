// preload/index.js
const { contextBridge, ipcRenderer } = require('electron');

const electronAPI = {
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, func) => {
      ipcRenderer.on(channel, func);
      return () => ipcRenderer.removeListener(channel, func);
    },
    once: (channel, func) => ipcRenderer.once(channel, func),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args)
  },
  // Add process information to match the existing component's expectations
  process: {
    versions: {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      v8: process.versions.v8
    }
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
  } catch (error) {
    console.error(error);
  }
}
