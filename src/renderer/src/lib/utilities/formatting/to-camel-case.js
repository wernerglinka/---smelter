/**
 * Converts a string to camelCase while preserving existing camelCase structure
 * @param {string} str - The string to convert
 * @returns {string} str - The input string converted to camelCase format (e.g., "myVariableName")
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
