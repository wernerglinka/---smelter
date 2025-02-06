import { isSimpleList, isDateObject, isSectionsArray } from '../utilities/type-validators.js';

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
 * @returns {Object} The field definition
 */
function createField(key, value) {
  const type = inferFieldType(value, key);
  const baseField = {
    label: key,
    type,
    value,
    placeholder: `Add ${key}`
  };

  // Handle sections array specially
  if (type === 'sections-array') {
    return {
      ...baseField,
      type: 'array',
      isDropzone: true,
      dropzoneType: 'sections',
      value: Array.isArray(value)
        ? value.map((section, index) => ({
            type: 'object',
            label: `section${index + 1}`,
            value: Object.entries(section).map(([sKey, sValue]) => createField(sKey, sValue))
          }))
        : []
    };
  }

  // Handle regular arrays
  if (type === 'array') {
    return {
      ...baseField,
      type: 'array',
      isDropzone: true,
      dropzoneType: 'sections',
      value: Array.isArray(value)
        ? value.map((arrayItem, index) => ({
            type: 'object',
            label: `Item ${index + 1}`,
            value: Object.entries(arrayItem).map(([key, val]) => createField(key, val))
          }))
        : []
    };
  }
  // Handle objects
  else if (type === 'object') {
    baseField.value = Object.entries(value).map(([subKey, subValue]) =>
      createField(subKey, subValue)
    );
    delete baseField.placeholder;
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