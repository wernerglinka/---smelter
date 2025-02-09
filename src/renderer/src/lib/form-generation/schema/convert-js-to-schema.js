import {
  isSimpleList,
  isDateObject,
  isSectionsArray
} from '@lib/utilities/validation/type-validators.js';

/**
 * Infers the field type from a value and key
 * @param {*} value - The value to analyze
 * @param {string} key - The field key
 * @returns {string} The inferred field type
 */
const inferFieldType = (value, key) => {
  if (isSectionsArray(value, key)) return 'sections-array';
  if (isSimpleList(value)) return 'list';
  if (isDateObject(value)) return 'date';
  if (Array.isArray(value)) return 'array';

  const type = typeof value;
  if (type === 'string') return value.includes('\n') ? 'textarea' : 'text';
  if (type === 'object' && value !== null) return 'object';

  return type === 'boolean' ? 'checkbox' : type === 'number' ? 'number' : 'text';
};

/**
 * Creates a field definition from a key-value pair
 * @param {string} key - The field key
 * @param {*} value - The field value
 * @param {Object} explicitSchema - Schema from fields.json
 * @returns {Object} The field definition with immutable type
 */
function createField(key, value, explicitSchema) {
  // First, find if we have an explicit schema definition
  const explicitDef = explicitSchema?.find((def) => def.name === key);

  // If we have an explicit type in schema, use it
  if (explicitDef?.type) {
    return Object.defineProperty(
      {
        label: key,
        value,
        placeholder: `Add ${key}`,
        ...explicitDef
      },
      'type',
      {
        value: explicitDef.type,
        writable: false,
        configurable: false
      }
    );
  }

  // Otherwise, infer type from value
  const inferredType = inferFieldType(value, key);

  const baseField = {
    label: key,
    value,
    placeholder: `Add ${key}`
  };

  // Make type immutable
  return Object.defineProperty(baseField, 'type', {
    value: inferredType,
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
export async function convertToSchemaObject(json, explicitSchema) {
  return {
    fields: Object.entries(json).map(([key, value]) => createField(key, value, explicitSchema))
  };
}
