# Form Generation Processors Tests

## Overview

This directory contains tests for the form generation processors, which are responsible for converting various data structures into form configurations that can be rendered in the UI.

## Key Test Files

### `frontmatter-processor.test.js`

Tests the conversion of YAML frontmatter into form configurations. Covers:

- Simple frontmatter with primitive values
- Nested objects
- Arrays of primitives
- Complex nested structures (arrays of objects with nested arrays)

## Test Structure

### Mocks

The tests use several mocks to isolate the processor functionality:

```javascript
// Storage operations mock
@services/storage.js
  - getProjectPath() → Returns mock project path

// Schema handler mock
schema/schema-handler
  - getExplicitSchema() → Returns empty schema object

// Schema conversion mock
schema/convert-js-to-schema
  - convertToSchemaObject() → Converts frontmatter to schema
```

### Helper Functions

#### `convertValueToField(value, label)`

Recursively converts values into form field configurations:

- **Arrays**: Converted to dropzone fields with mapped items
- **Objects**: Converted to object fields with nested field structures
- **Primitives**: Converted to appropriate field types (text, number, checkbox)

## Test Cases

1. **Simple Frontmatter**
   - Tests basic key-value pairs
   - Verifies correct field type assignment
   - Example: `{ layout: 'default.njk', title: 'Test Page' }`

2. **Nested Objects**
   - Tests object hierarchy preservation
   - Verifies nested field structure
   - Example: `{ seo: { title: 'SEO Title', description: 'Description' } }`

3. **Array Handling**
   - Tests array of primitives
   - Verifies dropzone configuration
   - Example: `{ tags: ['javascript', 'testing', 'jest'] }`

4. **Complex Structures**
   - Tests nested arrays within objects
   - Verifies deep structure conversion
   - Example: 
     ```javascript
     {
       sections: [
         {
           name: 'intro',
           content: 'Introduction section'
         },
         {
           name: 'features',
           items: ['Feature 1', 'Feature 2']
         }
       ]
     }
     ```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- frontmatter-processor.test.js

# Run with coverage
npm test -- --coverage
```

## Related Documentation

- [YAML to Form Conversion](../../../../dev-notes/technical/yaml-to-form.md)
- [Form to Object Transformation](../../../../dev-notes/technical/form-to-object.md)
- [Edit Form Components](../../../../dev-notes/components/edit-form.md)