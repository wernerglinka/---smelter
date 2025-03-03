import React, { createContext, useContext, useState } from 'react';

/**
 * @typedef {Object} FormContextValue
 * @property {Function} onSubmit - Form submission handler
 * @property {Function} updateFormState - Update form state
 */

export const FormContext = createContext(null);

/**
 * Provider for form context
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.initialData - Initial form data
 */
export const FormProvider = ({ children, initialData = {} }) => {
  const [formState, setFormState] = useState(initialData);
  
  /**
   * Handles form submission
   */
  const handleSubmit = (event) => {
    event.preventDefault();
  };
  
  /**
   * Updates form state based on operation type
   * @param {string} operationType - Type of operation to perform
   * @param {Object} data - Operation data
   */
  const updateFormState = (operationType, data) => {
    switch(operationType) {
      case 'setValue':
        setFormState(prevState => ({
          ...prevState,
          [data.field]: data.value
        }));
        break;
      case 'duplicateField':
        // Add implementation if needed at form context level
        break;
      case 'deleteField':
        // Add implementation if needed at form context level
        break;
      default:
        console.warn(`Unknown operation type: ${operationType}`);
    }
  };

  return (
    <FormContext.Provider value={{ 
      onSubmit: handleSubmit, 
      formState,
      updateFormState 
    }}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

/**
 * Hook to access form context
 * @returns {FormContextValue}
 */
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
