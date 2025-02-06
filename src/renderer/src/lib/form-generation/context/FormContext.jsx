import React, { createContext, useContext, useReducer } from 'react';

const FormContext = createContext();

const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(field => 
          field.id === action.payload.id 
            ? { ...field, value: action.payload.value }
            : field
        )
      };
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
  const [state, dispatch] = useReducer(formReducer, {
    fields: [],
    content: '',
    ...initialData
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