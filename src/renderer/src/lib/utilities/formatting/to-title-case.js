/**
 * @function toTitleCase
 * @description Convert camelCase to Title Case with consistent spacing
 * @param {string} str Input string in camelCase
 * @returns {string} String in Title Case
 */
export function toTitleCase(str) {
  if (!str) return '';

  // Special cases for common prefixes
  const prefixes = ['is', 'in', 'has'];

  // First, split the string into words based on capital letters
  const words = str.split(/(?=[A-Z])/).map((word) => word.trim());

  // Check if first word is a special prefix
  if (words.length > 1 && prefixes.includes(words[0].toLowerCase())) {
    return (
      words[0].toLowerCase() +
      ' ' +
      words
        .slice(1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  }

  // Standard case: first word lowercase, rest capitalized with spaces
  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}
