# Form Submission Module

This module handles the complete form submission process, from preprocessing form data to validation and writing to files.

## Overview

The form submission process involves several steps:

1. **Preprocessing Form Data** - Converting the HTML form elements into a structured JavaScript object
2. **Validation** - Ensuring the data meets schema requirements
3. **Submission** - Writing the data to a file, handling both frontmatter and content

## Key Components

### `handleFormSubmission`

The main entry point that orchestrates the submission process:

```javascript
handleFormSubmission(form, filePath, (schema = null));
```

- `form`: The HTML form element containing form data
- `filePath`: Path where the file should be saved
- `schema`: Optional schema for validation

### `preprocessFormData`

Transforms the HTML form elements into a structured JavaScript object:

```javascript
preprocessFormData(form);
```

1. Adds temporary markers for structure parsing
2. Handles special cases for arrays and nested structures
3. Transforms elements to a nested object structure
4. Cleans up temporary markers

### `transformFormElementsToObject`

Converts a collection of form elements into a structured object:

```javascript
transformFormElementsToObject(allFormElements);
```

Handles various field types:

- Simple fields (text, number, etc.)
- Object fields (nested structures)
- Array fields (collections)
- List fields (simple arrays)

### `validateSubmission`

Validates the form data against an optional schema:

```javascript
validateSubmission(formData, schema);
```

Returns an array of error messages if validation fails.

## Markdown Handling

The system handles both frontmatter (YAML metadata) and markdown content:

1. **Reading Files**:

   - Frontmatter is parsed from between `---` markers
   - Content is everything after the closing `---` marker

2. **Writing Files**:
   - If the form contains a non-empty `contents` field:
     - The contents are separated from frontmatter
     - Both are written to the file with proper formatting
   - If no content is present:
     - Only frontmatter is written with surrounding `---` markers

Example of how content is processed:

```javascript
// Extract content from form data
const { contents = '', ...frontmatterData } = formData;
const hasContent = contents && contents.trim() !== '';

if (hasContent) {
  // Write both frontmatter and content
  await window.electronAPI.markdown.writeObject({
    path: filePath,
    obj: frontmatterData,
    content: contents
  });
} else {
  // Write only frontmatter
  await window.electronAPI.files.writeYAML({
    obj: formData,
    path: filePath
  });
}
```

## Usage Example

```javascript
import { handleFormSubmission } from './submit-handler.js';

// Get form element
const form = document.getElementById('my-form');

// Path to save the file
const filePath = '/path/to/my-file.md';

// Optional schema for validation
const schema = {
  // Schema definition
};

try {
  const result = await handleFormSubmission(form, filePath, schema);

  if (result.success) {
    console.log('Form submitted successfully');
  } else {
    console.error('Form submission failed:', result.error);
  }
} catch (error) {
  console.error('Error in form submission:', error);
}
```

## How It Works

1. The form is processed to extract all form elements
2. Elements are converted to a nested object structure, respecting field relationships
3. The data is validated against an optional schema
4. If validation passes:
   - If content exists, it is separated from frontmatter before saving
   - The file is written using the appropriate method based on content presence
5. A success/failure result is returned
