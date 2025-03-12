/**
 * File loader utilities
 *
 * Provides unified functions for loading various file types.
 *
 * @module file/loader
 */

import { logger } from '@utils/services/logger';
import { getMarkdownFile } from './markdown';

/**
 * Unified file loading service
 */
export class FileLoaderService {
  /**
   * Loads a file based on its extension
   * @param {string} filepath - Path to the file
   * @returns {Promise<Object>} File data with type information
   * @throws {Error} If file loading fails or type is unsupported
   */
  static async loadFile(filepath) {
    try {
      // Return early if filepath is null
      if (!filepath) {
        return null;
      }

      if (filepath.endsWith('.md')) {
        return await this.loadMarkdownFile(filepath);
      } else if (filepath.endsWith('.json')) {
        return await this.loadJSONFile(filepath);
      }
      throw new Error('Unsupported file type');
    } catch (error) {
      logger.error('Error loading file:', error);
      throw error;
    }
  }

  /**
   * Loads a markdown file
   * @param {string} filepath - Path to the markdown file
   * @returns {Promise<Object>} Markdown file data with frontmatter and content
   * @throws {Error} If file loading fails
   */
  static async loadMarkdownFile(filepath) {
    try {
      const { frontmatter, content } = await getMarkdownFile(filepath);
      return {
        type: 'markdown',
        data: {
          frontmatter,
          content
        },
        path: filepath
      };
    } catch (error) {
      logger.error('Error loading markdown file:', error);
      throw error;
    }
  }

  /**
   * Loads a JSON file
   * @param {string} filepath - Path to the JSON file
   * @returns {Promise<Object>} JSON file data
   * @throws {Error} If file loading fails
   */
  static async loadJSONFile(filepath) {
    try {
      const { status, data, error } = await window.electronAPI.files.read(filepath);

      if (status === 'failure') {
        throw new Error(`Failed to read JSON file: ${error}`);
      }

      // Handle empty file or already parsed data
      if (!data) {
        logger.debug('Loading empty JSON file', { path: filepath });
        return {
          type: 'json',
          data: { frontmatter: {} },  // Empty object that mimics frontmatter structure
          path: filepath
        };
      }
      
      // Check if data is a string and if it's empty
      if (typeof data === 'string' && data.trim() === '') {
        logger.debug('Loading empty JSON file (string)', { path: filepath });
        return {
          type: 'json',
          data: { frontmatter: {} },  // Empty object that mimics frontmatter structure
          path: filepath
        };
      }

      // Try to parse JSON
      try {
        // If data is already an object (pre-parsed), use it directly
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        return {
          type: 'json',
          data: { frontmatter: parsedData },  // Format to match frontmatter structure
          path: filepath
        };
      } catch (parseError) {
        logger.error('Invalid JSON format', { 
          path: filepath, 
          error: parseError.message,
          dataPreview: typeof data === 'string' ? data.slice(0, 100) : String(data)
        });
        
        // Return empty object with valid path instead of throwing
        return {
          type: 'json',
          data: { frontmatter: {} },
          path: filepath,
          parseError: 'Invalid JSON format - file will be treated as empty'
        };
      }
    } catch (error) {
      logger.error('Error loading JSON file:', error);
      throw error;
    }
  }
}
