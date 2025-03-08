/**
 * Directory utility functions
 * 
 * Provides functions for reading directory contents.
 * 
 * @module file/directory
 */

import { logger } from '../services/logger';

/**
 * Gets a directory's contents
 * @param {string} directoryPath - Path to the directory
 * @returns {Promise<Object>} Directory contents
 * @throws {Error} If directory read fails
 */
export const getDirectory = async (directoryPath) => {
  try {
    const { status, data, error } = await window.electronAPI.directories.read(directoryPath);

    if (status === 'failure') {
      throw new Error(`Failed to read directory: ${error}`);
    }

    return data;
  } catch (error) {
    logger.error('Error reading directory:', error);
    throw error;
  }
};

/**
 * @deprecated Use getDirectory instead
 */
export const readDirectory = getDirectory;

/**
 * Checks if a file or directory exists
 * @param {string} path - Path to check
 * @returns {Promise<boolean>} True if the file/directory exists
 */
export const isExisting = async (path) => {
  try {
    const { status, data } = await window.electronAPI.directories.exists(path);
    return status === 'success' && data;
  } catch (error) {
    logger.error('Error checking if path exists:', error);
    return false;
  }
};

/**
 * @deprecated Use isExisting instead
 */
export const exists = isExisting;

/**
 * Creates a directory if it doesn't exist
 * @param {string} directoryPath - Directory path to create
 * @returns {Promise<boolean>} True if directory was created or already exists
 */
export const createDirectory = async (directoryPath) => {
  try {
    // First check if directory already exists
    const directoryExists = await isExisting(directoryPath);
    if (directoryExists) {
      return true;
    }

    // Create directory
    const { status, error } = await window.electronAPI.directories.create(directoryPath);
    
    if (status === 'failure') {
      throw new Error(`Failed to create directory: ${error}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Error creating directory:', error);
    throw error;
  }
};

/**
 * Extracts a folder name from a path based on a search string
 * @param {string} searchString - String to search for in the path
 * @param {string} path - The full path to extract from
 * @returns {string} The extracted folder name with slashes
 */
export const extractFolderName = (searchString, path) => {
  if (!path) return '';
  const startIndex = path.indexOf(searchString);
  if (startIndex !== -1) {
    return `/${path.substring(startIndex)}/`;
  }
  return '';
};

/**
 * @deprecated Use extractFolderName instead
 */
export const getFolderName = extractFolderName;

/**
 * Dialog configuration for folder selection
 */
const FOLDER_DIALOG_CONFIG = {
  properties: ['openDirectory']
};

/**
 * Opens a folder selection dialog
 * @param {string} folderType - Type of folder being selected (e.g., 'content', 'data')
 * @returns {Promise<{filePaths: string[]}>} Selected folder path
 * @throws {Error} If dialog operation fails or folderType invalid
 */
export const selectFolder = async (folderType) => {
  try {
    if (!folderType) {
      throw new Error('Folder type is required');
    }

    // Import storage dynamically to avoid circular dependency
    const { getProjectPath } = await import('../services/storage');
    const projectFolder = getProjectPath();
    
    if (!projectFolder) {
      logger.warn('No project folder found in storage');
    }

    const dialogOptions = {
      ...FOLDER_DIALOG_CONFIG,
      message: `Select the ${folderType} Folder`,
      defaultPath: projectFolder || undefined
    };

    const result = await window.electronAPI.dialog.open('showOpenDialog', dialogOptions);

    return result.data.canceled ? [] : result.data.filePaths;
  } catch (error) {
    logger.error(`Error selecting ${folderType} folder:`, error);
    throw new Error(`Failed to select ${folderType} folder: ${error.message}`);
  }
};