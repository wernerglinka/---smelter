/**
 * @module form-generation/process-frontmatter
 * @description Converts frontmatter to form elements
 */

import { convertToSchemaObject } from './schema/convert-js-to-schema.js';
import { validateSchema } from './schema/validate-schema.js';


export const processFrontmatter = async ( frontmatter ) => {
  // Convert frontmatter to schema
  const schema = await convertToSchemaObject( frontmatter );
  validateSchema( schema );

  return schema;
};