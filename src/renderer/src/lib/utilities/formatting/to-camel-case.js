/**
 * Converts a string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} str - The input string converted to camelCase format (e.g., "myVariableName")
 */
export const toCamelCase = (str) => {
  return str
    .split(' ')
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
};
