import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { FormOperationsContext, FormOperationsProvider, useFormOperations } from '../../src/renderer/src/context/FormOperationsContext';
import { ErrorContext } from '../../src/renderer/src/context/ErrorContext';

// Access logger after mocking
const { logger } = require('../../src/renderer/src/utils/services/logger');

// Mock dependencies
jest.mock('../../src/renderer/src/utils/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

const createMockErrorContext = () => ({
  handleError: jest.fn(),
  setError: jest.fn(),
  clearError: jest.fn(),
  error: null
});

// Test component that consumes the FormOperations context
const TestConsumer = ({ onRender, testAction, testParams }) => {
  const formOperations = useFormOperations();
  
  // Call the callback with the context value
  React.useEffect(() => {
    if (onRender) {
      onRender(formOperations);
    }
  }, [onRender, formOperations]);

  // Execute a test action if provided
  const handleClick = () => {
    if (testAction && formOperations[testAction]) {
      formOperations[testAction](...(testParams || []));
    }
  };

  return (
    <div>
      <button data-testid="test-button" onClick={handleClick}>
        Test Action
      </button>
      <div data-testid="validation-errors">
        {JSON.stringify(formOperations.validationErrors)}
      </div>
    </div>
  );
};

describe('FormOperationsContext', () => {
  let errorContextMock;
  let formElement;
  
  beforeEach(() => {
    // Create a mock form element
    formElement = document.createElement('form');
    formElement.id = 'form';
    document.body.appendChild(formElement);
    
    // Reset mocks
    errorContextMock = createMockErrorContext();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Clean up the DOM
    document.body.removeChild(formElement);
  });

  const renderWithContexts = (ui, { formId } = {}) => {
    return render(
      <ErrorContext.Provider value={errorContextMock}>
        <FormOperationsProvider formId={formId || 'form'}>
          {ui}
        </FormOperationsProvider>
      </ErrorContext.Provider>
    );
  };

  describe('FormOperationsProvider', () => {
    test('provides expected context values', () => {
      const onRender = jest.fn();
      
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      expect(onRender).toHaveBeenCalledWith(expect.objectContaining({
        getValue: expect.any(Function),
        setValue: expect.any(Function),
        duplicateField: expect.any(Function),
        deleteField: expect.any(Function),
        validateField: expect.any(Function),
        getFormData: expect.any(Function),
        validationErrors: expect.any(Object)
      }));
    });
    
    test('initializes with empty validation errors', () => {
      renderWithContexts(<TestConsumer />);
      
      const errorsElement = screen.getByTestId('validation-errors');
      expect(errorsElement.textContent).toBe('{}');
    });
  });

  describe('useFormOperations hook', () => {
    test('throws error when used outside of FormOperationsProvider', () => {
      // Suppress console errors for this test
      const originalError = console.error;
      console.error = jest.fn();
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useFormOperations must be used within a FormOperationsProvider');
      
      // Restore console.error
      console.error = originalError;
    });
  });

  describe('getValue method', () => {
    test('returns field value for text input', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'testField';
      input.value = 'test value';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract getValue from provided context
      const { getValue } = onRender.mock.calls[0][0];
      const value = getValue('testField');
      
      expect(value).toBe('test value');
    });
    
    test('returns checked state for checkbox input', () => {
      // Create a checkbox input
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'checkboxField';
      checkbox.checked = true;
      formElement.appendChild(checkbox);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract getValue from provided context
      const { getValue } = onRender.mock.calls[0][0];
      const value = getValue('checkboxField');
      
      expect(value).toBe(true);
    });
    
    test('returns array of values for select-multiple', () => {
      // Create a multi-select
      const select = document.createElement('select');
      select.multiple = true;
      select.name = 'multiSelect';
      
      const option1 = document.createElement('option');
      option1.value = 'opt1';
      option1.selected = true;
      
      const option2 = document.createElement('option');
      option2.value = 'opt2';
      option2.selected = false;
      
      const option3 = document.createElement('option');
      option3.value = 'opt3';
      option3.selected = true;
      
      select.appendChild(option1);
      select.appendChild(option2);
      select.appendChild(option3);
      formElement.appendChild(select);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract getValue from provided context
      const { getValue } = onRender.mock.calls[0][0];
      const value = getValue('multiSelect');
      
      expect(value).toEqual(['opt1', 'opt3']);
    });
    
    test('returns null for non-existent field', () => {
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract getValue from provided context
      const { getValue } = onRender.mock.calls[0][0];
      const value = getValue('nonExistentField');
      
      expect(value).toBeNull();
    });
  });

  describe('setValue method', () => {
    test('sets value on text input and returns true', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'textField';
      input.value = 'initial value';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract setValue from provided context
      const { setValue } = onRender.mock.calls[0][0];
      const result = setValue('textField', 'updated value');
      
      expect(result).toBe(true);
      expect(input.value).toBe('updated value');
    });
    
    test('sets checked state on checkbox input', () => {
      // Create a checkbox input
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'checkboxField';
      checkbox.checked = false;
      formElement.appendChild(checkbox);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract setValue from provided context
      const { setValue } = onRender.mock.calls[0][0];
      const result = setValue('checkboxField', true);
      
      expect(result).toBe(true);
      expect(checkbox.checked).toBe(true);
    });
    
    test('sets selected options for select-multiple', () => {
      // Create a multi-select
      const select = document.createElement('select');
      select.multiple = true;
      select.name = 'multiSelect';
      
      const option1 = document.createElement('option');
      option1.value = 'opt1';
      
      const option2 = document.createElement('option');
      option2.value = 'opt2';
      
      const option3 = document.createElement('option');
      option3.value = 'opt3';
      
      select.appendChild(option1);
      select.appendChild(option2);
      select.appendChild(option3);
      formElement.appendChild(select);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract setValue from provided context
      const { setValue } = onRender.mock.calls[0][0];
      const result = setValue('multiSelect', ['opt1', 'opt3']);
      
      expect(result).toBe(true);
      expect(option1.selected).toBe(true);
      expect(option2.selected).toBe(false);
      expect(option3.selected).toBe(true);
    });
    
    test('returns false for non-existent field', () => {
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract setValue from provided context
      const { setValue } = onRender.mock.calls[0][0];
      const result = setValue('nonExistentField', 'some value');
      
      expect(result).toBe(false);
    });
    
    test('logs warning and returns false for undefined field name', () => {
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract setValue from provided context
      const { setValue } = onRender.mock.calls[0][0];
      const result = setValue(undefined, 'some value');
      
      expect(result).toBe(false);
      expect(require('../../src/renderer/src/utils/services/logger').logger.warn)
        .toHaveBeenCalledWith('Attempted to set value for undefined field name');
    });
    
    test('clears validation error when setting value on field with error', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'errorField';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Simulate an existing validation error by setting state
      const { setValue, validateField } = onRender.mock.calls[0][0];
      
      // First set a validation error
      validateField('errorField', () => 'Validation error message', false);
      
      // Then update the value
      setValue('errorField', 'new value');
      
      // Check the validation errors
      const errorsElement = screen.getByTestId('validation-errors');
      expect(errorsElement.textContent).toBe('{}');
    });
    
    test('handles errors and returns false', () => {
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Create a field that will throw an error
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'errorField';
      
      // Override dispatchEvent to throw
      input.dispatchEvent = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      formElement.appendChild(input);
      
      // Extract setValue from provided context
      const { setValue } = onRender.mock.calls[0][0];
      const result = setValue('errorField', 'test value');
      
      expect(result).toBe(false);
      expect(errorContextMock.handleError).toHaveBeenCalledWith(
        expect.any(Error), 
        'setValue'
      );
    });
  });

  describe('duplicateField method', () => {
    test('dispatches field:duplicate custom event', () => {
      // Setup event spy
      const dispatchEventSpy = jest.spyOn(formElement, 'dispatchEvent');
      
      renderWithContexts(
        <TestConsumer 
          testAction="duplicateField" 
          testParams={['testArray', 1]} 
        />
      );
      
      // Trigger the test action
      fireEvent.click(screen.getByTestId('test-button'));
      
      // Check that the event was dispatched correctly
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field:duplicate',
          detail: { fieldName: 'testArray', index: 1 }
        })
      );
    });
    
    test('handles errors gracefully', () => {
      // Override document.getElementById to return form with broken dispatchEvent
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn().mockReturnValue({
        dispatchEvent: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        })
      });
      
      renderWithContexts(
        <TestConsumer 
          testAction="duplicateField" 
          testParams={['testArray', 1]} 
        />
      );
      
      // Trigger the test action
      fireEvent.click(screen.getByTestId('test-button'));
      
      // Check error was handled
      expect(errorContextMock.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'duplicateField'
      );
      
      // Restore original method
      document.getElementById = originalGetElementById;
    });
  });

  describe('deleteField method', () => {
    test('dispatches field:delete custom event', () => {
      // Setup event spy
      const dispatchEventSpy = jest.spyOn(formElement, 'dispatchEvent');
      
      renderWithContexts(
        <TestConsumer 
          testAction="deleteField" 
          testParams={['testArray', 2]} 
        />
      );
      
      // Trigger the test action
      fireEvent.click(screen.getByTestId('test-button'));
      
      // Check that the event was dispatched correctly
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field:delete',
          detail: { fieldName: 'testArray', index: 2 }
        })
      );
    });
    
    test('handles errors gracefully', () => {
      // Override document.getElementById to return form with broken dispatchEvent
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn().mockReturnValue({
        dispatchEvent: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        })
      });
      
      renderWithContexts(
        <TestConsumer 
          testAction="deleteField" 
          testParams={['testArray', 2]} 
        />
      );
      
      // Trigger the test action
      fireEvent.click(screen.getByTestId('test-button'));
      
      // Check error was handled
      expect(errorContextMock.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'deleteField'
      );
      
      // Restore original method
      document.getElementById = originalGetElementById;
    });
  });

  describe('validateField method', () => {
    test('returns true when validation function returns true', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'validField';
      input.value = 'valid value';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      
      // Create a validation function that always passes
      const alwaysValidFn = jest.fn().mockReturnValue(true);
      
      const result = validateField('validField', alwaysValidFn);
      
      expect(result).toBe(true);
      expect(alwaysValidFn).toHaveBeenCalledWith('valid value');
    });
    
    test('returns false and sets validation error when validation fails', async () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'invalidField';
      input.value = 'invalid value';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      
      // Create a validation function that always fails
      const alwaysInvalidFn = jest.fn().mockReturnValue('Error message');
      
      // We need to wrap setState calls in act
      let result;
      await act(async () => {
        result = validateField('invalidField', alwaysInvalidFn);
      });
      
      expect(result).toBe(false);
      expect(alwaysInvalidFn).toHaveBeenCalledWith('invalid value');
      
      // Check that error was set
      const errorsElement = screen.getByTestId('validation-errors');
      expect(errorsElement.textContent).toBe('{"invalidField":"Error message"}');
    });
    
    test('logs warning and returns false for undefined field name', () => {
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      const validFn = jest.fn();
      
      const result = validateField(undefined, validFn);
      
      expect(result).toBe(false);
      expect(require('../../src/renderer/src/utils/services/logger').logger.warn)
        .toHaveBeenCalledWith('Attempted to validate undefined field name');
    });
    
    test('skips validation and returns true for non-existent field with skipIfMissing=true', () => {
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      const validFn = jest.fn();
      
      const result = validateField('nonExistentField', validFn, true);
      
      expect(result).toBe(true);
      expect(validFn).not.toHaveBeenCalled();
    });
    
    test('logs warning and returns true for invalid validation function', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'testField';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      
      // Pass a non-function as validation function
      const result = validateField('testField', 'not a function');
      
      expect(result).toBe(true);
      expect(require('../../src/renderer/src/utils/services/logger').logger.warn)
        .toHaveBeenCalledWith('Invalid validation function for field: testField');
    });
    
    test('clears validation error when previously set and validation passes', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'testField';
      input.value = 'test value';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      
      // First set a validation error
      validateField('testField', () => 'Validation error');
      
      // Then validate again with passing validation
      const result = validateField('testField', () => true);
      
      expect(result).toBe(true);
      
      // Check that error was cleared
      const errorsElement = screen.getByTestId('validation-errors');
      expect(errorsElement.textContent).toBe('{}');
    });
    
    test('handles errors gracefully and returns false', () => {
      // Create a text input
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'errorField';
      formElement.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract validateField from provided context
      const { validateField } = onRender.mock.calls[0][0];
      
      // Create a validation function that throws
      const throwingFn = jest.fn().mockImplementation(() => {
        throw new Error('Test validation error');
      });
      
      const result = validateField('errorField', throwingFn);
      
      expect(result).toBe(false);
      expect(errorContextMock.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'validateField'
      );
    });
  });

  describe('getFormData method', () => {
    test('returns FormData object for the form', () => {
      // Create form inputs
      const input1 = document.createElement('input');
      input1.type = 'text';
      input1.name = 'field1';
      input1.value = 'value1';
      
      const input2 = document.createElement('input');
      input2.type = 'text';
      input2.name = 'field2';
      input2.value = 'value2';
      
      formElement.appendChild(input1);
      formElement.appendChild(input2);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract getFormData from provided context
      const { getFormData } = onRender.mock.calls[0][0];
      const formData = getFormData();
      
      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('field1')).toBe('value1');
      expect(formData.get('field2')).toBe('value2');
    });
    
    test('handles missing form and returns empty FormData', () => {
      // Remove the form element
      document.body.removeChild(formElement);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />);
      
      // Extract getFormData from provided context
      const { getFormData } = onRender.mock.calls[0][0];
      const formData = getFormData();
      
      expect(formData).toBeInstanceOf(FormData);
      expect(Array.from(formData.entries())).toHaveLength(0);
      expect(errorContextMock.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'getFormData'
      );
      
      // Add back the form element for other tests
      document.body.appendChild(formElement);
    });
  });

  describe('custom formId prop', () => {
    test('uses custom formId to find the form', () => {
      // Create a form with custom ID
      const customForm = document.createElement('form');
      customForm.id = 'custom-form';
      document.body.appendChild(customForm);
      
      // Add a field to the custom form
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'customField';
      input.value = 'custom value';
      customForm.appendChild(input);
      
      const onRender = jest.fn();
      renderWithContexts(<TestConsumer onRender={onRender} />, { formId: 'custom-form' });
      
      // Extract getValue from provided context
      const { getValue } = onRender.mock.calls[0][0];
      const value = getValue('customField');
      
      expect(value).toBe('custom value');
      
      // Clean up
      document.body.removeChild(customForm);
    });
  });
});