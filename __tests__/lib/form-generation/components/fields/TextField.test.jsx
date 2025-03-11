import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from '@lib/form-generation/components/fields/TextField';
import { createMockContexts } from './test-helpers';

// Mock BaseField component
jest.mock(
  '@lib/form-generation/components/fields/BaseField',
  () => ({
    BaseField: ({ children, field, onDuplicate, onDelete, allowDuplication, allowDeletion, hasError }) => (
      <div data-testid="base-field" className={`is-${field.type} ${hasError ? 'has-error' : ''}`}>
        <div data-testid="base-field-props">
          <div data-testid="field-id">{field.id}</div>
          <div data-testid="allow-duplication">{String(allowDuplication)}</div>
          <div data-testid="allow-deletion">{String(allowDeletion)}</div>
          <div data-testid="has-error">{String(!!hasError)}</div>
        </div>
        <div data-testid="base-field-content">{children}</div>
      </div>
    )
  })
);

describe('TextField', () => {
  // Create mock contexts
  const { ContextWrapper, formOperationsMock } = createMockContexts();
  
  const defaultProps = {
    field: {
      id: 'test-field',
      type: 'text',
      label: 'Test Field',
      name: 'testField',
      value: 'Test Value',
      placeholder: 'Enter text'
    },
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    onUpdate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders with correct field properties', () => {
      render(
        <ContextWrapper>
          <TextField {...defaultProps} />
        </ContextWrapper>
      );

      // Verify BaseField props
      expect(screen.getByTestId('field-id')).toHaveTextContent('test-field');

      // Verify input field has correct attributes
      const inputValue = screen.getByDisplayValue('Test Value');
      expect(inputValue).toHaveAttribute('name', 'testField');
      expect(inputValue).toHaveAttribute('placeholder', 'Enter text');
    });

    test('renders with _displayLabel when available', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          label: '',
          _displayLabel: 'Display Label'
        }
      };

      render(
        <ContextWrapper>
          <TextField {...props} />
        </ContextWrapper>
      );

      // Should display the custom display label as part of BaseField
      const fieldContent = screen.getByTestId('base-field-content');
      const labelElement = fieldContent.querySelector('.element-label');
      expect(labelElement).toHaveValue('Display Label');
    });
    
    test('renders with error state when validation errors exist', () => {
      // Create a new context with validation errors
      const { ContextWrapper: ErrorWrapper, formOperationsMock: errorMock } = createMockContexts();
      // Add validation error to the mock
      errorMock.validationErrors = { 'test-field': 'This field is required' };
      
      render(
        <ErrorWrapper>
          <TextField {...defaultProps} />
        </ErrorWrapper>
      );
      
      expect(screen.getByTestId('has-error')).toHaveTextContent('true');
    });
  });

  describe('duplication and deletion', () => {
    test('respects field.noDuplication setting', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          noDuplication: true
        }
      };

      render(
        <ContextWrapper>
          <TextField {...props} />
        </ContextWrapper>
      );

      expect(screen.getByTestId('allow-duplication')).toHaveTextContent('false');
    });

    test('respects field.noDeletion setting', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          noDeletion: true
        }
      };

      render(
        <ContextWrapper>
          <TextField {...props} />
        </ContextWrapper>
      );

      expect(screen.getByTestId('allow-deletion')).toHaveTextContent('false');
    });

    test('passes duplication and deletion handlers to BaseField', () => {
      render(
        <ContextWrapper>
          <TextField {...defaultProps} />
        </ContextWrapper>
      );

      // By default, both duplication and deletion should be allowed
      expect(screen.getByTestId('allow-duplication')).toHaveTextContent('true');
      expect(screen.getByTestId('allow-deletion')).toHaveTextContent('true');
    });
  });

  describe('field updates', () => {
    test('calls onUpdate when text input loses focus with changed value', () => {
      render(
        <ContextWrapper>
          <TextField {...defaultProps} />
        </ContextWrapper>
      );

      // Find the input field, change its value and trigger blur event
      const inputField = screen.getByDisplayValue('Test Value');
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      fireEvent.blur(inputField);

      // Verify setValue was called in the FormOperationsContext
      expect(formOperationsMock.setValue).toHaveBeenCalledWith('testField', 'New Value');
      
      // Verify onUpdate was called with the correct field update
      expect(defaultProps.onUpdate).toHaveBeenCalledWith({
        id: defaultProps.field.id,
        name: defaultProps.field.name,
        type: defaultProps.field.type.toLowerCase(),
        value: 'New Value'
      });
    });

    test('calls onUpdate when label input loses focus if editable', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          label: '',
          _displayLabel: 'Display Label'
        }
      };

      render(
        <ContextWrapper>
          <TextField {...props} />
        </ContextWrapper>
      );

      // Find the label input, change its value and trigger blur event
      const labelField = screen.getByTestId('base-field-content').querySelector('.element-label');
      fireEvent.change(labelField, { target: { value: 'New Label' } });
      fireEvent.blur(labelField);

      // Verify onUpdate was called with the correct field update
      expect(defaultProps.onUpdate).toHaveBeenCalledWith({
        id: props.field.id,
        name: props.field.name,
        type: props.field.type.toLowerCase(),
        _displayLabel: 'New Label'
      });
    });

    test('does not call onUpdate when value is unchanged', () => {
      const originalValue = defaultProps.field.value;
      
      render(
        <ContextWrapper>
          <TextField {...defaultProps} />
        </ContextWrapper>
      );

      // Find the input field and blur it without changing value
      const inputField = screen.getByDisplayValue(originalValue);
      fireEvent.blur(inputField);

      // Verify onUpdate was not called
      expect(defaultProps.onUpdate).not.toHaveBeenCalled();
    });
    
    test('validates field when required and empty', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          required: true,
          value: '' // Empty value
        }
      };
      
      render(
        <ContextWrapper>
          <TextField {...props} />
        </ContextWrapper>
      );
      
      // Find the input field, change value to trigger validation and blur
      const inputField = screen.getByDisplayValue('');
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      fireEvent.blur(inputField);
      
      // Verify setValue was called
      expect(formOperationsMock.setValue).toHaveBeenCalled();
    });
  });
});
