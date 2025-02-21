import { isSimpleList, isDateObject } from '@lib/utilities/validation/type-validators.js';

/**
 * Infers the field type from a value
 * @param {any} value - The value to analyze
 * @returns {string} The inferred field type ('list', 'date', 'array', 'textarea', 'text', 'object', 'checkbox', 'number')
 */
const inferType = (value) => {
  if (isSimpleList(value)) return 'list';
  if (isDateObject(value)) return 'date';
  if (Array.isArray(value)) return 'array';

  const type = typeof value;
  if (type === 'string') return value.includes('\n') ? 'textarea' : 'text';
  if (type === 'object' && value !== null) return 'object';

  return type === 'boolean' ? 'checkbox' : type === 'number' ? 'number' : 'text';
};

/**
 * Finds a matching field definition in the schema
 * @param {string} key - The field name to match
 * @param {Array} schema - Array of field definitions
 * @returns {Object|undefined} Matching schema field or undefined
 */
function matchSchemaField(key, schema = []) {
  return schema.find((field) => field.name === key);
}

/**
 * Creates a field configuration object for form generation
 * @param {string} key - Field name
 * @param {any} value - Field value
 * @param {Array} schema - Array of field definitions
 * @returns {Object} Field configuration object
 */
function createField(key, value, schema = []) {
  const inferredType = inferType(value);
  const schemaField = matchSchemaField(key, schema);
  const isExplicit = Boolean(schemaField);

  // Create base field with common properties
  const baseField = {
    label: key,
    name: key,
    type: schemaField?.type || inferredType,
    value,
    placeholder: `Add ${key}`,
    isExplicit
  };

  // Merge schema field properties if available
  const field = schemaField ? { ...baseField, ...schemaField, value } : baseField;

  // Handle complex types (arrays and objects)
  if (inferredType === 'array' || inferredType === 'object') {
    const childSchema = schemaField?.fields || schema; // Use root schema if no fields defined

    // Process array items or object properties
    const children = Array.isArray(value)
      ? value.map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return {
              type: 'object',
              label: `Item ${index + 1}`,
              id: `${field.id}_${index}`,
              value: item,
              fields: Object.entries(item).map(([k, v]) => createField(k, v, schema))
            };
          }
          return createField(`item`, item, childSchema);
        })
      : Object.entries(value).map(([k, v]) => createField(k, v, childSchema));

    return {
      ...field,
      type: inferredType,
      [inferredType === 'array' ? 'value' : 'fields']: children,
      ...(isExplicit
        ? {}
        : {
            noDeletion: false,
            isRequired: false,
            noDuplication: true
          })
    };
  }

  return field;
}

/**
 * Converts a JSON object into a form schema object
 * @param {Object} json - Source JSON object to convert
 * @param {Array} schema - Optional array of field definitions
 * @returns {Object} Form schema object with fields array
 *
 * @example
 * const json = { name: "John", age: 30 };
 * const schema = [{ name: "name", type: "text", required: true }];
 * const result = await convertToSchemaObject(json, schema);
 * // Returns: { fields: [{ name: "name", type: "text", ... }, { name: "age", type: "number", ... }] }
 */
export async function convertToSchemaObject(json, schema = []) {
  return {
    fields: Object.entries(json).map(([key, value]) => createField(key, value, schema))
  };
}
