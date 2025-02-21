/**
 * Ensures proper field structure for both array and object fields
 * @param {Object} item - The field item to structure
 * @param {string} parentId - Parent field ID for generating nested IDs
 * @returns {Object} Properly structured field
 */
export const ensureFieldStructure = (item, parentId) => {
  if (!item || typeof item !== 'object') {
    return item;
  }

  // Handle arrays
  if (Array.isArray(item)) {
    return item.map((subItem) => ensureFieldStructure(subItem, parentId));
  }

  // Base field properties
  const structuredItem = {
    ...item,
    id: item.id || `${parentId || 'root'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  // If this is already a field with a type, return it as is
  if (structuredItem.type && structuredItem.fields) {
    return structuredItem;
  }

  // Determine the type if not explicitly set
  if (!structuredItem.type) {
    if (Array.isArray(structuredItem.value)) {
      structuredItem.type = 'array';
    } else if (typeof structuredItem.value === 'object' && structuredItem.value !== null) {
      structuredItem.type = 'object';
    } else {
      structuredItem.type = 'text';
    }
  }

  // Handle object types
  if (structuredItem.type === 'object') {
    const objectData =
      structuredItem.value ||
      Object.entries(structuredItem)
        .filter(([key]) => !['id', 'type', 'label', 'fields'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (typeof objectData === 'object' && objectData !== null) {
      // Ensure fields array exists for all object types
      structuredItem.fields =
        structuredItem.fields ||
        Object.entries(objectData).map(([key, value]) =>
          ensureFieldStructure(
            {
              label: key,
              name: key,
              value: value,
              type: Array.isArray(value)
                ? 'array'
                : typeof value === 'object' && value !== null
                  ? 'object'
                  : 'text'
            },
            structuredItem.id
          )
        );
    }
  }

  return structuredItem;
};
