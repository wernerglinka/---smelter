/**
 * JSON file utilities
 *
 * Provides functions for reading and writing JSON files.
 *
 * @module file/json
 */

import { logger } from '@utils/services/logger';

/**
 * Gets and parses a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If file reading or parsing fails
 */
export const getJsonFile = async (filePath) => {
  try {
    // Remove the file protocol from the path
    const cleanPath = filePath.replace('file://', '');

    const { status, data, error } = await window.electronAPI.json.read(cleanPath);

    if (status === 'failure') {
      throw new Error(`Failed to read JSON file: ${error}`);
    }

    return data;
  } catch (error) {
    logger.error('Error reading JSON file:', error);
    throw error;
  }
};

/**
 * @deprecated Use getJsonFile instead
 */
export const readJsonFile = getJsonFile;

/**
 * Formats JSON data for display
 * @param {Object|Array|string} data - JSON data to render
 * @param {Object} options - Rendering options
 * @param {boolean} [options.pretty=true] - Whether to pretty-print the JSON
 * @param {number} [options.indent=2] - Indentation spaces
 * @returns {string} Formatted JSON string
 */
export const formatJson = (data, options = {}) => {
  const { pretty = true, indent = 2 } = options;

  try {
    // If data is already a string, parse it first to validate
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        logger.warn('Invalid JSON string provided to formatJson');
        return data; // Return as-is if can't parse
      }
    }

    // Pretty-print or compact output based on options
    return pretty ? JSON.stringify(data, null, indent) : JSON.stringify(data);
  } catch (error) {
    logger.error('Error formatting JSON:', error);
    return String(data); // Fallback
  }
};

/**
 * @deprecated Use formatJson instead
 */
export const renderJSONFile = formatJson;

/**
 * Saves a JSON file (creates or updates)
 * @param {string} filePath - Path to the JSON file
 * @param {Object} content - Content to write
 * @param {boolean} [pretty=true] - Whether to pretty-print the JSON
 * @returns {Promise<void>}
 * @throws {Error} If file writing fails
 */
export const saveJsonFile = async (filePath, content, pretty = true) => {
  try {
    // Remove the file protocol from the path
    const cleanPath = filePath.replace('file://', '');

    const jsonString = pretty ? JSON.stringify(content, null, 2) : JSON.stringify(content);

    const { status, error } = await window.electronAPI.json.write(cleanPath, jsonString);

    if (status === 'failure') {
      throw new Error(`Failed to write JSON file: ${error}`);
    }
  } catch (error) {
    logger.error('Error saving JSON file:', error);
    throw error;
  }
};

/**
 * @deprecated Use saveJsonFile instead
 */
export const writeJsonFile = saveJsonFile;
