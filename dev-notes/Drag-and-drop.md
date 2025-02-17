# Drag and Drop Functionality

The application implements a sophisticated drag and drop system that handles multiple types of draggable elements and dropzones. Here's a detailed breakdown of how it works:

## Draggable Elements

The system supports three types of draggable sources:
1. Components from the sidebar
2. Templates (blocks, sections, and pages)
3. Existing elements within dropzones

### Drag Handles
- Each draggable element includes a sort handle (`<span class="sort-handle">`) with an SVG icon
- The handle allows users to initiate drag operations on existing elements

## Dropzones

The application uses several types of dropzones, each with specific purposes:

1. Main Dropzone (`#dropzone`)
   - Root container for page content
   - Accepts page-level elements

2. Array Dropzones (`.array-dropzone`)
   - Contains repeatable elements
   - Identified by `data-wrapper="is-array"`
   - Used for sections and collections

3. Object Dropzones (`.object-dropzone`)
   - Contains object properties
   - Identified by `data-wrapper="is-object"`

## Drag State Management

The system maintains a global drag state object that tracks:
- Current dropzone
- Ghost element for drag preview
- Last cursor position
- Element positions
- Dragged element reference

```javascript
let dragState = {
  currentDropzone: null,
  ghostElement: null,
  lastPosition: null,
  isDragging: false,
  elementPositions: new Map(),
  lastUpdate: 0
}
```

## Event Handling

### 1. Drag Start
- Sets data transfer information based on drag source
- Stores origin type (components, templates, or dropzone)
- Initializes drag state

### 2. Drag Over
- Handles positioning logic
- Determines insertion points
- Shows visual indicators for drop targets

### 3. Drop
The drop handler processes different types of elements:

- **Components**: Creates new form elements
- **Templates**: Loads and instantiates template structures
- **Internal Moves**: Repositions existing elements

### Validation Rules

The system enforces several validation rules:
1. Blocks can only be dropped into column dropzones
2. Sections cannot be dropped into columns
3. Objects in array dropzones have special naming conventions
4. Labels must contain only valid characters

## Integration with Undo/Redo

The drag and drop system integrates with an undo/redo stack that:
- Takes snapshots of the dropzone state
- Allows reverting changes
- Maintains a history of modifications

## Event Delegation

Event listeners are delegated to the main form wrapper (`#main-form`) for better performance and to handle dynamically added elements. The main events include:
- `dragstart`
- `dragover`
- `dragleave`
- `drop`
- `click` (for collapse/expand)
- `click` (for delete buttons)
- `click` (for editor)

## Usage Example

```javascript
// Creating a draggable element
const element = document.createElement('div');
element.draggable = true;
element.classList.add('form-element');

// Adding drag handle
const dragHandle = document.createElement('span');
dragHandle.classList.add('sort-handle');
dragHandle.innerHTML = ICONS.DRAG_HANDLE;
element.appendChild(dragHandle);

// Adding to dropzone
const dropzone = document.querySelector('.dropzone');
dropzone.appendChild(element);
```

## Best Practices

1. Always use drag handles for existing elements
2. Validate drop targets before allowing drops
3. Maintain proper nesting structure
4. Update the undo stack after successful drops
5. Provide visual feedback during drag operations
