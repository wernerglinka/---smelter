/**
 * @function getPlaceholder
 * @param {*} def
 * @param {*} fallback
 * @returns
 */
export function getPlaceholder(def, fallback) {
  return (def && def.placeholder) || fallback || '';
}
