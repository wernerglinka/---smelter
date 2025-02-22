# Drag and Drop Implementation Guide

## Overview

The EditSpace component implements a sophisticated drag-and-drop system that handles:
- Field insertion from sidebar
- Field reordering within dropzones
- Nested dropzone support
- Visual feedback during drag operations

## Architecture

### Core Components

1. **DragStateProvider**
   - Manages global drag state
   - Provides context for drag operations
   - Tracks current dropzone and insertion points

2. **Dropzone Component**
   - Handles drag events
   - Calculates insertion positions
   - Manages visual feedback

3. **GhostElement**
   - Provides drag preview
   - Follows cursor during drag
   - Reflects target position

## Drag State Management

### State Structure
```javascript
{
  isDragging: boolean,
  currentDropzone: HTMLElement | null,
  ghostElement: HTMLElement | null,
  position: {
    x: number,
    y: number
  },
  insertionPoint: {
    closest: HTMLElement,
    position: 'before' | 'after'
  }
}
```

### State Updates
```javascript
// Example state update during drag
dispatch({
  type: 'UPDATE_DRAG_STATE',
  payload: {
    isDragging: true,
    currentDropzone: dropzoneRef.current,
    position: { x, y },
    insertionPoint
  }
});
```

## Drag Operation Flow

### 1. Drag Initiation (Sidebar)
```javascript
const handleDragStart = (e, fieldType) => {
    // Set drag data
    e.dataTransfer.setData('origin', 'sidebar');
    e.dataTransfer.setData('application/json', JSON.stringify({
        type: fieldType
    }));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    e.currentTarget.classList.add('dragging');
};
```

### 2. Drag Over (Dropzone)
```javascript
const handleDragOver = (e) => {
    e.preventDefault();
    
    // Calculate insertion point
    const rect = dropzoneRef.current.getBoundingClientRect();
    const children = Array.from(dropzoneRef.current.children);
    
    // Find closest child element
    const insertionPoint = calculateInsertionPoint(e.clientY, children);
    
    // Update drag state
    updateDragState({
        currentDropzone: dropzoneRef.current,
        insertionPoint
    });
    
    // Update visual indicators
    updateDropIndicators(insertionPoint);
};
```

### 3. Drop Handling (EditSpace)
```javascript
const handleDropzoneEvent = ({ type, data, position }) => {
    switch (type) {
        case 'sidebar':
            // Create new field
            const newField = createFieldFromTemplate(data);
            
            // Insert at position
            insertField(newField, position.targetIndex);
            break;
            
        case 'reorder':
            // Move existing field
            reorderField(data.id, position.targetIndex);
            break;
    }
};
```

## Position Calculation

### Insertion Point Algorithm
```javascript
function calculateInsertionPoint(mouseY, children) {
    let closestChild = null;
    let closestDistance = Infinity;
    let position = 'after';

    children.forEach(child => {
        const rect = child.getBoundingClientRect();
        const childMiddle = rect.top + (rect.height / 2);
        const distance = Math.abs(mouseY - childMiddle);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestChild = child;
            position = mouseY < childMiddle ? 'before' : 'after';
        }
    });

    return { closestChild, position };
}
```

## Visual Feedback

### 1. Drag Indicators
- `.dropzone--active`: Applied to current dropzone
- `.dropzone--valid`: Shows valid drop targets
- `.dropzone--invalid`: Shows invalid drop targets

### 2. Insertion Markers
```css
.insertion-marker {
    position: absolute;
    height: 2px;
    background: var(--primary-color);
    transition: transform 0.15s ease;
}

.insertion-marker--before {
    transform: translateY(-1px);
}

.insertion-marker--after {
    transform: translateY(1px);
}
```

## Validation Rules

### 1. Field Type Validation
```javascript
function validateFieldType(fieldType, dropzone) {
    // Check if field type is allowed in dropzone
    const dropzoneType = dropzone.dataset.type;
    return ALLOWED_FIELD_TYPES[dropzoneType].includes(fieldType);
}
```

### 2. Nesting Rules
- Objects can contain other objects and fields
- Arrays can contain multiple items of the same type
- Root dropzone accepts all field types

## Error Handling

### 1. Invalid Drops
```javascript
function handleInvalidDrop(error) {
    console.error('Drop error:', error);
    showErrorNotification({
        message: 'Invalid drop operation',
        details: error.message
    });
}
```

### 2. State Recovery
```javascript
function recoverFromFailedDrop() {
    // Reset drag state
    dispatch({ type: 'CLEAR_DRAG_STATE' });
    
    // Remove visual indicators
    clearDropIndicators();
    
    // Restore original field positions
    resetFieldPositions();
}
```

## Performance Considerations

### 1. Throttling
```javascript
const throttledDragOver = throttle((e) => {
    handleDragOver(e);
}, 16); // ~60fps
```

### 2. DOM Updates
- Batch DOM updates using `requestAnimationFrame`
- Use CSS transforms for smooth animations
- Minimize reflows during drag operations

## Integration with Form State

### 1. Field Updates
```javascript
function updateFormState(fieldId, newPosition) {
    setFormFields(prevFields => {
        const updatedFields = [...prevFields];
        const fieldIndex = updatedFields.findIndex(f => f.id === fieldId);
        
        if (fieldIndex !== -1) {
            const [field] = updatedFields.splice(fieldIndex, 1);
            updatedFields.splice(newPosition, 0, field);
        }
        
        return updatedFields;
    });
}
```

### 2. Field Creation
```javascript
function createField(template, position) {
    setFormFields(prevFields => {
        const newField = createFieldFromTemplate(template);
        const updatedFields = [...prevFields];
        updatedFields.splice(position, 0, newField);
        return updatedFields;
    });
}
```

## Testing

### 1. Unit Tests
```javascript
describe('Drag and Drop', () => {
    test('validates field types', () => {
        expect(validateFieldType('text', textDropzone)).toBe(true);
        expect(validateFieldType('array', textDropzone)).toBe(false);
    });
    
    test('calculates insertion points', () => {
        const point = calculateInsertionPoint(100, mockChildren);
        expect(point.position).toBe('after');
    });
});
```

### 2. Integration Tests
- Test drag operations between different dropzones
- Verify field ordering after drops
- Check state updates during drag operations

## Best Practices

1. **Event Handling**
   - Always prevent default behavior
   - Clean up event listeners
   - Handle all drag events (start, over, enter, leave, drop)

2. **State Management**
   - Keep drag state synchronized
   - Handle edge cases (cancelled drops, invalid targets)
   - Maintain undo/redo history

3. **Performance**
   - Optimize calculation-heavy operations
   - Minimize DOM updates
   - Use appropriate event throttling

4. **Accessibility**
   - Provide keyboard alternatives
   - Include ARIA attributes
   - Support screen readers