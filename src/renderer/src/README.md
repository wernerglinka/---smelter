# Smelter Renderer

This directory contains the React-based frontend application for Smelter, providing the user interface for managing Metalsmith site content.

## Directory Structure

```
src/
├── components/               # Shared UI components
├── context/                  # Application-wide state management
├── hooks/                    # Custom React hooks
├── lib/                      # Core business logic
│   ├── drag-drop/            # Drag and drop functionality
│   ├── form-generation/      # Form building and rendering
│   └── form-submission/      # Form submission and validation
├── screens/                  # Application screens/pages
│   └── edit/                 # Main editing interface
│       └── components/       # Screen-specific components
├── utils/                    # Utility functions
│   ├── file/                 # File operations
│   ├── format/               # Formatting utilities
│   ├── validation/           # Validation utilities
│   ├── services/             # Application services
│   ├── dom/                  # DOM utilities
│   └── transform/            # Data transformation
```

## Key Directories

### `components/`
Reusable UI components shared across multiple screens. Each component should:
- Have its own directory with index.jsx
- Include component-specific styles
- Provide documentation in README.md

### `context/`
Application-wide state management using React Context:
- ErrorContext for centralized error handling
- FormOperationsContext for form operations
- ProjectContext for project state
- SidebarContext for navigation state

### `lib/`
Core business logic organized by feature:
- Form generation system
- Drag and drop functionality
- Form submission handling
- Data transformation logic

### `screens/`
Top-level application views:
- Each screen has its own directory
- Screen-specific components are nested within
- Includes documentation for complex features

### `utils/`
Domain-based utility functions:
- File operations (read/write/parse)
- Formatting helpers
- Validation functions
- Application services
- DOM utilities
- Data transformation

## Coding Standards

1. **Components**
   - Use functional components with hooks
   - Include JSDoc documentation
   - Follow established naming conventions
   - Maintain component-specific README files

2. **State Management**
   - Use contexts for shared state
   - Implement custom hooks for component logic
   - Follow uncontrolled form patterns
   - Handle errors through ErrorContext

3. **File Organization**
   - Group related functionality
   - Maintain clear separation of concerns
   - Include relevant documentation
   - Follow established naming conventions

## Getting Started

1. **Development**
   ```bash
   npm run dev
   ```

2. **Testing**
   ```bash
   npm test
   ```

3. **Building**
   ```bash
   npm run build
   ```

## Documentation

- Each major component includes its own README
- JSDoc comments required for functions
- Maintain up-to-date documentation
- Follow established documentation patterns

For detailed information about specific components or modules, refer to their respective README files.
