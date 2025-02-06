import { convertToSchemaObject } from './schema/convert-js-to-schema';
import { validateSchema } from './schema/validate-schema';
import { getExplicitSchema } from './schema/schema-handler';

/**
 * Processes frontmatter and content into a form schema
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @returns {Promise<Object>} Processed schema with fields
 */
export const processFrontmatter = async (frontmatter, content) => {
  try {
    // Convert frontmatter to schema
    const schema = await convertToSchemaObject(frontmatter);
    validateSchema(schema);

    // Get explicit schema definitions
    const explicitSchema = await getExplicitSchema();

    // Enhance schema fields with explicit definitions
    if (schema.fields && Array.isArray(schema.fields)) {
      schema.fields = schema.fields.map(field => {
        const explicitDef = explicitSchema.find(def => 
          def.name === field.name || def.label === field.label
        );
        return {
          ...field,
          implicitDef: explicitDef || null
        };
      });
    }

    return {
      fields: schema.fields || [],
      content
    };
  } catch (error) {
    console.error('Error processing frontmatter:', error);
    throw error;
  }
};