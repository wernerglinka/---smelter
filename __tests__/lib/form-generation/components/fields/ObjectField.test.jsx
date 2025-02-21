import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ObjectField } from '@components/fields/ObjectField';
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

describe('ObjectField', () => {
  const defaultProps = {
    field: {
      id: 'test-object',
      label: 'Test Object',
      type: 'object',
      fields: [
        { id: 'field1', type: 'text', label: 'Field 1', value: 'Value 1' },
        { id: 'field2', type: 'text', label: 'Field 2', value: 'Value 2' }
      ]
    },
    onUpdate: jest.fn(),
    index: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders object field with correct label', () => {
      render(<ObjectField {...defaultProps} />);
      expect(screen.getByText('Test Object')).toBeInTheDocument();
    });

    test('renders all nested fields', () => {
      render(<ObjectField {...defaultProps} />);
      expect(screen.getAllByTestId('form-field')).toHaveLength(2);
    });

    test('renders collapse icon', () => {
      render(<ObjectField {...defaultProps} />);
      expect(screen.getByTestId('collapse-icon')).toBeInTheDocument();
    });

    test('renders drag handle', () => {
      render(<ObjectField {...defaultProps} />);
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('toggles collapse state on icon click', () => {
      render(<ObjectField {...defaultProps} />);
      const collapseIcon = screen.getByTestId('collapse-icon');
      
      fireEvent.click(collapseIcon);
      expect(screen.getByTestId('dropzone')).toHaveClass('is-collapsed');
      
      fireEvent.click(collapseIcon);
      expect(screen.getByTestId('dropzone')).not.toHaveClass('is-collapsed');
    });

    test('handles drag start', () => {
      render(<ObjectField {...defaultProps} />);
      const objectContainer = screen.getByTestId('object-container');
      
      const mockDataTransfer = {
        setData: jest.fn()
      };
      
      fireEvent.dragStart(objectContainer, { dataTransfer: mockDataTransfer });
      
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('origin', 'dropzone');
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify(defaultProps.field)
      );
    });
  });

  describe('dropzone events', () => {
    test('handles new field from sidebar', () => {
      render(<ObjectField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, {
        type: 'sidebar',
        data: { field: { type: 'text', label: 'New Field' } }
      });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-object',
        expect.objectContaining({
          fields: expect.arrayContaining([
            ...defaultProps.field.fields,
            expect.objectContaining({ type: 'text', label: 'New Field' })
          ])
        })
      );
    });

    test('handles reordering fields', () => {
      render(<ObjectField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, {
        type: 'reorder',
        position: { sourceIndex: 0, targetIndex: 1 }
      });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-object',
        expect.objectContaining({
          fields: [defaultProps.field.fields[1], defaultProps.field.fields[0]]
        })
      );
    });

    test('handles field insertion at specific position', () => {
      render(<ObjectField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, {
        type: 'sidebar',
        data: { field: { type: 'text', label: 'New Field' } },
        position: { targetIndex: 1 }
      });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-object',
        expect.objectContaining({
          fields: expect.arrayContaining([
            defaultProps.field.fields[0],
            expect.objectContaining({ type: 'text', label: 'New Field' }),
            defaultProps.field.fields[1]
          ])
        })
      );
    });
  });

  describe('nested field updates', () => {
    test('handles nested field value updates', () => {
      render(<ObjectField {...defaultProps} />);
      
      const field = screen.getAllByTestId('form-field')[0];
      fireEvent.change(field, { target: { value: 'Updated Value' } });
      
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        'test-object',
        expect.objectContaining({
          fields: expect.arrayContaining([
            expect.objectContaining({ id: 'field1', value: 'Updated Value' }),
            defaultProps.field.fields[1]
          ])
        })
      );
    });
  });

  describe('error handling', () => {
    test('handles invalid drop data gracefully', () => {
      render(<ObjectField {...defaultProps} />);
      const dropzone = screen.getByTestId('dropzone');
      
      fireEvent.drop(dropzone, { type: 'sidebar', data: null });
      
      expect(defaultProps.onUpdate).not.toHaveBeenCalled();
    });

    test('handles missing fields array', () => {
      const field = { ...defaultProps.field, fields: null };
      render(<ObjectField field={field} onUpdate={defaultProps.onUpdate} index={0} />);
      
      expect(screen.queryAllByTestId('form-field')).toHaveLength(0);
    });
  });
});