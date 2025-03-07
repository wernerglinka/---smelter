import { convertToSchemaObject } from '../schema/convert-js-to-schema';
import { validateSchema } from '../schema/validate-schema';
import { getExplicitSchema } from '../schema/schema-handler';

/**
 * Processes frontmatter and content into a form schema
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @param {Object} options - Additional options
 * @param {boolean} options.addContentsField - Whether to add the contents field regardless of content existence
 * @returns {Promise<Object>} Processed schema with fields
 */
export const processFrontmatter = async (frontmatter, content, options = {}) => {
  try {
    const explicitSchema = await getExplicitSchema();
    const { addContentsField = false } = options;

    // Process frontmatter
    const frontmatterSchema = await convertToSchemaObject(frontmatter, explicitSchema);
    validateSchema(frontmatterSchema);

    // Only add the contents field if specifically requested by options
    // or if both frontmatter exists and content exists
    const shouldAddContentsField =
      addContentsField ||
      (Object.keys(frontmatter).length > 0 && content && content.trim().length > 0);

    if (shouldAddContentsField) {
      // Add contents as a textarea field
      const contentsField = {
        type: 'textarea',
        name: 'contents',
        label: 'Contents',
        value: content || '',
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
    }

    // Return just the frontmatter schema without contents field
    return frontmatterSchema;
  } catch (error) {
    console.error('Error processing frontmatter:', error);
    throw error;
  }
};
