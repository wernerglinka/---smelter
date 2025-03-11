import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import { useFormValidation } from '../../src/renderer/src/hooks/useFormValidation';
import { ValidationContext } from '../../src/renderer/src/context/ValidationContext';
import { FormOperationsContext } from '../../src/renderer/src/context/FormOperationsContext';
import { ErrorContext } from '../../src/renderer/src/context/ErrorContext';

// Mock logger
jest.mock('../../src/renderer/src/utils/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('useFormValidation', () => {
  // Setup context mocks
  const mockValidationContext = {
    validate: jest.fn(),
    validateForm: jest.fn(),
    errors: {},
    clearErrors: jest.fn()
  };

  const mockFormOperationsContext = {
    getFormData: jest.fn(),
    setValue: jest.fn(),
    getValue: jest.fn()
  };

  const mockErrorContext = {
    setError: jest.fn(),
    clearError: jest.fn()
  };

  // Wrapper component that provides all required contexts
  const Wrapper = ({ children }) => (
    <ValidationContext.Provider value={mockValidationContext}>
      <FormOperationsContext.Provider value={mockFormOperationsContext}>
        <ErrorContext.Provider value={mockErrorContext}>
          {children}
        </ErrorContext.Provider>
      </FormOperationsContext.Provider>
    </ValidationContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock return values
    mockFormOperationsContext.getFormData.mockReturnValue(new FormData());
    mockValidationContext.validate.mockReturnValue(true);
    mockValidationContext.validateForm.mockReturnValue(true);
  });

  describe('Hook initialization', () => {
    test('should return the correct interface', () => {
      const { result } = renderHook(() => useFormValidation(), { wrapper: Wrapper });
      
      expect(result.current).toHaveProperty('validateField');
      expect(result.current).toHaveProperty('validateAllFields');
      expect(result.current).toHaveProperty('resetValidation');
      expect(result.current).toHaveProperty('isValid', true);
      expect(result.current).toHaveProperty('isDirty', false);
      expect(result.current).toHaveProperty('errors');
    });

    test('should accept validation rules and callbacks', () => {
      const validationRules = {
        username: { required: true, minLength: 3 }
      };
      const onSuccess = jest.fn();
      const onError = jest.fn();

      renderHook(
        () => useFormValidation({
          validationRules,
          onValidationSuccess: onSuccess,
          onValidationError: onError
        }),
        { wrapper: Wrapper }
      );
      
      // Just testing that it initializes without errors
      expect(mockErrorContext.setError).not.toHaveBeenCalled();
    });
  });

  describe('getFormValues', () => {
    test('should convert FormData to an object', () => {
      // Setup mock FormData
      const mockFormData = new FormData();
      mockFormData.append('name', 'John');
      mockFormData.append('email', 'john@example.com');
      mockFormOperationsContext.getFormData.mockReturnValue(mockFormData);

      // We need to call validateAllFields to trigger getFormValues internally
      const { result } = renderHook(() => useFormValidation(), { wrapper: Wrapper });
      
      act(() => {
        result.current.validateAllFields();
      });

      // Verify validateForm was called with the correct object
      expect(mockValidationContext.validateForm).toHaveBeenCalledWith(
        { name: 'John', email: 'john@example.com' },
        {}
      );
    });

    test('should handle errors when getting form data', () => {
      // Setup error scenario
      mockFormOperationsContext.getFormData.mockImplementation(() => {
        throw new Error('FormData error');
      });

      const { result } = renderHook(() => useFormValidation(), { wrapper: Wrapper });
      
      act(() => {
        result.current.validateAllFields();
      });

      // Should log error and continue with empty object
      expect(mockValidationContext.validateForm).toHaveBeenCalledWith(
        {},
        {}
      );
    });
  });

  describe('validateField', () => {
    test('should mark form as dirty when validating a field', () => {
      const { result } = renderHook(
        () => useFormValidation({
          validationRules: {
            name: { required: true }
          }
        }),
        { wrapper: Wrapper }
      );
      
      expect(result.current.isDirty).toBe(false);
      
      act(() => {
        result.current.validateField('name', 'Test');
      });
      
      expect(result.current.isDirty).toBe(true);
    });

    test('should handle fields with no validation rules', () => {
      const { result } = renderHook(() => useFormValidation(), { wrapper: Wrapper });
      
      let isValid;
      act(() => {
        isValid = result.current.validateField('fieldWithNoRules', 'any value');
      });
      
      expect(isValid).toBe(true);
      expect(mockValidationContext.validate).not.toHaveBeenCalled();
    });

    test('should skip validation for empty fields when skipEmptyCheck is true', () => {
      const { result } = renderHook(
        () => useFormValidation({
          validationRules: {
            name: { required: true }
          }
        }),
        { wrapper: Wrapper }
      );
      
      let isValid;
      act(() => {
        isValid = result.current.validateField('name', '', true);
      });
      
      expect(isValid).toBe(true);
      expect(mockValidationContext.validate).not.toHaveBeenCalled();
    });

    test('should validate non-empty fields even with skipEmptyCheck', () => {
      const { result } = renderHook(
        () => useFormValidation({
          validationRules: {
            name: { required: true }
          }
        }),
        { wrapper: Wrapper }
      );
      
      act(() => {
        result.current.validateField('name', 'Test', true);
      });
      
      expect(mockValidationContext.validate).toHaveBeenCalledWith(
        'name',
        'Test',
        { required: true }
      );
    });

    test('should handle validation errors', () => {
      mockValidationContext.validate.mockReturnValue(false);
      
      const { result } = renderHook(
        () => useFormValidation({
          validationRules: {
            name: { required: true }
          }
        }),
        { wrapper: Wrapper }
      );
      
      let isValid;
      act(() => {
        isValid = result.current.validateField('name', '');
      });
      
      expect(isValid).toBe(false);
    });

    test('should handle exceptions during validation', () => {
      mockValidationContext.validate.mockImplementation(() => {
        throw new Error('Validation error');
      });
      
      const { result } = renderHook(
        () => useFormValidation({
          validationRules: {
            name: { required: true }
          }
        }),
        { wrapper: Wrapper }
      );
      
      let isValid;
      act(() => {
        isValid = result.current.validateField('name', 'test');
      });
      
      expect(isValid).toBe(false);
      expect(mockErrorContext.setError).toHaveBeenCalled();
    });
  });

  describe('validateAllFields', () => {
    test('should mark form as dirty and set isValid state', () => {
      const { result } = renderHook(() => useFormValidation(), { wrapper: Wrapper });
      
      act(() => {
        result.current.validateAllFields();
      });
      
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isValid).toBe(true);
    });

    test('should call validation success callback when valid', () => {
      const onSuccess = jest.fn();
      const formValues = { name: 'Test', email: 'test@example.com' };
      
      // Create a mock FormData that returns these values
      const mockFormData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        mockFormData.append(key, value);
      });
      mockFormOperationsContext.getFormData.mockReturnValue(mockFormData);
      
      const { result } = renderHook(
        () => useFormValidation({
          onValidationSuccess: onSuccess
        }),
        { wrapper: Wrapper }
      );
      
      act(() => {
        result.current.validateAllFields();
      });
      
      expect(onSuccess).toHaveBeenCalledWith(formValues);
      expect(mockErrorContext.clearError).toHaveBeenCalled();
    });

    test('should call validation error callback when invalid', () => {
      const onError = jest.fn();
      const errors = { name: 'Name is required' };
      mockValidationContext.validateForm.mockReturnValue(false);
      mockValidationContext.errors = errors;
      
      const { result } = renderHook(
        () => useFormValidation({
          onValidationError: onError
        }),
        { wrapper: Wrapper }
      );
      
      act(() => {
        result.current.validateAllFields();
      });
      
      expect(result.current.isValid).toBe(false);
      expect(onError).toHaveBeenCalledWith(errors);
    });

    test('should handle exceptions during form validation', () => {
      const onError = jest.fn();
      mockValidationContext.validateForm.mockImplementation(() => {
        throw new Error('Form validation error');
      });
      
      const { result } = renderHook(
        () => useFormValidation({
          onValidationError: onError
        }),
        { wrapper: Wrapper }
      );
      
      let isValid;
      act(() => {
        isValid = result.current.validateAllFields();
      });
      
      expect(isValid).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(mockErrorContext.setError).toHaveBeenCalledWith('Form validation failed', 'validation');
      expect(onError).toHaveBeenCalledWith({ form: 'Validation process failed' });
    });
  });

  describe('resetValidation', () => {
    test('should reset validation state', () => {
      // First mark as dirty and invalid
      const { result } = renderHook(() => useFormValidation(), { wrapper: Wrapper });
      
      act(() => {
        // Make the form dirty and invalid
        mockValidationContext.validateForm.mockReturnValue(false);
        result.current.validateAllFields();
      });
      
      expect(result.current.isDirty).toBe(true);
      expect(result.current.isValid).toBe(false);
      
      // Reset validation
      act(() => {
        result.current.resetValidation();
      });
      
      // Verify state is reset
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(mockValidationContext.clearErrors).toHaveBeenCalled();
      expect(mockErrorContext.clearError).toHaveBeenCalled();
    });
  });
});