/**
 * @function toTitleCase
 * @description Convert string to Title Case with consistent capitalization
 * @param {string} str Input string
 * @returns {string} String in Title Case with each word capitalized
 */
export function toTitleCase(str) {
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
}
