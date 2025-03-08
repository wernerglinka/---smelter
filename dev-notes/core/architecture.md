# Smelter Architecture Guide

> Last updated: March 6, 2025 - Reorganized utility functions and updated documentation

This document outlines the architecture of the Smelter application, including code organization, naming conventions, and design patterns.

## Application Structure

Smelter is an Electron application with a React frontend and follows this high-level architecture:

```
smelter/
├── src/
│   ├── main/             # Electron main process
│   ├── preload/          # Electron preload scripts
│   └── renderer/         # React application (frontend)
├── dev-notes/           # Development documentation
└── __tests__/           # Test files
```

## Renderer (Frontend) Structure

The renderer is the React application that users interact with, organized as follows:

```
src/renderer/src/
├── components/          # Shared UI components
├── hooks/               # Custom React hooks
├── lib/                 # Core business logic
│   ├── drag-drop/       # Drag and drop functionality
│   ├── form-generation/ # Form building and rendering
│   ├── form-submission/ # Form submission and validation
│   └── utilities/       # Legacy utility functions (deprecated)
├── screens/             # Application screens/pages
│   ├── edit/            # Content editing screen
│   ├── home/            # Home/dashboard screen
│   └── new/             # Create new content screen
├── styles/              # Global styles
└── utils/               # Centralized utility functions
    ├── file/            # File operations
    ├── format/          # Formatting utilities 
    ├── validation/      # Validation utilities
    ├── services/        # Application services
    ├── dom/             # DOM utilities
    └── transform/       # Data transformation utilities
```

## Naming Conventions

### Files and Directories

- **React Components**: Use PascalCase for component files and directories
  - Example: `Button.jsx`, `FormField.jsx`, `EditSpace/`

- **Utilities and Non-Component Files**: Use kebab-case
  - Example: `file-loader.js`, `to-camel-case.js`

- **Index Files**: Use `index.jsx` for component exports, `index.js` for utility exports
  - Example: `components/Button/index.jsx`

### Code Style

- **Component Names**: PascalCase
  - Example: `FormField`, `EditSpace`

- **Variables and Functions**: camelCase
  - Example: `formState`, `handleSubmit()`

- **Utility function names**: camelCase with standard prefixes
  - `get*` for retrieval: `getDirectory`, `getJsonFile`
  - `is*` for boolean checks: `isExisting`, `isValidDate`
  - `create*` for creation: `createDirectory`
  - `save*` for saving: `saveJsonFile`
  - `format*` for formatting: `formatJson`
  - `select*` for selection operations: `selectFolder`

- **Constants**: UPPER_SNAKE_CASE
  - Example: `MAX_HISTORY_SIZE`, `DEFAULT_FIELD_VALUES`

- **CSS Classes**: kebab-case
  - Example: `form-container`, `edit-space`

## Component Organization

Components should follow this structure:

```
ComponentName/
├── index.jsx           # Component implementation
├── styles.css          # Component-specific styles (if needed)
├── utils.js            # Component-specific utilities (if needed)
└── README.md           # Component documentation (for complex components)
```

For screen-specific components:

```
screens/ScreenName/
├── index.jsx           # Screen component
├── styles.css          # Screen-specific styles
└── components/         # Screen-specific components
    └── ComponentName/  # Following the same structure as above
```

## State Management

Smelter uses a combination of state management approaches:

1. **Local Component State**: For UI state specific to a component
   - Use React's `useState` and `useReducer` hooks

2. **Context API**: For shared state across components
   - Use React's Context API with `useContext` hook
   - Create context providers in `lib/[feature]/context/`

3. **Services**: For external interactions (file system, storage, etc.)
   - Located in `utils/services/`

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

## Import Order

Follow this order for imports:

1. React and core libraries
   ```javascript
   import React, { useState, useEffect } from 'react';
   import { useNavigate } from 'react-router-dom';
   ```

2. Third-party dependencies
   ```javascript
   import classNames from 'classnames';
   ```

3. Local components and utilities (absolute paths preferred)
   ```javascript
   import Button from '../components/Button';
   import { formatDate } from '../utils/format/date';
   import { logger } from '../utils/services/logger';
   ```

4. Styles
   ```javascript
   import './styles.css';
   ```

## Documentation

Components and functions should be documented using JSDoc:

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