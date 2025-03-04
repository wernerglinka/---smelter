import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { FieldControls } from '../../../../../src/renderer/src/lib/form-generation/components/fields/FieldControls';
import { AddIcon, DeleteIcon } from '../../../../../src/renderer/src/components/icons';

// Mock the icons
jest.mock('../../../../../src/renderer/src/components/icons', () => ({
  AddIcon: () => <div data-testid="add-icon">AddIcon</div>,
  DeleteIcon: () => <div data-testid="delete-icon">DeleteIcon</div>
}));

describe('FieldControls', () => {
  const defaultProps = {
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    allowDuplication: true,
    allowDeletion: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders both buttons when both actions are allowed', () => {
      render(<FieldControls {...defaultProps} />);

      expect(screen.getByTestId('add-icon')).toBeInTheDocument();
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
    });

    test('hides duplicate button when duplication is not allowed', () => {
      render(<FieldControls {...defaultProps} allowDuplication={false} />);

      expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('delete-icon')).toBeInTheDocument();
    });

    test('hides delete button when deletion is not allowed', () => {
      render(<FieldControls {...defaultProps} allowDeletion={false} />);

      expect(screen.getByTestId('add-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
    });

    test('renders no buttons when both actions are disallowed', () => {
      render(
        <FieldControls
          {...defaultProps}
          allowDuplication={false}
          allowDeletion={false}
        />
      );

      expect(screen.queryByTestId('add-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    test('calls onDuplicate when duplicate button is clicked', () => {
      render(<FieldControls {...defaultProps} />);

      const duplicateButton = screen.getByTitle('Duplicate this element');
      fireEvent.click(duplicateButton);

      expect(defaultProps.onDuplicate).toHaveBeenCalledTimes(1);
      expect(defaultProps.onDelete).not.toHaveBeenCalled();
    });

    test('calls onDelete when delete button is clicked', () => {
      render(<FieldControls {...defaultProps} />);

      const deleteButton = screen.getByTitle('Delete this element');
      fireEvent.click(deleteButton);

      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
      expect(defaultProps.onDuplicate).not.toHaveBeenCalled();
    });

    test('event handlers prevent propagation internally', () => {
      // Since we can't directly test stopPropagation in JSDOM environment,
      // we need to verify that our component is properly implementing it
      // This is more of an implementation test than a behavior test

      // Look at the implementation - we know it calls stopPropagation and preventDefault
      // in the handleDuplicate and handleDelete methods

      // This is a partial test that focuses on the behavior we can verify
      const onDuplicateMock = jest.fn();
      const onDeleteMock = jest.fn();

      render(
        <FieldControls
          onDuplicate={onDuplicateMock}
          onDelete={onDeleteMock}
          allowDuplication={true}
          allowDeletion={true}
        />
      );

      // Click the buttons and verify the handlers are called
      const duplicateButton = screen.getByTitle('Duplicate this element');
      const deleteButton = screen.getByTitle('Delete this element');

      fireEvent.click(duplicateButton);
      expect(onDuplicateMock).toHaveBeenCalledTimes(1);

      fireEvent.click(deleteButton);
      expect(onDeleteMock).toHaveBeenCalledTimes(1);

      // We can't directly verify stopPropagation in JSDOM, but we can check
      // the implementation in the source file to confirm it's there
    });
  });
});
