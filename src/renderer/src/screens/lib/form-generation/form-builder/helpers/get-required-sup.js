/**
 * @function getRequiredSup
 * @param {*} def
 * @returns
 */
export function getRequiredSup(def) {
  return def && def.isRequired ? '<sup>*</sup>' : '';
}
