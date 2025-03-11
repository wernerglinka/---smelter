// Test helpers for form generation tests
import React from 'react';
import { FormOperationsContext } from '../../../../../src/renderer/src/context/FormOperationsContext';
import { ErrorContext } from '../../../../../src/renderer/src/context/ErrorContext';

// Mock logger 
jest.mock('../../../../../src/renderer/src/utils/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

/**
 * Create mock contexts for form components testing
 * @returns {Object} Context providers
 */
export const createMockContexts = () => {
  // Form operations context mock
  const formOperationsMock = {
    getValue: jest.fn(),
    setValue: jest.fn(),
    duplicateField: jest.fn(),
    deleteField: jest.fn(),
    validateField: jest.fn(),
    getFormData: jest.fn(),
    validationErrors: {}
  };
  
  // Error context mock
  const errorContextMock = {
    handleError: jest.fn(),
    errors: {},
    clearErrors: jest.fn()
  };
  
  // Context wrapper component
  const ContextWrapper = ({ children }) => (
    <ErrorContext.Provider value={errorContextMock}>
      <FormOperationsContext.Provider value={formOperationsMock}>
        {children}
      </FormOperationsContext.Provider>
    </ErrorContext.Provider>
  );
  
  return {
    ContextWrapper,
    formOperationsMock,
    errorContextMock
  };
};