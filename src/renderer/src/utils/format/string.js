/**
 * String formatting utilities
 * 
 * @module format/string
 */

/**
 * Converts a string to camelCase while preserving existing camelCase structure
 * @param {string} str - The string to convert
 * @returns {string} The input string converted to camelCase format (e.g., "myVariableName")
 */
export const toCamelCase = (str) => {
  // First handle space-separated words
  if (str.includes(' ')) {
    return str
      .split(' ')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  // Handle existing camelCase or single words
  if (str.match(/[A-Z]/)) {
    // Preserve existing camelCase
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  // Single word case
  return str.toLowerCase();
};

/**
 * Converts a string to Title Case with special handling for prefixes and camelCase
 * @param {string} str - The string to convert
 * @returns {string} The input string converted to Title Case format (e.g., "My Variable Name")
 */
export const toTitleCase = (str) => {
  if (!str) return '';

  // Special cases for common prefixes
  const prefixes = ['is', 'in', 'has'];

  // First, split the string based on capital letters if it's camelCase
  let words;
  if (/[A-Z]/.test(str)) {
    words = str.split(/(?=[A-Z])/).map((word) => word.trim());
  } else {
    // If not camelCase, split by spaces
    words = str.split(/\s+/);
  }

  // Check if first word is a special prefix
  if (words.length > 1 && prefixes.includes(words[0].toLowerCase())) {
    return (
      words[0].toLowerCase() +
      ' ' +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    );
  }

  // Capitalize first letter of each word
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};