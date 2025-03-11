# Smelter Core Business Logic

This directory contains the core business logic for the Smelter application. It is organized into feature-specific modules that each handle a distinct part of the application's functionality.

## Directory Structure

```
lib/
├── drag-drop/           # Drag and drop functionality
├── form-generation/     # Form building and rendering
└── form-submission/     # Form submission and validation
```

## Features

### 📋 Form Generation

The `form-generation` directory contains components and logic for generating dynamic forms based on schema definitions.

Key components:
- **Schema Conversion**: Converts JS objects to form schemas
- **Field Components**: UI components for different field types (text, select, etc.)
- **Form Context**: State management for form data

See the [Form Generation README](./form-generation/README.md) for more details.

### 🔄 Drag and Drop

The `drag-drop` directory contains utilities and components for implementing drag and drop functionality.

Key components:
- **DragStateContext**: Context provider for drag state
- **GhostElement**: Visual feedback during drag operations
- **Utility Functions**: Helper functions for handling drag events

### 📤 Form Submission

The `form-submission` directory handles the logic for validating and submitting form data.

Key components:
- **Validation**: Form data validation
- **Pre-processing**: Transforms form data before submission
- **Object Transformation**: Converts form state to output format
- **Submit Handler**: Manages the submission process

See the [Form Submission README](./form-submission/README.md) for more details.

## Usage Guidelines

1. **Keep Features Separated**: Each feature should have its own directory with clear boundaries.
2. **Document Public APIs**: Each module should have well-documented exports.
3. **Tests**: Write tests for all business logic in the corresponding `__tests__` directory.
4. **Avoid Circular Dependencies**: Be careful about importing between features to avoid circular dependencies.

For detailed code organization standards, see the [Architecture Guide](/../dev-notes/core/architecture.md).
