import { app, shell, BrowserWindow, session } from 'electron';
import { join, dirname } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { setupIPC } from './lib/ipc-handlers.js';
import { FileSystem } from './lib/file-system.js';
import { createApplicationMenu } from './lib/menu-handler.js';
import { logger } from './lib/logger.js';
import icon from '../../resources/icon.png?asset';
import { createCustomDialog } from './custom-dialog/index.js';

// Load environment variables from .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store main window reference to prevent garbage collection
let mainWindow = null;

/**
 * Creates the main application window with secure defaults
 *
 * @returns {BrowserWindow} The created window instance
 */
function createWindow() {
  // Create the browser window with secure defaults and native OS styling
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden', // Hide the title bar for a more native look
    width: is.dev ? 1200 : 800, // Adjusted width for development
    height: 800,
    show: false, // Don't show the window until it's ready
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}), // Use custom icon for Linux
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true, // Enable sandboxing for security
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false, // Disable Node.js integration for security
      webSecurity: true, // Enable web security for security
      allowRunningInsecureContent: false, // Disable insecure content loading
      enableRemoteModule: false // Disable remote module for security
    },
    icon: join(__dirname, 'main/lib/favicons/apple-icon-180x180.png')
  });

  // Create the application menu
  createApplicationMenu(mainWindow);

  // Show window when content is ready to prevent flickering
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links securely - open in default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Open devtools in development mode
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

// Utility function to access main window from other modules
/**
 *
 */
const getWindow = () => mainWindow;

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Log application startup
  logger.info('Application starting in environment:', process.env.NODE_ENV || 'undefined');
  
  // Set app ID for Windows notifications
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Create main application window
  const mainWindow = createWindow();
  // Create custom dialog instance
  const customDialog = createCustomDialog(mainWindow);
  setupIPC(getWindow(), FileSystem, customDialog); // Pass customDialog to setupIPC

  // Create new window on macOS when no windows are open
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Security Measures
 * These event handlers prevent unauthorized navigation and protect against common web vulnerabilities
 */
app.on('web-contents-created', (event, contents) => {
  // Restrict navigation to prevent unauthorized redirects
  contents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    // Allow both file:// URLs and same-origin navigation for development
    if (url.startsWith('file://') || (is.dev && parsedUrl.origin === 'http://localhost:5173')) {
      return; // Allow local navigation
    }
    event.preventDefault(); // Block external navigation
  });

  // Block new window creation (e.g., window.open)
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Prevent modification of window.opener on open windows
  contents.on('did-create-window', (window) => {
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  });
});

// Additional navigation handler for development mode
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (is.dev && parsedUrl.origin === 'http://localhost:5173') {
      return; // Allow navigation in dev mode
    }
  });
});
