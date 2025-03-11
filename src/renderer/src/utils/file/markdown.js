/**
 * Markdown file utilities
 *
 * Provides functions for reading and parsing markdown files.
 *
 * @module file/markdown
 */

import { logger } from '@utils/services/logger';

/**
 * Reads and parses a markdown file
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<{frontmatter: Object, content: string}>}
 * @throws {Error} If file reading fails
 */
export const getMarkdownFile = async (filePath) => {
  try {
    // Remove the file protocol from the path
    const cleanPath = filePath.replace('file://', '');

    // Get markdown file contents
    const { status, data, error } = await window.electronAPI.markdown.read(cleanPath);

    if (status === 'failure') {
      throw new Error(`Failed to read markdown file: ${error}`);
    }

    if (!data || !data.frontmatter) {
      throw new Error('Invalid markdown file format');
    }

    return {
      frontmatter: data.frontmatter,
      content: data.content || ''
    };
  } catch (error) {
    logger.error('Error in getMarkdownFile:', error);
    throw error;
  }
};
