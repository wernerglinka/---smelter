# Utilities

This directory contains shared utility functions and services used throughout the Smelter application.

## Directory Structure

```
utilities/
├── file-ops/           # File system operations
│   ├── get-directory-files.js
│   ├── get-markdown-file.js
│   ├── get-metadata-file.js
│   └── render-json-file.js
├── formatting/         # String and data formatting
│   ├── date-formatter.js
│   ├── to-camel-case.js
│   └── to-title-case.js
├── services/           # Application services
│   ├── file-loader.js
│   ├── logger.js       # Logging utility
│   ├── project.js
│   └── storage.js
├── validation/         # Data validation
│   └── type-validators.js
├── get-folder-name.js  # Folder utilities
├── select-folder.js
└── select-project.js
```

## Services

### Logger

The `logger.js` service provides structured logging with environment-based controls.

```javascript
import { logger } from '../../../lib/utilities/services/logger';

// Use appropriate methods based on message importance
logger.debug('Detailed technical information');  // Development only
logger.info('Important state change');           // Significant events
logger.warn('Potential issue detected');         // Warning conditions
logger.error('Critical error occurred');         // Error conditions
```

Log levels are controlled by the environment:
- **Development**: All logs (DEBUG and above)
- **Test**: Warnings and errors
- **Production**: Errors only

The level can be overridden with the `LOG_LEVEL` environment variable.

### Storage

The `storage.js` service provides persistent state storage using localStorage.

```javascript
import { StorageOperations } from '../utilities/services/storage';

// Store data
StorageOperations.set('key', value);

// Retrieve data
const value = StorageOperations.get('key');

// Remove data
StorageOperations.remove('key');
```

### Project

The `project.js` service manages project metadata and configuration.

```javascript
import { ProjectOperations } from '../utilities/services/project';

// Get project data
const project = ProjectOperations.getProject();

// Set active project
ProjectOperations.setActiveProject(projectPath);
```

## File Operations

The `file-ops` directory contains utilities for reading and manipulating files:

- `get-directory-files.js`: Lists files in a directory
- `get-markdown-file.js`: Reads and parses markdown files
- `get-metadata-file.js`: Reads and parses metadata files
- `render-json-file.js`: Renders JSON files

## Formatting

The `formatting` directory contains utilities for formatting data:

- `date-formatter.js`: Formats dates
- `to-camel-case.js`: Converts strings to camelCase
- `to-title-case.js`: Converts strings to Title Case

## Validation

The `validation` directory contains utilities for validating data:

- `type-validators.js`: Type checking utilities

## Usage Guidelines

1. **Prefer Functional Style**: Utilities should be pure functions when possible
2. **Document Parameters**: Use JSDoc to document parameters and return values
3. **Error Handling**: Use consistent error handling patterns
4. **Testing**: Write tests for all utility functions
5. **Logging**: Use the logger for errors and debugging