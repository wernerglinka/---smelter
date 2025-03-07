# Chat Context

## Project Overview

- Project name: Metallurgy/Smelter
- Purpose: Content Management for Metalsmith
- Architecture: Electron-based application with React
- Core functionality:
  - YAML/Markdown file editing
  - Drag-and-drop form building
  - Template management

## Key Components

1. EditSpace

   - Main editing interface
   - Handles form-based editing
   - Supports drag-and-drop
   - Integrates with preview

2. DragStateContext

   - Manages global drag state
   - Tracks dropzones and insertion points
   - Handles ghost elements

3. Form System
   - Converts YAML frontmatter to form fields
   - Supports various field types
   - Uses uncontrolled components
   - Integrates with drag-and-drop

## Editor Support & Type Checking

### JSDoc Type Annotations

1. Purpose

   - Enable code predictions and autocompletion
   - Provide type checking in editors
   - Support hover documentation
   - Enable refactoring tools

2. Required Type Annotations

   ```javascript
   /**
    * @typedef {Object} FieldConfig
    * @property {string} type - Field type (text, number, date, etc)
    * @property {string} [label] - Optional field label
    * @property {any} [defaultValue] - Default value for the field
    * @property {Object} [validation] - Validation rules
    * @property {boolean} [required] - Whether field is required
    */

   /**
    * @typedef {Object} DropzoneEvent
    * @property {'sidebar'|'dropzone'} type - Event source type
    * @property {Object} data - Dragged item data
    * @property {{targetIndex: number, parentId?: string}} position - Drop position
    */
   ```

3. Function Type Documentation

   ```javascript
   /**
    * @callback DropHandler
    * @param {DropzoneEvent} event - Drop event details
    * @returns {void}
    */

   /**
    * @param {Object} props
    * @param {DropHandler} props.onDrop - Drop event handler
    * @param {React.ReactNode} props.children - Child elements
    * @param {string} [props.className] - Optional CSS classes
    */
   ```

4. Important Type Definitions to Maintain
   - Component Props
   - Event Handlers
   - Configuration Objects
   - State Structures
   - Utility Function Parameters
   - Return Types

### Editor Configuration

- VSCode settings for JSDoc support
- ESLint rules for JSDoc validation
- Prettier configuration for consistent formatting

### Type Checking Tools

- Using ESLint with `eslint-plugin-jsdoc`
- Editor-based type checking (VSCode's JavaScript type checking)
- JSDoc type validation during development

## Code Organization

- Each component in its own directory with README
- Consistent file structure:
  - index.jsx - Main component
  - types.js - Type definitions
  - utils.js - Helper functions
  - styles.css - Component styles
  - README.md - Component documentation

## Current Implementation Details

Key functions and their purposes:

- `handleDropzoneEvent`: Manages drag-drop operations
- `processFrontmatter`: Converts YAML to form fields
- `handleFormSubmission`: Processes form data to YAML

## Current Implementation

- Using React Context for drag state
- Field components are uncontrolled
- Form submission uses native FormData API
- Drag-and-drop uses custom implementation

## Current Focus

- Reviewing form handling for uncontrolled behavior
- Ensuring consistency across field components
- Maintaining drag-and-drop functionality

## Project Structure

Key directories:

- src/renderer/src/lib/drag-drop/
- src/renderer/src/lib/form-generation/
- src/renderer/src/screens/edit/

## Recent Decisions

1. Keep existing field components
2. Move to uncontrolled form behavior
3. Use native form submission

## Testing Requirements

- Unit tests for utility functions
- Component tests for field components
- Integration tests for drag-drop functionality
- E2E tests for form submission

## Open Questions/TODO

- Review remaining field components
- Verify drag-and-drop compatibility
- Consider validation strategy
