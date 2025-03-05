# Form Generation System

This module provides a flexible and powerful form generation system that dynamically creates form interfaces from various data sources (JSON, frontmatter, etc.) with a component-based architecture.

## Architecture Overview

The form generation system follows a clear data flow:

```
Data Source → Processor → Schema → FormContainer → FormField → Field Components
```

### Key Layers

1. **Processors**: Convert different data formats (frontmatter, JSON) to schema objects
2. **Schema Handling**: Validates and normalizes schemas
3. **Form Context**: Manages form state and operations
4. **Component Hierarchy**: FormContainer → FormField → Field Type Components

## Component Structure

### Core Components

- **FormContainer**: Top-level component that manages the overall form
- **FormField**: Router component that selects the appropriate field type based on schema
- **BaseField**: Common field functionality shared across all field types
- **FieldControls**: Reusable UI components for field actions (add, delete, etc.)

### Field Types

#### Simple Fields
- TextField
- TextArea
- NumberField
- CheckboxField
- DateField
- SelectField
- UrlField

#### Complex Fields
- ObjectField: Renders nested object properties as fields
- ArrayField: Renders a collection of similar items
- ListField: Specialized array for simpler list structures

## Schema Handling

The schema system provides a structured way to define forms:

1. **Schema Definition**: Fields organized hierarchically with metadata
2. **Conversion Process**:
   - `convert-js-to-schema.js` transforms data into a standardized schema
   - Field types are inferred or explicitly defined
   - Schemas are validated using rules in `validate-schema.js`

### Field Type Configuration

Field types are defined in `field-types.js` and include:
- Basic types: text, textarea, number, checkbox, date, select, url
- Complex types: object, array, list (for nested structures)

## Context System

The form generation system uses React Context to manage state:

1. **FormContext**: Provides form-wide state and methods:
   - Manages form values through `updateFormState`
   - Handles validation via `validate`
   - Manages form submission through `handleSubmit`

2. **Usage**:
   ```jsx
   <FormContextProvider initialState={data} onSubmit={handleSubmit}>
     <FormContainer schema={schema} />
   </FormContextProvider>
   ```

## Processor System

Processors handle different data formats:

1. **Available Processors**:
   - `frontmatter-processor.js`: Processes markdown frontmatter + content
   - `json-processor.js`: Handles JSON data

2. **Processing Workflow**:
   - Load schema (explicit or inferred)
   - Convert data to schema object
   - Validate schema structure
   - Generate field configurations

## Key Features

1. **Dynamic Field Generation**: Creates appropriate form controls based on data types
2. **Drag and Drop**: Support for reordering fields
3. **Field Operations**: Add, duplicate, and delete operations
4. **Nested Structures**: Handles complex nested objects and arrays
5. **Field Collapse**: Complex fields can be collapsed/expanded
6. **Schema Validation**: Validates field configurations before rendering

## Usage Example

```jsx
import { FormContextProvider } from './context/FormContext';
import { FormContainer } from './components/FormContainer';
import { convertToSchemaObject } from './schema/convert-js-to-schema';
import { processFrontmatter } from './processors/frontmatter-processor';

// Get data from source
const { frontmatter, content } = processFrontmatter(markdownContent);

// Convert to schema
const schema = convertToSchemaObject(frontmatter);

// Render form
function MyForm() {
  const handleSubmit = (formData) => {
    // Process form submission
    console.log(formData);
  };

  return (
    <FormContextProvider initialState={frontmatter} onSubmit={handleSubmit}>
      <FormContainer schema={schema} />
    </FormContextProvider>
  );
}
```

## Extending the System

To add new field types:

1. Add the field type to `field-types.js`
2. Create a new field component in `fields/`
3. Update `FormField.jsx` to route to your new field type
4. Update schema validation rules if necessary