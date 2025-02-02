# File Editing Flow

## Overview
This document describes the complete flow for editing files in the Metallurgy application.

## Prerequisites
- Project must have a `.metallurgy` folder in its root
- `.metallurgy/projectData.json` must exist and be properly configured

## User Flow

### 1. Opening the Project
1. Launch application
2. Click "Open A Project" link
3. Select project folder in dialog
4. System validates `.metallurgy` folder presence
5. Project loads into editor

### 2. Project Edit Screen
The screen consists of:

#### Left Sidebar
Four main options:
1. **Select File** (default)
   - Lists available markdown and metadata files
   - Organized by project structure

2. **Build a New Page**
   - Creates new markdown file
   - Opens blank editing form

3. **Add Field**
   - Shows draggable field types
   - Supports form customization

4. **Add Template**
   - Lists available templates from `templates` directory
   - Organized by type:
     - Page templates
     - Section templates
     - Block templates
   - Supports drag-drop template insertion into appropriate dropzones
   - Templates maintain predefined structure and defaults

#### Main Editing Pane
- Displays form representation of selected file
- Contains strategic dropzones for:
  - Template insertion (primary purpose)
  - Element reordering (secondary purpose)
- Validates template compatibility with target dropzone
- Maintains template hierarchy and structure

### Template Interaction
1. Select template from sidebar
2. Drag template to appropriate dropzone:
   - Page templates → main form dropzone
   - Section templates → sections array dropzone
   - Block templates → block container dropzones
3. System:
   - Validates template compatibility
   - Injects template structure
   - Initializes with default values
   - Creates necessary form fields

### 3. File Editing Process
1. Select file from sidebar
2. System converts YAML to form
3. Edit fields in form
4. Drag-drop to reorder/restructure
5. Save changes
6. System converts form back to YAML

## Technical Flow

### Project Loading
```javascript
handleOpenProject()
  → getProjectFromDialog()
    → selectProject()
    → validateProject()
    → setupProjectConfig()
```

### File Loading
1. Parse YAML frontmatter
2. Load associated schema
3. Generate form structure
4. Apply validation rules

### Save Process
1. Validate form data
2. Convert form to YAML
3. Update file
4. Refresh project state

## Error Handling
- Invalid project structure
- Missing schema files
- File access issues
- Validation errors

## Related Documentation
- [YAML to Form Conversion](../technical/yaml-to-form.md)
- [Form to Object Transformation](../technical/form-to-object.md)
- [Storage Operations](../technical/storage-operations.md)
