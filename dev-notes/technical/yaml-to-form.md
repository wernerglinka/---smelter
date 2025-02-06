# YAML to Form Conversion

## Overview

This document describes how YAML frontmatter in Markdown files is converted into an interactive form interface.

## Core Concepts

### YAML Frontmatter

YAML frontmatter defines the structure and metadata of a Markdown file. It serves two purposes:

1. Setting traditional metadata (title, date, layout)
2. Defining modular page structure using components

### Schema Enhancement

YAML alone doesn't provide enough detail for comprehensive form generation. We use an optional schema JSON object to define:

- Data types
- Validation rules
- UI constraints
- Default values

## Form Structure

### Basic Form Elements

Each form element follows this HTML structure:

```html
<div class="label-exists form-element no-drop" draggable="true">
  <span class="sort-handle">...Icon...</span>
  <label class="label-wrapper">
    <span>Label<sup>*</sup></span>
    <div>
      <input type="text" class="element-label" readonly="">
    </div>
  </label>
  <label class="content-wrapper">
    <span class="hint">Hint text</span>
    <div>
      <input|select|textarea class="element-value">
    </div>
  </label>
  <div class="button-wrapper"></div>
</div>
```

### Dropzones

Dropzones are crucial interface elements that serve two primary purposes:

1. **Template Insertion**

   - Accept predefined templates from the sidebar
   - Support dragging of page templates into empty forms
   - Allow section templates to be dropped into section arrays
   - Enable block templates to be inserted into block arrays

2. **Secondary: Ordering**
   - Allow reordering of existing elements
   - Support hierarchical structure maintenance

### Template System

Templates are predefined structures located in the `templates` directory:

1. **Page Templates**

   - Base structures for different page types
   - Define default frontmatter
   - Example: `templates/pages/pageSections.js`

2. **Section Templates**

   - Reusable section configurations
   - Include common section fields
   - Example: `templates/sections/leafletSection.js`

3. **Block Templates**
   - Smaller, reusable content blocks
   - Can be inserted into section content
   - Example: `templates/blocks/`

### Field Types

1. **Simple Fields**

   - Text inputs
   - Select dropdowns
   - Checkboxes
   - Date inputs

2. **Object Fields**

   - Contains nested fields
   - Includes dropzone for field reordering
   - Supports dynamic field addition

3. **Array Fields**
   - Simple lists (strings)
   - Complex arrays (objects)
   - Sortable items
   - Add/remove functionality

## Conversion Process

1. **YAML Parsing**

   - Parse frontmatter into JSON object
   - Validate structure

2. **Schema Application**

   - Load schema if available
   - Merge with base field definitions
   - Apply type constraints

3. **Form Generation**
   - Create form structure
   - Build field hierarchy
   - Apply drag-drop functionality

## Examples

### Simple Field

YAML:

```yaml
layout: blocks.njk
```

Schema:

```json
{
  "label": "layout",
  "type": "select",
  "options": [
    { "label": "Default", "value": "default.njk" },
    { "label": "Blocks", "value": "blocks.njk" }
  ]
}
```

### Object Field

YAML:

```yaml
seo:
  title: 'Page Title'
  description: 'Page Description'
```

### Array Field

YAML:

```yaml
sections:
  - container: section
    name: banner
    containerFields:
      isDisabled: true
```

## Implementation Notes

1. **Type Inference**

   - Default to string type
   - Use schema for specific types
   - Handle nested structures

2. **Validation**

   - Required fields
   - Type checking
   - Custom validation rules

3. **UI Considerations**
   - Drag-drop zones
   - Field ordering
   - Dynamic updates

## Related Documentation

- [Form to Object Transformation](./form-to-object.md)
- [Field Types](../components/field-types.md)
- [Edit Form](../components/edit-form.md)
