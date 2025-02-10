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
  if (Array.isArray(value)) {
    // All arrays should just use type 'array'
    return 'array';
  }
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

  // Merge all properties from schema field if it exists
  if (schemaField) {
    Object.assign(baseField, {
      ...schemaField,
      value: value // Preserve the current value
    });
  }

  // Handle nested objects
  if (inferredType === 'object' && typeof value === 'object') {
    baseField.fields = Object.entries(value).map(([childKey, childValue]) =>
      createField(childKey, childValue, explicitSchema)
    );
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
  const fields = Object.entries(frontmatter).map(([key, value]) => {
    // Find matching schema field
    const schemaField = explicitSchema.find((field) => field.name === key);
    console.log(`Processing field ${key}:`, { value, schemaField });

    // First infer the type from the value
    const inferredType = inferFieldType(value, key); // Pass the key here

    // Create base field with inferred type
    let field = {
      label: schemaField?.label || key,
      name: key,
      value: value,
      type: inferredType,
      placeholder: schemaField?.placeholder || `Add ${key}`
    };

    // If schema definition exists, override the field properties
    if (schemaField) {
      field = {
        ...field,
        ...schemaField, // This includes the schema-defined type
        value: value // Preserve the current value
      };
    }

    // Handle nested objects (like 'seo')
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      field.fields = Object.entries(value).map(([childKey, childValue]) => {
        const nestedSchemaField = explicitSchema.find((f) => f.name === childKey);
        const childInferredType = inferFieldType(childValue, childKey); // Pass the child key here

        return {
          label: nestedSchemaField?.label || childKey,
          name: childKey,
          value: childValue,
          type: nestedSchemaField?.type || childInferredType,
          placeholder: nestedSchemaField?.placeholder || `Add ${childKey}`,
          ...(nestedSchemaField || {})
        };
      });
    }

    console.log(`Final field for ${key}:`, field);

    return field;
  });

  return { fields };
};
