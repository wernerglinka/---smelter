import { isSimpleList, isDateObject } from '@lib/utilities/validation/type-validators.js';

const inferType = (value) => {
  if (isSimpleList(value)) return 'list';
  if (isDateObject(value)) return 'date';
  if (Array.isArray(value)) return 'array';

  const type = typeof value;
  if (type === 'string') return value.includes('\n') ? 'textarea' : 'text';
  if (type === 'object' && value !== null) return 'object';

  return type === 'boolean' ? 'checkbox' : type === 'number' ? 'number' : 'text';
};

function matchSchemaField(key, schema = []) {
  return schema.find((field) => field.label === key || field.name === key);
}

function createField(key, value, schema = []) {
  const inferredType = inferType(value);
  const schemaField = matchSchemaField(key, schema);
  const isExplicit = Boolean(schemaField);

  const baseField = {
    label: key,
    name: key,
    type: schemaField?.type || inferredType,
    value,
    placeholder: `Add ${key}`,
    isExplicit // Flag to indicate if field is explicitly defined in schema
  };

  const field = schemaField ? { ...baseField, ...schemaField, value } : baseField;

  if (inferredType === 'array' || inferredType === 'object') {
    const childSchema = schemaField?.fields || [];

    const children = Array.isArray(value)
      ? value
          .map((item) => {
            if (typeof item === 'object' && item !== null) {
              return Object.entries(item).map(([k, v]) => createField(k, v, childSchema));
            }
            return createField(`item`, item, childSchema);
          })
          .flat()
      : Object.entries(value).map(([k, v]) => createField(k, v, childSchema));

    return {
      ...field,
      type: inferredType,
      [inferredType === 'array' ? 'value' : 'fields']: children,
      // Only apply these defaults for implicit fields
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

export async function convertToSchemaObject(json, schema = []) {
  return {
    fields: Object.entries(json).map(([key, value]) => createField(key, value, schema))
  };
}
