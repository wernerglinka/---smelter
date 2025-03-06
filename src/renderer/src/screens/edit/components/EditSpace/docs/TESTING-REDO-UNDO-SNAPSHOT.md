# Testing the Undo/Redo and Snapshot Features

This document provides a comprehensive testing strategy for the undo/redo and snapshot functionality in the form editor.

## Testing Environment Setup

1. Launch the application in development mode
2. Open a content file with frontmatter that has various field types:
   - Text fields
   - Select dropdowns
   - Checkboxes
   - Text areas
   - Nested objects
   - Arrays/lists
3. Ensure the editor pane is visible and form fields are rendered

## Basic Undo/Redo Testing

### Test Case 1: Simple Text Field Changes

1. Locate a simple text field
2. Change its value (e.g., from "Hello" to "Hello World")
3. Verify the redo level indicator increments
4. Click the undo button
5. Verify the field returns to its original value
6. Verify the redo button is now enabled
7. Click the redo button
8. Verify the field returns to "Hello World"

### Test Case 2: Multiple Sequential Changes

1. Make 3-4 different changes to various fields
2. Click undo multiple times
3. Verify each change is undone in reverse order
4. Click redo multiple times
5. Verify each change is reapplied in the original order

### Test Case 3: Breaking the Redo Chain

1. Make 3 changes to different fields
2. Undo twice
3. Make a new change to any field
4. Verify the redo button is disabled
5. Verify the original 3rd change cannot be redone

### Test Case 4: History Limit

1. Make more than 10 changes (the MAX_HISTORY limit)
2. Try to undo all the way back
3. Verify you can only undo the most recent 10 changes

## Complex Field Testing

### Test Case 5: Nested Fields

1. Locate an object field with nested properties
2. Change a value in a nested field
3. Undo the change
4. Verify the nested field returns to its original value

### Test Case 6: Array/List Fields

1. Add a new item to an array/list field
2. Undo the addition
3. Verify the item is removed
4. Redo the addition
5. Verify the item is restored

### Test Case 7: Checkbox Fields

1. Toggle a checkbox field
2. Undo the toggle
3. Verify the checkbox returns to its original state
4. Redo the toggle
5. Verify the checkbox toggles again

## Snapshot Testing

### Test Case 8: Creating Snapshots

1. Make several changes to form fields
2. Click the snapshot button
3. Verify a notification appears confirming snapshot creation
4. Make more changes
5. Hover over the snapshot button
6. Verify the snapshot dropdown appears
7. Verify the created snapshot is in the list

### Test Case 9: Restoring Snapshots

1. Create at least two snapshots at different states
2. Make additional changes after the snapshots
3. Hover over the snapshot button
4. Click on the first snapshot in the list
5. Verify all form fields return to the state they were in when the snapshot was created
6. Verify a notification appears confirming restoration
7. Verify you can still undo the snapshot restoration
8. Hover and select the second snapshot
9. Verify the form updates to the second snapshot's state

### Test Case 10: Snapshot and History Interaction

1. Create a snapshot
2. Make 2-3 changes
3. Undo all changes
4. Verify the form returns to the snapshot state
5. Create another snapshot
6. Redo the changes
7. Click on the first snapshot
8. Verify the form returns to the first snapshot state

## Edge Case Testing

### Test Case 11: Form Submission

1. Make several changes and create a snapshot
2. Submit the form
3. Verify the history is reset
4. Verify snapshots are preserved
5. Make new changes
6. Verify undo/redo works for the new changes

### Test Case 12: Special Fields

1. Try to duplicate a content field (markdown content)
2. Verify it shows an error and prevents duplication
3. Try to delete a content field
4. Verify it shows an error and prevents deletion

### Test Case 13: Empty Form

1. Clear the form completely
2. Verify undo restores the cleared fields
3. Create a snapshot of the empty form
4. Add some fields
5. Restore the empty snapshot
6. Verify the form is cleared

## Performance Testing

### Test Case 14: Large Form Handling

1. Open a form with many fields (20+)
2. Make several changes
3. Verify undo/redo operations complete within reasonable time
4. Create and restore snapshots
5. Verify performance remains acceptable

### Test Case 15: Rapid Operations

1. Make quick successive changes
2. Rapidly click undo multiple times
3. Verify the system correctly tracks and applies all operations

## Visual and Accessibility Testing

### Test Case 16: UI State

1. Verify undo button is disabled when no history is available
2. Verify redo button is disabled when at the newest state
3. Verify the history level indicator shows the correct position
4. Verify snapshot button tooltip and functionality is clear

### Test Case 17: Keyboard Shortcuts (if implemented)

1. Test Ctrl+Z for undo
2. Test Ctrl+Y or Ctrl+Shift+Z for redo
3. Verify keyboard interactions work correctly

## Regression Testing

### Test Case 18: Form after Multiple Undo/Redo Cycles

1. Perform several cycles of changes, undo, redo
2. Submit the form
3. Verify the final form data is correct
4. Reload and check that saved data persists correctly

### Test Case 19: Integration with Other Features

1. Test interaction with drag-and-drop field reordering
2. Test interaction with field deletion and duplication
3. Verify history tracks these operations correctly

## Bug Verification

### Test Case 20: Specific Bug Scenarios

1. Test the resolved "duplicate contents field" bug:
   - Load an empty page
   - Verify no contents field is automatically added
   - Add a contents field via template
   - Verify only one contents field can exist

2. Test the fixed "snapshot restoration" bug:
   - Create snapshot
   - Make changes
   - Restore snapshot
   - Verify form state is fully restored
   - Verify no additional snapshots are created during restoration

## Automated Testing Suggestions

While manual testing is essential for UI interactions, consider implementing:

1. Unit tests for the core history/snapshot logic functions
2. Integration tests for form state persistence
3. End-to-end tests for critical user journeys

## Notes on Test Results

When documenting test results, include:
1. Browser/environment details
2. Steps to reproduce any issues
3. Expected vs. actual behavior
4. Screenshots of problematic states
5. Console errors or warnings