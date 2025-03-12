import { ipcMain } from 'electron';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'yaml';
import { createDialogOperations } from './dialog.js';
import { fileURLToPath } from 'url';

/**
 * Clean an object by removing empty strings
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
const cleanObjectEmptyStrings = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectEmptyStrings(item));
  }
  
  // Handle objects
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    // If value is an empty string, set to null to avoid "" in YAML
    if (value === '') {
      result[key] = null;
    }
    // If value is an object or array, recursively clean it
    else if (typeof value === 'object' && value !== null) {
      result[key] = cleanObjectEmptyStrings(value);
    }
    // Otherwise, keep the value as-is
    else {
      result[key] = value;
    }
  });
  
  return result;
};
import { CONSTANTS } from './constants.js';
import { FileSystem } from './file-system.js';
import simpleGit from 'simple-git';
import prompt from 'electron-prompt';
import { readdirSync } from 'node:fs';
import { createNPMHandlers } from './npm-handlers.js';
import { createGitHandlers } from './git-handlers.js';
import { createCustomDialog } from '../custom-dialog/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param window
 */
const createIPCHandlers = (window) => {
  const dialogOps = createDialogOperations(window);
  const handlers = {
    /**
     * Dialog operation handlers for user interactions
     */

    /**
     * Checks if a file exists in the filesystem
     *
     * @param {Event} event - IPC event object
     * @param {string} filePath - Path to check
     * @returns {object} Operation result with exists boolean
     * @example
     * const result = await handleFileExists(event, '/path/to/check.md')
     */
    handleFileExists: async (event, filePath) => {
      try {
        return {
          status: 'success',
          data: FileSystem.fileExists(filePath)
        };
      } catch (error) {
        return {
          status: 'failure',
          error: error.message
        };
      }
    },

    /**
     * Checks if a directory exists in the filesystem
     *
     * @param {Event} event - IPC event object
     * @param {string} dirPath - Path to check
     * @returns {object} Operation result with exists boolean
     * @example
     * const result = await handleDirectoryExists(event, '/path/to/dir')
     */
    handleDirectoryExists: async (event, dirPath) => {
      try {
        return {
          status: 'success',
          data: FileSystem.directoryExists(dirPath)
        };
      } catch (error) {
        return {
          status: 'failure',
          error: error.message
        };
      }
    },

    /**
     * Shows a prompt dialog with a message
     *
     * @param {Event} event - IPC event object
     * @param {string} message - Message to display in prompt
     * @returns {Promise<string|null>} User's input or null if cancelled
     */
    handlePromptDialog: async (event, message) => {
      const result = await prompt({
        title: 'Git Commit',
        label: message,
        type: 'input'
      });
      return result;
    },

    /**
     * Shows a dialog with specified method and parameters
     *
     * @param {Event} event - IPC event object
     * @param {string} method - Dialog method to use (e.g., 'showOpenDialog')
     * @param {object} params - Dialog parameters
     * @returns {Promise<object>} Dialog result
     * @example
     * handleDialog(event, 'showOpenDialog', {
     *   properties: ['openDirectory']
     * })
     */
    handleDialog: async (event, method, params) => dialogOps.showDialog(method, params),

    /**
     * Shows a confirmation dialog with custom message
     *
     * @param {Event} event - IPC event object
     * @param {string} message - Message to display
     * @returns {Promise<boolean>} User's confirmation result
     * @example
     * handleConfirmationDialog(event, 'Delete this project?')
     */
    handleConfirmationDialog: async (event, message) => dialogOps.showConfirmation(message),

    /**
     * Shows a message dialog box
     *
     * @param {Event} event - IPC event object
     * @param {object} options - Dialog options
     * @param {string} options.type - Dialog type ('info', 'error', etc.)
     * @param {string} options.message - Message to display
     * @param {string[]} options.buttons - Array of button labels
     * @returns {Promise<object>} Dialog result
     */
    handleMessageDialog: async (event, options) => dialogOps.showDialog('showMessageBox', options),

    /**
     * Handles writing file data to the filesystem
     *
     * @param {Event} event - IPC event object
     * @param {object} data - Data to write
     * @param {object} data.obj - JavaScript object to serialize
     * @param {string} data.path - Full file path to write to
     * @throws {Error} If path is missing or write fails
     * @example
     * handleWriteFile(event, {
     *   obj: { key: 'value' },
     *   path: '/path/to/file.json'
     * })
     */
    handleWriteFile: async (event, data) => {
      try {
        // Validate required path
        if (!data?.path) {
          throw new Error('File path is required');
        }

        // Ensure directory exists before writing
        await FileSystem.ensureDirectoryExists(path.dirname(data.path));

        // Clean object to handle empty strings
        const cleanedObj = cleanObjectEmptyStrings(data.obj);

        // Write prettified JSON
        return FileSystem.writeFile(data.path, JSON.stringify(cleanedObj, null, 2));
      } catch (error) {
        console.error('Error in handleWriteFile:', error);
        throw error;
      }
    },

    /**
     * Reads and parses JSON file from filesystem
     *
     * @param {Event} event - IPC event object
     * @param {string} filePath - Path to JSON file
     * @returns {object} Result object
     * @returns {string} result.status - 'success' or 'failure'
     * @returns {object} [result.data] - Parsed JSON data
     * @returns {string} [result.error] - Error message if failed
     * @example
     * handleReadFile(event, '/path/to/config.json')
     */
    handleReadFile: async (event, filePath) => {
      const result = FileSystem.readFile(filePath);
      if (result.status === 'success') {
        try {
          return {
            status: 'success',
            data: JSON.parse(result.data)
          };
        } catch (error) {
          return {
            status: 'failure',
            error: 'Invalid JSON format'
          };
        }
      }
      return result;
    },

    /**
     * Handles writing YAML data to filesystem
     *
     * @param {Event} event - IPC event
     * @param {object} data - Data to write
     * @param {object} data.obj - Object to convert to YAML
     * @param {string} data.path - File path
     * @returns {Promise<object>} Operation result
     * @throws {Error} If path missing or write fails
     */
    handleWriteYAML: async (event, { obj, path: filePath }) => {
      try {
        if (!filePath) {
          throw new Error('File path is required');
        }

        // Clean object to handle empty strings
        const cleanedObj = cleanObjectEmptyStrings(obj);
        
        // Convert to YAML with frontmatter markers
        const yamlContent = `---\n${yaml.stringify(cleanedObj)}---\n`;

        // Ensure directory exists
        await FileSystem.ensureDirectoryExists(path.dirname(filePath));

        // Write file
        return FileSystem.writeFile(filePath, yamlContent);
      } catch (error) {
        console.error('Error writing YAML:', error);
        return {
          status: 'failure',
          error: error.message
        };
      }
    },

    /**
     * Converts data to YAML format
     *
     * @param {Event} event - IPC event object
     * @param {object} data - Data to convert to YAML
     * @returns {string} YAML string
     */
    handleYAMLConversion: async (event, data) => {
      try {
        return yaml.stringify(data);
      } catch (error) {
        console.error('Error converting to YAML:', error);
        throw error;
      }
    },

    /**
     * Handles markdown file operations (read/write)
     *
     * @param {Event} event - IPC event object
     * @param {'read'|'write'} operation - Operation to perform
     * @param {string} filePath - Path to markdown file
     * @param {string} [data] - Content to write (for write operations)
     * @returns {object} Operation result
     * @returns {string} result.status - 'success' or 'failure'
     * @returns {object} [result.data] - File data for read operations
     * @returns {object} [result.data.frontmatter] - Parsed frontmatter
     * @returns {string} [result.data.content] - File content
     * @returns {string} [result.error] - Error message if failed
     * @example
     * // Reading markdown
     * const result = await handleMarkdownOperations(event, 'read', '/path/to/file.md')
     *
     * // Writing markdown
     * await handleMarkdownOperations(event, 'write', '/path/to/file.md', '# Title\nContent')
     */
    handleMarkdownOperations: async (event, operation, filePath, data = null) => {
      try {
        switch (operation) {
          case 'read': {
            const result = FileSystem.readFile(filePath);
            if (result.status === 'success') {
              const { data: frontmatter, content } = matter(result.data);
              return {
                status: 'success',
                data: { frontmatter, content: content || '' }
              };
            }
            return result;
          }

          case 'write': {
            FileSystem.ensureDirectoryExists(path.dirname(filePath));
            return FileSystem.writeFile(filePath, data);
          }

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error) {
        return { status: 'failure', error: error.message };
      }
    },

    /**
     * Deletes a file from the filesystem
     *
     * @param {Event} event - IPC event object
     * @param {string} filePath - Path to file to delete
     * @returns {object} Operation result
     * @returns {string} result.status - 'success' or 'failure'
     * @returns {string} [result.error] - Error message if failed
     * @example
     * await handleDeleteFile(event, '/path/to/delete.md')
     */
    handleDeleteFile: async (event, filePath) => FileSystem.deleteFile(filePath),

    /**
     * Deletes a directory from the filesystem
     *
     * @param {Event} event - IPC event object
     * @param {string} filePath - Path to directory to delete
     * @param dirPath
     * @returns {object} Operation result
     * @returns {string} result.status - 'success' or 'failure'
     * @returns {string} [result.error] - Error message if failed
     * @example
     * await handleDeleteDirectory(event, '/path/to/dir')
     */
    handleDeleteDirectory: async (event, dirPath) => FileSystem.deleteDirectory(dirPath),

    /**
     * Gets template files from specified directory
     *
     * @param {Event} event - IPC event object
     * @param {string} templatesDirName - Name of templates directory
     * @returns {object} Operation result
     * @returns {string} result.status - 'success' or 'failure'
     * @returns {object} result.data - Directory structure tree
     * @returns {string} [result.error] - Error message if failed
     * @example
     * const result = await handleGetTemplates(event, 'templates')
     */
    handleGetTemplates: async (event, templatesDirName) => {
      const templatesDir = FileSystem.getAbsolutePath(templatesDirName);
      return {
        status: 'success',
        data: FileSystem.readDirectoryStructure(templatesDir)
      };
    },

    /**
     * Writes an object as YAML frontmatter to a file, with optional content
     *
     * @param {Event} event - IPC event object
     * @param {object} params - Write parameters
     * @param {string} params.path - File path
     * @param {object} params.obj - Object to serialize as YAML
     * @param {string} [params.content] - Optional markdown content to append after frontmatter
     * @returns {object} Operation result
     * @returns {string} result.status - 'success' or 'failure'
     * @returns {string} [result.error] - Error message if failed
     * @example
     * await handleWriteObjectToFile(event, {
     *   path: '/path/to/file.md',
     *   obj: { title: 'Page Title', draft: false },
     *   content: '# Markdown content here'
     * })
     */
    handleWriteObjectToFile: async (event, { path: filePath, obj, content = '' }) => {
      // Clean object to handle empty strings
      const cleanedObj = cleanObjectEmptyStrings(obj);
      
      // Convert to YAML
      const yamlString = yaml.stringify(cleanedObj);
      
      // Only include content if it's not empty after trimming
      // If content is empty or just whitespace, write only the frontmatter
      // This prevents "" from appearing in the content section
      const contentTrimmed = content.trim();
      const fileContent = contentTrimmed 
        ? `---\n${yamlString}---\n\n${contentTrimmed}`
        : `---\n${yamlString}---\n`;
      
      return FileSystem.writeFile(filePath, fileContent);
    },

    /**
     * Creates a new directory
     *
     * @param {Event} event - IPC event object
     * @param {string} dirPath - Path where to create directory
     * @returns {object} Operation result
     */
    handleCreateDirectory: async (event, dirPath) => {
      try {
        // Check if directory exists
        const exists = FileSystem.directoryExists(dirPath);

        if (exists) {
          return {
            status: 'failure',
            error: 'Directory already exists'
          };
        }

        // Create directory
        await FileSystem.createDirectory(dirPath);

        return {
          status: 'success',
          data: 'Directory created successfully'
        };
      } catch (error) {
        console.error('Error in handleCreateDirectory:', error);
        return {
          status: 'failure',
          error: error.message
        };
      }
    }
  };

  return handlers;
};

/**
 *
 * @param window
 */
const setupIPC = (window) => {
  const dialogOps = createDialogOperations(window);
  const customDialog = createCustomDialog(window);

  // Add showCustomMessage to dialogOps
  dialogOps.showCustomMessage = customDialog.showMessage;
  dialogOps.closeProgress = customDialog.closeProgress;

  const handlers = createIPCHandlers(window);
  const npmHandlers = createNPMHandlers(window, dialogOps); // Add dialogOps here
  const gitHandlers = createGitHandlers(window, dialogOps);

  // Register all handlers
  ipcMain.handle('ready', () => true);

  // npm handlers
  ipcMain.handle('npm-command', npmHandlers.handleNpmCommand);
  ipcMain.handle('npm-stop', npmHandlers.handleNpmStop);

  // git handlers
  ipcMain.handle('git-commit', gitHandlers.handleGitCommit);
  ipcMain.handle('git-clone', gitHandlers.handleGitClone);
  ipcMain.handle('git-status', gitHandlers.handleGitStatus);

  // custom dialog handlers
  ipcMain.handle('custom-dialog-message', async (event, options) => {
    return customDialog.showMessage(options);
  });

  ipcMain.on('custom-dialog-response', (event, response) => {
    event.sender.send('custom-dialog-response', response);
  });

  ipcMain.handle('fileExists', handlers.handleFileExists);
  ipcMain.handle('directoryExists', handlers.handleDirectoryExists);
  ipcMain.handle('dialog', handlers.handleDialog);
  ipcMain.handle('dialog-prompt', handlers.handlePromptDialog);
  ipcMain.handle('dialog-message', handlers.handleMessageDialog);
  ipcMain.handle('showConfirmationDialog', handlers.handleConfirmationDialog);
  ipcMain.handle('writeFile', handlers.handleWriteFile);
  ipcMain.handle('writeYAMLFile', handlers.handleWriteYAML);
  ipcMain.handle('convert-to-yaml', handlers.handleYAMLConversion);
  ipcMain.handle('readFile', handlers.handleReadFile);
  ipcMain.handle('readMarkdownFile', (e, path) =>
    handlers.handleMarkdownOperations(e, 'read', path)
  );
  ipcMain.handle('writeMarkdownFile', (e, path, data) =>
    handlers.handleMarkdownOperations(e, 'write', path, data)
  );
  ipcMain.handle('deleteFile', handlers.handleDeleteFile);
  ipcMain.handle('deleteDirectory', handlers.handleDeleteDirectory);
  ipcMain.handle('getTemplates', handlers.handleGetTemplates);
  ipcMain.handle('writeObjectToFile', handlers.handleWriteObjectToFile);
  ipcMain.handle('readDirectory', (e, path) => ({
    status: 'success',
    data: FileSystem.readDirectoryStructure(path)
  }));
  ipcMain.handle('createDirectory', handlers.handleCreateDirectory);

  // Emit ready event after all handlers are registered
  window.webContents.send('app-ready');
};

export { createIPCHandlers, setupIPC };
