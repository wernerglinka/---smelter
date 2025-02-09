import React, { createContext, useContext, useReducer } from 'react';

/**
 * @typedef {Object} FieldDefinition
 * @property {string} label - The field's display label and object key
 * @property {string} type - Field type ('text', 'object', etc.)
 * @property {any} value - The field's current value
 * @property {string} [placeholder] - Optional placeholder text
 * @property {string} [id] - Unique identifier (generated if not provided)
 * @property {string} [path] - Dot-notation path in the form structure
 * @property {FieldDefinition[]} [fields] - Nested fields for object types
 */

/**
 * @typedef {Object} FormState
 * @property {FieldDefinition[]} fields - Array of form fields
 * @property {string} content - Form content
 */

/**
 * Context for form state and operations
 * @type {React.Context<{state: FormState, dispatch: Function}>}
 */
export const FormContext = createContext();

/**
 * Recursively updates fields in the form structure
 * @param {FieldDefinition[]} fields - Array of field definitions
 * @param {Object} payload - Update payload containing id, value, and optional label
 * @returns {FieldDefinition[]} Updated fields array
 */
const updateFieldsRecursively = (fields, payload) => {
  return fields.map(field => {
    // Direct match
    if (field.id === payload.id) {
      return {
        ...field,
        value: payload.type === 'checkbox' ? Boolean(payload.value) : payload.value,
        label: payload.label || field.label,
        type: field.type
      };
    }

    // Check nested fields in objects
    if (field.type === 'object') {
      const pathParts = payload.path?.split('.') || [];

      if (pathParts[0] === field.label) {
        const updatedFields = field.fields.map(f => {
          if (f.label === pathParts[1]) {
            return {
              ...f,
              value: payload.type === 'checkbox' ? Boolean(payload.value) : payload.value,
              label: f.label,
              type: f.type
            };
          }
          return f;
        });

        // Create value object preserving types and ensuring proper boolean values
        const newValue = updatedFields.reduce((acc, f) => ({
          ...acc,
          [f.label]: {
            value: f.type === 'checkbox' ? Boolean(f.value) : f.value,
            type: f.type
          }
        }), {});

        return {
          ...field,
          fields: updatedFields,
          value: newValue
        };
      }

      if (Array.isArray(field.fields)) {
        const updatedFields = updateFieldsRecursively(field.fields, payload);
        return {
          ...field,
          fields: updatedFields
        };
      }
    }

    return field;
  });
};

/**
 * Reducer for form state management
 * @param {FormState} state - Current form state
 * @param {Object} action - Action object
 * @param {string} action.type - Action type
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
 * Provider component for form context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.initialData - Initial form data
 * @param {FieldDefinition[]} props.initialData.fields - Initial fields array
 * @returns {JSX.Element} Provider component
 *
 * @example
 * // Expected initial data structure:
 * const initialData = {
 *   fields: [
 *     {
 *       label: "title",
 *       type: "text",
 *       value: "My Title",
 *       placeholder: "Enter title"
 *     },
 *     {
 *       label: "seo",
 *       type: "object",
 *       value: [
 *         {
 *           label: "description",
 *           type: "text",
 *           value: "SEO description"
 *         }
 *       ]
 *     }
 *   ],
 *   content: ""
 * };
 */
export const FormProvider = ({ children, initialData }) => {
  // Add IDs and paths to fields recursively
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
