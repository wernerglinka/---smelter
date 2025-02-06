/**
 * @module schema/schema-error
 * @description Custom error objects for schema operations
 */
export const createSchemaError = (message, type = 'SCHEMA_ERROR') => ({
  message,
  type,
  isSchemaError: true
});

export const createValidationError = (message, field) => ({
  ...createSchemaError(message, 'VALIDATION_ERROR'),
  field
});

export const createFileError = (message, path) => ({
  ...createSchemaError(message, 'FILE_ERROR'),
  path
});
