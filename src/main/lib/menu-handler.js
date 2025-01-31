// menu-handler.js
import { Menu, app, ipcMain } from 'electron';

/**
 *
 * @param window
 */
const createApplicationMenu = (window) => {
  const template = [
    ...(process.platform === 'darwin'
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' }]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'NPM',
      submenu: [
        {
          label: 'Install Dependencies',
          /**
           *
           */
          click: () => window.webContents.send('npm-install-trigger'),
          id: 'npm-install',
          enabled: false
        },
        {
          label: 'Start Project',
          /**
           *
           */
          click: () => window.webContents.send('npm-start-trigger'),
          id: 'npm-start',
          enabled: false
        },
        {
          label: 'Stop Project',
          /**
           *
           */
          click: () => window.webContents.send('npm-stop-trigger'),
          id: 'npm-stop',
          enabled: false
        }
      ]
    },
    {
      label: 'Git',
      submenu: [
        {
          label: 'Clone Repository',
          /**
           *
           */
          click: () => window.webContents.send('git-clone-trigger'),
          id: 'git-clone',
          enabled: true // Clone can always be available as it's a way to open a project
        },
        {
          label: 'Commit Changes',
          /**
           *
           */
          click: () => window.webContents.send('git-commit-trigger'),
          id: 'git-commit',
          enabled: false // Initially disabled
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Expose methods to enable/disable items
  ipcMain.on('npm-state-change', (event, { running, hasNodeModules, hasProject }) => {
    menu.getMenuItemById('npm-start').enabled = hasProject && !running && hasNodeModules;
    menu.getMenuItemById('npm-stop').enabled = hasProject && running;
    menu.getMenuItemById('npm-install').enabled = hasProject && !hasNodeModules;
  });

  // Expose methods to enable/disable git commit menu option
  ipcMain.on('git-state-change', (event, { hasChanges, hasProject }) => {
    menu.getMenuItemById('git-commit').enabled = hasProject && hasChanges;
  });

  return menu;
};

export { createApplicationMenu };
