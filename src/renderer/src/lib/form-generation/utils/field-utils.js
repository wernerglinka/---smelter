/**
 * Creates a field definition by merging base properties with schema definition
 * @param {string} key - Field key/name
 * @param {any} value - Field value
 * @param {Array} schema - Schema definitions array
 * @returns {Object} Merged field definition
 */
export const createFieldDefinition = (key, value, schema) => {
  const schemaField = schema?.find((field) => field.name === key);

  // Start with base field properties
  const baseField = {
    label: schemaField?.label || key,
    name: key,
    value: value,
    type: schemaField?.type || typeof value,
    placeholder: schemaField?.placeholder || `Add ${key}`
  };

  // Merge all properties from schema field if it exists
  if (schemaField) {
    return {
      ...baseField,
      ...schemaField,
      value: value // Always preserve the current value
    };
  }

  return baseField;
};
