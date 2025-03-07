# Automating Tests for Undo/Redo and Snapshot Features

This document outlines strategies for automating tests of the form editor's undo/redo and snapshot functionality, with practical examples.

## Testing Layers

Automation can be implemented across three layers:

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test the complete user workflow

## Unit Testing

Unit tests are ideal for testing the core logic functions without UI interaction.

### Setup for Unit Tests

You can use Jest with React Testing Library:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Example Unit Tests

#### 1. Testing History Handlers

```javascript
// historyHandlers.test.js
import { addToHistory, addHistoryEntry, handleUndo, handleRedo } from '../history/historyHandlers';

describe('History Handlers', () => {
  // Mock state and setters
  const mockSetHistory = jest.fn();
  const mockSetHistoryPosition = jest.fn();
  const mockSetRedoLevel = jest.fn();
  const mockHandleFormReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('addToHistory adds state to history and updates position', () => {
    const mockFormState = { fields: [{ name: 'test', value: 'value' }] };
    const mockHistory = ['state1'];
    const mockHistoryPosition = 0;
    const MAX_HISTORY = 10;

    addToHistory(
      mockFormState,
      mockHistory,
      mockHistoryPosition,
      MAX_HISTORY,
      mockSetHistory,
      mockSetHistoryPosition,
      mockSetRedoLevel
    );

    // Check that setHistory was called with updated history
    expect(mockSetHistory).toHaveBeenCalled();
    // The callback passed to setHistory should add the new state
    const setHistoryCallback = mockSetHistory.mock.calls[0][0];
    const newHistory = setHistoryCallback(mockHistory);
    expect(newHistory.length).toBe(2);
    expect(newHistory[1]).toBe(JSON.stringify(mockFormState));

    // Check that position was updated
    expect(mockSetHistoryPosition).toHaveBeenCalled();
    expect(mockSetRedoLevel).toHaveBeenCalled();
  });

  test('handleUndo decrements position and restores previous state', () => {
    const mockHistory = ['{"value":"old"}', '{"value":"new"}'];
    const mockHistoryPosition = 1;

    handleUndo(
      mockHistory,
      mockHistoryPosition,
      mockSetHistoryPosition,
      mockSetRedoLevel,
      mockHandleFormReset
    );

    // Check position was decremented
    expect(mockSetHistoryPosition).toHaveBeenCalledWith(0);
    expect(mockSetRedoLevel).toHaveBeenCalledWith(0);

    // Check form reset was called with correct state
    expect(mockHandleFormReset).toHaveBeenCalledWith({ value: 'old' });
  });

  // Additional tests for handleRedo, addHistoryEntry, etc.
});
```

#### 2. Testing Snapshot Handlers

```javascript
// snapshotHandlers.test.js
import { handleCreateSnapshot, handleRestoreSnapshot } from '../history/snapshotHandlers';

describe('Snapshot Handlers', () => {
  // Mock DOM methods
  document.createElement = jest.fn().mockReturnValue({
    className: '',
    textContent: '',
    parentNode: { removeChild: jest.fn() }
  });
  document.body.appendChild = jest.fn();

  // Mock state and setters
  const mockSetSnapshots = jest.fn();
  const mockSetHistory = jest.fn();
  const mockSetHistoryPosition = jest.fn();
  const mockSetRedoLevel = jest.fn();
  const mockHandleFormReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleCreateSnapshot adds a new snapshot', () => {
    const mockFormFields = [{ name: 'test', value: 'value' }];
    const mockSnapshots = [{ name: 'Snapshot 1', state: '{}' }];

    handleCreateSnapshot(mockFormFields, mockSnapshots, mockSetSnapshots);

    // Check snapshot was added
    expect(mockSetSnapshots).toHaveBeenCalled();
    const setSnapshotsCallback = mockSetSnapshots.mock.calls[0][0];
    const newSnapshots = setSnapshotsCallback(mockSnapshots);
    expect(newSnapshots.length).toBe(2);
    expect(newSnapshots[1].state).toBe(JSON.stringify(mockFormFields));

    // Check notification was created
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('handleRestoreSnapshot restores state and adds to history', () => {
    const mockSnapshots = [
      { name: 'Snapshot 1', state: '{"fields":[{"name":"test","value":"snapshot"}]}' }
    ];
    const mockHistoryPosition = 0;

    handleRestoreSnapshot(
      0,
      mockSnapshots,
      mockHistoryPosition,
      mockHandleFormReset,
      mockSetHistory,
      mockSetHistoryPosition,
      mockSetRedoLevel
    );

    // Check form was reset with snapshot state
    expect(mockHandleFormReset).toHaveBeenCalledWith({
      fields: [{ name: 'test', value: 'snapshot' }]
    });

    // Check history was updated
    expect(mockSetHistory).toHaveBeenCalled();

    // Check positions were updated
    expect(mockSetHistoryPosition).toHaveBeenCalled();
    expect(mockSetRedoLevel).toHaveBeenCalled();
  });

  // Additional tests
});
```

## Integration Testing

Integration tests can test the interactions between React components and state management.

### Example Integration Tests

```javascript
// EditSpace.integration.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditSpace from '../index';

// Mock the dependencies
jest.mock('../editor', () => ({
  setupEditor: jest.fn().mockReturnValue(jest.fn())
}));

jest.mock('@lib/form-generation/processors/frontmatter-processor', () => ({
  processFrontmatter: jest.fn().mockResolvedValue({
    fields: [
      { id: 'field1', name: 'title', type: 'text', value: 'Original Title' },
      { id: 'field2', name: 'description', type: 'textarea', value: 'Original Description' }
    ]
  })
}));

describe('EditSpace Integration Tests', () => {
  const mockFileContent = {
    path: '/test/path.md',
    data: {
      frontmatter: { title: 'Original Title', description: 'Original Description' },
      content: 'Test content'
    }
  };

  test('undo/redo buttons are initially disabled', async () => {
    render(<EditSpace fileContent={mockFileContent} />);

    // Wait for content to process
    await waitFor(() => expect(screen.getByText('Original Title')).toBeInTheDocument());

    // Initially, undo should be disabled and redo disabled
    const undoButton = screen.getByTitle('undo last form change');
    const redoButton = screen.getByTitle('redo last form change');

    expect(undoButton).toHaveClass('disabled');
    expect(redoButton).toHaveClass('disabled');
  });

  test('changing a field enables undo button', async () => {
    render(<EditSpace fileContent={mockFileContent} />);

    // Wait for form to load
    await waitFor(() => expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument());

    // Change a field value
    const titleInput = screen.getByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    // Undo should now be enabled
    const undoButton = screen.getByTitle('undo last form change');
    expect(undoButton).not.toHaveClass('disabled');
  });

  test('undo restores previous field value', async () => {
    render(<EditSpace fileContent={mockFileContent} />);

    // Wait for form to load
    await waitFor(() => expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument());

    // Change a field value
    const titleInput = screen.getByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    // Click undo button
    const undoButton = screen.getByTitle('undo last form change');
    fireEvent.click(undoButton);

    // Check field is restored
    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    });

    // Redo should now be enabled
    const redoButton = screen.getByTitle('redo last form change');
    expect(redoButton).not.toHaveClass('disabled');
  });

  // More tests for redo, snapshots, etc.
});
```

## End-to-End Testing

End-to-end tests verify the entire user flow, including DOM interactions and real state changes.

### Setup for E2E Tests

You can use tools like Playwright or Cypress:

```bash
npm install --save-dev playwright
# or
npm install --save-dev cypress
```

### Example E2E Test (Playwright)

```javascript
// e2e/undo-redo.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Form Editor Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and open a document
    await page.goto('http://localhost:3000');
    await page.click('text=Open Project');
    await page.click('text=Test Project');
    await page.click('text=example.md');
    // Wait for editor to load
    await page.waitForSelector('#dropzone');
  });

  test('should undo and redo text field changes', async ({ page }) => {
    // Find a text field and change its value
    const titleField = await page.locator('input[name="title"]');
    await titleField.fill('Changed Title');

    // Check that the value was updated
    await expect(titleField).toHaveValue('Changed Title');

    // Click the undo button
    const undoButton = await page.locator('.undo.btn');
    await undoButton.click();

    // Check the value was restored
    await expect(titleField).toHaveValue('Original Title');

    // Click the redo button
    const redoButton = await page.locator('.redo.btn');
    await redoButton.click();

    // Check the value was changed again
    await expect(titleField).toHaveValue('Changed Title');
  });

  test('should create and restore snapshots', async ({ page }) => {
    // Change a field
    const titleField = await page.locator('input[name="title"]');
    await titleField.fill('Snapshot Test');

    // Take a snapshot
    const snapshotButton = await page.locator('.snapshot.btn');
    await snapshotButton.click();

    // Wait for the snapshot notification
    await page.waitForSelector('.snapshot-message');

    // Change the field again
    await titleField.fill('After Snapshot');

    // Hover over snapshot button to show dropdown
    await snapshotButton.hover();

    // Click the first snapshot in the list
    await page.click('.snapshot-item');

    // Verify field was restored to snapshot state
    await expect(titleField).toHaveValue('Snapshot Test');
  });

  // More E2E tests
});
```

## Test Coverage Strategy

To maximize effectiveness while minimizing effort, focus on:

1. **Unit tests** for core logic functions:

   - History management functions
   - Snapshot handling
   - Form state manipulation

2. **Integration tests** for component interactions:

   - Undo/redo button state
   - History tracking
   - Snapshot UI behavior

3. **E2E tests** for critical user journeys:
   - Complete edit-undo-redo cycle
   - Snapshot create-restore flow
   - Form submission after history operations

## Mocking Strategies

### DOM Manipulation

For tests involving DOM manipulation, mock the DOM elements:

```javascript
// Mock form elements
const mockForm = {
  querySelector: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([])
};

// Mock form ref
const mockFormRef = { current: mockForm };
```

### React State

For tests involving React state:

```javascript
// Mock React hooks
const mockState = {};
const mockSetState = jest.fn();
jest.spyOn(React, 'useState').mockImplementation((initialValue) => {
  return [initialValue, mockSetState];
});

jest.spyOn(React, 'useRef').mockImplementation((value) => ({ current: value }));
```

## Continuous Integration Setup

Add these tests to your CI pipeline for automated verification:

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run unit and integration tests
        run: npm test
      - name: Run E2E tests
        run: npm run test:e2e
```

## Benefits of Automated Testing

1. **Regression prevention**: Catch issues as soon as they're introduced
2. **Faster development**: Reduce manual testing time
3. **Documentation**: Tests serve as living documentation of expected behavior
4. **Confidence**: Make changes with confidence that existing features work
5. **Collaboration**: Make it easier for team members to work on the codebase

## Limitations and Manual Testing Needs

Some aspects still require manual testing:

- Visual feedback appearance (notifications, animations)
- Hover interactions and visual states
- Performance characteristics under real user conditions
- Complex drag-and-drop operations
- Browser-specific behaviors
