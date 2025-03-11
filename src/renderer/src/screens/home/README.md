# Home Screen

## Overview

The Home screen serves as the entry point to the Smelter application, providing options to initialize, clone, edit, or delete projects, as well as access to recently opened projects.

## Architecture

The Home screen follows the same context-based architecture used throughout the application:

1. **Context Provider**: `HomeContext` manages all state and operations for the home screen
2. **Component Structure**: 
   - Main `Home` component wraps everything with the context provider
   - `HomeContent` handles the main layout
   - `ActionsList` displays available actions
   - `RecentProjectsList` shows recently opened projects

## Key Features

- Asynchronous operations with loading states
- Error handling through the Error context
- Consistent navigation using React Router
- Context-based state management

## Implementation Details

### Context (HomeContext.jsx)

The `HomeContext` provides:

- State management for recent projects
- Async operations with loading states:
  - Loading recent projects
  - Opening recent projects
  - Initializing new projects
  - Deleting projects
  - Editing existing projects
  - Cloning from GitHub
  - Removing projects from recent list

### Components

- **HomeContent**: Main layout component
- **ActionsList**: Displays project action options
- **RecentProjectsList**: Displays recent projects with delete functionality

## Usage

```jsx
// Import context and hook
import { HomeProvider, useHome } from './context/HomeContext';

// Access context values and methods
const { 
  recentProjects, 
  initializeProject,
  loadingProjects 
} = useHome();

// Implement UI with loading states
<button 
  onClick={initializeProject} 
  disabled={loadingProjects}
>
  Initialize Project
</button>
```

## Best Practices

1. Use the `useHome` hook to access state and operations
2. Handle loading states in UI components
3. Let the context handle error cases through `useAsyncOperation`
4. Follow consistent naming patterns for operations