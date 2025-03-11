# Smelter

> **Note:** This project is under heavy development and APIs are subject to change.

## Overview

Smelter is a specialized content management system designed specifically for Metalsmith static site projects. It provides a visual interface for editing Markdown files with YAML frontmatter, making content management more accessible for non-technical users.

The application is built with [Electron, Vite and React](https://github.com/alex8088/electron-vite), offering a desktop experience for managing Metalsmith site content.

[Project Screenshot Placeholder]

## Key Features

- **Visual YAML/Markdown Editor:** Transform complex YAML frontmatter into intuitive forms
- **Drag-and-Drop Interface:** Easily build and modify content structures
- **Template Management:** Create and apply content templates
- **Project-Aware:** Understands Metalsmith project structure
- **Preview Integration:** See changes in real-time

## Current Development Status

This project is in active development with frequent changes to core APIs and components. Key areas of current focus:

- Stabilizing the drag-and-drop form system
- Improving the markdown editor integration
- Refining the project configuration system
- Enhancing template management

## Getting Started

### Prerequisites

- Node.js 16+
- npm 7+
- A Metalsmith project (for testing). Download a sample project from [here](https://github.com/wernerglinka/metalsmith-first).

### Installation

```bash
# Clone the repository
git clone https://github.com/wernerglinka/---smelter.git
cd smelter

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

### Building

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

## Project Structure

```
metallurgy/
├── src/                    # Source code
│   ├── main/               # Electron main process
│   └── renderer/           # React application
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── lib/        # Business logic modules
│       │   ├── utils/      # Utility functions
│       │   │   ├── file/   # File operations
│       │   │   ├── format/ # Formatting utilities
│       │   │   ├── services/ # Application services
│       │   │   └── ...     # Other utility categories
│       │   ├── screens/    # Application screens
│       │   └── hooks/      # Custom React hooks
├── dev-notes/              # Development documentation
```

## Documentation

This project uses JSDoc for code documentation. All code should be documented following these guidelines:

### Components

- Must have a component description
- Must document all props using TypeDefs
- Must specify return type
- Must document any significant state or effects

### Functions

- Must have a description
- Must document all parameters
- Must document return type
- Must document thrown errors if any

### Example

```javascript
/**
 * @typedef {Object} UserProps
 * @property {string} name - The user's name
 * @property {number} age - The user's age
 */

/**
 * Displays user information
 * @param {UserProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
```

### Generating Documentation

Run `npm run docs` to generate documentation in the `docs` directory.

## For Developers

### Required Project Structure

For Smelter to work with a Metalsmith site, the site must have:

- A `.metallurgy` folder in the project root
- A `projectData.json` file in the `.metallurgy` folder
- Properly configured content and data paths

See the Project Structure documentation for details.

### Development Notes

Extensive development documentation is available in the `dev-notes` directory, covering:

- Core concepts and architecture
- User flows
- Technical implementation details
- Component documentation
- Migration and refactoring plans

## Utilities

Smelter organizes utilities by domain for better maintainability:

```javascript
// File operations
import { readDirectory, getMarkdownFile, readJsonFile } from '@utils/file';

// Formatting utilities
import { formatDate, toCamelCase, toTitleCase } from '@utils/format';

// Validation utilities
import { isString, isNumber, required, isValidEmail } from '@utils/validation';

// Services
import { logger, StorageOperations } from '@utils/services';
```

### Logging System

Smelter uses a structured logging system with environment-based controls:

#### Log Levels

- **DEBUG**: Detailed debugging information (development only)
- **INFO**: Important events and state changes
- **WARN**: Non-critical issues that might need attention
- **ERROR**: Critical problems that require immediate attention

#### Usage

```javascript
import { logger } from 'utils/services/logger';

// Use the appropriate level based on importance
logger.debug('Detailed technical information'); // Development only
logger.info('Important state change occurred');  // Important events
logger.warn('Something unusual happened');      // Non-critical issues
logger.error('Critical error occurred');        // Critical problems
```

#### Environment Controls

The logging level is automatically set based on the environment:

- **Development**: Shows all logs (DEBUG and above)
- **Test**: Silent by default, shows only requested logs
- **Production**: Shows only ERROR logs

You can control logging with npm scripts:

```bash
# Normal development (shows all logs)
npm run dev

# Development with explicit DEBUG level
npm run dev:debug

# Testing with logs shown
npm run test:debug

# Production (ERROR logs only)
npm run build
```

You can find more details about the logging configuration in the `CLAUDE.md` file.

## Contributing

As this project is under heavy development, please reach out before making significant contributions. For minor improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add or update tests
5. Update documentation
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Metalsmith](https://metalsmith.io/) - The static site generator this tool is designed for
- [Electron](https://www.electronjs.org/) - For enabling the desktop application
- [React](https://reactjs.org/) - For the UI framework
- [EasyMDE](https://github.com/Ionaru/easy-markdown-editor) - For markdown editing capabilities
