import { ipcMain, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';

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
  window.electronAPI.onUpdateDialogContent((event, { message, logOutput }) => {
    const messageEl = document.querySelector('.message');
    const logEl = document.querySelector('.log-output');

    if (messageEl && message) {
      messageEl.textContent = message;
    }
    if (logEl && logOutput) {
      logEl.textContent = logOutput;
      logEl.scrollTop = logEl.scrollHeight;
    }
  });

  const logDiv = document.querySelector('.log-output');
  if (logDiv) {
    const observer = new MutationObserver(() => {
      logDiv.scrollTop = logDiv.scrollHeight;
    });
    observer.observe(logDiv, { childList: true, characterData: true, subtree: true });
  }

  document.querySelectorAll('button').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const value = document.getElementById('inputValue')?.value;
      window.electronAPI.customResponse({ index, value });
    });
  });
`;

// Function to create a new dialog window
const createDialogWindow = (parentWindow, options) => {
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
      preload: path.join(__dirname, 'preload.cjs')
    },
    ...options
  });

  return win;
};

// Function to create the HTML content for the custom dialog
const createCustomDialogHTML = ({ type, message, logOutput = '', buttons, input }) => `
 <!DOCTYPE html>
 <html>
  <head>
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
 * @param {BrowserWindow} window - The main application window
 * @returns {Object} Object containing dialog functions
 */
export const createCustomDialog = (window) => {
  let progressWindow = null;

  return {
    /**
     * Shows a custom message dialog
     * @param {Object} options - Dialog options
     * @param {string} options.type - Dialog type ('custom', 'progress', etc.)
     * @param {string} options.message - Message to display
     * @param {string} [options.logOutput] - Log output for progress dialogs
     * @param {string[]} [options.buttons] - Array of button labels
     * @param {boolean} [options.input] - Whether to show an input field
     * @returns {Promise<Object>} Dialog result
     */
    showMessage: async (options) => {
      return new Promise((resolve) => {
        // Create a new dialog window
        const win = createDialogWindow(window, options);

        // Function to handle dialog response
        const responseHandler = (event, response) => {
          win.close();
          // Don't pass the window reference in the response
          resolve({ response });
        };

        // Listen for dialog response
        ipcMain.removeAllListeners('custom-dialog-response');
        ipcMain.once('custom-dialog-response', responseHandler);

        // Close the dialog when the window is closed
        win.on('closed', () => {
          ipcMain.removeListener('custom-dialog-response', responseHandler);
        });

        // Load the dialog content
        const html = createCustomDialogHTML(options);
        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        // Resolve immediately if no buttons are provided
        if (!options.buttons || options.buttons.length === 0) {
          progressWindow = win;
          // Don't pass the window reference
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
