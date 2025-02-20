import {
  isSimpleList,
  isDateObject,
  isSectionsArray
} from '@lib/utilities/validation/type-validators.js';

/**
 * Infers the field type from a value
 * @param {*} value - The value to analyze
 * @returns {string} The inferred field type
 */
const inferType = (value) => {
  if (typeof value === 'boolean') return 'checkbox';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value !== null) return 'object';
  return 'text';
};

/**
 * Processes child elements of arrays and objects
 * @param {*} value - The value to process
 * @returns {Array|Object} Processed children
 */
function processChildren(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      // Handle primitive values in arrays
      if (typeof item !== 'object' || item === null) {
        return {
          type: inferType(item),
          label: `Item ${index + 1}`,
          value: item
        };
      }

      // Handle objects in arrays
      return {
        type: 'object',
        label: `Item ${index + 1}`,
        value: item,
        fields: Object.entries(item).map(([childKey, childValue]) =>
          createField(childKey, childValue)
        )
      };
    });
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).map(([childKey, childValue]) => createField(childKey, childValue));
  }

  return value;
}

/**
 * Creates a field definition from a key-value pair
 * @param {string} key - The field key
 * @param {*} value - The field value
 * @returns {Object} The field definition
 */
function createField(key, value) {
  const type = inferType(value);
  const baseField = {
    label: key,
    type,
    value,
    placeholder: `Add ${key}`
  };

  if (type === 'array') {
    return {
      ...baseField,
      type: 'array',
      isDropzone: true,
      dropzoneType: 'sections',
      value: processChildren(value)
    };
  }

  if (type === 'object') {
    return {
      ...baseField,
      fields: processChildren(value),
      value: value
    };
  }

  return baseField;
}

/**
 * Converts JSON to schema object
 * @param {Object} json - The JSON to convert
 * @returns {Object} The schema object
 */
export async function convertToSchemaObject(json) {
  return {
    fields: Object.entries(json).map(([key, value]) => createField(key, value))
  };
}
