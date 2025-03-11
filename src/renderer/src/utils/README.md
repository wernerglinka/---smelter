# Utilities

This directory contains centralized utilities for the Smelter application. It follows a domain-based organization to make it easier to find and use utilities related to specific functionality.

## Directory Structure

```
utils/               # All utilities
├── file/            # File operations
│   ├── directory.js # Directory operations
│   ├── markdown.js  # Markdown file operations
│   ├── metadata.js  # Metadata operations
│   ├── json.js      # JSON file operations
│   └── loader.js    # File loading service
├── format/          # Formatting utilities
│   ├── date.js      # Date formatting
│   ├── string.js    # String manipulation
│   └── number.js    # Number formatting
├── validation/      # Validation utilities
│   ├── types.js     # Type validation
│   └── form.js      # Form validation
├── services/        # Application services
│   ├── logger.js    # Logging service
│   ├── storage.js   # Storage service
│   └── project.js   # Project service
├── dom/             # DOM utilities
│   └── drag-drop.js # Drag and drop utilities
├── transform/       # Data transformation
│   ├── form-to-object.js # Form to object conversion
│   └── templates.js # Template utilities
└── index.js         # Central export
```

## Naming Conventions

To ensure consistency, the utilities follow these naming patterns:

### Function Names

- **Retrieval operations**: Use `get` prefix (`getDirectory`, `getMarkdownFile`)
- **Boolean checks**: Use `is` prefix (`isExisting`, `isValidDate`)
- **Creation operations**: Use `create` prefix (`createDirectory`)
- **Saving operations**: Use `save` prefix (`saveJsonFile`)
- **Extraction operations**: Use `extract` prefix (`extractFolderName`)
- **Formatting operations**: Use `format` prefix (`formatJson`, `formatDate`)
- **Selection operations**: Use `select` prefix (`selectFolder`, `selectProject`)
- **Transform operations**: Use `transform` prefix (`transformFormToObject`)

### Parameter Names

- **File path parameters**: Use `filePath` for files
- **Directory path parameters**: Use `directoryPath` for directories
- **Generic path parameters**: Use `path` only when it could be either a file or directory

### Return Values

- Asynchronous operations return a Promise
- Synchronous operations return direct values
- Boolean operations (is*) return true/false

### Error Handling

- All utility functions that can fail use try/catch blocks
- Errors are logged using the logger service
- Functions either throw errors or return error objects (not a mix)

## Usage

There are two ways to import utilities:

### 1. Specific Imports (Recommended)

Import specific utilities directly from their modules:

```javascript
// Import a specific utility
import { formatDate } from '@utils/format/date';
import { logger } from '@utils/services/logger';

// Usage
formatDate(new Date());
logger.info('This is an information message');
```

### 2. Grouped Imports

Import everything from a category:

```javascript
// Import all formatting utilities
import * as Format from '../utils/format';

// Usage
Format.formatDate(new Date());
Format.capitalize('hello');
```

### 3. Central Import (Less Efficient)

Import from the central index (may increase bundle size):

```javascript
// Import from central index
import { formatDate, logger } from '../utils';

// Usage
formatDate(new Date());
logger.info('This is an information message');
```

## Available Utilities

### File Operations

- **directory.js**: Directory listing and operations
- **markdown.js**: Markdown file parsing and operations
- **metadata.js**: Metadata extraction and manipulation
- **json.js**: JSON file operations

### Formatting

- **date.js**: Date formatting and manipulation
- **string.js**: String manipulation utilities
- **number.js**: Number formatting utilities

### Validation

- **types.js**: Type validation utilities
- **form.js**: Form validation utilities

### Services

- **logger.js**: Environment-aware logging with multiple log levels
- **storage.js**: LocalStorage operations for project data
- **project.js**: Project management operations

### DOM Utilities

- **drag-drop.js**: Drag and drop utilities

### Transform Utilities

- **form-to-object.js**: Form state to JavaScript object conversion
- **templates.js**: Template utilities

## Migration Guide

The utilities in this directory replace utilities previously located in:

- `src/renderer/src/lib/utilities/`
- `src/renderer/src/utils/`
- Various feature-specific utility files

During the transition period, compatibility layers are in place to maintain backward compatibility. However, all new code should use the new utility structure.

## Contributing

When adding new utilities:

1. Place the utility in the appropriate category
2. Add exports to the category's index.js
3. Document the utility with JSDoc comments
4. Add tests in the corresponding test directory
