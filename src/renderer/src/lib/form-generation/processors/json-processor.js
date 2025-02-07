export const processJsonData = (jsonData) => {
  const createField = (key, value) => {
    if (Array.isArray(value)) {
      return {
        id: key,
        label: key,
        type: 'array',
        value: value.map((item, index) => {
          if (typeof item === 'object' && item !== null) {
            return {
              type: 'object',
              label: `Item ${index + 1}`,
              value: Object.entries(item).map(([k, v]) => createField(k, v))
            };
          }
          return item;
        })
      };
    }
    
    if (typeof value === 'object' && value !== null) {
      return {
        id: key,
        label: key,
        type: 'object',
        value: Object.entries(value).map(([k, v]) => createField(k, v))
      };
    }

    // Map JavaScript types to form field types
    let fieldType;
    switch (typeof value) {
      case 'string':
        fieldType = value.includes('\n') ? 'textarea' : 'text';
        break;
      case 'number':
        fieldType = 'number';
        break;
      case 'boolean':
        fieldType = 'checkbox';
        break;
      default:
        fieldType = 'text'; // Default to text for unknown types
    }

    return {
      id: key,
      label: key,
      type: fieldType,
      value: value
    };
  };

  const fields = Object.entries(jsonData).map(([key, value]) => 
    createField(key, value)
  );

  return {
    fields,
    originalData: jsonData
  };
};