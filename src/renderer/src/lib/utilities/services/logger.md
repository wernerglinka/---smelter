# Logger Service

The Logger service provides structured, environment-aware logging for the Smelter application.

## Features

- **Environment-based Controls**: Log level automatically adjusted based on environment
- **Log Levels**: DEBUG, INFO, WARN, ERROR levels with increasing severity
- **Consistent Format**: All logs follow a consistent format with level prefixes
- **Runtime Control**: Log level can be changed at runtime

## Basic Usage

```javascript
import { logger } from '../path/to/utilities/services/logger';

// Log messages with appropriate severity
logger.debug('Detailed debugging information');  // Only in development
logger.info('Important state change');           // Significant events
logger.warn('Potential issue detected');         // Warning conditions
logger.error('Critical error occurred');         // Error conditions
```

## When to Use Each Level

- **DEBUG**: 
  - Detailed technical information
  - Variable dumps
  - Function call tracing
  - State snapshots
  - Only shown in development

- **INFO**:
  - Important state changes (e.g., "Form submitted")
  - User actions (e.g., "User selected template")
  - Initialization events (e.g., "Component mounted")
  - Shown in development, hidden in production

- **WARN**:
  - Non-critical issues that might need attention
  - Performance bottlenecks
  - Deprecated feature usage
  - Recoverable errors
  - Shown in all environments except tests

- **ERROR**:
  - Critical problems that require attention
  - Unhandled exceptions
  - API failures
  - Data corruption
  - Always shown in all environments

## Environment Controls

The logging level is automatically determined based on the `NODE_ENV` environment variable:

```javascript
this.level = process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'ERROR' : 
   process.env.NODE_ENV === 'test' ? 'WARN' : 'DEBUG');
```

- **Development**: All logs (DEBUG and above)
- **Test**: Warnings and errors only
- **Production**: Errors only

## Overriding Log Level

You can override the default log level:

1. **Environment variable**: Set `LOG_LEVEL` to DEBUG, INFO, WARN, ERROR, or NONE
2. **Runtime override**: Call `logger.setLevel('DEBUG')` to change level at runtime

## Object Logging

The logger supports logging objects and arrays:

```javascript
logger.debug('Form data:', { 
  id: 123, 
  fields: ['name', 'email'],
  valid: true
});
```

## Best Practices

1. **Be Concise**: Keep log messages brief but descriptive
2. **Use Appropriate Levels**: Match the importance of the message to the log level
3. **Include Context**: Provide enough context to understand the log
4. **Avoid Sensitive Data**: Never log passwords, tokens, or personal information
5. **Performance**: Avoid expensive operations in log messages

## Implementation

The logger is implemented as a class with methods for each log level:

```javascript
class Logger {
  constructor() {
    // Default log level based on environment
    this.level = process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === 'production' ? 'ERROR' : 
       process.env.NODE_ENV === 'test' ? 'WARN' : 'DEBUG');

    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      NONE: 4
    };
  }

  setLevel(level) { /* ... */ }
  debug(...args) { /* ... */ }
  info(...args) { /* ... */ }
  warn(...args) { /* ... */ }
  error(...args) { /* ... */ }
}
```