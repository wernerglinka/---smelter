# Form Submission Tests

This directory contains tests for the form submission functionality, which handles transforming web forms into structured objects, validating the data, and handling the submission process.

## Directory Structure

```
form-submission/
├── fixtures/                     # Test fixtures and example data
│   └── example-form.js           # Example form generation code
├── integration/                  # End-to-end integration tests
│   └── form-submission-flow.test.js  # Tests full submission flow
├── processors/                   # Tests for individual processing units
│   ├── preprocess-form-data.test.js  # Tests form preprocessing
│   ├── transform-form-to-object.test.js  # Tests form to object transformation
│   ├── validate.test.js          # Tests data validation
│   └── submit-handler.test.js    # Tests submission handler
└── README.md                     # This documentation file
```

## Test Fixtures

### `example-form.js`

This file provides three functions to create test form DOM structures:

1. `createSimpleForm()`: Creates a basic form with text, number, and boolean fields
2. `createComplexForm()`: Creates a more complex form with nested objects, arrays, and lists
3. `createInvalidForm()`: Creates a form with validation errors

These fixtures are used across the test suite to ensure consistency in testing.

## Processor Tests

### `transform-form-to-object.test.js`

Tests the transformation of DOM form elements into structured JavaScript objects. This includes:

- `ValueOps`: Utility functions for extracting values from form elements
- `PathOps`: Utilities for manipulating object paths
- `FormStateOps`: State management during form transformation
- Complete form transformation process

### `validate.test.js`

Tests validation of form submission data, including:

- Basic field validation
- Validation using JSON schemas
- Nested object validation
- Array validation
- Type checking (numbers, booleans, dates)
- Error handling

### `preprocess-form-data.test.js`

Tests the preprocessing stage of form data, including:

- Adding temporary markers to form elements
- Special handling for arrays
- Integration with the transformation process
- Cleanup of temporary DOM elements
- Error handling

### `submit-handler.test.js`

Tests the form submission handler, which ties together all processing steps:

- Preprocessing form data
- Validating the resulting object
- Saving the data to a file
- Handling various error conditions
- Path normalization
- Schema validation

## Integration Tests

### `form-submission-flow.test.js`

End-to-end tests for the entire form submission process, verifying:

- Simple form submission flow
- Complex form submission with nested data
- Validation during submission
- File system interactions
- Error handling for various scenarios

## Running Tests

Tests can be run using Jest:

```bash
# Run all form submission tests
npm test -- --testPathPattern=form-submission

# Run specific test file
npm test -- path/to/specific/test.js
```

## Form Submission Flow

The form submission process follows these steps:

1. **Preprocessing**: Add temporary markers to the form to aid in transformation
2. **Transformation**: Convert the DOM structure into a JavaScript object
3. **Validation**: Validate the resulting object using optional schemas
4. **Submission**: Save the validated data to a file

Each of these steps is tested independently, as well as in integration with the full flow.