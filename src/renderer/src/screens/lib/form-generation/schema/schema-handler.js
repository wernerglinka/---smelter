/**
 * @module schema/schema-handler
 * @description Handles project schema file operations
 */

import { StorageOperations } from '../../storage-operations.js';
import { FIELD_TYPES } from './field-types.js';
import { validateField } from './validate-schema.js';
import { createFileError } from './schema-errors.js';

/**
 * Validates and processes field from schema file
 * @param {Object} field - Field definition from schema file
 * @returns {Object} Processed field
 */
const processSchemaField = ( field ) => {
  validateField( field );
  const fieldType = Object.values( FIELD_TYPES )
    .find( t => t.type === field.type.toLowerCase() );

  if ( !field.default && fieldType.default !== undefined ) {
    field.default = fieldType.default;
  }

  return field;
};

/**
 * Reads and validates project schema file
 * @returns {Promise<Array|null>} Processed schema array or null
 * @throws {Object} Schema file error
 */
export const getExplicitSchema = async () => {
  const projectPath = StorageOperations.getProjectPath();
  if ( !projectPath ) {
    throw createFileError( 'No project path found in storage', '' );
  }

  const schemaFilePath = `${ projectPath }/.metallurgy/frontmatterTemplates/fields.json`;
  const schemaExists = await window.electronAPI.files.exists( schemaFilePath );

  if ( !schemaExists.data ) return [];

  const { status, data, error } = await window.electronAPI.files.read( schemaFilePath );
  if ( status === 'failure' ) {
    throw createFileError( `Error reading schema file: ${ error }`, schemaFilePath );
  }

  if ( !Array.isArray( data ) ) {
    throw createFileError( 'Schema file must contain an array', schemaFilePath );
  }

  try {
    return data.map( processSchemaField );
  } catch ( error ) {
    throw createFileError(
      `Invalid field in schema file: ${ error.message }`,
      schemaFilePath
    );
  }
};