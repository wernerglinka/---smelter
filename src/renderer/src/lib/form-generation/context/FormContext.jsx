import React, { createContext, useContext, useReducer } from 'react';

export const FormContext = createContext();

const updateFieldsRecursively = (fields, payload) => {
  return fields.map(field => {
    // Direct match
    if (field.id === payload.id) {
      return { ...field, value: payload.value };
    }

    // Check nested fields in objects
    if (field.type === 'object') {
      // If field has nested fields array
      if (Array.isArray(field.fields)) {
        const updatedFields = updateFieldsRecursively(field.fields, payload);
        return {
          ...field,
          fields: updatedFields,
          // Update the value object to match the fields
          value: updatedFields.reduce((obj, f) => ({
            ...obj,
            [f.label]: f.value
          }), {})
        };
      }

      // If field has value as object
      if (field.value && typeof field.value === 'object') {
        const pathParts = payload.path?.split('.') || [];
        if (pathParts[0] === field.label) {
          const newValue = { ...field.value };
          const lastKey = pathParts[pathParts.length - 1];
          newValue[lastKey] = payload.value;
          return { ...field, value: newValue };
        }
      }
    }

    return field;
  });
};

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
        if (field.fields) {
          newField.fields = addIdsToFields(field.fields, fieldPath);
        } else if (field.value && typeof field.value === 'object') {
          // Convert object values to fields array
          newField.fields = Object.entries(field.value).map(([key, value]) => ({
            id: `${newField.id}-${key}`,
            label: key,
            value: value,
            type: typeof value === 'boolean' ? 'checkbox' : 'text',
            path: `${fieldPath}.${key}`
          }));
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

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
