# Form Generation Processors Tests

## Overview

This directory contains tests for the form generation processors, which are responsible for converting various data structures into form configurations that can be rendered in the UI.

## Key Test Files

### `frontmatter-processor.test.js`

Tests the conversion of YAML frontmatter into form configurations. Currently covers:

- Simple frontmatter with primitive values
- Nested objects
- Arrays of primitives
- Complex nested structures
- Empty frontmatter handling
- Null value processing
- Schema integration
- Real-world metalsmith page structures
- Explicit schema preservation
- Object field generation

## Test Structure

### Mocks

The tests use several mocks to isolate the processor functionality:

```javascript
// Storage operations mock
@services/storage.js
  - getProjectPath() → Returns mock project path

// Schema handler mock
schema/schema-handler
  - getExplicitSchema() → Returns schema configuration

// Schema conversion mock
schema/convert-js-to-schema
  - convertToSchemaObject() → Converts frontmatter to schema

// Schema validation mock
schema/validate-schema
  - validateSchema() → Validates schema structure
```

### Project Functions Used

#### Form Generation
- `createField(key, value)`: Creates field configurations for the form UI
- `inferType(value)`: Determines appropriate field type from value
- `processChildren(value)`: Handles nested array and object structures
- `validateSchema(schema)`: Validates schema structure and types

#### Form Submission
- `transformFormDataToObject(formData)`: Converts form data back to object structure
- `validateSubmission(data)`: Validates form submission data
- `handleFileOperations(data, filePath)`: Manages file updates

#### Type Validation
- `isSimpleList(value)`: Checks for simple array types
- `isDateObject(value)`: Validates date field structures

## Current Test Coverage

1. **Simple Frontmatter**
   - Tests basic key-value pairs
   - Verifies correct field type assignment
   - Example: `{ layout: 'default.njk', title: 'Test Page' }`

2. **Nested Objects**
   - Tests object hierarchy preservation
   - Verifies nested field structure
   - Ensures fields property generation
   - Example: `{ seo: { title: 'SEO Title', description: 'Description' } }`

3. **Array Handling**
   - Tests array of primitives
   - Verifies dropzone configuration
   - Example: `{ tags: ['javascript', 'testing', 'jest'] }`

4. **Complex Structures**
   - Tests nested arrays within objects
   - Verifies deep structure conversion
   - Validates form metadata generation
   - Ensures value preservation
   - Example:
     ```javascript
     {
       sections: [
         {
           container: 'section',
           containerFields: {
             isDisabled: false,
             background: {
               color: '',
               isDark: false
             }
           }
         }
       ]
     }
     ```

5. **Explicit Schema Integration**
   - Tests preservation of explicit schema definitions
   - Verifies field generation for undefined schema fields
   - Handles schema validation
   - Example:
     ```javascript
     {
       seo: {
         title: 'Test Page',
         description: 'A test page',
         socialImage: ''
       }
     }
     ```

## Field Structure

Each generated field includes:
- `label`: Human-readable field name
- `type`: Field type (text, checkbox, array, object, etc.)
- `placeholder`: Helper text for empty fields
- `value`: Original data value
- Additional type-specific properties:
  - Arrays: `isDropzone`, `dropzoneType`
  - Objects: `fields` array for nested elements

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
