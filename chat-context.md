# Chat Context

## Project Overview

- Project name: Metallurgy/Smelter
- Purpose: Content Management for Metalsmith
- Architecture: Electron-based application with React
- Core functionality:
  - YAML/Markdown file editing
  - Drag-and-drop form building
  - Template management

## Architecture & State Management (as of March, 2025)

We've completed Phase 1, 2 & 3 of standardizing state management across the application, plus additional performance optimizations and component refactoring.

### Completed Work

1. **Context Architecture (Phase 1)** ✅
   - Created `/src/renderer/src/context/` directory
   - Implemented ErrorContext for centralized error handling
   - Created FormOperationsContext for form operations
   - Added ProjectContext and SidebarContext for global state
   - Maintained existing DragStateContext
   - Added AppProviders component for all contexts

2. **Component Refactoring (Phase 2)** ✅
   - Refactored all field components to use the context system:
     - ArrayField, ObjectField, TextField, TextArea, SelectField, NumberField, DateField, CheckboxField, UrlField, ListField
   - Added loading states and error handling for async operations
   - Standardized operations through context
   - Enhanced visual feedback with error and loading indicators
   - Updated tests to work with context providers

3. **Form Flow Improvement (Phase 3)** ✅
   - Created ValidationContext for centralized validation
   - Implemented FormField wrapper for standardized error display
   - Added ValidationFeedback component for consistent error styling
   - Created FormErrorSummary for form-level error reporting
   - Added useFormValidation hook for streamlined form validation
   - Documented validation system in VALIDATION.md

4. **Performance Optimizations & Bug Fixes** ✅
   - Fixed infinite update loops in ListField component
   - Added safeguards against validation of non-existent fields
   - Improved FieldHandlers to prevent cascading updates
   - Added value comparison to skip unnecessary re-renders
   - Added debouncing for field update handlers
   - Enhanced error handling in validation contexts
   - Optimized console logging for production environments

5. **Complex Component Refactoring (Phase 4)** ✅
   - Refactored EditSpace component to use Context API
   - Split EditSpace into smaller, focused components
   - Created EditContext, HistoryContext, and SnapshotContext
   - Improved drag-and-drop visual feedback with GhostElement
   - Fixed issues with setState during render in ObjectField
   - Improved test coverage for context components

### Important Files

- `/src/renderer/src/context/` - All context providers
- `/src/renderer/src/context/index.jsx` - Exports and AppProviders
- `/src/renderer/src/context/ValidationContext.jsx` - Validation system
- `/src/renderer/src/context/FormOperationsContext.jsx` - Form operations
- `/src/renderer/src/screens/edit/context/EditContext.jsx` - Edit form state
- `/src/renderer/src/screens/edit/context/HistoryContext.jsx` - Undo/redo functionality
- `/src/renderer/src/screens/edit/context/SnapshotContext.jsx` - Form snapshots
- `/src/renderer/src/hooks/useAsyncOperation.js` - Standardized async state
- `/src/renderer/src/hooks/useFormSubmission.js` - Form submission with context
- `/src/renderer/src/hooks/useFormValidation.js` - Form validation handling
- `/src/renderer/src/screens/edit/hooks/useEditorSetup.js` - Editor initialization
- `/src/renderer/src/screens/edit/hooks/useContentProcessor.js` - File content processing
- `/src/renderer/src/lib/drag-drop/GhostElement.jsx` - Drag and drop visual feedback
- `/src/renderer/src/components/FormField/` - Standardized form field wrapper
- `/src/renderer/src/components/ValidationFeedback/` - Error display component
- `/src/renderer/src/components/FormErrorSummary/` - Form-level error summary
- `/src/renderer/src/context/VALIDATION.md` - Validation system documentation
- `/src/renderer/src/context/PERFORMANCE.md` - Performance optimization documentation

### Next Steps

1. **Documentation & Testing (Phase 5)**
   - Update and expand documentation with new context patterns
   - Add examples showing usage of context hooks
   - Document EditSpace architecture and component relationships
   - Create testing guide for context-based components
   
2. **Performance Optimization (Phase 6)**
   - Further profile and optimize context re-renders
   - Implement React.memo for pure components
   - Use useCallback consistently for handlers passed to children
   - Add React.useMemo for expensive calculations
   - Evaluate lazy loading for components that aren't immediately needed

## Utility Reorganization (Completed)

Previously implemented a utility reorganization and standardization to create a more organized, maintainable utility structure with consistent naming conventions.

1. **Directory Structure**
   - `/src/renderer/src/utils/` with domains: file, format, validation, services, dom, transform
   
2. **Naming Conventions**
   - Standardized function naming with clear prefixes (get*, is*, format*, etc.)
   - All tests are passing with the new structure

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
