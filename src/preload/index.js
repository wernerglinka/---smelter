// preload/index.js

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure IPC communication layer between renderer and main processes
 * All methods must be explicitly exposed here to be available in the renderer
 */
const electronAPI = {
  // Base IPC operations
  ipcRenderer: {
    /**
     *
     * @param channel
     * @param data
     */
    send: (channel, data) => ipcRenderer.send(channel, data),
    /**
     *
     * @param channel
     * @param func
     */
    on: (channel, func) => {
      /**
       *
       * @param event
       * @param {...any} args
       */
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    /**
     *
     * @param channel
     * @param func
     */
    once: (channel, func) => ipcRenderer.once(channel, func),
    /**
     *
     * @param channel
     * @param {...any} args
     */
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    /**
     *
     * @param channel
     * @param callback
     */
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback)
  },

  // Application lifecycle
  /**
   *
   * @param callback
   */
  onReady: (callback) => ipcRenderer.on('app-ready', callback),

  // Dialog operations
  dialog: {
    /**
     *
     * @param method
     * @param config
     */
    open: (method, config) => ipcRenderer.invoke('dialog', method, config),
    /**
     *
     * @param message
     */
    showConfirmation: (message) => ipcRenderer.invoke('showConfirmationDialog', message),
    /**
     *
     * @param message
     */
    prompt: (message) => ipcRenderer.invoke('dialog-prompt', message),
    /**
     *
     * @param options
     */
    showCustomMessage: (options) => ipcRenderer.invoke('custom-dialog-message', options),
    /**
     *
     * @param response
     */
    customResponse: (response) => ipcRenderer.invoke('custom-dialog-response', response)
  },

  // File system operations
  files: {
    /**
     *
     * @param data
     */
    write: (data) => ipcRenderer.invoke('writeFile', data),
    /**
     *
     * @param data
     */
    writeYAML: (data) => ipcRenderer.invoke('writeYAMLFile', data),
    /**
     *
     * @param filePath
     */
    read: (filePath) => ipcRenderer.invoke('readFile', filePath),
    /**
     *
     * @param filePath
     */
    delete: (filePath) => ipcRenderer.invoke('deleteFile', filePath),
    /**
     *
     * @param filePath
     */
    exists: (filePath) => ipcRenderer.invoke('fileExists', filePath)
  },

  // Directory operations
  directories: {
    /**
     *
     * @param directoryPath
     */
    read: (directoryPath) => ipcRenderer.invoke('readDirectory', directoryPath),
    /**
     *
     * @param templatesDirName
     */
    getTemplates: (templatesDirName) => ipcRenderer.invoke('getTemplates', templatesDirName),
    /**
     *
     * @param directoryPath
     */
    delete: (directoryPath) => ipcRenderer.invoke('deleteDirectory', directoryPath),
    /**
     *
     * @param directoryPath
     */
    exists: (directoryPath) => ipcRenderer.invoke('directoryExists', directoryPath)
  },

  // Markdown operations
  markdown: {
    /**
     *
     * @param data
     */
    write: (data) => ipcRenderer.invoke('writeMarkdownFile', data),
    /**
     *
     * @param filePath
     */
    read: (filePath) => ipcRenderer.invoke('readMarkdownFile', filePath),
    /**
     *
     * @param data
     */
    writeObject: (data) => ipcRenderer.invoke('writeObjectToFile', data)
  },

  // Utility functions
  utils: {
    /**
     *
     * @param data
     */
    toYAML: (data) => ipcRenderer.invoke('convert-to-yaml', data)
  },

  // Git operations
  git: {
    /**
     *
     * @param params
     */
    clone: async (params) => {
      console.log('Preload: Invoking git-clone');
      const result = await ipcRenderer.invoke('git-clone', params);
      console.log('Preload: git-clone result:', result);
      return result;
    },
    /**
     *
     * @param params
     */
    commit: (params) => ipcRenderer.invoke('git-commit', params),
    /**
     *
     * @param projectPath
     */
    status: (projectPath) => ipcRenderer.invoke('git-status', { projectPath })
  },

  // NPM operations
  npm: {
    /**
     *
     * @param projectPath
     */
    install: (projectPath) =>
      ipcRenderer.invoke('npm-command', { command: 'install', projectPath }),
    /**
     *
     * @param projectPath
     */
    start: (projectPath) => ipcRenderer.invoke('npm-command', { command: 'start', projectPath }),
    /**
     *
     */
    stop: () => ipcRenderer.invoke('npm-stop'),
    /**
     *
     * @param callback
     */
    onOutput: (callback) => {
      /**
       *
       * @param event
       * @param data
       */
      const subscription = (event, data) => callback(data);
      ipcRenderer.on('npm-output', subscription);
      return () => ipcRenderer.removeListener('npm-output', subscription);
    },
    /**
     *
     * @param callback
     */
    onError: (callback) => {
      /**
       *
       * @param event
       * @param error
       */
      const subscription = (event, error) => callback(error);
      ipcRenderer.on('npm-error', subscription);
      return () => ipcRenderer.removeListener('npm-error', subscription);
    }
  },

  // Process information
  process: {
    versions: {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      v8: process.versions.v8
    }
  }
};

// Expose the API only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Failed to expose electronAPI to renderer', error);
  }
}
