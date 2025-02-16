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
    // Get explicit schema definitions first
    const explicitSchema = await getExplicitSchema();

    // Convert frontmatter to schema with explicit definitions
    const schema = await convertToSchemaObject(frontmatter, explicitSchema);
    validateSchema(schema);

    return schema;
  } catch (error) {
    console.error('Error processing frontmatter:', error);
    throw error;
  }
};
