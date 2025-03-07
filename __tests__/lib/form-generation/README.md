# Form Generation Tests

This directory contains tests for the form generation functionality, which handles transforming data structures (like YAML frontmatter) into form representations that can be displayed in the editor.

## Directory Structure

```
form-generation/
├── fixtures/                      # Test fixtures and example data
│   ├── example-frontmatter.json   # Example frontmatter data
│   └── example-rendered.html      # Example rendered form output
├── processors/                    # Tests for processing modules
│   └── frontmatter-processor.test.js  # Tests for frontmatter processing
├── schema/                        # Tests for schema handling
│   └── convert-js-to-schema.test.js   # Tests for JS to schema conversion
└── README.md                      # This documentation file
```

## Test Fixtures

### `example-frontmatter.json`

A sample frontmatter object that includes various data types and structures commonly found in content files:

- Simple primitive fields (strings, booleans)
- Nested objects (SEO metadata, access controls)
- Arrays of objects (sections)
- Multi-level nesting (containerFields, background)

This fixture is used to test the conversion of raw data into form field definitions.

## Processor Tests

### `frontmatter-processor.test.js`

Tests the `processFrontmatter` function, which is responsible for:

- Converting raw frontmatter data into a structured form representation
- Handling explicit schemas from external sources (fields.json)
- Processing nested object structures
- Converting primitive fields to appropriate form controls
- Preserving the hierarchical structure of complex data

Key test cases:

- Processing frontmatter with explicit schema
- Handling nested object structures
- Processing empty frontmatter
- Handling primitive fields without schema
- Processing complex nested structures
- Schema validation

## Schema Tests

### `convert-js-to-schema.test.js`

Tests the `convertToSchemaObject` function, which transforms JavaScript objects into a schema format used by the form generator. Test cases cover:

- Input validation

  - Handling null/undefined inputs
  - Handling non-object inputs
  - Handling empty objects

- Schema handling

  - Processing without schema
  - Processing with explicit schema
  - Handling invalid schemas
  - Handling array/object schemas

- Field type inference

  - Basic types (string, number, boolean)
  - Arrays and objects
  - Complex nested structures
  - Special values (null, dates)

- Edge case handling
  - Fields with null values
  - Fields with undefined values
  - Schema fields with missing properties
  - Fields with special characters

Additionally, the tests cover helper functions like:

- `matchSchemaField`: Finds a schema field definition that matches a given field name
- `createField`: Creates a form field with the appropriate type and properties

## Form Generation Flow

The form generation process follows these steps:

1. **Schema Acquisition**: Get an explicit schema if available (from fields.json or another source)
2. **Schema Validation**: Validate that the schema matches required format
3. **Processing**: Process the frontmatter using the schema or with type inference
4. **Field Creation**: Create form field definitions for each frontmatter property
5. **Recursion**: Process nested structures (objects and arrays) recursively
6. **Result**: Return a complete form definition that can be rendered in the UI

Each step is tested independently, with a focus on proper type handling, nesting, and schema application.

## Running Tests

Tests can be run using Jest:

```bash
# Run all form generation tests
npm test -- --testPathPattern=form-generation

# Run specific test file
npm test -- path/to/specific/test.js
```
