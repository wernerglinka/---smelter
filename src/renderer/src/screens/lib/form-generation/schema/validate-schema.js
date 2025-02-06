/**
 * @module schema/validate-schema
 * @description Schema structure and field validation
 */
import { FIELD_TYPES } from './field-types.js';
import { createValidationError } from './schema-errors.js';

const validateFieldStructure = (field) => {
  if (!field.type) {
    throw createValidationError('Field must have a type', field);
  }
  if (!field.label && !field.name) {
    throw createValidationError('Field must have label or name', field);
  }

  const fieldType = Object.values(FIELD_TYPES).find((t) => t.type === field.type.toLowerCase());
  if (!fieldType) {
    throw createValidationError(`Invalid field type: ${field.type}`, field);
  }

  if (fieldType.requiresOptions && !field.options?.length) {
    throw createValidationError(`${field.type} field requires options`, field);
  }
};

const validateFieldValue = (field) => {
  const fieldType = Object.values(FIELD_TYPES).find((t) => t.type === field.type.toLowerCase());

  if (field.type === 'object') return;

  if (field.value === undefined && field.default === undefined) {
    field.value = fieldType.default;
  }

  switch (field.type) {
    case 'list':
      if (!Array.isArray(field.value) && !Array.isArray(field.default)) {
        throw createValidationError('List field must have array value', field);
      }
      break;
    case 'select':
      if (field.value && !field.options.find((opt) => opt.value === field.value)) {
        throw createValidationError('Select value must match an option', field);
      }
      break;
  }
};

export const validateField = (field) => {
  validateFieldStructure(field);
  validateFieldValue(field);
  return true;
};

export const validateSchema = (schema) => {
  if (!schema?.fields) {
    throw createValidationError('Schema must contain fields property', schema);
  }
  if (!Array.isArray(schema.fields)) {
    throw createValidationError('Schema fields must be an array', schema);
  }

  schema.fields.forEach(validateField);
  return true;
};
