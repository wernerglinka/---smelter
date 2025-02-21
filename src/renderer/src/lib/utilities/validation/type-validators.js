/**
 * @module utils/type-validators
 * @description Validation utilities for checking data types and structures
 */

/**
 * Checks if value is an array containing only strings or only numbers
 * @param {*} value - Value to check
 * @returns {boolean} True if value is array of strings or numbers
 */
export const isSimpleList = (value) => {
  if (!Array.isArray(value) || value.length === 0) return false;
  const firstType = typeof value[0];
  return value.every(
    (item) => typeof item === firstType && (firstType === 'string' || firstType === 'number')
  );
};

/**
 * Checks if input is a Date object or can be parsed as a valid date
 * @param {*} input - Value to check
 * @returns {boolean} True if input is Date instance or valid date string
 */
export const isDateObject = (input) => {
  if (input instanceof Date) return true;
  if (typeof input !== 'string') return false;
  const date = new Date(input);
  return !isNaN(date.getTime());
};

/**
 * Validates if a Date object represents a valid date
 * @param {*} input - Value to check
 * @returns {boolean} True if input is valid Date
 */
export const isValidDate = (input) => {
  return input instanceof Date && !isNaN(input.getTime());
};

/**
 * Checks if value is a complex object (has nested objects, arrays, or dates)
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a complex object
 */
export const isComplexObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (Object.keys(value).length === 0) return false;

  return Object.values(value).some(
    (v) => v instanceof Date || Array.isArray(v) || (typeof v === 'object' && v !== null)
  );
};

/**
 * Determines value type for form field generation
 * @param {*} value - Value to analyze
 * @param {string} key - The field key
 * @returns {string} Field type identifier
 */
export const getFieldType = (value, key) => {
  if (isSimpleList(value, key)) return 'list';
  if (isDateObject(value)) return 'date';
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';

  return typeof value;
};
