import React, { createContext, useContext, useReducer } from 'react';

export const FormContext = createContext();

const updateFieldsRecursively = (fields, payload) => {
  return fields.map(field => {
    // Direct match
    if (field.id === payload.id) {
      return {
        ...field,
        value: payload.value,
        label: payload.label || field.label
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
              value: payload.value,
              label: f.label // Explicitly preserve the original label
            };
          }
          return f;
        });

        // Create value object using original labels
        const newValue = updatedFields.reduce((acc, f) => ({
          ...acc,
          [f.label]: f.value // Use original label as key
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
  console.log('Initial Data:', JSON.stringify(initialData, null, 2));

  // Add IDs and paths to fields recursively
  const addIdsToFields = (fields, parentPath = '') => {
    console.log('Processing fields:', JSON.stringify(fields, null, 2));
    return fields.map(field => {
      const fieldPath = parentPath ? `${parentPath}.${field.label}` : field.label;
      const newField = {
        ...field,
        id: field.id || `${field.label}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        path: fieldPath
      };

      if (field.type === 'object') {
        // Handle the case where value is an array of field definitions
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
        // Handle the case where value is already an object
        else if (field.value && typeof field.value === 'object') {
          newField.fields = Object.entries(field.value).map(([key, value]) => ({
            label: key,
            value: value,
            type: typeof value === 'object' ? 'object' : 'text',
            path: `${fieldPath}.${key}`,
            id: `${newField.id}-${key}`
          }));
        }
        // Handle the case where fields array exists
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

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
