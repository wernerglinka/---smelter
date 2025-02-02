# Form to Object Transformation

## Overview
This document describes how the edit form is converted back into a YAML object for saving. This process is the inverse of the YAML-to-form conversion.

## Core Concepts

### Form Structure
The form maintains a hierarchical structure that mirrors the desired YAML output:
- Simple fields → YAML properties
- Object fields → Nested YAML objects
- Array fields → YAML arrays

### Data Attributes
Form elements use data attributes to maintain information about:
- Field types
- Hierarchical relationships
- Array structures
- Object nesting

## Transformation Process

### 1. Form Traversal
- Start at root form element
- Process each form-element div
- Maintain parent-child relationships
- Handle nested structures

### 2. Element Processing
Based on element classes:

1. **Simple Fields**
```javascript
{
    key: labelElement.value,
    value: contentElement.value
}
```

2. **Object Fields**
```javascript
{
    key: objectNameElement.value,
    value: {
        // Nested field values
    }
}
```

3. **Array Fields**
```javascript
{
    key: arrayNameElement.value,
    value: [
        // Array items
    ]
}
```

### 3. Schema Validation
- Apply type constraints
- Validate required fields
- Check value formats
- Ensure structural integrity

## Implementation Details

### Element Classes
Key classes that determine processing:
- `form-element`: Base form element
- `is-object`: Object container
- `is-array`: Array container
- `element-label`: Field name
- `element-value`: Field value

### Processing Order
1. Identify element type
2. Extract field name
3. Process value based on type
4. Handle nested elements
5. Build object structure

### Example Transformation

**Form Structure:**
```html
<div class="form-element is-object">
    <input class="element-label" value="seo">
    <div class="object-dropzone">
        <div class="form-element">
            <input class="element-label" value="title">
            <input class="element-value" value="Page Title">
        </div>
    </div>
</div>
```

**Resulting Object:**
```javascript
{
    seo: {
        title: "Page Title"
    }
}
```

## Error Handling

### Validation Errors
- Missing required fields
- Invalid field types
- Structural inconsistencies

### Recovery Strategy
1. Mark invalid fields
2. Provide error messages
3. Allow partial saves
4. Maintain valid data

## Related Documentation
- [YAML to Form Conversion](./yaml-to-form.md)
- [Storage Operations](./storage-operations.md)
- [Edit Form](../components/edit-form.md)