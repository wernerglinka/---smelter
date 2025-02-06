/**
 * @module form-generation/frontmatter-to-fragment
 * @description Converts frontmatter to form elements
 */
import { processFrontmatter } from './process-frontmatter.js';
import { getExplicitSchema } from './schema/schema-handler.js';
import { buildForm } from './form-builder/index.js';

/**
 * Renders a markdown file's frontmatter as form elements
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @throws {Error|Object} Standard error or schema error object
 */
export const frontmatterToFragment = async (frontmatter, path = '') => {
  try {
    const schema = await processFrontmatter(frontmatter);
    const explicitSchemaArray = await getExplicitSchema();

    // Create form elements from schema fields
    const formHTML = buildForm(schema, explicitSchemaArray);

    // Create and populate template
    const template = document.createElement('template');
    template.innerHTML = formHTML;

    return template.content;
  } catch (error) {
    // Handle schema errors
    if (error.isSchemaError) {
      console.error(`Schema error (${error.type}):`, error.message);
      if (error.field) {
        console.error('Problem field:', error.field);
      }
      if (error.path) {
        console.error('File path:', error.path);
      }
    }
    throw error;
  }
};
