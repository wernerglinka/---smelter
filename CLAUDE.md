# Smelter Project Guide

## Build & Development

- Build: `npm run build`
- Start development: `npm run dev`
- Format code: `npm run format` (uses Prettier)
- Lint code: `npm run lint`
- Install dependencies: `npm install --legacy-peer-deps` (required due to Vite version conflicts)

## Testing

- Run all tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage report: `npm run test:coverage`
- Run single test: `npm test -- -t "test name"` or `npm test -- path/to/test.test.jsx`

## Code Style

- React functional components with hooks
- JSX for UI components
- JSDoc comments required for functions
- Use camelCase for variables and functions, PascalCase for components
- Files organized by feature in `/src/lib` directories
- Error handling with try/catch blocks and clear error messages

## Logging

- Use the logger utility instead of console.log/error
- Import: `import { logger } from '../path/to/utilities/services/logger'` (renderer) or `import { logger } from './lib/logger.js'` (main)
- Methods: `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`
- Log levels based on environment (DEBUG in dev, ERROR in production)
- Change log level with environment variables:
  - Default development: `npm run dev` (shows all logs)
  - With specific level: `npm run dev:debug` (forces DEBUG level)
  - In tests: `npm test` (silent) or `npm run test:debug` (shows logs)

### Log Levels

The logger uses these levels with increasing severity:
1. **DEBUG**: Detailed information for debugging (development only)
2. **INFO**: Important events and state changes
3. **WARN**: Non-critical issues that need attention
4. **ERROR**: Critical problems (always visible in all environments)

Each level also shows higher severity logs (e.g., DEBUG shows all logs, ERROR shows only errors).

## Formatting (.prettierrc.yaml)

- Single quotes (`singleQuote: true`)
- Semicolons required (`semi: true`)
- Max line length 100 chars (`printWidth: 100`)
- No trailing commas (`trailingComma: none`)
- Spaces inside curly braces (`bracketSpacing: true`)

## Import Order

1. React and core libraries
2. Third-party dependencies
3. Local components/utilities (absolute paths preferred)
4. Styles/CSS imports
