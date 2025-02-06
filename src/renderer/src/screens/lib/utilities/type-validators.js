/**
 * @module utils/type-validators
 * @description Validation utilities for checking data types and structures
 */

/**
 * Checks if value is a sections array
 * @param {*} value - The array to check
 * @param {string} key - The field key
 * @returns {boolean} True if value is a sections array
 */
export function isSectionsArray(value, key) {
  return Array.isArray(value) && key === 'sections';
}

/**
 * Checks if value is an array containing only strings
 * @param {*} value - Value to check
 * @param {string} key - The field key
 * @returns {boolean} True if value is array of strings
 */
export const isSimpleList = (value, key) => {
  // Don't treat sections array as a simple list
  if (isSectionsArray(value, key)) {
    return false;
  }
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
};

/**
 * Validates if input can be parsed as a valid date
 * @param {string} input - Date string to validate
 * @returns {boolean} True if input is valid date string
 */
export const isDateString = (input) => {
  const parsedDate = new Date(input);
  return !isNaN(parsedDate.getTime());
};

/**
 * Checks if input is a Date object
 * @param {*} input - Value to check
 * @returns {boolean} True if input is Date instance
 */
export const isDateObject = (input) => input instanceof Date;

/**
 * Determines value type for form field generation
 * @param {*} value - Value to analyze
 * @param {string} key - The field key
 * @returns {string} Field type identifier
 */
export const getFieldType = (value, key) => {
  if (isSectionsArray(value, key)) return 'sections-array';
  if (isSimpleList(value, key)) return 'list';
  if (isDateObject(value)) return 'date';
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';

  return typeof value;
};
