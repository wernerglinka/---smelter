import { StorageOperations } from '../lib/utilities/services/storage';

/**
 * @typedef {Object} TemplateCheckResponse
 * @property {string} status - Response status ('success' or 'failure')
 * @property {boolean} data - Whether the templates directory exists
 */

/**
 * Checks if the current project has a templates directory
 * @description Verifies the existence of the frontMatterTemplates directory in the project's .metallurgy folder
 * @async
 * @returns {Promise<boolean>} True if templates directory exists, false otherwise
 * @throws {Error} When unable to check template directory
 * @example
 * const hasTemplates = await hasProjectTemplates();
 * if (hasTemplates) {
 *   // Show template options
 * }
 */
export const hasProjectTemplates = async () => {
  try {
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) {
      return false;
    }

    const templatePath = `${projectPath}/.metallurgy/frontMatterTemplates/templates`;

    const response = await window.electronAPI.files.exists(templatePath);

    const hasTemplates = response?.data === true;

    return hasTemplates;
  } catch (error) {
    console.error('Error checking for templates:', error);
    return false;
  }
};
