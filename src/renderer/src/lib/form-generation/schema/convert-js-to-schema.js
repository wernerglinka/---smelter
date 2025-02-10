import {
  isSimpleList,
  isDateObject,
  isSectionsArray
} from '@lib/utilities/validation/type-validators.js';

/**
 * Infers the field type from a value
 * @param {*} value - The value to analyze
 * @param {string} key - The field key
 * @returns {string} The inferred field type
 */
const inferFieldType = (value, key) => {
  if (typeof value === 'boolean') return 'checkbox';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value !== null) return 'object';
  return 'text';
};

/**
 * Creates a field definition from a key-value pair
 * @param {string} key - The field key
 * @param {*} value - The field value
 * @param {Object} explicitSchema - Schema from fields.json
 * @returns {Object} The field definition with immutable type
 */
function processChildren(value, explicitSchema) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item).map(([childKey, childValue]) =>
          createField(childKey, childValue, explicitSchema)
        );
      }
      return item;
    });
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).map(([childKey, childValue]) =>
      createField(childKey, childValue, explicitSchema)
    );
  }

  return value;
}

function createField(key, value, explicitSchema) {
  const schemaField = explicitSchema?.find((field) => field.name === key);
  const inferredType = inferFieldType(value, key);

  // Start with base field properties
  const baseField = {
    label: schemaField?.label || key,
    name: key,
    value: value,
    type: schemaField?.type || inferredType,
    placeholder: schemaField?.placeholder || `Add ${key}`
  };

  // Merge schema properties if they exist
  if (schemaField) {
    Object.assign(baseField, {
      ...schemaField,
      value: value // Preserve the current value
    });
  }

  // Process children recursively for both objects and arrays
  if (typeof value === 'object' && value !== null) {
    baseField.fields = processChildren(value, explicitSchema);
  }

  // Make type immutable
  return Object.defineProperty(baseField, 'type', {
    value: baseField.type,
    writable: false,
    configurable: false
  });
}

/**
 * Converts JSON to schema object
 * @param {Object} json - The JSON to convert
 * @param {Object} explicitSchema - Schema from fields.json
 * @returns {Object} The schema object with immutable field types
 */
export const convertToSchemaObject = async (frontmatter, explicitSchema) => {
  const fields = Object.entries(frontmatter).map(([key, value]) =>
    createField(key, value, explicitSchema)
  );

  return { fields };
};
