import { convertToSchemaObject } from '../schema/convert-js-to-schema';
import { validateSchema } from '../schema/validate-schema';
import { getExplicitSchema } from '../schema/schema-handler';

/**
 * Processes frontmatter and content into a form schema
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @returns {Promise<Object>} Processed schema with fields
 */
export const processFrontmatter = async (frontmatter, content) => {
  try {
    const explicitSchema = await getExplicitSchema();

    // Process frontmatter
    const frontmatterSchema = await convertToSchemaObject(frontmatter, explicitSchema);
    validateSchema(frontmatterSchema);

    // Add contents as a textarea field
    const contentsField = {
      type: 'textarea',
      name: 'contents',
      label: 'Contents',
      value: content,
      id: 'markdown-contents',
      // Prevent duplication/deletion of contents field
      noDuplication: true,
      noDeletion: true
    };

    // Combine schemas
    return {
      ...frontmatterSchema,
      fields: [...frontmatterSchema.fields, contentsField]
    };
  } catch (error) {
    console.error('Error processing frontmatter:', error);
    throw error;
  }
};
