import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from '../../../../../src/renderer/src/lib/form-generation/components/fields/TextField';

// Mock BaseField component
jest.mock('../../../../../src/renderer/src/lib/form-generation/components/fields/BaseField', () => ({
  BaseField: ({ children, field, onDuplicate, onDelete, allowDuplication, allowDeletion }) => (
    <div data-testid="base-field" className={`is-${field.type}`}>
      <div data-testid="base-field-props">
        <div data-testid="field-id">{field.id}</div>
        <div data-testid="allow-duplication">{String(allowDuplication)}</div>
        <div data-testid="allow-deletion">{String(allowDeletion)}</div>
      </div>
      <div data-testid="base-field-content">{children}</div>
    </div>
  )
}));

describe('TextField', () => {
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
      render(<TextField {...defaultProps} />);
      
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
      
      render(<TextField {...props} />);
      
      // Should display the custom display label as part of BaseField
      const fieldContent = screen.getByTestId('base-field-content');
      const labelElement = fieldContent.querySelector('.element-label');
      expect(labelElement).toHaveValue('Display Label');
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
      
      render(<TextField {...props} />);
      
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
      
      render(<TextField {...props} />);
      
      expect(screen.getByTestId('allow-deletion')).toHaveTextContent('false');
    });
    
    test('passes duplication and deletion handlers to BaseField', () => {
      render(<TextField {...defaultProps} />);
      
      // By default, both duplication and deletion should be allowed
      expect(screen.getByTestId('allow-duplication')).toHaveTextContent('true');
      expect(screen.getByTestId('allow-deletion')).toHaveTextContent('true');
    });
  });

  describe('field updates', () => {
    test('calls onUpdate when text changes', () => {
      render(<TextField {...defaultProps} />);
      
      // Find the input field and change its value
      const inputField = screen.getByDisplayValue('Test Value');
      fireEvent.change(inputField, { target: { value: 'New Value' } });
      
      // Verify onUpdate was called with the correct field update
      expect(defaultProps.onUpdate).toHaveBeenCalledWith({
        ...defaultProps.field,
        value: 'New Value'
      });
    });
    
    test('calls onUpdate when label changes if editable', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          label: '',
          _displayLabel: 'Display Label'
        }
      };
      
      render(<TextField {...props} />);
      
      // Find the label input and change its value
      const labelField = screen.getByTestId('base-field-content').querySelector('.element-label');
      fireEvent.change(labelField, { target: { value: 'New Label' } });
      
      // Verify onUpdate was called with the correct field update
      expect(defaultProps.onUpdate).toHaveBeenCalledWith({
        ...props.field,
        _displayLabel: 'New Label'
      });
    });
  });
});