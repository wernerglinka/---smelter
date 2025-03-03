import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaseField } from '../../../../../src/renderer/src/lib/form-generation/components/fields/BaseField';
import { DragHandleIcon } from '../../../../../src/renderer/src/components/icons';

// Mock the required components
jest.mock('../../../../../src/renderer/src/components/icons', () => ({
  DragHandleIcon: () => <div data-testid="drag-handle">DragHandleIcon</div>
}));

jest.mock('../../../../../src/renderer/src/lib/form-generation/components/fields/FieldControls', () => {
  return function MockFieldControls(props) {
    return (
      <div data-testid="field-controls">
        <div data-testid="onDuplicate-prop">{String(!!props.onDuplicate)}</div>
        <div data-testid="onDelete-prop">{String(!!props.onDelete)}</div>
        <div data-testid="allowDuplication-prop">{String(props.allowDuplication)}</div>
        <div data-testid="allowDeletion-prop">{String(props.allowDeletion)}</div>
      </div>
    );
  };
});

describe('BaseField', () => {
  const defaultProps = {
    field: {
      id: 'test-field',
      type: 'text',
      label: 'Test Field'
    },
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    allowDuplication: true,
    allowDeletion: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders with correct field type class', () => {
      render(
        <BaseField {...defaultProps}>
          <div>Field content</div>
        </BaseField>
      );
      
      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).toHaveClass('form-element');
      expect(fieldElement).toHaveClass('is-text');
    });

    test('renders with label-exists class when label is provided', () => {
      render(
        <BaseField {...defaultProps}>
          <div>Field content</div>
        </BaseField>
      );
      
      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).toHaveClass('label-exists');
    });

    test('renders without label-exists class when no label is provided', () => {
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          label: null
        }
      };

      render(
        <BaseField {...props}>
          <div>Field content</div>
        </BaseField>
      );
      
      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).not.toHaveClass('label-exists');
    });

    test('renders children content', () => {
      render(
        <BaseField {...defaultProps}>
          <div data-testid="test-content">Test Content</div>
        </BaseField>
      );
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('renders drag handle', () => {
      render(
        <BaseField {...defaultProps}>
          <div>Field content</div>
        </BaseField>
      );
      
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });

  describe('field controls', () => {
    test('passes duplication handlers to FieldControls', () => {
      render(
        <BaseField {...defaultProps}>
          <div>Field content</div>
        </BaseField>
      );
      
      expect(screen.getByTestId('onDuplicate-prop').textContent).toBe('true');
      expect(screen.getByTestId('onDelete-prop').textContent).toBe('true');
    });

    test('respects field.noDuplication setting', () => {
      // Create a test-specific props object with noDuplication set
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          noDuplication: true
        },
        // Override the explicit allowDuplication prop since it takes precedence
        allowDuplication: undefined
      };

      render(
        <BaseField {...props}>
          <div>Field content</div>
        </BaseField>
      );
      
      expect(screen.getByTestId('allowDuplication-prop').textContent).toBe('false');
    });

    test('respects field.noDeletion setting', () => {
      // Create a test-specific props object with noDeletion set
      const props = {
        ...defaultProps,
        field: {
          ...defaultProps.field,
          noDeletion: true
        },
        // Override the explicit allowDeletion prop since it takes precedence
        allowDeletion: undefined
      };

      render(
        <BaseField {...props}>
          <div>Field content</div>
        </BaseField>
      );
      
      expect(screen.getByTestId('allowDeletion-prop').textContent).toBe('false');
    });

    test('respects allowDuplication and allowDeletion props', () => {
      render(
        <BaseField 
          {...defaultProps} 
          allowDuplication={false}
          allowDeletion={false}
        >
          <div>Field content</div>
        </BaseField>
      );
      
      expect(screen.getByTestId('allowDuplication-prop').textContent).toBe('false');
      expect(screen.getByTestId('allowDeletion-prop').textContent).toBe('false');
    });
  });
});