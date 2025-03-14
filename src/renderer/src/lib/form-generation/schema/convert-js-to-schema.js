import { isSimpleList, isDateObject } from '@utils/validation/types';
import { toTitleCase } from '@utils/format/string';

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
 * Matches a field key with its schema definition
 * @param {string} key - The field key to match
 * @param {Array} schema - The schema array to search
 * @returns {Object|undefined} The matching schema field or undefined
 */
function matchSchemaField(key, schema = []) {
  if (!Array.isArray(schema)) {
    return undefined;
  }

  return schema
    .filter(
      (field) =>
        field && typeof field === 'object' && field.name !== undefined && field.name !== null
    )
    .find((field) => field.name === key);
}

/**
 * Converts a string to title case
 * @param {string} str - The string to convert
 * @returns {string} The title case string

function toTitleCase(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
*/
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
    label: toTitleCase(key),
    name: key,
    type: schemaField?.type || inferredType,
    value,
    placeholder: `Add ${toTitleCase(key)}`,
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
 * Converts a JSON object or array into a form schema object
 * @param {Object|Array} data - Source JSON object or array to convert
 * @param {Array} schema - Optional array of field definitions
 * @returns {Object} Form schema object with fields array
 *
 * @example
 * const json = { name: "John", age: 30 };
 * const schema = [{ name: "name", type: "text", required: true }];
 * const result = await convertToSchemaObject(json, schema);
 * // Returns: { fields: [{ name: "name", type: "text", ... }, { name: "age", type: "number", ... }] }
 */
export const convertToSchemaObject = async (data, schema = []) => {
  // Handle null or undefined inputs
  if (data === null || data === undefined) {
    return { fields: [] };
  }

  // Handle arrays at the root level
  if (Array.isArray(data)) {
    // Create a wrapper field for the root array
    const rootArrayField = {
      label: 'Items',
      name: 'items',
      type: 'array',
      value: data.map((item, index) => {
        // Handle object items
        if (typeof item === 'object' && item !== null) {
          return {
            type: 'object',
            label: `Item ${index + 1}`,
            id: `item_${index}`,
            fields: Object.entries(item).map(([k, v]) => createField(k, v, schema))
          };
        }
        // Handle primitive items
        return {
          type: inferType(item),
          label: `Item ${index + 1}`,
          name: `item_${index}`,
          value: item
        };
      })
    };

    return {
      fields: [rootArrayField]
    };
  }

  // Handle regular objects
  if (typeof data === 'object') {
    return {
      fields: Object.entries(data).map(([key, value]) => createField(key, value, schema))
    };
  }

  // Handle primitive types (shouldn't normally happen at root level)
  return {
    fields: [{
      type: inferType(data),
      label: 'Value',
      name: 'value',
      value: data
    }]
  };
};

// Export internal functions for testing
export const __test__ = {
  matchSchemaField,
  createField
};
