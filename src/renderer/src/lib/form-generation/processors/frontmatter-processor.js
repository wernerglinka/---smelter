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

    // show frontmatter as json object
    console.log('Frontmatter as JSON:', JSON.stringify(frontmatter, null, 2));

    //show explicit schema as json object
    console.log('Explicit Schema as JSON:', JSON.stringify(explicitSchema, null, 2));

    const schema = await convertToSchemaObject(frontmatter, explicitSchema);
    validateSchema(schema);

    // console log log the schema object
    console.log('Schema:', schema);

    return schema;
  } catch (error) {
    console.error('Error processing frontmatter:', error);
    throw error;
  }
};
