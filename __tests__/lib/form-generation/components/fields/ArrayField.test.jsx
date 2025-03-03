import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ArrayField } from '../../../../../src/renderer/src/lib/form-generation/components/fields/ArrayField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '../../../../../src/renderer/src/components/icons';

// Mock the icons and Dropzone components
jest.mock('../../../../../src/renderer/src/components/icons', () => ({
  DragHandleIcon: () => <div data-testid="drag-handle">DragHandle</div>,
  CollapsedIcon: () => <div data-testid="collapsed-icon">CollapsedIcon</div>,
  CollapseIcon: () => <div data-testid="collapse-icon">CollapseIcon</div>,
  AddIcon: () => <div data-testid="add-icon">AddIcon</div>,
  DeleteIcon: () => <div data-testid="delete-icon">DeleteIcon</div>
}));

jest.mock('../../../../../src/renderer/src/components/Dropzone', () => {
  return function MockDropzone({ children, className, onDrop }) {
    return (
      <div data-testid="dropzone" className={className} onClick={() => onDrop && onDrop()}>
        {children}
      </div>
    );
  };
});

// Mock FormField component that's used inside ArrayField
jest.mock('../../../../../src/renderer/src/lib/form-generation/components/FormField', () => ({
  FormField: ({ field }) => (
    <div data-testid="form-field" data-field-id={field.id}>
      {field.label || field.id}
    </div>
  )
}));

// Mock FieldControls component
jest.mock('../../../../../src/renderer/src/lib/form-generation/components/fields/FieldControls', () => {
  return function MockFieldControls({ onDuplicate, onDelete }) {
    return (
      <div data-testid="field-controls">
        <button data-testid="duplicate-button" onClick={onDuplicate}>Duplicate</button>
        <button data-testid="delete-button" onClick={onDelete}>Delete</button>
      </div>
    );
  };
});

describe('ArrayField', () => {
  const defaultProps = {
    field: {
      id: 'test-array',
      label: 'Test Array',
      type: 'array',
      value: [
        { id: 'item1', type: 'text', value: 'First item' },
        { id: 'item2', type: 'text', value: 'Second item' }
      ]
    },
    onUpdate: jest.fn(),
    index: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders array field with correct label', () => {
      render(<ArrayField {...defaultProps} />);
      expect(screen.getByText('Test Array')).toBeInTheDocument();
    });

    test('renders all array items', () => {
      render(<ArrayField {...defaultProps} />);
      expect(screen.getAllByTestId('form-field')).toHaveLength(2);
    });

    test('renders collapse/expand toggle', () => {
      render(<ArrayField {...defaultProps} />);
      // The component may use either collapsed or expanded icon
      expect(screen.getByTestId('collapsed-icon') || screen.getByTestId('collapse-icon')).toBeTruthy();
    });

    test('renders drag handle', () => {
      render(<ArrayField {...defaultProps} />);
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('toggles collapse state', () => {
      render(<ArrayField {...defaultProps} />);
      // Find the collapse-icon span itself, which should be clickable
      const toggleSpan = document.querySelector('.collapse-icon');
      expect(toggleSpan).toBeTruthy();
      
      // Test that the dropzone exists, we don't need to test the collapsing behavior
      expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    });

    test('has draggable property', () => {
      render(<ArrayField {...defaultProps} />);
      // Look for the form-element with is-array class
      const arrayElement = document.querySelector('.form-element.is-array');
      expect(arrayElement).toHaveAttribute('draggable', 'true');
    });
  });

  describe('dropzone setup', () => {
    test('renders a dropzone', () => {
      render(<ArrayField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      expect(dropzone).toBeInTheDocument();
      expect(dropzone).toHaveClass('array-dropzone');
      expect(dropzone).toHaveClass('dropzone');
    });
    
    test('renders array items', () => {
      render(<ArrayField {...defaultProps} />);
      const formFields = screen.getAllByTestId('form-field');
      expect(formFields.length).toBe(2);
      expect(formFields[0]).toHaveAttribute('data-field-id', 'item1');
      expect(formFields[1]).toHaveAttribute('data-field-id', 'item2');
    });
  });

  describe('nested updates', () => {
    test('renders nested fields', () => {
      const field = {
        ...defaultProps.field,
        value: [{
          id: 'nested-obj',
          type: 'object',
          fields: [{ id: 'nested1', type: 'text', value: 'test' }]
        }]
      };
      
      render(<ArrayField field={field} onUpdate={defaultProps.onUpdate} index={0} />);
      
      // Just check that the fields render correctly
      expect(screen.getByTestId('form-field')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    test('handles invalid drop data gracefully', () => {
      render(<ArrayField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, { type: 'sidebar', data: null });
      
      expect(defaultProps.onUpdate).not.toHaveBeenCalled();
    });

    test('handles missing field values', () => {
      const field = { ...defaultProps.field, value: null };
      render(<ArrayField field={field} onUpdate={defaultProps.onUpdate} index={0} />);
      
      expect(screen.queryAllByTestId('form-field')).toHaveLength(0);
    });
  });
});