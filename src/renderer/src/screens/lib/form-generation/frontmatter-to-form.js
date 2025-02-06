/**
 * @module form-generation/frontmatter-to-form
 * @description Converts frontmatter to form elements
 */
import { processFrontmatter } from './process-frontmatter.js';
import { getExplicitSchema } from './schema/schema-handler.js';
import { buildForm } from './form-builder/index.js';
import { initializeEditor } from '../editor/setup.js';
import { initFormManager } from './manage-form-state.js';

import { logFragment } from '../utilities/fragment-debug-helper.js';

/**
 * Renders a markdown file's frontmatter as form elements
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @throws {Error|Object} Standard error or schema error object
 */
export const frontmatterToForm = async (frontmatter, content) => {
  try {
    const schema = await processFrontmatter(frontmatter);
    const explicitSchemaArray = await getExplicitSchema();

    // Create form elements from schema fields
    const formHTML = buildForm(schema, explicitSchemaArray);

    // Create and populate template
    const template = document.createElement('template');
    template.innerHTML = formHTML;

    // Get dropzone
    const dropzone = document.getElementById('dropzone');
    if (!dropzone) {
      throw new Error('Dropzone element not found');
    }

    // Clone and append template content
    dropzone.appendChild(template.content.cloneNode(true));
    // get the form ID
    const formId = document.querySelector('#main-form').id;
    // Initialize form manager after new file has been loaded
    initFormManager(formId);

    if (!document.getElementById('editorWrapper')) {
      window.mdeditor = initializeEditor();
    }
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
