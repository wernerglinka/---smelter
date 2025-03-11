# Smelter Architecture Guide

> Last updated: March 11, 2025 - Consolidated architecture documentation

## Overview

Smelter is an Electron-based application with React that provides content management for Metalsmith. The application enables YAML/Markdown file editing, drag-and-drop form building, and template management.

## Code Organization

### Directory Structure

```
src/
├── main/             # Electron main process
│   └── lib/          # Main process utilities
├── preload/          # Electron preload scripts
└── renderer/         # React application (renderer process)
    ├── components/   # Shared UI components
    ├── context/      # React context providers
    ├── hooks/        # Custom React hooks
    ├── lib/          # Domain-specific logic
    │   ├── drag-drop/     # Drag and drop functionality
    │   ├── form-generation/ # Form generation from schemas
    │   └── form-submission/ # Form submission handling
    ├── screens/      # Application screens/pages
    │   ├── edit/     # Edit screen components
    │   ├── home/     # Home screen components
    │   └── new/      # New project screen components
    ├── styles/       # Global styles
    └── utils/        # Utility functions by domain
        ├── dom/      # DOM manipulation utilities
        ├── file/     # File operation utilities
        ├── format/   # Formatting utilities
        ├── services/ # Service utilities (logging, storage)
        ├── transform/ # Data transformation utilities
        └── validation/ # Validation utilities
```

### Feature-based Organization

- Code is organized by feature first, then by technical role
- Each feature has its own directory with components, hooks, and utilities
- Shared code is lifted to the appropriate level (components, utils, lib)

## Component Structure Guidelines

### Component Directory Structure

Each component should follow this structure:

```
ComponentName/
├── index.jsx        # Main component
├── styles.css       # Component-specific styles
├── utils.js         # Component-specific utilities (if needed)
├── README.md        # Component documentation
└── components/      # Sub-components (if applicable)
    └── ...
```

For screen-specific components:

```
screens/ScreenName/
├── index.jsx           # Screen component
├── styles.css          # Screen-specific styles
└── components/         # Screen-specific components
    └── ComponentName/  # Following the same structure as above
```

### Component Patterns

1. **Functional Components with Hooks**
   - Use React functional components with hooks
   - Avoid class components

   ```jsx
   const ComponentName = ({ prop1, prop2 }) => {
     const [state, setState] = useState(initialState);
     
     // Component logic
     
     return (
       <div className="component-name">
         {/* JSX */}
       </div>
     );
   };
   ```

2. **Component Exports**
   - Export components as named exports from index.jsx
   - Use default exports only for the main component in a directory

3. **Props Documentation**
   - Document props with JSDoc comments

   ```jsx
   /**
    * Component description
    * 
    * @param {Object} props
    * @param {string} props.prop1 - Description of prop1
    * @param {number} props.prop2 - Description of prop2
    * @returns {React.ReactElement}
    */
   const ComponentName = ({ prop1, prop2 }) => {
     // Component implementation
   };
   ```

## State Management Patterns

Smelter uses a combination of state management approaches:

1. **Local Component State**: For UI state specific to a component
   - Use React's `useState` and `useReducer` hooks

2. **Context API**: For shared state across components
   - Use React's Context API with `useContext` hook
   - Create context providers in `context/` and in feature-specific `lib/[feature]/context/`

3. **Services**: For external interactions (file system, storage, etc.)
   - Located in `utils/services/`

### Context Structure

Context providers are organized in a hierarchical structure:

1. **Application-level Context**
   - `ErrorContext` - Global error handling
   - `ProjectContext` - Project-wide state
   - `SidebarContext` - Sidebar visibility state

2. **Feature-specific Context**
   - `FormOperationsContext` - Form operations
   - `ValidationContext` - Form validation
   - `DragStateContext` - Drag and drop state

3. **Screen-specific Context**
   - `EditContext` - Edit screen state
   - `HistoryContext` - Undo/redo functionality
   - `SnapshotContext` - Form snapshots

### Context Implementation

Create context files following this pattern:

```jsx
// Step 1: Create context
const ExampleContext = createContext();

// Step 2: Create provider component
export const ExampleProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Context methods
  const contextMethod = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // Context value
  const value = useMemo(() => ({
    state,
    contextMethod
  }), [state, contextMethod]);
  
  return (
    <ExampleContext.Provider value={value}>
      {children}
    </ExampleContext.Provider>
  );
};

// Step 3: Create custom hook
export const useExample = () => {
  const context = useContext(ExampleContext);
  if (context === undefined) {
    throw new Error('useExample must be used within an ExampleProvider');
  }
  return context;
};
```

### State Management Principles

1. **Context Location**
   - Place context providers at the appropriate level in the component tree
   - Use the AppProviders component for application-wide contexts

2. **Performance Optimization**
   - Use `useMemo` for context values
   - Use `useCallback` for context methods
   - Implement selective re-rendering with memoization

3. **Error Handling**
   - Include error handling in context hooks
   - Provide useful error messages for misuse

## File Naming Conventions

1. **Component Files**
   - Use PascalCase for component files: `ComponentName.jsx`
   - Component directories should match component names: `ComponentName/`
   - Index files for components: `index.jsx`

2. **Utility Files**
   - Use kebab-case for utility files: `utility-name.js`
   - Group utilities by domain in separate directories

3. **Context Files**
   - Use PascalCase for context files: `ContextName.jsx`
   - Include "Context" in the name: `ValidationContext.jsx`

4. **Hook Files**
   - Use camelCase with "use" prefix: `useHookName.js`
   - Export hooks as named exports

## Import Ordering

Follow this ordering pattern for imports:

```jsx
// 1. React and core libraries
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// 2. Third-party dependencies
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';

// 3. Local components (absolute paths preferred)
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';

// 4. Local hooks, contexts, utilities
import { useFormValidation } from '../../hooks/useFormValidation';
import { useFormOperations } from '../../context/FormOperationsContext';
import { formatDate } from '../../utils/format/date';

// 5. Styles
import './styles.css';
```

## Coding Patterns

### Function Naming Conventions

For consistent utility function naming, use:
- `get*` for retrieval: `getDirectory`, `getJsonFile`
- `is*` for boolean checks: `isExisting`, `isValidDate`
- `create*` for creation: `createDirectory`
- `save*` for saving: `saveJsonFile`
- `format*` for formatting: `formatJson`
- `select*` for selection operations: `selectFolder`
- `handle*` for event handlers: `handleClick`, `handleChange`

### Constants Naming

- Use UPPER_SNAKE_CASE for constants
- Example: `MAX_HISTORY_SIZE`, `DEFAULT_FIELD_VALUES`

### CSS Classes

- Use kebab-case for CSS class names
- Example: `form-container`, `edit-space`

### Error Handling

Use try/catch blocks with clear error messages and proper logging:

```javascript
try {
  // Operation that might fail
} catch (error) {
  logger.error('Failed to perform operation:', error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

## Logging

Smelter uses a structured logging system with environment-based controls:

- **File Location**:
  - Main process: `src/main/lib/logger.js`
  - Renderer process: `src/renderer/src/utils/services/logger.js`

- **Usage**:
  ```javascript
  import { logger } from '../utils/services/logger';

  logger.debug('Detailed debugging information');
  logger.info('Important state change occurred');
  logger.warn('Non-critical issue happened');
  logger.error('Critical error occurred');
  ```

- **Log Levels**:
  - DEBUG: Detailed debugging (development only)
  - INFO: Important events and state changes
  - WARN: Non-critical issues
  - ERROR: Critical problems

Each level also shows higher severity logs (e.g., DEBUG shows all logs, ERROR shows only errors).

### Async Operations

Use the `useAsyncOperation` hook for standardized async state handling:

```javascript
const { loading, error, execute } = useAsyncOperation(async () => {
  // Async operation
});
```

## Documentation Standards

1. **Component Documentation**
   - Create README.md files for significant components
   - Document props, state, and key methods
   - Include usage examples

2. **Code Comments**
   - Use JSDoc comments for functions and components
   - Comment complex logic and business rules
   - Keep comments up-to-date with code changes

3. **Type Definitions**
   - Document types with JSDoc
   - Include comprehensive type information for props and parameters

   ```javascript
   /**
    * Component that displays user information
    *
    * @param {Object} props - Component props
    * @param {string} props.name - User's name
    * @param {number} props.age - User's age
    * @returns {JSX.Element} Rendered component
    */
   function UserInfo({ name, age }) {
     // Implementation
   }
   ```

## Testing

Tests are organized in the `__tests__` directory, mirroring the source structure:

```
__tests__/
├── lib/
│   ├── form-generation/
│   ├── form-submission/
│   └── utilities/
└── setup.js            # Test setup and configuration
```

Tests should follow these conventions:
- Use descriptive test names that explain the behavior being tested
- Group related tests using `describe` blocks
- Test component rendering, interactions, and edge cases

## Performance Considerations

1. **Render Optimization**
   - Use React.memo for pure components
   - Implement useCallback for handlers passed to children
   - Use useMemo for expensive calculations

2. **State Updates**
   - Batch related state updates
   - Avoid unnecessary re-renders
   - Implement debouncing for frequent updates

3. **Context Usage**
   - Split contexts into smaller, focused providers
   - Use selectors to prevent unnecessary re-renders
   - Provide only what's needed to consumers