/**
 * @function findImplicitDefinition
 * @returns {Object} - The implicit definition object
 */
export function findImplicitDefinition(name, implicitSchema) {
  return implicitSchema.find((def) => def.name === name);
}
