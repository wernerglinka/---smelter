import { ipcMain, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
const { app } = require('electron');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instead of reading external files, include styles and script directly
const dialogStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: #fff;
  }
  .message-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  .message {
    margin-bottom: 10px;
  }
  .log-output {
    background: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    font-family: monospace;
    white-space: pre-wrap;
  }
  .buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  button {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background: #0366d6;
    color: white;
    cursor: pointer;
  }
  button:hover {
    background: #0255b3;
  }
  .input {
    margin: 10px 0;
  }
  .input input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const dialogScript = `
  // Wait for DOMContentLoaded to ensure electronAPI is available
  document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('button').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const value = document.getElementById('inputValue')?.value;

        try {
          if (!window.electronAPI) {
            throw new Error('electronAPI not found');
          }
          if (!window.electronAPI.customResponse) {
            throw new Error('customResponse not found');
          }
          window.electronAPI.customResponse({ index, value });
        } catch (error) {
          console.error('Error sending response:', error);
        }
      });
    });
  });
`;

// Function to create a new dialog window
/**
 *
 * @param parentWindow
 * @param options
 */
const createDialogWindow = (parentWindow, options) => {
  // Get the correct path whether in development or production
  const preloadPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar', 'out', 'preload', 'customDialog.js')
    : path.join(__dirname, '..', '..', 'out', 'preload', 'customDialog.js');

  const win = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    frame: false,
    width: 600,
    height: 400,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      sandbox: false
    },
    ...options
  });

  return win;
};

// Function to create the HTML content for the custom dialog
/**
 *
 * @param root0
 * @param root0.type
 * @param root0.message
 * @param root0.logOutput
 * @param root0.buttons
 * @param root0.input
 */
const createCustomDialogHTML = ({ type, message, logOutput = '', buttons, input }) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'">
    <style>${dialogStyles}</style>
  </head>
  <body>
    <div class="message-container">
      <div class="message">${message}</div>
      ${type === 'progress' ? `<div class="log-output">${logOutput}</div>` : ''}
      ${input ? '<div class="input"><input type="text" id="inputValue" /></div>' : ''}
      <div class="buttons">
        ${buttons ? buttons.map((btn) => `<button>${btn}</button>`).join('') : ''}
      </div>
    </div>
    <script>${dialogScript}</script>
  </body>
</html>
`;

/**
 * Creates and manages custom dialogs
 *
 * @param {BrowserWindow} window - The main application window
 * @returns {object} Object containing dialog functions
 */
export const createCustomDialog = (window) => {
  let progressWindow = null;

  return {
    /**
     * Shows a custom message dialog
     *
     * @param {object} options - Dialog options
     * @param {string} options.type - Dialog type ('custom', 'progress', etc.)
     * @param {string} options.message - Message to display
     * @param {string} [options.logOutput] - Log output for progress dialogs
     * @param {string[]} [options.buttons] - Array of button labels
     * @param {boolean} [options.input] - Whether to show an input field
     * @returns {Promise<object>} Dialog result
     */
    showMessage: async (options) => {
      return new Promise((resolve) => {
        const win = createDialogWindow(window, options);

        const responseHandler = (event, response) => {
          win.close();
          resolve({ response });
        };

        // Clean up existing listeners before adding new one
        ipcMain.removeAllListeners('custom-dialog-response');
        ipcMain.once('custom-dialog-response', responseHandler);

        win.on('closed', () => {
          ipcMain.removeListener('custom-dialog-response', responseHandler);
        });

        const html = createCustomDialogHTML(options);
        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        // For debugging, open DevTools in the dialog window
        if (process.env.NODE_ENV === 'development') {
          win.webContents.openDevTools();
        }

        if (!options.buttons || options.buttons.length === 0) {
          progressWindow = win;
          resolve({ type: 'progress' });
        }
      });
    },

    /**
     * Closes the progress dialog
     */
    closeProgress: () => {
      if (progressWindow) {
        progressWindow.close();
        progressWindow = null;
      }
    }
  };
};
