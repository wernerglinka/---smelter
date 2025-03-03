# Field Duplication and Deletion

This document describes how field duplication and deletion are implemented in the Smelter application.

## Architecture Overview

The duplication and deletion functionality is implemented through a hierarchical component structure:

1. **FieldControls Component** - Renders the UI buttons and handles click events
2. **BaseField Component** - Provides wrapper functionality for all field types
3. **Specific Field Components** - Handle field type-specific duplication and deletion logic

## Component Roles

### FieldControls Component

Located at: `src/renderer/src/lib/form-generation/components/fields/FieldControls.jsx`

This component:
- Renders the duplicate (plus) and delete (trash) buttons
- Handles click events with proper propagation stopping
- Conditionally shows/hides buttons based on `allowDuplication` and `allowDeletion` props
- Calls the provided handler functions (`onDuplicate`, `onDelete`)
- Includes tooltips for better UX

### BaseField Component

Located at: `src/renderer/src/lib/form-generation/components/fields/BaseField.jsx`

This component:
- Wraps all field types providing common functionality
- Configures the FieldControls with appropriate handlers
- Respects field-level duplication/deletion configuration via `noDuplication` and `noDeletion` props
- Provides draggable functionality for all fields

### Field-Specific Implementation

Each field type handles duplication and deletion according to its specific needs:

#### ArrayField Implementation

ArrayField is the most complex implementation, handling both:
1. Duplication/deletion of the entire array
2. Duplication/deletion of items within the array

Key features:
- Generates unique IDs for duplicated items using timestamps and random strings
- Properly handles labels by adding "(Copy)" suffix to duplicated items
- Maintains expansion state during operations (expands collapsed arrays)
- Uses index-based duplication/deletion for more reliable operation
- Deep-clones objects to avoid reference issues
- Handles nested field structures

## Data Flow for Duplication

1. User clicks the duplicate button
2. FieldControls component captures the click and prevents propagation
3. The `onDuplicate` handler is called
4. For container fields (like ArrayField, ObjectField):
   - A deep clone of the field data is created
   - A new unique ID is generated
   - The label is modified to indicate it's a copy
   - The new field is inserted in the appropriate position
   - The container is expanded if it was collapsed

## Data Flow for Deletion

1. User clicks the delete button
2. FieldControls component captures the click and prevents propagation
3. The `onDelete` handler is called
4. The specific field component:
   - Locates the item to be deleted (by ID or index)
   - Creates a new array excluding the deleted item
   - Updates the state with the new array

## Special Considerations

1. **ID Generation**: The application uses a combination of timestamps and random strings to ensure uniqueness: 
   ```javascript
   const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
   ```

2. **Reference Handling**: JSON.stringify/parse is used for deep cloning to avoid reference issues during duplication:
   ```javascript
   const duplicatedItem = {
     ...JSON.parse(JSON.stringify(itemToDuplicate)),
     id: `${itemToDuplicate.id}_${uniqueId}`,
     label: newLabel
   };
   ```

3. **State Management**: Each container field manages its own children state, enabling localized updates without affecting the entire form.

4. **Event Bubbling**: All click handlers explicitly stop propagation to prevent unintended side effects.

## Implementation Examples

### Array Field Duplication

```javascript
// Generate a unique identifier for the duplicate
const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Handle label for duplicate properly, adding (Copy) suffix
let newLabel;
if (itemToDuplicate.label) {
  newLabel = `${itemToDuplicate.label}${itemToDuplicate.label.includes('(Copy)') ? ' (Copy)' : ' (Copy)'}`;
}

// Create duplicated item with unique ID (deep clone to avoid reference issues)
const duplicatedItem = {
  ...JSON.parse(JSON.stringify(itemToDuplicate)),
  id: `${itemToDuplicate.id}_${uniqueId}`,
  label: newLabel
};

// Insert the duplicated item
setItems(currentItems => {
  const index = currentItems.findIndex(item => item.id === itemToDuplicate.id);
  if (index !== -1) {
    const newItems = [...currentItems];
    newItems.splice(index + 1, 0, duplicatedItem);
    return newItems;
  }
  return currentItems;
});
```

### Array Field Deletion

```javascript
// Handle deletion of items inside an array
const handleFieldDelete = useCallback((itemToDelete) => {
  console.log('Deleting item', { id: itemToDelete.id });
  
  setItems(currentItems => {
    // Find exact item to delete
    const itemIndex = currentItems.findIndex(item => item.id === itemToDelete.id);
    
    if (itemIndex === -1) {
      console.error('Item to delete not found:', itemToDelete.id);
      return currentItems;
    }
    
    // Create new array without the specific item
    const newItems = [
      ...currentItems.slice(0, itemIndex),
      ...currentItems.slice(itemIndex + 1)
    ];
    
    return newItems;
  });
}, [forceExpand]);
```