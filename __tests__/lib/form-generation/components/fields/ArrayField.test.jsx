import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ArrayField } from '@components/fields/ArrayField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';

// Mock the icons and Dropzone components
jest.mock('@components/icons', () => ({
  DragHandleIcon: () => 'DragHandle',
  CollapsedIcon: () => 'CollapsedIcon',
  CollapseIcon: () => 'CollapseIcon'
}));

jest.mock('@components/Dropzone', () => {
  return function MockDropzone({ children, onDrop }) {
    return (
      <div data-testid="dropzone" onClick={() => onDrop()}>
        {children}
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

    test('renders collapse icon', () => {
      render(<ArrayField {...defaultProps} />);
      expect(screen.getByTestId('collapse-icon')).toBeInTheDocument();
    });

    test('renders drag handle', () => {
      render(<ArrayField {...defaultProps} />);
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('toggles collapse state on icon click', () => {
      render(<ArrayField {...defaultProps} />);
      const collapseIcon = screen.getByTestId('collapse-icon');
      
      fireEvent.click(collapseIcon);
      expect(screen.getByTestId('dropzone')).toHaveClass('is-collapsed');
      
      fireEvent.click(collapseIcon);
      expect(screen.getByTestId('dropzone')).not.toHaveClass('is-collapsed');
    });

    test('handles drag start', () => {
      render(<ArrayField {...defaultProps} />);
      const arrayContainer = screen.getByTestId('array-container');
      
      const mockDataTransfer = {
        setData: jest.fn()
      };
      
      fireEvent.dragStart(arrayContainer, { dataTransfer: mockDataTransfer });
      
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('origin', 'dropzone');
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(defaultProps.field)
      );
    });
  });

  describe('dropzone events', () => {
    test('handles new item from sidebar', () => {
      render(<ArrayField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, {
        type: 'sidebar',
        data: { field: { type: 'text', label: 'New Item' } }
      });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-array',
        expect.objectContaining({
          value: expect.arrayContaining([
            ...defaultProps.field.value,
            expect.objectContaining({ type: 'text', label: 'New Item' })
          ])
        })
      );
    });

    test('handles reordering items', () => {
      render(<ArrayField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, {
        type: 'reorder',
        position: { sourceIndex: 0, targetIndex: 1 }
      });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-array',
        expect.objectContaining({
          value: [defaultProps.field.value[1], defaultProps.field.value[0]]
        })
      );
    });
  });

  describe('nested updates', () => {
    test('handles nested field updates', () => {
      const field = {
        ...defaultProps.field,
        value: [{
          type: 'object',
          fields: [{ id: 'nested1', type: 'text', value: 'test' }]
        }]
      };
      
      render(<ArrayField field={field} onUpdate={defaultProps.onUpdate} index={0} />);
      
      const nestedField = screen.getByTestId('form-field');
      fireEvent.change(nestedField, { target: { value: 'updated' } });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-array',
        expect.objectContaining({
          value: [{
            type: 'object',
            fields: [{ id: 'nested1', type: 'text', value: 'updated' }]
          }]
        })
      );
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