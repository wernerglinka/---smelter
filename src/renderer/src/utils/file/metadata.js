/**
 * Metadata file utilities
 * 
 * Provides functions for reading and parsing metadata files.
 * 
 * @module file/metadata
 */

import { logger } from '../services/logger';

/**
 * Reads and parses a metadata file
 * @param {string} filePath - Path to the metadata file
 * @returns {Promise<{data: Object, content: string}>}
 * @throws {Error} If file reading fails
 */
export const getMetadataFile = async (filePath) => {
  try {
    // Remove the file protocol from the path
    const cleanPath = filePath.replace('file://', '');

    // Get metadata file contents
    const { status, data, error } = await window.electronAPI.files.read(cleanPath);

    if (status === 'failure') {
      logger.error(`Failed to read metadata file: ${error}`);
      throw new Error(`Failed to read metadata file: ${error}`);
    }

    if (!data) {
      logger.error('Invalid metadata file format');
      throw new Error('Invalid metadata file format');
    }

    return data;
  } catch (error) {
    logger.error('Error in getMetadataFile:', error);
    throw error;
  }
};