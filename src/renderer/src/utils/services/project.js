/**
 * Project service utilities
 *
 * Provides functions for project management.
 *
 * @module services/project
 */

import { logger } from './logger';

/**
 * @typedef {Object} DialogResult
 * @property {string} status - Response status
 * @property {Object} data - Dialog response data
 * @property {boolean} data.canceled - Whether dialog was canceled
 * @property {string[]} data.filePaths - Selected file paths
 */

/**
 * Dialog configuration for project folder selection
 */
const PROJECT_DIALOG_CONFIG = {
  title: 'Select Project Folder',
  message: 'Choose a folder for your project',
  properties: ['openDirectory'],
  buttonLabel: 'Select Project Folder'
};

/**
 * Validates dialog result structure
 * @param {DialogResult} result - Dialog response
 * @returns {string|null} Selected path or null if canceled
 */
export const validateDialogResult = (result) => {
  if (
    result?.status !== 'success' ||
    result.data?.canceled ||
    !Array.isArray(result.data?.filePaths) ||
    result.data.filePaths.length === 0
  ) {
    return null;
  }
  return result.data.filePaths[0];
};

/**
 * Validates selected path exists
 * @param {string} path - Path to validate
 * @throws {Error} If path doesn't exist
 */
export const validatePath = async (path) => {
  const exists = await window.electronAPI.files.exists(path);
  if (!exists) {
    throw new Error('Selected folder does not exist');
  }
};

/**
 * Opens dialog for project folder selection
 * @returns {Promise<string|"abort">} Selected path or "abort" if canceled
 * @throws {Error} If folder selection fails
 */
export const selectProject = async () => {
  try {
    const result = await window.electronAPI.dialog.open('showOpenDialog', PROJECT_DIALOG_CONFIG);

    const selectedPath = validateDialogResult(result);
    if (!selectedPath) {
      return 'abort';
    }

    await validatePath(selectedPath);
    return selectedPath;
  } catch (error) {
    logger.error('Error in selectProject:', error);
    throw new Error(`Failed to select project folder: ${error.message}`);
  }
};

export const ProjectOperations = {
  validateProject: async (projectFolder) => {
    try {
      // Check if .metallurgy directory exists
      const metallurgyPath = `${projectFolder}/.metallurgy`;
      const { status: dirStatus } = await window.electronAPI.directories.exists(metallurgyPath);

      if (dirStatus !== 'success') {
        return false;
      }

      // Check if projectData.json exists
      const configPath = `${projectFolder}/.metallurgy/projectData.json`;
      const { status: fileStatus } = await window.electronAPI.files.exists(configPath);

      if (fileStatus !== 'success') {
        return false;
      }

      // Try to read and parse the config file to ensure it's valid
      const { status: readStatus, data } = await window.electronAPI.files.read(configPath);

      if (readStatus !== 'success' || !data) {
        return false;
      }

      try {
        // Check if data is already an object
        if (typeof data === 'object' && data !== null) {
          return true;
        }

        // Otherwise parse it as JSON
        JSON.parse(data);
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
  },

  loadProjectConfig: async (projectFolder) => {
    const configFilePath = `${projectFolder}/.metallurgy/projectData.json`;
    const { status, data, error } = await window.electronAPI.files.read(configFilePath);

    if (status === 'failure') {
      throw new Error(error || 'Failed to read project configuration');
    }

    // Return the data directly if it's already an object
    if (typeof data === 'object' && data !== null) {
      return data;
    }

    // Otherwise parse it as JSON
    return JSON.parse(data);
  },

  deleteProject: async (projectFolder) => {
    const metallurgyPath = `${projectFolder}/.metallurgy`;
    // Verify .metallurgy folder exists before deletion
    const folderExists = await window.electronAPI.directories.exists(metallurgyPath);
    if (!folderExists) {
      throw new Error('Project configuration folder .metallurgy not found');
    }

    const result = await window.electronAPI.directories.delete(metallurgyPath);
    if (result.status === 'failure') {
      throw new Error(`Failed to delete .metallurgy folder: ${result.error}`);
    }
    return true;
  },

  confirmDeletion: async (projectName) => {
    const result = await window.electronAPI.dialog.showCustomMessage({
      type: 'warning',
      message: `Are you sure you want to remove the ${projectName} project?`,
      buttons: ['Yes', 'No']
    });
    return result?.response?.index === 0;
  }
};
