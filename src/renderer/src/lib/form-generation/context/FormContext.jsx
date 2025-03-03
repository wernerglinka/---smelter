import React, { createContext, useContext } from 'react';

/**
 * @typedef {Object} FormContextValue
 * @property {Function} onSubmit - Form submission handler
 */

export const FormContext = createContext(null);

/**
 * Provider for form context
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.initialData - Initial form data
 */
export const FormProvider = ({ children, initialData }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <FormContext.Provider value={{ onSubmit: handleSubmit }}>
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
