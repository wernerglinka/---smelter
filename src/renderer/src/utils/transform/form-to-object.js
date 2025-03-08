/**
 * Form to object transformation utilities
 * 
 * @module FormTransformation to JS Object
 */

import { logger } from '../services/logger';
import { toCamelCase } from '../format/string';
import { toTitleCase } from '../format/string';

/** @module FormTransformation to JS Object */

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
    return item.map((arrayItem, index) => {
      // If array item is an object, wrap it properly
      if (typeof arrayItem === 'object' && !Array.isArray(arrayItem)) {
        return ensureFieldStructure(
          {
            type: 'object',
            label: `Item ${index + 1}`,
            value: arrayItem,
            id: `${parentId}_item_${index}`
          },
          parentId
        );
      }
      return ensureFieldStructure(arrayItem, parentId);
    });
  }

  // Base field properties
  const structuredItem = {
    ...item,
    id: item.id || `${parentId || 'root'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    label: item.label ? toTitleCase(item.label) : undefined // Transform label if it exists
  };

  // If this is already a field with a type, return it as is
  if (structuredItem.type && structuredItem.fields) {
    // Transform labels in nested fields
    if (structuredItem.fields) {
      structuredItem.fields = structuredItem.fields.map((field) => ({
        ...field,
        label: toTitleCase(field.label)
      }));
    }
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

/**
 * Operations for extracting and formatting values from form elements
 * @namespace ValueOps
 */
export const ValueOps = {
  /**
   * @function getName
   * Extracts name from element, converts to camelCase
   * @param {HTMLElement} element - Form element
   * @returns {string} Cleaned, camelCased name
   */
  getName: (element) => {
    // Special handling for arrays
    if (element.classList.contains('is-array')) {
      const arrayLabel = element.querySelector('.array-name .element-label');
      if (arrayLabel) {
        return toCamelCase(arrayLabel.value);
      }
    }

    const input = element.querySelector('.object-name input');
    const text = element.querySelector('.label-text');
    if (!input && !text) return '';

    const rawName = (input ? input.value : text.textContent).trim();
    return toCamelCase(rawName);
  },

  /**
   * @function getKeyValue
   * Extracts key-value pair from form element with proper type conversion
   * @param {HTMLElement} element - Form element
   * @returns {{key: string, value: any}} Key-value pair
   */
  getKeyValue: (element) => {
    const labelInput = element.querySelector('.element-label');
    const valueInput = element.querySelector('.element-value');

    const key = labelInput ? toCamelCase(labelInput.value) : '';

    if (!valueInput) return { key, value: '' };

    // Convert value based on input type or field class
    let value = valueInput.value;

    // Check if this is a number field by class
    if (element.classList.contains('is-number') || valueInput.type === 'number') {
      value = value === '' ? '' : Number(value);
    } else if (valueInput.type === 'checkbox') {
      value = valueInput.checked;
    } else if (element.classList.contains('is-date') || valueInput.type === 'date') {
      value = value ? new Date(value).toISOString() : '';
    } else {
      value = value.trim();
    }

    return { key, value };
  }
};

/**
 * Operations for managing object paths
 * @namespace PathOps
 */
export const PathOps = {
  /**
   * @function push
   * Adds name to path array
   * @param {string[]} path - Current path array
   * @param {string} name - Name to append
   * @returns {string[]} New path array
   */
  push: (path, name) => [...path, name],

  /**
   * @function pop
   * Removes last element from path
   * @param {string[]} path - Current path array
   * @returns {string[]} Shortened path array
   */
  pop: (path) => path.slice(0, -1),

  /**
   * @function getIn
   * Gets nested object value at path
   * @param {Object} obj - Source object
   * @param {string[]} path - Path to traverse
   * @returns {Object} Nested object
   */
  getIn: (obj, path) => {
    return path.reduce((current, key) => {
      current[key] = current[key] || {};
      return current[key];
    }, obj);
  },

  /**
   * @function setIn
   * Sets value at nested path
   * @param {Object} obj - Source object
   * @param {string[]} path - Path to set
   * @param {*} value - Value to set
   * @returns {Object} Updated object
   */
  setIn: (obj, path, value) => {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    return {
      ...obj,
      [head]: PathOps.setIn(obj[head] || {}, rest, value)
    };
  }
};

/**
 * Operations for managing form state
 * @namespace FormStateOps
 */
export const FormStateOps = {
  /**
   * @function createState
   * Creates initial form state
   * @returns {{path: string[], result: Object}} Initial state
   */
  createState: () => ({
    path: ['main'],
    result: { main: {} }
  }),

  /**
   * @function handleStructural
   * Handles structural elements by updating path
   * @param {Object} state - Current state
   * @param {HTMLElement} element - Form element
   * @returns {Object} Updated state
   */
  handleStructural: (state, element) => {
    const name = ValueOps.getName(element);
    return {
      ...state,
      path: PathOps.push(state.path, name)
    };
  },

  /**
   * @function handleValue
   * Processes value elements with type conversion
   * @param {Object} state - Current state
   * @param {HTMLElement} element - Form element
   * @returns {Object} Updated state
   */
  handleValue: (state, element) => {
    if (element.classList.contains('is-list')) {
      const name = ValueOps.getName(element);
      const items = Array.from(element.querySelectorAll('.list-item')).map((input) => {
        // Convert list items based on data type
        const type = input.dataset.type;
        const value = input.value.trim();
        switch (type) {
          case 'number':
            return Number(value);
          case 'boolean':
            return value.toLowerCase() === 'true';
          default:
            return value;
        }
      });

      const currentValue = PathOps.getIn(state.result, state.path);
      return {
        ...state,
        result: PathOps.setIn(state.result, state.path, { ...currentValue, [name]: items })
      };
    }

    const { key, value } = ValueOps.getKeyValue(element);
    if (!key) return state;

    return {
      ...state,
      result: PathOps.setIn(state.result, state.path, {
        ...PathOps.getIn(state.result, state.path),
        [key]: value
      })
    };
  },

  /**
   * @function handleList
   * Handles list elements by updating path
   * @param {Object} state - Current state
   * @param {HTMLElement} element - Form element
   * @returns {Object} Updated state
   */
  handleList: (state, element) => {
    const name = ValueOps.getName(element);
    const items = Array.from(element.querySelectorAll('.list-item')).map((input) =>
      input.value.trim()
    );

    return {
      ...state,
      result: PathOps.setIn(state.result, ['main'], {
        ...PathOps.getIn(state.result, ['main']),
        [name]: items
      })
    };
  },

  /**
   * @function handleArrayConversion
   * Converts objects to arrays
   * @param {Object} state - Current state
   * @returns {Object} Updated state with array conversion
   */
  handleArrayConversion: (state) => {
    const currentObj = PathOps.getIn(state.result, state.path);

    if (currentObj.isList) {
      const arrayItems = currentObj.items || [];
      delete currentObj.isList;
      delete currentObj.items;
      return {
        ...state,
        path: PathOps.pop(state.path),
        result: PathOps.setIn(state.result, state.path, arrayItems)
      };
    }

    const arrayVersion = Object.entries(currentObj).map(([key, value]) =>
      key.endsWith('block') ? { [key]: value } : typeof value === 'string' ? value : value
    );

    return {
      ...state,
      path: PathOps.pop(state.path),
      result: PathOps.setIn(state.result, state.path, arrayVersion)
    };
  },

  /**
   * @function handleObjectEnd
   * Handles object end by popping path
   * @param {Object} state - Current state
   * @returns {Object} Updated state
   */
  handleObjectEnd: (state) => ({
    ...state,
    path: PathOps.pop(state.path)
  })
};

/**
 * Transforms form elements to nested object structure
 * @param {HTMLElement[]} allFormElements - Form elements
 * @returns {Object|null} Transformed object
 */
export const transformFormElementsToObject = (allFormElements) => {
  try {
    const finalState = Array.from(allFormElements).reduce((state, element) => {
      const elementClasses = {
        isObject: element.classList.contains('is-object'),
        isArray: element.classList.contains('is-array'),
        isList: element.classList.contains('is-list'),
        isLast: element.classList.contains('is-last'),
        isLastInArray: element.classList.contains('array-last')
      };

      switch (true) {
        case state.path.length === 1 &&
          !elementClasses.isObject &&
          !elementClasses.isArray &&
          !elementClasses.isList &&
          !elementClasses.isLastInArray:
          const { key, value } = ValueOps.getKeyValue(element);
          if (!key) return state;
          return {
            ...state,
            result: PathOps.setIn(state.result, ['main'], {
              ...PathOps.getIn(state.result, ['main']),
              [key]: value
            })
          };

        case elementClasses.isObject || elementClasses.isArray:
          return FormStateOps.handleStructural(state, element);

        case elementClasses.isList:
          return FormStateOps.handleList(state, element);

        case !elementClasses.isLast:
          return FormStateOps.handleValue(state, element);

        case elementClasses.isLastInArray:
          return FormStateOps.handleArrayConversion(state);

        default:
          return FormStateOps.handleObjectEnd(state);
      }
    }, FormStateOps.createState());

    return finalState.result.main;
  } catch (error) {
    logger.error('Transformation error:', error);
    return null;
  }
};

/**
 * Preprocesses form data by adding temporary markers and transforming to object
 *
 * @description
 * Process:
 * 1. Adds temporary 'is-last' markers to dropzones for proper object structure
 * 2. Handles special case for array dropzones with 'array-last' marker
 * 3. Collects all form elements
 * 4. Transforms elements to structured object
 * 5. Cleans up temporary markers
 *
 * @returns {Object} Processed form data object with nested structure
 * @throws {Error} If main form element not found
 */
export const preprocessFormData = (form) => {
  // Add temporary markers for structure parsing
  const allDropzones = form.querySelectorAll('.js-dropzone');

  allDropzones.forEach((dropzone) => {
    // Add dummy is-last element at the end of dropzone
    const dummyElement = document.createElement('div');
    dummyElement.classList.add('form-element', 'is-last');

    // Handle array dropzones specially
    if (dropzone.classList.contains('array-dropzone')) {
      dummyElement.classList.add('array-last');
    }
    dropzone.appendChild(dummyElement);
  });

  // Get all form elements
  const allFormElements = form.querySelectorAll('.form-element');

  // Find arrays and add is-last to the last element
  allFormElements.forEach((element) => {
    if (element.classList.contains('is-array')) {
      const thisDropzone = element.querySelector('.dropzone');
      if (thisDropzone) {
        const lastElement = thisDropzone.lastElementChild;
        if (lastElement) {
          lastElement.classList.add('array-last');
        }
      }
    }
  });

  try {
    // Transform to object structure
    const dropzoneValues = transformFormElementsToObject(allFormElements);

    // Cleanup temporary markers
    const redundantDummyElements = form.querySelectorAll('.is-last');
    redundantDummyElements.forEach((element) => {
      element.remove();
    });

    return dropzoneValues;
  } catch (error) {
    logger.error('Error in preprocessFormData:', error);
    return null;
  }
};