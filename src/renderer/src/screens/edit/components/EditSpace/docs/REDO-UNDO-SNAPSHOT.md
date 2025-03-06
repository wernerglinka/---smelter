# Undo/Redo and Snapshot System Documentation

This document explains the undo/redo and snapshot functionality implemented in the EditSpace component of the Smelter form editor.

## Architecture Overview

The history and snapshot system is organized into two main modules:

1. `/history/historyHandlers.js` - Core undo/redo functionality
2. `/history/snapshotHandlers.js` - Snapshot creation and restoration

These modules work together to provide a robust history system for all form operations.

## How the History System Works

### Core Concepts

- **History Stack**: A sequential array of serialized form states (JSON strings)
- **History Position**: A pointer to the current position in the history stack
- **Redo Level**: Visual indicator showing the current history position
- **Form State**: The complete state of all form fields, serialized to JSON

### Key Components

#### History Management

- `addToHistory`: Adds the current form state to the history stack
- `addHistoryEntry`: Similar to `addToHistory` but with different position management
- `handleFormReset`: Complex function that restores form fields from a saved state
- `handleUndo`: Decrements history position and restores previous state
- `handleRedo`: Increments history position and applies newer state

#### DOM Manipulation

The `handleFormReset` function is critical for correctly restoring form state:

1. First updates React state with the restored data
2. Then uses DOM manipulation to ensure all form inputs reflect the new state
3. Uses complex selector patterns to find and update nested fields
4. Handles different input types (text, checkbox, select, etc.) appropriately

### History Flow

1. User makes a change to a form field
2. Change is added to history stack via `addHistoryEntry`
3. History position is updated 
4. When undoing, system moves back in history and restores that state
5. When redoing, system moves forward in history and restores that state

## Snapshot System

Snapshots provide named points in the editing history that users can return to at any time.

### Features

- Create named snapshots with timestamps
- Store snapshots separately from the undo/redo history
- Restore to any snapshot regardless of current position in history
- Visual feedback when snapshots are created or restored

### Implementation

- Snapshots are stored as an array of objects with:
  - `name`: Human-readable name (with timestamp)
  - `state`: Serialized form state (JSON string)
  - `timestamp`: ISO timestamp for sorting

- UI Components:
  - Camera icon button for creating snapshots
  - Hover-activated dropdown to view and select snapshots
  - Visual feedback messages when creating or restoring snapshots

### How Snapshots Work with History

- Creating a snapshot doesn't affect the history stack
- Restoring a snapshot:
  1. Applies the snapshot state via `handleFormReset`
  2. Adds the restoration action to the history stack
  3. Updates history position
  4. This allows you to undo a snapshot restoration

## UI Integration

The UI provides visual indicators and controls:

- Undo/redo buttons that enable/disable based on history availability
- Numeric indicator showing position in history
- Snapshot button for creating snapshots
- Hover dropdown for viewing and restoring snapshots
- Visual feedback messages for user actions

## Edge Cases Handled

1. **History Truncation**: When undoing and then making a new change, the system properly truncates the "future" history
2. **Maximum History**: Limits history to a maximum number of entries (default: 10) to prevent memory issues
3. **Form Reset**: Properly handles complex form fields including nested objects and arrays
4. **DOM Manipulation**: Ensures all form inputs reflect the correct state after undo/redo
5. **Empty Content**: Prevents empty 'contents' fields from being added to forms
6. **Duplicates Protection**: Prevents duplication or deletion of special fields like markdown 'contents'

## Technical Implementation Notes

### State Serialization

All form states are serialized to JSON strings before being added to history:
```javascript
const snapshot = JSON.stringify(formState);
```

And deserialized when applying:
```javascript
const restoredState = JSON.parse(history[historyPosition]);
```

### DOM Updates

The DOM update logic uses a sophisticated approach:
1. First updates React state
2. Gives React time to update the DOM (using setTimeout)
3. Then finds all form elements that need updating
4. Applies updates directly to DOM elements

This ensures both the React state and actual DOM elements are in sync.

### Error Handling

All history and snapshot operations are wrapped in try/catch blocks to prevent crashes if:
- JSON parsing fails
- DOM elements can't be found
- State restoration encounters problems

## Future Improvements

1. **Auto-snapshots**: Automated snapshots at regular intervals or significant changes
2. **Named snapshots**: Allow users to provide custom names for snapshots
3. **Snapshot organization**: Group snapshots by file or session
4. **Visual history**: Provide a visual timeline of changes
5. **Selective undo**: Allow undoing specific changes while keeping others