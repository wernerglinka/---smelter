# EditSpace Component

## Overview
The EditSpace component is the main editing interface in the application. It provides a form-based editing experience for markdown and JSON files, with support for dynamic field addition through drag-and-drop interactions.

## Architecture

### Component Structure
```
EditSpace/
├── index.jsx           # Main component
├── styles.css         # Component styles
└── README.md         # This documentation
```

### Key Features

#### 1. Form-Based Editing
- Converts file content (markdown/JSON) into editable form fields
- Supports real-time field updates
- Maintains field hierarchy and relationships

#### 2. Drag and Drop Integration
- Accepts field drops from the sidebar
- Supports field reordering within the form
- Provides visual feedback during drag operations
- Calculates precise insertion points for dropped items

#### 3. Preview Integration
- Real-time preview updates
- Toggle preview visibility
- Synchronized scrolling with preview pane

## Technical Implementation

### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| fileContent | Object | Yes | Content of the file being edited |
| $expanded | boolean | No | Whether the edit space is in expanded mode |
| filePath | string | Yes | Path of the current file being edited |

### State Management
- `formFields`: Array of form field configurations
- `activeFilePath`: Currently active file path
- `fileName`: Name of the current file

### Drag and Drop Handling

#### Drop Zone Events
```javascript
handleDropzoneEvent({ type, data, position }) {
  // Handles drops from sidebar and internal reordering
  // type: 'sidebar' | 'reorder'
  // data: field configuration
  // position: { x, y, targetIndex }
}
```

### Field Creation
```javascript
createFieldFromTemplate(template) {
  // Creates new field instance from template
  // Validates field type
  // Generates unique ID
  // Sets default values
}
```

## Usage

```jsx
import EditSpace from './components/EditSpace';

function Editor() {
  return (
    <EditSpace
      fileContent={fileContent}
      $expanded={!isSidebarVisible}
      filePath="/path/to/file.md"
    />
  );
}
```

## Integration Points

### 1. With Sidebar
- Receives dragged fields from sidebar
- Handles field type validation
- Manages field insertion

### 2. With Preview Pane
- Sends real-time content updates
- Coordinates preview visibility
- Manages split view layout

### 3. With Form Generation
- Uses `FormField` components
- Manages field hierarchy
- Handles field updates

## Event System

### Form Events
- `onSubmit`: Handles form submission
- `onFieldUpdate`: Manages individual field updates
- `onDrop`: Processes dropped fields

### File Events
- `onFileLoad`: Handles initial file loading
- `onFileSave`: Manages file saving
- `onFileChange`: Tracks file modifications

## Styling

The component uses modular CSS with:
- BEM naming convention
- Responsive design support
- Theme-aware styling
- Drag and drop visual feedback

## Best Practices

1. **Field Management**
   - Always validate field types before creation
   - Maintain unique field IDs
   - Preserve field hierarchy

2. **Performance**
   - Use memoization for expensive operations
   - Implement virtualization for large forms
   - Optimize drag and drop calculations

3. **Error Handling**
   - Validate all incoming data
   - Provide meaningful error messages
   - Maintain form state during errors

## Contributing

When modifying this component:
1. Maintain existing drag and drop functionality
2. Update tests for new features
3. Document prop changes
4. Follow established naming conventions
5. Update this README for significant changes

## Future Enhancements

1. Field Templates
   - Support for custom field templates
   - Template management interface
   - Template validation

2. Advanced Features
   - Multi-select operations
   - Keyboard shortcuts
   - Undo/redo support
   - Field search and filtering