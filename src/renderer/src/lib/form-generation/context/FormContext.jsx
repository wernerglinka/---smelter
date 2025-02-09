import React, { createContext, useContext, useReducer } from 'react';

/**
 * @typedef {Object} FieldDefinition
 * @property {string} label - The field's display label and object key
 * @property {string} type - Field type (immutable, set during schema conversion)
 * @property {any} value - The field's current value
 * @property {string} [placeholder] - Optional placeholder text
 * @property {string} [id] - Unique identifier (generated if not provided)
 * @property {string} [path] - Dot-notation path in the form structure (e.g., "seo.title")
 * @property {FieldDefinition[]} [fields] - Nested fields for object types
 */

/**
 * @typedef {Object} FormState
 * @property {FieldDefinition[]} fields - Array of form fields
 * @property {string} content - Form content (markdown content below frontmatter)
 */

/**
 * Context for managing form state and operations.
 * Field types are determined during schema conversion and remain immutable.
 * This context only manages value updates and structural changes.
 * @type {React.Context<{state: FormState, dispatch: Function}>}
 */
export const FormContext = createContext();

/**
 * Updates field values in a nested structure while preserving field types
 * @param {FieldDefinition[]} fields - Array of field definitions
 * @param {Object} payload - Update payload
 * @param {string} payload.id - Field ID to update
 * @param {any} payload.value - New value
 * @param {string} payload.type - Input type (only used for checkbox conversion)
 * @param {string} [payload.path] - Dot notation path for nested updates
 * @returns {FieldDefinition[]} Updated fields array
 */
const updateFieldsRecursively = (fields, payload) => {
  return fields.map(field => {
    // Direct match - update value only
    if (field.id === payload.id) {
      return {
        ...field,
        value: payload.type === 'checkbox' ? Boolean(payload.value) : payload.value
      };
    }

    // Handle nested object fields
    if (field.type === 'object') {
      const pathParts = payload.path?.split('.') || [];

      // Update nested field if path matches
      if (pathParts[0] === field.label) {
        const updatedFields = field.fields.map(f => {
          if (f.label === pathParts[1]) {
            return {
              ...f,
              value: payload.type === 'checkbox' ? Boolean(payload.value) : payload.value
            };
          }
          return f;
        });

        // Update object value to reflect nested changes
        return {
          ...field,
          fields: updatedFields,
          value: updatedFields.reduce((acc, f) => ({
            ...acc,
            [f.label]: f.value
          }), {})
        };
      }

      // Recurse into nested fields array if present
      if (Array.isArray(field.fields)) {
        return {
          ...field,
          fields: updateFieldsRecursively(field.fields, payload)
        };
      }
    }

    return field;
  });
};

/**
 * Form state reducer
 * @param {FormState} state - Current form state
 * @param {Object} action - Action object
 * @param {string} action.type - Action type ('UPDATE_FIELD'|'ADD_FIELD'|'REMOVE_FIELD'|'SET_FORM_DATA')
 * @param {Object} action.payload - Action payload
 * @returns {FormState} New form state
 */
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      return {
        ...state,
        fields: updateFieldsRecursively(state.fields, action.payload)
      };
    }
    case 'ADD_FIELD':
      return {
        ...state,
        fields: [...state.fields, action.payload]
      };
    case 'REMOVE_FIELD':
      return {
        ...state,
        fields: state.fields.filter(field => field.id !== action.payload.id)
      };
    case 'SET_FORM_DATA':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

/**
 * Recursively adds IDs and paths to field definitions
 * @param {FieldDefinition[]} fields - Array of fields
 * @param {string} [parentPath=''] - Parent path for nested fields
 * @returns {FieldDefinition[]} Fields with IDs and paths
 */
const addIdsToFields = (fields, parentPath = '') => {
  return fields.map(field => {
    const fieldPath = parentPath ? `${parentPath}.${field.label}` : field.label;
    const newField = {
      ...field,
      id: field.id || `${field.label}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      path: fieldPath
    };

    if (field.type === 'object') {
      // Handle array of field definitions
      if (Array.isArray(field.value)) {
        newField.fields = field.value.map(subField => ({
          ...subField,
          id: `${newField.id}-${subField.label}`,
          path: `${fieldPath}.${subField.label}`
        }));

        // Convert array to object structure
        newField.value = newField.fields.reduce((acc, f) => ({
          ...acc,
          [f.label]: f.value
        }), {});
      }
      // Handle object value
      else if (field.value && typeof field.value === 'object') {
        newField.fields = Object.entries(field.value).map(([key, value]) => ({
          label: key,
          value: value,
          type: typeof value === 'object' ? 'object' : 'text',
          path: `${fieldPath}.${key}`,
          id: `${newField.id}-${key}`
        }));
      }
      // Handle existing fields array
      else if (field.fields) {
        newField.fields = addIdsToFields(field.fields, fieldPath);
        newField.value = newField.fields.reduce((acc, f) => ({
          ...acc,
          [f.label]: f.value
        }), {});
      }
    }

    return newField;
  });
};

/**
 * Provider component for form context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.initialData - Initial form data
 * @param {FieldDefinition[]} props.initialData.fields - Initial fields array
 * @returns {JSX.Element} Provider component
 */
export const FormProvider = ({ children, initialData }) => {
  const fieldsWithIds = addIdsToFields(initialData.fields);

  const [state, dispatch] = useReducer(formReducer, {
    ...initialData,
    fields: fieldsWithIds
  });

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
};

/**
 * Hook to access form context
 * @returns {{state: FormState, dispatch: Function}} Form context value
 * @throws {Error} If used outside of FormProvider
 */
export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
