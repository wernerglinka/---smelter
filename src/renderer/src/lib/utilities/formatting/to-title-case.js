/**
 * @function toTitleCase
 * @description Convert camelCase to Title Case
 * @param {*} label
 * @returns label string in title case
 */
export function toTitleCase(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}
