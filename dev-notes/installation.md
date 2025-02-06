# Installation

## Initial Approach

Initially tried Electron Forge but encountered challenges:

- Friction with existing project structure
- Difficulty converting to ESM modules
- Problems with file structure reorganization

## Current Solution

Switched to [Electron Vite](https://electron-vite.org/) using the React template:

- Quick and straightforward setup
- Better compatibility with existing codebase

## Dependencies

Updated all dependencies with some key exceptions:

### React Version

- Using `react@18.2.0`
- Note: React 19.0.0 caused compatibility issues

### Installation Command

```bash
npm install --legacy-peer-deps
```

Note: The `--legacy-peer-deps` flag is required due to electron-vite's older Vite peer dependency.

Here's a summary of enabling sandbox: true in the electron-vite React template:

In main/index.js, changed BrowserWindow configuration:

```js
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  sandbox: true,
  contextIsolation: true,
  nodeIntegration: false
}
```

Modified preload/index.js to:

- Switch from ES Module imports to CommonJS require
- Create my own electronAPI object instead of using @electron-toolkit/preload
- Explicitly expose needed Node/Electron features like process.versions

```js
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
```

### Key Points:

- Kept file as preload/index.js (no need for .cjs)
- Maintained the same access pattern in React components (window.electron...)
- No impact on Vite's HMR or the template's watch mode
- More secure than sandbox: false
- Must explicitly expose any Node/Electron APIs needed in the renderer
