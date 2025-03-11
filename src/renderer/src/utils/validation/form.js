/**
 * Form validation utilities
 *
 * Provides functions for validating form field values.
 *
 * @module validation/form
 */

import { isString, isNumber } from './types';
import { logger } from '@utils/services/logger';

/**
 * Validates that a field is not empty
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is not empty
 */
export const required = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validates that a string has a minimum length
 * @param {number} min - Minimum length required
 * @returns {Function} Validator function
 */
export const minLength = (min) => (value) => {
  if (!isString(value)) return false;
  return value.length >= min;
};

/**
 * Validates that a string doesn't exceed a maximum length
 * @param {number} max - Maximum length allowed
 * @returns {Function} Validator function
 */
export const maxLength = (max) => (value) => {
  if (!isString(value)) return false;
  return value.length <= max;
};

/**
 * Validates that a number is within a range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Function} Validator function
 */
export const range = (min, max) => (value) => {
  if (!isNumber(value)) return false;
  return value >= min && value <= max;
};

/**
 * Validates that a string matches a pattern
 * @param {RegExp} pattern - Regular expression to match
 * @param {string} [errorMessage] - Optional error message
 * @returns {Function} Validator function that returns true for valid, error message for invalid
 */
export const pattern =
  (pattern, errorMessage = 'Invalid format') =>
  (value) => {
    if (!isString(value)) return errorMessage;
    return pattern.test(value) ? true : errorMessage;
  };

/**
 * Validates an email address format
 * @param {string} value - Email address to validate
 * @returns {boolean} True if the email format is valid
 */
export const isValidEmail = (value) => {
  if (!isString(value)) return false;
  // Simple email regex - production code would need a more robust solution
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validates a URL format
 * @param {string} value - URL to validate
 * @returns {boolean} True if the URL format is valid
 */
export const isValidUrl = (value) => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Tests if string contains only alphanumeric characters
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid
 */
export const isValidLabel = (value) => /^[a-zA-Z0-9]+$/.test(value);

/**
 * Validates a single form field based on its type and value
 * @param {string} key - Field name
 * @param {*} value - Field value
 * @param {string} type - Field type
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (key, value, type = null) => {
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

/**
 * Validates form data against an optional schema
 * @param {Object} data - Form data to validate
 * @param {Object|null} schema - Optional schema to validate against
 * @returns {string[]} Array of error messages
 */
export const validateFormData = (data, schema = null) => {
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
    logger.error('Validation error:', error);
    errors.push('Invalid form structure');
  }

  return errors;
};

/**
 * Validates form data for submission
 * @param {Object} formData - Form data to validate
 * @param {Object|null} schema - Optional schema to validate against
 * @returns {string[]} Array of error messages (empty if valid)
 */
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
    logger.error('Validation error:', error);
    return ['Form validation failed'];
  }

  return [];
};
