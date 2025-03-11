import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ValidationProvider, useValidation } from '../../src/renderer/src/context/ValidationContext';

// Mock logger
jest.mock('../../src/renderer/src/utils/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Access logger after mocking
const { logger } = require('../../src/renderer/src/utils/services/logger');

// Mock validators
jest.mock('../../src/renderer/src/utils/validation/form', () => ({
  required: jest.fn(value => !!value),
  minLength: jest.fn(min => value => value && value.length >= min),
  maxLength: jest.fn(max => value => value && value.length <= max),
  pattern: jest.fn((pattern, msg) => value => pattern.test(value) ? true : msg),
  isValidEmail: jest.fn(value => /^[^@]+@[^@]+\.[^@]+$/.test(value)),
  isValidUrl: jest.fn(value => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  })
}));

// Test component to access validation context
const TestComponent = ({ onContextReceived }) => {
  const validationContext = useValidation();
  
  React.useEffect(() => {
    if (onContextReceived) {
      onContextReceived(validationContext);
    }
  }, [onContextReceived, validationContext]);
  
  return (
    <div data-testid="test-component">
      <div data-testid="error-count">{Object.keys(validationContext.errors).length}</div>
      <button 
        data-testid="validate-button"
        onClick={() => validationContext.validate('test-field', 'test-value', { required: true })}
      >
        Validate
      </button>
      <button 
        data-testid="validate-form-button"
        onClick={() => validationContext.validateForm({ 'test-field': 'test-value' }, { 'test-field': { required: true } })}
      >
        Validate Form
      </button>
      <button 
        data-testid="clear-errors-button"
        onClick={() => validationContext.clearErrors()}
      >
        Clear Errors
      </button>
    </div>
  );
};

describe('ValidationContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('ValidationProvider', () => {
    test('renders children correctly', () => {
      render(
        <ValidationProvider>
          <div data-testid="child-component">Child Content</div>
        </ValidationProvider>
      );
      
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toHaveTextContent('Child Content');
    });
    
    test('provides validation context to children', () => {
      const contextCallback = jest.fn();
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={contextCallback} />
        </ValidationProvider>
      );
      
      expect(contextCallback).toHaveBeenCalledTimes(1);
      const context = contextCallback.mock.calls[0][0];
      
      // Check that all required methods are available
      expect(context.errors).toBeDefined();
      expect(typeof context.validate).toBe('function');
      expect(typeof context.validateForm).toBe('function');
      expect(typeof context.clearErrors).toBe('function');
      expect(typeof context.clearFieldError).toBe('function');
      expect(typeof context.setFieldError).toBe('function');
      expect(typeof context.getValidators).toBe('function');
    });
    
    test('throws error when useValidation is used outside provider', () => {
      // Suppress console.error during this test
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useValidation must be used within a ValidationProvider');
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });
  
  describe('validate function', () => {
    test('validates required fields correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Valid case
      expect(validationContext.validate('test-field', 'test-value', { required: true })).toBe(true);
      expect(validationContext.errors['test-field']).toBeUndefined();
      
      // Invalid case - we need to use act because setState is called
      await act(async () => {
        expect(validationContext.validate('test-field', '', { required: true })).toBe(false);
      });
      
      // Now we can check the errors
      expect(validationContext.errors['test-field']).toBe('This field is required');
    });
    
    test('validates minLength correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Valid case
      expect(validationContext.validate('test-field', 'abcdef', { minLength: 5 })).toBe(true);
      expect(validationContext.errors['test-field']).toBeUndefined();
      
      // Invalid case - we need to use act because setState is called
      await act(async () => {
        expect(validationContext.validate('test-field', 'abc', { minLength: 5 })).toBe(false);
      });
      
      // Now we can check the errors
      expect(validationContext.errors['test-field']).toBe('Must be at least 5 characters');
    });
    
    test('validates maxLength correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Valid case
      expect(validationContext.validate('test-field', 'abc', { maxLength: 5 })).toBe(true);
      expect(validationContext.errors['test-field']).toBeUndefined();
      
      // Invalid case - we need to use act because setState is called
      await act(async () => {
        expect(validationContext.validate('test-field', 'abcdefghi', { maxLength: 5 })).toBe(false);
      });
      
      // Now we can check the errors
      expect(validationContext.errors['test-field']).toBe('Cannot exceed 5 characters');
    });
    
    test('validates pattern correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Mock pattern validator to return consistent result
      require('../../src/renderer/src/utils/validation/form').pattern.mockImplementation(
        () => () => 'Pattern validation failed'
      );
      
      const alphanumericPattern = /^[a-zA-Z0-9]+$/;
      
      // Valid case - need to restore the original implementation
      require('../../src/renderer/src/utils/validation/form').pattern.mockImplementation(
        (pattern) => (value) => pattern.test(value) ? true : 'Invalid pattern'
      );
      
      expect(validationContext.validate('test-field', 'abc123', { pattern: alphanumericPattern })).toBe(true);
      expect(validationContext.errors['test-field']).toBeUndefined();
      
      // Invalid case - pattern validation returns custom error message
      require('../../src/renderer/src/utils/validation/form').pattern.mockImplementation(
        () => () => 'Pattern validation failed'
      );
      
      await act(async () => {
        expect(validationContext.validate('test-field', 'abc-123', { pattern: alphanumericPattern })).toBe(false);
      });
      
      // Now we can check for the exact error message
      expect(validationContext.errors['test-field']).toBe('Pattern validation failed');
    });
    
    test('validates email correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Valid case
      expect(validationContext.validate('email-field', 'test@example.com', { email: true })).toBe(true);
      expect(validationContext.errors['email-field']).toBeUndefined();
      
      // Invalid case
      await act(async () => {
        expect(validationContext.validate('email-field', 'not-an-email', { email: true })).toBe(false);
      });
      
      expect(validationContext.errors['email-field']).toBe('Please enter a valid email address');
    });
    
    test('validates url correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Valid case
      expect(validationContext.validate('url-field', 'https://example.com', { url: true })).toBe(true);
      expect(validationContext.errors['url-field']).toBeUndefined();
      
      // Invalid case
      await act(async () => {
        expect(validationContext.validate('url-field', 'not-a-url', { url: true })).toBe(false);
      });
      
      expect(validationContext.errors['url-field']).toBe('Please enter a valid URL');
    });
    
    test('validates with custom validation function', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      const customValidator = jest.fn(value => {
        if (value === 'valid') return true;
        return 'Custom error message';
      });
      
      // Valid case
      expect(validationContext.validate('custom-field', 'valid', { custom: customValidator })).toBe(true);
      expect(validationContext.errors['custom-field']).toBeUndefined();
      
      // Invalid case
      await act(async () => {
        expect(validationContext.validate('custom-field', 'invalid', { custom: customValidator })).toBe(false);
      });
      expect(validationContext.errors['custom-field']).toBe('Custom error message');
      
      // With boolean return instead of string
      const booleanValidator = jest.fn(value => value === 'valid');
      
      await act(async () => {
        expect(validationContext.validate('custom-field', 'invalid', { custom: booleanValidator })).toBe(false);
      });
      expect(validationContext.errors['custom-field']).toBe('Invalid value');
    });
    
    test('returns true when no validation rules are provided', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      expect(validationContext.validate('test-field', 'any value', null)).toBe(true);
      expect(validationContext.validate('test-field', 'any value', {})).toBe(true);
    });
    
    test('skips rules that are set to false', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Even though the value is empty, required: false should skip the validation
      expect(validationContext.validate('test-field', '', { required: false })).toBe(true);
      
      // Test with multiple rules where one is false
      expect(validationContext.validate('test-field', 'abc', { 
        required: true,
        minLength: false,
        maxLength: 10
      })).toBe(true);
    });
    
    test('handles errors gracefully during validation', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Create a rule that will throw an error
      const throwingRule = {
        custom: () => { throw new Error('Test error'); }
      };
      
      await act(async () => {
        expect(validationContext.validate('test-field', 'any value', throwingRule)).toBe(false);
      });
      
      expect(validationContext.errors['test-field']).toBe('Validation error');
      expect(logger.error).toHaveBeenCalled();
    });
    
    test('safeguards against undefined field names', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Call setFieldError with undefined field name
      await act(async () => {
        validationContext.setFieldError(undefined, 'Some error');
      });
      
      // Should log a warning and not set the error
      expect(logger.warn).toHaveBeenCalledWith('Attempted to set validation error for undefined field name');
      expect(Object.keys(validationContext.errors)).toHaveLength(0);
    });
  });
  
  describe('validateForm function', () => {
    test('validates all form fields correctly', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      const formValues = {
        'name': 'John Doe',
        'email': 'invalid-email',
        'age': 25
      };
      
      const validationRules = {
        'name': { required: true, minLength: 3 },
        'email': { required: true, email: true },
        'age': { required: true }
      };
      
      // Form should be invalid because email is invalid
      await act(async () => {
        expect(validationContext.validateForm(formValues, validationRules)).toBe(false);
      });
      
      expect(validationContext.errors['email']).toBeDefined();
      
      // Fix the email and validate again
      formValues.email = 'john@example.com';
      
      await act(async () => {
        expect(validationContext.validateForm(formValues, validationRules)).toBe(true);
      });
      
      expect(Object.keys(validationContext.errors)).toHaveLength(0);
    });
    
    test('clears all errors before validating form', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Set some errors first
      await act(async () => {
        validationContext.setFieldError('field1', 'Error 1');
        validationContext.setFieldError('field2', 'Error 2');
      });
      
      // Since we have to wrap setFieldError in act, we need to check the errors after the act
      expect(Object.keys(validationContext.errors)).toHaveLength(2);
      
      // Validate form with valid values - should clear all previous errors
      const formValues = { 'name': 'John' };
      const validationRules = { 'name': { required: true } };
      
      await act(async () => {
        expect(validationContext.validateForm(formValues, validationRules)).toBe(true);
      });
      
      expect(Object.keys(validationContext.errors)).toHaveLength(0);
    });
    
    test('returns true when no validation rules are provided', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      await act(async () => {
        expect(validationContext.validateForm({ 'field1': 'value1' }, null)).toBe(true);
        expect(validationContext.validateForm(null, { 'field1': { required: true } })).toBe(true);
      });
    });
  });
  
  describe('utility functions', () => {
    test('clearErrors removes all validation errors', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Set some errors
      await act(async () => {
        validationContext.setFieldError('field1', 'Error 1');
        validationContext.setFieldError('field2', 'Error 2');
      });
      
      expect(Object.keys(validationContext.errors)).toHaveLength(2);
      
      // Clear all errors
      await act(async () => {
        validationContext.clearErrors();
      });
      
      expect(Object.keys(validationContext.errors)).toHaveLength(0);
    });
    
    test('clearFieldError removes a specific field error', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Set some errors
      await act(async () => {
        validationContext.setFieldError('field1', 'Error 1');
        validationContext.setFieldError('field2', 'Error 2');
      });
      
      expect(Object.keys(validationContext.errors)).toHaveLength(2);
      
      // Clear one specific error
      await act(async () => {
        validationContext.clearFieldError('field1');
      });
      
      expect(Object.keys(validationContext.errors)).toHaveLength(1);
      expect(validationContext.errors['field1']).toBeUndefined();
      expect(validationContext.errors['field2']).toBe('Error 2');
    });
    
    test('setFieldError adds a field error', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Initially no errors
      expect(Object.keys(validationContext.errors)).toHaveLength(0);
      
      // Set an error
      await act(async () => {
        validationContext.setFieldError('field1', 'Error 1');
      });
      
      expect(validationContext.errors['field1']).toBe('Error 1');
      
      // Update the error
      await act(async () => {
        validationContext.setFieldError('field1', 'Updated error');
      });
      
      expect(validationContext.errors['field1']).toBe('Updated error');
    });
    
    test('getValidators returns validators', () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      const validators = validationContext.getValidators();
      expect(validators).toBeDefined();
      expect(typeof validators.required).toBe('function');
      expect(typeof validators.minLength).toBe('function');
      expect(typeof validators.maxLength).toBe('function');
      expect(typeof validators.pattern).toBe('function');
      expect(typeof validators.isValidEmail).toBe('function');
      expect(typeof validators.isValidUrl).toBe('function');
    });
  });
  
  describe('UI integration', () => {
    test('validate button triggers validation', () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Mock validate function
      const validateSpy = jest.spyOn(validationContext, 'validate');
      
      // Click validate button
      fireEvent.click(screen.getByTestId('validate-button'));
      
      expect(validateSpy).toHaveBeenCalledWith('test-field', 'test-value', { required: true });
    });
    
    test('validate form button triggers form validation', () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Mock validateForm function
      const validateFormSpy = jest.spyOn(validationContext, 'validateForm');
      
      // Click validate form button
      fireEvent.click(screen.getByTestId('validate-form-button'));
      
      expect(validateFormSpy).toHaveBeenCalledWith(
        { 'test-field': 'test-value' }, 
        { 'test-field': { required: true } }
      );
    });
    
    test('clear errors button removes all errors', async () => {
      let validationContext;
      
      render(
        <ValidationProvider>
          <TestComponent onContextReceived={ctx => { validationContext = ctx; }} />
        </ValidationProvider>
      );
      
      // Set some errors
      await act(async () => {
        validationContext.setFieldError('field1', 'Error 1');
        validationContext.setFieldError('field2', 'Error 2');
      });
      
      // Check that error count is 2
      expect(screen.getByTestId('error-count')).toHaveTextContent('2');
      
      // Click clear errors button
      await act(async () => {
        fireEvent.click(screen.getByTestId('clear-errors-button'));
      });
      
      // Check that error count is now 0
      expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    });
  });
});