import React from 'react';
import { render, screen } from '@testing-library/react';
import { BaseField } from '@lib/form-generation/components/fields/BaseField';
import { DragHandleIcon } from '@components/icons';
import { createMockContexts } from './test-helpers';

// Mock the required components
jest.mock('@components/icons', () => ({
  DragHandleIcon: () => <div data-testid="drag-handle">DragHandleIcon</div>
}));

jest.mock('@lib/form-generation/components/fields/FieldControls', () => {
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
  }
);

describe('BaseField', () => {
  // Create mock contexts
  const { ContextWrapper, formOperationsMock } = createMockContexts();
  
  const defaultProps = {
    field: {
      id: 'test-field',
      type: 'text',
      label: 'Test Field',
      name: 'testField'
    },
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    allowDuplication: true,
    allowDeletion: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset validation errors before each test
    formOperationsMock.validationErrors = {};
  });

  describe('rendering', () => {
    test('renders with correct field type class', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).toHaveClass('form-element');
      expect(fieldElement).toHaveClass('is-text');
    });

    test('renders with label-exists class when label is provided', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
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
        <ContextWrapper>
          <BaseField {...props}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).not.toHaveClass('label-exists');
    });

    test('renders with has-error class when there are validation errors', () => {
      // Set up validation errors
      formOperationsMock.validationErrors = { 'test-field': 'Error message' };
      
      render(
        <ContextWrapper>
          <BaseField {...defaultProps}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).toHaveClass('has-error');
    });

    test('renders with has-error class when hasError prop is true', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps} hasError={true}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).toHaveClass('has-error');
    });

    test('renders with is-loading class when isLoading prop is true', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps} isLoading={true}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      const fieldElement = screen.getByText('Field content').parentElement;
      expect(fieldElement).toHaveClass('is-loading');
    });

    test('renders children content', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps}>
            <div data-testid="test-content">Test Content</div>
          </BaseField>
        </ContextWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('renders drag handle', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });

  describe('field controls', () => {
    test('passes duplication handlers to FieldControls', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
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
        <ContextWrapper>
          <BaseField {...props}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
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
        <ContextWrapper>
          <BaseField {...props}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      expect(screen.getByTestId('allowDeletion-prop').textContent).toBe('false');
    });

    test('respects allowDuplication and allowDeletion props', () => {
      render(
        <ContextWrapper>
          <BaseField {...defaultProps} allowDuplication={false} allowDeletion={false}>
            <div>Field content</div>
          </BaseField>
        </ContextWrapper>
      );

      expect(screen.getByTestId('allowDuplication-prop').textContent).toBe('false');
      expect(screen.getByTestId('allowDeletion-prop').textContent).toBe('false');
    });
  });
});
