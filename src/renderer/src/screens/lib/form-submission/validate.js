// lib/form-submission/validate.js
import { validateSchema } from '../form-generation/schema/validate-schema.js';
import { isValidLabel } from '../utilities/form-field-validations.js';

/**
 * Validates a single form field based on its type and value
 * @param {string} key - Field name
 * @param {*} value - Field value
 * @param {string} type - Field type
 * @returns {string|null} Error message or null if valid
 */
const validateField = (key, value, type = null) => {
  // Handle null/undefined/empty values
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // If no type provided, infer from value
  const inferredType = type || typeof value;

  // Only validate specific types
  switch (inferredType) {
    case 'number':
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return `${key} must be a valid number`;
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return `${key} must be true or false`;
      }
      break;

    case 'date':
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        return `${key} must be a valid date`;
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return `${key} must be a list`;
      }
      break;
  }

  return null;
};

const validateFormData = (data, schema = null) => {
  // Handle null/undefined data
  if (!data) {
    return ['Form data is empty'];
  }

  const errors = [];

  try {
    Object.entries(data).forEach(([key, value]) => {
      // If schema exists, get type from schema, otherwise infer it
      const fieldSchema = schema?.properties?.[key];
      const fieldType = fieldSchema?.type || null;

      // Validate field
      const fieldError = validateField(key, value, fieldType);
      if (fieldError) {
        errors.push(fieldError);
      }

      // Recursive validation for objects and arrays
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item && typeof item === 'object') {
              const itemSchema = fieldSchema?.items || null;
              const itemErrors = validateFormData(item, itemSchema);
              if (itemErrors.length > 0) {
                errors.push(...itemErrors.map((err) => `${key}[${index}]: ${err}`));
              }
            }
          });
        } else {
          const nestedErrors = validateFormData(value, fieldSchema);
          if (nestedErrors.length > 0) {
            errors.push(...nestedErrors.map((err) => `${key}.${err}`));
          }
        }
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    errors.push('Invalid form structure');
  }

  return errors;
};

export const validateSubmission = (formData, schema = null) => {
  if (!formData) {
    return ['Missing form data'];
  }

  try {
    // Form data validation with optional schema
    const formErrors = validateFormData(formData, schema);
    if (formErrors.length) {
      return formErrors;
    }
  } catch (error) {
    console.error('Validation error:', error);
    return ['Form validation failed'];
  }

  return [];
};
